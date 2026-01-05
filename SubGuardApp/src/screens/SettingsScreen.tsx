import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch, StatusBar, Linking } from 'react-native';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { logout } from '../utils/AuthManager';
import { registerForPushNotificationsAsync, cancelAllNotifications, syncSubscriptionsToCalendar } from '../utils/NotificationManager';
import agent from '../api/agent';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const { isDarkMode, toggleDarkMode, notificationsEnabled, toggleNotifications } = useSettingsStore();
  const { subscriptions } = useUserSubscriptionStore();
  
  // State'ler
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string; monthlyBudget: number } | null>(null);
  
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

  // --- HANDLERS ---

  const handleCalendarToggle = async (value: boolean) => {
    setCalendarSyncEnabled(value);
    if (value) {
      // Açıldığında senkronize et
      await syncSubscriptionsToCalendar(subscriptions);
    } else {
      // Kapatıldığında kullanıcıya bilgi ver
      Alert.alert("Bilgi", "Otomatik senkronizasyon durduruldu. Takviminizdeki mevcut etkinlikler silinmez.");
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
      if (value) {
          const hasPermission = await registerForPushNotificationsAsync();
          if (hasPermission) {
              toggleNotifications(true);
              Alert.alert("Bilgi", "Bildirimler açıldı. Ödeme günlerinde hatırlatma alacaksınız.");
          } else {
              toggleNotifications(false);
          }
      } else {
          await cancelAllNotifications();
          toggleNotifications(false);
      }
  };

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

  // --- COMPONENTS ---

  const MenuItem = ({ icon, title, isDestructive = false, hasSwitch = false, value = false, onToggle = () => {}, onPress = () => {} }: any) => (
      <TouchableOpacity 
        style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.border, borderBottomColor: colors.inputBg }]} 
        onPress={hasSwitch ? undefined : onPress}
        activeOpacity={hasSwitch ? 1 : 0.7}
      >
          <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FEF2F2' : colors.inputBg }]}>
              <Ionicons name={icon} size={20} color={isDestructive ? colors.error : colors.primary} />
          </View>
          <Text style={[styles.menuText, { color: isDestructive ? colors.error : colors.textMain }]}>{title}</Text>
          
          {hasSwitch ? (
              <Switch 
                value={value} 
                onValueChange={onToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
          ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.textSec} />
          )}
      </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: colors.white }]}>Ayarlar</Text>
        
        <View style={[styles.profileCard, { backgroundColor: colors.cardBg, shadowColor: isDarkMode ? '#000' : '#000' }]}>
            <View style={[styles.avatar, { backgroundColor: colors.inputBg }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
            </View>
            <View style={{flex: 1}}>
                <Text style={[styles.userName, { color: colors.textMain }]}>{userProfile?.fullName || 'Yükleniyor...'}</Text>
                <Text style={[styles.userEmail, { color: colors.textSec }]}>{userProfile?.email || ''}</Text>
                
                {(userProfile?.monthlyBudget ?? 0) > 0 && (
                    <Text style={[styles.budgetBadge, { color: colors.success, backgroundColor: isDarkMode ? 'rgba(16,185,129,0.2)' : '#ECFDF5' }]}>
                        Hedef: {userProfile?.monthlyBudget} TRY
                    </Text>
                )}
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => setShowEditProfile(true)}>
                <Ionicons name="create-outline" size={20} color={colors.textSec} />
            </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.sectionHeader, { color: colors.textSec }]}>HESAP</Text>
        <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
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

        <Text style={[styles.sectionHeader, { color: colors.textSec }]}>UYGULAMA</Text>
        <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <MenuItem 
                icon="notifications-outline" 
                title="Bildirimler" 
                hasSwitch 
                value={notificationsEnabled}
                onToggle={handleNotificationToggle}
            />
            <MenuItem 
                icon="calendar-outline" 
                title="Takvim Entegrasyonu" 
                hasSwitch 
                value={calendarSyncEnabled}
                onToggle={handleCalendarToggle}
            />
            <MenuItem 
                icon={isDarkMode ? "moon" : "moon-outline"}
                title="Karanlık Mod" 
                hasSwitch 
                value={isDarkMode}
                onToggle={toggleDarkMode}
            />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.textSec }]}>DİĞER</Text>
        <View style={[styles.section, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <MenuItem icon="help-circle-outline" title="Yardım & Destek" onPress={handleSupport} />
            <MenuItem icon="log-out-outline" title="Çıkış Yap" isDestructive onPress={handleLogout} />
        </View>

        <Text style={[styles.versionText, { color: colors.textSec }]}>SubGuard v1.0.3</Text>
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
  container: { flex: 1 },
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
    marginBottom: 20,
  },
  profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 20,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
  },
  avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  avatarText: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  userName: {
      fontSize: 18,
      fontWeight: '700',
  },
  userEmail: {
      fontSize: 13,
      marginBottom: 4,
  },
  budgetBadge: {
      fontSize: 12,
      fontWeight: '600',
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
      marginBottom: 10,
      marginLeft: 4,
      letterSpacing: 1,
  },
  section: {
      borderRadius: 16,
      marginBottom: 24,
      overflow: 'hidden',
      borderWidth: 1,
  },
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
  },
  iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  menuText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
  },
  versionText: {
      textAlign: 'center',
      fontSize: 12,
      marginTop: 10,
  },
});