import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore'; // Eklendi
import { convertToTRY } from '../utils/CurrencyService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../constants/theme'; // Hook Eklendi

export default function ReportsScreen() {
  const colors = useThemeColors(); // Dinamik Renkler
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  
  const { subscriptions, getTotalExpense } = useUserSubscriptionStore();
  const totalMonthlyExpense = getTotalExpense(); 

  // --- ABONELİK İSTATİSTİKLERİ ---
  const activeSubsCount = subscriptions.filter(s => s.isActive !== false).length;
  const passiveSubsCount = subscriptions.filter(s => s.isActive === false).length;

  // --- ANALİZ MANTIĞI ---
  const statistics = useMemo(() => {
    const categoryStats: Record<string, number> = {};
    let maxCategorySpend = 0;

    subscriptions.forEach(sub => {
      if (sub.isActive === false) return; 

      const amountInTRY = convertToTRY(sub.price, sub.currency);
      const partnerCount = (sub.sharedWith?.length || 0);
      const myShare = amountInTRY / (partnerCount + 1);

      const catName = sub.category || 'Diğer';
      
      if (!categoryStats[catName]) categoryStats[catName] = 0;
      categoryStats[catName] += myShare;
    });

    Object.values(categoryStats).forEach(val => {
        if (val > maxCategorySpend) maxCategorySpend = val;
    });

    const sortedCategories = Object.keys(categoryStats)
        .map(key => ({
            name: key,
            total: categoryStats[key],
            percentage: totalMonthlyExpense > 0 ? (categoryStats[key] / totalMonthlyExpense) * 100 : 0,
            barWidth: maxCategorySpend > 0 ? (categoryStats[key] / maxCategorySpend) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);

    return { sortedCategories };
  }, [subscriptions, totalMonthlyExpense]);

  // --- RENDER HELPERS ---

  // Kategori Bar Rengi: Hook'tan gelen primary rengi kullan
  const getDynamicBarColor = (index: number) => {
    // Burada temel renk olarak colors.primary kullanıyoruz. 
    // Ancak opacity (şeffaflık) eklemek için RGB dönüşümü gerekebilir veya basitçe Hex opacity
    // React Native'de Hex + Alpha (örn: #334155CC) çalışır.
    
    // Basit bir yaklaşım: Listedeki sıraya göre şeffaflık
    const opacityHex = Math.floor(Math.max(0.3, 1 - (index * 0.15)) * 255).toString(16).padStart(2, '0');
    return `${colors.primary}${opacityHex}`;
  };

  const renderCategoryItem = (item: any, index: number) => (
    <View key={item.name} style={styles.catContainer}>
        {/* Üst Satır */}
        <View style={styles.catHeader}>
            <View style={styles.catTitleRow}>
                <View style={[styles.categoryIcon, { backgroundColor: getDynamicBarColor(index) }]}>
                    <Text style={[styles.categoryIndexText, { color: colors.white }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.catName, { color: colors.textMain }]}>{item.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.catPrice, { color: colors.textMain }]}>{item.total.toFixed(0)} ₺</Text>
                <Text style={[styles.catPercent, { color: colors.textSec }]}>%{item.percentage.toFixed(1)}</Text>
            </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.barBackground, { backgroundColor: colors.inputBg }]}>
            <View 
                style={[
                    styles.barFill, 
                    { 
                        width: `${item.barWidth}%`, 
                        backgroundColor: getDynamicBarColor(index) 
                    }
                ]} 
            />
        </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.bg} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textMain }]}>Harcama Analizi</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSec }]}>Giderlerinizin detaylı dökümü</Text>
        </View>

        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
        >
            
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
                        <MaterialCommunityIcons name="chart-box-outline" size={32} color={colors.white} />
                    </View>
                </View>
                
                <View style={styles.heroDivider} />

                {/* Alt İstatistikler */}
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

            {/* 2. HARCAMA DAĞILIMI */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Kategori Dağılımı</Text>
                <TouchableOpacity>
                    <Ionicons name="filter" size={20} color={colors.textSec} />
                </TouchableOpacity>
            </View>
            
            {statistics.sortedCategories.length > 0 ? (
                <View style={[styles.chartCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    {statistics.sortedCategories.map((item, index) => renderCategoryItem(item, index))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="chart-pie" size={64} color={colors.inactive} />
                    <Text style={[styles.emptyText, { color: colors.textSec }]}>Henüz analiz edilecek veri yok.</Text>
                    <Text style={[styles.emptySubText, { color: colors.textSec }]}>Abonelik ekledikçe grafikler burada belirecek.</Text>
                </View>
            )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // HERO CARD
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroCurrency: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
    marginRight: 4,
  },
  heroAmount: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 14,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  chartCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  catContainer: {
    marginBottom: 24,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIndexText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  catName: {
    fontSize: 15,
    fontWeight: '600',
  },
  catPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  catPercent: {
    fontSize: 12,
    marginTop: 2,
  },
  
  barBackground: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});