using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.Constants;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
using SubGuard.Core.Helpers;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using System.Text.Json;

namespace SubGuard.Service.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IGenericRepository<UserSubscription> _subRepo;
        // TODO: Teknik borç — AppDbContext doğrudan enjekte ediliyor.
        // SubscriptionShare, NotificationQueue, RefreshToken için IGenericRepository<T> kullanılmalı.
        private readonly AppDbContext _db;
        private readonly ILogger<UserProfileService> _logger;
        private readonly IRevokedUserStore _revokedUserStore;
        private readonly ICurrencyService _currencyService;

        public UserProfileService(
            UserManager<AppUser> userManager,
            IGenericRepository<UserSubscription> subRepo,
            AppDbContext db,
            ILogger<UserProfileService> logger,
            IRevokedUserStore revokedUserStore,
            ICurrencyService currencyService)
        {
            _userManager = userManager;
            _subRepo = subRepo;
            _db = db;
            _logger = logger;
            _revokedUserStore = revokedUserStore;
            _currencyService = currencyService;
        }

        public async Task<CustomResponseDto<UserProfileDto>> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<UserProfileDto>.Fail(404, "Kullanıcı bulunamadı.");

            var subCount = await _subRepo.Where(x => x.UserId == userId).CountAsync();

            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");

            return CustomResponseDto<UserProfileDto>.Success(200, new UserProfileDto
            {
                Email = user.Email,
                FullName = user.FullName,
                TotalSubscriptions = subCount,
                MonthlyBudget = user.MonthlyBudget,
                MonthlyBudgetCurrency = user.MonthlyBudgetCurrency,
                BudgetAlertThreshold = user.BudgetAlertThreshold,
                BudgetAlertEnabled   = user.BudgetAlertEnabled,
                SharedAlertEnabled   = user.SharedAlertEnabled,
                IsAdmin = isAdmin
            });
        }

        public async Task<CustomResponseDto<bool>> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            if (!string.IsNullOrEmpty(dto.FullName))
                user.FullName = dto.FullName;

            if (dto.MonthlyBudget.HasValue || dto.MonthlyBudgetCurrency != null)
            {
                await ApplyBudgetSettingsAsync(user, dto.MonthlyBudget, dto.MonthlyBudgetCurrency);
            }

            if (dto.BudgetAlertThreshold.HasValue && dto.BudgetAlertThreshold.Value >= 0 && dto.BudgetAlertThreshold.Value <= 100)
                user.BudgetAlertThreshold = dto.BudgetAlertThreshold.Value;

            await _userManager.UpdateAsync(user);
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<BudgetSettingsDto>> UpdateBudgetAsync(string userId, BudgetSettingsDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<BudgetSettingsDto>.Fail(404, "Kullanıcı bulunamadı.");

            await ApplyBudgetSettingsAsync(user, dto.MonthlyBudget, dto.MonthlyBudgetCurrency);

            return CustomResponseDto<BudgetSettingsDto>.Success(200, new BudgetSettingsDto
            {
                MonthlyBudget = user.MonthlyBudget,
                MonthlyBudgetCurrency = user.MonthlyBudgetCurrency ?? AppConstants.Currency.DefaultCode,
            });
        }

        private async Task ApplyBudgetSettingsAsync(AppUser user, decimal? requestedBudget, string? requestedCurrency)
        {
            var targetCurrency = AppConstants.Currency.NormalizeOrDefault(requestedCurrency ?? user.MonthlyBudgetCurrency);
            var currentCurrency = AppConstants.Currency.NormalizeOrDefault(user.MonthlyBudgetCurrency);
            var currentBudget = user.MonthlyBudget;

            decimal newBudget = requestedBudget ?? currentBudget;
            var currencyChanged = currentCurrency != targetCurrency;
            var explicitBudgetChange = requestedBudget.HasValue && requestedBudget.Value != currentBudget;

            await using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                if (currencyChanged)
                {
                    var rates = await _currencyService.GetRatesAsync();

                    if (!explicitBudgetChange && currentBudget > 0)
                    {
                        newBudget = BillingPriceHelper.ConvertToTargetCurrency(
                            currentBudget,
                            currentCurrency,
                            targetCurrency,
                            rates);
                    }

                    var categoryBudgets = await _db.CategoryBudgets
                        .IgnoreQueryFilters()
                        .Where(b => b.UserId == user.Id && !b.IsDeleted)
                        .ToListAsync();

                    foreach (var categoryBudget in categoryBudgets)
                    {
                        var sourceCurrency = AppConstants.Currency.NormalizeOrDefault(categoryBudget.Currency);
                        categoryBudget.MonthlyLimit = BillingPriceHelper.ConvertToTargetCurrency(
                            categoryBudget.MonthlyLimit,
                            sourceCurrency,
                            targetCurrency,
                            rates);
                        categoryBudget.Currency = targetCurrency;
                    }
                }

                user.MonthlyBudget = newBudget;
                user.MonthlyBudgetCurrency = targetCurrency;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                await _db.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<CustomResponseDto<bool>> ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                _logger.LogWarning("Şifre değiştirme başarısız. UserId: {UserId}. Hatalar: {Errors}",
                    userId, string.Join(", ", errors));
                return CustomResponseDto<bool>.Fail(400, errors);
            }

            _logger.LogInformation("Şifre değiştirildi. UserId: {UserId}", userId);
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<bool>> DeleteAccountAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var subscriptions = await _db.UserSubscriptions
                    .IgnoreQueryFilters()
                    .Where(x => x.UserId == userId)
                    .ToListAsync();

                var subscriptionIds = subscriptions.Select(s => s.Id).ToList();

                // Kullanıcının sahip olduğu aboneliklere ait tüm paylaşımları temizle
                // (Restrict FK ihlali önlenir — UserSubscriptions silinmeden önce zorunlu)
                var ownedShares = await _db.SubscriptionShares
                    .IgnoreQueryFilters()
                    .Where(s => subscriptionIds.Contains(s.SubscriptionId))
                    .ToListAsync();
                _db.SubscriptionShares.RemoveRange(ownedShares);

                _db.UserSubscriptions.RemoveRange(subscriptions);

                // Diğer kullanıcıların paylaşım listelerinden bu userId'yi temizle (SubscriptionShare tablosu)
                var sharedEntries = await _db.SubscriptionShares
                    .IgnoreQueryFilters()
                    .Where(s => s.SharedUserId == userId)
                    .ToListAsync();
                _db.SubscriptionShares.RemoveRange(sharedEntries);

                var notifications = await _db.NotificationQueues
                    .IgnoreQueryFilters()
                    .Where(x => x.UserId == userId)
                    .ToListAsync();
                _db.NotificationQueues.RemoveRange(notifications);

                var refreshTokens = await _db.RefreshTokens
                    .Where(x => x.UserId == userId)
                    .ToListAsync();
                _db.RefreshTokens.RemoveRange(refreshTokens);

                await _db.SaveChangesAsync();

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    await transaction.RollbackAsync();
                    var errors = result.Errors.Select(x => x.Description).ToList();
                    _logger.LogError("Hesap silme başarısız. UserId: {UserId}. Hatalar: {Errors}",
                        userId, string.Join(", ", errors));
                    return CustomResponseDto<bool>.Fail(500, errors);
                }

                await transaction.CommitAsync();
                // Hesap silindikten sonra mevcut JWT token'larını geçersiz kıl (15 dk TTL)
                await _revokedUserStore.RevokeAsync(userId);
                _logger.LogInformation("Kullanıcı hesabı kalıcı olarak silindi (GDPR). UserId: {UserId}", userId);
                return CustomResponseDto<bool>.Success(200, true);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Hesap silme işlemi başarısız, rollback yapıldı. UserId: {UserId}", userId);
                throw;
            }
        }
    }
}
