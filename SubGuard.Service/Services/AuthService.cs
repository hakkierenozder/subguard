using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SabGuard.Data.UnitOfWork;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace SubGuard.Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IGenericRepository<UserSubscription> _subRepo;
        private readonly IConfiguration _configuration;
        private readonly IGenericRepository<RefreshToken> _refreshTokenRepo; // EKLENDİ
        private readonly IUnitOfWork _unitOfWork; // EKLENDİ

        public AuthService(UserManager<AppUser> userManager, IConfiguration configuration, IGenericRepository<UserSubscription> subRepo, IGenericRepository<RefreshToken> refreshTokenRepo, IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _configuration = configuration;
            _subRepo = subRepo; // Bunu ekle
            _refreshTokenRepo = refreshTokenRepo;
            _unitOfWork = unitOfWork;
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

        public async Task<CustomResponseDto<TokenDto>> CreateTokenByRefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            // Veritabanında bu token var mı?
            var existToken = await _refreshTokenRepo.Where(x => x.Code == refreshTokenDto.Token).FirstOrDefaultAsync();

            if (existToken == null)
            {
                return CustomResponseDto<TokenDto>.Fail(404, "Refresh token bulunamadı.");
            }

            if (existToken.Expiration < DateTime.UtcNow)
            {
                // Süresi dolmuşsa sil
                _refreshTokenRepo.Remove(existToken);
                await _unitOfWork.CommitAsync();
                return CustomResponseDto<TokenDto>.Fail(401, "Refresh token süresi dolmuş. Lütfen tekrar giriş yapın.");
            }

            var user = await _userManager.FindByIdAsync(existToken.UserId);
            if (user == null) return CustomResponseDto<TokenDto>.Fail(404, "Kullanıcı bulunamadı.");

            // Yeni token üret (Hem Access hem Refresh yenilenir - Rotation mantığı)
            var tokenDto = await GenerateToken(user);

            // Eski refresh token'ı siliyoruz (Security Best Practice: Refresh Token Rotation)
            _refreshTokenRepo.Remove(existToken);
            await _unitOfWork.CommitAsync();

            return tokenDto;
        }

        public async Task<CustomResponseDto<bool>> RevokeRefreshTokenAsync(string refreshToken)
        {
            var existToken = await _refreshTokenRepo.Where(x => x.Code == refreshToken).FirstOrDefaultAsync();
            if (existToken != null)
            {
                _refreshTokenRepo.Remove(existToken);
                await _unitOfWork.CommitAsync();
            }
            return CustomResponseDto<bool>.Success(204);
        }

        private async Task<CustomResponseDto<TokenDto>> GenerateToken(AppUser user)
        {
            // 1. Access Token Üretimi
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var keyString = _configuration["JwtSettings:SecretKey"];
            var key = new SymmetricSecurityKey(Convert.FromBase64String(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Access Token ömrünü kısa tutalım (Örn: 15 dakika)
            var accessTokenExpiration = DateTime.UtcNow.AddMinutes(15);

            var jwtSecurityToken = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: accessTokenExpiration,
                signingCredentials: creds
            );

            var accessToken = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);

            // 2. Refresh Token Üretimi
            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var refreshTokenExpiration = DateTime.UtcNow.AddDays(30); // 30 Günlük ömür

            // 3. Veritabanına Kayıt
            await _refreshTokenRepo.AddAsync(new RefreshToken
            {
                Code = refreshToken,
                UserId = user.Id,
                Expiration = refreshTokenExpiration
            });

            await _unitOfWork.CommitAsync();

            return CustomResponseDto<TokenDto>.Success(200, new TokenDto
            {
                AccessToken = accessToken,
                AccessTokenExpiration = accessTokenExpiration,
                RefreshToken = refreshToken,
                RefreshTokenExpiration = refreshTokenExpiration,
                UserId = user.Id,
                FullName = user.FullName
            });
        }
    }
}