namespace SubGuard.Core.Services
{
    /// <summary>
    /// Dış kaynaklardan kur verisi çeken provider abstraction'ı.
    /// Varsayılan implementasyon: FrankfurterExchangeRateProvider
    /// </summary>
    public interface IExchangeRateProvider
    {
        /// <summary>
        /// Verilen para birimlerinin, hedef para birimine karşı kurlarını döner.
        /// Örn: currencies=["USD","EUR"], baseCurrency="TRY" → { "USD": 32.5, "EUR": 35.2 }
        /// </summary>
        Task<Dictionary<string, decimal>> FetchRatesAsync(string[] currencies, string baseCurrency = "TRY");
    }
}
