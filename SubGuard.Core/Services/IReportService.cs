using SubGuard.Core.DTOs;

namespace SubGuard.Core.Services
{
    public interface IReportService
    {
        Task<CustomResponseDto<SpendingReportDto>> GetSpendingReportAsync(string userId, DateTime from, DateTime to);
    }
}
