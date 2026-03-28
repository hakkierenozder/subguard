using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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

        // GET api/reports/spending?from=2025-01-01T00:00:00%2B03:00&to=2025-12-31T23:59:59%2B03:00
        [HttpGet("spending")]
        public async Task<IActionResult> GetSpending(
            [FromQuery] DateTimeOffset from,
            [FromQuery] DateTimeOffset to)
        {
            return CreateActionResult(await _reportService.GetSpendingReportAsync(
                LoggedInUserId, from.UtcDateTime, to.UtcDateTime));
        }
    }
}
