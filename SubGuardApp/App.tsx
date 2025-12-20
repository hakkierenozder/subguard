import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import SettingsScreen from './src/screens/SettingsScreen'; // İMPORT ET

// Ekranlar
import HomeScreen from './src/screens/HomeScreen';
import MySubscriptionsScreen from './src/screens/MySubscriptionsScreen';
import { registerForPushNotificationsAsync } from './src/utils/NotificationManager';
import { Ionicons } from '@expo/vector-icons';
import ReportsScreen from './src/screens/ReportsScreen';

export default function App() {
  // Hangi sekmenin açık olduğunu tutan basit bir değişken
  // 'catalog' veya 'wallet'
 const [activeTab, setActiveTab] = useState<'catalog' | 'wallet' | 'reports' | 'settings'>('wallet');

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
        {activeTab === 'catalog' && <HomeScreen />}
        {activeTab === 'wallet' && <MySubscriptionsScreen />}
        {activeTab === 'reports' && <ReportsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* ÖZEL TAB BAR */}
      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        
        {/* 1. Katalog */}
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('catalog')}>
          <Ionicons 
            name={activeTab === 'catalog' ? "grid" : "grid-outline"} 
            size={24} 
            color={activeTab === 'catalog' ? '#333' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.activeTabText]}>Keşfet</Text>
        </TouchableOpacity>

        {/* 2. Cüzdanım */}
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('wallet')}>
          <Ionicons 
            name={activeTab === 'wallet' ? "wallet" : "wallet-outline"} 
            size={24} 
            color={activeTab === 'wallet' ? '#333' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>Cüzdanım</Text>
        </TouchableOpacity>

        {/* 3. Raporlar (YENİ) */}
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('reports')}>
          <Ionicons 
            name={activeTab === 'reports' ? "pie-chart" : "pie-chart-outline"} 
            size={24} 
            color={activeTab === 'reports' ? '#333' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Analiz</Text>
        </TouchableOpacity>

        {/* 4. AYARLAR BUTONU (YENİ) */}
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('settings')}>
          <Ionicons 
            name={activeTab === 'settings' ? "settings" : "settings-outline"} 
            size={24} 
            color={activeTab === 'settings' ? '#333' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Ayarlar</Text>
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
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 0 : 10, 
  },
  tabText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginTop: 4,
  },
  activeTabText: {
    color: '#333',
    fontWeight: 'bold',
  }
});