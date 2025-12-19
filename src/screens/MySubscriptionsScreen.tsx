import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { UserSubscription } from '../types';

export default function MySubscriptionsScreen() {
  const { subscriptions, removeSubscription, getTotalExpense } = useUserSubscriptionStore();
  const totalExpense = getTotalExpense();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Aboneliği Sil",
      `${name} aboneliğini silmek istiyor musun?`,
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: () => removeSubscription(id) }
      ]
    );
  };

  const renderItem = ({ item }: { item: UserSubscription }) => (
    <View style={[styles.card, { borderLeftColor: item.colorCode || '#333' }]}>
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

      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => handleDelete(item.id, item.name)}
      >
        <Text style={styles.deleteText}>Sil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Cüzdanım</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Aylık Toplam</Text>
          <Text style={styles.summaryValue}>{totalExpense.toFixed(2)} TRY</Text>
        </View>
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz hiç abonelik eklemedin.</Text>
            <Text style={styles.emptySubText}>Katalog sekmesinden ekleyebilirsin.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { padding: 20, backgroundColor: '#fff', paddingBottom: 10 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 15 },
  
  summaryCard: {
    backgroundColor: '#333', borderRadius: 16, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5
  },
  summaryTitle: { color: '#ccc', fontSize: 16 },
  summaryValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  card: {
    backgroundColor: 'white', borderRadius: 12, marginBottom: 12, padding: 16,
    borderLeftWidth: 6, // Sol tarafta renkli çizgi
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  cardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginRight: 10 },
  name: { fontSize: 18, fontWeight: '600', color: '#333' },
  price: { fontSize: 16, color: '#2ecc71', fontWeight: 'bold', marginTop: 4 },
  dateText: { fontSize: 12, color: '#999' },
  dateValue: { fontSize: 14, color: '#555', fontWeight: '500' },

  deleteButton: { padding: 8 },
  deleteText: { color: 'red', fontSize: 14, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  emptySubText: { fontSize: 14, color: '#999', marginTop: 5 }
});