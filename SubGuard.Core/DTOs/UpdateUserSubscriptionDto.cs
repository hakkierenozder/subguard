using SubGuard.Core.Enums;

namespace SubGuard.Core.DTOs
{
    /// <summary>
    /// Mevcut abonelik güncellenirken istemciden alınan payload.
    /// UserId istemciden gelmez — JWT token'dan okunur.
    /// Status değişikliği ayrı ChangeStatus endpoint'i üzerinden yapılır.
    /// </summary>
    public class UpdateUserSubscriptionDto
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public int BillingDay { get; set; }
        /// <summary>Yıllık abonelikler için fatura ayı (1-12). Aylık aboneliklerde gönderilmez.</summary>
        public int? BillingMonth { get; set; }
        public BillingPeriod BillingPeriod { get; set; } = BillingPeriod.Monthly;
        public DateTime? FirstPaymentDate { get; set; }
        public string Category { get; set; }
        public string? ColorCode { get; set; }
        public bool HasContract { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        public List<string>? SharedUserEmails { get; set; }
        public List<string>? SharedGuestNames { get; set; }
        public string? Notes { get; set; }
    }
}
