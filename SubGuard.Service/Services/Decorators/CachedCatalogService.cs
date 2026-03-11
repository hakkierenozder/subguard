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
            if (!_memoryCache.TryGetValue(CATALOGS_KEY, out List<ServiceDto> allCatalogs))
            {
                var response = await _innerService.GetAllCatalogsWithPlansAsync(1, int.MaxValue);

                if (response.StatusCode != 200 || response.Data == null)
                    return response;

                allCatalogs = response.Data.Items;

                _memoryCache.Set(CATALOGS_KEY, allCatalogs, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(AppConstants.Cache.CatalogExpirationHours),
                    Priority = CacheItemPriority.High
                });
            }

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

            if (_memoryCache.TryGetValue(key, out ServiceDto cachedCatalog))
                return CustomResponseDto<ServiceDto>.Success(200, cachedCatalog);

            var response = await _innerService.GetCatalogByIdAsync(id);

            if (response.StatusCode == 200 && response.Data != null)
            {
                _memoryCache.Set(key, response.Data, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(AppConstants.Cache.CatalogExpirationHours)
                });
            }

            return response;
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

        public async Task<CustomResponseDto<bool>> UpdatePlanAsync(int id, PlanDto dto)
        {
            var result = await _innerService.UpdatePlanAsync(id, dto);
            if (result.StatusCode == 204) InvalidateCache();
            return result;
        }

        public async Task<CustomResponseDto<bool>> DeletePlanAsync(int id)
        {
            var result = await _innerService.DeletePlanAsync(id);
            if (result.StatusCode == 204) InvalidateCache();
            return result;
        }
    }
}
