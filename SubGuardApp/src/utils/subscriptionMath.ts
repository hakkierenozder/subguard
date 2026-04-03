import { UserSubscription } from '../types';
import { isSubscriptionActiveNow } from './dateUtils';

type SharedSubscriptionFields = Pick<
  UserSubscription,
  'price' | 'currency' | 'billingPeriod' | 'sharedWith' | 'sharedGuests'
>;

export function getBillingPeriodCycleUnitLabel(
  billingPeriod?: UserSubscription['billingPeriod'],
): 'ay' | 'yil' {
  return billingPeriod === 'Yearly' ? 'yil' : 'ay';
}

export function getBillingPeriodDisplayLabel(
  billingPeriod?: UserSubscription['billingPeriod'],
): 'Aylik' | 'Yillik' {
  return billingPeriod === 'Yearly' ? 'Yillik' : 'Aylik';
}

export function getMonthlyEquivalentPrice(price: number, billingPeriod?: UserSubscription['billingPeriod']): number {
  return billingPeriod === 'Yearly' ? price / 12 : price;
}

export function getBilledCyclePrice(price: number, billingPeriod?: UserSubscription['billingPeriod']): number {
  return price;
}

export function getSubscriptionShareDivisor(subscription: Pick<UserSubscription, 'sharedWith' | 'sharedGuests'>): number {
  const partnerCount = (subscription.sharedWith?.length ?? 0) + (subscription.sharedGuests?.length ?? 0);
  return partnerCount + 1;
}

export function getCurrencyRateToTry(
  currency: string,
  exchangeRates: Record<string, number>,
  options?: { unknownRateAsZero?: boolean },
): number {
  if (currency === 'TRY') return 1;
  return exchangeRates[currency] ?? (options?.unknownRateAsZero ? 0 : 1);
}

export function convertAmountBetweenCurrencies(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>,
  options?: { unknownRateAsZero?: boolean },
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = getCurrencyRateToTry(fromCurrency, exchangeRates, options);
  const toRate = getCurrencyRateToTry(toCurrency, exchangeRates, options);

  if (fromRate === 0 || toRate === 0) return 0;

  return (amount * fromRate) / toRate;
}

export function getSubscriptionMonthlyShareInCurrency(
  subscription: SharedSubscriptionFields,
  exchangeRates: Record<string, number>,
  targetCurrency: string,
  options?: { unknownRateAsZero?: boolean },
): number {
  const sharedMonthlyPrice = getSubscriptionMonthlyShare(subscription);

  return convertAmountBetweenCurrencies(
    sharedMonthlyPrice,
    subscription.currency,
    targetCurrency,
    exchangeRates,
    options,
  );
}

export function getSubscriptionCycleShareInCurrency(
  subscription: SharedSubscriptionFields,
  exchangeRates: Record<string, number>,
  targetCurrency: string,
  options?: { unknownRateAsZero?: boolean },
): number {
  const sharedCyclePrice = getSubscriptionCycleShare(subscription);

  return convertAmountBetweenCurrencies(
    sharedCyclePrice,
    subscription.currency,
    targetCurrency,
    exchangeRates,
    options,
  );
}

export function getSubscriptionMonthlyShareInTry(
  subscription: SharedSubscriptionFields,
  exchangeRates: Record<string, number>,
  options?: { unknownRateAsZero?: boolean },
): number {
  return getSubscriptionMonthlyShareInCurrency(subscription, exchangeRates, 'TRY', options);
}

export function getSubscriptionMonthlyShare(subscription: SharedSubscriptionFields): number {
  const monthlyPrice = getMonthlyEquivalentPrice(subscription.price, subscription.billingPeriod);
  return monthlyPrice / getSubscriptionShareDivisor(subscription);
}

export function getSubscriptionCycleShare(subscription: SharedSubscriptionFields): number {
  return getBilledCyclePrice(subscription.price, subscription.billingPeriod)
    / getSubscriptionShareDivisor(subscription);
}

export function getSubscriptionCycleShareInTry(
  subscription: SharedSubscriptionFields,
  exchangeRates: Record<string, number>,
  options?: { unknownRateAsZero?: boolean },
): number {
  return getSubscriptionCycleShareInCurrency(subscription, exchangeRates, 'TRY', options);
}

export interface SubscriptionPortfolioMetrics {
  configuredCount: number;
  startedCount: number;
  pendingCount: number;
  monthlyStartedCount: number;
  yearlyStartedCount: number;
  pendingMonthlyCount: number;
  pendingYearlyCount: number;
  monthlyStartedTotalTRY: number;
  yearlyStartedTotalTRY: number;
  monthlyEquivalentTotalTRY: number;
  pendingMonthlyTotalTRY: number;
  pendingYearlyTotalTRY: number;
  pendingMonthlyEquivalentTRY: number;
}

export function getSubscriptionPortfolioMetrics(
  subscriptions: UserSubscription[],
  exchangeRates: Record<string, number>,
  referenceDate: Date = new Date(),
): SubscriptionPortfolioMetrics {
  const metrics: SubscriptionPortfolioMetrics = {
    configuredCount: 0,
    startedCount: 0,
    pendingCount: 0,
    monthlyStartedCount: 0,
    yearlyStartedCount: 0,
    pendingMonthlyCount: 0,
    pendingYearlyCount: 0,
    monthlyStartedTotalTRY: 0,
    yearlyStartedTotalTRY: 0,
    monthlyEquivalentTotalTRY: 0,
    pendingMonthlyTotalTRY: 0,
    pendingYearlyTotalTRY: 0,
    pendingMonthlyEquivalentTRY: 0,
  };

  subscriptions.forEach((subscription) => {
    if (subscription.isActive === false) return;

    metrics.configuredCount += 1;

    const started = isSubscriptionActiveNow(
      subscription.isActive,
      subscription.firstPaymentDate,
      subscription.contractStartDate,
      referenceDate,
      subscription.createdDate,
    );
    const monthlyEquivalent = getSubscriptionMonthlyShareInTry(subscription, exchangeRates);

    if (started) {
      metrics.startedCount += 1;
      metrics.monthlyEquivalentTotalTRY += monthlyEquivalent;

      if (subscription.billingPeriod === 'Yearly') {
        metrics.yearlyStartedCount += 1;
        metrics.yearlyStartedTotalTRY += getSubscriptionCycleShareInTry(subscription, exchangeRates);
      } else {
        metrics.monthlyStartedCount += 1;
        metrics.monthlyStartedTotalTRY += getSubscriptionCycleShareInTry(subscription, exchangeRates);
      }

      return;
    }

    metrics.pendingCount += 1;
    metrics.pendingMonthlyEquivalentTRY += monthlyEquivalent;

    if (subscription.billingPeriod === 'Yearly') {
      metrics.pendingYearlyCount += 1;
      metrics.pendingYearlyTotalTRY += getSubscriptionCycleShareInTry(subscription, exchangeRates);
    } else {
      metrics.pendingMonthlyCount += 1;
      metrics.pendingMonthlyTotalTRY += getSubscriptionCycleShareInTry(subscription, exchangeRates);
    }
  });

  return metrics;
}
