using SubGuard.Core.DTOs;

namespace SubGuard.Core.Services
{
    public interface ICategoryBudgetService
    {
        Task<CustomResponseDto<List<CategoryBudgetDto>>> GetAllAsync(string userId);
        Task<CustomResponseDto<CategoryBudgetDto>> UpsertAsync(string userId, UpsertCategoryBudgetDto dto);
        Task<CustomResponseDto<bool>> DeleteAsync(string userId, string category);
    }
}
