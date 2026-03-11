using SubGuard.Core.DTOs;

namespace SubGuard.Core.Services
{
    public interface ICatalogService
    {
        Task<CustomResponseDto<PagedResponseDto<ServiceDto>>> GetAllCatalogsWithPlansAsync(int page, int pageSize);
        Task<CustomResponseDto<ServiceDto>> GetCatalogByIdAsync(int id);

        // Admin CRUD - Catalog
        Task<CustomResponseDto<ServiceDto>> CreateCatalogAsync(ServiceDto dto);
        Task<CustomResponseDto<bool>> UpdateCatalogAsync(int id, ServiceDto dto);
        Task<CustomResponseDto<bool>> DeleteCatalogAsync(int id);

        // Admin CRUD - Plan
        Task<CustomResponseDto<PlanDto>> CreatePlanAsync(int catalogId, PlanDto dto);
        Task<CustomResponseDto<bool>> UpdatePlanAsync(int id, PlanDto dto);
        Task<CustomResponseDto<bool>> DeletePlanAsync(int id);
    }
}
