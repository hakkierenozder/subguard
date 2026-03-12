import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, RefreshControl, StatusBar, Animated, ActivityIndicator } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AnimatedPressable from '../components/AnimatedPressable';
import { SubscriptionSkeletonList } from '../components/SkeletonLoader';
import { hapticError, hapticMedium, hapticLight } from '../utils/haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserSubscription } from '../types';
import { RootStackParamList } from '../../App';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { convertToTRY } from '../utils/CurrencyService';
import { useThemeColors } from '../constants/theme';

// Tip tanımları
type SortType = 'date' | 'price_desc' | 'name';

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
    fetchExchangeRates(); // Ekran açılınca kurları güncelle
  }, []);

  const totalExpense = getTotalExpense();

  // State Yönetimi
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
  const [detailSub, setDetailSub] = useState<UserSubscription | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Grup görünümü
  const [groupByCategory, setGroupByCategory] = useState(false);

  // Gelişmiş filtreler
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'TRY' | 'USD' | 'EUR'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Aktif filtre sayısı (badge için)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (currencyFilter !== 'all') count++;
    if (minPrice !== '') count++;
    if (maxPrice !== '') count++;
    if (selectedCategory) count++;
    return count;
  }, [statusFilter, currencyFilter, minPrice, maxPrice, selectedCategory]);

  const clearAllFilters = () => {
    setStatusFilter('all');
    setCurrencyFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory(null);
  };

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
      sub.name.toLowerCase().includes(searchText.toLowerCase())
    );

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
        case 'name':
          return a.name.localeCompare(b.name);
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
        const rate = exchangeRates[sub.currency] || 1;
        const partnerCount = sub.sharedWith?.length || 0;
        return sum + (sub.price * rate) / (partnerCount + 1);
      }, 0);

      rows.push({ _type: 'header', category: cat, count: items.length, totalTRY });
      for (const item of items) {
        rows.push({ ...item, _type: 'item' as const });
      }
    }

    return rows;
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
                  <Text style={styles.heroLabel}>Aylık Toplam Gider</Text>
                  <View style={styles.heroAmountRow}>
                      <Text style={styles.heroCurrency}>₺</Text>
                      <Text style={styles.heroAmount}>{totalExpense.toFixed(2)}</Text>
                  </View>
              </View>
              <View style={styles.heroIconContainer}>
                  <MaterialCommunityIcons name="wallet-outline" size={30} color="rgba(255,255,255,0.9)" />
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

          <View style={styles.heroCardBottom}>
              <Text style={styles.heroSubText}>
                  {activeSubsCount} aktif abonelik yönetiliyor
              </Text>
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
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textSec} />
            <TextInput
              style={[styles.searchInput, { color: colors.textMain }]}
              placeholder="Abonelik ara..."
              placeholderTextColor={colors.textSec}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={16} color={colors.textSec} />
              </TouchableOpacity>
            )}
        </View>

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

        {/* Sıralama + Filtre Toggle */}
        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: colors.textSec }]}>Sırala:</Text>
          {(['date', 'price_desc', 'name'] as SortType[]).map(s => {
            const label = s === 'date' ? 'Yaklaşan' : s === 'price_desc' ? 'Fiyat ↓' : 'A-Z';
            const isActive = sortBy === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setSortBy(s)}
                style={[styles.sortChip, {
                  backgroundColor: isActive ? colors.primary : colors.cardBg,
                  borderColor: isActive ? colors.primary : colors.border,
                }]}
              >
                <Text style={[styles.sortChipText, { color: isActive ? '#FFF' : colors.textSec }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[styles.filterToggleBtn, {
              backgroundColor: showFilters ? colors.primary : colors.cardBg,
              borderColor: showFilters ? colors.primary : colors.border,
            }]}
            onPress={() => setShowFilters(v => !v)}
          >
            <Ionicons name="options-outline" size={14} color={showFilters ? '#FFF' : colors.textSec} />
            <Text style={[styles.filterToggleText, { color: showFilters ? '#FFF' : colors.textSec }]}>
              Filtrele
            </Text>
            {activeFilterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: showFilters ? 'rgba(255,255,255,0.35)' : colors.primary }]}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.groupToggleBtn, {
              backgroundColor: groupByCategory ? colors.accent || '#8B5CF6' : colors.cardBg,
              borderColor: groupByCategory ? colors.accent || '#8B5CF6' : colors.border,
              marginLeft: 6,
            }]}
            onPress={() => setGroupByCategory(v => !v)}
          >
            <Ionicons
              name={groupByCategory ? 'layers' : 'layers-outline'}
              size={14}
              color={groupByCategory ? '#FFF' : colors.textSec}
            />
            <Text style={[styles.filterToggleText, { color: groupByCategory ? '#FFF' : colors.textSec }]}>
              Grup
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gelişmiş Filtreler Paneli */}
        {showFilters && (
          <View style={[styles.filterPanel, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>

            {/* Durum */}
            <Text style={[styles.filterGroupLabel, { color: colors.textSec }]}>DURUM</Text>
            <View style={styles.filterChipRow}>
              {([
                { key: 'all', label: 'Tümü' },
                { key: 'active', label: '● Aktif' },
                { key: 'paused', label: '⏸ Durdurulmuş' },
              ] as { key: typeof statusFilter; label: string }[]).map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.advFilterChip, {
                    backgroundColor: statusFilter === opt.key ? colors.primary : colors.inputBg,
                    borderColor: statusFilter === opt.key ? colors.primary : colors.border,
                  }]}
                  onPress={() => setStatusFilter(opt.key)}
                >
                  <Text style={[styles.advFilterChipText, { color: statusFilter === opt.key ? '#FFF' : colors.textSec }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Para Birimi */}
            <Text style={[styles.filterGroupLabel, { color: colors.textSec, marginTop: 14 }]}>PARA BİRİMİ</Text>
            <View style={styles.filterChipRow}>
              {(['all', 'TRY', 'USD', 'EUR'] as const).map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.advFilterChip, {
                    backgroundColor: currencyFilter === c ? colors.primary : colors.inputBg,
                    borderColor: currencyFilter === c ? colors.primary : colors.border,
                  }]}
                  onPress={() => setCurrencyFilter(c)}
                >
                  <Text style={[styles.advFilterChipText, { color: currencyFilter === c ? '#FFF' : colors.textSec }]}>
                    {c === 'all' ? 'Tümü' : c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fiyat Aralığı */}
            <Text style={[styles.filterGroupLabel, { color: colors.textSec, marginTop: 14 }]}>FİYAT ARALIĞI</Text>
            <View style={styles.priceRangeRow}>
              <TextInput
                style={[styles.priceInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                placeholder="Min"
                placeholderTextColor={colors.textSec}
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <Text style={[styles.priceRangeDash, { color: colors.textSec }]}>—</Text>
              <TextInput
                style={[styles.priceInput, { color: colors.textMain, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                placeholder="Max"
                placeholderTextColor={colors.textSec}
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
              <Text style={[styles.priceRangeUnit, { color: colors.textSec }]}>₺</Text>
            </View>

            {/* Temizle Butonu */}
            {activeFilterCount > 0 && (
              <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters}>
                <Ionicons name="close-circle-outline" size={13} color="#EF4444" />
                <Text style={styles.clearFiltersBtnText}>Tüm Filtreleri Temizle</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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

    const renderLogo = () => (
        <View style={[styles.logoContainer, { backgroundColor: brandColor + '15' }]}>
          <Text style={[styles.logoText, { color: brandColor }]}>
            {sub.name.charAt(0).toUpperCase()}
          </Text>
        </View>
    );

    return (
      <View style={styles.swipeableRow}>
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
        <AnimatedPressable
          onPress={() => setDetailSub(sub)}
          style={[
            styles.rowContainer,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
            isPassive && { opacity: 0.6, backgroundColor: colors.inputBg },
          ]}
        >
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
              </View>
            </View>
          </View>

          <View style={styles.rowRight}>
            <Text style={[styles.priceText, { color: colors.textMain }, isPassive && { color: colors.textSec }]}>
              {sub.price}
            </Text>
            <View style={styles.currencyAndActionRow}>
              <Text style={[styles.currencyText, { color: colors.textSec }]}>{sub.currency}</Text>

              {isForeignCurrency && !isPassive && (
                <View style={{ backgroundColor: '#334155', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6, marginRight: 6 }}>
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
            </View>
          </View>
        </AnimatedPressable>
      </Swipeable>
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
                {selectedCategory
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

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortLabel: { fontSize: 12, fontWeight: '600', marginRight: 8 },
  sortChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
  },
  sortChipText: { fontSize: 12, fontWeight: '600' },

  // ─── Grup Toggle ────────────────────────────────────────────────────────
  groupToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },

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

  // ─── Filtre Toggle ──────────────────────────────────────────────────────
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
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

  // ─── Gelişmiş Filtreler Paneli ─────────────────────────────────────────
  filterPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  filterGroupLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
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

  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  clearFiltersBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },

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