import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { convertToTRY } from '../utils/CurrencyService';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { subscriptions, getTotalExpense } = useUserSubscriptionStore();
  
  // Store'daki getTotalExpense fonksiyonu zaten sadece aktifleri topluyor.
  const totalMonthlyExpense = getTotalExpense(); 

  // --- ABONELİK SAYILARI (YENİ) ---
  const activeSubsCount = subscriptions.filter(s => s.isActive !== false).length;
  const passiveSubsCount = subscriptions.filter(s => s.isActive === false).length;

  // --- ANALİZ MANTIĞI ---
  const statistics = useMemo(() => {
    const categoryStats: Record<string, number> = {};
    let maxCategorySpend = 0;

    // 1. Kategorilere Göre Topla
    subscriptions.forEach(sub => {
      // Dondurulmuş (Pasif) abonelikleri grafiğe dahil etme
      if (sub.isActive === false) return; 

      const amountInTRY = convertToTRY(sub.price, sub.currency);
      
      // Paylaşımlı maliyet hesabı (Store ile tutarlı olması için)
      const partnerCount = (sub.sharedWith?.length || 0);
      const myShare = amountInTRY / (partnerCount + 1);

      const catName = sub.category || 'Other';
      
      if (!categoryStats[catName]) categoryStats[catName] = 0;
      categoryStats[catName] += myShare; // Toplam tutarı değil, payımıza düşeni ekliyoruz
    });

    // 2. En yüksek harcamayı bul (Bar uzunluğu için referans)
    Object.values(categoryStats).forEach(val => {
        if (val > maxCategorySpend) maxCategorySpend = val;
    });

    // 3. Sıralı Liste Oluştur (Çoktan aza)
    const sortedCategories = Object.keys(categoryStats)
        .map(key => ({
            name: key,
            total: categoryStats[key],
            percentage: totalMonthlyExpense > 0 ? (categoryStats[key] / totalMonthlyExpense) * 100 : 0,
            barWidth: maxCategorySpend > 0 ? (categoryStats[key] / maxCategorySpend) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);

    return { sortedCategories, maxCategorySpend };
  }, [subscriptions, totalMonthlyExpense]);

  // --- RENDER ---

  const renderCategoryItem = (item: any, index: number) => (
    <View key={item.name} style={styles.catContainer}>
        {/* Başlık ve Tutar */}
        <View style={styles.catHeader}>
            <View style={styles.catTitleRow}>
                <View style={[styles.dot, { backgroundColor: getCategoryColor(index) }]} />
                <Text style={styles.catName}>{item.name}</Text>
            </View>
            <View>
                <Text style={styles.catPrice}>{item.total.toFixed(0)} ₺</Text>
            </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.barBackground}>
            <View 
                style={[
                    styles.barFill, 
                    { 
                        width: `${item.barWidth}%`, 
                        backgroundColor: getCategoryColor(index) 
                    }
                ]} 
            />
        </View>
        <Text style={styles.catPercent}>Toplamın %{item.percentage.toFixed(1)}'i</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Harcama Analizi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
{/* ÖZET KARTI (MODERN GÖRÜNÜM) */}
        <View style={styles.totalCard}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={styles.totalLabel}>Aylık Tahmini Gider</Text>
                <Text style={styles.totalValue}>{totalMonthlyExpense.toFixed(0)} <Text style={{fontSize: 20, color:'#ccc'}}>₺</Text></Text>
            </View>
            
            {/* Alt Bilgi Izgarası */}
            <View style={styles.statsGrid}>
                
                {/* 1. Sütun: Yıllık */}
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Yıllık</Text>
                    <Text style={styles.statValue}>{(totalMonthlyExpense * 12).toFixed(0)} ₺</Text>
                </View>

                <View style={styles.verticalLine} />

                {/* 2. Sütun: Aktif */}
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Aktif</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.statusDot, { backgroundColor: '#2ecc71' }]} />
                        <Text style={styles.statValue}>{activeSubsCount}</Text>
                    </View>
                </View>

                {/* 3. Sütun: Pasif (Varsa Göster) */}
                {passiveSubsCount > 0 && (
                    <>
                        <View style={styles.verticalLine} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Dondurulan</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.statusDot, { backgroundColor: '#f1c40f' }]} />
                                <Text style={[styles.statValue, { color: '#f1c40f' }]}>{passiveSubsCount}</Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </View>

        {/* KATEGORİ LİSTESİ */}
        <Text style={styles.sectionTitle}>Kategorilere Göre Dağılım</Text>
        
        {statistics.sortedCategories.length > 0 ? (
            <View style={styles.chartContainer}>
                {statistics.sortedCategories.map((item, index) => renderCategoryItem(item, index))}
            </View>
        ) : (
            <View style={styles.emptyState}>
                <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Aktif abonelik verisi yok.</Text>
            </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// Yardımcı: Renk Paleti
const getCategoryColor = (index: number) => {
    const colors = ['#333333', '#555555', '#777777', '#999999', '#AAAAAA', '#CCCCCC'];
    return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  content: { padding: 20 },
  
  // Toplam Kartı
totalCard: { 
      backgroundColor: '#333', 
      borderRadius: 24, // Daha yuvarlak köşeler
      padding: 20, 
      marginBottom: 25,
      shadowColor: '#000', 
      shadowOpacity: 0.2, 
      shadowRadius: 8, 
      elevation: 5 
  },
  totalLabel: { 
      color: '#aaa', 
      fontSize: 12, 
      marginBottom: 5, 
      textTransform: 'uppercase', 
      letterSpacing: 1,
      fontWeight: '600'
  },
  totalValue: { 
      color: '#fff', 
      fontSize: 42, // Ana tutar daha büyük
      fontWeight: 'bold' 
  },
  divider: { height: 1, backgroundColor: '#555', marginVertical: 15 },
  projectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, // alignItems changed
  projLabel: { color: '#bbb', fontSize: 12, marginBottom: 2 },
  projValue: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Kategori Listesi
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  chartContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#eee' },
  catContainer: { marginBottom: 18 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catTitleRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  catName: { fontSize: 14, color: '#333', fontWeight: '600' },
  catPrice: { fontSize: 14, color: '#333', fontWeight: 'bold' },
  
  // Custom Progress Bar
  barBackground: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  catPercent: { fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right' },

  emptyState: { alignItems: 'center', marginTop: 30 },
  emptyText: { color: '#999', marginTop: 10 },
  statsGrid: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.1)', // Hafif transparan zemin
      borderRadius: 16,
      paddingVertical: 15,
      paddingHorizontal: 10,
      justifyContent: 'space-around', // Eşit dağılım
      alignItems: 'center'
  },
  statItem: {
      alignItems: 'center',
      minWidth: 60,
  },
  statLabel: {
      color: '#bbb',
      fontSize: 10,
      marginBottom: 4,
      fontWeight: '600',
      textTransform: 'uppercase'
  },
  statValue: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold'
  },
  verticalLine: {
      width: 1,
      height: '70%',
      backgroundColor: 'rgba(255,255,255,0.2)'
  },
  statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6
  },
});