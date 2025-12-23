import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, StatusBar, Switch } from 'react-native';
import { THEME } from '../constants/theme';
import { logout, getUserId } from '../utils/AuthManager';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [userId, setUserId] = useState<string | null>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
      const loadUser = async () => {
          const id = await getUserId();
          setUserId(id);
      };
      loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Ana Stack'e erişip Login'e dön
          navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const MenuItem = ({ icon, title, isDestructive = false, hasSwitch = false, value = false, onToggle = () => {}, onPress = () => {} }: any) => (
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={hasSwitch ? undefined : onPress}
        activeOpacity={hasSwitch ? 1 : 0.7}
      >
          <View style={[styles.iconBox, isDestructive && { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name={icon} size={20} color={isDestructive ? THEME.error : THEME.primary} />
          </View>
          <Text style={[styles.menuText, isDestructive && { color: THEME.error }]}>{title}</Text>
          
          {hasSwitch ? (
              <Switch 
                value={value} 
                onValueChange={onToggle}
                trackColor={{ false: THEME.border, true: THEME.primary }}
              />
          ) : (
              <Ionicons name="chevron-forward" size={20} color={THEME.textSec} />
          )}
      </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER SECTION */}
      <LinearGradient
        colors={[THEME.primary, THEME.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Ayarlar</Text>
        
        {/* PROFİL KARTI */}
        <View style={styles.profileCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>U</Text>
            </View>
            <View>
                <Text style={styles.userName}>Kullanıcı</Text>
                <Text style={styles.userEmail}>{userId || 'ID Yükleniyor...'}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
                <Ionicons name="create-outline" size={20} color={THEME.textSec} />
            </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* HESAP AYARLARI */}
        <Text style={styles.sectionHeader}>HESAP</Text>
        <View style={styles.section}>
            <MenuItem icon="person-outline" title="Profil Bilgileri" />
            <MenuItem icon="lock-closed-outline" title="Şifre Değiştir" />
        </View>

        {/* UYGULAMA AYARLARI */}
        <Text style={styles.sectionHeader}>UYGULAMA</Text>
        <View style={styles.section}>
            <MenuItem 
                icon="notifications-outline" 
                title="Bildirimler" 
                hasSwitch 
                value={notificationsEnabled}
                onToggle={setNotificationsEnabled}
            />
            <MenuItem icon="globe-outline" title="Para Birimi (TRY)" />
            <MenuItem icon="moon-outline" title="Tema Görünümü" />
        </View>

        {/* DİĞER */}
        <Text style={styles.sectionHeader}>DİĞER</Text>
        <View style={styles.section}>
            <MenuItem icon="help-circle-outline" title="Yardım & Destek" />
            <MenuItem icon="document-text-outline" title="Gizlilik Politikası" />
            <MenuItem icon="log-out-outline" title="Çıkış Yap" isDestructive onPress={handleLogout} />
        </View>

        <Text style={styles.versionText}>SubGuard v1.0.2 (Beta)</Text>
        <View style={{height: 40}} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      padding: 16,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
  },
  avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: THEME.inputBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  avatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: THEME.primary,
  },
  userName: {
      fontSize: 18,
      fontWeight: '700',
      color: THEME.textMain,
  },
  userEmail: {
      fontSize: 13,
      color: THEME.textSec,
  },
  editBtn: {
      marginLeft: 'auto',
      padding: 8,
  },
  
  content: {
      padding: 20,
  },
  sectionHeader: {
      fontSize: 12,
      fontWeight: '700',
      color: THEME.textSec,
      marginBottom: 10,
      marginLeft: 4,
      letterSpacing: 1,
  },
  section: {
      backgroundColor: '#FFF',
      borderRadius: 16,
      marginBottom: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: THEME.border,
  },
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: THEME.inputBg,
  },
  iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: THEME.inputBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  menuText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: THEME.textMain,
  },
  versionText: {
      textAlign: 'center',
      color: THEME.textSec,
      fontSize: 12,
      marginTop: 10,
  },
});