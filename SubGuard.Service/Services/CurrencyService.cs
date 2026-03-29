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
        private static readonly SemaphoreSlim _rateFetchLock = new SemaphoreSlim(1, 1);

        public CurrencyService(IExchangeRateProvider rateProvider, IMemoryCache memoryCache, ILogger<CurrencyService> logger)
        {
            _rateProvider = rateProvider;
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task<Dictionary<string, decimal>> GetRatesAsync()
        {
            if (_memoryCache.TryGetValue(CACHE_KEY, out Dictionary<string, decimal> rates))
                return rates;

            await _rateFetchLock.WaitAsync();
            try
            {
                // Kilit alındıktan sonra tekrar kontrol et (başka bir istek önce tamamlamış olabilir)
                if (_memoryCache.TryGetValue(CACHE_KEY, out rates))
                    return rates;

                try
                {
                    await UpdateRatesAsync();
                    rates = _memoryCache.Get<Dictionary<string, decimal>>(CACHE_KEY);
                }
                catch (Exception ex)
                {
                    // Polly denemelerinden sonra hâlâ başarısız → varsayılan değerlere dön
                    _logger.LogWarning(ex, "Kur verisi alınamadı, varsayılan (fallback) değerler kullanılıyor.");
                }
            }
            finally
            {
                _rateFetchLock.Release();
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