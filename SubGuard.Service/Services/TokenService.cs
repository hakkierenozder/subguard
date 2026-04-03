using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using SubGuard.Core.Constants;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Auth;
using SubGuard.Core.Entities;
using SubGuard.Core.Helpers;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace SubGuard.Service.Services
{
    public class TokenService : ITokenService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IGenericRepository<RefreshToken> _refreshTokenRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ILogger<TokenService> _logger;
        // TODO: Teknik borç — AppDbContext doğrudan enjekte ediliyor.
        // RevokedUserEntry için IGenericRepository<T> kullanılmalı.
        private readonly AppDbContext _db;

        public TokenService(
            UserManager<AppUser> userManager,
            IGenericRepository<RefreshToken> refreshTokenRepo,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ILogger<TokenService> logger,
            AppDbContext db)
        {
            _userManager = userManager;
            _refreshTokenRepo = refreshTokenRepo;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _logger = logger;
            _db = db;
        }

        public async Task<CustomResponseDto<TokenDto>> CreateTokenAsync(AppUser user)
        {
            var (accessToken, accessExpiry) = await BuildAccessTokenAsync(user);
            var refreshToken = BuildRefreshTokenEntity(user.Id);

            await _refreshTokenRepo.AddAsync(refreshToken);
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Token üretildi. Email: {Email}", PiiSanitizer.MaskEmail(user.Email));

            return CustomResponseDto<TokenDto>.Success(200, new TokenDto
            {
                AccessToken = accessToken,
                AccessTokenExpiration = accessExpiry,
                RefreshToken = refreshToken.Code,
                RefreshTokenExpiration = refreshToken.Expiration,
                UserId = user.Id,
                FullName = user.FullName
            });
        }

        public async Task<CustomResponseDto<TokenDto>> CreateTokenByRefreshTokenAsync(RefreshTokenDto dto)
        {
            var existToken = await FindTokenAsync(dto.Token);

            if (existToken == null)
                return CustomResponseDto<TokenDto>.Fail(404, "Refresh token bulunamadı.");

            if (existToken.Expiration < DateTime.UtcNow)
            {
                _logger.LogWarning("Süresi dolmuş refresh token kullanım denemesi. UserId: {UserId}", existToken.UserId); // UserId PII değil, sadece internal ID
                _refreshTokenRepo.Remove(existToken);
                await _unitOfWork.CommitAsync();
                return CustomResponseDto<TokenDto>.Fail(401, "Refresh token süresi dolmuş. Lütfen tekrar giriş yapın.");
            }

            var user = await _userManager.FindByIdAsync(existToken.UserId);
            if (user == null)
                return CustomResponseDto<TokenDto>.Fail(404, "Kullanıcı bulunamadı.");

            // Atomik rotasyon: eski token'ı sil + yeni token'ı ekle = tek commit
            // Böylece iki commit arasındaki hata ihtimalinde kullanıcı tokensız kalmaz
            if (await _userManager.IsLockedOutAsync(user))
            {
                _refreshTokenRepo.Remove(existToken);
                await _unitOfWork.CommitAsync();
                return CustomResponseDto<TokenDto>.Fail(423, "Hesabiniz askiya alinmis. Lutfen bir yonetici ile iletisime gecin.");
            }

            _refreshTokenRepo.Remove(existToken);
            var newRefreshToken = BuildRefreshTokenEntity(user.Id);
            await _refreshTokenRepo.AddAsync(newRefreshToken);

            var (accessToken, accessExpiry) = await BuildAccessTokenAsync(user);

            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Token atomik olarak yenilendi. Email: {Email}", PiiSanitizer.MaskEmail(user.Email));

            return CustomResponseDto<TokenDto>.Success(200, new TokenDto
            {
                AccessToken = accessToken,
                AccessTokenExpiration = accessExpiry,
                RefreshToken = newRefreshToken.Code,
                RefreshTokenExpiration = newRefreshToken.Expiration,
                UserId = user.Id,
                FullName = user.FullName
            });
        }

        public async Task<CustomResponseDto<bool>> RevokeRefreshTokenAsync(string refreshToken)
        {
            var existToken = await FindTokenAsync(refreshToken);
            if (existToken != null)
            {
                _refreshTokenRepo.Remove(existToken);
                await _unitOfWork.CommitAsync();
            }
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task PurgeExpiredRefreshTokensAsync()
        {
            // Süresi dolmuş refresh token'ları temizle
            var expired = await _refreshTokenRepo
                .Where(x => x.Expiration < DateTime.UtcNow)
                .ToListAsync();

            foreach (var token in expired)
                _refreshTokenRepo.Remove(token);

            // Süresi dolmuş JWT revocation kayıtlarını temizle (DB şişmesini önler)
            var expiredRevocations = await _db.RevokedUserEntries
                .Where(e => e.ExpiresAt < DateTime.UtcNow)
                .ToListAsync();

            if (expiredRevocations.Count > 0)
                _db.RevokedUserEntries.RemoveRange(expiredRevocations);

            await _unitOfWork.CommitAsync();

            _logger.LogInformation(
                "Süresi dolmuş {RefreshCount} refresh token ve {RevocationCount} revocation kaydı temizlendi.",
                expired.Count, expiredRevocations.Count);
        }

        // ─── Private helpers ──────────────────────────────────────

        /// <summary>
        /// JWT access token'ı üretir. Rol claim'leri DB'den alınır, token'a yazılır.
        /// </summary>
        private async Task<(string Token, DateTime Expiry)> BuildAccessTokenAsync(AppUser user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email ?? string.Empty),
                new(ClaimTypes.Name, user.FullName ?? string.Empty),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Kullanıcının rollerini claim olarak ekle ([Authorize(Roles="Admin")] için gerekli)
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var keyString = _configuration["JwtSettings:SecretKey"];
            if (string.IsNullOrWhiteSpace(keyString))
                throw new InvalidOperationException("'JwtSettings:SecretKey' yapılandırması eksik veya boş. Uygulama başlatılamıyor.");
            var key = new SymmetricSecurityKey(Convert.FromBase64String(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.UtcNow.AddMinutes(AppConstants.Token.AccessTokenExpirationMinutes);

            var jwtToken = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds);

            return (new JwtSecurityTokenHandler().WriteToken(jwtToken), expiry);
        }

        /// <summary>
        /// Yeni bir RefreshToken entity'si oluşturur. Henüz DB'ye kaydedilmez.
        /// </summary>
        private static RefreshToken BuildRefreshTokenEntity(string userId) => new()
        {
            Code = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)),
            UserId = userId,
            Expiration = DateTime.UtcNow.AddDays(AppConstants.Token.RefreshTokenExpirationDays)
        };

        private Task<RefreshToken?> FindTokenAsync(string code)
            => _refreshTokenRepo.Where(x => x.Code == code).FirstOrDefaultAsync();
    }
}
