using Microsoft.Extensions.Caching.Memory;
using SubGuard.Core.Constants;
using SubGuard.Core.Services;
using Microsoft.Extensions.Logging;

namespace SubGuard.Service.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly IExchangeRateProvider _rateProvider;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<CurrencyService> _logger;
        private const string CACHE_KEY = "ExchangeRates";

        public CurrencyService(IExchangeRateProvider rateProvider, IMemoryCache memoryCache, ILogger<CurrencyService> logger)
        {
            _rateProvider = rateProvider;
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task<Dictionary<string, decimal>> GetRatesAsync()
        {
            if (!_memoryCache.TryGetValue(CACHE_KEY, out Dictionary<string, decimal> rates))
            {
                await UpdateRatesAsync();
                rates = _memoryCache.Get<Dictionary<string, decimal>>(CACHE_KEY);
            }

            return rates ?? new Dictionary<string, decimal>
            {
                { "USD", AppConstants.Currency.FallbackUsd },
                { "EUR", AppConstants.Currency.FallbackEur },
                { "GBP", AppConstants.Currency.FallbackGbp }
            };
        }

        public async Task UpdateRatesAsync()
        {
            try
            {
                _logger.LogInformation("Güncel kurlar çekiliyor...");

                var newRates = await _rateProvider.FetchRatesAsync(new[] { "USD", "EUR", "GBP" }, "TRY");

                if (newRates.Count > 0)
                {
                    _memoryCache.Set(CACHE_KEY, newRates, TimeSpan.FromHours(AppConstants.Cache.CurrencyRatesExpirationHours));
                    _logger.LogInformation("Kurlar güncellendi: {@Rates}", newRates);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kur güncelleme sırasında hata oluştu.");
                throw; // Polly'nin yakalaması için hatayı fırlat
            }
        }
    }
}