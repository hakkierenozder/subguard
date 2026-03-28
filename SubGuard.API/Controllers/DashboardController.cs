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
    public class DashboardController : CustomBaseController
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        private string LoggedInUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET api/dashboard
        // GET api/dashboard?upcomingDays=7
        [EnableRateLimiting("user-api")]
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int upcomingDays = 30)
        {
            return CreateActionResult(await _dashboardService.GetDashboardAsync(LoggedInUserId, upcomingDays));
        }
    }
}
