using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<AppUser> userManager,
            ITokenService tokenService,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _logger = logger;
        }

        public async Task<CustomResponseDto<TokenDto>> RegisterAsync(RegisterDto registerDto)
        {
            var user = new AppUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FullName = registerDto.FullName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                _logger.LogWarning("Kayit basarisiz. Email: {Email}. Hatalar: {Errors}",
                    registerDto.Email, string.Join(", ", errors));
                return CustomResponseDto<TokenDto>.Fail(400, errors);
            }

            _logger.LogInformation("Yeni kullanici kaydi: {Email}", user.Email);
            return await _tokenService.CreateTokenAsync(user);
        }

        public async Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null)
                return CustomResponseDto<TokenDto>.Fail(404, "Kullanici bulunamadi.");

            if (await _userManager.IsLockedOutAsync(user))
            {
                _logger.LogWarning("Kilitli hesaba giris denemesi. Email: {Email}", loginDto.Email);
                return CustomResponseDto<TokenDto>.Fail(423, "Cok fazla hatali giris denemesi yapildi. Hesabiniz 15 dakika sureyle kilitlenmistir.");
            }

            var checkPassword = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!checkPassword)
            {
                await _userManager.AccessFailedAsync(user);
                _logger.LogWarning("Basarisiz giris denemesi. Email: {Email}", loginDto.Email);
                return CustomResponseDto<TokenDto>.Fail(400, "E-posta veya sifre hatali.");
            }

            await _userManager.ResetAccessFailedCountAsync(user);
            _logger.LogInformation("Kullanici giris yapti. Email: {Email}", user.Email);
            return await _tokenService.CreateTokenAsync(user);
        }
    }
}
