import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Share,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../constants/theme';
import { CATEGORY_COLORS } from '../components/ExpenseChart';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import agent from '../api/agent';
import { getCurrencySymbol } from '../utils/CurrencyService';
import {
  formatLocalDateForApi,
  getNextBillingDateForSub,
  isSubscriptionActiveNow,
  isSubscriptionBillableAtDate,
} from '../utils/dateUtils';
import {
  getSubscriptionCycleShareInTry,
  getSubscriptionMonthlyShareInTry,
  getSubscriptionPortfolioMetrics,
} from '../utils/subscriptionMath';
import { SpendingReportDto } from '../types';

const screenWidth = Dimensions.get('window').width;
const FALLBACK_COLORS = ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00B894', '#E17055', '#74B9FF'];

type Period = 'this_month' | 'last_3_months' | 'this_year';

const getPeriodRanges = (): Record<Period, { label: string; from: () => string; to: () => string }> => ({
  this_month: {
    label: 'Bu Ay',
    from: () => {
      const date = new Date();
      date.setDate(1);
      return formatLocalDateForApi(date);
    },
    to: () => formatLocalDateForApi(new Date()),
  },
  last_3_months: {
    label: 'Son 3 Ay',
    from: () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 3);
      date.setDate(1);
      return formatLocalDateForApi(date);
    },
    to: () => formatLocalDateForApi(new Date()),
  },
  this_year: {
    label: 'Bu Yıl',
    from: () => `${new Date().getFullYear()}-01-01`,
    to: () => formatLocalDateForApi(new Date()),
  },
});

export default function ReportsScreen({ embedded = false }: { embedded?: boolean }) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const {
    subscriptions,
    exchangeRates,
    fetchAllUserSubscriptions,
    fetchExchangeRates,
  } = useUserSubscriptionStore();

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [periodData, setPeriodData] = useState<SpendingReportDto | null>(null);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodError, setPeriodError] = useState(false);

  const periodRanges = useMemo(() => getPeriodRanges(), []);

  const formatTryAmount = (amount: number, fractionDigits = 0) =>
    `₺${amount.toLocaleString('tr-TR', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAllUserSubscriptions(),
        fetchExchangeRates(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  useEffect(() => {
    if (!selectedPeriod) {
      setPeriodData(null);
      setPeriodError(false);
      return;
    }

    const range = periodRanges[selectedPeriod];
    setPeriodLoading(true);
    setPeriodError(false);

    agent.Reports.spending(range.from(), range.to())
      .then((response: any) => {
        setPeriodData(response?.data ?? null);
      })
      .catch(() => {
        setPeriodData(null);
        setPeriodError(true);
      })
      .finally(() => setPeriodLoading(false));
  }, [periodRanges, selectedPeriod]);

  const portfolioMetrics = useMemo(
    () => getSubscriptionPortfolioMetrics(subscriptions, exchangeRates),
    [subscriptions, exchangeRates],
  );

  const totalMonthlyExpense = portfolioMetrics.monthlyEquivalentTotalTRY;
  const activeSubsCount = portfolioMetrics.startedCount;
  const pendingSubsCount = portfolioMetrics.pendingCount;

  const periodSummary = useMemo(() => {
    if (!periodData) return null;

    const totals = Object.entries(periodData.totalByCurrency ?? {});
    if (totals.length === 0) return null;

    const totalTRY = totals.reduce((sum, [currency, amount]) => {
      const rate = currency === 'TRY' ? 1 : (exchangeRates[currency] ?? 1);
      return sum + amount * rate;
    }, 0);

    return {
      totalTRY,
      label: totals.length === 1
        ? `${getCurrencySymbol(totals[0][0])}${totals[0][1].toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : `≈ ${formatTryAmount(totalTRY, 2)}`,
    };
  }, [exchangeRates, periodData]);

  const periodBreakdown = useMemo(() => {
    if (!periodData?.lines?.length) return [];

    const categoryMap: Record<string, { total: number; paymentCount: number; subscriptionCount: number }> = {};

    periodData.lines.forEach((line) => {
      const category = line.category || 'Diğer';
      const rate = line.currency === 'TRY' ? 1 : (exchangeRates[line.currency] ?? 1);

      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, paymentCount: 0, subscriptionCount: 0 };
      }

      categoryMap[category].total += line.totalAmount * rate;
      categoryMap[category].paymentCount += line.paymentCount;
      categoryMap[category].subscriptionCount += 1;
    });

    return Object.entries(categoryMap)
      .map(([category, values]) => ({ category, ...values }))
      .sort((a, b) => b.total - a.total);
  }, [exchangeRates, periodData]);

  const statistics = useMemo(() => {
    const categoryStats: Record<string, number> = {};
    let maxCategorySpend = 0;

    subscriptions.forEach((subscription) => {
      if (!isSubscriptionActiveNow(
        subscription.isActive,
        subscription.firstPaymentDate,
        subscription.contractStartDate,
        new Date(),
        subscription.createdDate,
      )) {
        return;
      }

      const monthlyShare = getSubscriptionMonthlyShareInTry(subscription, exchangeRates);
      const categoryName = subscription.category || 'Diğer';
      categoryStats[categoryName] = (categoryStats[categoryName] ?? 0) + monthlyShare;
    });

    Object.values(categoryStats).forEach((value) => {
      if (value > maxCategorySpend) {
        maxCategorySpend = value;
      }
    });

    return Object.keys(categoryStats)
      .map((name, index) => ({
        name,
        total: categoryStats[name],
        percentage: totalMonthlyExpense > 0 ? (categoryStats[name] / totalMonthlyExpense) * 100 : 0,
        barWidth: maxCategorySpend > 0 ? (categoryStats[name] / maxCategorySpend) * 100 : 0,
        color: CATEGORY_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.total - a.total);
  }, [exchangeRates, subscriptions, totalMonthlyExpense]);

  const categorySubscriptions = useMemo(() => {
    if (!selectedCategory) return [];

    return subscriptions
      .filter((subscription) =>
        (subscription.category || 'Diğer') === selectedCategory
        && isSubscriptionActiveNow(
          subscription.isActive,
          subscription.firstPaymentDate,
          subscription.contractStartDate,
          new Date(),
          subscription.createdDate,
        ))
      .sort((a, b) =>
        getSubscriptionMonthlyShareInTry(b, exchangeRates) - getSubscriptionMonthlyShareInTry(a, exchangeRates));
  }, [exchangeRates, selectedCategory, subscriptions]);

  const trendData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - index);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      labels.push(date.toLocaleDateString('tr-TR', { month: 'short' }));

      const monthTotal = subscriptions
        .filter((subscription) => isSubscriptionBillableAtDate(subscription.isActive, monthEnd, {
          firstPaymentDate: subscription.firstPaymentDate,
          contractStartDate: subscription.contractStartDate,
          createdDate: subscription.createdDate,
          cancelledDate: subscription.cancelledDate,
          pausedDate: subscription.pausedDate,
        }))
        .reduce((sum, subscription) => sum + getSubscriptionMonthlyShareInTry(subscription, exchangeRates), 0);

      data.push(parseFloat(monthTotal.toFixed(0)));
    }

    return { labels, data };
  }, [exchangeRates, subscriptions]);

  const yearlyProjection = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yearEnd = new Date(today.getFullYear(), 11, 31);

    return subscriptions
      .filter((subscription) => subscription.isActive !== false)
      .reduce((total, subscription) => {
        const contractEndDate = subscription.contractEndDate ? new Date(subscription.contractEndDate) : null;
        if (contractEndDate) {
          contractEndDate.setHours(0, 0, 0, 0);
        }

        let nextBilling = getNextBillingDateForSub(
          subscription.billingDay,
          subscription.billingPeriod,
          subscription.billingMonth,
          subscription.createdDate,
          subscription.firstPaymentDate,
          subscription.contractStartDate,
          today,
        );

        let guard = 0;
        while (nextBilling <= yearEnd && guard < 24) {
          if (contractEndDate && nextBilling > contractEndDate) {
            break;
          }

          total += getSubscriptionCycleShareInTry(subscription, exchangeRates);

          const nextReference = new Date(nextBilling);
          nextReference.setDate(nextReference.getDate() + 1);
          nextBilling = getNextBillingDateForSub(
            subscription.billingDay,
            subscription.billingPeriod,
            subscription.billingMonth,
            subscription.createdDate,
            subscription.firstPaymentDate,
            subscription.contractStartDate,
            nextReference,
          );
          guard += 1;
        }

        return total;
      }, 0);
  }, [exchangeRates, subscriptions]);

  const trendChartConfig = {
    backgroundColor: colors.cardBg,
    backgroundGradientFrom: colors.cardBg,
    backgroundGradientTo: colors.cardBg,
    fillShadowGradientFrom: colors.accent,
    fillShadowGradientTo: colors.accent,
    fillShadowGradientOpacity: 0.85,
    color: () => colors.accent,
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

  const handleExport = async () => {
    try {
      const dateString = formatLocalDateForApi(new Date());
      const periodRows = selectedPeriod && periodData
        ? [
            ['', ''],
            ['Secili Donem', periodRanges[selectedPeriod].label],
            ['Donem Baslangici', periodData.from],
            ['Donem Bitisi', periodData.to],
            ['Donem Toplami', periodSummary?.label ?? '0'],
            ['Kategori', 'Toplam (TRY)', 'Tahsilat Adedi', 'Abonelik Satiri'],
            ...periodBreakdown.map((item) => [
              `"${item.category.replace(/"/g, '""')}"`,
              item.total.toFixed(2),
              String(item.paymentCount),
              String(item.subscriptionCount),
            ]),
          ]
        : [];

      const summaryRows = [
        ['SubGuard Analiz Raporu', ''],
        ['Rapor Tarihi', dateString],
        ['Portfoy - Aktif Aylik Yuk (TRY)', totalMonthlyExpense.toFixed(2)],
        ['Portfoy - Yil Sonuna Kadar (TRY)', yearlyProjection.toFixed(2)],
        ['Portfoy - Baslamis', String(activeSubsCount)],
        ['Portfoy - Bekleyen', String(pendingSubsCount)],
        ['', ''],
        ['Kategori', 'Aylik Yuk (TRY)', 'Oran (%)'],
        ...statistics.map((item) => [
          item.name,
          item.total.toFixed(2),
          item.percentage.toFixed(1),
        ]),
        ...periodRows,
        ['', '', '', ''],
        ['Abonelik Adi', 'Kategori', 'Cycle Payi (TRY)', 'Aylik Esdeger (TRY)', 'Para Birimi', 'Donem', 'Durum'],
        ...subscriptions.map((subscription) => [
          `"${subscription.name.replace(/"/g, '""')}"`,
          `"${(subscription.category || 'Diğer').replace(/"/g, '""')}"`,
          getSubscriptionCycleShareInTry(subscription, exchangeRates).toFixed(2),
          getSubscriptionMonthlyShareInTry(subscription, exchangeRates).toFixed(2),
          subscription.currency,
          subscription.billingPeriod === 'Yearly' ? 'Yıllık' : 'Aylık',
          subscription.status || (subscription.isActive ? 'Aktif' : 'Pasif'),
        ]),
      ];

      const csvContent = summaryRows.map((row) => row.join(',')).join('\n');
      const fileName = `subguard-analiz-${dateString}.csv`;
      const directory = Paths.document ?? Paths.cache;

      if (!directory) {
        await Share.share({ message: csvContent, title: 'SubGuard Analiz Raporu' });
        return;
      }

      const file = new File(directory, fileName);
      file.write(csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'SubGuard Analiz Raporu',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        await Share.share({ message: csvContent, title: 'SubGuard Analiz Raporu' });
      }
    } catch (error) {
      console.error('CSV export hatasi:', error);
      Alert.alert('Hata', `Rapor disa aktarilamadi: ${(error as Error)?.message ?? String(error)}`);
    }
  };

  const renderCategoryBar = (item: (typeof statistics)[number], index: number) => {
    const isSelected = selectedCategory === item.name;

    return (
      <TouchableOpacity
        key={item.name}
        style={styles.catContainer}
        onPress={() => setSelectedCategory((current) => (current === item.name ? null : item.name))}
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
              <Text style={[styles.catPrice, { color: colors.textMain }]}>{formatTryAmount(item.total)}</Text>
              <Text style={[styles.catPercent, { color: colors.textSec }]}>%{item.percentage.toFixed(1)}</Text>
            </View>
            <Ionicons
              name={isSelected ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textSec}
            />
          </View>
        </View>

        <View style={[styles.barBackground, { backgroundColor: colors.inputBg }]}>
          <View style={[styles.barFill, { width: `${item.barWidth}%`, backgroundColor: item.color }]} />
        </View>

        {isSelected && (
          <View style={[styles.expandedPanel, { backgroundColor: item.color + '0E', borderColor: item.color + '30' }]}>
            {categorySubscriptions.map((subscription) => (
              <View key={subscription.id} style={[styles.subRow, { borderBottomColor: colors.border }]}>
                <View style={styles.subRowLeft}>
                  <View style={[styles.subDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.subName, { color: colors.textMain }]}>{subscription.name}</Text>
                </View>
                <Text style={[styles.subPrice, { color: item.color }]}>
                  {formatTryAmount(getSubscriptionMonthlyShareInTry(subscription, exchangeRates))}/ay
                </Text>
              </View>
            ))}
            <View style={styles.expandedFooter}>
              <Text style={[styles.expandedFooterText, { color: colors.textSec }]}>
                {categorySubscriptions.length} abonelik · toplam {formatTryAmount(item.total)}/ay
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
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textMain }]}>Harcama Analizi</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSec }]}>Dönem tahsilatı ve portföy yükü</Text>
          </View>
          {hasData && (
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={handleExport}
            >
              <Ionicons name="download-outline" size={18} color={colors.accent} />
              <Text style={[styles.exportBtnText, { color: colors.accent }]}>CSV İndir</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.periodRow}>
            {(Object.keys(periodRanges) as Period[]).map((key) => {
              const isActive = selectedPeriod === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.periodChip,
                    {
                      backgroundColor: isActive ? colors.accent : colors.inputBg,
                      borderColor: isActive ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPeriod(isActive ? null : key)}
                >
                  <Text style={[styles.periodChipText, { color: isActive ? '#FFF' : colors.textSec }]}>
                    {periodRanges[key].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedPeriod && (
            <View style={[styles.periodResultCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              {periodLoading ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : periodError ? (
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={[styles.periodResultLabel, { color: colors.error, marginBottom: 8 }]}>Dönem verisi yüklenemedi.</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const currentPeriod = selectedPeriod;
                      setSelectedPeriod(null);
                      setTimeout(() => setSelectedPeriod(currentPeriod), 50);
                    }}
                    style={{ paddingHorizontal: 16, paddingVertical: 6, backgroundColor: colors.accent, borderRadius: 8 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Tekrar Dene</Text>
                  </TouchableOpacity>
                </View>
              ) : periodSummary ? (
                <View style={styles.periodResultRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.accent} />
                  <Text style={[styles.periodResultLabel, { color: colors.textSec }]}>
                    {periodRanges[selectedPeriod].label} Tahsilatı
                  </Text>
                  <Text style={[styles.periodResultValue, { color: colors.textMain }]}>
                    {periodSummary.label}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.periodResultLabel, { color: colors.textSec }]}>Bu dönem için veri bulunamadı.</Text>
              )}
            </View>
          )}

          {selectedPeriod && periodBreakdown.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, marginBottom: 20 }]}>
              <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 12 }]}>
                {periodRanges[selectedPeriod].label} - Tahsilat Kırılımı
              </Text>
              {periodBreakdown.map((item, index) => {
                const maxValue = periodBreakdown[0]?.total || 1;
                const barWidth = (item.total / maxValue) * 100;
                const color = FALLBACK_COLORS[index % FALLBACK_COLORS.length];

                return (
                  <View key={item.category} style={{ marginBottom: index < periodBreakdown.length - 1 ? 14 : 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMain }}>{item.category}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 11, color: colors.textSec }}>{item.paymentCount} tahsilat</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMain }}>{formatTryAmount(item.total)}</Text>
                      </View>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.inputBg, overflow: 'hidden' }}>
                      <View style={{ width: `${barWidth}%` as any, height: '100%', borderRadius: 3, backgroundColor: color }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Portföy Özeti</Text>
            <Text style={[styles.sectionHint, { color: colors.textSec }]}>Bugün itibarıyla</Text>
          </View>

          <LinearGradient
            colors={['#4F46E5', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, { shadowColor: isDarkMode ? '#000' : '#4F46E5' }]}
          >
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Aktif Aylık Yük</Text>
                <View style={styles.heroAmountRow}>
                  <Text style={styles.heroCurrency}>₺</Text>
                  <Text style={styles.heroAmount}>{totalMonthlyExpense.toFixed(0)}</Text>
                </View>
              </View>
              <View style={styles.heroIconContainer}>
                <MaterialCommunityIcons name="chart-box-outline" size={32} color="#FFF" />
              </View>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Başlamış</Text>
                <Text style={styles.statValue}>{activeSubsCount}</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Bekleyen</Text>
                <Text style={styles.statValue}>{pendingSubsCount}</Text>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Yıl Sonuna Kadar</Text>
                <Text style={styles.statValue}>{formatTryAmount(yearlyProjection)}</Text>
              </View>
            </View>
          </LinearGradient>

          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.emptyText, { color: colors.textSec, marginTop: 12 }]}>Veriler yükleniyor...</Text>
            </View>
          ) : !hasData ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="chart-pie" size={64} color={colors.inactive} />
              <Text style={[styles.emptyText, { color: colors.textSec }]}>Henüz analiz edilecek veri yok.</Text>
              <Text style={[styles.emptySubText, { color: colors.textSec }]}>Abonelik ekledikçe grafikler burada belirecek.</Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Kategori Dağılımı</Text>
                <Text style={[styles.sectionHint, { color: colors.textSec }]}>Kategoriye dokunun</Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                {statistics.map((item, index) => renderCategoryBar(item, index))}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>6 Aylık Trend</Text>
                <Text style={[styles.sectionHint, { color: colors.textSec }]}>Ay sonu snapshot</Text>
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
                  * Ay sonu itibarıyla aktif olan yük gösterilir; ilk ödeme, duraklatma ve iptal tarihleri dikkate alınır.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.exportFullBtn, { backgroundColor: colors.accent }]}
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
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4, fontWeight: '500', textAlign: 'center' },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  verticalLine: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },

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

  catContainer: { marginBottom: 20 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catTitleRow: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryIndexText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  catName: { fontSize: 15, fontWeight: '600' },
  catPrice: { fontSize: 15, fontWeight: '700' },
  catPercent: { fontSize: 12, marginTop: 2 },
  barBackground: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },

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
  expandedFooter: { paddingHorizontal: 14, paddingVertical: 8 },
  expandedFooterText: { fontSize: 12, fontWeight: '500' },

  trendNote: { fontSize: 11, textAlign: 'center', marginTop: 8, marginBottom: 4, opacity: 0.7 },

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

  emptyState: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  emptySubText: { marginTop: 8, fontSize: 14, textAlign: 'center' },

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
