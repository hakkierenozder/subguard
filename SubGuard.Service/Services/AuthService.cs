using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using SubGuard.Data.UnitOfWork;
using SubGuard.Core.Constants;
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
        private readonly IGenericRepository<RefreshToken> _refreshTokenRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AuthService> _logger;
        private readonly AppDbContext _db;

        public AuthService(UserManager<AppUser> userManager, IConfiguration configuration, IGenericRepository<UserSubscription> subRepo, IGenericRepository<RefreshToken> refreshTokenRepo, IUnitOfWork unitOfWork, ILogger<AuthService> logger, AppDbContext db)
        {
            _userManager = userManager;
            _configuration = configuration;
            _subRepo = subRepo;
            _refreshTokenRepo = refreshTokenRepo;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _db = db;
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
                _logger.LogWarning("Kayıt başarısız. Email: {Email}. Hatalar: {Errors}", registerDto.Email, string.Join(", ", errors));
                return CustomResponseDto<TokenDto>.Fail(400, errors);
            }

            _logger.LogInformation("Yeni kullanıcı kaydı: {Email}", user.Email);
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
                MonthlyBudget = user.MonthlyBudget,
                MonthlyBudgetCurrency = user.MonthlyBudgetCurrency
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
                user.MonthlyBudget = dto.MonthlyBudget.Value;

            if (dto.MonthlyBudgetCurrency != null)
                user.MonthlyBudgetCurrency = dto.MonthlyBudgetCurrency;

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
                _logger.LogWarning("Şifre değiştirme başarısız. UserId: {UserId}. Hatalar: {Errors}", userId, string.Join(", ", errors));
                return CustomResponseDto<bool>.Fail(400, errors);
            }

            _logger.LogInformation("Şifre değiştirildi. UserId: {UserId}", userId);
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<TokenDto>> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null)
                return CustomResponseDto<TokenDto>.Fail(404, "Kullanıcı bulunamadı.");

            if (await _userManager.IsLockedOutAsync(user))
            {
                _logger.LogWarning("Kilitli hesaba giriş denemesi. Email: {Email}", loginDto.Email);
                return CustomResponseDto<TokenDto>.Fail(423, "Çok fazla hatalı giriş denemesi yapıldı. Hesabınız 15 dakika süreyle kilitlenmiştir.");
            }

            var checkPassword = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!checkPassword)
            {
                await _userManager.AccessFailedAsync(user);
                _logger.LogWarning("Başarısız giriş denemesi. Email: {Email}", loginDto.Email);
                return CustomResponseDto<TokenDto>.Fail(400, "E-posta veya şifre hatalı.");
            }

            _logger.LogInformation("Kullanıcı giriş yaptı. Email: {Email}", user.Email);
            await _userManager.ResetAccessFailedCountAsync(user);
            return await GenerateToken(user);
        }

        private Task<RefreshToken?> FindRefreshTokenAsync(string code)
            => _refreshTokenRepo.Where(x => x.Code == code).FirstOrDefaultAsync();

        public async Task<CustomResponseDto<TokenDto>> CreateTokenByRefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            var existToken = await FindRefreshTokenAsync(refreshTokenDto.Token);

            if (existToken == null)
                return CustomResponseDto<TokenDto>.Fail(404, "Refresh token bulunamadı.");

            if (existToken.Expiration < DateTime.UtcNow)
            {
                _logger.LogWarning("Süresi dolmuş refresh token kullanım denemesi. UserId: {UserId}", existToken.UserId);
                _refreshTokenRepo.Remove(existToken);
                await _unitOfWork.CommitAsync();
                return CustomResponseDto<TokenDto>.Fail(401, "Refresh token süresi dolmuş. Lütfen tekrar giriş yapın.");
            }

            var user = await _userManager.FindByIdAsync(existToken.UserId);
            if (user == null) return CustomResponseDto<TokenDto>.Fail(404, "Kullanıcı bulunamadı.");

            var tokenDto = await GenerateToken(user);

            _refreshTokenRepo.Remove(existToken);
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Token yenilendi. UserId: {UserId}", user.Id);
            return tokenDto;
        }

        public async Task<CustomResponseDto<bool>> RevokeRefreshTokenAsync(string refreshToken)
        {
            var existToken = await FindRefreshTokenAsync(refreshToken);
            if (existToken != null)
            {
                _refreshTokenRepo.Remove(existToken);
                await _unitOfWork.CommitAsync();
            }
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task PurgeExpiredRefreshTokensAsync()
        {
            var expired = await _refreshTokenRepo.Where(x => x.Expiration < DateTime.UtcNow).ToListAsync();
            if (expired.Count == 0) return;

            foreach (var token in expired)
                _refreshTokenRepo.Remove(token);

            await _unitOfWork.CommitAsync();
            _logger.LogInformation("Süresi dolmuş {Count} refresh token temizlendi.", expired.Count);
        }

        public async Task<CustomResponseDto<bool>> DeleteAccountAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı.");

            // Hard-delete subscriptions (bypass soft delete filter)
            var subscriptions = await _db.UserSubscriptions
                .IgnoreQueryFilters()
                .Where(x => x.UserId == userId)
                .ToListAsync();
            _db.UserSubscriptions.RemoveRange(subscriptions);

            // Hard-delete notification queue entries
            var notifications = await _db.NotificationQueues
                .IgnoreQueryFilters()
                .Where(x => x.UserId == userId)
                .ToListAsync();
            _db.NotificationQueues.RemoveRange(notifications);

            // Hard-delete refresh tokens
            var refreshTokens = await _db.RefreshTokens
                .Where(x => x.UserId == userId)
                .ToListAsync();
            _db.RefreshTokens.RemoveRange(refreshTokens);

            await _db.SaveChangesAsync();

            // Delete the Identity user account
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(x => x.Description).ToList();
                _logger.LogError("Hesap silme başarısız. UserId: {UserId}. Hatalar: {Errors}", userId, string.Join(", ", errors));
                return CustomResponseDto<bool>.Fail(500, errors);
            }

            _logger.LogInformation("Kullanıcı hesabı kalıcı olarak silindi (GDPR). UserId: {UserId}", userId);
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

            var accessTokenExpiration = DateTime.UtcNow.AddMinutes(AppConstants.Token.AccessTokenExpirationMinutes);

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
            var refreshTokenExpiration = DateTime.UtcNow.AddDays(AppConstants.Token.RefreshTokenExpirationDays);

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