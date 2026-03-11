using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IGenericRepository<UserSubscription> _subRepo;
        private readonly AppDbContext _db;
        private readonly ILogger<UserProfileService> _logger;

        public UserProfileService(
            UserManager<AppUser> userManager,
            IGenericRepository<UserSubscription> subRepo,
            AppDbContext db,
            ILogger<UserProfileService> logger)
        {
            _userManager = userManager;
            _subRepo = subRepo;
            _db = db;
            _logger = logger;
        }

        public async Task<CustomResponseDto<UserProfileDto>> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return CustomResponseDto<UserProfileDto>.Fail(404, "Kullanıcı bulunamadı.");

            var subCount = _subRepo.Where(x => x.UserId == userId).Count();

            return CustomResponseDto<UserProfileDto>.Success(200, new UserProfileDto
            {
                Email = user.Email,
                FullName = user.FullName,
                TotalSubscriptions = subCount,
                MonthlyBudget = user.MonthlyBudget,
                MonthlyBudgetCurrency = user.MonthlyBudgetCurrency
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

            await _userManager.UpdateAsync(user);
            return CustomResponseDto<bool>.Success(204);
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

            var subscriptions = await _db.UserSubscriptions
                .IgnoreQueryFilters()
                .Where(x => x.UserId == userId)
                .ToListAsync();
            _db.UserSubscriptions.RemoveRange(subscriptions);

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
                var errors = result.Errors.Select(x => x.Description).ToList();
                _logger.LogError("Hesap silme başarısız. UserId: {UserId}. Hatalar: {Errors}",
                    userId, string.Join(", ", errors));
                return CustomResponseDto<bool>.Fail(500, errors);
            }

            _logger.LogInformation("Kullanıcı hesabı kalıcı olarak silindi (GDPR). UserId: {UserId}", userId);
            return CustomResponseDto<bool>.Success(204);
        }
    }
}
