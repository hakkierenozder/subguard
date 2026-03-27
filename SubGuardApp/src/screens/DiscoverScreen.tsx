import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import { SubscriptionSkeletonList } from '../components/SkeletonLoader'; // #42
import { CatalogItem } from '../types';
import agent from '../api/agent';

type Props = NativeStackScreenProps<RootStackParamList, 'Discover'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - 48) / 2; // 2 sütun, 16px padding + 16px gap

// En ucuz planı günlük birim maliyete göre bulur.
// #46: billingCycleDays de döndürülerek kart "/ay" vs "/yıl" doğru gösterebilsin.
function getCheapestPrice(item: CatalogItem): {
  price: number;
  currency: string;
  billingCycleDays: number;
} | null {
  if (!item.plans || item.plans.length === 0) return null;
  const sorted = [...item.plans]
    .filter((p) => p.billingCycleDays > 0)
    .sort((a, b) => (a.price / a.billingCycleDays) - (b.price / b.billingCycleDays));
  if (sorted.length === 0) return null;
  return {
    price: sorted[0].price,
    currency: sorted[0].currency,
    billingCycleDays: sorted[0].billingCycleDays,
  };
}

// Flat list veri tipleri (header veya item)
type ListRow =
  | { type: 'header'; title: string; count: number }
  | { type: 'item'; left: CatalogItem; right: CatalogItem | null };

// --- Trending Mini Kart ---
function TrendingCard({ item, isSubscribed, colors, onAdd }: {
  item: CatalogItem;
  isSubscribed: boolean;
  colors: ReturnType<typeof useThemeColors>;
  onAdd: (item: CatalogItem) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.trendingCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      onPress={() => !isSubscribed && onAdd(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.trendingIcon, { backgroundColor: (item.colorCode || '#4F46E5') + '18' }]}>
        {item.logoUrl && !imgFailed ? (
          <Image source={{ uri: item.logoUrl }} style={styles.trendingImg} onError={() => setImgFailed(true)} />
        ) : (
          <Text style={[styles.trendingInitial, { color: item.colorCode || colors.accent }]}>
            {item.name.charAt(0)}
          </Text>
        )}
      </View>
      <Text style={[styles.trendingName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
      {isSubscribed && (
        <Ionicons name="checkmark-circle" size={14} color={colors.success} style={{ marginTop: 2 }} />
      )}
    </TouchableOpacity>
  );
}

// --- Katalog Kart ---
interface CardProps {
  item: CatalogItem;
  isSubscribed: boolean;
  isRecommended: boolean;
  colors: ReturnType<typeof useThemeColors>;
  onAdd: (item: CatalogItem) => void;
}

function CatalogCard({ item, isSubscribed, isRecommended, colors, onAdd }: CardProps) {
  const priceInfo = getCheapestPrice(item);
  const [imgFailed, setImgFailed] = React.useState(false);
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {isRecommended && !isSubscribed && (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={styles.badgeText}>Öneri</Text>
        </View>
      )}
      <View style={[styles.cardIcon, { backgroundColor: (item.colorCode || '#4F46E5') + '18' }]}>
        {item.logoUrl && !imgFailed ? (
          <Image source={{ uri: item.logoUrl }} style={styles.cardImg} onError={() => setImgFailed(true)} />
        ) : (
          <Text style={[styles.cardInitial, { color: item.colorCode || colors.accent }]}>
            {item.name.charAt(0)}
          </Text>
        )}
      </View>
      <Text style={[styles.cardName, { color: colors.textMain }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.cardCategory, { color: colors.textSec }]} numberOfLines={1}>
        {item.category}
      </Text>
      {priceInfo && (
        <Text style={[styles.cardPrice, { color: colors.accent }]}>
          {priceInfo.currency === 'TRY' ? '₺' : `${priceInfo.currency} `}
          {priceInfo.price.toFixed(2)}
          {'  '}
          {/* #46: billingCycleDays >= 365 ise yıllık plan — "/ay" yerine "/yıl" göster */}
          <Text style={[styles.cardPricePer, { color: colors.textSec }]}>
            {priceInfo.billingCycleDays >= 365 ? '/yıl' : '/ay'}
          </Text>
        </Text>
      )}
      {isSubscribed ? (
        <View style={styles.subscribedBadge}>
          <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
          <Text style={styles.subscribedText}>Ekli</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={() => onAdd(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={15} color="#FFF" />
          <Text style={styles.addBtnText}>Ekle</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- Ana Ekran ---
export default function DiscoverScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const { catalogItems, loading: catalogLoading, fetchCatalog } = useCatalogStore();
  const { subscriptions } = useUserSubscriptionStore();

  useEffect(() => {
    if (catalogItems.length === 0) fetchCatalog();
  }, []);

  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedQuery(text), 300);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState<CatalogItem | null>(null);
  const [trendingItems, setTrendingItems] = useState<CatalogItem[]>([]);

  useEffect(() => {
    agent.Catalogs.trending(8).then((res: any) => {
      if (res?.data) setTrendingItems(res.data);
    }).catch(() => {});
  }, []);

  const subscribedCatalogIds = useMemo(
    () => new Set(subscriptions.map((s) => s.catalogId).filter(Boolean)),
    [subscriptions],
  );

  const userCategories = useMemo(
    () => new Set(subscriptions.map((s) => s.category)),
    [subscriptions],
  );

  const allCategories = useMemo(
    () => Array.from(new Set(catalogItems.map((c) => c.category))).sort(),
    [catalogItems],
  );

  // Filtrelenmiş items
  const filteredItems = useMemo(() => {
    let items = catalogItems;
    if (debouncedQuery) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          i.category.toLowerCase().includes(debouncedQuery.toLowerCase()),
      );
    }
    if (selectedCategory) {
      items = items.filter((i) => i.category === selectedCategory);
    }
    return items;
  }, [catalogItems, debouncedQuery, selectedCategory]);

  // Section'lar
  const sections = useMemo(() => {
    if (debouncedQuery || selectedCategory) {
      return [{ title: 'Sonuçlar', items: filteredItems }];
    }
    const recommended = filteredItems.filter(
      (i) => userCategories.has(i.category) && !subscribedCatalogIds.has(i.id),
    );
    const others = filteredItems.filter(
      (i) => !userCategories.has(i.category) && !subscribedCatalogIds.has(i.id),
    );
    const subscribed = filteredItems.filter((i) => subscribedCatalogIds.has(i.id));
    const result = [];
    if (recommended.length > 0) result.push({ title: 'Sana Özel Öneriler', items: recommended });
    if (others.length > 0) result.push({ title: 'Popüler Servisler', items: others });
    if (subscribed.length > 0) result.push({ title: 'Zaten Abone Olduklarım', items: subscribed });
    return result;
  }, [filteredItems, debouncedQuery, selectedCategory, userCategories, subscribedCatalogIds]);

  // FlatList için düz veri (header + satır çiftleri)
  const listData = useMemo((): ListRow[] => {
    const rows: ListRow[] = [];
    sections.forEach(({ title, items }) => {
      rows.push({ type: 'header', title, count: items.length });
      for (let i = 0; i < items.length; i += 2) {
        rows.push({ type: 'item', left: items[i], right: items[i + 1] ?? null });
      }
    });
    return rows;
  }, [sections]);

  const handleAdd = useCallback((item: CatalogItem) => setAddingItem(item), []);

  const renderCard = (item: CatalogItem) => (
    <CatalogCard
      key={item.id}
      item={item}
      isSubscribed={subscribedCatalogIds.has(item.id)}
      isRecommended={userCategories.has(item.category)}
      colors={colors}
      onAdd={handleAdd}
    />
  );

  const renderRow = ({ item }: { item: ListRow }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{item.title}</Text>
          <Text style={[styles.sectionCount, { color: colors.textSec }]}>{item.count} servis</Text>
        </View>
      );
    }
    return (
      <View style={styles.cardRow}>
        {renderCard(item.left)}
        {item.right ? renderCard(item.right) : <View style={styles.cardPlaceholder} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* HEADER */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Keşfet</Text>
            <Text style={styles.headerSub}>
              {userCategories.size > 0
                ? `${userCategories.size} kategorine göre öneriler`
                : 'Popüler abonelikler'}
            </Text>
          </View>
        </View>

        {/* Arama */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Servis ara..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setDebouncedQuery(''); }}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* KATEGORİ FİLTRELERİ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        style={styles.filterScrollView}
      >
        {['Tümü', ...allCategories].map((item) => {
          const isAll = item === 'Tümü';
          const active = isAll ? selectedCategory === null : selectedCategory === item;
          const isUserCat = !isAll && userCategories.has(item);
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.accent : colors.cardBg,
                  borderColor: active ? colors.accent : isUserCat ? colors.accent + '60' : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(isAll ? null : item)}
            >
              {isUserCat && !active && (
                <View style={[styles.chipDot, { backgroundColor: colors.accent }]} />
              )}
              <Text style={[styles.filterChipText, { color: active ? '#FFF' : colors.textMain }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* TREND OLAN SERVİSLER */}
      {trendingItems.length > 0 && !debouncedQuery && !selectedCategory && (
        <View style={styles.trendingSection}>
          <Text style={[styles.trendingTitle, { color: colors.textMain }]}>🔥 Trend</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingList}>
            {trendingItems.map((item) => (
              <TrendingCard
                key={item.id}
                item={item}
                isSubscribed={subscribedCatalogIds.has(item.id)}
                colors={colors}
                onAdd={handleAdd}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* İÇERİK */}
      <FlatList
        data={listData}
        keyExtractor={(item, index) =>
          item.type === 'header' ? `header-${item.title}` : `row-${index}`
        }
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          catalogLoading ? (
            // #42: ActivityIndicator → SubscriptionSkeletonList
            <SubscriptionSkeletonList count={6} />
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={48} color={colors.textSec} />
              <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Sonuç bulunamadı</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSec }]}>
                Farklı bir arama terimi deneyin.
              </Text>
            </View>
          )
        }
      />

      {/* AddSubscription Modal */}
      <AddSubscriptionModal
        visible={!!addingItem}
        onClose={() => setAddingItem(null)}
        selectedCatalogItem={addingItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 14,
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, marginLeft: 8 },

  filterScrollView: { flexGrow: 0, flexShrink: 0 },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    height: 34,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  filterChipText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  sectionCount: { fontSize: 12 },

  listContent: { paddingBottom: 40 },
  cardRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, justifyContent: 'space-between' },

  // Kart
  card: {
    width: CARD_SIZE,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardPlaceholder: { width: CARD_SIZE },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardImg: { width: 36, height: 36, resizeMode: 'contain' },
  cardInitial: { fontSize: 22, fontWeight: '800' },
  cardName: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  cardCategory: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  cardPricePer: { fontSize: 10, fontWeight: '500' },
  subscribedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 6,
  },
  subscribedText: { color: '#16A34A', fontSize: 11, fontWeight: '700', marginLeft: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 6,
  },
  addBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },

  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 14 },
  emptyDesc: { fontSize: 14, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },

  // Trending
  trendingSection: { paddingBottom: 4 },
  trendingTitle: { fontSize: 14, fontWeight: '800', marginLeft: 16, marginBottom: 8, marginTop: 4 },
  trendingList: { paddingHorizontal: 16, gap: 10 },
  trendingCard: {
    width: 76,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  trendingIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  trendingImg: { width: 30, height: 30, resizeMode: 'contain' },
  trendingInitial: { fontSize: 18, fontWeight: '800' },
  trendingName: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
});
