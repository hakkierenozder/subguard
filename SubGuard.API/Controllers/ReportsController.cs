using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;
using System.Security.Claims;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [EnableRateLimiting("user-api")]
    public class ReportsController : CustomBaseController
    {
        private readonly IReportService _reportService;
        private string LoggedInUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        // GET api/reports/spending?from=2025-01-01&to=2025-12-31
        [HttpGet("spending")]
        public async Task<IActionResult> GetSpending(
            [FromQuery] string from,
            [FromQuery] string to)
        {
            if (!DateOnly.TryParse(from, out var fromDate) || !DateOnly.TryParse(to, out var toDate))
            {
                return CreateActionResult(CustomResponseDto<SpendingReportDto>.Fail(
                    400,
                    "Geçerli bir tarih aralığı gönderin. Beklenen format: YYYY-MM-DD."));
            }

            return CreateActionResult(await _reportService.GetSpendingReportAsync(
                LoggedInUserId,
                DateTime.SpecifyKind(fromDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc),
                DateTime.SpecifyKind(toDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc)));
        }
    }
}
