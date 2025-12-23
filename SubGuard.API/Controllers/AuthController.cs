using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Services;
using System.Security.Claims; // Bunu eklemeyi unutma
using Microsoft.AspNetCore.Authorization; // Bunu eklemeyi unutma

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : CustomBaseController
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            // Validasyon otomatik yapılacak (FluentValidation entegre edilince)
            // Hata olursa Middleware yakalayacak
            var response = await _authService.RegisterAsync(registerDto);
            return CreateActionResult(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var response = await _authService.LoginAsync(loginDto);
            return CreateActionResult(response);
        }

        [Authorize] // Sadece giriş yapanlar
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _authService.GetUserProfileAsync(userId));
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _authService.UpdateProfileAsync(userId, dto));
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return CreateActionResult(await _authService.ChangePasswordAsync(userId, dto));
        }
    }
}