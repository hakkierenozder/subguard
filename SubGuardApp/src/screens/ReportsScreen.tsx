import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Share, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../constants/theme';
import { CATEGORY_COLORS } from '../components/ExpenseChart';
import agent from '../api/agent';

const screenWidth = Dimensions.get('window').width;

const FALLBACK_COLORS = ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00B894', '#E17055', '#74B9FF'];

export default function ReportsScreen({ embedded = false }: { embedded?: boolean }) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const { subscriptions, getTotalExpense, exchangeRates, fetchUserSubscriptions } = useUserSubscriptionStore();
  const totalMonthlyExpense = getTotalExpense();

  useEffect(() => {
    if (subscriptions.length === 0) fetchUserSubscriptions();
  }, []);

  // Seçili kategori (detay için)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // --- DÖNEM FİLTRESİ ---
  type Period = 'this_month' | 'last_3_months' | 'this_year';
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [periodData, setPeriodData] = useState<{ totalSpending?: number; currency?: string } | null>(null);
  const [periodLoading, setPeriodLoading] = useState(false);

  const periodRanges: Record<Period, { label: string; from: () => string; to: () => string }> = {
    this_month: {
      label: 'Bu Ay',
      from: () => {
        const d = new Date(); d.setDate(1);
        return d.toISOString().slice(0, 10);
      },
      to: () => new Date().toISOString().slice(0, 10),
    },
    last_3_months: {
      label: 'Son 3 Ay',
      from: () => {
        const d = new Date(); d.setMonth(d.getMonth() - 3); d.setDate(1);
        return d.toISOString().slice(0, 10);
      },
      to: () => new Date().toISOString().slice(0, 10),
    },
    this_year: {
      label: 'Bu Yıl',
      from: () => `${new Date().getFullYear()}-01-01`,
      to: () => new Date().toISOString().slice(0, 10),
    },
  };

  useEffect(() => {
    if (!selectedPeriod) { setPeriodData(null); return; }
    const range = periodRanges[selectedPeriod];
    setPeriodLoading(true);
    agent.Reports.spending(range.from(), range.to())
      .then((res: any) => {
        if (res?.data) setPeriodData(res.data);
        else setPeriodData(null);
      })
      .catch(() => setPeriodData(null))
      .finally(() => setPeriodLoading(false));
  }, [selectedPeriod]);

  const handleCategoryPress = (cat: string) => {
    setSelectedCategory(prev => (prev === cat ? null : cat));
  };

  // Dönemsel Kategori Kırılımı — seçili period için subscription store'dan hesapla
  const periodBreakdown = useMemo(() => {
    if (!selectedPeriod) return [];
    const range = periodRanges[selectedPeriod];
    const fromMs = new Date(range.from()).getTime();
    const toMs   = new Date(range.to()).getTime() + 86400000;
    const catMap: Record<string, { total: number; count: number }> = {};
    subscriptions.forEach(sub => {
      const created = sub.createdDate ? new Date(sub.createdDate).getTime() : 0;
      if (created > toMs) return;
      const cancelled = sub.cancelledDate || sub.cancelledAt;
      if (cancelled && new Date(cancelled).getTime() < fromMs) return;
      const rate = exchangeRates[sub.currency] || 1;
      const myShare = (sub.price * rate) / ((sub.sharedWith?.length || 0) + 1);
      const cat = sub.category || 'Diğer';
      if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 };
      catMap[cat].total += myShare;
      catMap[cat].count++;
    });
    return Object.entries(catMap).map(([category, val]) => ({ category, ...val })).sort((a, b) => b.total - a.total);
  }, [selectedPeriod, subscriptions, exchangeRates]);

  // --- İSTATİSTİKLER ---
  const activeSubsCount = subscriptions.filter(s => s.isActive !== false).length;
  const passiveSubsCount = subscriptions.filter(s => s.isActive === false).length;

  // --- KATEGORİ ANALİZİ ---
  const statistics = useMemo(() => {
    const categoryStats: Record<string, number> = {};
    let maxCategorySpend = 0;

    subscriptions.forEach(sub => {
      if (sub.isActive === false) return;
      const rate = exchangeRates[sub.currency] || 1;
      const amountInTRY = sub.price * rate;
      const partnerCount = sub.sharedWith?.length || 0;
      const myShare = amountInTRY / (partnerCount + 1);
      const catName = sub.category || 'Diğer';
      if (!categoryStats[catName]) categoryStats[catName] = 0;
      categoryStats[catName] += myShare;
    });

    Object.values(categoryStats).forEach(val => {
      if (val > maxCategorySpend) maxCategorySpend = val;
    });

    const sortedCategories = Object.keys(categoryStats)
      .map((key, i) => ({
        name: key,
        total: categoryStats[key],
        percentage: totalMonthlyExpense > 0 ? (categoryStats[key] / totalMonthlyExpense) * 100 : 0,
        barWidth: maxCategorySpend > 0 ? (categoryStats[key] / maxCategorySpend) * 100 : 0,
        color: CATEGORY_COLORS[key] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.total - a.total);

    return { sortedCategories };
  }, [subscriptions, totalMonthlyExpense, exchangeRates]);

  // Seçili kategorideki abonelikler
  const categorySubscriptions = useMemo(() => {
    if (!selectedCategory) return [];
    return subscriptions.filter(
      s => (s.category || 'Diğer') === selectedCategory
    );
  }, [selectedCategory, subscriptions]);

  // --- TREND GRAFİĞİ (Son 6 ay) — Fix #14 ---
  // Her geçmiş ay için aboneliklerin o ayda aktif olup olmadığını doğru hesapla:
  //   • createdDate bu ayın sonundan sonraysa henüz yoktu → dışla
  //   • cancelledDate / cancelledAt bu ayın BAŞINDAN önce ise zaten iptalse → dışla
  //   (ayın ortasında iptal edilen abonelik o ay için sayılır)
  const trendData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      // UTC sınırlarını kullan — backend ISO tarihlerini (UTC) yerel zamanla
      // karşılaştırırken gece yarısı sınırında yanlış aya düşmesin (Fix 19)
      const monthStart = Date.UTC(d.getFullYear(), d.getMonth(), 1);
      const monthEnd   = Date.UTC(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      labels.push(d.toLocaleDateString('tr-TR', { month: 'short' }));

      const monthTotal = subscriptions
        .filter(s => {
          // Bu aydan sonra oluşturulmuşsa o ayda yoktu
          if (s.createdDate && new Date(s.createdDate).getTime() > monthEnd) return false;
          // Bu ayın başından önce iptal edildiyse o ayda yoktu
          const cancelDate = s.cancelledDate || s.cancelledAt;
          if (cancelDate && new Date(cancelDate).getTime() < monthStart) return false;
          return true;
        })
        .reduce((sum, s) => {
          const rate = exchangeRates[s.currency] || 1;
          const amountInTry = s.price * rate;
          const partnerCount = s.sharedWith?.length || 0;
          return sum + amountInTry / (partnerCount + 1);
        }, 0);

      data.push(parseFloat(monthTotal.toFixed(0)));
    }

    return { labels, data };
  }, [subscriptions, exchangeRates]);

  // --- YILLIK PROJEKSİYON — Fix #15 ---
  // totalMonthlyExpense * 12 yerine her abonelik için kalan ödeme aylarını hesapla:
  //   • Yıllık abonelik (Yearly): bu yıl içinde bir kez ödenir
  //   • Aylık abonelik: bu aydan yıl sonuna kadar kalan ay sayısı × aylık tutar
  //   • contractEndDate varsa sözleşme bitince dahil edilmez
  //   • Pasif / iptal abonelikler sayılmaz
  const yearlyProjection = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-tabanlı

    return subscriptions
      .filter(s => s.isActive !== false && s.status !== 'Cancelled' && s.status !== 'Paused')
      .reduce((total, s) => {
        const rate = exchangeRates[s.currency] || 1;
        const amountInTry = s.price * rate;
        const partnerCount = s.sharedWith?.length || 0;
        const myShare = amountInTry / (partnerCount + 1);

        if (s.billingPeriod === 'Yearly') {
          // Yıllık: bu yıl için tek seferlik ödeme
          total += myShare;
        } else {
          // Aylık: bu ay dahil yıl sonuna kadar kaç ay kaldı?
          let remainingMonths = 12 - currentMonth;

          if (s.contractEndDate) {
            const contractEnd = new Date(s.contractEndDate);
            if (contractEnd < now) return total; // Sözleşme zaten sona erdi
            const monthsUntilEnd =
              (contractEnd.getFullYear() - currentYear) * 12 +
              contractEnd.getMonth() - currentMonth + 1;
            remainingMonths = Math.min(remainingMonths, Math.max(0, monthsUntilEnd));
          }

          total += myShare * remainingMonths;
        }
        return total;
      }, 0);
  }, [subscriptions, exchangeRates]);

  const trendChartConfig = {
    backgroundColor: colors.cardBg,
    backgroundGradientFrom: colors.cardBg,
    backgroundGradientTo: colors.cardBg,
    fillShadowGradientFrom: colors.primary,
    fillShadowGradientTo: colors.primary,
    fillShadowGradientOpacity: 0.85,
    color: () => colors.primary,
    labelColor: () => colors.textSec,
    barPercentage: 0.55,
    decimalPlaces: 0,
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 11,
    },
  };

  // --- CSV DIŞA AKTAR — Fix #16 ---
  // Metin paylaşımı yerine gerçek CSV dosyası oluşturur ve paylaşım sayfasını açar.
  // iOS: Files uygulamasına kaydetme, Numbers/Excel'de açma seçeneği sunar.
  // Android: Download klasörüne kaydetme veya uygulama seçimi sunar.
  const handleExport = async () => {
    try {
      const dateStr = new Date().toISOString().slice(0, 10);

      // — Özet sayfası satırları —
      const summaryRows = [
        ['SubGuard Harcama Raporu', ''],
        ['Rapor Tarihi', dateStr],
        ['Aylık Toplam (₺)', totalMonthlyExpense.toFixed(2)],
        ['Yıllık Projeksiyon (₺)', yearlyProjection.toFixed(2)],
        ['Aktif Abonelik', String(activeSubsCount)],
        ['Pasif Abonelik', String(passiveSubsCount)],
        ['', ''],
        ['Kategori', 'Tutar (₺)', 'Oran (%)'],
        ...statistics.sortedCategories.map(c => [
          c.name,
          c.total.toFixed(2),
          c.percentage.toFixed(1),
        ]),
        ['', '', ''],
        ['Abonelik Adı', 'Kategori', 'Fiyat', 'Para Birimi', 'Dönem', 'Durum'],
        ...subscriptions.map(s => [
          `"${s.name.replace(/"/g, '""')}"`,
          `"${(s.category || 'Diğer').replace(/"/g, '""')}"`,
          String(s.price),
          s.currency,
          s.billingPeriod === 'Yearly' ? 'Yıllık' : 'Aylık',
          s.status || (s.isActive ? 'Aktif' : 'Pasif'),
        ]),
      ];

      const csvContent = summaryRows.map(row => row.join(',')).join('\n');
      const fileName = `subguard-rapor-${dateStr}.csv`;

      // expo-file-system v19 class tabanlı API (Paths.document / Paths.cache)
      // Paths.document yoksa Paths.cache'e, o da yoksa Share ile metin paylaşımına düş.
      const dir = Paths.document ?? Paths.cache;
      if (!dir) {
        await Share.share({ message: csvContent, title: 'SubGuard Harcama Raporu' });
        return;
      }
      const file = new File(dir, fileName);
      file.write(csvContent); // sync — await gerektirmez

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'SubGuard Raporu',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        // Paylaşım desteklenmiyorsa düz metin olarak dene
        await Share.share({ message: csvContent, title: 'SubGuard Harcama Raporu' });
      }
    } catch (err) {
      console.error('CSV export hatası:', err);
      Alert.alert('Hata', `Rapor dışa aktarılamadı: ${(err as Error)?.message ?? String(err)}`);
    }
  };

  // --- RENDER YARDIMCILARI ---
  const renderCategoryBar = (item: typeof statistics.sortedCategories[0], index: number) => {
    const isSelected = selectedCategory === item.name;
    return (
      <TouchableOpacity
        key={item.name}
        style={styles.catContainer}
        onPress={() => handleCategoryPress(item.name)}
        activeOpacity={0.7}
      >
        <View style={styles.catHeader}>
          <View style={styles.catTitleRow}>
            <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
              <Text style={styles.categoryIndexText}>{index + 1}</Text>
            </View>
            <Text style={[styles.catName, { color: colors.textMain }]}>{item.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.catPrice, { color: colors.textMain }]}>{item.total.toFixed(0)} ₺</Text>
              <Text style={[styles.catPercent, { color: colors.textSec }]}>%{item.percentage.toFixed(1)}</Text>
            </View>
            <Ionicons
              name={isSelected ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textSec}
            />
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.barBackground, { backgroundColor: colors.inputBg }]}>
          <View style={[styles.barFill, { width: `${item.barWidth}%`, backgroundColor: item.color }]} />
        </View>

        {/* Expanded: Bu kategorideki abonelikler */}
        {isSelected && (
          <View style={[styles.expandedPanel, { backgroundColor: item.color + '0E', borderColor: item.color + '30' }]}>
            {categorySubscriptions.map(sub => (
              <View key={sub.id} style={[styles.subRow, { borderBottomColor: colors.border }]}>
                <View style={styles.subRowLeft}>
                  <View style={[styles.subDot, {
                    backgroundColor: sub.isActive !== false ? item.color : colors.inactive,
                  }]} />
                  <Text style={[styles.subName, { color: colors.textMain }]}>{sub.name}</Text>
                  {sub.isActive === false && (
                    <View style={[styles.statusBadge, { backgroundColor: colors.inactive + '30' }]}>
                      <Text style={[styles.statusBadgeText, { color: colors.inactive }]}>
                        {sub.cancelledAt ? 'İptal' : 'Durduruldu'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.subPrice, { color: item.color }]}>
                  {sub.price} {sub.currency}
                </Text>
              </View>
            ))}
            <View style={styles.expandedFooter}>
              <Text style={[styles.expandedFooterText, { color: colors.textSec }]}>
                {categorySubscriptions.length} abonelik · toplam {item.total.toFixed(0)} ₺/ay
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const hasData = subscriptions.length > 0;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <SafeAreaView edges={embedded ? [] : ['top']} style={styles.safeArea}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textMain }]}>Harcama Analizi</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSec }]}>Giderlerinizin detaylı dökümü</Text>
          </View>
          {hasData && (
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={handleExport}
            >
              <Ionicons name="download-outline" size={18} color={colors.primary} />
              <Text style={[styles.exportBtnText, { color: colors.primary }]}>CSV İndir</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* 0. DÖNEM SEÇİCİ */}
          <View style={styles.periodRow}>
            {(Object.keys(periodRanges) as Period[]).map((key) => {
              const isActive = selectedPeriod === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.periodChip, {
                    backgroundColor: isActive ? colors.primary : colors.inputBg,
                    borderColor: isActive ? colors.primary : colors.border,
                  }]}
                  onPress={() => setSelectedPeriod(isActive ? null : key)}
                >
                  <Text style={[styles.periodChipText, { color: isActive ? '#FFF' : colors.textSec }]}>
                    {periodRanges[key].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* DÖNEM SONUCU */}
          {selectedPeriod && (
            <View style={[styles.periodResultCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              {periodLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : periodData?.totalSpending != null ? (
                <View style={styles.periodResultRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <Text style={[styles.periodResultLabel, { color: colors.textSec }]}>
                    {periodRanges[selectedPeriod].label} Toplam
                  </Text>
                  <Text style={[styles.periodResultValue, { color: colors.textMain }]}>
                    {periodData.totalSpending.toFixed(2)} {periodData.currency ?? '₺'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.periodResultLabel, { color: colors.textSec }]}>
                  Bu dönem için veri bulunamadı.
                </Text>
              )}
            </View>
          )}

          {/* DÖNEM KATEGORİ KIRILIMLARI */}
          {selectedPeriod && periodBreakdown.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, marginBottom: 20 }]}>
              <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 12 }]}>
                {periodRanges[selectedPeriod].label} — Kategori Kırılımı
              </Text>
              {periodBreakdown.map((item, i) => {
                const maxVal = periodBreakdown[0]?.total || 1;
                const barPct = (item.total / maxVal) * 100;
                const color = FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                return (
                  <View key={item.category} style={{ marginBottom: i < periodBreakdown.length - 1 ? 14 : 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMain }}>{item.category}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 11, color: colors.textSec }}>{item.count} abonelik</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMain }}>{item.total.toFixed(0)} ₺</Text>
                      </View>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.inputBg, overflow: 'hidden' }}>
                      <View style={{ width: `${barPct}%` as any, height: '100%', borderRadius: 3, backgroundColor: color }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* 1. ÖZET KARTI */}
          <View style={[styles.heroCard, { backgroundColor: colors.primary, shadowColor: isDarkMode ? '#000' : colors.primaryDark }]}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Yıllık Projeksiyon</Text>
                <View style={styles.heroAmountRow}>
                  <Text style={styles.heroCurrency}>₺</Text>
                  <Text style={styles.heroAmount}>{yearlyProjection.toFixed(0)}</Text>
                </View>
              </View>
              <View style={styles.heroIconContainer}>
                <MaterialCommunityIcons name="chart-box-outline" size={32} color="#FFF" />
              </View>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Aylık Ort.</Text>
                <Text style={styles.statValue}>{totalMonthlyExpense.toFixed(0)} ₺</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Aktif</Text>
                <Text style={styles.statValue}>{activeSubsCount}</Text>
              </View>
              {passiveSubsCount > 0 && (
                <>
                  <View style={styles.verticalLine} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pasif</Text>
                    <Text style={[styles.statValue, { color: 'rgba(255,255,255,0.5)' }]}>{passiveSubsCount}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {!hasData ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="chart-pie" size={64} color={colors.inactive} />
              <Text style={[styles.emptyText, { color: colors.textSec }]}>Henüz analiz edilecek veri yok.</Text>
              <Text style={[styles.emptySubText, { color: colors.textSec }]}>Abonelik ekledikçe grafikler burada belirecek.</Text>
            </View>
          ) : (
            <>
              {/* 2. KATEGORİ KIRILIMLARI (tıklanabilir) */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Kategori Dağılımı</Text>
                <Text style={[styles.sectionHint, { color: colors.textSec }]}>Kategoriye dokunun</Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                {statistics.sortedCategories.map((item, index) =>
                  renderCategoryBar(item, index)
                )}
              </View>

              {/* 4. TREND GRAFİĞİ */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>6 Aylık Trend</Text>
                <Text style={[styles.sectionHint, { color: colors.textSec }]}>Tahmini harcama</Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingHorizontal: 0, paddingTop: 16, paddingBottom: 8 }]}>
                <BarChart
                  data={{ labels: trendData.labels, datasets: [{ data: trendData.data }] }}
                  width={screenWidth - 40}
                  height={200}
                  chartConfig={trendChartConfig}
                  style={{ borderRadius: 16 }}
                  yAxisLabel="₺"
                  yAxisSuffix=""
                  showValuesOnTopOfBars
                  fromZero
                  withInnerLines
                />
                <Text style={[styles.trendNote, { color: colors.textSec }]}>
                  * Abonelik oluşturma ve iptal tarihleri dikkate alınarak hesaplanmıştır.
                </Text>
              </View>

              {/* 5. DIŞA AKTAR BUTONU */}
              <TouchableOpacity
                style={[styles.exportFullBtn, { backgroundColor: colors.primary }]}
                onPress={handleExport}
                activeOpacity={0.85}
              >
                <Ionicons name="download-outline" size={20} color="#FFF" />
                <Text style={styles.exportFullBtnText}>CSV Olarak Dışa Aktar</Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  exportBtnText: { fontSize: 13, fontWeight: '600' },

  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  heroAmountRow: { flexDirection: 'row', alignItems: 'flex-start' },
  heroCurrency: { color: '#FFF', fontSize: 24, fontWeight: '600', marginTop: 4, marginRight: 4 },
  heroAmount: { color: '#FFF', fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  heroIconContainer: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 14 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4, fontWeight: '500' },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  verticalLine: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Ortak Kart
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionHint: { fontSize: 12, fontWeight: '500' },

  // Kategori Barlar
  catContainer: { marginBottom: 20 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catTitleRow: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryIndexText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
  catName: { fontSize: 15, fontWeight: '600' },
  catPrice: { fontSize: 15, fontWeight: '700' },
  catPercent: { fontSize: 12, marginTop: 2 },
  barBackground: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },

  // Expanded Panel
  expandedPanel: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  subRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  subDot: { width: 8, height: 8, borderRadius: 4 },
  subName: { fontSize: 13, fontWeight: '600', flex: 1 },
  subPrice: { fontSize: 13, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  expandedFooter: { paddingHorizontal: 14, paddingVertical: 8 },
  expandedFooterText: { fontSize: 12, fontWeight: '500' },

  // Trend Grafik
  trendNote: { fontSize: 11, textAlign: 'center', marginTop: 8, marginBottom: 4, opacity: 0.7 },

  // Export
  exportFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  exportFullBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Empty
  emptyState: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  emptySubText: { marginTop: 8, fontSize: 14, textAlign: 'center' },

  // Dönem Seçici
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  periodChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodChipText: { fontSize: 13, fontWeight: '700' },
  periodResultCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  periodResultLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  periodResultValue: { fontSize: 16, fontWeight: '800' },
});
