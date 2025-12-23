import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useCatalogStore } from '../store/useCatalogStore';
import { CatalogItem } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onSelect: (item: CatalogItem) => void;
}

export default function CatalogExplore({ onSelect }: Props) {
  const { catalogItems } = useCatalogStore();

  // Verileri kategorilerine göre gruplama fonksiyonu
  const groupedItems = catalogItems.reduce((acc, item) => {
    const category = item.category || 'Diğer';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CatalogItem[]>);

  // Yatay Listedeki Her Bir Kartın Tasarımı
  const renderCard = ({ item }: { item: CatalogItem }) => (
    <TouchableOpacity 
      style={[styles.card, { borderColor: item.colorCode || '#eee' }]} 
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      {/* Üst Kısım: Logo/Renk ve İsim */}
      <View style={styles.cardHeader}>
        <View style={[styles.logoPlaceholder, { backgroundColor: item.colorCode || '#333' }]}>
            {/* LogoUrl varsa resim, yoksa baş harf */}
            <Text style={styles.logoText}>{item.name.charAt(0)}</Text>
        </View>
        <Text style={styles.appName} numberOfLines={1}>{item.name}</Text>
      </View>

      {/* Alt Kısım: Ekle Butonu */}
      <View style={styles.cardFooter}>
         <Text style={{fontSize:10, color:'#999'}}>Ekle</Text>
         <Ionicons name="add-circle" size={24} color={item.colorCode || "#333"} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {Object.keys(groupedItems).map((category) => (
        <View key={category} style={styles.categorySection}>
          
          {/* Kategori Başlığı (Örn: Streaming) */}
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </View>

          {/* Yatay Liste */}
          <FlatList
            data={groupedItems[category]}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            snapToInterval={130} // Kart genişliği + margin kadar
            decelerationRate="fast"
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingRight: 10
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  listContent: {
    paddingRight: 20, // Listenin sonuna boşluk
  },
  card: {
    width: 120,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    padding: 10,
    justifyContent: 'space-between',
    borderWidth: 1,
    // Hafif gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    alignItems: 'flex-start',
  },
  logoPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  appName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    width: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5
  }
});