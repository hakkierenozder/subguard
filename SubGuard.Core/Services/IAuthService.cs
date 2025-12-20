using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;

namespace SubGuard.Core.Services
{
    public interface IAuthService
    {
        Task<CustomResponseDto<TokenDto>> RegisterAsync(RegisterDto registerDto);
        Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto);
    }
}
