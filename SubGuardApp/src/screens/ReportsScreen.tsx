import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ExpenseChart from '../components/ExpenseChart';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { convertToTRY } from '../utils/CurrencyService';

export default function ReportsScreen() {
  const { getTotalExpense, subscriptions } = useUserSubscriptionStore();
  const totalExpense = getTotalExpense();

  // En çok harcama yapılan kategoriyi bulalım (Basit bir analiz)
  const getTopCategory = () => {
    const totals: Record<string, number> = {};
    subscriptions.forEach(sub => {
        const cat = sub.category || 'Genel';
        const amount = convertToTRY(sub.price, sub.currency);
        totals[cat] = (totals[cat] || 0) + amount;
    });
    
    let maxCat = '-';
    let maxVal = 0;
    
    Object.entries(totals).forEach(([cat, val]) => {
        if (val > maxVal) {
            maxVal = val;
            maxCat = cat;
        }
    });
    return maxCat;
  };

  const getWastedMoney = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    let wasted = 0;

    subscriptions.forEach(sub => {
        const history = sub.usageHistory || [];
        const thisMonthLog = history.find(h => h.month === currentMonth);
        
        if (thisMonthLog && thisMonthLog.status === 'none') {
            wasted += convertToTRY(sub.price, sub.currency);
        }
    });
    return wasted;
  };

  const wastedAmount = getWastedMoney();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Analiz & Raporlar</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        {/* Özet Kartları */}
        <View style={styles.statsRow}>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Toplam Gider</Text>
                <Text style={styles.statValue}>≈ {totalExpense.toFixed(0)} ₺</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>En Çok Harcama</Text>
                <Text style={styles.statValue}>{getTopCategory()}</Text>
            </View>

            {/* YENİ KART: TASARRUF FIRSATI */}
            <View style={[styles.statCard, wastedAmount > 0 && {backgroundColor: '#ffebee'}]}>
                <Text style={[styles.statLabel, wastedAmount > 0 && {color: '#c62828'}]}>
                    {wastedAmount > 0 ? 'Boşa Giden 😱' : 'Verimli ✅'}
                </Text>
                <Text style={[styles.statValue, wastedAmount > 0 && {color: '#d32f2f'}]}>
                    {wastedAmount > 0 ? `≈ ${wastedAmount.toFixed(0)} ₺` : '0 ₺'}
                </Text>
            </View>
        </View>

        {/* Grafik Alanı */}
        <Text style={styles.sectionTitle}>Harcama Dağılımı</Text>
        {subscriptions.length > 0 ? (
            <ExpenseChart />
        ) : (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Analiz için veri bekleniyor...</Text>
            </View>
        )}

        {/* Buraya ileride başka grafikler de ekleyebiliriz (Örn: Yıllık tahmin) */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { padding: 20, backgroundColor: '#fff', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { 
      flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, marginHorizontal: 5,
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, alignItems: 'center'
  },
  statLabel: { fontSize: 12, color: '#999', marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10, marginLeft: 5 },
  
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999' }
});