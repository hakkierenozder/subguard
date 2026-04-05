import React from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useThemeColors, CATEGORY_COLORS } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { isSubscriptionActiveNow } from '../utils/dateUtils';
import { formatCurrencyAmount, normalizeCurrencyCode } from '../utils/CurrencyService';
import { getSubscriptionMonthlyShareInCurrency } from '../utils/subscriptionMath';

const screenWidth = Dimensions.get('window').width;

// Re-export for backward compat with ReportsScreen import
export { CATEGORY_COLORS };

const FALLBACK_COLORS = ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00B894', '#E17055', '#74B9FF'];

interface Props {
  onCategoryPress?: (category: string) => void;
  selectedCategory?: string | null;
}

export default function ExpenseChart({ onCategoryPress, selectedCategory }: Props) {
  const colors = useThemeColors();
  const monthlyBudgetCurrency = useSettingsStore((state) => state.monthlyBudgetCurrency);
  const { subscriptions, exchangeRates } = useUserSubscriptionStore();
  const budgetCurrency = normalizeCurrencyCode(monthlyBudgetCurrency);

  // Kategori bazlı toplam hesapla (sadece aktif, kur dönüşümlü, paylaşım dahil)
  // Kur kuralı: backend BillingPriceHelper ile tutarlı olmalı.
  //   • TRY → her zaman 1 (gösterim para birimi, kurda bulunmayabilir)
  //   • Bilinen kur → exchangeRates'den al
  //   • Bilinmeyen kur → 0 (grafikten hariç tut; 1 yazmak yanlış dönüşüm üretir)
  const categoryTotals: Record<string, number> = {};
  subscriptions
    .filter(s => isSubscriptionActiveNow(s.isActive, s.firstPaymentDate, s.contractStartDate, new Date(), s.createdDate))
    .forEach(sub => {
      const cat = sub.category || 'Diğer';
      const myShare = getSubscriptionMonthlyShareInCurrency(
        sub,
        exchangeRates,
        budgetCurrency,
        { unknownRateAsZero: true },
      );
      if (myShare === 0) return; // Bilinmeyen kur → bu aboneliği grafikten hariç tut
      categoryTotals[cat] = (categoryTotals[cat] || 0) + myShare;
    });

  const colorKeys = Object.keys(categoryTotals);
  const chartData = colorKeys.map((cat, i) => ({
    name: cat,
    population: parseFloat(categoryTotals[cat].toFixed(2)),
    color: CATEGORY_COLORS[cat] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    legendFontColor: colors.textSec,
    legendFontSize: 12,
  }));

  if (chartData.length === 0) return null;

  return (
    <View>
      {/* Pasta Grafik */}
      <PieChart
        data={chartData}
        width={screenWidth - 40}
        height={190}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 0]}
        absolute
        hasLegend={false}
      />

      {/* Tıklanabilir Özel Legend */}
      <View style={styles.legendContainer}>
        {chartData.map((item) => {
          const isSelected = selectedCategory === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.legendItem,
                { borderColor: isSelected ? item.color : 'transparent' },
                isSelected && { backgroundColor: item.color + '1A' },
              ]}
              onPress={() => onCategoryPress?.(item.name)}
              activeOpacity={0.7}
            >
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendName, { color: colors.textMain }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.legendAmount, { color: item.color }]}>
                {formatCurrencyAmount(item.population, budgetCurrency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
    minWidth: 100,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  legendAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
});
