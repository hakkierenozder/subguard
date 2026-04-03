using SubGuard.Core.Enums;

namespace SubGuard.Core.DTOs
{
    /// <summary>
    /// Yeni abonelik oluştururken istemciden alınan payload.
    /// UserId, CreatedDate, Status gibi sistem alanlarını içermez.
    /// </summary>
    public class AddUserSubscriptionDto
    {
        public int? CatalogId { get; set; }
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
        public string? Notes { get; set; }
        public List<string>? SharedUserEmails { get; set; }
    }
}
