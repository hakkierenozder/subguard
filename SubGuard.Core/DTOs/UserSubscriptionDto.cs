using SubGuard.Core.DTOs.Base;

namespace SubGuard.Core.DTOs
{
    public class UserSubscriptionDto : BaseDto
    {
        public string UserId { get; set; }
        public int? CatalogId { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public int BillingDay { get; set; }
        public string Category { get; set; }

        public string? ColorCode { get; set; }

        public bool HasContract { get; set; }
        public DateTime? ContractEndDate { get; set; }

        public string? SharedWithJson { get; set; }
        public string? UsageHistoryJson { get; set; }
    }
}