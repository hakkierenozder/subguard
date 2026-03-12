using System.ComponentModel.DataAnnotations;
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
    [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status403Forbidden)]
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

        /// <summary>Yeni bir katalog (servis) oluşturur.</summary>
        // POST api/admin/catalogs
        [HttpPost("catalogs")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CustomResponseDto<ServiceDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCatalog([FromBody] ServiceDto dto)
        {
            return CreateActionResult(await _catalogService.CreateCatalogAsync(dto));
        }

        /// <summary>Mevcut bir kataloğu günceller.</summary>
        // PUT api/admin/catalogs/5
        [HttpPut("catalogs/{id:int}")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CustomResponseDto<ServiceDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCatalog(int id, [FromBody] ServiceDto dto)
        {
            return CreateActionResult(await _catalogService.UpdateCatalogAsync(id, dto));
        }

        /// <summary>Bir kataloğu (soft) siler.</summary>
        // DELETE api/admin/catalogs/5
        [HttpDelete("catalogs/{id:int}")]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCatalog(int id)
        {
            return CreateActionResult(await _catalogService.DeleteCatalogAsync(id));
        }

        // ─── Plan CRUD ────────────────────────────────────────────

        /// <summary>Bir kataloğa yeni plan ekler.</summary>
        // POST api/admin/catalogs/5/plans
        [HttpPost("catalogs/{catalogId:int}/plans")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CustomResponseDto<PlanDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreatePlan(int catalogId, [FromBody] PlanDto dto)
        {
            return CreateActionResult(await _catalogService.CreatePlanAsync(catalogId, dto));
        }

        /// <summary>Mevcut bir planı günceller.</summary>
        // PUT api/admin/plans/10
        [HttpPut("plans/{id:int}")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CustomResponseDto<PlanDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePlan(int id, [FromBody] PlanDto dto)
        {
            return CreateActionResult(await _catalogService.UpdatePlanAsync(id, dto));
        }

        /// <summary>Bir planı (soft) siler.</summary>
        // DELETE api/admin/plans/10
        [HttpDelete("plans/{id:int}")]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePlan(int id)
        {
            return CreateActionResult(await _catalogService.DeletePlanAsync(id));
        }

        // ─── Role Management ──────────────────────────────────────

        /// <summary>Belirtilen kullanıcıya Admin rolü atar.</summary>
        // POST api/admin/assign-role
        [HttpPost("assign-role")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CustomResponseDto<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AssignAdminRole([FromBody] AssignRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Email))
                return CreateActionResult(CustomResponseDto<bool>.Fail(400, "E-posta adresi gereklidir."));

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
        [Required(ErrorMessage = "E-posta adresi boş bırakılamaz.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        [MaxLength(256)]
        public string Email { get; set; }
    }
}
