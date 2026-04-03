using SubGuard.Core.DTOs;
using SubGuard.Core.Enums;

namespace SubGuard.Core.Services
{
    public interface IUserSubscriptionService
    {
        Task<CustomResponseDto<PagedResponseDto<UserSubscriptionDto>>> GetUserSubscriptionsAsync(string userId, int page, int pageSize, string? q = null);
        Task<CustomResponseDto<UserSubscriptionDto>> DuplicateSubscriptionAsync(int id, string userId);
        Task<CustomResponseDto<UserSubscriptionDto>> AddSubscriptionAsync(AddUserSubscriptionDto dto, string userId);
        Task<CustomResponseDto<bool>> UpdateSubscriptionAsync(int id, UpdateUserSubscriptionDto dto, string userId);
        Task<CustomResponseDto<bool>> RemoveSubscriptionAsync(int id, string userId);
        Task<CustomResponseDto<bool>> ChangeStatusAsync(int id, string userId, SubscriptionStatus newStatus, bool forceCancel = false);

        // Kullanıcı Kontrolü (paylaşım öncesi e-posta doğrulama)
        Task<CustomResponseDto<bool>> CheckUserByEmailAsync(string email);

        // Paylaşım
        Task<CustomResponseDto<bool>> ShareSubscriptionAsync(int id, string ownerId, string targetEmail);
        Task<CustomResponseDto<bool>> RemoveShareAsync(int id, string ownerId, string targetUserId);
        Task<CustomResponseDto<bool>> ShareGuestAsync(int id, string ownerId, string displayName);
        Task<CustomResponseDto<bool>> RemoveGuestShareAsync(int id, string ownerId, int shareId);
        Task<CustomResponseDto<PagedResponseDto<SharedWithMeItemDto>>> GetSharedWithMeAsync(string userId, int page, int pageSize);

        // Kullanım Geçmişi
        Task<CustomResponseDto<List<UsageLogDto>>> GetUsageHistoryAsync(int id, string userId);
        Task<CustomResponseDto<UsageLogDto>> AddUsageLogAsync(int id, string userId, AddUsageLogDto dto);
        Task<CustomResponseDto<bool>> DeleteUsageLogAsync(int id, string userId, string logId);

        // Survey Geçmişi (kullanım anketi JSON sync)
        Task<CustomResponseDto<bool>> UpdateSurveyHistoryAsync(int id, string userId, string usageHistoryJson);

        // Fiyat Geçmişi
        Task<CustomResponseDto<List<PriceHistoryDto>>> GetPriceHistoryAsync(int id, string userId);
    }
}
