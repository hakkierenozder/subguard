import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import { useCatalogStore } from '../store/useCatalogStore';
import { CatalogItem } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../constants/theme';

interface Props {
  onSelect: (item: CatalogItem) => void;
  isEmbedded?: boolean;
}

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = 100;
const GRID_ITEM_WIDTH = (width - 48) / 3;
const HERO_WIDTH = width * 0.75;

// Hero kart gradient renkleri — tema bağımsız, karanlık overlay
const HERO_GRADIENT_START = '#1E293B';
const HERO_GRADIENT_END   = '#334155';

// Component dışında tanımlanmalı — içeride tanımlanırsa her render'da yeni tip oluşur, state sıfırlanır
function CatalogLogo({
  logoUrl, name, colorCode, imgStyle, txtStyle,
}: { logoUrl?: string; name: string; colorCode?: string; imgStyle: any; txtStyle: any }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (logoUrl && !imgFailed) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={imgStyle}
        onError={() => setImgFailed(true)}
      />
    );
  }
  return <Text style={txtStyle}>{name.charAt(0)}</Text>;
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textMain,
  },
  // Hero
  heroWrapper: {
    width: HERO_WIDTH,
    marginRight: 12,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    height: 80,
  },
  heroIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  heroImg: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain'
  },
  heroTxt: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  heroTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  // Item (Yatay Liste)
  itemWrapper: {
    width: ITEM_WIDTH,
    marginRight: 12,
  },
  itemCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  itemImg: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  itemTxt: { fontSize: 18, fontWeight: 'bold' },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'center',
    marginTop: 4
  },

  // Category Header
  catHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  catTitle: { fontSize: 15, fontWeight: '700', color: colors.textMain },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAll: { fontSize: 12, color: colors.accent, fontWeight: '600', marginRight: 2 },

  // Modal & Grid
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBg,
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
  },
  modalListContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItemWrapper: {
    width: GRID_ITEM_WIDTH,
    marginBottom: 8,
  },
  gridCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  gridImg: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  gridTxt: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  gridTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default function CatalogExplore({ onSelect, isEmbedded = false }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { catalogItems, fetchCatalog, loading } = useCatalogStore();
  const [searchText, setSearchText] = useState('');
  const [viewAllCategory, setViewAllCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const { featuredItems, groupedItems } = useMemo(() => {
    if (!catalogItems) return { featuredItems: [], groupedItems: {} };

    let items = catalogItems;
    if (searchText) {
      items = items.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()));
    }

    const featured = !searchText ? items.slice(0, 5) : [];

    const grouped = items.reduce((acc, item) => {
      const category = item.category || 'Diğer';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, CatalogItem[]>);

    return { featuredItems: featured, groupedItems: grouped };
  }, [catalogItems, searchText]);

  const modalItems = useMemo(() => {
    if (!viewAllCategory || !groupedItems[viewAllCategory]) return [];
    return groupedItems[viewAllCategory];
  }, [viewAllCategory, groupedItems]);

  const handleSeeAll = (category: string) => {
    setViewAllCategory(category);
  };

  const closeSeeAll = () => {
    setViewAllCategory(null);
  };

  if (loading && (!catalogItems || catalogItems.length === 0)) {
    return <ActivityIndicator size="small" color={colors.accent} style={{ margin: 20 }} />;
  }

  // --- 1. HERO KART RENDER ---
  const renderHeroCard = ({ item }: { item: CatalogItem }) => (
    <TouchableOpacity onPress={() => onSelect(item)} activeOpacity={0.9} style={styles.heroWrapper}>
      <LinearGradient
        colors={[item.colorCode || HERO_GRADIENT_START, HERO_GRADIENT_END]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroIconBg}>
          <CatalogLogo logoUrl={item.logoUrl} name={item.name} colorCode={item.colorCode} imgStyle={styles.heroImg} txtStyle={styles.heroTxt} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.heroSub}>Popüler • {item.category}</Text>
        </View>
        <Ionicons name="add-circle" size={28} color="rgba(255,255,255,0.9)" />
      </LinearGradient>
    </TouchableOpacity>
  );

  // --- 2. STANDART ITEM KART RENDER (Yatay Liste) ---
  const renderItemCard = ({ item }: { item: CatalogItem }) => (
    <TouchableOpacity onPress={() => onSelect(item)} activeOpacity={0.8} style={styles.itemWrapper}>
      <View style={styles.itemCard}>
        <View style={styles.itemIcon}>
          <CatalogLogo logoUrl={item.logoUrl} name={item.name} colorCode={item.colorCode} imgStyle={styles.itemImg} txtStyle={[styles.itemTxt, { color: item.colorCode || colors.textMain }]} />
        </View>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  // --- 3. GRID ITEM KART RENDER (Modal İçin) ---
  const renderGridItem = ({ item }: { item: CatalogItem }) => (
    <TouchableOpacity onPress={() => { closeSeeAll(); onSelect(item); }} activeOpacity={0.8} style={styles.gridItemWrapper}>
      <View style={styles.gridCard}>
        <View style={[styles.gridIcon, { backgroundColor: item.colorCode || colors.inputBg }]}>
          <CatalogLogo logoUrl={item.logoUrl} name={item.name} colorCode={item.colorCode} imgStyle={styles.gridImg} txtStyle={[styles.gridTxt, { color: '#FFF' }]} />
        </View>
        <Text style={styles.gridTitle} numberOfLines={1}>{item.name}</Text>
        <Ionicons name="add-circle" size={24} color={colors.accent} style={{ marginTop: 8 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* ARAMA ÇUBUĞU */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textSec} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Servis ara (Netflix, Spotify...)"
          placeholderTextColor={colors.textSec}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* HERO (Sadece arama yoksa) */}
      {featuredItems.length > 0 && (
        <View style={styles.section}>
          <FlatList
            data={featuredItems}
            renderItem={renderHeroCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            snapToInterval={HERO_WIDTH + 12}
            decelerationRate="fast"
          />
        </View>
      )}

      {/* KATEGORİLER */}
      {Object.keys(groupedItems).map(cat => (
        <View key={cat} style={styles.section}>
          <View style={styles.catHeader}>
            <Text style={styles.catTitle}>{cat}</Text>
            <TouchableOpacity onPress={() => handleSeeAll(cat)} style={styles.seeAllBtn}>
              <Text style={styles.seeAll}>Tümü</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={groupedItems[cat]}
            renderItem={renderItemCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ))}

      {/* Alt boşluk (Home scroll'u için) */}
      <View style={{ height: 40 }} />

      {/* --- TÜMÜNÜ GÖR MODALI (FULL SCREEN) --- */}
      <Modal
        visible={!!viewAllCategory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSeeAll}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeSeeAll} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textMain} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{viewAllCategory}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Grid Content */}
          <FlatList
            data={modalItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderGridItem}
            numColumns={3}
            contentContainerStyle={styles.modalListContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

    </View>
  );
}
