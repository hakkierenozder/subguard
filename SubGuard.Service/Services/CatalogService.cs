using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;
using SubGuard.Core.UnitOfWork;

namespace SubGuard.Service.Services
{
    public class CatalogService : ICatalogService
    {
        private readonly IGenericRepository<Catalog> _genericRepository;
        private readonly ICatalogRepository _serviceRepository;
        private readonly IGenericRepository<Plan> _planRepository;
        private readonly IGenericRepository<UserSubscription> _userSubRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CatalogService(
            IGenericRepository<Catalog> genericRepository,
            ICatalogRepository serviceRepository,
            IGenericRepository<Plan> planRepository,
            IGenericRepository<UserSubscription> userSubRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _genericRepository = genericRepository;
            _serviceRepository = serviceRepository;
            _planRepository = planRepository;
            _userSubRepo = userSubRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<CustomResponseDto<PagedResponseDto<ServiceDto>>> GetAllCatalogsWithPlansAsync(int page, int pageSize)
        {
            // #38: Skip/Take artık DB tarafında uygulanıyor — tüm satırlar RAM'e yüklenmiyor.
            var (entities, totalCount) = await _serviceRepository.GetPagedCatalogsWithPlansAsync(page, pageSize);
            var items = _mapper.Map<List<ServiceDto>>(entities);

            var result = new PagedResponseDto<ServiceDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return CustomResponseDto<PagedResponseDto<ServiceDto>>.Success(200, result);
        }

        public async Task<CustomResponseDto<ServiceDto>> GetCatalogByIdAsync(int id)
        {
            var entity = await _serviceRepository.GetByIdAsync(id);

            if (entity == null)
                return CustomResponseDto<ServiceDto>.Fail(404, "Servis bulunamadı.");

            return CustomResponseDto<ServiceDto>.Success(200, _mapper.Map<ServiceDto>(entity));
        }

        // --- Admin: Catalog ---

        public async Task<CustomResponseDto<ServiceDto>> CreateCatalogAsync(ServiceDto dto)
        {
            var entity = _mapper.Map<Catalog>(dto);
            await _genericRepository.AddAsync(entity);
            await _unitOfWork.CommitAsync();
            return CustomResponseDto<ServiceDto>.Success(201, _mapper.Map<ServiceDto>(entity));
        }

        public async Task<CustomResponseDto<bool>> UpdateCatalogAsync(int id, ServiceDto dto)
        {
            var entity = await _genericRepository.GetByIdAsync(id);
            if (entity == null)
                return CustomResponseDto<bool>.Fail(404, "Katalog bulunamadı.");

            entity.Name = dto.Name;
            entity.LogoUrl = dto.LogoUrl;
            entity.ColorCode = dto.ColorCode;
            entity.Category = dto.Category;
            entity.RequiresContract = dto.RequiresContract;

            _genericRepository.Update(entity);
            await _unitOfWork.CommitAsync();
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<bool>> DeleteCatalogAsync(int id)
        {
            var entity = await _genericRepository.GetByIdAsync(id);
            if (entity == null)
                return CustomResponseDto<bool>.Fail(404, "Katalog bulunamadı.");

            _genericRepository.Remove(entity);
            await _unitOfWork.CommitAsync();
            return CustomResponseDto<bool>.Success(204);
        }

        // --- Admin: Plan ---

        public async Task<CustomResponseDto<PlanDto>> CreatePlanAsync(int catalogId, PlanDto dto)
        {
            var catalog = await _genericRepository.GetByIdAsync(catalogId);
            if (catalog == null)
                return CustomResponseDto<PlanDto>.Fail(404, "Katalog bulunamadı.");

            var entity = _mapper.Map<Plan>(dto);
            entity.CatalogId = catalogId;

            await _planRepository.AddAsync(entity);
            await _unitOfWork.CommitAsync();
            return CustomResponseDto<PlanDto>.Success(201, _mapper.Map<PlanDto>(entity));
        }

        public async Task<CustomResponseDto<bool>> UpdatePlanAsync(int id, PlanDto dto)
        {
            var entity = await _planRepository.GetByIdAsync(id);
            if (entity == null)
                return CustomResponseDto<bool>.Fail(404, "Plan bulunamadı.");

            entity.Name = dto.Name;
            entity.Price = dto.Price;
            entity.Currency = dto.Currency;
            entity.BillingCycleDays = dto.BillingCycleDays;

            _planRepository.Update(entity);
            await _unitOfWork.CommitAsync();
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<bool>> DeletePlanAsync(int id)
        {
            var entity = await _planRepository.GetByIdAsync(id);
            if (entity == null)
                return CustomResponseDto<bool>.Fail(404, "Plan bulunamadı.");

            _planRepository.Remove(entity);
            await _unitOfWork.CommitAsync();
            return CustomResponseDto<bool>.Success(204);
        }

        public async Task<CustomResponseDto<List<ServiceDto>>> GetTrendingAsync(int limit = 10)
        {
            // 1. Katalog başına abonelik sayısını DB'de grupla — bu sorgu zaten verimli (DB-side GROUP BY)
            var topCatalogIds = await _userSubRepo
                .Where(x => x.CatalogId.HasValue)
                .GroupBy(x => x.CatalogId!.Value)
                .Select(g => new { CatalogId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(limit)
                .Select(x => x.CatalogId)
                .ToListAsync();

            if (!topCatalogIds.Any())
            {
                // Abonelik yoksa ilk `limit` kataloğu döndür — GetPagedCatalogsWithPlansAsync DB-level
                var (fallbackItems, _) = await _serviceRepository.GetPagedCatalogsWithPlansAsync(1, limit);
                return CustomResponseDto<List<ServiceDto>>.Success(200, _mapper.Map<List<ServiceDto>>(fallbackItems));
            }

            // 2. Sadece ilgili ID'leri sorgula — tüm tabloyu RAM'e yükleme
            var catalogs = await _serviceRepository.GetCatalogsByIdsAsync(topCatalogIds);

            // Popülerlik sıralamasını koru (DB sırası rastgele gelebilir)
            var trending = catalogs
                .OrderBy(c => topCatalogIds.IndexOf(c.Id))
                .ToList();

            return CustomResponseDto<List<ServiceDto>>.Success(200, _mapper.Map<List<ServiceDto>>(trending));
        }
    }
}
