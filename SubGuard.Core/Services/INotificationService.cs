using SubGuard.Core.DTOs;

namespace SubGuard.Core.Services
{
    public interface INotificationService
    {
        Task CheckAndQueueUpcomingPaymentsAsync(int daysBefore);
        Task ProcessNotificationQueueAsync();
        Task<CustomResponseDto<bool>> RegisterPushTokenAsync(string userId, string token);
        Task<CustomResponseDto<PagedResponseDto<NotificationDto>>> GetUserNotificationsAsync(string userId, int page, int pageSize);
        Task<CustomResponseDto<bool>> MarkAsReadAsync(int id, string userId);
        Task<CustomResponseDto<bool>> DeleteNotificationAsync(int id, string userId);
    }
}