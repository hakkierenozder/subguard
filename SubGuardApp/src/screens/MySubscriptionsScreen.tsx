import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, RefreshControl, StatusBar, Animated, ActivityIndicator, Modal, Switch, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AnimatedPressable from '../components/AnimatedPressable';
import { SubscriptionSkeletonList } from '../components/SkeletonLoader';
import { hapticError, hapticMedium, hapticLight } from '../utils/haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserSubscription } from '../types';
import { RootStackParamList, MainTabParamList } from '../../App';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { convertToTRY } from '../utils/CurrencyService';
import { useThemeColors } from '../constants/theme';
import { useCatalogStore } from '../store/useCatalogStore';
import agent from '../api/agent';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dosya düzeyinde logo bileşeni — render içinde tanımlanırsa state sıfırlanır
function SubscriptionLogo({ logoUrl, brandColor, name }: { logoUrl?: string; brandColor: string; name: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (logoUrl && !imgFailed) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: '75%', height: '75%' }}
        resizeMode="contain"
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: brandColor }}>
      {name.charAt(0).toUpperCase()}
    </Text>
  );
}

// Tip tanımları
type SortType = 'date' | 'price_desc' | 'price_asc' | 'name' | 'created';

type GroupHeader = {
  _type: 'header';
  category: string;
  count: number;
  totalTRY: number;
};

type ListRow = GroupHeader | (UserSubscription & { _type: 'item' });

export default function MySubscriptionsScreen() {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'MySubscriptions'>>();
  const { catalogItems, fetchCatalog } = useCatalogStore();

  const {
    subscriptions,
    loading,
    loadingMore,
    hasMore,
    getTotalExpense,
    fetchUserSubscriptions,
    loadMoreSubscriptions,
    fetchExchangeRates,
    exchangeRates,
    removeSubscription,
    updateSubscription,
  } = useUserSubscriptionStore();

  React.useEffect(() => {
    fetchUserSubscriptions();
    fetchExchangeRates();
    if (catalogItems.length === 0) fetchCatalog();
  }, []);

  const totalExpense = getTotalExpense();

  // State Yönetimi
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
  const [detailSub, setDetailSub] = useState<UserSubscription | null>(null);

  // Bildirimden deep link: openSubscriptionId route param varsa detail aç
  const openSubscriptionId = route.params?.openSubscriptionId;
  React.useEffect(() => {
    if (!openSubscriptionId) return;
    const target = subscriptions.find(s => String(s.id) === String(openSubscriptionId));
    if (target) {
      setDetailSub(target);
    }
  }, [openSubscriptionId, subscriptions]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SEARCH_HISTORY_KEY = 'sub_search_history';

  // Arama geçmişini AsyncStorage'dan yükle
  useEffect(() => {
    AsyncStorage.getItem(SEARCH_HISTORY_KEY).then(raw => {
      if (raw) { try { setSearchHistory(JSON.parse(raw)); } catch {} }
    });
  }, []);

  const saveSearchHistory = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h !== query);
      const updated = [query, ...filtered].slice(0, 5);
      AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedQuery(text);
      if (text.trim()) saveSearchHistory(text.trim());
    }, 300);
  }, [saveSearchHistory]);
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Grup görünümü
  const [groupByCategory, setGroupByCategory] = useState(false);

  // Arşiv modu — pasif abonelikler (dondurulmuş + iptal edilmiş) ayrı gösterilir
  const [archiveMode, setArchiveMode] = useState(false);

  // Toplu seçim
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtre modal
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'TRY' | 'USD' | 'EUR'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Toplam aktif özelleştirme sayısı (filtre + sıralama + gruplama)
  const totalBadgeCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (currencyFilter !== 'all') count++;
    if (minPrice !== '') count++;
    if (maxPrice !== '') count++;
    if (selectedCategory) count++;
    if (sortBy !== 'date') count++;
    // groupByCategory ve archiveMode inline butonlar — badge'e dahil değil
    return count;
  }, [statusFilter, currencyFilter, minPrice, maxPrice, selectedCategory, sortBy]);

  const clearAllFilters = () => {
    setStatusFilter('all');
    setCurrencyFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory(null);
    setSortBy('date');
    setGroupByCategory(false);
    setArchiveMode(false);
  };

  const toggleSelectMode = useCallback(() => {
    setSelectMode(v => !v);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Kategoriler
  const categories = useMemo(() => {
    const catMap: Record<string, number> = {};
    subscriptions.filter(s => s.isActive !== false).forEach(s => {
      if (s.category) catMap[s.category] = (catMap[s.category] || 0) + 1;
    });
    return catMap;
  }, [subscriptions]);

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
      sub.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    // Arşiv modu: sadece pasif abonelikler; normal mod: sadece aktifler (statusFilter override)
    if (archiveMode) {
      return filtered.filter(sub => sub.isActive === false);
    }

    if (selectedCategory) {
      filtered = filtered.filter(sub => sub.category === selectedCategory);
    }

    // Durum filtresi
    if (statusFilter === 'active') {
      filtered = filtered.filter(sub => sub.isActive !== false);
    } else if (statusFilter === 'paused') {
      filtered = filtered.filter(sub => sub.isActive === false);
    }

    // Para birimi filtresi
    if (currencyFilter !== 'all') {
      filtered = filtered.filter(sub => sub.currency === currencyFilter);
    }

    // Fiyat aralığı
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) filtered = filtered.filter(sub => sub.price >= min);
    if (!isNaN(max)) filtered = filtered.filter(sub => sub.price <= max);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
           const today = new Date().getDate();
           const valA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
           const valB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
           return valA - valB;
        case 'price_desc':
          return convertToTRY(b.price, b.currency) - convertToTRY(a.price, a.currency);
        case 'price_asc':
          return convertToTRY(a.price, a.currency) - convertToTRY(b.price, b.currency);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdDate ?? 0).getTime() - new Date(a.createdDate ?? 0).getTime();
        default:
          return 0;
      }
    });
  };

  // ─── Grup Görünümü ────────────────────────────────────────────────────
  const getListData = (): ListRow[] => {
    const filtered = getFilteredSubscriptions();

    if (!groupByCategory) {
      return filtered.map(s => ({ ...s, _type: 'item' as const }));
    }

    // Kategoriye göre grupla
    const groupMap: Record<string, UserSubscription[]> = {};
    for (const sub of filtered) {
      const cat = sub.category || 'Diğer';
      if (!groupMap[cat]) groupMap[cat] = [];
      groupMap[cat].push(sub);
    }

    const rows: ListRow[] = [];
    const sortedCategories = Object.keys(groupMap).sort();

    for (const cat of sortedCategories) {
      const items = groupMap[cat];
      const totalTRY = items.reduce((sum, sub) => {
        const partnerCount = sub.sharedWith?.length || 0;
        return sum + convertToTRY(sub.price, sub.currency) / (partnerCount + 1);
      }, 0);

      rows.push({ _type: 'header', category: cat, count: items.length, totalTRY });
      for (const item of items) {
        rows.push({ ...item, _type: 'item' as const });
      }
    }

    return rows;
  };
  // ─────────────────────────────────────────────────────────────────────

  // ─── Toplu Seçim Handlers ─────────────────────────────────────────────
  const selectAll = useCallback(() => {
    const allIds = getFilteredSubscriptions().map(s => s.id);
    setSelectedIds(new Set(allIds));
  }, [getFilteredSubscriptions]);

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    hapticError();
    Alert.alert(
      'Toplu Silme',
      `${count} abonelik silinecek. Bu işlem geri alınamaz.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedIds) {
              await removeSubscription(id);
            }
            setSelectMode(false);
            setSelectedIds(new Set());
          },
        },
      ]
    );
  };

  const handleBulkPause = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    hapticMedium();
    // Seçili aktif olanları duraklat, pasif olanları aktifleştir
    const selected = getFilteredSubscriptions().filter(s => selectedIds.has(s.id));
    const activeOnes = selected.filter(s => s.isActive !== false);
    const passiveOnes = selected.filter(s => s.isActive === false);
    const label = activeOnes.length > 0
      ? `${activeOnes.length} abonelik duraklatılacak${passiveOnes.length > 0 ? `, ${passiveOnes.length} abonelik aktifleştirilecek` : ''}.`
      : `${passiveOnes.length} abonelik aktifleştirilecek.`;
    Alert.alert('Toplu Durum Değiştir', label, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: async () => {
          for (const sub of activeOnes) {
            await updateSubscription(sub.id, { isActive: false });
          }
          for (const sub of passiveOnes) {
            await updateSubscription(sub.id, { isActive: true, cancelledAt: null });
          }
          setSelectMode(false);
          setSelectedIds(new Set());
        },
      },
    ]);
  };
  // ─────────────────────────────────────────────────────────────────────

  // ─── Swipe Aksiyonları ────────────────────────────────────────────────
  const swipeRefs = useRef<Map<string, Swipeable | null>>(new Map());
  const prevOpenedId = useRef<string | null>(null);

  const closeOtherRows = (id: string) => {
    if (prevOpenedId.current && prevOpenedId.current !== id) {
      swipeRefs.current.get(prevOpenedId.current)?.close();
    }
    prevOpenedId.current = id;
  };

  const handleDelete = (item: UserSubscription) => {
    hapticLight();
    Alert.alert(
      'Aboneliği Sil',
      `"${item.name}" silinecek. Bu işlem geri alınamaz.`,
      [
        {
          text: 'Vazgeç',
          style: 'cancel',
          onPress: () => swipeRefs.current.get(item.id)?.close(),
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => { hapticError(); removeSubscription(item.id); },
        },
      ]
    );
  };

  const handleTogglePause = (item: UserSubscription) => {
    hapticMedium();
    const isActive = item.isActive !== false;
    updateSubscription(item.id, { isActive: !isActive, cancelledAt: !isActive ? null : undefined });
    swipeRefs.current.get(item.id)?.close();
  };

  const renderRightActions = (item: UserSubscription) => (
    prog: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = prog.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={styles.swipeRightAction}
        onPress={() => handleDelete(item)}
        activeOpacity={0.85}
      >
        <Animated.View style={[styles.swipeActionContent, { transform: [{ scale }] }]}>
          <Ionicons name="trash-outline" size={22} color="#FFF" />
          <Text style={styles.swipeActionLabel}>Sil</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (item: UserSubscription) => (
    prog: Animated.AnimatedInterpolation<number>
  ) => {
    const isActive = item.isActive !== false;
    const scale = prog.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1], extrapolate: 'clamp' });
    return (
      <TouchableOpacity
        style={[styles.swipeLeftAction, { backgroundColor: isActive ? '#F59E0B' : '#10B981' }]}
        onPress={() => handleTogglePause(item)}
        activeOpacity={0.85}
      >
        <Animated.View style={[styles.swipeActionContent, { transform: [{ scale }] }]}>
          <Ionicons
            name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
            size={24}
            color="#FFF"
          />
          <Text style={styles.swipeActionLabel}>
            {isActive ? 'Duraklat' : 'Aktifleştir'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };
  // ─────────────────────────────────────────────────────────────────────

  const handleSendReminder = async (sub: UserSubscription) => {
    hapticMedium();
    try {
      await agent.Notifications.sendReminder(sub.id);
      Toast.show({ type: 'success', text1: 'Hatırlatma gönderildi', text2: `${sub.name} için bildirim kuyruğa eklendi.`, position: 'bottom' });
    } catch {
      // agent.ts merkezî hata yönetimi Toast gösterir, ek işlem gerekmez
    }
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
    const categoryList = Object.keys(categories).sort();

    return (
      <View style={styles.headerContainer}>
        {/* HERO CARD */}
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { shadowColor: isDarkMode ? '#000' : colors.primaryDark }]}
        >
          {/* Dekoratif daire */}
          <View style={styles.heroDecorCircle} />

          <View style={styles.heroCardTop}>
              <View style={{ flex: 1 }}>
                  <Text style={styles.heroLabel}>ABONELİKLERİM</Text>
                  <Text style={styles.heroAmount}>{activeSubsCount} aktif</Text>
                  {categoryList.length > 0 && (
                      <Text style={[styles.heroLabel, { marginTop: 3, opacity: 0.75 }]}>
                          {categoryList.length} kategori
                      </Text>
                  )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                  <TouchableOpacity
                      onPress={() => navigation.navigate('Calendar')}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                      <Ionicons name="calendar-outline" size={26} color="rgba(255,255,255,0.9)" />
                  </TouchableOpacity>
                  <View style={styles.heroIconContainer}>
                      <MaterialCommunityIcons name="layers-outline" size={28} color="rgba(255,255,255,0.9)" />
                  </View>
              </View>
          </View>

          {/* Kategori özeti satırı */}
          {categoryList.length > 0 && (
            <View style={styles.heroCatRow}>
              {categoryList.slice(0, 3).map(cat => (
                <View key={cat} style={styles.heroCatChip}>
                  <Text style={styles.heroCatText}>{cat}</Text>
                  <Text style={styles.heroCatCount}>{categories[cat]}</Text>
                </View>
              ))}
              {categoryList.length > 3 && (
                <View style={styles.heroCatChip}>
                  <Text style={styles.heroCatText}>+{categoryList.length - 3}</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.heroCardBottom, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SharedSubscriptions')}
                style={styles.sharedBtn}
              >
                <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.sharedBtnText}>Paylaşımlı Abonelikler</Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Arama */}
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: searchFocused ? colors.primary : colors.border }]}>
            <Ionicons name="search" size={18} color={searchFocused ? colors.primary : colors.textSec} />
            <TextInput
              style={[styles.searchInput, { color: colors.textMain }]}
              placeholder="Abonelik ara..."
              placeholderTextColor={colors.textSec}
              value={searchText}
              onChangeText={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchText(''); setDebouncedQuery(''); }}>
                <Ionicons name="close-circle" size={16} color={colors.textSec} />
              </TouchableOpacity>
            )}
        </View>

        {/* Arama Geçmişi — sadece odaklanıldığında ve arama kutusu boşken göster */}
        {searchFocused && searchText.length === 0 && searchHistory.length > 0 && (
          <View style={{ marginHorizontal: 16, marginTop: 4, marginBottom: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSec }}>SON ARAMALAR</Text>
              <TouchableOpacity onPress={clearSearchHistory} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.accent }}>Temizle</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {searchHistory.map((h, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleSearch(h)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border }}
                >
                  <Ionicons name="time-outline" size={12} color={colors.textSec} />
                  <Text style={{ fontSize: 12, color: colors.textSec, fontWeight: '500' }}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Kategori Filtreleri */}
        {categoryList.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catFilterList}
            style={styles.catFilterScroll}
          >
            <TouchableOpacity
              style={[styles.catChip, {
                backgroundColor: !selectedCategory ? colors.primary : colors.cardBg,
                borderColor: !selectedCategory ? colors.primary : colors.border,
              }]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.catChipText, { color: !selectedCategory ? '#FFF' : colors.textSec }]}>
                Tümü
              </Text>
              <View style={[styles.catChipCount, { backgroundColor: !selectedCategory ? 'rgba(255,255,255,0.25)' : colors.inputBg }]}>
                <Text style={[styles.catChipCountText, { color: !selectedCategory ? '#FFF' : colors.textSec }]}>
                  {activeSubsCount}
                </Text>
              </View>
            </TouchableOpacity>
            {categoryList.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, {
                    backgroundColor: isActive ? colors.primary : colors.cardBg,
                    borderColor: isActive ? colors.primary : colors.border,
                  }]}
                  onPress={() => setSelectedCategory(isActive ? null : cat)}
                >
                  <Text style={[styles.catChipText, { color: isActive ? '#FFF' : colors.textMain }]}>
                    {cat}
                  </Text>
                  <View style={[styles.catChipCount, { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : colors.inputBg }]}>
                    <Text style={[styles.catChipCountText, { color: isActive ? '#FFF' : colors.textSec }]}>
                      {categories[cat]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Filtre & Sıralama — tek buton */}
        <View style={styles.filterActionRow}>
          <TouchableOpacity
            style={[styles.filterSortBtn, {
              backgroundColor: totalBadgeCount > 0 ? colors.primary : colors.cardBg,
              borderColor: totalBadgeCount > 0 ? colors.primary : colors.border,
            }]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={15} color={totalBadgeCount > 0 ? '#FFF' : colors.textSec} />
            <Text style={[styles.filterToggleText, { color: totalBadgeCount > 0 ? '#FFF' : colors.textSec }]}>
              Sırala & Filtrele
            </Text>
            {totalBadgeCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: 'rgba(255,255,255,0.35)' }]}>
                <Text style={styles.filterBadgeText}>{totalBadgeCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Gruplama butonu — modal dışında, ayrı görünüm tercihi */}
          <TouchableOpacity
            style={[styles.filterSortBtn, {
              backgroundColor: groupByCategory ? colors.accent : colors.cardBg,
              borderColor: groupByCategory ? colors.accent : colors.border,
            }]}
            onPress={() => setGroupByCategory(v => !v)}
            activeOpacity={0.7}
          >
            <Ionicons name="layers-outline" size={15} color={groupByCategory ? '#FFF' : colors.textSec} />
            <Text style={[styles.filterToggleText, { color: groupByCategory ? '#FFF' : colors.textSec }]}>
              Grupla
            </Text>
          </TouchableOpacity>

          {/* Arşiv butonu — pasif (dondurulmuş/iptal) abonelikler */}
          <TouchableOpacity
            style={[styles.filterSortBtn, {
              backgroundColor: archiveMode ? '#6B7280' : colors.cardBg,
              borderColor: archiveMode ? '#6B7280' : colors.border,
            }]}
            onPress={() => setArchiveMode(v => !v)}
            activeOpacity={0.7}
          >
            <Ionicons name="archive-outline" size={15} color={archiveMode ? '#FFF' : colors.textSec} />
            <Text style={[styles.filterToggleText, { color: archiveMode ? '#FFF' : colors.textSec }]}>
              Arşiv
            </Text>
            {subscriptions.filter(s => s.isActive === false).length > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: archiveMode ? 'rgba(255,255,255,0.35)' : colors.inputBg }]}>
                <Text style={[styles.filterBadgeText, { color: archiveMode ? '#FFF' : colors.textSec }]}>
                  {subscriptions.filter(s => s.isActive === false).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Toplu Seçim */}
          <TouchableOpacity
            style={[styles.filterSortBtn, {
              backgroundColor: selectMode ? colors.primary : colors.cardBg,
              borderColor: selectMode ? colors.primary : colors.border,
            }]}
            onPress={toggleSelectMode}
            activeOpacity={0.7}
          >
            <Ionicons name="checkbox-outline" size={15} color={selectMode ? '#FFF' : colors.textSec} />
            <Text style={[styles.filterToggleText, { color: selectMode ? '#FFF' : colors.textSec }]}>
              {selectMode ? 'Seçiliyor' : 'Seç'}
            </Text>
          </TouchableOpacity>

          {totalBadgeCount > 0 && (
            <TouchableOpacity style={styles.clearInlineBtn} onPress={clearAllFilters} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={14} color={colors.textSec} />
              <Text style={[styles.clearInlineBtnText, { color: colors.textSec }]}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    );
  };

  const renderGroupHeader = (row: GroupHeader) => (
    <View style={[styles.groupHeader, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
      <View style={styles.groupHeaderLeft}>
        <View style={[styles.groupHeaderDot, { backgroundColor: colors.accent || '#8B5CF6' }]} />
        <Text style={[styles.groupHeaderTitle, { color: colors.textMain }]}>{row.category}</Text>
        <View style={[styles.groupHeaderCountBadge, { backgroundColor: (colors.accent || '#8B5CF6') + '22' }]}>
          <Text style={[styles.groupHeaderCount, { color: colors.accent || '#8B5CF6' }]}>{row.count}</Text>
        </View>
      </View>
      <View style={styles.groupHeaderRight}>
        <Text style={[styles.groupHeaderTotalLabel, { color: colors.textSec }]}>Toplam</Text>
        <Text style={[styles.groupHeaderTotal, { color: colors.textMain }]}>
          ₺{row.totalTRY.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ListRow }) => {
    if (item._type === 'header') {
      return renderGroupHeader(item as GroupHeader);
    }

    const sub = item as UserSubscription & { _type: 'item' };
    const brandColor = sub.colorCode || colors.primary;
    const nextPaymentText = getNextPaymentDateText(sub.billingDay);
    const isPassive = sub.isActive === false;

    const currentRate = exchangeRates[sub.currency] || 1;
    const priceInTry = sub.price * currentRate;
    const isForeignCurrency = sub.currency !== 'TRY';

    // PAYLAŞIM KONTROLÜ
    const isShared = sub.sharedWith && sub.sharedWith.length > 0;

    const catalogLogoUrl = catalogItems.find(c => c.id === sub.catalogId)?.logoUrl;
    const renderLogo = () => (
        <View style={[styles.logoContainer, { backgroundColor: brandColor + '15', overflow: 'hidden' }]}>
          <SubscriptionLogo logoUrl={catalogLogoUrl} brandColor={brandColor} name={sub.name} />
        </View>
    );

    const cardContent = (
      <AnimatedPressable
        onPress={() => selectMode ? toggleSelect(sub.id) : setDetailSub(sub)}
        onLongPress={() => { if (!selectMode) { hapticMedium(); setSelectMode(true); setSelectedIds(new Set([sub.id])); } }}
        style={[
          styles.rowContainer,
          { backgroundColor: selectMode && selectedIds.has(sub.id) ? (colors.primary + '20') : colors.cardBg, borderColor: selectMode && selectedIds.has(sub.id) ? colors.primary : colors.border },
          isPassive && !selectMode && { opacity: 0.6, backgroundColor: colors.inputBg },
        ]}
      >
        {selectMode && (
          <View style={{
            width: 24, height: 24, borderRadius: 12,
            borderWidth: 2,
            borderColor: selectedIds.has(sub.id) ? colors.primary : colors.border,
            backgroundColor: selectedIds.has(sub.id) ? colors.primary : 'transparent',
            justifyContent: 'center', alignItems: 'center',
            marginRight: 10, flexShrink: 0,
          }}>
            {selectedIds.has(sub.id) && (
              <Ionicons name="checkmark" size={14} color="#FFF" />
            )}
          </View>
        )}
        <View style={styles.rowLeft}>
          {renderLogo()}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.serviceName,
                { color: colors.textMain },
                isPassive && { textDecorationLine: 'line-through', color: colors.textSec },
              ]}
              numberOfLines={1}
            >
              {sub.name}
            </Text>
            <View style={styles.subInfoContainer}>
              {sub.category && !groupByCategory ? (
                <View style={[styles.categoryBadge, { backgroundColor: (sub.colorCode || colors.primary) + '18' }]}>
                  <Text style={[styles.categoryBadgeText, { color: sub.colorCode || colors.primary }]}>
                    {sub.category}
                  </Text>
                </View>
              ) : null}
              <Ionicons
                name="time-outline"
                size={11}
                color={colors.textSec}
                style={{ marginLeft: (sub.category && !groupByCategory) ? 6 : 0, marginRight: 3 }}
              />
              <Text style={[styles.nextDateText, { color: colors.textSec }]}>
                {isPassive ? 'Donduruldu' : nextPaymentText}
              </Text>
              {sub.hasContract && sub.contractEndDate && (() => {
                const cDays = Math.ceil((new Date(sub.contractEndDate).getTime() - Date.now()) / 86400000);
                if (cDays > 30) return null;
                return (
                  <View style={{ marginLeft: 6, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, backgroundColor: cDays <= 0 ? (colors.error + '20') : '#F9731620' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: cDays <= 0 ? colors.error : '#F97316' }}>
                      {cDays <= 0 ? 'Kontrat bitti' : `Kontrat ${cDays}g`}
                    </Text>
                  </View>
                );
              })()}
            </View>
          </View>
        </View>

        <View style={styles.rowRight}>
          <Text style={[styles.priceText, { color: colors.textMain }, isPassive && { color: colors.textSec }]}>
            {sub.price}
          </Text>
          {isShared && !isPassive && (
            <Text style={[styles.currencyText, { color: colors.textSec, fontSize: 10, marginTop: 1 }]}>
              {(sub.price / ((sub.sharedWith?.length ?? 0) + 1)).toFixed(2)} kişi başı
            </Text>
          )}
          <View style={styles.currencyAndActionRow}>
            <Text style={[styles.currencyText, { color: colors.textSec }]}>{sub.currency}</Text>

            {isForeignCurrency && !isPassive && (
              <View style={{ backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6, marginRight: 6 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                  ≈ ₺{priceInTry.toFixed(0)}
                </Text>
              </View>
            )}

            {!isPassive && isShared && (
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => handleShareOnWhatsApp(sub)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome5 name="whatsapp" size={14} color="#25D366" />
              </TouchableOpacity>
            )}
            {!isPassive && (
              <TouchableOpacity
                style={[styles.whatsappButton, { marginLeft: isShared ? 4 : 6 }]}
                onPress={() => handleSendReminder(sub)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="notifications-outline" size={14} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </AnimatedPressable>
    );

    return (
      <View style={styles.swipeableRow}>
        {selectMode ? (
          cardContent
        ) : (
          <Swipeable
            ref={(ref) => { swipeRefs.current.set(sub.id, ref); }}
            renderRightActions={renderRightActions(sub)}
            renderLeftActions={renderLeftActions(sub)}
            onSwipeableOpen={() => { hapticLight(); closeOtherRows(sub.id); }}
            overshootRight={false}
            overshootLeft={false}
            friction={2}
            rightThreshold={40}
            leftThreshold={40}
          >
            {cardContent}
          </Swipeable>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.bg} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {loading && subscriptions.length === 0 ? (
          <SubscriptionSkeletonList count={5} />
        ) : (
        <FlatList
          data={getListData()}
          keyExtractor={(item) =>
            item._type === 'header' ? `header-${item.category}` : (item as UserSubscription).id
          }
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => { if (hasMore && !loadingMore) loadMoreSubscriptions(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreFooter}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadMoreText, { color: colors.textSec }]}>Daha fazla yükleniyor...</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={selectedCategory ? 'filter-off-outline' : 'wallet-giftcard'}
                size={52}
                color={colors.inactive}
              />
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>
                {selectedCategory ? `"${selectedCategory}" bulunamadı` : 'Abonelik yok'}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSec }]}>
                {archiveMode
                  ? 'Dondurulmuş veya iptal edilmiş abonelik yok.'
                  : selectedCategory
                  ? 'Bu kategoride aboneliğin bulunmuyor.'
                  : searchText
                  ? 'Arama sonucu bulunamadı.'
                  : 'Henüz abonelik eklemedin.'}
              </Text>
              {selectedCategory && (
                <TouchableOpacity
                  style={[styles.emptyResetBtn, { borderColor: colors.border }]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.emptyResetText, { color: colors.primary }]}>Filtreyi Kaldır</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
        )}

        {/* Toplu İşlem Çubuğu */}
        {selectMode && (
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: colors.cardBg,
            borderTopWidth: 1, borderTopColor: colors.border,
            paddingHorizontal: 16, paddingVertical: 12,
            paddingBottom: 24,
            flexDirection: 'row', alignItems: 'center', gap: 8,
            shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1, shadowRadius: 8, elevation: 12,
          }}>
            {/* Seçim bilgisi + Tümünü Seç */}
            <TouchableOpacity
              onPress={selectAll}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>{selectedIds.size}</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSec }}>
                {selectedIds.size > 0 ? 'seçili · Tümünü Seç' : 'Tümünü Seç'}
              </Text>
            </TouchableOpacity>

            {/* Duraklat/Aktifleştir */}
            <TouchableOpacity
              onPress={handleBulkPause}
              disabled={selectedIds.size === 0}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
                backgroundColor: selectedIds.size > 0 ? '#F59E0B20' : colors.inputBg,
              }}
            >
              <Ionicons name="pause-circle-outline" size={16} color={selectedIds.size > 0 ? '#F59E0B' : colors.textSec} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: selectedIds.size > 0 ? '#F59E0B' : colors.textSec }}>Duraklat</Text>
            </TouchableOpacity>

            {/* Sil */}
            <TouchableOpacity
              onPress={handleBulkDelete}
              disabled={selectedIds.size === 0}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
                backgroundColor: selectedIds.size > 0 ? colors.error + '20' : colors.inputBg,
              }}
            >
              <Ionicons name="trash-outline" size={16} color={selectedIds.size > 0 ? colors.error : colors.textSec} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: selectedIds.size > 0 ? colors.error : colors.textSec }}>Sil</Text>
            </TouchableOpacity>

            {/* İptal */}
            <TouchableOpacity
              onPress={toggleSelectMode}
              style={{
                paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12,
                backgroundColor: colors.inputBg,
              }}
            >
              <Ionicons name="close" size={18} color={colors.textSec} />
            </TouchableOpacity>
          </View>
        )}

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

        {/* ── Sırala & Filtrele Bottom Sheet ─────────────────── */}
        <Modal
          visible={showFilterModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowFilterModal(false)} activeOpacity={1} />
            <View style={[styles.bottomSheet, { backgroundColor: colors.cardBg }]}>
              {/* Drag handle */}
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.textMain }]}>Sırala & Filtrele</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color={colors.textSec} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>

                {/* SIRALAMA */}
                <Text style={[styles.sheetSectionLabel, { color: colors.textSec }]}>SIRALAMA</Text>
                <Text style={[styles.sheetSectionDesc, { color: colors.textSec }]}>Listeyi nasıl sıralamak istiyorsun?</Text>
                <View style={styles.filterChipRow}>
                  {(['date', 'price_desc', 'price_asc', 'name', 'created'] as SortType[]).map(s => {
                    const label = s === 'date' ? '📅 Yaklaşan ödeme' : s === 'price_desc' ? '💰 Fiyat (yüksek→düşük)' : s === 'price_asc' ? '💸 Fiyat (düşük→yüksek)' : s === 'name' ? '🔤 A-Z isim' : '🕒 Eklenme tarihi';
                    const isActive = sortBy === s;
                    return (
                      <TouchableOpacity key={s} style={[styles.advFilterChip, {
                        backgroundColor: isActive ? colors.primary : colors.inputBg,
                        borderColor: isActive ? colors.primary : colors.border,
                      }]} onPress={() => setSortBy(s)}>
                        <Text style={[styles.advFilterChipText, { color: isActive ? '#FFF' : colors.textSec }]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* DURUM */}
                <Text style={[styles.sheetSectionLabel, { color: colors.textSec, marginTop: 20 }]}>DURUM</Text>
                <Text style={[styles.sheetSectionDesc, { color: colors.textSec }]}>Aktif, dondurulmuş veya tüm abonelikler</Text>
                <View style={styles.filterChipRow}>
                  {([
                    { key: 'all', label: 'Tümü' },
                    { key: 'active', label: '● Aktif' },
                    { key: 'paused', label: '⏸ Dondurulmuş' },
                  ] as { key: typeof statusFilter; label: string }[]).map(opt => (
                    <TouchableOpacity key={opt.key} style={[styles.advFilterChip, {
                      backgroundColor: statusFilter === opt.key ? colors.primary : colors.inputBg,
                      borderColor: statusFilter === opt.key ? colors.primary : colors.border,
                    }]} onPress={() => setStatusFilter(opt.key)}>
                      <Text style={[styles.advFilterChipText, { color: statusFilter === opt.key ? '#FFF' : colors.textSec }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* PARA BİRİMİ */}
                <Text style={[styles.sheetSectionLabel, { color: colors.textSec, marginTop: 20 }]}>PARA BİRİMİ</Text>
                <Text style={[styles.sheetSectionDesc, { color: colors.textSec }]}>Belirli bir para birimiyle filtrelemek için seç</Text>
                <View style={styles.filterChipRow}>
                  {(['all', 'TRY', 'USD', 'EUR'] as const).map(c => (
                    <TouchableOpacity key={c} style={[styles.advFilterChip, {
                      backgroundColor: currencyFilter === c ? colors.primary : colors.inputBg,
                      borderColor: currencyFilter === c ? colors.primary : colors.border,
                    }]} onPress={() => setCurrencyFilter(c)}>
                      <Text style={[styles.advFilterChipText, { color: currencyFilter === c ? '#FFF' : colors.textSec }]}>{c === 'all' ? 'Tümü' : c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* FİYAT ARALIĞI */}
                <Text style={[styles.sheetSectionLabel, { color: colors.textSec, marginTop: 20 }]}>FİYAT ARALIĞI</Text>
                <Text style={[styles.sheetSectionDesc, { color: colors.textSec }]}>Aylık tutarı bu aralıkta olan abonelikleri göster</Text>
                <View style={styles.priceRangeRow}>
                  <TextInput
                    style={[styles.priceInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                    placeholder="Min" placeholderTextColor={colors.textSec}
                    keyboardType="numeric" value={minPrice} onChangeText={setMinPrice}
                  />
                  <Text style={[styles.priceRangeDash, { color: colors.textSec }]}>—</Text>
                  <TextInput
                    style={[styles.priceInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                    placeholder="Max" placeholderTextColor={colors.textSec}
                    keyboardType="numeric" value={maxPrice} onChangeText={setMaxPrice}
                  />
                  <Text style={[styles.priceRangeUnit, { color: colors.textSec }]}>₺</Text>
                </View>

              </ScrollView>

              {/* Footer */}
              <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
                {totalBadgeCount > 0 && (
                  <TouchableOpacity
                    style={[styles.sheetClearBtn, { borderColor: colors.border }]}
                    onPress={() => { clearAllFilters(); setShowFilterModal(false); }}
                  >
                    <Text style={[styles.sheetClearBtnText, { color: colors.textSec }]}>Temizle</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.sheetApplyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.sheetApplyBtnText}>Tamam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    padding: 22,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  heroDecorCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -50,
    right: -40,
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroCurrency: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 5,
    marginRight: 3,
  },
  heroAmount: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 10,
    borderRadius: 14,
  },
  heroCatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  heroCatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  heroCatText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
  heroCatCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  heroCardBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  sharedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sharedBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
    marginRight: 3,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 9,
  },

  catFilterScroll: { flexGrow: 0, flexShrink: 0, marginBottom: 10 },
  catFilterList: { paddingRight: 4 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    height: 32,
  },
  catChipText: { fontSize: 12, fontWeight: '600' },
  catChipCount: {
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 5,
  },
  catChipCountText: { fontSize: 10, fontWeight: '700' },

  // ─── Filtre & Sırala Satırı ─────────────────────────────────────────────
  filterActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  filterSortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearInlineBtnText: { fontSize: 12, fontWeight: '600' },

  // ─── Grup Başlığı ───────────────────────────────────────────────────────
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  groupHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginRight: 8,
  },
  groupHeaderCountBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  groupHeaderCount: {
    fontSize: 11,
    fontWeight: '800',
  },
  groupHeaderRight: {
    alignItems: 'flex-end',
  },
  groupHeaderTotalLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  groupHeaderTotal: {
    fontSize: 14,
    fontWeight: '800',
  },

  filterToggleText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  filterBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    paddingHorizontal: 3,
  },
  filterBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  // ─── Bottom Sheet Modal ────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 16 },
  sheetSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sheetSectionDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 10,
    opacity: 0.7,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  sheetClearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetClearBtnText: { fontSize: 14, fontWeight: '600' },
  sheetApplyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetApplyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  advFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  advFilterChipText: { fontSize: 12, fontWeight: '600' },

  priceRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  priceRangeDash: { marginHorizontal: 10, fontSize: 16, fontWeight: '500' },
  priceRangeUnit: { marginLeft: 8, fontSize: 14, fontWeight: '700' },


  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 10, fontWeight: '700' },

  // Swipe wrapper
  swipeableRow: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  // Swipe aksiyon butonları
  swipeRightAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  swipeLeftAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  swipeActionContent: { alignItems: 'center' },
  swipeActionLabel: { color: '#FFF', fontSize: 11, fontWeight: '700', marginTop: 4 },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginTop: 4,
    flexWrap: 'wrap',
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
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginTop: 14, textAlign: 'center' },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyResetBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  emptyResetText: { fontSize: 13, fontWeight: '700' },

  loadMoreFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadMoreText: { fontSize: 13, fontWeight: '500' },
});