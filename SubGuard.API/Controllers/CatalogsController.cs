using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [EnableRateLimiting("user-api")]
    public class CatalogsController : CustomBaseController
    {
        private readonly ICatalogService _catalogService;

        public CatalogsController(ICatalogService catalogService)
        {
            _catalogService = catalogService;
        }

        // GET api/catalogs
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] PagedRequestDto paged)
        {
            var response = await _catalogService.GetAllCatalogsWithPlansAsync(paged.Page, paged.PageSize);
            return CreateActionResult(response);
        }

        // GET api/catalogs/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _catalogService.GetCatalogByIdAsync(id);
            return CreateActionResult(response);
        }

        // GET api/catalogs/trending?limit=10
        [HttpGet("trending")]
        public async Task<IActionResult> GetTrending([FromQuery] int limit = 10)
        {
            if (limit < 1 || limit > 50) limit = 10;
            return CreateActionResult(await _catalogService.GetTrendingAsync(limit));
        }
    }
}
