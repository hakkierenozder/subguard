// Şimdilik sabit kurlar (İleride API'den çekeceğiz)
const EXCHANGE_RATES: Record<string, number> = {
  TRY: 1,
  USD: 34.50, // Güncel kur örneği
  EUR: 37.20,
  GBP: 43.10
};

// Para birimini TL'ye çevir
export const convertToTRY = (amount: number, currency: string): number => {
  const rate = EXCHANGE_RATES[currency.toUpperCase()] || 1;
  return amount * rate;
};

// Desteklenen para birimleri listesi (Dropdown için)
export const SUPPORTED_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

// Sembol al (Görsellik için)
export const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return '₺';
  }
};