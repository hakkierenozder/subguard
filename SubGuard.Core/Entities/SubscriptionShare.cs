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

        /// <summary>Üyeli paylaşımda hedef kullanıcının ID'si. Üyesiz paylaşımda null.</summary>
        public string? SharedUserId { get; set; }

        /// <summary>Üyeli paylaşımda e-posta adresi.</summary>
        public string? SharedUserEmail { get; set; }

        /// <summary>Üyesiz paylaşımda gösterim ismi (üyeli paylaşımda null).</summary>
        public string? DisplayName { get; set; }

        public DateTime SharedAt { get; set; } = DateTime.UtcNow;
    }
}
