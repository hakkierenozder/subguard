using SubGuard.Core.Entities;

namespace SubGuard.Core.Specifications.Notifications
{
    /// <summary>
    /// Henüz gönderilmemiş bildirim kuyruğu kayıtlarını döner.
    /// NotificationService.ProcessNotificationQueueAsync tarafından kullanılır.
    /// </summary>
    public class UnsentNotificationsSpec : BaseSpecification<NotificationQueue>
    {
        public UnsentNotificationsSpec()
            : base(x => !x.IsSent)
        {
            ApplyOrderBy(x => x.CreatedDate);
        }
    }
}
