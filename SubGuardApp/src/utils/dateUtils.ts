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
