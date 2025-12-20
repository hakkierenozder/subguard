import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../store/useCatalogStore';
import { CatalogItem } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal'; // Import Et
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import UsageSurveyModal from '../components/UsageSurveyModal';
import { UserSubscription, UsageStatus } from '../types/index';

export default function HomeScreen() {
  const { items, loading, error, fetchCatalogs } = useCatalogStore();
  const { getPendingSurvey, logUsage } = useUserSubscriptionStore();

  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [surveySub, setSurveySub] = useState<UserSubscription | null>(null);

useEffect(() => {
    fetchCatalogs();
    
    // Sayfa açıldığında anket var mı kontrol et
    // (Kullanıcıyı boğmamak için 1 saniye gecikmeli açılabilir)
    const timer = setTimeout(() => {
        const pending = getPendingSurvey();
        if (pending) {
            setSurveySub(pending);
        }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSurveyAnswer = (status: UsageStatus) => {
    if (surveySub) {
        logUsage(surveySub.id, status);
        setSurveySub(null); // Modalı kapat
        
        // İstersen ardışık sormak için tekrar kontrol ettirebilirsin:
        // const next = getPendingSurvey();
        // if(next) setSurveySub(next);
    }
  };

  const handleCardPress = (item: CatalogItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text>{error}</Text></View>;

  const renderItem = ({ item }: { item: CatalogItem }) => (
    <TouchableOpacity
      style={[styles.card, { borderColor: item.colorCode || '#ddd' }]}
      onPress={() => handleCardPress(item)} // Tıklama Olayı
    >
      {item.logoUrl ? (
        <Image source={{ uri: item.logoUrl }} style={styles.logo} resizeMode="contain" />
      ) : (
        <View style={[styles.placeholderLogo, { backgroundColor: item.colorCode || '#999' }]}>
          <Text style={styles.placeholderText}>{item.name.charAt(0)}</Text>
        </View>
      )}
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardCategory}>{item.category}</Text>
      <Text style={styles.planCount}>{item.plans?.length || 0} Paket</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Abonelik Ekle</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />

      {/* ANKET MODALI */}
      <UsageSurveyModal 
        visible={!!surveySub}
        subscription={surveySub}
        onAnswer={handleSurveyAnswer}
        onClose={() => setSurveySub(null)}
      />

      {/* MODAL BİLEŞENİ */}
      <AddSubscriptionModal
        visible={modalVisible}
        selectedCatalogItem={selectedItem}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ... styles aynı kalacak ...
const styles = StyleSheet.create({
  // ... eski stiller aynı ...
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: 'white',
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }
  },
  logo: { width: 50, height: 50, marginBottom: 8 },
  placeholderLogo: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  placeholderText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardCategory: { fontSize: 12, color: '#666' },
  planCount: { fontSize: 10, color: '#999', marginTop: 4 },
  retryButton: { backgroundColor: '#333', padding: 10, borderRadius: 5 }
});