using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
using SubGuard.Core.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SubGuard.Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;

        public AuthService(UserManager<AppUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<CustomResponseDto<TokenDto>> RegisterAsync(RegisterDto registerDto)
        {
            var user = new AppUser
            {
                UserName = registerDto.Email, // Identity UserName zorunlu, Email ile aynı yapıyoruz
                Email = registerDto.Email,
                FullName = registerDto.FullName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                return CustomResponseDto<TokenDto>.Fail(400, errors);
            }

            // Kayıt başarılı, direkt token dönelim
            return await GenerateToken(user);
        }

        public async Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null)
                return CustomResponseDto<TokenDto>.Fail(404, "Kullanıcı bulunamadı.");

            var checkPassword = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!checkPassword)
                return CustomResponseDto<TokenDto>.Fail(400, "E-posta veya şifre hatalı.");

            return await GenerateToken(user);
        }

        private async Task<CustomResponseDto<TokenDto>> GenerateToken(AppUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Key'i appsettings'den al
            var keyString = _configuration["JwtSettings:SecretKey"];
            var key = new SymmetricSecurityKey(Convert.FromBase64String(keyString));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.Now.AddDays(30);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );

            var tokenDto = new TokenDto
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = expiry,
                UserId = user.Id,
                FullName = user.FullName
            };

            return CustomResponseDto<TokenDto>.Success(200, tokenDto);
        }
    }
}