import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { Ionicons } from '@expo/vector-icons';
import { convertToTRY } from '../utils/CurrencyService';

type SortType = 'date' | 'price_desc' | 'price_asc' | 'name';

export default function MySubscriptionsScreen() {
  const {
    subscriptions,
    removeSubscription,
    getTotalExpense,
    getNextPayment,
    fetchUserSubscriptions,
  } = useUserSubscriptionStore();

  const totalExpense = getTotalExpense();
  const nextPayment = getNextPayment();

  // State'ler
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
  const [detailSub, setDetailSub] = useState<UserSubscription | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('date');

  React.useEffect(() => {
    fetchUserSubscriptions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserSubscriptions();
    setRefreshing(false);
  }, []);

  const getFilteredSubscriptions = () => {
    let filtered = subscriptions.filter(sub =>
      sub.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const today = new Date().getDate();
          const dayA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
          const dayB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
          return dayA - dayB;
        case 'price_desc':
          return convertToTRY(b.price, b.currency) - convertToTRY(a.price, a.currency);
        case 'price_asc':
          return convertToTRY(a.price, a.currency) - convertToTRY(b.price, b.currency);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const filteredData = getFilteredSubscriptions();

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

  // --- Modal Geçiş Fonksiyonu (YENİ) ---
  const handleEditFromDetail = (sub: UserSubscription) => {
    setDetailSub(null); // Önce detayı kapat
    // Modal kapanma animasyonu bitene kadar bekle (500ms), sonra düzenlemeyi aç
    setTimeout(() => {
      setEditingSub(sub);
    }, 500);
  };

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

      <View style={styles.summaryRow}>
        <View style={styles.summaryCardSmall}>
          <Text style={styles.summaryLabel}>Aylık Payın</Text>
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
    const isPassive = item.isActive === false; // Pasif mi?
    const daysLeft = item.hasContract ? getDaysLeft(item.contractEndDate) : null;
    const isCritical = daysLeft !== null && daysLeft <= 90 && daysLeft > 0;
    const isExpired = daysLeft !== null && daysLeft <= 0;

    const partnerCount = (item.sharedWith?.length || 0);
    const myShare = partnerCount > 0
      ? (item.price / (partnerCount + 1)).toFixed(2)
      : null;

    const themeColor = item.colorCode || '#333';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { borderLeftColor: themeColor },
          isPassive && { opacity: 0.6, backgroundColor: '#f9f9f9' } // Pasifse soluklaştır
        ]}
        onPress={() => setDetailSub(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>

          {/* SOL TARAF: Bilgiler */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={[styles.name, isPassive && { textDecorationLine: 'line-through', color: '#999' }]} numberOfLines={1}>
                {item.name}
              </Text>

              {item.hasContract && daysLeft !== null && (
                <View style={[styles.badge, { backgroundColor: isCritical || isExpired ? '#ffebee' : '#e3f2fd' }]}>
                  <Text style={[styles.badgeText, { color: isCritical || isExpired ? '#c62828' : '#1565c0' }]}>
                    {isExpired ? '!' : `${daysLeft} Gün`}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[styles.price, { color: themeColor }]}>
                {item.price} <Text style={{ fontSize: 12, color: '#999', fontWeight: '600' }}>{item.currency}</Text>
              </Text>
            </View>

            {myShare ? (
              <View style={styles.shareInfoContainer}>
                <Ionicons name="people" size={10} color="#666" style={{ marginRight: 4 }} />
                <Text style={styles.shareInfoText}>
                  Payın: <Text style={{ color: themeColor, fontWeight: '700' }}>{myShare}</Text>
                </Text>
              </View>
            ) : item.hasContract && item.contractEndDate ? (
              <Text style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                Bitiş: {new Date(item.contractEndDate).toLocaleDateString('tr-TR')}
              </Text>
            ) : null}
          </View>

          {/* SAĞ TARAF: WhatsApp Butonu + Minimal Takvim */}
          <View style={styles.rightSection}>

            {partnerCount > 0 && (
              <TouchableOpacity style={styles.whatsappIconBtn} onPress={() => handleSendReminder(item)}>
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              </TouchableOpacity>
            )}

            <View style={styles.calendarBox}>
              <View style={[styles.calendarTopStrip, { backgroundColor: themeColor }]} />
              <Text style={[styles.calendarDayText, { color: themeColor }]}>{item.billingDay}</Text>
            </View>

          </View>

        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.name)}>
          <Ionicons name="trash-outline" size={18} color="#ff4444" />
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
        contentContainerStyle={{ paddingBottom: 100 }}
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

      {/* FAB BUTONU */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingSub(null);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* MODALLAR */}

      {/* 1. EKLEME/DÜZENLEME MODALI */}
      <AddSubscriptionModal
        visible={isModalVisible || !!editingSub}
        onClose={() => {
          setModalVisible(false);
          setEditingSub(null);
        }}
        selectedCatalogItem={null}
        subscriptionToEdit={editingSub}
      />

      {/* 2. DETAY MODALI */}
      <SubscriptionDetailModal
        visible={!!detailSub}
        subscription={detailSub}
        onClose={() => setDetailSub(null)}
        onEdit={handleEditFromDetail}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { padding: 20, backgroundColor: '#fff', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, color: '#333' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCardSmall: {
    flex: 1, backgroundColor: '#f8f9fa', padding: 12, borderRadius: 12, marginHorizontal: 4,
    borderWidth: 1, borderColor: '#eee'
  },
  summaryLabel: { fontSize: 11, color: '#999', marginBottom: 2, textTransform: 'uppercase', fontWeight: '600' },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  nextPaymentName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  nextPaymentDate: { fontSize: 12, color: '#e74c3c', fontWeight: '600' },

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

  // --- KART STİLLERİ ---
  card: {
    backgroundColor: 'white', borderRadius: 12, marginBottom: 10, marginHorizontal: 20, padding: 14,
    borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 2,
    flexDirection: 'row', alignItems: 'center'
  },
  cardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginRight: 8 },

  name: { fontSize: 15, fontWeight: '700', color: '#222', flexShrink: 1, marginRight: 6 },
  price: { fontSize: 16, fontWeight: '800' },

  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  badgeText: { fontSize: 9, fontWeight: '700' },

  shareInfoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: '#f8f9fa', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  shareInfoText: { fontSize: 10, color: '#666' },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8
  },

  whatsappIconBtn: {
    marginRight: 10,
    padding: 4
  },

  // Minimal Takvim Stili
  calendarBox: {
    width: 36, height: 36,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    alignItems: 'center',
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#f0f0f0'
  },
  calendarTopStrip: {
    width: '100%',
    height: 5,
    position: 'absolute',
    top: 0
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3
  },

  deleteButton: { padding: 6, marginLeft: 0 },

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
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  }
});