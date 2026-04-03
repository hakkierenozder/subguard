using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SubGuard.Core.DTOs;
using SubGuard.Core.DTOs.Admin;
using SubGuard.Core.Entities;
using SubGuard.Core.Helpers;
using SubGuard.Core.Services;

namespace SubGuard.API.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    [EnableRateLimiting("user-api")]
    [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status403Forbidden)]
    public class AdminController : CustomBaseController
    {
        private readonly ICatalogService _catalogService;
        private readonly IAdminService _adminService;
        private readonly UserManager<AppUser> _userManager;
        private readonly ILogger<AdminController> _logger;

        private string AdminId => User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? "unknown";

        public AdminController(
            ICatalogService catalogService,
            IAdminService adminService,
            UserManager<AppUser> userManager,
            ILogger<AdminController> logger)
        {
            _catalogService = catalogService;
            _adminService = adminService;
            _userManager = userManager;
            _logger = logger;
        }

        // ─── Sistem İstatistikleri ────────────────────────────────

        /// <summary>Sistem geneli özet metrikler.</summary>
        // GET api/admin/stats
        [HttpGet("stats")]
        [ProducesResponseType(typeof(CustomResponseDto<AdminStatsDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStats()
        {
            return CreateActionResult(await _adminService.GetStatsAsync());
        }

        // ─── Kullanıcı Yönetimi ───────────────────────────────────

        /// <summary>Kullanıcıları sayfalı listeler; isteğe bağlı e-posta/ad araması.</summary>
        // GET api/admin/users?search=&page=1&pageSize=20
        [HttpGet("users")]
        [ProducesResponseType(typeof(CustomResponseDto<PagedResponseDto<AdminUserDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool adminsOnly = false)
        {
            return CreateActionResult(await _adminService.GetUsersAsync(search, page, pageSize, adminsOnly));
        }

        /// <summary>Tek kullanıcı detayı.</summary>
        // GET api/admin/users/{id}
        [HttpGet("users/{id}")]
        [ProducesResponseType(typeof(CustomResponseDto<AdminUserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUser(string id)
        {
            _logger.LogWarning("[AUDIT] Admin {AdminId} kullanıcı detayını görüntüledi. TargetUserId: {TargetId}", AdminId, id);
            return CreateActionResult(await _adminService.GetUserDetailAsync(id));
        }

        /// <summary>Kullanıcıyı askıya alır (giriş engellenir).</summary>
        // PATCH api/admin/users/{id}/deactivate
        [HttpPatch("users/{id}/deactivate")]
        [ProducesResponseType(typeof(CustomResponseDto<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Deactivate(string id)
        {
            _logger.LogWarning("[AUDIT] Admin {AdminId} kullanıcıyı askıya aldı. TargetUserId: {TargetId}", AdminId, id);
            return CreateActionResult(await _adminService.DeactivateUserAsync(id, AdminId));
        }

        /// <summary>Kullanıcının askıya alınmasını kaldırır.</summary>
        // PATCH api/admin/users/{id}/activate
        [HttpPatch("users/{id}/activate")]
        [ProducesResponseType(typeof(CustomResponseDto<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Activate(string id)
        {
            _logger.LogWarning("[AUDIT] Admin {AdminId} kullanıcı askıyı kaldırdı. TargetUserId: {TargetId}", AdminId, id);
            return CreateActionResult(await _adminService.ActivateUserAsync(id));
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
            _logger.LogWarning("[AUDIT] Admin {AdminId} yeni katalog oluşturdu. CatalogName: {Name}", AdminId, dto?.Name);
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
            _logger.LogWarning("[AUDIT] Admin {AdminId} katalogu güncelledi. CatalogId: {CatalogId}", AdminId, id);
            return CreateActionResult(await _catalogService.UpdateCatalogAsync(id, dto));
        }

        /// <summary>Bir kataloğu (soft) siler.</summary>
        // DELETE api/admin/catalogs/5
        [HttpDelete("catalogs/{id:int}")]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCatalog(int id)
        {
            _logger.LogWarning("[AUDIT] Admin {AdminId} katalogu sildi. CatalogId: {CatalogId}", AdminId, id);
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
            _logger.LogWarning("[AUDIT] Admin {AdminId} yeni plan oluşturdu. CatalogId: {CatalogId}, PlanName: {Name}", AdminId, catalogId, dto?.Name);
            return CreateActionResult(await _catalogService.CreatePlanAsync(catalogId, dto));
        }

        /// <summary>Mevcut bir planı günceller.</summary>
        // PUT api/admin/plans/10
        [HttpPut("plans/{id:int}")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CustomResponseDto<PlanDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePlan(int id, [FromBody] PlanDto dto, [FromQuery] int? catalogId = null)
        {
            _logger.LogWarning("[AUDIT] Admin {AdminId} planı güncelledi. PlanId: {PlanId}", AdminId, id);
            return CreateActionResult(await _catalogService.UpdatePlanAsync(id, dto, catalogId));
        }

        /// <summary>Bir planı (soft) siler.</summary>
        // DELETE api/admin/plans/10
        [HttpDelete("plans/{id:int}")]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePlan(int id, [FromQuery] int? catalogId = null)
        {
            _logger.LogWarning("[AUDIT] Admin {AdminId} planı sildi. PlanId: {PlanId}", AdminId, id);
            return CreateActionResult(await _catalogService.DeletePlanAsync(id, catalogId));
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

            if (await _userManager.IsInRoleAsync(user, "Admin"))
                return CreateActionResult(CustomResponseDto<bool>.Fail(400, "Kullanıcı zaten Admin rolüne sahip."));

            var result = await _userManager.AddToRoleAsync(user, "Admin");
            if (!result.Succeeded)
                return CreateActionResult(CustomResponseDto<bool>.Fail(400, result.Errors.Select(e => e.Description).ToList()));

            _logger.LogWarning("[AUDIT] Admin {AdminId} kullanıcıya Admin rolü atadı. TargetEmail: {Email}", AdminId, PiiSanitizer.MaskEmail(dto.Email));
            return CreateActionResult(CustomResponseDto<bool>.Success(200, true));
        }

        /// <summary>Belirtilen kullanıcıdan Admin rolünü kaldırır.</summary>
        // POST api/admin/remove-role
        [HttpPost("remove-role")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(CustomResponseDto<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CustomResponseDto<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveAdminRole([FromBody] AssignRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Email))
                return CreateActionResult(CustomResponseDto<bool>.Fail(400, "E-posta adresi gereklidir."));

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return CreateActionResult(CustomResponseDto<bool>.Fail(404, "Kullanıcı bulunamadı."));

            if (!await _userManager.IsInRoleAsync(user, "Admin"))
                return CreateActionResult(CustomResponseDto<bool>.Fail(400, "Kullanıcı Admin rolüne sahip değil."));

            // Kendini Admin'den düşürmeyi engelle
            if (user.Id == AdminId)
                return CreateActionResult(CustomResponseDto<bool>.Fail(400, "Kendi Admin rolünüzü kaldıramazsınız."));

            var result = await _userManager.RemoveFromRoleAsync(user, "Admin");
            if (!result.Succeeded)
                return CreateActionResult(CustomResponseDto<bool>.Fail(400, result.Errors.Select(e => e.Description).ToList()));

            _logger.LogWarning("[AUDIT] Admin {AdminId} kullanıcıdan Admin rolünü kaldırdı. TargetEmail: {Email}", AdminId, PiiSanitizer.MaskEmail(dto.Email));
            return CreateActionResult(CustomResponseDto<bool>.Success(200, true));
        }
    }

}
