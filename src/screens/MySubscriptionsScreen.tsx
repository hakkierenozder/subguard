import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal'; // Import Et
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { Linking } from 'react-native'; // Import et
import { Ionicons } from '@expo/vector-icons';

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

  const getDaysLeft = (dateString?: string) => {
    if (!dateString) return null;
    const end = new Date(dateString);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSendReminder = (item: UserSubscription) => {
    if (!item.sharedWith || item.sharedWith.length === 0) return;

    const shareAmount = (item.price / (item.sharedWith.length + 1)).toFixed(2);
    const message = `Selam! 👋 ${item.name} aboneliği için bu ayki payına düşen miktar: ${shareAmount} ${item.currency}. Gönderebilirsen süper olur! 💸`;

    // WhatsApp URL Şeması
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Hata", "WhatsApp yüklü değil veya açılamadı.");
    });
  };

  const renderItem = ({ item }: { item: UserSubscription }) => {
    // 1. Taahhüt Hesaplamaları
    const daysLeft = item.hasContract ? getDaysLeft(item.contractEndDate) : null;
    const isCritical = daysLeft !== null && daysLeft <= 90 && daysLeft > 0;
    const isExpired = daysLeft !== null && daysLeft <= 0;

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: item.colorCode || '#333' }]}
        onPress={() => setEditingSub(item)}
      >
        <View style={styles.cardContent}>
          {/* --- SOL TARA --- */}
          <View>
            {/* İSİM ve ORTAK İKONU SATIRI */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.name}>{item.name}</Text>
              {/* Eğer ortak varsa ikon göster */}
              {item.sharedWith && item.sharedWith.length > 0 && (
                <Ionicons name="people" size={18} color="#999" style={{ marginLeft: 8 }} />
              )}
            </View>

            {/* TAAHHÜT UYARISI (Varsa) */}
            {item.hasContract && daysLeft !== null && (
              <View style={{ marginTop: 5 }}>
                {isExpired ? (
                  <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 12 }}>SÖZLEŞME BİTTİ!</Text>
                ) : (
                  <Text style={{
                    color: isCritical ? '#e74c3c' : '#7f8c8d',
                    fontWeight: isCritical ? 'bold' : 'normal',
                    fontSize: 12
                  }}>
                    Taahhüt Bitiş: {daysLeft} gün kaldı
                  </Text>
                )}
              </View>
            )}

            {/* Sözleşme yoksa fiyatı solda küçük göster (Eski mantık) */}
            {!item.hasContract && (
              <Text style={styles.price}>{item.price} {item.currency}</Text>
            )}
          </View>

          {/* --- SAĞ TARAF --- */}
          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>

            {/* Duruma Göre Bilgi Gösterimi */}
            {item.hasContract ? (
              // Sözleşmeliyse Fiyatı Büyük Göster
              <Text style={[styles.price, { marginTop: 0, fontSize: 18 }]}>{item.price} {item.currency}</Text>
            ) : (
              // Sözleşme yoksa Tarihi Göster
              <>
                <Text style={styles.dateText}>Sonraki Ödeme:</Text>
                <Text style={styles.dateValue}>{item.billingDay}. Gün</Text>
              </>
            )}

            {/* WHATSAPP BUTONU (Eğer ortak varsa ekle) */}
            {item.sharedWith && item.sharedWith.length > 0 && (
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => handleSendReminder(item)}
              >
                <Ionicons name="logo-whatsapp" size={16} color="white" style={{ marginRight: 4 }} />
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>İste</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>

        {/* Sil Butonu */}
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.name)}>
          <Text style={styles.deleteText}>Sil</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Cüzdanım</Text>

        {/* 1. KART: Toplam Tutar (Mevcut) */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Aylık Toplam (Tahmini)</Text>
          <Text style={styles.summaryValue}>≈ {totalExpense.toFixed(2)} ₺</Text>
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

  whatsappButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366', // WhatsApp Yeşili
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 6
  }
});