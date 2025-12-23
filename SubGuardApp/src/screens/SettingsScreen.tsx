import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch, StatusBar, Linking } from 'react-native';
import { THEME } from '../constants/theme';
import { logout, getUserId } from '../utils/AuthManager';
import agent from '../api/agent';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  
  // State'ler
  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string; monthlyBudget: number } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modallar
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Veri Çekme
  const loadProfile = async () => {
    try {
      const response = await agent.Auth.getProfile();
      if (response && response.data) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error("Profil yüklenemedi");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handleSupport = () => {
      Linking.openURL('mailto:support@subguard.app');
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
      
      {/* HEADER */}
      <LinearGradient
        colors={[THEME.primary, THEME.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Ayarlar</Text>
        
        <View style={styles.profileCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.userName}>{userProfile?.fullName || 'Yükleniyor...'}</Text>
                <Text style={styles.userEmail}>{userProfile?.email || ''}</Text>
                {/* DÜZELTME: Güvenli Kontrol */}
                {(userProfile?.monthlyBudget ?? 0) > 0 && (
                    <Text style={styles.budgetBadge}>
                        Hedef: {userProfile?.monthlyBudget} TRY
                    </Text>
                )}
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => setShowEditProfile(true)}>
                <Ionicons name="create-outline" size={20} color={THEME.textSec} />
            </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionHeader}>HESAP</Text>
        <View style={styles.section}>
            <MenuItem 
                icon="person-outline" 
                title="Profil ve Bütçe Düzenle" 
                onPress={() => setShowEditProfile(true)} 
            />
            <MenuItem 
                icon="lock-closed-outline" 
                title="Şifre Değiştir" 
                onPress={() => setShowChangePassword(true)} 
            />
        </View>

        <Text style={styles.sectionHeader}>UYGULAMA</Text>
        <View style={styles.section}>
            <MenuItem 
                icon="notifications-outline" 
                title="Bildirimler" 
                hasSwitch 
                value={notificationsEnabled}
                onToggle={setNotificationsEnabled}
            />
            <MenuItem 
                icon="moon-outline" 
                title="Karanlık Mod (Yakında)" 
                hasSwitch 
                value={isDarkMode}
                onToggle={setIsDarkMode}
            />
        </View>

        <Text style={styles.sectionHeader}>DİĞER</Text>
        <View style={styles.section}>
            <MenuItem icon="help-circle-outline" title="Yardım & Destek" onPress={handleSupport} />
            <MenuItem icon="log-out-outline" title="Çıkış Yap" isDestructive onPress={handleLogout} />
        </View>

        <Text style={styles.versionText}>SubGuard v1.0.2</Text>
        <View style={{height: 40}} /> 
      </ScrollView>

      {/* MODALLAR */}
      <EditProfileModal 
        visible={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
        currentUser={userProfile}
        onUpdateSuccess={loadProfile}
      />
      
      <ChangePasswordModal 
        visible={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
      />

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
      marginBottom: 4,
  },
  budgetBadge: {
      fontSize: 12,
      fontWeight: '600',
      color: THEME.success,
      backgroundColor: '#ECFDF5',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
      overflow: 'hidden',
      marginTop: 4
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