using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SubGuard.Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IGenericRepository<UserSubscription> _subRepo;
        private readonly IConfiguration _configuration;

        public AuthService(UserManager<AppUser> userManager, IConfiguration configuration, IGenericRepository<UserSubscription> subRepo)
        {
            _userManager = userManager;
            _configuration = configuration;
            _subRepo = subRepo; // Bunu ekle
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

        public async Task<CustomResponseDto<UserProfileDto>> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return CustomResponseDto<UserProfileDto>.Fail(404, "Kullanıcı bulunamadı.");

            // Kullanıcının abonelik sayısını çek (Bonus)
            var subCount = _subRepo.Where(x => x.UserId == userId).Count();

            return CustomResponseDto<UserProfileDto>.Success(200, new UserProfileDto
            {
                Email = user.Email,
                FullName = user.FullName,
                TotalSubscriptions = subCount,
                MonthlyBudget = user.MonthlyBudget // <--- BU SATIRI EKLEMEN GEREKİYOR!
            });
        }

        public async Task<CustomResponseDto<bool>> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            if (!string.IsNullOrEmpty(dto.FullName))
            {
                user.FullName = dto.FullName;
            }

            if (dto.MonthlyBudget.HasValue)
            {
                user.MonthlyBudget = dto.MonthlyBudget.Value;
            }

            await _userManager.UpdateAsync(user);

            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<bool>> ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                return CustomResponseDto<bool>.Fail(400, errors);
            }

            return CustomResponseDto<bool>.Success(204);
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