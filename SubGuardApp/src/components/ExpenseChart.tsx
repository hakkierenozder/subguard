import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { convertToTRY } from '../utils/CurrencyService';

const screenWidth = Dimensions.get('window').width;

// Renk Paleti (Kategoriler için)
const CATEGORY_COLORS: Record<string, string> = {
  'Streaming': '#E50914', // Kırmızı
  'Music': '#1DB954',     // Yeşil
  'GSM': '#FFC900',       // Sarı
  'Cloud': '#00A8E8',     // Mavi
  'Genel': '#bdc3c7',     // Gri
  'Game': '#9b59b6'       // Mor
};

export default function ExpenseChart() {
  const subscriptions = useUserSubscriptionStore((state) => state.subscriptions);

  // --- Veri Analizi ve Gruplama ---
  const categoryTotals: Record<string, number> = {};

  subscriptions.forEach(sub => {
    // 1. Kategoriyi belirle (Veri yoksa 'Genel' yap)
    const cat = sub.category || 'Genel';
    
    // 2. Fiyatı TL'ye çevir
    const amountInTry = convertToTRY(sub.price, sub.currency);

    // 3. Topla
    if (categoryTotals[cat]) {
      categoryTotals[cat] += amountInTry;
    } else {
      categoryTotals[cat] = amountInTry;
    }
  });

  // --- Grafik Verisine Dönüştürme ---
  const chartData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    population: parseFloat(categoryTotals[cat].toFixed(2)), // Tutar
    color: CATEGORY_COLORS[cat] || `#${Math.floor(Math.random()*16777215).toString(16)}`, // Tanımlı renk yoksa rastgele
    legendFontColor: "#7F7F7F",
    legendFontSize: 12
  }));

  // Eğer hiç veri yoksa boş dön
  if (chartData.length === 0) {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Grafik için henüz veri yok.</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Harcama Dağılımı (TL)</Text>
      <PieChart
        data={chartData}
        width={screenWidth - 40} // Ekran genişliğinden biraz pay bırak
        height={220}
        chartConfig={{
          backgroundColor: "#1cc910",
          backgroundGradientFrom: "#eff3ff",
          backgroundGradientTo: "#efefef",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={"population"} // Veri değeri hangi alanda?
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        center={[10, 0]} // Ortala
        absolute // Değerleri mutlak sayı olarak göster (Yüzde değil)
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginTop: 20,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 10
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic'
  }
});