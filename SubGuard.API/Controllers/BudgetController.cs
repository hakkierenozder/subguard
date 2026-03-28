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
    public class BudgetController : CustomBaseController
    {
        private readonly IUserProfileService _profileService;
        private readonly ICategoryBudgetService _categoryBudgetService;
        private string LoggedInUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        public BudgetController(IUserProfileService profileService, ICategoryBudgetService categoryBudgetService)
        {
            _profileService = profileService;
            _categoryBudgetService = categoryBudgetService;
        }

        // PUT api/budget/settings
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] BudgetSettingsDto dto)
        {
            return CreateActionResult(await _profileService.UpdateBudgetAsync(LoggedInUserId, dto));
        }

        // GET api/budget/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            return CreateActionResult(await _categoryBudgetService.GetAllAsync(LoggedInUserId));
        }

        // PUT api/budget/categories
        [HttpPut("categories")]
        public async Task<IActionResult> UpsertCategory([FromBody] UpsertCategoryBudgetDto dto)
        {
            return CreateActionResult(await _categoryBudgetService.UpsertAsync(LoggedInUserId, dto));
        }

        // DELETE api/budget/categories/{category}
        [HttpDelete("categories/{category}")]
        public async Task<IActionResult> DeleteCategory(string category)
        {
            return CreateActionResult(await _categoryBudgetService.DeleteAsync(LoggedInUserId, category));
        }
    }
}
