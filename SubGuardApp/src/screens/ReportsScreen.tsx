import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Share,
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
import { formatCurrencyAmount, getCurrencySymbol, normalizeCurrencyCode } from '../utils/CurrencyService';
import {
  formatLocalDateForApi,
  getNextBillingDateForSub,
  isSubscriptionActiveNow,
  isSubscriptionBillableAtDate,
} from '../utils/dateUtils';
import {
  convertAmountBetweenCurrencies,
  getCurrencyRateToTry,
  getSubscriptionCycleShareInCurrency,
  getSubscriptionMonthlyShareInCurrency,
  getSubscriptionPortfolioMetrics,
} from '../utils/subscriptionMath';
import { SpendingReportDto } from '../types';

const FALLBACK_COLORS = ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00B894', '#E17055', '#74B9FF'];

type Period = 'this_month' | 'last_3_months' | 'this_year';
type CsvCell = string | number;

const escapeCsvCell = (value: CsvCell) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const createCsvContent = (rows: CsvCell[][]) => rows
  .map((row) => row.map(escapeCsvCell).join(','))
  .join('\n');

const formatOriginalTotals = (entries: [string, number][]) =>
  entries
    .map(([currency, amount]) =>
      formatCurrencyAmount(amount, currency, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }))
    .join(' + ');

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
      date.setDate(1);
      date.setMonth(date.getMonth() - 2);
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
  const monthlyBudgetCurrency = useSettingsStore((state) => state.monthlyBudgetCurrency);
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
  const [periodReloadKey, setPeriodReloadKey] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);

  const periodRanges = useMemo(() => getPeriodRanges(), []);
  const budgetCurrency = normalizeCurrencyCode(monthlyBudgetCurrency);

  const formatBudgetAmount = (amount: number, fractionDigits = 0) =>
    formatCurrencyAmount(amount, budgetCurrency, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  const toBudgetCurrency = (amount: number, currency: string) =>
    convertAmountBetweenCurrencies(amount, currency, budgetCurrency, exchangeRates, {
      unknownRateAsZero: true,
    });
  const canConvertToBudget = (currency: string) => {
    const normalized = normalizeCurrencyCode(currency);
    if (normalized === budgetCurrency) return true;

    return getCurrencyRateToTry(normalized, exchangeRates, { unknownRateAsZero: true }) > 0
      && getCurrencyRateToTry(budgetCurrency, exchangeRates, { unknownRateAsZero: true }) > 0;
  };

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
  }, [periodRanges, periodReloadKey, selectedPeriod]);

  const portfolioMetrics = useMemo(
    () => getSubscriptionPortfolioMetrics(subscriptions, exchangeRates),
    [subscriptions, exchangeRates],
  );

  const totalMonthlyExpense = toBudgetCurrency(portfolioMetrics.monthlyEquivalentTotalTRY, 'TRY');
  const activeSubsCount = portfolioMetrics.startedCount;
  const pendingSubsCount = portfolioMetrics.pendingCount;

  const periodSummary = useMemo(() => {
    if (!periodData) return null;

    const totals = Object.entries(periodData.totalByCurrency ?? {});
    if (totals.length === 0) return null;

    const fullyConvertible = totals.every(([currency]) => canConvertToBudget(currency));
    const totalBudget = totals.reduce(
      (sum, [currency, amount]) => sum + toBudgetCurrency(amount, currency),
      0,
    );

    return {
      totalBudget,
      fullyConvertible,
      budgetLabel: fullyConvertible ? formatBudgetAmount(totalBudget, 2) : null,
      originalLabel: formatOriginalTotals(totals as [string, number][]),
    };
  }, [budgetCurrency, exchangeRates, periodData]);

  const periodBreakdown = useMemo(() => {
    if (!periodData?.lines?.length) return [];

    const categoryMap: Record<string, { total: number; paymentCount: number; subscriptionCount: number }> = {};

    periodData.lines.forEach((line) => {
      const category = line.category || 'Diğer';
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, paymentCount: 0, subscriptionCount: 0 };
      }

      categoryMap[category].total += toBudgetCurrency(line.totalAmount, line.currency);
      categoryMap[category].paymentCount += line.paymentCount;
      categoryMap[category].subscriptionCount += 1;
    });

    return Object.entries(categoryMap)
      .map(([category, values]) => ({ category, ...values }))
      .sort((a, b) => b.total - a.total);
  }, [budgetCurrency, exchangeRates, periodData]);

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

      const monthlyShare = getSubscriptionMonthlyShareInCurrency(
        subscription,
        exchangeRates,
        budgetCurrency,
        { unknownRateAsZero: true },
      );
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
  }, [budgetCurrency, exchangeRates, subscriptions, totalMonthlyExpense]);

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
        getSubscriptionMonthlyShareInCurrency(b, exchangeRates, budgetCurrency, { unknownRateAsZero: true })
        - getSubscriptionMonthlyShareInCurrency(a, exchangeRates, budgetCurrency, { unknownRateAsZero: true }));
  }, [budgetCurrency, exchangeRates, selectedCategory, subscriptions]);

  const missingPortfolioCurrencies = useMemo(() => {
    const missing = new Set<string>();

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

      const normalized = normalizeCurrencyCode(subscription.currency);
      if (!canConvertToBudget(normalized)) {
        missing.add(normalized);
      }
    });

    return Array.from(missing);
  }, [budgetCurrency, exchangeRates, subscriptions]);

  const missingPeriodCurrencies = useMemo(() => {
    if (!periodData?.lines?.length) return [];

    const missing = new Set<string>();
    periodData.lines.forEach((line) => {
      const normalized = normalizeCurrencyCode(line.currency);
      if (!canConvertToBudget(normalized)) {
        missing.add(normalized);
      }
    });

    return Array.from(missing);
  }, [budgetCurrency, exchangeRates, periodData]);

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
        .reduce(
          (sum, subscription) => sum + getSubscriptionMonthlyShareInCurrency(
            subscription,
            exchangeRates,
            budgetCurrency,
            { unknownRateAsZero: true },
          ),
          0,
        );

      data.push(parseFloat(monthTotal.toFixed(0)));
    }

    return { labels, data };
  }, [budgetCurrency, exchangeRates, subscriptions]);

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

          total += getSubscriptionCycleShareInCurrency(
            subscription,
            exchangeRates,
            budgetCurrency,
            { unknownRateAsZero: true },
          );

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
  }, [budgetCurrency, exchangeRates, subscriptions]);

  const exportCsv = async (rows: CsvCell[][], fileLabel: string, fileSuffix: string) => {
    try {
      const dateString = formatLocalDateForApi(new Date());
      const csvContent = createCsvContent(rows);
      const fileName = `subguard-${fileSuffix}-${dateString}.csv`;
      const directory = Paths.document ?? Paths.cache;

      if (!directory) {
        await Share.share({ message: csvContent, title: fileLabel });
        return;
      }

      const file = new File(directory, fileName);
      file.write(csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: fileLabel,
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        await Share.share({ message: csvContent, title: fileLabel });
      }
    } catch (error) {
      console.error('CSV export hatasi:', error);
      Alert.alert('Hata', `Rapor disa aktarilamadi: ${(error as Error)?.message ?? String(error)}`);
    }
  };

  const buildPortfolioCsvRows = (): CsvCell[][] => [
    ['SubGuard Portfoy Raporu', ''],
    ['Rapor Tarihi', formatLocalDateForApi(new Date())],
    ['Ozet Para Birimi', budgetCurrency],
    ['Aktif Aylik Yuk', totalMonthlyExpense.toFixed(2)],
    ['Yil Sonuna Kadar', yearlyProjection.toFixed(2)],
    ['Baslamis', String(activeSubsCount)],
    ['Bekleyen', String(pendingSubsCount)],
    ...(missingPortfolioCurrencies.length > 0
      ? [['Kur Uyarisi', `Su para birimleri secili ozete cevrilemedi: ${missingPortfolioCurrencies.join(', ')}`] as CsvCell[]]
      : []),
    ['', ''],
    ['Kategori', `Aylik Yuk (${budgetCurrency})`, 'Oran (%)'],
    ...statistics.map((item) => [
      item.name,
      item.total.toFixed(2),
      item.percentage.toFixed(1),
    ]),
    ['', '', '', '', '', '', '', '', ''],
    ['Abonelik Adi', 'Kategori', 'Orijinal Fiyat', 'Para Birimi', `Cycle Payi (${budgetCurrency})`, `Aylik Esdeger (${budgetCurrency})`, 'Donem', 'Durum', 'Kur Durumu'],
    ...subscriptions.map((subscription) => {
      const convertible = canConvertToBudget(subscription.currency);
      return [
        subscription.name,
        subscription.category || 'Diğer',
        subscription.price.toFixed(2),
        subscription.currency,
        convertible
          ? getSubscriptionCycleShareInCurrency(subscription, exchangeRates, budgetCurrency, { unknownRateAsZero: true }).toFixed(2)
          : 'N/A',
        convertible
          ? getSubscriptionMonthlyShareInCurrency(subscription, exchangeRates, budgetCurrency, { unknownRateAsZero: true }).toFixed(2)
          : 'N/A',
        subscription.billingPeriod === 'Yearly' ? 'Yıllık' : 'Aylık',
        subscription.status || (subscription.isActive ? 'Aktif' : 'Pasif'),
        convertible ? 'OK' : 'Kur Yok',
      ];
    }),
  ];

  const buildPeriodCsvRows = (): CsvCell[][] => {
    const totals = Object.entries(periodData?.totalByCurrency ?? {}) as [string, number][];

    return [
      ['SubGuard Donem Raporu', ''],
      ['Rapor Tarihi', formatLocalDateForApi(new Date())],
      ['Secili Donem', selectedPeriod ? periodRanges[selectedPeriod].label : '-'],
      ['Donem Baslangici', periodData?.from ?? '-'],
      ['Donem Bitisi', periodData?.to ?? '-'],
      ['Ozet Para Birimi', budgetCurrency],
      ['Donem Toplami', periodSummary?.budgetLabel ?? 'N/A'],
      ['Orijinal Toplamlar', totals.length > 0 ? formatOriginalTotals(totals) : '-'],
      ...(missingPeriodCurrencies.length > 0
        ? [['Kur Uyarisi', `Su para birimleri secili ozete cevrilemedi: ${missingPeriodCurrencies.join(', ')}`] as CsvCell[]]
        : []),
      ['', ''],
      ['Kategori', `Toplam (${budgetCurrency})`, 'Tahsilat Adedi', 'Abonelik Satiri'],
      ...periodBreakdown.map((item) => [
        item.category,
        item.total.toFixed(2),
        String(item.paymentCount),
        String(item.subscriptionCount),
      ]),
      ['', '', '', '', '', ''],
      ['Abonelik Adi', 'Kategori', 'Orijinal Birim Fiyat', 'Para Birimi', 'Tahsilat Adedi', 'Orijinal Toplam', 'Donem'],
      ...(periodData?.lines ?? []).map((line) => [
        line.name,
        line.category || 'Diğer',
        line.unitPrice.toFixed(2),
        line.currency,
        String(line.paymentCount),
        line.totalAmount.toFixed(2),
        line.billingPeriod === 'Yearly' ? 'Yıllık' : 'Aylık',
      ]),
    ];
  };

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
    if (selectedPeriod && periodData) {
      Alert.alert(
        'CSV Dışa Aktar',
        'Hangi raporu indirmek istiyorsun?',
        [
          { text: 'Portföy CSV', onPress: () => { void exportCsv(buildPortfolioCsvRows(), 'SubGuard Portföy Raporu', 'portfoy'); } },
          { text: 'Dönem CSV', onPress: () => { void exportCsv(buildPeriodCsvRows(), 'SubGuard Dönem Raporu', 'donem'); } },
          { text: 'Vazgeç', style: 'cancel' },
        ],
      );
      return;
    }

    await exportCsv(buildPortfolioCsvRows(), 'SubGuard Portföy Raporu', 'portfoy');
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
              <Text style={[styles.catPrice, { color: colors.textMain }]}>{formatBudgetAmount(item.total)}</Text>
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
                  {formatBudgetAmount(
                    getSubscriptionMonthlyShareInCurrency(subscription, exchangeRates, budgetCurrency, { unknownRateAsZero: true }),
                  )}/ay
                </Text>
              </View>
            ))}
            <View style={styles.expandedFooter}>
              <Text style={[styles.expandedFooterText, { color: colors.textSec }]}>
                {categorySubscriptions.length} abonelik · toplam {formatBudgetAmount(item.total)}/ay
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
              <Text style={[styles.headerTitle, { color: colors.textMain }]}>Raporlar</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSec }]}>Dönem tahsilatı ve mevcut portföy görünümü</Text>
            </View>
            {hasData && (
              <TouchableOpacity
                style={[styles.exportBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                onPress={handleExport}
              >
                <Ionicons name="download-outline" size={18} color={colors.accent} />
                <Text style={[styles.exportBtnText, { color: colors.accent }]}>Dışa Aktar</Text>
              </TouchableOpacity>
            )}
          </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Dönem Raporu</Text>
            <Text style={[styles.sectionHint, { color: colors.textSec }]}>Seçili aralıktaki tahsilatlar</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
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

            {!selectedPeriod ? (
              <View style={[styles.infoCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.textSec }]}>
                  Bir dönem seçtiğinde üst blok gerçek tahsilat raporunu gösterir. Aşağıdaki portföy bölümü ise bugün itibarıyla güncel görünümü sunar.
                </Text>
              </View>
            ) : (
              <>
                <View style={[styles.periodResultCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  {periodLoading ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : periodError ? (
                    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                      <Text style={[styles.periodResultLabel, { color: colors.error, marginBottom: 8 }]}>Dönem verisi yüklenemedi.</Text>
                      <TouchableOpacity
                        onPress={() => setPeriodReloadKey((value) => value + 1)}
                        style={{ paddingHorizontal: 16, paddingVertical: 6, backgroundColor: colors.accent, borderRadius: 8 }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Tekrar Dene</Text>
                      </TouchableOpacity>
                    </View>
                  ) : periodSummary ? (
                    <View style={styles.periodSummaryContent}>
                      <View style={styles.periodSummaryTop}>
                        <View style={styles.periodSummaryTitleRow}>
                          <Ionicons name="calendar-outline" size={18} color={colors.accent} />
                          <Text style={[styles.periodResultLabel, { color: colors.textSec }]}>
                            {periodRanges[selectedPeriod].label} toplamı
                          </Text>
                        </View>
                        <Text style={[styles.periodResultValue, { color: colors.textMain }]}>
                          {periodSummary.budgetLabel ?? periodSummary.originalLabel}
                        </Text>
                      </View>
                      <Text style={[styles.periodMetaText, { color: colors.textSec }]}>
                        Orijinal tutarlar: {periodSummary.originalLabel}
                      </Text>
                      {!periodSummary.budgetLabel && (
                        <Text style={[styles.periodMetaText, { color: colors.warning }]}>
                          Seçili özet para birimine dönüşüm için gerekli kur verisi eksik.
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={[styles.periodResultLabel, { color: colors.textSec }]}>Bu dönem için veri bulunamadı.</Text>
                  )}
                </View>

                {missingPeriodCurrencies.length > 0 && (
                  <View style={[styles.warningCard, { backgroundColor: colors.warning + '12', borderColor: colors.warning + '35' }]}>
                    <Ionicons name="warning-outline" size={18} color={colors.warning} />
                    <Text style={[styles.warningText, { color: colors.textSec }]}>
                      {missingPeriodCurrencies.join(', ')} için kur verisi eksik. Dönem kırılımı sadece çevrilebilen tutarları içeriyor olabilir.
                    </Text>
                  </View>
                )}

                {periodBreakdown.length > 0 && (
                  <View style={styles.periodBreakdownContainer}>
                    <Text style={[styles.cardInnerTitle, { color: colors.textMain }]}>
                      {periodRanges[selectedPeriod].label} kırılımı
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
                              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMain }}>{formatBudgetAmount(item.total)}</Text>
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
              </>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Mevcut Portföy</Text>
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
                  <Text style={styles.heroCurrency}>{getCurrencySymbol(budgetCurrency)}</Text>
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
                <Text style={styles.statValue}>{formatBudgetAmount(yearlyProjection)}</Text>
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
              {missingPortfolioCurrencies.length > 0 && (
                <View style={[styles.warningCard, { backgroundColor: colors.warning + '12', borderColor: colors.warning + '35' }]}>
                  <Ionicons name="warning-outline" size={18} color={colors.warning} />
                  <Text style={[styles.warningText, { color: colors.textSec }]}>
                    {missingPortfolioCurrencies.join(', ')} için kur verisi eksik. Portföy toplamları ve kategori dağılımı eksik hesaplanıyor olabilir.
                  </Text>
                </View>
              )}

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Portföy Kategori Dağılımı</Text>
                <Text style={[styles.sectionHint, { color: colors.textSec }]}>Kategoriye dokunun</Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                {statistics.map((item, index) => renderCategoryBar(item, index))}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>6 Aylık Aktif Yük Trendi</Text>
                <Text style={[styles.sectionHint, { color: colors.textSec }]}>Ay sonu snapshot</Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingHorizontal: 0, paddingTop: 16, paddingBottom: 8 }]}>
                <View
                  style={styles.chartWrap}
                  onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
                >
                  {chartWidth > 0 && (
                    <BarChart
                      data={{ labels: trendData.labels, datasets: [{ data: trendData.data }] }}
                      width={Math.max(chartWidth - 24, 220)}
                      height={200}
                      chartConfig={trendChartConfig}
                      style={{ borderRadius: 16 }}
                      yAxisLabel={getCurrencySymbol(budgetCurrency)}
                      yAxisSuffix=""
                      showValuesOnTopOfBars
                      fromZero
                      withInnerLines
                    />
                  )}
                </View>
                <Text style={[styles.trendNote, { color: colors.textSec }]}>
                  * Ay sonu itibarıyla aktif olan yük gösterilir; ilk ödeme, duraklatma ve iptal tarihleri dikkate alınır.
                </Text>
              </View>
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
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: '100%',
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
    gap: 4,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionHint: { fontSize: 12, fontWeight: '500' },
  cardInnerTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

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
  chartWrap: {
    paddingHorizontal: 12,
  },

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
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: 14,
  },
  periodResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  periodResultLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  periodResultValue: { fontSize: 16, fontWeight: '800' },
  periodSummaryContent: { gap: 8 },
  periodSummaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  periodSummaryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  periodMetaText: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
  periodBreakdownContainer: { marginTop: 4 },
  infoCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  warningCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },
});
