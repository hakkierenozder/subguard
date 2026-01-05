using Microsoft.Extensions.Caching.Memory;
using SubGuard.Core.Services;
using System.Net.Http.Json;
using Microsoft.Extensions.Logging;

namespace SubGuard.Service.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<CurrencyService> _logger;
        private const string CACHE_KEY = "ExchangeRates";

        // HttpClient DI container'dan Polly politikalarıyla gelecek
        public CurrencyService(HttpClient httpClient, IMemoryCache memoryCache, ILogger<CurrencyService> logger)
        {
            _httpClient = httpClient;
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task<Dictionary<string, decimal>> GetRatesAsync()
        {
            // Cache'de varsa oradan dön, yoksa güncelle ve dön
            if (!_memoryCache.TryGetValue(CACHE_KEY, out Dictionary<string, decimal> rates))
            {
                await UpdateRatesAsync();
                rates = _memoryCache.Get<Dictionary<string, decimal>>(CACHE_KEY);
            }

            // Eğer servis çalışmazsa fallback (SubGuard varsayılanları)
            return rates ?? new Dictionary<string, decimal>
            {
                { "USD", 34.50m },
                { "EUR", 37.20m },
                { "GBP", 43.10m }
            };
        }

        public async Task UpdateRatesAsync()
        {
            try
            {
                _logger.LogInformation("Güncel kurlar çekiliyor...");

                // Ücretsiz API: Frankfurter (Base: USD yapıp TRY'yi alabiliriz veya tam tersi)
                // Biz TRY bazlı çalışıyoruz, popüler kurların TRY karşılığını bulalım.
                // 1 USD = ? TRY, 1 EUR = ? TRY

                var currencies = new[] { "USD", "EUR", "GBP" };
                var newRates = new Dictionary<string, decimal>();

                foreach (var curr in currencies)
                {
                    // API: https://api.frankfurter.app/latest?from=USD&to=TRY
                    var response = await _httpClient.GetFromJsonAsync<FrankfurterResponse>($"latest?from={curr}&to=TRY");
                    if (response != null && response.Rates.ContainsKey("TRY"))
                    {
                        newRates[curr] = response.Rates["TRY"];
                    }
                }

                if (newRates.Count > 0)
                {
                    // Cache süresi: 24 saat (Bir sonraki Job'a kadar)
                    _memoryCache.Set(CACHE_KEY, newRates, TimeSpan.FromHours(24));
                    _logger.LogInformation("Kurlar güncellendi: {@Rates}", newRates);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kur güncelleme sırasında hata oluştu.");
                throw; // Polly'nin yakalaması için hatayı fırlat
            }
        }

        // API Response Modeli
        private class FrankfurterResponse
        {
            public decimal Amount { get; set; }
            public Dictionary<string, decimal> Rates { get; set; }
        }
    }
}