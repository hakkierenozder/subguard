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
 * B-4: Ödeme ayı öncelikle billingMonth (1-12) ile belirlenir; yoksa createdDate.getMonth() kullanılır.
 * billingDay: ayın günü (1-31)
 * billingMonth: backend'den gelen BillingMonth (1-12), null/undefined ise createdDate'e fallback
 */
export function getYearlyDaysLeft(billingDay: number, billingMonth?: number | null, createdDate?: string): number {
  const now = new Date();
  const created = createdDate ? new Date(createdDate) : now;
  // billingMonth (1-12) → JS getMonth() (0-11) dönüşümü; yoksa createdDate.getMonth()
  const anchorMonth = billingMonth != null ? billingMonth - 1 : created.getMonth();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Bu yılın ödeme tarihi
  const daysInMonth = new Date(now.getFullYear(), anchorMonth + 1, 0).getDate();
  const effectiveDay = Math.min(billingDay, daysInMonth);
  let nextDate = new Date(now.getFullYear(), anchorMonth, effectiveDay);

  // Ödeme tarihi geçtiyse → gelecek yıl
  if (nextDate <= todayMidnight) {
    const daysInNextYear = new Date(now.getFullYear() + 1, anchorMonth + 1, 0).getDate();
    const nextYearDay = Math.min(billingDay, daysInNextYear);
    nextDate = new Date(now.getFullYear() + 1, anchorMonth, nextYearDay);
  }

  return Math.round((nextDate.getTime() - todayMidnight.getTime()) / 86400000);
}

/**
 * UserSubscription için doğru getDaysLeft — billingPeriod'u dikkate alır.
 * B-4: billingMonth parametresi yıllık abonelikler için ödeme ayı anchor'u.
 *
 * contractStartDate: İlk ödeme tarihinin tam ISO string'i (yıl dahil).
 * Eğer gelecekte bir tarihse, o tarihe kaç gün kaldığını döndürür.
 * Bu sayede "3 Nisan 2027'de başlayacak" abonelik bugün yaklaşan ödemelerde görünmez.
 */
export function getDaysLeftForSub(
  billingDay: number,
  billingPeriod?: string,
  billingMonth?: number | null,
  createdDate?: string,
  contractStartDate?: string,
): number {
  // İlk ödeme tarihi gelecekteyse → o tarihe kalan gün sayısını döndür
  if (contractStartDate) {
    const start = new Date(contractStartDate);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    if (start > todayMidnight) {
      return Math.round((start.getTime() - todayMidnight.getTime()) / 86400000);
    }
  }

  // Abonelik başlamışsa normal hesaplama
  if (billingPeriod === 'Yearly') {
    return getYearlyDaysLeft(billingDay, billingMonth, createdDate);
  }
  return getDaysLeft(billingDay);
}
