using SubGuard.Core.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SubGuard.Core.Entities
{
    public class UserSubscription : BaseEntity
    {
        // Hangi Kullanıcı? (Şimdilik DeviceId veya basit bir UserId tutabiliriz)
        [Required]
        public string UserId { get; set; }

        // Hangi Servis? (İlişkili Veri)
        public int? CatalogId { get; set; }
        [ForeignKey("CatalogId")]
        public Catalog Catalog { get; set; }

        // Özelleştirilmiş Veriler
        [Required]
        public string Name { get; set; } // Kullanıcı ismini değiştirebilir
        public decimal Price { get; set; }

        public string? ColorCode { get; set; }

        [Required]
        public string Currency { get; set; }
        public int BillingDay { get; set; } // Fatura Günü (1-31)
        /// <summary>
        /// Yıllık abonelikler için fatura ayı (1-12). Null ise CreatedDate.Month anchor olarak kullanılır.
        /// Aylık aboneliklerde bu alan kullanılmaz.
        /// </summary>
        public int? BillingMonth { get; set; }
        public BillingPeriod BillingPeriod { get; set; } = BillingPeriod.Monthly;
        /// <summary>
        /// Aboneliğin ilk gerçek ödeme/başlangıç tarihi.
        /// Bütçe, yaklaşan ödeme ve rapor hesapları bu alanı esas alır.
        /// </summary>
        public DateTime? FirstPaymentDate { get; set; }
        [Required]
        public string Category { get; set; }

        // Sözleşme Bilgileri
        public bool HasContract { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }

        // Kullanıcı notları (isteğe bağlı, 2000 karakter)
        [MaxLength(2000)]
        public string? Notes { get; set; }

        public bool IsActive { get; set; } = true;

        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
        public DateTime? PausedDate { get; set; }
        public DateTime? CancelledDate { get; set; }

        // Navigation properties (ilişkisel tablolar)
        public ICollection<SubscriptionShare> Shares { get; set; } = new List<SubscriptionShare>();
        public ICollection<SubscriptionUsageLog> UsageLogs { get; set; } = new List<SubscriptionUsageLog>();

        // Concurrency token: aynı aboneliği aynı anda iki istek güncelleyemez
        // EF Core bu alanı UPDATE SET ... WHERE RowVersion = @old ile kontrol eder.
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }
}
