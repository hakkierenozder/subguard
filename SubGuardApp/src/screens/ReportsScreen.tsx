import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { convertToTRY } from '../utils/CurrencyService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- MODERN & SADE RENK PALETİ (Global Tema) ---
const COLORS = {
  primary: '#334155', // Slate 700 - Fırtına Mavisi
  primaryDark: '#1E293B', // Slate 900
  primaryLight: '#475569', // Slate 600
  
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  
  textDark: '#0F172A',
  textMedium: '#334155',
  textLight: '#64748B', // Slate 500
  textExtraLight: '#94A3B8', // Slate 400
  white: '#FFFFFF',
  
  success: '#10B981',
  warning: '#F59E0B',
  passive: '#E2E8F0',
  border: '#F1F5F9',
};

export default function ReportsScreen() {
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
      // Pasif abonelikleri toplama dahil etme
      if (sub.isActive === false) return; 

      const amountInTRY = convertToTRY(sub.price, sub.currency);
      const partnerCount = (sub.sharedWith?.length || 0);
      const myShare =amountInTRY / (partnerCount + 1);

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

  // Kategori Bar Rengi: Listenin sırasına göre Primary rengin opaklığını değiştirir
  const getDynamicBarColor = (index: number) => {
    const opacity = Math.max(0.3, 1 - (index * 0.15)); // Her adımda %15 daha şeffaf
    return `rgba(51, 65, 85, ${opacity})`; // #334155 in RGB'si
  };

  const renderCategoryItem = (item: any, index: number) => (
    <View key={item.name} style={styles.catContainer}>
        {/* Üst Satır: İsim ve Tutar */}
        <View style={styles.catHeader}>
            <View style={styles.catTitleRow}>
                {/* Kategori İkonu / Dot */}
                <View style={[styles.categoryIcon, { backgroundColor: getDynamicBarColor(index) }]}>
                    <Text style={styles.categoryIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.catName}>{item.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.catPrice}>{item.total.toFixed(0)} ₺</Text>
                <Text style={styles.catPercent}>%{item.percentage.toFixed(1)}</Text>
            </View>
        </View>

        {/* Progress Bar Arkaplanı */}
        <View style={styles.barBackground}>
            {/* Doluluk Oranı */}
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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Harcama Analizi</Text>
            <Text style={styles.headerSubtitle}>Giderlerinizin detaylı dökümü</Text>
        </View>

        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
        >
            
            {/* 1. ÖZET KARTI (HERO CARD) */}
            <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                    <View>
                        <Text style={styles.heroLabel}>Yıllık Projeksiyon</Text>
                        <View style={styles.heroAmountRow}>
                            <Text style={styles.heroCurrency}>₺</Text>
                            <Text style={styles.heroAmount}>{(totalMonthlyExpense * 12).toFixed(0)}</Text>
                        </View>
                    </View>
                    <View style={styles.heroIconContainer}>
                        <MaterialCommunityIcons name="chart-box-outline" size={32} color={COLORS.white} />
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
                                <Text style={[styles.statValue, { color: '#CBD5E1' }]}>{passiveSubsCount}</Text>
                            </View>
                        </>
                    )}
                </View>
            </View>

            {/* 2. HARCAMA DAĞILIMI */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>
                <TouchableOpacity>
                    <Ionicons name="filter" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>
            
            {statistics.sortedCategories.length > 0 ? (
                <View style={styles.chartCard}>
                    {statistics.sortedCategories.map((item, index) => renderCategoryItem(item, index))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="chart-pie" size={64} color={COLORS.passive} />
                    <Text style={styles.emptyText}>Henüz analiz edilecek veri yok.</Text>
                    <Text style={styles.emptySubText}>Abonelik ekledikçe grafikler burada belirecek.</Text>
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
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // HEADER
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // HERO CARD (Slate Blue Theme)
  heroCard: {
    backgroundColor: COLORS.primary, // #334155
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    // 3D Gölge Efekti
    shadowColor: COLORS.primaryDark,
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
    color: '#94A3B8', // Slate 400
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
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
    marginRight: 4,
  },
  heroAmount: {
    color: COLORS.white,
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
    color: '#94A3B8', // Slate 400
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // SECTION
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // CHART CARD (Kategori Listesi)
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    // Hafif gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  catName: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  catPrice: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  catPercent: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  
  // Progress Bar
  barBackground: {
    height: 10, // Biraz daha kalın
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },

  // EMPTY STATE
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textMedium,
    fontWeight: '600',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});