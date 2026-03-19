using Microsoft.Extensions.Caching.Memory;
using SubGuard.Core.Constants;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    public class InMemoryRevokedUserStore : IRevokedUserStore
    {
        private readonly IMemoryCache _cache;

        public InMemoryRevokedUserStore(IMemoryCache cache) => _cache = cache;

        public void Revoke(string userId) =>
            _cache.Set($"revoked_user:{userId}", true,
                TimeSpan.FromMinutes(AppConstants.Token.AccessTokenExpirationMinutes + 1));

        public bool IsRevoked(string userId) =>
            _cache.TryGetValue($"revoked_user:{userId}", out _);
    }
}
