using SubGuard.Core.DTOs;

namespace SubGuard.Core.Services
{
    public interface INotificationService
    {
        Task CheckAndQueueUpcomingPaymentsAsync(int daysBefore);
        Task CheckAndQueueBudgetAlertsAsync();
        Task CheckAndQueueContractExpiriesAsync(int daysBefore);
        Task QueueShareNotificationAsync(string targetUserId, int subscriptionId, string subscriptionName, string ownerName);
        Task ProcessNotificationQueueAsync();
        Task<CustomResponseDto<bool>> RegisterPushTokenAsync(string userId, string token);
        Task<CustomResponseDto<PagedResponseDto<NotificationDto>>> GetUserNotificationsAsync(string userId, int page, int pageSize);
        Task<CustomResponseDto<bool>> MarkAsReadAsync(int id, string userId);
        Task<CustomResponseDto<bool>> MarkAllAsReadAsync(string userId);
        Task<CustomResponseDto<bool>> DeleteNotificationAsync(int id, string userId);
        Task<CustomResponseDto<NotificationPreferencesDto>> GetPreferencesAsync(string userId);
        Task<CustomResponseDto<bool>> UpdatePreferencesAsync(string userId, NotificationPreferencesDto dto);
    }
}