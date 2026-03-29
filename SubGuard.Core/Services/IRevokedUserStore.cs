namespace SubGuard.Core.Services
{
    /// <summary>
    /// Silinmiş/çıkış yapılmış kullanıcı ID'lerini JWT ömrü boyunca tutar.
    /// Bu sayede hesap silindikten sonra eski token'lar geçersiz kalır.
    /// </summary>
    public interface IRevokedUserStore
    {
        /// <summary>Kullanıcıyı kara listeye ekle (TTL = JWT süresi). DB hatası fırlatılır.</summary>
        Task RevokeAsync(string userId);

        /// <summary>Kullanıcının token'ı geçersiz kılınmış mı?</summary>
        bool IsRevoked(string userId);
    }
}
