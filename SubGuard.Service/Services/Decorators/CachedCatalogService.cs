using Microsoft.Extensions.Caching.Memory;
using SubGuard.Core.Constants;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services.Decorators
{
    public class CachedCatalogService : ICatalogService
    {
        private readonly ICatalogService _innerService;
        private readonly IMemoryCache _memoryCache;

        private const string CATALOGS_KEY = "catalogs_with_plans";

        public CachedCatalogService(ICatalogService innerService, IMemoryCache memoryCache)
        {
            _innerService = innerService;
            _memoryCache = memoryCache;
        }

        private void InvalidateCache()
        {
            _memoryCache.Remove(CATALOGS_KEY);
        }

        public async Task<CustomResponseDto<PagedResponseDto<ServiceDto>>> GetAllCatalogsWithPlansAsync(int page, int pageSize)
        {
            var allCatalogs = await _memoryCache.GetOrCreateAsync(CATALOGS_KEY, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(AppConstants.Cache.CatalogExpirationHours);
                entry.Priority = CacheItemPriority.High;

                var response = await _innerService.GetAllCatalogsWithPlansAsync(1, int.MaxValue);
                if (response.StatusCode != 200 || response.Data == null)
                    return null;

                return response.Data.Items;
            });

            if (allCatalogs == null)
                return CustomResponseDto<PagedResponseDto<ServiceDto>>.Fail(500, "Katalog listesi yüklenemedi.");

            var result = new PagedResponseDto<ServiceDto>
            {
                Items = allCatalogs.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
                TotalCount = allCatalogs.Count,
                Page = page,
                PageSize = pageSize
            };

            return CustomResponseDto<PagedResponseDto<ServiceDto>>.Success(200, result);
        }

        public async Task<CustomResponseDto<ServiceDto>> GetCatalogByIdAsync(int id)
        {
            string key = $"catalog_{id}";

            var cached = await _memoryCache.GetOrCreateAsync(key, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(AppConstants.Cache.CatalogExpirationHours);

                var response = await _innerService.GetCatalogByIdAsync(id);
                return response.StatusCode == 200 ? response.Data : null;
            });

            if (cached == null)
                return await _innerService.GetCatalogByIdAsync(id);

            return CustomResponseDto<ServiceDto>.Success(200, cached);
        }

        // --- Admin yazma işlemleri: cache'i temizle ---

        public async Task<CustomResponseDto<ServiceDto>> CreateCatalogAsync(ServiceDto dto)
        {
            var result = await _innerService.CreateCatalogAsync(dto);
            if (result.StatusCode == 201) InvalidateCache();
            return result;
        }

        public async Task<CustomResponseDto<bool>> UpdateCatalogAsync(int id, ServiceDto dto)
        {
            var result = await _innerService.UpdateCatalogAsync(id, dto);
            if (result.StatusCode == 204)
            {
                InvalidateCache();
                _memoryCache.Remove($"catalog_{id}");
            }
            return result;
        }

        public async Task<CustomResponseDto<bool>> DeleteCatalogAsync(int id)
        {
            var result = await _innerService.DeleteCatalogAsync(id);
            if (result.StatusCode == 204)
            {
                InvalidateCache();
                _memoryCache.Remove($"catalog_{id}");
            }
            return result;
        }

        public async Task<CustomResponseDto<PlanDto>> CreatePlanAsync(int catalogId, PlanDto dto)
        {
            var result = await _innerService.CreatePlanAsync(catalogId, dto);
            if (result.StatusCode == 201)
            {
                InvalidateCache();
                _memoryCache.Remove($"catalog_{catalogId}");
            }
            return result;
        }

        public async Task<CustomResponseDto<bool>> UpdatePlanAsync(int id, PlanDto dto, int? catalogId = null)
        {
            var result = await _innerService.UpdatePlanAsync(id, dto, catalogId);
            if (result.StatusCode == 204)
            {
                InvalidateCache();
                if (catalogId.HasValue)
                    _memoryCache.Remove($"catalog_{catalogId.Value}");
            }
            return result;
        }

        public async Task<CustomResponseDto<bool>> DeletePlanAsync(int id, int? catalogId = null)
        {
            var result = await _innerService.DeletePlanAsync(id, catalogId);
            if (result.StatusCode == 204)
            {
                InvalidateCache();
                if (catalogId.HasValue)
                    _memoryCache.Remove($"catalog_{catalogId.Value}");
            }
            return result;
        }

        // Trending — kısa TTL cache (5 dk)
        public async Task<CustomResponseDto<List<ServiceDto>>> GetTrendingAsync(int limit = 10)
        {
            var key = $"trending:{limit}";
            var cached = await _memoryCache.GetOrCreateAsync(key, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
                return await _innerService.GetTrendingAsync(limit);
            });
            return cached!;
        }
    }
}
