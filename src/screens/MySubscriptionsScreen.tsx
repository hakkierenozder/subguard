import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal'; // Import Et
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';

export default function MySubscriptionsScreen() {
  const { subscriptions, removeSubscription, getTotalExpense, getNextPayment } = useUserSubscriptionStore();
  const totalExpense = getTotalExpense();
  const nextPayment = getNextPayment();

  // Düzenlenecek aboneliği tutan state
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Aboneliği Sil", `${name} aboneliğini silmek istiyor musun?`, [
        { text: "Vazgeç", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: () => removeSubscription(id) }
    ]);
  };

  const renderItem = ({ item }: { item: UserSubscription }) => (
    // Kartın kendisine tıklayınca Düzenleme Modunu aç
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: item.colorCode || '#333' }]}
      onPress={() => setEditingSub(item)} // Tıklayınca state'e atar
    >
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price} {item.currency}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.dateText}>Sonraki Ödeme:</Text>
          <Text style={styles.dateValue}>{item.billingDay}. Gün</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.name)}>
        <Text style={styles.deleteText}>Sil</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Cüzdanım</Text>

{/* 1. KART: Toplam Tutar (Mevcut) */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Aylık Toplam</Text>
          <Text style={styles.summaryValue}>{totalExpense.toFixed(2)} TRY</Text>
        </View>

        {/* 2. KART: Sıradaki Ödeme (YENİ) */}
        {nextPayment && (
          <View style={[styles.nextPaymentCard, { borderLeftColor: nextPayment.colorCode || '#333' }]}>
            <View>
              <Text style={styles.nextPaymentLabel}>Sıradaki Ödeme</Text>
              <Text style={styles.nextPaymentName}>{nextPayment.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
               <Text style={styles.nextPaymentDate}>
                 {nextPayment.billingDay >= new Date().getDate() ? 'Bu Ay' : 'Gelecek Ay'}
               </Text>
               <Text style={styles.nextPaymentDay}>{nextPayment.billingDay}. Gün</Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz abonelik yok.</Text>}
      />

      {/* DÜZENLEME MODALI */}
      {/* visible={!!editingSub} demek, editingSub doluysa true, boşsa false demektir */}
      <AddSubscriptionModal 
        visible={!!editingSub} 
        onClose={() => setEditingSub(null)} 
        selectedCatalogItem={null} 
        subscriptionToEdit={editingSub} // Düzenlenecek veriyi gönderiyoruz
      />
    </SafeAreaView>
  );
}

// ... styles aynı kalabilir, sadece emptyText ekle veya mevcut olanı kullan ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { padding: 20, backgroundColor: '#fff', paddingBottom: 10 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  summaryCard: { backgroundColor: '#333', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  summaryTitle: { color: '#ccc', fontSize: 16 },
  summaryValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, padding: 16, borderLeftWidth: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginRight: 10 },
  name: { fontSize: 18, fontWeight: '600', color: '#333' },
  price: { fontSize: 16, color: '#2ecc71', fontWeight: 'bold', marginTop: 4 },
  dateText: { fontSize: 12, color: '#999' },
  dateValue: { fontSize: 14, color: '#555', fontWeight: '500' },
  deleteButton: { padding: 8 },
  deleteText: { color: 'red', fontSize: 14, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
  nextPaymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 6, // Renkli çizgi
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextPaymentLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  nextPaymentName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  nextPaymentDate: { fontSize: 12, color: '#666', marginBottom: 2 },
  nextPaymentDay: { fontSize: 16, fontWeight: 'bold', color: '#e74c3c' },
});