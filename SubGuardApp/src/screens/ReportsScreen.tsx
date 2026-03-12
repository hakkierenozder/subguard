import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Share, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../constants/theme';
import ExpenseChart, { CATEGORY_COLORS } from '../components/ExpenseChart';

const screenWidth = Dimensions.get('window').width;

const FALLBACK_COLORS = ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00B894', '#E17055', '#74B9FF'];

export default function ReportsScreen() {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const { subscriptions, getTotalExpense, exchangeRates, fetchUserSubscriptions } = useUserSubscriptionStore();
  const totalMonthlyExpense = getTotalExpense();

  useEffect(() => {
    if (subscriptions.length === 0) fetchUserSubscriptions();
  }, []);

  // Seçili kategori (detay için)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (cat: string) => {
    setSelectedCategory(prev => (prev === cat ? null : cat));
  };

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

  // --- TREND GRAFİĞİ (Son 6 ay) ---
  const trendData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      labels.push(d.toLocaleDateString('tr-TR', { month: 'short' }));

      const monthTotal = subscriptions
        .filter(s => {
          // İptal tarihi bu aydan önce ise dahil etme
          if (s.cancelledAt && new Date(s.cancelledAt) < monthEnd) return false;
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

  // --- DIŞA AKTAR ---
  const handleExport = async () => {
    try {
      const lines = [
        '📊 SubGuard Harcama Raporu',
        `Tarih: ${new Date().toLocaleDateString('tr-TR')}`,
        '',
        `Aylık Toplam : ${totalMonthlyExpense.toFixed(2)} ₺`,
        `Yıllık Proj. : ${(totalMonthlyExpense * 12).toFixed(2)} ₺`,
        `Aktif        : ${activeSubsCount} abonelik`,
        passiveSubsCount > 0 ? `Pasif        : ${passiveSubsCount} abonelik` : '',
        '',
        '--- Kategori Dağılımı ---',
        ...statistics.sortedCategories.map(
          c => `${c.name.padEnd(16)} ${c.total.toFixed(2)} ₺  (%${c.percentage.toFixed(1)})`
        ),
        '',
        '--- Abonelik Listesi ---',
        ...subscriptions
          .filter(s => s.isActive !== false)
          .map(s => `• ${s.name}: ${s.price} ${s.currency}/ay`),
      ].filter(l => l !== undefined);

      await Share.share({
        message: lines.join('\n'),
        title: 'SubGuard Harcama Raporu',
      });
    } catch {
      Alert.alert('Hata', 'Rapor paylaşılamadı.');
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
      <SafeAreaView edges={['top']} style={styles.safeArea}>

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
              <Ionicons name="share-outline" size={18} color={colors.primary} />
              <Text style={[styles.exportBtnText, { color: colors.primary }]}>Paylaş</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* 1. ÖZET KARTI */}
          <View style={[styles.heroCard, { backgroundColor: colors.primary, shadowColor: isDarkMode ? '#000' : colors.primaryDark }]}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Yıllık Projeksiyon</Text>
                <View style={styles.heroAmountRow}>
                  <Text style={styles.heroCurrency}>₺</Text>
                  <Text style={styles.heroAmount}>{(totalMonthlyExpense * 12).toFixed(0)}</Text>
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
              {/* 2. PASTA GRAFİK */}
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Harcama Dağılımı</Text>
                  <Text style={[styles.sectionHint, { color: colors.textSec }]}>Kategoriye dokunun</Text>
                </View>
                <ExpenseChart
                  onCategoryPress={handleCategoryPress}
                  selectedCategory={selectedCategory}
                />
              </View>

              {/* 3. KATEGORİ KIRILIMLARI (tıklanabilir) */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Kategori Dağılımı</Text>
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
                  * Mevcut aboneliklerinize göre hesaplanmıştır.
                </Text>
              </View>

              {/* 5. DIŞA AKTAR BUTONU */}
              <TouchableOpacity
                style={[styles.exportFullBtn, { backgroundColor: colors.primary }]}
                onPress={handleExport}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={20} color="#FFF" />
                <Text style={styles.exportFullBtnText}>Raporu Paylaş</Text>
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
});
