using AutoMapper;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Repositories;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    public class CatalogService : ICatalogService
    {
        private readonly IGenericRepository<Catalog> _genericRepository;
        private readonly ICatalogRepository _serviceRepository; // Özel metodumuz buradaydı
        private readonly IMapper _mapper;

        public CatalogService(IGenericRepository<Catalog> genericRepository, ICatalogRepository serviceRepository, IMapper mapper)
        {
            _genericRepository = genericRepository;
            _serviceRepository = serviceRepository;
            _mapper = mapper;
        }

        public async Task<CustomResponseDto<List<ServiceDto>>> GetAllCatalogsWithPlansAsync()
        {
            // 1. Veriyi çek (Include Plans yapılmış hali)
            var entities = await _serviceRepository.GetAllCatalogsWithPlansAsync();

            // 2. Entity -> DTO Çevrimi
            var dtos = _mapper.Map<List<ServiceDto>>(entities);

            // 3. Paketle ve Dön
            return CustomResponseDto<List<ServiceDto>>.Success(200, dtos);
        }

        public async Task<CustomResponseDto<ServiceDto>> GetCatalogByIdAsync(int id)
        {
            var entity = await _serviceRepository.GetByIdAsync(id);

            if (entity == null)
            {
                return CustomResponseDto<ServiceDto>.Fail(404, "Servis bulunamadı.");
            }

            var dto = _mapper.Map<ServiceDto>(entity);
            return CustomResponseDto<ServiceDto>.Success(200, dto);
        }
    }
}
