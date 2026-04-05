export const SUPPORTED_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = 'TRY';

const SYMBOLS: Record<SupportedCurrency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function isSupportedCurrency(value?: string | null): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes((value ?? '').trim().toUpperCase() as SupportedCurrency);
}

export function normalizeCurrencyCode(value?: string | null): SupportedCurrency {
  const normalized = (value ?? '').trim().toUpperCase();
  return isSupportedCurrency(normalized) ? normalized : DEFAULT_CURRENCY;
}

export function getCurrencySymbol(currency: string) {
  return SYMBOLS[normalizeCurrencyCode(currency)];
}

interface FormatCurrencyOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
}

export function formatCurrencyAmount(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  options?: FormatCurrencyOptions,
): string {
  const normalizedCurrency = normalizeCurrencyCode(currency);
  const minimumFractionDigits = options?.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options?.maximumFractionDigits ?? Math.max(2, minimumFractionDigits);

  try {
    return new Intl.NumberFormat(options?.locale ?? 'tr-TR', {
      style: 'currency',
      currency: normalizedCurrency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(normalizedCurrency)}${amount.toFixed(maximumFractionDigits)}`;
  }
}

export const CurrencyService = {
  format: formatCurrencyAmount,
  getCurrencySymbol,
  normalizeCurrencyCode,
  isSupportedCurrency,
};
