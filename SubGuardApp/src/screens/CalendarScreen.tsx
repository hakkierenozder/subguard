import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { UserSubscription } from '../types';

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

export default function CalendarScreen() {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const { subscriptions, exchangeRates, fetchUserSubscriptions } = useUserSubscriptionStore();

  useEffect(() => {
    if (subscriptions.length === 0) fetchUserSubscriptions();
  }, []);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOffset(currentYear, currentMonth);

  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.isActive !== false),
    [subscriptions],
  );

  const getSubsForDay = (day: number): UserSubscription[] =>
    activeSubs.filter((s) => {
      if (s.billingPeriod === 'Yearly') {
        const anchor = s.contractStartDate ? new Date(s.contractStartDate) : (s.createdDate ? new Date(s.createdDate) : null);
        if (!anchor) return false;
        return anchor.getMonth() === currentMonth && anchor.getDate() === day;
      }
      if (s.billingPeriod === 'Weekly') {
        return s.billingDay === day;
      }
      return s.billingDay === day;
    });

  const monthlyTotal = useMemo(() => {
    return activeSubs.reduce((total, sub) => {
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
  }, [activeSubs, exchangeRates]);

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

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  // Boş hücreler + gün hücreleri
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedSubs = selectedDay ? getSubsForDay(selectedDay) : [];

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
              Aylık Toplam: ₺{monthlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.cell,
                  selected && [styles.selectedCell, { backgroundColor: colors.accent }],
                  todayCell && !selected && [styles.todayCell, { borderColor: colors.accent }],
                ]}
                onPress={() => setSelectedDay(day === selectedDay ? null : day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNum,
                    { color: selected ? '#FFF' : todayCell ? colors.accent : colors.textMain },
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
                          { backgroundColor: selected ? 'rgba(255,255,255,0.9)' : (sub.colorCode || colors.accent) },
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
                  <View
                    key={sub.id}
                    style={[styles.subCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
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
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Bu ayın tüm ödemelerinin özeti */}
        <View style={[styles.summarySection, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <LinearGradient
            colors={[colors.accent + '12', colors.accent + '05']}
            style={styles.summaryHeader}
          >
            <Ionicons name="list-outline" size={16} color={colors.accent} />
            <Text style={[styles.summaryTitle, { color: colors.textMain }]}>Bu Ay Ödemeler</Text>
          </LinearGradient>
          {activeSubs.length === 0 ? (
            <Text style={[styles.emptyDayText, { color: colors.textSec }]}>Aktif abonelik yok.</Text>
          ) : (
            [...activeSubs]
              .sort((a, b) => a.billingDay - b.billingDay)
              .map((sub) => {
                const rate = exchangeRates[sub.currency] ?? 1;
                const myShare = (sub.price * rate) / ((sub.sharedWith?.length ?? 0) + (sub.sharedGuests?.length ?? 0) + 1);
                const isPast =
                  currentYear === today.getFullYear() &&
                  currentMonth === today.getMonth() &&
                  sub.billingDay < today.getDate();

                return (
                  <View key={sub.id} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
                    <View style={[styles.summaryDot, { backgroundColor: sub.colorCode || colors.accent }]} />
                    <Text
                      style={[
                        styles.summaryDay,
                        { color: isPast ? colors.textSec : colors.accent, fontWeight: '700' },
                      ]}
                    >
                      {sub.billingDay}
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
                    <Text style={[styles.summaryPrice, { color: isPast ? colors.textSec : colors.accent }]}>
                      ₺{myShare.toFixed(2)}
                    </Text>
                  </View>
                );
              })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  moreDots: { fontSize: 8, fontWeight: '700' },

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
  emptyDayCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  emptyDayText: { fontSize: 14 },

  // Abonelik kartı (detay)
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  subColorBar: { width: 5, alignSelf: 'stretch' },
  subCardContent: { flex: 1, paddingVertical: 12, paddingHorizontal: 12 },
  subName: { fontSize: 14, fontWeight: '700' },
  subCategory: { fontSize: 12, marginTop: 2 },
  subPriceCol: { paddingRight: 14, alignItems: 'flex-end' },
  subPrice: { fontSize: 14, fontWeight: '700' },
  subPriceTry: { fontSize: 11, marginTop: 2 },

  // Bu ay özet listesi
  summarySection: {
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 4 },
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
