import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, RefreshControl, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { convertToTRY } from '../utils/CurrencyService';

// Tip tanımları
type SortType = 'date' | 'price_desc' | 'name';

// --- MODERN & SADE RENK PALETİ ---
const COLORS = {
  // Yeni Ana Renk: Fırtına Mavisi (Slate Blue)
  // Göz yormaz, cırtlak değildir, premium durur.
  primary: '#334155', 
  
  // Gölge ve derinlik için koyu ton
  primaryDark: '#1E293B', 
  
  background: '#F9FAFB',
  textDark: '#0F172A',
  textLight: '#64748B',
  white: '#FFFFFF',
  
  success: '#10B981',
  passive: '#E2E8F0', // Pasif gri
};

export default function MySubscriptionsScreen() {
  const {
    subscriptions,
    getTotalExpense,
    fetchUserSubscriptions,
  } = useUserSubscriptionStore();

  const totalExpense = getTotalExpense();

  // State Yönetimi
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

  // --- Yardımcı Fonksiyonlar ---

  const getNextPaymentDateText = (billingDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    
    if (billingDay === currentDay) return "Bugün";
    if (billingDay === currentDay + 1) return "Yarın";
    
    let targetDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
    if (currentDay > billingDay) {
        targetDate = new Date(today.getFullYear(), today.getMonth() + 1, billingDay);
    }
    
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return `${diffDays} gün kaldı`;
  };

  const handleShareOnWhatsApp = (item: UserSubscription) => {
    const partnerCount = item.sharedWith?.length || 0;
    const shareAmount = partnerCount > 0 
        ? (item.price / (partnerCount + 1)).toFixed(2) 
        : item.price.toFixed(2);

    const message = `Selam! 👋 ${item.name} aboneliği yenileniyor. Bu ayki payına düşen miktar: ${shareAmount} ${item.currency}.`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Hata", "WhatsApp cihazında yüklü görünmüyor.");
    });
  };

  const getFilteredSubscriptions = () => {
    let filtered = subscriptions.filter(sub =>
      sub.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
           const today = new Date().getDate();
           const valA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
           const valB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
           return valA - valB;
        case 'price_desc':
          return convertToTRY(b.price, b.currency) - convertToTRY(a.price, a.currency);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const handleEditFromDetail = (sub: UserSubscription) => {
    setDetailSub(null);
    setTimeout(() => {
      setEditingSub(sub);
    }, 400);
  };

  // --- Render Components ---

  const renderHeader = () => {
    const activeSubsCount = subscriptions.filter(s => s.isActive !== false).length;

    return (
      <View style={styles.headerContainer}>
        {/* HERO CARD - Yeni Renk ile */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardTop}>
              <View>
                  <Text style={styles.heroLabel}>Aylık Toplam Gider</Text>
                  <View style={styles.heroAmountRow}>
                      <Text style={styles.heroCurrency}>₺</Text>
                      <Text style={styles.heroAmount}>{totalExpense.toFixed(2)}</Text>
                  </View>
              </View>
              <View style={styles.heroIconContainer}>
                  <MaterialCommunityIcons name="wallet-outline" size={32} color={COLORS.white} />
              </View>
          </View>
          
          <View style={styles.heroCardBottom}>
              <Text style={styles.heroSubText}>
                  {activeSubsCount} aktif abonelik yönetiliyor
              </Text>
          </View>
        </View>

        {/* Arama ve Filtreleme */}
        <View style={styles.searchAndFilterContainer}>
          <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Ara..."
                placeholderTextColor={COLORS.textLight}
                value={searchText}
                onChangeText={setSearchText}
              />
          </View>

          <FlatList
              horizontal
              data={['date', 'price_desc', 'name'] as SortType[]}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterListContent}
              renderItem={({ item }) => {
                  let label = '';
                  if(item === 'date') label = 'Yaklaşanlar';
                  else if(item === 'price_desc') label = 'En Yüksek';
                  else label = 'A-Z';

                  const isActive = sortBy === item;
                  return (
                      <TouchableOpacity 
                          onPress={() => setSortBy(item)} 
                          style={[styles.filterChip, isActive && styles.activeFilterChip]}
                      >
                          <Text style={[styles.filterText, isActive && styles.activeFilterText]}>{label}</Text>
                      </TouchableOpacity>
                  );
              }}
          />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: UserSubscription }) => {
    // Logo arkaplanı için ana rengin çok açık bir tonu
    const brandColor = item.colorCode || COLORS.primary;
    const nextPaymentText = getNextPaymentDateText(item.billingDay);
    const isPassive = item.isActive === false;

    const renderLogo = () => (
        <View style={[styles.logoContainer, { backgroundColor: brandColor + '15' }]}> 
          <Text style={[styles.logoText, { color: brandColor }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
    );

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setDetailSub(item)}
        style={[styles.rowContainer, isPassive && styles.passiveRow]}
      >
        <View style={styles.rowLeft}>
          {renderLogo()}
          <View style={styles.textContainer}>
            <Text style={[styles.serviceName, isPassive && { textDecorationLine: 'line-through', color: COLORS.textLight }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.subInfoContainer}>
              <Ionicons name="time-outline" size={12} color={COLORS.textLight} style={{marginRight: 4}} />
              <Text style={styles.nextDateText}>
                  {isPassive ? 'Donduruldu' : nextPaymentText}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rowRight}>
          <Text style={[styles.priceText, isPassive && { color: COLORS.textLight }]}>{item.price}</Text>
          <View style={styles.currencyAndActionRow}>
             <Text style={styles.currencyText}>{item.currency}</Text>
             
             {!isPassive && (
               <TouchableOpacity 
                  style={styles.whatsappButton} 
                  onPress={() => handleShareOnWhatsApp(item)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
               >
                  <FontAwesome5 name="whatsapp" size={14} color="#25D366" />
               </TouchableOpacity>
             )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        
        <FlatList
          data={getFilteredSubscriptions()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="wallet-giftcard" size={48} color={COLORS.passive} />
              <Text style={styles.emptyText}>Henüz abonelik eklemedin.</Text>
            </View>
          }
        />

        {/* FAB (Ekleme Butonu) - Artık Kart Rengiyle Aynı */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => {
            setEditingSub(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </TouchableOpacity>

        <AddSubscriptionModal
          visible={isModalVisible || !!editingSub}
          onClose={() => {
            setModalVisible(false);
            setEditingSub(null);
          }}
          selectedCatalogItem={null}
          subscriptionToEdit={editingSub}
        />

        <SubscriptionDetailModal
          visible={!!detailSub}
          subscription={detailSub}
          onClose={() => setDetailSub(null)}
          onEdit={handleEditFromDetail}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  
  // HERO CARD
  heroCard: {
    backgroundColor: COLORS.primary, // #334155
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLabel: {
    color: '#94A3B8', // Slate 400
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroCurrency: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 6,
    marginRight: 4,
  },
  heroAmount: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 14,
  },
  heroCardBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  heroSubText: {
    color: '#CBD5E1', // Slate 300
    fontSize: 13,
    fontWeight: '500',
  },

  searchAndFilterContainer: {
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    height: '100%',
  },
  filterListContent: {
    paddingRight: 20,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  // AKTİF FİLTRE BUTONU - Kart Rengiyle Aynı
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  activeFilterText: {
    color: COLORS.white,
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  passiveRow: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  subInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDateText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  currencyAndActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  currencyText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    marginRight: 8,
  },
  whatsappButton: {
    backgroundColor: '#DCFCE7', // WhatsApp yeşiline uygun açık bir ton
    padding: 6,
    borderRadius: 8,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  
  // FAB (Ekleme Butonu) - Kart Rengiyle Aynı (İsteğin üzerine)
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary, // #334155
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  }
});