using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace SubGuard.Core.Entities
{
    public class NotificationQueue : BaseEntity
    {
        // Kime gönderilecek?
        public string UserId { get; set; }

        // Hangi abonelik ile ilgili?
        public int UserSubscriptionId { get; set; }

        [ForeignKey("UserSubscriptionId")]
        public UserSubscription UserSubscription { get; set; }

        // Mesaj içeriği veya başlığı
        public string Title { get; set; }
        public string Message { get; set; }

        // Planlanan gönderim zamanı (Job çalıştığı an olabilir)
        public DateTime ScheduledDate { get; set; }

        // Gönderildi mi?
        public bool IsSent { get; set; } = false;
        public DateTime? SentDate { get; set; }

        // Hata durumunda
        public string? ErrorMessage { get; set; }
    }
}