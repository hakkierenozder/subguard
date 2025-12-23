// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { logout } from '../utils/AuthManager';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Stack'i sıfırla ve Login'e git
          navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>GENEL</Text>
            <TouchableOpacity style={styles.item}>
                <Ionicons name="notifications-outline" size={22} color={THEME.textMain} />
                <Text style={styles.itemText}>Bildirimler</Text>
                <Ionicons name="chevron-forward" size={20} color={THEME.textSec} />
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FFF" style={{marginRight: 8}} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SubGuard v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    backgroundColor: THEME.white,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: THEME.primary },
  content: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: THEME.textSec, marginBottom: 10, marginLeft: 4 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.white, padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: THEME.border },
  itemText: { flex: 1, fontSize: 16, color: THEME.textMain, marginLeft: 12, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', backgroundColor: THEME.error, padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: THEME.textSec, fontSize: 12, marginTop: 30 },
});