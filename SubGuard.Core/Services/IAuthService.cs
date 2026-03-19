using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;

namespace SubGuard.Core.Services
{
    /// <summary>
    /// Yalnızca kimlik doğrulama (register + login) sorumluluğu.
    /// Token yönetimi → ITokenService
    /// Profil/hesap yönetimi → IUserProfileService
    /// </summary>
    public interface IAuthService
    {
        /// <summary>Başarılı olursa data alanında yeni kullanıcının Id'sini döner.</summary>
        Task<CustomResponseDto<string>> RegisterAsync(RegisterDto registerDto);
        Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto);
        Task<CustomResponseDto<bool>> ConfirmEmailAsync(string userId, string token);
    }
}
