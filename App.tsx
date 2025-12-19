import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Ekranlar
import HomeScreen from './src/screens/HomeScreen';
import MySubscriptionsScreen from './src/screens/MySubscriptionsScreen';
import { registerForPushNotificationsAsync } from './src/utils/NotificationManager';

export default function App() {
  // Hangi sekmenin açık olduğunu tutan basit bir değişken
  // 'catalog' veya 'wallet'
  const [activeTab, setActiveTab] = useState<'catalog' | 'wallet'>('catalog');

  useEffect(() => {
    registerForPushNotificationsAsync().then(() => {
      console.log("Bildirim sistemi hazır.");
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      
      {/* ANA İÇERİK ALANI */}
      <View style={styles.contentContainer}>
        {activeTab === 'catalog' ? (
          <HomeScreen />
        ) : (
          <MySubscriptionsScreen />
        )}
      </View>

      {/* ÖZEL TAB BAR (Kendi yaptığımız alt menü) */}
      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        
        {/* Buton 1: Katalog */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'catalog' && styles.activeTabText
          ]}>
            Keşfet
          </Text>
          {/* Aktifse altına nokta koy */}
          {activeTab === 'catalog' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Buton 2: Cüzdanım */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('wallet')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'wallet' && styles.activeTabText
          ]}>
            Aboneliklerim
          </Text>
          {activeTab === 'wallet' && <View style={styles.activeDot} />}
        </TouchableOpacity>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    
    // DÜZELTME: Sabit height yerine padding kullanıyoruz.
    // Böylece Android'de ekranın altına göre otomatik esneyecek.
    paddingTop: 12, 
    // paddingBottom: SafeAreaView tarafından otomatik yönetilecek (edges={['bottom']})
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Butonların tıklama alanı rahat olsun
    paddingBottom: Platform.OS === 'ios' ? 0 : 12, 
  },
  tabText: {
    fontSize: 12, // Biraz küçülttük, daha zarif durur
    color: '#999',
    fontWeight: '600',
    marginTop: 4,
  },
  activeTabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    marginTop: 6, // Yazı ile nokta arasını açtık
  }
});