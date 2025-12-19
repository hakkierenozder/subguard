using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.Services;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CatalogsController : CustomBaseController
    {
        private readonly ICatalogService _catalogService;

        public CatalogsController(ICatalogService catalogService)
        {
            _catalogService = catalogService;
        }

        // GET api/catalogs
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Servis katmanına git, veriyi al (Plans dahil)
            var response = await _catalogService.GetAllCatalogsWithPlansAsync();

            // BaseController sayesinde tek satırda dön
            return CreateActionResult(response);
        }

        // GET api/catalogs/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _catalogService.GetCatalogByIdAsync(id);
            return CreateActionResult(response);
        }

    }
}
