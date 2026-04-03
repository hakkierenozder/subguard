import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { UserSubscription } from '../types';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';
import { RootStackParamList } from '../../App';

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 32) / 7); // 16px padding her iki yanda

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Pazartesi başlangıçlı: 0=Pzt, 6=Paz
function getFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay(); // 0=Paz, 1=Pzt, ...
  return (day + 6) % 7;
}

// Yıllık abonelik için ödeme tarihi anchor'ı
function getYearlyAnchor(sub: UserSubscription): Date | null {
  if (sub.contractStartDate) return new Date(sub.contractStartDate);
  if (sub.createdDate) return new Date(sub.createdDate);
  return null;
}

// Özet listede ve sıralamada kullanılacak gün numarası
// Yıllık → anchor.getDate(), diğerleri → billingDay
function getDisplayDay(sub: UserSubscription): number {
  if (sub.billingPeriod === 'Yearly') {
    const anchor = getYearlyAnchor(sub);
    return anchor ? anchor.getDate() : sub.billingDay;
  }
  return sub.billingDay;
}

// Aboneliğin başladığı ay/yılı döndürür
// Öncelik: contractStartDate → createdDate → null (başlangıç tarihi bilinmiyor)
function getSubStartYearMonth(sub: UserSubscription): { year: number; month: number } | null {
  const dateStr = sub.contractStartDate || sub.createdDate;
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth() };
}

// Görüntülenen ay, aboneliğin başladığı ay veya daha sonrası mı?
// false → abonelik o ayda henüz mevcut değildi, takvimde gösterilmemeli
function isViewedMonthOnOrAfterStart(
  sub: UserSubscription,
  viewYear: number,
  viewMonth: number,
): boolean {
  const start = getSubStartYearMonth(sub);
  if (!start) return true; // başlangıç tarihi yoksa her zaman göster (güvenli varsayılan)
  if (viewYear > start.year) return true;
  if (viewYear < start.year) return false;
  return viewMonth >= start.month; // aynı yıl → aya bak
}

export default function CalendarScreen() {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { subscriptions, exchangeRates, fetchUserSubscriptions, loading } = useUserSubscriptionStore();

  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [detailSub, setDetailSub] = useState<UserSubscription | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const loadData = useCallback(async () => {
    await fetchUserSubscriptions();
    setHasAttemptedLoad(true);
  }, [fetchUserSubscriptions]);

  useEffect(() => {
    if (subscriptions.length === 0) {
      loadData();
    } else {
      setHasAttemptedLoad(true);
    }
  }, []);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const isCurrentMonthView =
    currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOffset(currentYear, currentMonth);

  // Seçili günde takvim paneli için scroll hedefi
  const numRows = Math.ceil((firstDayOffset + daysInMonth) / 7);
  const detailScrollY = 16 + 32 + 4 + numRows * (CELL_SIZE + 2); // paddingTop + dayNames + marginBottom + grid

  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.isActive !== false),
    [subscriptions],
  );

  // Görüntülenen aya ait ödemeler:
  // - Önce başlangıç tarihi kontrolü: abonelik o ay henüz mevcut değilse dahil etme
  // - Yıllık: o ayda yıl dönümü olanlar (başlangıç yılı veya sonrası)
  // - Aylık / Haftalık: her ay görünür (başlangıç ayından itibaren)
  const monthSubs = useMemo(() => {
    return activeSubs.filter((sub) => {
      // Abonelik o ayda henüz başlamamışsa gösterme
      if (!isViewedMonthOnOrAfterStart(sub, currentYear, currentMonth)) return false;

      if (sub.billingPeriod === 'Yearly') {
        const anchor = getYearlyAnchor(sub);
        if (!anchor) return false;
        // Yıllık: yalnızca yıl dönümü ayına denk gelen aylarda
        return anchor.getMonth() === currentMonth;
      }
      return true;
    });
  }, [activeSubs, currentYear, currentMonth]);

  const getSubsForDay = (day: number): UserSubscription[] =>
    activeSubs.filter((s) => {
      // Abonelik o ayda henüz başlamamışsa gösterme
      if (!isViewedMonthOnOrAfterStart(s, currentYear, currentMonth)) return false;

      if (s.billingPeriod === 'Yearly') {
        const anchor = getYearlyAnchor(s);
        if (!anchor) return false;
        return anchor.getMonth() === currentMonth && anchor.getDate() === day;
      }
      return s.billingDay === day;
    });

  const monthlyTotal = useMemo(() => {
    // Yalnızca görüntülenen ayda var olan abonelikleri hesaba kat
    return activeSubs
      .filter((sub) => isViewedMonthOnOrAfterStart(sub, currentYear, currentMonth))
      .reduce((total, sub) => {
        const rate = exchangeRates[sub.currency] ?? 1;
        const priceInTry = sub.price * rate;
        const partnerCount = (sub.sharedWith?.length ?? 0) + (sub.sharedGuests?.length ?? 0);
        const monthlyPrice = sub.billingPeriod === 'Yearly'
          ? priceInTry / 12
          : sub.billingPeriod === 'Weekly'
          ? priceInTry * 4.33
          : priceInTry;
        return total + monthlyPrice / (partnerCount + 1);
      }, 0);
  }, [activeSubs, exchangeRates, currentYear, currentMonth]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  // Geçmiş gün tespiti — görüntülenen aya göre
  const isPastDay = (day: number): boolean => {
    if (currentYear < today.getFullYear()) return true;
    if (currentYear > today.getFullYear()) return false;
    if (currentMonth < today.getMonth()) return true;
    if (currentMonth > today.getMonth()) return false;
    return day < today.getDate();
  };

  // Özet listede geçmiş ödeme tespiti
  const getSubIsPast = (sub: UserSubscription): boolean => {
    const day = getDisplayDay(sub);
    if (currentYear < today.getFullYear()) return true;
    if (currentYear > today.getFullYear()) return false;
    if (currentMonth < today.getMonth()) return true;
    if (currentMonth > today.getMonth()) return false;
    return day < today.getDate();
  };

  const handleDayPress = (day: number) => {
    const newDay = day === selectedDay ? null : day;
    setSelectedDay(newDay);
    if (newDay !== null) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: detailScrollY, animated: true });
      }, 80);
    }
  };

  // Boş hücreler + gün hücreleri
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedSubs = selectedDay ? getSubsForDay(selectedDay) : [];

  // Yükleme ve hata durumu
  const isLoading = (loading || !hasAttemptedLoad) && subscriptions.length === 0;
  const showError = !loading && hasAttemptedLoad && subscriptions.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* HEADER */}
      <LinearGradient
        colors={['#4F46E5', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.navBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {MONTHS_TR[currentMonth]} {currentYear}
            </Text>
            <Text style={styles.headerSub}>
              {MONTHS_TR[currentMonth]} Toplam: ₺{monthlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>

            {/* Farklı aydaysa "Bugün" butonu */}
            {!isCurrentMonthView && (
              <TouchableOpacity style={styles.todayBtn} onPress={goToToday}>
                <Ionicons name="today-outline" size={11} color="#FFF" />
                <Text style={styles.todayBtnText}>Bugün</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-forward" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* YÜKLEME */}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.centerStateText, { color: colors.textSec }]}>Abonelikler yükleniyor...</Text>
        </View>
      ) : showError ? (
        /* HATA DURUMU */
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textSec} />
          <Text style={[styles.centerStateText, { color: colors.textSec }]}>Veriler yüklenemedi</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            onPress={loadData}
          >
            <Text style={styles.retryBtnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* GÜN ADLARI SATIRI */}
          <View style={styles.dayNamesRow}>
            {DAYS_TR.map((d) => (
              <View key={d} style={[styles.cell, { height: 32 }]}>
                <Text style={[styles.dayName, { color: colors.textSec }]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* TAKVİM GRID */}
          <View style={styles.grid}>
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.cell} />;
              }

              const subs = getSubsForDay(day);
              const selected = selectedDay === day;
              const todayCell = isToday(day);
              const past = isPastDay(day);

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.cell,
                    selected && [styles.selectedCell, { backgroundColor: colors.accent }],
                    todayCell && !selected && [styles.todayCell, { borderColor: colors.accent }],
                  ]}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayNum,
                      {
                        color: selected
                          ? '#FFF'
                          : todayCell
                          ? colors.accent
                          : past
                          ? colors.textSec
                          : colors.textMain,
                        opacity: past && !selected && !todayCell ? 0.5 : 1,
                      },
                      (selected || todayCell) && { fontWeight: '800' },
                    ]}
                  >
                    {day}
                  </Text>

                  {/* Abonelik renk noktaları */}
                  {subs.length > 0 && (
                    <View style={styles.dotsRow}>
                      {subs.slice(0, 3).map((sub, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            {
                              backgroundColor: selected
                                ? 'rgba(255,255,255,0.9)'
                                : (sub.colorCode || colors.accent),
                              opacity: past && !selected ? 0.45 : 1,
                            },
                          ]}
                        />
                      ))}
                      {subs.length > 3 && (
                        <Text style={[styles.moreDots, { color: selected ? '#FFF' : colors.textSec }]}>
                          +{subs.length - 3}
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SEÇİLİ GÜN DETAYI */}
          {selectedDay !== null && (
            <View style={[styles.detailSection, { borderTopColor: colors.border }]}>
              <View style={styles.detailHeader}>
                <Ionicons name="calendar-outline" size={18} color={colors.accent} />
                <Text style={[styles.detailTitle, { color: colors.textMain }]}>
                  {selectedDay} {MONTHS_TR[currentMonth]}
                  {'  '}
                  <Text style={{ color: colors.textSec, fontWeight: '500', fontSize: 14 }}>
                    {selectedSubs.length === 0
                      ? 'Ödeme yok'
                      : `${selectedSubs.length} ödeme`}
                  </Text>
                </Text>
              </View>

              {selectedSubs.length === 0 ? (
                <View style={[styles.emptyDayCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <Ionicons name="calendar-clear-outline" size={24} color={colors.textSec} />
                  <Text style={[styles.emptyDayText, { color: colors.textSec }]}>
                    Bu gün için planlanmış ödeme yok
                  </Text>
                </View>
              ) : (
                selectedSubs.map((sub) => {
                  const rate = exchangeRates[sub.currency] ?? 1;
                  const priceInTry = sub.price * rate;
                  const partnerCount = (sub.sharedWith?.length ?? 0) + (sub.sharedGuests?.length ?? 0);
                  const myShare = priceInTry / (partnerCount + 1);
                  const isForeign = sub.currency !== 'TRY';

                  return (
                    <TouchableOpacity
                      key={sub.id}
                      style={[styles.subCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                      onPress={() => setDetailSub(sub)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.subColorBar, { backgroundColor: sub.colorCode || colors.accent }]} />
                      <View style={styles.subCardContent}>
                        <Text style={[styles.subName, { color: colors.textMain }]} numberOfLines={1}>
                          {sub.name}
                        </Text>
                        <Text style={[styles.subCategory, { color: colors.textSec }]}>
                          {sub.category}
                          {partnerCount > 0 ? `  •  ${partnerCount + 1} kişi` : ''}
                        </Text>
                      </View>
                      <View style={styles.subPriceCol}>
                        {isForeign ? (
                          <>
                            <Text style={[styles.subPrice, { color: colors.accent }]}>
                              {sub.currency} {sub.price.toFixed(2)}
                            </Text>
                            <Text style={[styles.subPriceTry, { color: colors.textSec }]}>
                              ≈ ₺{myShare.toFixed(2)}
                            </Text>
                          </>
                        ) : (
                          <Text style={[styles.subPrice, { color: colors.accent }]}>
                            ₺{myShare.toFixed(2)}
                          </Text>
                        )}
                        <Ionicons name="chevron-forward" size={14} color={colors.textSec} style={{ marginTop: 2 }} />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* AY ÖDEMELERİ ÖZETİ */}
          <View style={[styles.summarySection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <LinearGradient
              colors={[colors.accent + '12', colors.accent + '05']}
              style={styles.summaryHeader}
            >
              <Ionicons name="list-outline" size={16} color={colors.accent} />
              <Text style={[styles.summaryTitle, { color: colors.textMain }]}>
                {MONTHS_TR[currentMonth]} Ödemeleri
              </Text>
            </LinearGradient>

            {monthSubs.length === 0 ? (
              <View style={[styles.emptyDayCard, { backgroundColor: colors.inputBg, borderColor: colors.border, margin: 12 }]}>
                <Ionicons name="calendar-clear-outline" size={20} color={colors.textSec} />
                <Text style={[styles.emptyDayText, { color: colors.textSec }]}>
                  {activeSubs.length === 0
                    ? 'Aktif abonelik yok.'
                    : 'Bu ay için planlanmış ödeme yok.'}
                </Text>
              </View>
            ) : (
              [...monthSubs]
                .sort((a, b) => getDisplayDay(a) - getDisplayDay(b))
                .map((sub) => {
                  const rate = exchangeRates[sub.currency] ?? 1;
                  const myShare = (sub.price * rate) / ((sub.sharedWith?.length ?? 0) + (sub.sharedGuests?.length ?? 0) + 1);
                  const isPast = getSubIsPast(sub);
                  const displayDay = getDisplayDay(sub);

                  return (
                    <TouchableOpacity
                      key={sub.id}
                      style={[styles.summaryRow, { borderBottomColor: colors.border }]}
                      onPress={() => setDetailSub(sub)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.summaryDot,
                          { backgroundColor: sub.colorCode || colors.accent, opacity: isPast ? 0.4 : 1 },
                        ]}
                      />
                      <Text
                        style={[
                          styles.summaryDay,
                          { color: isPast ? colors.textSec : colors.accent, fontWeight: '700' },
                        ]}
                      >
                        {displayDay}
                      </Text>
                      <Text
                        style={[
                          styles.summaryName,
                          { color: isPast ? colors.textSec : colors.textMain },
                        ]}
                        numberOfLines={1}
                      >
                        {sub.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.summaryPrice, { color: isPast ? colors.textSec : colors.accent }]}>
                          ₺{myShare.toFixed(2)}
                        </Text>
                        <Ionicons name="chevron-forward" size={12} color={colors.textSec} />
                      </View>
                    </TouchableOpacity>
                  );
                })
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ABONELİK DETAY MODALİ */}
      <SubscriptionDetailModal
        visible={!!detailSub}
        subscription={detailSub}
        onClose={() => setDetailSub(null)}
        onEdit={() => setDetailSub(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  todayBtnText: { fontSize: 12, color: '#FFF', fontWeight: '700' },

  // Yükleme / Hata
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  centerStateText: { fontSize: 14 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 4 },
  retryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  // Gün adları
  dayNamesRow: { flexDirection: 'row', marginBottom: 4 },
  dayName: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 2,
  },
  selectedCell: { borderRadius: 12 },
  todayCell: { borderWidth: 1.5, borderRadius: 12 },
  dayNum: { fontSize: 14, fontWeight: '600' },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  moreDots: { fontSize: 10, fontWeight: '700' },

  // Seçili gün detayı
  detailSection: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailTitle: { fontSize: 16, fontWeight: '700' },
  emptyDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyDayText: { fontSize: 14 },

  // Abonelik kartı (detay)
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  subColorBar: { width: 5, alignSelf: 'stretch' },
  subCardContent: { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  subName: { fontSize: 14, fontWeight: '700' },
  subCategory: { fontSize: 12, marginTop: 2 },
  subPriceCol: { paddingRight: 14, alignItems: 'flex-end' },
  subPrice: { fontSize: 14, fontWeight: '700' },
  subPriceTry: { fontSize: 11, marginTop: 2 },

  // Ay ödemeleri özet listesi
  summarySection: {
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  summaryTitle: { fontSize: 15, fontWeight: '800' },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    gap: 10,
  },
  summaryDot: { width: 10, height: 10, borderRadius: 5 },
  summaryDay: { fontSize: 14, width: 24, textAlign: 'center' },
  summaryName: { flex: 1, fontSize: 14 },
  summaryPrice: { fontSize: 14, fontWeight: '700' },
});
