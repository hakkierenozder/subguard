using SubGuard.Core.Enums;

namespace SubGuard.Core.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTime ScheduledDate { get; set; }
        public bool IsSent { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public NotificationType Type { get; set; }
        public int? UserSubscriptionId { get; set; }
    }
}
