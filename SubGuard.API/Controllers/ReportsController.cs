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

        // GET api/reports/spending?from=2025-01-01&to=2025-12-31
        [HttpGet("spending")]
        public async Task<IActionResult> GetSpending(
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            return CreateActionResult(await _reportService.GetSpendingReportAsync(LoggedInUserId, from, to));
        }
    }
}
