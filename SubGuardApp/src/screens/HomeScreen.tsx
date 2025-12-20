import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../store/useCatalogStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { CatalogItem, UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import UsageSurveyModal from '../components/UsageSurveyModal'; // <-- Anketi ekledik
import { getUserName } from '../utils/AuthManager';
import { Ionicons } from '@expo/vector-icons';
import { convertToTRY } from '../utils/CurrencyService';

export default function HomeScreen() {
  // Store'lar
  const { catalogItems, fetchCatalog, loading: catalogLoading } = useCatalogStore();
  const { 
    subscriptions, 
    fetchUserSubscriptions, 
    getTotalExpense, 
    getPendingSurvey,
    logUsage 
  } = useUserSubscriptionStore();

  // State'ler
  const [userName, setUserName] = useState('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Anket State'i
  const [surveySub, setSurveySub] = useState<UserSubscription | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Kullanıcı ve Veri Yükleme
  const loadData = async () => {
    const name = await getUserName();
    setUserName(name);
    
    await Promise.all([
        fetchCatalog(),
        fetchUserSubscriptions()
    ]);

    // Anket Kontrolü (Veriler yüklendikten sonra)
    checkSurvey(); 
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const checkSurvey = () => {
      const pending = getPendingSurvey();
      if (pending) {
          // Biraz gecikmeli açalım ki kullanıcı korkmasın
          setTimeout(() => setSurveySub(pending), 1500);
      }
  };

  // Yaklaşan Ödemeler (En yakın 2)
  const upcomingPayments = [...subscriptions]
    .sort((a, b) => {
        const today = new Date().getDate();
        const dayA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
        const dayB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
        return dayA - dayB;
    })
    .slice(0, 2);

  // --- RENDER ---

  const renderUpcomingCard = (item: UserSubscription) => {
      const today = new Date().getDate();
      let daysLeft = item.billingDay - today;
      if (daysLeft < 0) daysLeft += 30;
      
      return (
        <View key={item.id} style={[styles.upcomingCard, { borderLeftColor: item.colorCode || '#333' }]}>
            <View>
                <Text style={styles.upName}>{item.name}</Text>
                <Text style={styles.upPrice}>{item.price} {item.currency}</Text>
            </View>
            <View style={styles.upDayContainer}>
                <Text style={styles.upDayVal}>{daysLeft}</Text>
                <Text style={styles.upDayLabel}>gün kaldı</Text>
            </View>
        </View>
      );
  };

  const renderCatalogItem = ({ item }: { item: CatalogItem }) => (
    <TouchableOpacity style={styles.catalogItem} onPress={() => setSelectedItem(item)}>
      <View style={[styles.iconPlaceholder, { backgroundColor: item.colorCode || '#ddd' }]}>
        <Text style={styles.iconText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <Ionicons name="add-circle" size={28} color="#333" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Merhaba,</Text>
                <Text style={styles.username}>{userName} 👋</Text>
            </View>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userName?.charAt(0).toUpperCase()}</Text>
            </View>
        </View>

        {/* ÖZET PANOSU */}
        <View style={styles.dashboard}>
            <View style={styles.dashItem}>
                <Text style={styles.dashLabel}>Aylık Toplam</Text>
                <Text style={styles.dashValue}>{getTotalExpense().toFixed(0)} ₺</Text>
            </View>
            <View style={styles.dashDivider} />
            <View style={styles.dashItem}>
                <Text style={styles.dashLabel}>Aktif Abonelik</Text>
                <Text style={styles.dashValue}>{subscriptions.length}</Text>
            </View>
        </View>

        {/* YAKLAŞAN ÖDEMELER */}
        {upcomingPayments.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yaklaşan Ödemeler</Text>
                <View style={styles.upcomingRow}>
                    {upcomingPayments.map(renderUpcomingCard)}
                </View>
            </View>
        )}

        {/* KEŞFET (KATALOG) */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yeni Abonelik Ekle</Text>
            <FlatList
                data={catalogItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCatalogItem}
                scrollEnabled={false} // Ana scroll ile çakışmasın
                contentContainerStyle={styles.listContainer}
            />
        </View>

      </ScrollView>

      {/* MODALLAR */}
      <AddSubscriptionModal
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        selectedCatalogItem={selectedItem}
      />

      <UsageSurveyModal
        visible={!!surveySub}
        subscription={surveySub}
        onClose={() => setSurveySub(null)}
        onResponse={(status) => {
            if (surveySub) logUsage(surveySub.id, status);
            setSurveySub(null);
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 16, color: '#666' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  avatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Dashboard
  dashboard: { 
      flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 25,
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 
  },
  dashItem: { flex: 1, alignItems: 'center' },
  dashLabel: { fontSize: 12, color: '#999', marginBottom: 5, textTransform: 'uppercase', fontWeight: '600' },
  dashValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  dashDivider: { width: 1, backgroundColor: '#eee', marginHorizontal: 10 },

  // Yaklaşanlar
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  upcomingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  upcomingCard: { 
      flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, marginRight: 10,
      borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  upName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  upPrice: { fontSize: 12, color: '#666', marginTop: 2 },
  upDayContainer: { alignItems: 'center' },
  upDayVal: { fontSize: 16, fontWeight: 'bold', color: '#e74c3c' },
  upDayLabel: { fontSize: 8, color: '#999' },

  // Katalog Liste
  listContainer: { paddingBottom: 10 },
  catalogItem: { 
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
      padding: 12, borderRadius: 12, marginBottom: 10, 
      borderWidth: 1, borderColor: '#f0f0f0' 
  },
  iconPlaceholder: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemCategory: { fontSize: 12, color: '#999' }
});