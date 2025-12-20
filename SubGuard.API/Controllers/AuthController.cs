using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Services;

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
            return CreateActionResult(await _authService.RegisterAsync(registerDto));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            return CreateActionResult(await _authService.LoginAsync(loginDto));
        }
    }
}