using Microsoft.Extensions.Caching.Memory;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services.Decorators
{
    public class CachedCatalogService : ICatalogService
    {
        private readonly ICatalogService _innerService;
        private readonly IMemoryCache _memoryCache;

        // Cache Key'leri sabit ve yönetilebilir olmalı
        private const string CATALOGS_KEY = "catalogs_with_plans";

        public CachedCatalogService(ICatalogService innerService, IMemoryCache memoryCache)
        {
            _innerService = innerService;
            _memoryCache = memoryCache;
        }

        public async Task<CustomResponseDto<List<ServiceDto>>> GetAllCatalogsWithPlansAsync()
        {
            // Cache kontrolü
            if (_memoryCache.TryGetValue(CATALOGS_KEY, out List<ServiceDto> cachedCatalogs))
            {
                // Cache'den geldiğini loglayabilirsin (Opsiyonel)
                return CustomResponseDto<List<ServiceDto>>.Success(200, cachedCatalogs);
            }

            // Cache'de yoksa asıl servise git
            var response = await _innerService.GetAllCatalogsWithPlansAsync();

            // Sadece başarılı cevapları cache'le
            if (response.StatusCode == 200 && response.Data != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    // Catalog verisi nadir değişir, ömrü uzun tutabiliriz (örn: 24 saat)
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
                    // Bellek baskısı olursa öncelikli silinmesin
                    Priority = CacheItemPriority.High
                };

                _memoryCache.Set(CATALOGS_KEY, response.Data, cacheOptions);
            }

            return response;
        }

        public async Task<CustomResponseDto<ServiceDto>> GetCatalogByIdAsync(int id)
        {
            // Tekil çekimlerde genellikle Full List cache'inden süzmek daha performanslıdır
            // Ancak şimdilik basit tutup ID bazlı cache yapabiliriz veya direkt DB'ye sorabiliriz.
            // Catalog detayları çok sık çağrılmıyorsa cache gerekmeyebilir.
            // Tutarlılık için burada da cache kullanıyorum:

            string key = $"catalog_{id}";

            if (_memoryCache.TryGetValue(key, out ServiceDto cachedCatalog))
            {
                return CustomResponseDto<ServiceDto>.Success(200, cachedCatalog);
            }

            var response = await _innerService.GetCatalogByIdAsync(id);

            if (response.StatusCode == 200 && response.Data != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
                };
                _memoryCache.Set(key, response.Data, cacheOptions);
            }

            return response;
        }
    }
}