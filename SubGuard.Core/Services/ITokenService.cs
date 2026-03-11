using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;

namespace SubGuard.Core.Services
{
    /// <summary>
    /// JWT access token + refresh token yaşam döngüsünü yönetir.
    /// AuthService ve Hangfire job'ları bu interface'e bağımlıdır.
    /// </summary>
    public interface ITokenService
    {
        /// <summary>Verilen kullanıcı için yeni bir access + refresh token çifti üretir ve DB'ye kaydeder.</summary>
        Task<CustomResponseDto<TokenDto>> CreateTokenAsync(AppUser user);

        /// <summary>Geçerli bir refresh token karşılığında yeni token çifti üretir, eskiyi siler.</summary>
        Task<CustomResponseDto<TokenDto>> CreateTokenByRefreshTokenAsync(RefreshTokenDto dto);

        /// <summary>Verilen refresh token'ı geçersiz kılar (logout).</summary>
        Task<CustomResponseDto<bool>> RevokeRefreshTokenAsync(string refreshToken);

        /// <summary>Süresi dolmuş tüm refresh token'ları temizler (Hangfire daily job).</summary>
        Task PurgeExpiredRefreshTokensAsync();
    }
}
