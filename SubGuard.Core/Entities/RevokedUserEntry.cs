namespace SubGuard.Core.Entities
{
    /// <summary>
    /// Revoke edilmiş kullanıcı ID'lerini kalıcı olarak saklar.
    /// In-memory store'un aksine sunucu restart'ı ve çoklu instance senaryolarında da çalışır.
    /// JWT süresi dolunca ExpiresAt üzerinden temizlenir.
    /// </summary>
    public class RevokedUserEntry
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
