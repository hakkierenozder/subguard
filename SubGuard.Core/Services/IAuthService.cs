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
        Task<CustomResponseDto<TokenDto>> RegisterAsync(RegisterDto registerDto);
        Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto);
    }
}
