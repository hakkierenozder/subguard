using Microsoft.Extensions.Logging;
using SubGuard.Core.Services;
using System.Net.Http.Json;

namespace SubGuard.Service.Services
{
    /// <summary>
    /// Frankfurter API (api.frankfurter.app) üzerinden kur verisi çeken provider.
    /// HttpClient, Program.cs'te Polly retry + circuit breaker politikalarıyla yapılandırılır.
    /// </summary>
    public class FrankfurterExchangeRateProvider : IExchangeRateProvider
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<FrankfurterExchangeRateProvider> _logger;

        public FrankfurterExchangeRateProvider(HttpClient httpClient, ILogger<FrankfurterExchangeRateProvider> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<Dictionary<string, decimal>> FetchRatesAsync(string[] currencies, string baseCurrency = "TRY")
        {
            var rates = new Dictionary<string, decimal>();

            foreach (var currency in currencies)
            {
                var response = await _httpClient.GetFromJsonAsync<FrankfurterResponse>(
                    $"latest?from={currency}&to={baseCurrency}");

                if (response?.Rates?.ContainsKey(baseCurrency) == true)
                {
                    rates[currency] = response.Rates[baseCurrency];
                    _logger.LogDebug("Kur alındı: 1 {Currency} = {Rate} {Base}", currency, rates[currency], baseCurrency);
                }
            }

            return rates;
        }

        private class FrankfurterResponse
        {
            public decimal Amount { get; set; }
            public Dictionary<string, decimal> Rates { get; set; } = new();
        }
    }
}
