namespace SubGuard.Core.Entities
{
    /// <summary>
    /// Revoke edilmiş kullanıcı ID'lerini kalıcı olarak saklar.
    /// In-memory store'un aksine sunucu restart'ı ve çoklu instance senaryolarında da çalışır.
    /// JWT süresi dolunca ExpiresAt üzerinden temizlenir.
    /// <para>
    /// NOT: Bu entity kasıtlı olarak <see cref="BaseEntity"/>'den kalıtmaz.
    /// BaseEntity'den kalıtılsaydı global soft-delete query filter (IsDeleted == false)
    /// devreye girerdi; bu da IsDeleted=true olan revoke kayıtlarını sorgulardan gizleyerek
    /// iptal edilmiş tokenların yeniden geçerli sayılmasına neden olabilirdi.
    /// Güvenlik açısından kritik olan bu tablo her zaman tüm kayıtları görmelidir.
    /// </para>
    /// </summary>
    public class RevokedUserEntry
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
