using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;

namespace SubGuard.Core.Services
{
    public interface IAuthService
    {
        Task<CustomResponseDto<TokenDto>> RegisterAsync(RegisterDto registerDto);
        Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto);

        Task<CustomResponseDto<UserProfileDto>> GetUserProfileAsync(string userId);
        Task<CustomResponseDto<bool>> UpdateProfileAsync(string userId, UpdateProfileDto dto);
        Task<CustomResponseDto<bool>> ChangePasswordAsync(string userId, ChangePasswordDto dto);

        Task<CustomResponseDto<TokenDto>> CreateTokenByRefreshTokenAsync(RefreshTokenDto refreshTokenDto);
        Task<CustomResponseDto<bool>> RevokeRefreshTokenAsync(string refreshToken);
    }
}
