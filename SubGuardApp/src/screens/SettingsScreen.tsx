import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUserId, logoutUser } from '../utils/AuthManager';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import * as Updates from 'expo-updates';
import { syncLocalNotifications } from '../utils/NotificationManager';

export default function SettingsScreen() {
  const [userId, setUserId] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { subscriptions, fetchUserSubscriptions } = useUserSubscriptionStore();

  useEffect(() => {
    getUserId().then(id => setUserId(id));
  }, []);

  const handleManualSync = async () => {
    // Hem veriyi hem bildirimleri yenile
    await fetchUserSubscriptions();
    Alert.alert("Başarılı", "Veriler ve bildirimler senkronize edildi. ✅");
  };
 
  const handleLogout = async () => {
      Alert.alert("Çıkış Yap", "Hesabından çıkış yapmak istiyor musun?", [
          { text: "Vazgeç", style: "cancel" },
          { 
              text: "Çıkış Yap", 
              style: "destructive", 
              onPress: async () => {
                  await logoutUser();
                  // Uygulamayı yeniden başlatarak Login ekranına atar
                  try {
                      await Updates.reloadAsync();
                  } catch (e) {
                      // Expo Go'da çalışmıyorsa alert ver
                      Alert.alert("Çıkış Yapıldı", "Lütfen uygulamayı kapatıp açın.");
                  }
              } 
          }
      ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* PROFİL KARTI */}
        <View style={styles.card}>
            <View style={styles.profileRow}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#fff" />
                </View>
                <View>
                    <Text style={styles.label}>Kullanıcı Kimliği (ID)</Text>
                    <Text style={styles.value}>{userId.slice(0, 15)}...</Text> 
                </View>
            </View>
        </View>

        <Text style={styles.sectionTitle}>Genel</Text>

        {/* BİLDİRİM AYARI */}
        <View style={styles.row}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons name="notifications-outline" size={22} color="#333" style={styles.icon} />
                <Text style={styles.rowText}>Bildirimler</Text>
            </View>
            <Switch 
                value={notificationsEnabled} 
                onValueChange={setNotificationsEnabled}
                trackColor={{false: '#ddd', true: '#333'}}
            />
        </View>

        {/* SENKRONİZASYON BUTONU */}
        <TouchableOpacity style={styles.row} onPress={handleManualSync}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons name="sync-outline" size={22} color="#333" style={styles.icon} />
                <Text style={styles.rowText}>Verileri Yenile & Eşitle</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Uygulama</Text>

        {/* HAKKINDA */}
        <TouchableOpacity style={styles.row} onPress={() => Alert.alert("SubGuard", "Sürüm 1.0.0\nGeliştirici: Sen! 🚀")}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons name="information-circle-outline" size={22} color="#333" style={styles.icon} />
                <Text style={styles.rowText}>Hakkında</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* ÇIKIŞ / SIFIRLA */}
        <TouchableOpacity style={[styles.row, {borderBottomWidth: 0}]} onPress={handleLogout}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Ionicons name="log-out-outline" size={22} color="red" style={styles.icon} />
                <Text style={[styles.rowText, {color: 'red'}]}>Oturumu Kapat (Sıfırla)</Text>
            </View>
        </TouchableOpacity>

        <Text style={styles.footer}>SubGuard v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  content: { padding: 20 },
  card: { backgroundColor: '#333', borderRadius: 12, padding: 20, marginBottom: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  label: { color: '#ccc', fontSize: 12, marginBottom: 2 },
  value: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#999', marginBottom: 10, marginLeft: 5, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  rowText: { fontSize: 16, color: '#333' },
  icon: { marginRight: 12 },
  footer: { textAlign: 'center', color: '#ccc', marginTop: 20, fontSize: 12 }
});