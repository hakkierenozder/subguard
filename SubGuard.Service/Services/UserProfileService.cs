using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
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

        public UserProfileService(
            UserManager<AppUser> userManager,
            IGenericRepository<UserSubscription> subRepo,
            AppDbContext db,
            ILogger<UserProfileService> logger,
            IRevokedUserStore revokedUserStore)
        {
            _userManager = userManager;
            _subRepo = subRepo;
            _db = db;
            _logger = logger;
            _revokedUserStore = revokedUserStore;
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

            if (dto.MonthlyBudget.HasValue)
                user.MonthlyBudget = dto.MonthlyBudget.Value;

            if (dto.MonthlyBudgetCurrency != null)
                user.MonthlyBudgetCurrency = dto.MonthlyBudgetCurrency;

            if (dto.BudgetAlertThreshold.HasValue && dto.BudgetAlertThreshold.Value >= 0 && dto.BudgetAlertThreshold.Value <= 100)
                user.BudgetAlertThreshold = dto.BudgetAlertThreshold.Value;

            await _userManager.UpdateAsync(user);
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<bool>> UpdateBudgetAsync(string userId, BudgetSettingsDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            user.MonthlyBudget = dto.MonthlyBudget;
            user.MonthlyBudgetCurrency = dto.MonthlyBudgetCurrency;
            await _userManager.UpdateAsync(user);
            return CustomResponseDto<bool>.Success(200, true);
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
                _db.UserSubscriptions.RemoveRange(subscriptions);

                // Diğer kullanıcıların paylaşım listelerinden bu userId'yi temizle (SubscriptionShare tablosu)
                var sharedEntries = await _db.SubscriptionShares
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
                _revokedUserStore.Revoke(userId);
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
