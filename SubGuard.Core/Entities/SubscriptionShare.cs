namespace SubGuard.Core.Entities
{
    /// <summary>
    /// Bir aboneliğin kimlerle paylaşıldığını tutan ilişkisel tablo.
    /// Eski yaklaşım: UserSubscription.SharedWithJson (JSON dizi anti-pattern)
    /// </summary>
    public class SubscriptionShare : BaseEntity
    {
        public int SubscriptionId { get; set; }
        public UserSubscription Subscription { get; set; } = null!;

        /// <summary>Aboneliği görüntüleme izni verilen kullanıcının ID'si (AspNetUsers.Id)</summary>
        public string SharedUserId { get; set; } = string.Empty;

        public DateTime SharedAt { get; set; } = DateTime.UtcNow;
    }
}
