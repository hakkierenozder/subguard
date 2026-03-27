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

/**
 * Yıllık abonelikler için bir sonraki ödeme tarihine kaç gün kaldığını hesaplar.
 * Ödeme ayı, abonelik oluşturma tarihi (createdDate) üzerinden belirlenir.
 * billingDay: ayın günü (1-31)
 */
export function getYearlyDaysLeft(billingDay: number, createdDate?: string): number {
  const now = new Date();
  const created = createdDate ? new Date(createdDate) : now;
  const billingMonth = created.getMonth(); // Aboneliğin oluşturulduğu ay
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Bu yılın ödeme tarihi
  const daysInMonth = new Date(now.getFullYear(), billingMonth + 1, 0).getDate();
  const effectiveDay = Math.min(billingDay, daysInMonth);
  let nextDate = new Date(now.getFullYear(), billingMonth, effectiveDay);

  // Ödeme tarihi geçtiyse → gelecek yıl
  if (nextDate <= todayMidnight) {
    const daysInNextYear = new Date(now.getFullYear() + 1, billingMonth + 1, 0).getDate();
    const nextYearDay = Math.min(billingDay, daysInNextYear);
    nextDate = new Date(now.getFullYear() + 1, billingMonth, nextYearDay);
  }

  return Math.round((nextDate.getTime() - todayMidnight.getTime()) / 86400000);
}

/**
 * UserSubscription için doğru getDaysLeft — billingPeriod'u dikkate alır.
 */
export function getDaysLeftForSub(billingDay: number, billingPeriod?: string, createdDate?: string): number {
  if (billingPeriod === 'Yearly') {
    return getYearlyDaysLeft(billingDay, createdDate);
  }
  return getDaysLeft(billingDay);
}
