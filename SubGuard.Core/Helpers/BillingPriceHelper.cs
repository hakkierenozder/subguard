using SubGuard.Core.Enums;

namespace SubGuard.Core.Helpers
{
    /// <summary>
    /// BillingPeriod'a göre aylık fiyat eşdeğerini hesaplar.
    /// Yeni dönem tipleri eklendiğinde sadece bu dosya güncellenir.
    /// </summary>
    public static class BillingPriceHelper
    {
        /// <summary>
        /// Verilen fiyatı aylık eşdeğerine çevirir.
        /// Monthly → price, Yearly → price / 12
        /// </summary>
        public static decimal ToMonthlyEquivalent(decimal price, BillingPeriod period) => period switch
        {
            BillingPeriod.Monthly => price,
            BillingPeriod.Yearly  => price / 12m,
            _                     => price   // Bilinmeyen dönem → olduğu gibi döndür
        };

        /// <summary>
        /// Frankfurter API kurları EUR bazlıdır: 1 EUR = rates[X] X birimi.
        /// Bilinmeyen para birimi için 0 döner — bu kasıtlı bir tasarım kararıdır:
        ///   • 0 döndürmek bilinmeyen kuru toplamdan hariç tutar (1 döndürmek yanlış dönüşüme yol açar).
        ///   • Frontend (ExpenseChart) da aynı kuralı uygulamalı: bilinmeyen kur → grafikten hariç tut.
        ///   • Kur eksikliği _logger ile loglanmalı; bu static sınıfta logger yok,
        ///     çağıran servis tarafında kontrol edilmesi önerilir.
        /// </summary>
        public static decimal ConvertToTargetCurrency(
            decimal amount, string fromCurrency, string toCurrency,
            Dictionary<string, decimal> rates)
        {
            if (fromCurrency == toCurrency) return amount;

            decimal fromRate = fromCurrency == "EUR" ? 1m : rates.GetValueOrDefault(fromCurrency, 0m);
            decimal toRate   = toCurrency   == "EUR" ? 1m : rates.GetValueOrDefault(toCurrency,   0m);

            if (fromRate == 0) return 0; // Bilinmeyen kaynak para birimi → toplamdan hariç tut
            if (toRate   == 0) return 0; // Bilinmeyen hedef para birimi → toplamdan hariç tut (sessiz sıfır önlendi)

            return amount / fromRate * toRate;
        }
    }
}
