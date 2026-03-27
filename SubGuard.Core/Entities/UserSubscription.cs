using SubGuard.Core.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SubGuard.Core.Entities
{
    public class UserSubscription : BaseEntity
    {
        // Hangi Kullanıcı? (Şimdilik DeviceId veya basit bir UserId tutabiliriz)
        public string UserId { get; set; }

        // Hangi Servis? (İlişkili Veri)
        public int? CatalogId { get; set; }
        [ForeignKey("CatalogId")]
        public Catalog Catalog { get; set; }

        // Özelleştirilmiş Veriler
        public string Name { get; set; } // Kullanıcı ismini değiştirebilir
        public decimal Price { get; set; }

        public string? ColorCode { get; set; }

        public string Currency { get; set; }
        public int BillingDay { get; set; } // Fatura Günü (1-31)
        public BillingPeriod BillingPeriod { get; set; } = BillingPeriod.Monthly;
        public string Category { get; set; }

        // Sözleşme Bilgileri
        public bool HasContract { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }

        // Kullanıcı notları (isteğe bağlı, 500 karakter)
        public string? Notes { get; set; }

        public bool IsActive { get; set; } = true;

        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
        public DateTime? PausedDate { get; set; }
        public DateTime? CancelledDate { get; set; }

        // Navigation properties (ilişkisel tablolar)
        public ICollection<SubscriptionShare> Shares { get; set; } = new List<SubscriptionShare>();
        public ICollection<SubscriptionUsageLog> UsageLogs { get; set; } = new List<SubscriptionUsageLog>();

    }
}
