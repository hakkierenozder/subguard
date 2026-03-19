namespace SubGuard.Core.Entities
{
    public class PriceHistory : BaseEntity
    {
        public int SubscriptionId { get; set; }
        public string UserId { get; set; }
        public decimal OldPrice { get; set; }
        public decimal NewPrice { get; set; }
        public string Currency { get; set; }
        public DateTime ChangedAt { get; set; }
    }
}
