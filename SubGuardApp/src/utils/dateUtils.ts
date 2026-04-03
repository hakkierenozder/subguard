/**
 * Verilen ödeme gününe kaç takvim günü kaldığını hesaplar.
 * Gerçek ay uzunluklarını kullanır (Şubat, 31 günlük ay uç durumları dahil).
 */
export function getDaysLeft(billingDay: number): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  // Bu ayın gerçek gün sayısına klamp (örn. Şubat için 28/29)
  const daysInCurMonth = new Date(year, month + 1, 0).getDate();
  const effectiveDay = Math.min(billingDay, daysInCurMonth);

  if (effectiveDay >= todayDate) {
    return effectiveDay - todayDate;
  }

  // Bu ay geçti → sonraki ayın billing günü
  const nextMonth = (month + 1) % 12;
  const nextYear = month === 11 ? year + 1 : year;
  const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
  const effectiveDayNext = Math.min(billingDay, daysInNextMonth);

  const nextDate = new Date(nextYear, nextMonth, effectiveDayNext);
  const todayMidnight = new Date(year, month, todayDate);
  return Math.round((nextDate.getTime() - todayMidnight.getTime()) / 86400000);
}

const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const formatLocalDateForApi = (date: Date): string => {
  const normalized = normalizeDate(date);
  const year = normalized.getFullYear();
  const month = `${normalized.getMonth() + 1}`.padStart(2, '0');
  const day = `${normalized.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const serializeCalendarDate = (date: Date): string => {
  const normalized = normalizeDate(date);
  return new Date(
    Date.UTC(
      normalized.getFullYear(),
      normalized.getMonth(),
      normalized.getDate(),
      12,
      0,
      0,
      0,
    ),
  ).toISOString();
};

const createBillingDate = (year: number, monthIndex: number, billingDay: number) => {
  const safeDay = Math.min(billingDay, new Date(year, monthIndex + 1, 0).getDate());
  return new Date(year, monthIndex, safeDay);
};

const parseDate = (date?: string | null): Date | null => {
  if (!date) return null;
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : normalizeDate(parsed);
};

export function getSubscriptionStartDate(
  firstPaymentDate?: string | null,
  contractStartDate?: string | null,
  createdDate?: string,
): Date | null {
  return parseDate(firstPaymentDate) ?? parseDate(contractStartDate) ?? parseDate(createdDate);
}

/**
 * Yıllık abonelikler için bir sonraki ödeme tarihine kaç gün kaldığını hesaplar.
 * Ödeme ayı öncelikle billingMonth (1-12) ile belirlenir; yoksa ilk ödeme tarihinin ayı kullanılır.
 * billingDay: ayın günü (1-31)
 * billingMonth: backend'den gelen BillingMonth (1-12), null/undefined ise başlangıç tarihine fallback
 */
export function getYearlyDaysLeft(
  billingDay: number,
  billingMonth?: number | null,
  createdDate?: string,
  firstPaymentDate?: string | null,
  contractStartDate?: string | null,
  referenceDate: Date = new Date(),
): number {
  const nextBilling = getNextBillingDateForSub(
    billingDay,
    'Yearly',
    billingMonth,
    createdDate,
    firstPaymentDate,
    contractStartDate,
    referenceDate,
  );

  return Math.round((nextBilling.getTime() - normalizeDate(referenceDate).getTime()) / 86400000);
}

/**
 * Abonelik ilk ödeme tarihi gelecekte değilse true döner.
 * Varsayılan referans tarih bugündür; istenirse farklı bir gün için de kontrol edilebilir.
 */
export function hasSubscriptionStarted(
  firstPaymentDate?: string | null,
  contractStartDate?: string | null,
  referenceDate: Date = new Date(),
  createdDate?: string,
): boolean {
  const start = getSubscriptionStartDate(firstPaymentDate, contractStartDate, createdDate);
  if (!start) return true;
  return start <= normalizeDate(referenceDate);
}

/**
 * "Bugün bütçeye dahil edilmeli mi?" kuralı:
 * pasif değil + başlangıç tarihi gelmiş olmalı.
 */
export function isSubscriptionActiveNow(
  isActive?: boolean,
  firstPaymentDate?: string | null,
  contractStartDate?: string | null,
  referenceDate: Date = new Date(),
  createdDate?: string,
): boolean {
  return isActive !== false && hasSubscriptionStarted(firstPaymentDate, contractStartDate, referenceDate, createdDate);
}

export function isSubscriptionBillableAtDate(
  isActive: boolean | undefined,
  referenceDate: Date,
  options: {
    firstPaymentDate?: string | null;
    contractStartDate?: string | null;
    createdDate?: string;
    cancelledDate?: string | null;
    pausedDate?: string | null;
  },
): boolean {
  const normalizedReference = normalizeDate(referenceDate);

  if (!hasSubscriptionStarted(
    options.firstPaymentDate,
    options.contractStartDate,
    normalizedReference,
    options.createdDate,
  )) {
    return false;
  }

  const cancelledDate = parseDate(options.cancelledDate);
  if (cancelledDate && cancelledDate < normalizedReference) {
    return false;
  }

  const pausedDate = parseDate(options.pausedDate);
  if (pausedDate && pausedDate < normalizedReference) {
    return false;
  }

  if (isActive === false && !cancelledDate && !pausedDate) {
    return false;
  }

  return true;
}

export function getNextBillingDateForSub(
  billingDay: number,
  billingPeriod?: string,
  billingMonth?: number | null,
  createdDate?: string,
  firstPaymentDate?: string | null,
  contractStartDate?: string | null,
  referenceDate: Date = new Date(),
): Date {
  const reference = normalizeDate(referenceDate);
  const startDate = getSubscriptionStartDate(firstPaymentDate, contractStartDate, createdDate) ?? reference;

  if (startDate > reference) {
    return startDate;
  }

  if (billingPeriod === 'Yearly') {
    const anchorMonthIndex = billingMonth != null ? billingMonth - 1 : startDate.getMonth();
    let candidate = createBillingDate(reference.getFullYear(), anchorMonthIndex, billingDay);

    if (candidate < reference) {
      candidate = createBillingDate(reference.getFullYear() + 1, anchorMonthIndex, billingDay);
    }

    while (candidate < startDate) {
      candidate = createBillingDate(candidate.getFullYear() + 1, anchorMonthIndex, billingDay);
    }

    return candidate;
  }

  let candidate = createBillingDate(reference.getFullYear(), reference.getMonth(), billingDay);
  if (candidate < reference) {
    candidate = createBillingDate(reference.getFullYear(), reference.getMonth() + 1, billingDay);
  }

  while (candidate < startDate) {
    candidate = createBillingDate(candidate.getFullYear(), candidate.getMonth() + 1, billingDay);
  }

  return candidate;
}

/**
 * UserSubscription için doğru getDaysLeft — billingPeriod'u dikkate alır.
 * billingMonth parametresi yıllık abonelikler için ödeme ayı anchor'u.
 * Eğer gelecekte bir ilk ödeme tarihi varsa, o tarihe kaç gün kaldığını döndürür.
 * Bu sayede "3 Nisan 2027'de başlayacak" abonelik bugün yaklaşan ödemelerde görünmez.
 */
export function getDaysLeftForSub(
  billingDay: number,
  billingPeriod?: string,
  billingMonth?: number | null,
  createdDate?: string,
  firstPaymentDate?: string | null,
  contractStartDate?: string | null,
): number {
  const nextBilling = getNextBillingDateForSub(
    billingDay,
    billingPeriod,
    billingMonth,
    createdDate,
    firstPaymentDate,
    contractStartDate,
  );

  return Math.round((nextBilling.getTime() - normalizeDate(new Date()).getTime()) / 86400000);
}
