using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
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
    public class TokenService : ITokenService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IGenericRepository<RefreshToken> _refreshTokenRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ILogger<TokenService> _logger;

        public TokenService(
            UserManager<AppUser> userManager,
            IGenericRepository<RefreshToken> refreshTokenRepo,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ILogger<TokenService> logger)
        {
            _userManager = userManager;
            _refreshTokenRepo = refreshTokenRepo;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<CustomResponseDto<TokenDto>> CreateTokenAsync(AppUser user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email!),
                new(ClaimTypes.Name, user.FullName!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var keyString = _configuration["JwtSettings:SecretKey"];
            var key = new SymmetricSecurityKey(Convert.FromBase64String(keyString!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var accessExpiry = DateTime.UtcNow.AddMinutes(AppConstants.Token.AccessTokenExpirationMinutes);

            var jwtToken = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: accessExpiry,
                signingCredentials: creds);

            var accessToken = new JwtSecurityTokenHandler().WriteToken(jwtToken);

            var refreshCode = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var refreshExpiry = DateTime.UtcNow.AddDays(AppConstants.Token.RefreshTokenExpirationDays);

            await _refreshTokenRepo.AddAsync(new RefreshToken
            {
                Code = refreshCode,
                UserId = user.Id,
                Expiration = refreshExpiry
            });

            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Token üretildi. UserId: {UserId}", user.Id);

            return CustomResponseDto<TokenDto>.Success(200, new TokenDto
            {
                AccessToken = accessToken,
                AccessTokenExpiration = accessExpiry,
                RefreshToken = refreshCode,
                RefreshTokenExpiration = refreshExpiry,
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
                _logger.LogWarning("Süresi dolmuş refresh token kullanım denemesi. UserId: {UserId}", existToken.UserId);
                _refreshTokenRepo.Remove(existToken);
                await _unitOfWork.CommitAsync();
                return CustomResponseDto<TokenDto>.Fail(401, "Refresh token süresi dolmuş. Lütfen tekrar giriş yapın.");
            }

            var user = await _userManager.FindByIdAsync(existToken.UserId);
            if (user == null)
                return CustomResponseDto<TokenDto>.Fail(404, "Kullanıcı bulunamadı.");

            _refreshTokenRepo.Remove(existToken);
            await _unitOfWork.CommitAsync();

            _logger.LogInformation("Token yenilendi. UserId: {UserId}", user.Id);
            return await CreateTokenAsync(user);
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
            var expired = await _refreshTokenRepo
                .Where(x => x.Expiration < DateTime.UtcNow)
                .ToListAsync();

            if (expired.Count == 0) return;

            foreach (var token in expired)
                _refreshTokenRepo.Remove(token);

            await _unitOfWork.CommitAsync();
            _logger.LogInformation("Süresi dolmuş {Count} refresh token temizlendi.", expired.Count);
        }

        private Task<RefreshToken?> FindTokenAsync(string code)
            => _refreshTokenRepo.Where(x => x.Code == code).FirstOrDefaultAsync();
    }
}
