using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SubGuard.Core.Constants;
using SubGuard.Core.Entities;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    /// <summary>
    /// Revoke edilmiş kullanıcı ID'lerini hem in-memory cache'de (hız) hem de DB'de (kalıcılık) tutar.
    /// Sunucu restart'ında veya çoklu instance senaryosunda DB fallback devreye girer.
    /// </summary>
    public class DbRevokedUserStore : IRevokedUserStore
    {
        private readonly IMemoryCache _cache;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DbRevokedUserStore> _logger;
        private const string CacheKeyPrefix = "revoked_user:";
        private static readonly TimeSpan JwtExpiry =
            TimeSpan.FromMinutes(AppConstants.Token.AccessTokenExpirationMinutes + 1);

        public DbRevokedUserStore(
            IMemoryCache cache,
            IServiceScopeFactory scopeFactory,
            ILogger<DbRevokedUserStore> logger)
        {
            _cache = cache;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public void Revoke(string userId)
        {
            // 1. Katman: In-memory cache — hızlı aynı-instance kontrolü
            _cache.Set(CacheKeyPrefix + userId, true, JwtExpiry);

            // 2. Katman: DB'ye yaz — restart/multi-instance için kalıcılık
            // Fire-and-forget: DB hatası kritik değil; JWT zaten layer-2 DB kontrolüne sahip
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    // Aynı kullanıcı için zaten aktif kayıt varsa tekrar ekleme
                    var exists = db.RevokedUserEntries
                        .Any(e => e.UserId == userId && e.ExpiresAt > DateTime.UtcNow);

                    if (!exists)
                    {
                        db.RevokedUserEntries.Add(new RevokedUserEntry
                        {
                            UserId = userId,
                            ExpiresAt = DateTime.UtcNow.Add(JwtExpiry)
                        });
                        await db.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    // DB yazma hatası in-memory cache'i geçersiz kılmaz (aynı instance'da revoke çalışmaya devam eder).
                    // Multi-instance senaryosunda bu instance'dan gelen revoke diğer sunuculara yayılmaz — kritik güvenlik olayı.
                    _logger.LogError(ex,
                        "Token revocation DB'ye yazılamadı! UserId: {UserId}. " +
                        "Multi-instance senaryosunda bu kullanıcının token'ları diğer instance'larda geçerli kalabilir.",
                        userId);
                }
            });
        }

        public bool IsRevoked(string userId)
        {
            // Önce cache'e bak
            if (_cache.TryGetValue(CacheKeyPrefix + userId, out _)) return true;

            // Cache'de yoksa DB'ye bak (restart sonrası veya başka instance'dan gelen revocation)
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var isRevoked = db.RevokedUserEntries
                .Any(e => e.UserId == userId && e.ExpiresAt > DateTime.UtcNow);

            if (isRevoked)
            {
                // Sonraki istekler için cache'i yenile (5 dk)
                _cache.Set(CacheKeyPrefix + userId, true, TimeSpan.FromMinutes(5));
            }

            return isRevoked;
        }
    }
}
