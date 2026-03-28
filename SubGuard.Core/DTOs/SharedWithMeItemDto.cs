namespace SubGuard.Core.DTOs
{
    /// <summary>
    /// Benimle paylaşılan abonelik satırı — sahip (owner) ve paylaşım tarihi bilgilerini içerir.
    /// </summary>
    public class SharedWithMeItemDto : UserSubscriptionDto
    {
        /// <summary>Paylaşımın yapıldığı UTC tarih/saat (SubscriptionShare.SharedAt)</summary>
        public DateTime SharedAt { get; set; }

        /// <summary>Aboneliğin asıl sahibinin e-posta adresi</summary>
        public string OwnerEmail { get; set; } = string.Empty;

        /// <summary>Aboneliğin asıl sahibinin tam adı</summary>
        public string OwnerFullName { get; set; } = string.Empty;
    }
}
