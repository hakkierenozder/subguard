import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore'; 
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { convertToTRY } from '../utils/CurrencyService';
import { useThemeColors } from '../constants/theme'; 

// Tip tanımları
type SortType = 'date' | 'price_desc' | 'name';

export default function MySubscriptionsScreen() {
  const colors = useThemeColors(); 
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);

  const {
    subscriptions,
    getTotalExpense,
    fetchUserSubscriptions,
  } = useUserSubscriptionStore();

  const totalExpense = getTotalExpense();

  // State Yönetimi
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
  const [detailSub, setDetailSub] = useState<UserSubscription | null>(null);
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
        {/* HERO CARD */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary, shadowColor: isDarkMode ? '#000' : colors.primaryDark }]}>
          <View style={styles.heroCardTop}>
              <View>
                  <Text style={styles.heroLabel}>Aylık Toplam Gider</Text>
                  <View style={styles.heroAmountRow}>
                      <Text style={styles.heroCurrency}>₺</Text>
                      <Text style={styles.heroAmount}>{totalExpense.toFixed(2)}</Text>
                  </View>
              </View>
              <View style={styles.heroIconContainer}>
                  <MaterialCommunityIcons name="wallet-outline" size={32} color={colors.white} />
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
          <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textSec} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.textMain }]}
                placeholder="Ara..."
                placeholderTextColor={colors.textSec}
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
                          style={[
                              styles.filterChip, 
                              isActive 
                                ? { backgroundColor: colors.primary, borderColor: colors.primary } 
                                : { backgroundColor: colors.cardBg, borderColor: colors.border }
                          ]}
                      >
                          <Text style={[styles.filterText, isActive ? styles.activeFilterText : { color: colors.textSec }]}>
                              {label}
                          </Text>
                      </TouchableOpacity>
                  );
              }}
          />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: UserSubscription }) => {
    const brandColor = item.colorCode || colors.primary;
    const nextPaymentText = getNextPaymentDateText(item.billingDay);
    const isPassive = item.isActive === false;
    
    // PAYLAŞIM KONTROLÜ (Düzeltme Burada Yapıldı)
    const isShared = item.sharedWith && item.sharedWith.length > 0;

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
        style={[
            styles.rowContainer, 
            { backgroundColor: colors.cardBg, borderColor: colors.border },
            isPassive && { opacity: 0.6, backgroundColor: colors.inputBg }
        ]}
      >
        <View style={styles.rowLeft}>
          {renderLogo()}
          <View style={styles.textContainer}>
            <Text 
                style={[
                    styles.serviceName, 
                    { color: colors.textMain }, 
                    isPassive && { textDecorationLine: 'line-through', color: colors.textSec }
                ]} 
                numberOfLines={1}
            >
              {item.name}
            </Text>
            <View style={styles.subInfoContainer}>
              <Ionicons name="time-outline" size={12} color={colors.textSec} style={{marginRight: 4}} />
              <Text style={[styles.nextDateText, { color: colors.textSec }]}>
                  {isPassive ? 'Donduruldu' : nextPaymentText}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rowRight}>
          <Text style={[styles.priceText, { color: colors.textMain }, isPassive && { color: colors.textSec }]}>
              {item.price}
          </Text>
          <View style={styles.currencyAndActionRow}>
             <Text style={[styles.currencyText, { color: colors.textSec }]}>{item.currency}</Text>
             
             {/* SADECE PAYLAŞIMLI VE AKTİF İSE GÖSTER */}
             {!isPassive && isShared && (
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.bg} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        
        <FlatList
          data={getFilteredSubscriptions()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="wallet-giftcard" size={48} color={colors.inactive} />
              <Text style={[styles.emptyText, { color: colors.textSec }]}>Henüz abonelik eklemedin.</Text>
            </View>
          }
        />

        <AddSubscriptionModal
          visible={!!editingSub}
          onClose={() => {
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
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 50,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
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
    color: 'rgba(255,255,255,0.7)',
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
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 6,
    marginRight: 4,
  },
  heroAmount: {
    color: '#FFF',
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
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },

  searchAndFilterContainer: {
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  filterListContent: {
    paddingRight: 20,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    marginBottom: 2,
  },
  subInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '700',
  },
  currencyAndActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  whatsappButton: {
    backgroundColor: '#DCFCE7',
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
    fontWeight: '500',
  },
});