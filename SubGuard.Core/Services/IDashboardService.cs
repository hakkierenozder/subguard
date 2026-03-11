using SubGuard.Core.DTOs;

namespace SubGuard.Core.Services
{
    public interface IDashboardService
    {
        Task<CustomResponseDto<DashboardDto>> GetDashboardAsync(string userId, int upcomingDays = 30);
    }
}
