using SubGuard.Core.DTOs.Base;
using SubGuard.Core.Enums;

namespace SubGuard.Core.DTOs
{
    public class UserSubscriptionDto : BaseDto
    {
        public DateTime CreatedDate { get; set; }
        public string UserId { get; set; }
        public int? CatalogId { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public int BillingDay { get; set; }
        /// <summary>Yıllık abonelikler için fatura ayı (1-12). Null ise CreatedDate.Month kullanılır.</summary>
        public int? BillingMonth { get; set; }
        public BillingPeriod BillingPeriod { get; set; } = BillingPeriod.Monthly;
        public string Category { get; set; }

        public string? ColorCode { get; set; }

        public bool HasContract { get; set; }

        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }

        public string? Notes { get; set; }

        public bool IsActive { get; set; }
        public SubscriptionStatus Status { get; set; }
        public DateTime? PausedDate { get; set; }
        public DateTime? CancelledDate { get; set; }

        /// <summary>Paylaşılan kullanıcıların e-posta adresleri (görüntülenecek).</summary>
        public List<string> SharedUserEmails { get; set; } = new();

        /// <summary>
        /// Paylaşılan kullanıcıların kimlik ID'leri. SharedUserEmails ile index-bazlı eşleşir.
        /// Frontend removeShare çağrısı için gerekli.
        /// </summary>
        public List<string> SharedUserIds { get; set; } = new();
    }
}