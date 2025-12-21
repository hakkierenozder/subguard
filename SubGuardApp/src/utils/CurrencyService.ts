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

// Servis objesi olarak export et (Hatanın çözümü)
export const CurrencyService = {
  format: (amount: number, currency: string = 'TRY'): string => {
    const symbol = getCurrencySymbol(currency);
    // İsteğe bağlı: Intl.NumberFormat kullanılabilir ama React Native Android'de 
    // bazen polyfill gerektirdiği için şimdilik manuel formatlama daha güvenli.
    return `${symbol}${amount.toFixed(2)}`;
  },
  convertToTRY,
  getCurrencySymbol
};