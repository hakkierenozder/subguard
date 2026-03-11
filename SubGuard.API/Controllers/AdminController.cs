using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs;
using SubGuard.Core.Entities;
using SubGuard.Core.Services;

namespace SubGuard.API.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : CustomBaseController
    {
        private readonly ICatalogService _catalogService;
        private readonly UserManager<AppUser> _userManager;

        public AdminController(ICatalogService catalogService, UserManager<AppUser> userManager)
        {
            _catalogService = catalogService;
            _userManager = userManager;
        }

        // ─── Catalog CRUD ─────────────────────────────────────────

        // POST api/admin/catalogs
        [HttpPost("catalogs")]
        public async Task<IActionResult> CreateCatalog([FromBody] ServiceDto dto)
        {
            return CreateActionResult(await _catalogService.CreateCatalogAsync(dto));
        }

        // PUT api/admin/catalogs/5
        [HttpPut("catalogs/{id}")]
        public async Task<IActionResult> UpdateCatalog(int id, [FromBody] ServiceDto dto)
        {
            return CreateActionResult(await _catalogService.UpdateCatalogAsync(id, dto));
        }

        // DELETE api/admin/catalogs/5
        [HttpDelete("catalogs/{id}")]
        public async Task<IActionResult> DeleteCatalog(int id)
        {
            return CreateActionResult(await _catalogService.DeleteCatalogAsync(id));
        }

        // ─── Plan CRUD ────────────────────────────────────────────

        // POST api/admin/catalogs/5/plans
        [HttpPost("catalogs/{catalogId}/plans")]
        public async Task<IActionResult> CreatePlan(int catalogId, [FromBody] PlanDto dto)
        {
            return CreateActionResult(await _catalogService.CreatePlanAsync(catalogId, dto));
        }

        // PUT api/admin/plans/10
        [HttpPut("plans/{id}")]
        public async Task<IActionResult> UpdatePlan(int id, [FromBody] PlanDto dto)
        {
            return CreateActionResult(await _catalogService.UpdatePlanAsync(id, dto));
        }

        // DELETE api/admin/plans/10
        [HttpDelete("plans/{id}")]
        public async Task<IActionResult> DeletePlan(int id)
        {
            return CreateActionResult(await _catalogService.DeletePlanAsync(id));
        }

        // ─── Role Management ──────────────────────────────────────

        // POST api/admin/assign-role
        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignAdminRole([FromBody] AssignRoleDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return CreateActionResult(CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı."));

            var result = await _userManager.AddToRoleAsync(user, "Admin");
            if (!result.Succeeded)
                return CreateActionResult(CustomResponseDto<bool>.Fail(400, result.Errors.Select(e => e.Description).ToList()));

            return CreateActionResult(CustomResponseDto<bool>.Success(200, true));
        }
    }

    public class AssignRoleDto
    {
        public string Email { get; set; }
    }
}
