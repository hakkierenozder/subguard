import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { Ionicons } from '@expo/vector-icons';
import { convertToTRY } from '../utils/CurrencyService'; // <-- Bunu eklemeyi unutma!

// Sıralama Tipleri
type SortType = 'date' | 'price_desc' | 'price_asc' | 'name';

export default function MySubscriptionsScreen() {
  const {
    subscriptions,
    removeSubscription,
    getTotalExpense,
    getNextPayment,
    fetchUserSubscriptions,
    loading
  } = useUserSubscriptionStore();

  const totalExpense = getTotalExpense();
  const nextPayment = getNextPayment();

  // State'ler
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
  const [isModalVisible, setModalVisible] = useState(false); // YENİ: Modal görünürlüğü tek başına kontrol et
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('date');

  // İlk Açılış
  React.useEffect(() => {
    fetchUserSubscriptions();
  }, []);

  // Aşağı Çekince Yenile
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserSubscriptions();
    setRefreshing(false);
  }, []);

  // --- FİLTRELEME VE SIRALAMA MANTIĞI ---
  const getFilteredSubscriptions = () => {
    // 1. Arama Filtresi
    let filtered = subscriptions.filter(sub =>
      sub.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // 2. Sıralama
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          // Ödeme gününe göre (Yaklaşanlar önce)
          const today = new Date().getDate();
          const dayA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
          const dayB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
          return dayA - dayB;

        case 'price_desc':
          // Fiyat (Pahalıdan ucuza) - Kur çevirerek karşılaştır
          return convertToTRY(b.price, b.currency) - convertToTRY(a.price, a.currency);

        case 'price_asc':
          // Fiyat (Ucuzdan pahalıya)
          return convertToTRY(a.price, a.currency) - convertToTRY(b.price, b.currency);

        case 'name':
          // İsim (A-Z)
          return a.name.localeCompare(b.name);

        default:
          return 0;
      }
    });
  };

  const filteredData = getFilteredSubscriptions();

  // --- YARDIMCI FONKSİYONLAR ---
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSendReminder = (item: UserSubscription) => {
    if (!item.sharedWith || item.sharedWith.length === 0) return;
    const shareAmount = (item.price / (item.sharedWith.length + 1)).toFixed(2);
    const message = `Selam! 👋 ${item.name} aboneliği için bu ayki payına düşen miktar: ${shareAmount} ${item.currency}.`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert("Hata", "WhatsApp açılamadı."));
  };

  // --- RENDER COMPONENTLERİ ---

  const renderSortChip = (type: SortType, label: string, icon: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      style={[styles.sortChip, sortBy === type && styles.activeSortChip]}
      onPress={() => setSortBy(type)}
    >
      <Ionicons name={icon} size={14} color={sortBy === type ? '#fff' : '#666'} style={{ marginRight: 4 }} />
      <Text style={[styles.sortChipText, sortBy === type && styles.activeSortChipText]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.header}>Cüzdanım</Text>

      {/* ÖZET KARTLAR */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCardSmall}>
          <Text style={styles.summaryLabel}>Aylık Toplam</Text>
          <Text style={styles.summaryValue}>≈ {totalExpense.toFixed(0)} ₺</Text>
        </View>

        {nextPayment && (
          <View style={[styles.summaryCardSmall, { borderLeftColor: nextPayment.colorCode || '#333', borderLeftWidth: 4 }]}>
            <Text style={styles.summaryLabel}>Sonraki Ödeme</Text>
            <Text style={styles.nextPaymentName}>{nextPayment.name}</Text>
            <Text style={styles.nextPaymentDate}>{nextPayment.billingDay}. Gün</Text>
          </View>
        )}
      </View>

      {/* ARAMA VE SIRALAMA ALANI */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Abonelik ara..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sortRow}>
          {renderSortChip('date', 'Tarih', 'calendar-outline')}
          {renderSortChip('price_desc', 'Pahalı', 'arrow-up-outline')}
          {renderSortChip('price_asc', 'Ucuz', 'arrow-down-outline')}
          {renderSortChip('name', 'A-Z', 'text-outline')}
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: UserSubscription }) => {
    const daysLeft = item.hasContract ? getDaysLeft(item.contractEndDate) : null;
    const isCritical = daysLeft !== null && daysLeft <= 90 && daysLeft > 0;
    const isExpired = daysLeft !== null && daysLeft <= 0;

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: item.colorCode || '#333' }]}
        onPress={() => setEditingSub(item)}
      >
        <View style={styles.cardContent}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.sharedWith && item.sharedWith.length > 0 && (
                <Ionicons name="people" size={16} color="#999" style={{ marginLeft: 6 }} />
              )}
            </View>

            {item.hasContract && daysLeft !== null ? (
              <View style={{ marginTop: 4 }}>
                {isExpired ? (
                  <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 11 }}>BİTTİ!</Text>
                ) : (
                  <Text style={{ color: isCritical ? '#e74c3c' : '#7f8c8d', fontSize: 11 }}>
                    {daysLeft} gün kaldı
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.price}>{item.price} {item.currency}</Text>
            )}
          </View>

          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
            {item.hasContract ? (
              <Text style={[styles.price, { marginTop: 0, fontSize: 16 }]}>{item.price} {item.currency}</Text>
            ) : (
              <>
                <Text style={styles.dateValue}>{item.billingDay}. Gün</Text>
                <Text style={styles.dateText}>Ödeme</Text>
              </>
            )}

            {item.sharedWith && item.sharedWith.length > 0 && (
              <TouchableOpacity style={styles.whatsappButton} onPress={() => handleSendReminder(item)}>
                <Ionicons name="logo-whatsapp" size={14} color="white" />
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 2 }}>İste</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.name)}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {searchText ? (
              <Text style={styles.emptyText}>"{searchText}" bulunamadı.</Text>
            ) : (
              <Text style={styles.emptyText}>Henüz abonelik yok.</Text>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#333']} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingSub(null); // Düzenleme değil
          setModalVisible(true); // Modalı aç
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <AddSubscriptionModal
        visible={!!editingSub}
        onClose={() => setEditingSub(null)}
        selectedCatalogItem={null}
        subscriptionToEdit={editingSub}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { padding: 20, backgroundColor: '#fff', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, color: '#333' },

  // Özet Kartlar
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCardSmall: {
    flex: 1, backgroundColor: '#f8f9fa', padding: 12, borderRadius: 12, marginHorizontal: 4,
    borderWidth: 1, borderColor: '#eee'
  },
  summaryLabel: { fontSize: 11, color: '#999', marginBottom: 2, textTransform: 'uppercase', fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  nextPaymentName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  nextPaymentDate: { fontSize: 12, color: '#e74c3c', fontWeight: '600' },

  // Arama ve Filtre
  filterSection: {},
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f5',
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginBottom: 12
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sortChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd'
  },
  activeSortChip: { backgroundColor: '#333', borderColor: '#333' },
  sortChipText: { fontSize: 11, color: '#666', fontWeight: '600' },
  activeSortChipText: { color: '#fff' },

  // Liste Elemanları
  card: {
    backgroundColor: 'white', borderRadius: 12, marginBottom: 12, marginHorizontal: 20, padding: 16,
    borderLeftWidth: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  cardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginRight: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 15, color: '#2ecc71', fontWeight: 'bold', marginTop: 2 },
  dateText: { fontSize: 10, color: '#999' },
  dateValue: { fontSize: 14, color: '#555', fontWeight: 'bold' },
  deleteButton: { padding: 8 },

  whatsappButton: { flexDirection: 'row', backgroundColor: '#25D366', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', marginTop: 6 },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999, // <-- BU SATIRI EKLE (Dokunmayı garanti eder)
  }
});