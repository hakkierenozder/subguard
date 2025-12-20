import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Ekranlar
import HomeScreen from './src/screens/HomeScreen';
import MySubscriptionsScreen from './src/screens/MySubscriptionsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';     // YENİ
import RegisterScreen from './src/screens/RegisterScreen'; // YENİ

// Servisler
import { registerForPushNotificationsAsync } from './src/utils/NotificationManager';
import { isAuthenticated, logoutUser } from './src/utils/AuthManager'; // YENİ

export default function App() {
  const [loading, setLoading] = useState(true); // Başlangıç kontrolü için
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Giriş durumu
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login'); // Login mi Register mı?
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'wallet' | 'reports' | 'settings'>('wallet');

  // 1. Uygulama Açılışında Kontrol
  useEffect(() => {
    checkLoginStatus();
    registerForPushNotificationsAsync();
  }, []);

  const checkLoginStatus = async () => {
    const logged = await isAuthenticated();
    setIsLoggedIn(logged);
    setLoading(false);
  };

  // Login Başarılı Olunca
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActiveTab('wallet'); // Cüzdana at
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Giriş durumunu kapat
    setAuthMode('login'); // Login ekranına hazırla
    setActiveTab('wallet'); // Bir sonraki giriş için tab'ı sıfırla
  };

  // Çıkış Yapılınca (SettingsScreen'den tetiklenecek)
  // (Bunu SettingsScreen'e prop olarak geçmek yerine basit bir global event veya store ile de yapabiliriz ama şimdilik manuel logout yapıyoruz)
  
  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  // --- GİRİŞ YAPILMAMIŞSA (AUTH EKRANLARI) ---
  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        {authMode === 'login' ? (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess} 
            onGoToRegister={() => setAuthMode('register')} 
          />
        ) : (
          <RegisterScreen 
            onLoginSuccess={handleLoginSuccess} 
            onGoToLogin={() => setAuthMode('login')} 
          />
        )}
      </SafeAreaProvider>
    );
  }

  // --- GİRİŞ YAPILMIŞSA (ANA UYGULAMA) ---
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      
      <View style={styles.contentContainer}>
        {activeTab === 'catalog' && <HomeScreen />}
        {activeTab === 'wallet' && <MySubscriptionsScreen />}
        {activeTab === 'reports' && <ReportsScreen />}
        
        {/* SettingsScreen'e Logout yeteneği versek iyi olur ama şimdilik standart bırakıyoruz. 
            Logout için SettingsScreen içinde logoutUser() çağırıp, App.tsx'i yenilememiz (Reload) gerekebilir.
            Pratik Çözüm: SettingsScreen'de "logoutUser" yapıp "Updates.reloadAsync()" kullanabilirsin.
        */}
        {activeTab === 'settings' && <SettingsScreen onLogout={handleLogout} />}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('catalog')}>
          <Ionicons name={activeTab === 'catalog' ? "grid" : "grid-outline"} size={24} color={activeTab === 'catalog' ? '#333' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.activeTabText]}>Keşfet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('wallet')}>
          <Ionicons name={activeTab === 'wallet' ? "wallet" : "wallet-outline"} size={24} color={activeTab === 'wallet' ? '#333' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>Cüzdanım</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('reports')}>
          <Ionicons name={activeTab === 'reports' ? "pie-chart" : "pie-chart-outline"} size={24} color={activeTab === 'reports' ? '#333' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Analiz</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('settings')}>
          <Ionicons name={activeTab === 'settings' ? "settings" : "settings-outline"} size={24} color={activeTab === 'settings' ? '#333' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Ayarlar</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  contentContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 10 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: Platform.OS === 'ios' ? 0 : 10 },
  tabText: { fontSize: 10, color: '#999', fontWeight: '600', marginTop: 4 },
  activeTabText: { color: '#333', fontWeight: 'bold' }
});