namespace SubGuard.Core.Entities
{
    /// <summary>
    /// Bir abonelik için kullanım kayıtlarını tutan ilişkisel tablo.
    /// Eski yaklaşım: UserSubscription.UsageHistoryJson (JSON kolon anti-pattern)
    /// </summary>
    public class SubscriptionUsageLog : BaseEntity
    {
        public int SubscriptionId { get; set; }
        public UserSubscription Subscription { get; set; } = null!;

        /// <summary>Kaydı oluşturan kullanıcı (abonelik sahibi)</summary>
        public string UserId { get; set; } = string.Empty;

        public string? Note { get; set; }
        public decimal? Amount { get; set; }
        public string? Unit { get; set; }

        public DateTime LoggedAt { get; set; }
    }
}
