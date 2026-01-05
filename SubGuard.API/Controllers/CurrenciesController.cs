using Microsoft.AspNetCore.Mvc;
using SubGuard.Core.DTOs;
using SubGuard.Core.Services;

namespace SubGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrenciesController : CustomBaseController
    {
        private readonly ICurrencyService _currencyService;

        public CurrenciesController(ICurrencyService currencyService)
        {
            _currencyService = currencyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRates()
        {
            var rates = await _currencyService.GetRatesAsync();
            return CreateActionResult(CustomResponseDto<Dictionary<string, decimal>>.Success(200, rates));
        }
    }
}