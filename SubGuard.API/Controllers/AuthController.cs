using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Services;
using System.Security.Claims;
// ResendConfirmationDto aynı namespace'de, ek using gerekmez

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : CustomBaseController
    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;
        private readonly IUserProfileService _profileService;

        public AuthController(
            IAuthService authService,
            ITokenService tokenService,
            IUserProfileService profileService)
        {
            _authService = authService;
            _tokenService = tokenService;
            _profileService = profileService;
        }

        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
            => CreateActionResult(await _authService.RegisterAsync(registerDto));

        [HttpPost("confirm-email")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
            => CreateActionResult(await _authService.ConfirmEmailAsync(dto.UserId, dto.Token));

        [HttpPost("resend-confirmation-email")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResendConfirmationEmail([FromBody] ResendConfirmationDto dto)
            => CreateActionResult(await _authService.ResendConfirmationEmailAsync(dto.Email));

        [HttpPost("login")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Login(LoginDto loginDto)
            => CreateActionResult(await _authService.LoginAsync(loginDto));

        [HttpPost("create-token-by-refresh-token")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> CreateTokenByRefreshToken(RefreshTokenDto refreshTokenDto)
            => CreateActionResult(await _tokenService.CreateTokenByRefreshTokenAsync(refreshTokenDto));

        [HttpPost("revoke-refresh-token")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> RevokeRefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
            => CreateActionResult(await _tokenService.RevokeRefreshTokenAsync(refreshTokenDto.Token));

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _profileService.GetUserProfileAsync(userId!));
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _profileService.UpdateProfileAsync(userId!, dto));
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _profileService.ChangePasswordAsync(userId!, dto));
        }

        [Authorize]
        [HttpDelete("me")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _profileService.DeleteAccountAsync(userId!));
        }

        // U-2: Şifre Sıfırlama
        [HttpPost("forgot-password")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
            => CreateActionResult(await _authService.ForgotPasswordAsync(dto.Email));

        [HttpPost("reset-password")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
            => CreateActionResult(await _authService.ResetPasswordAsync(dto.UserId, dto.Otp, dto.NewPassword));
    }
}
