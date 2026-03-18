import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  Switch, StatusBar, Linking, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { logout, removeToken } from '../utils/AuthManager';
import { registerForPushNotificationsAsync, getExpoPushToken, cancelAllNotifications, syncSubscriptionsToCalendar } from '../utils/NotificationManager';
import agent from '../api/agent';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

// ─── Yardımcı Bileşenler ────────────────────────────────────────────────────

interface MenuItemProps {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  isDestructive?: boolean;
  hasSwitch?: boolean;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
  rightLabel?: string;
}

function MenuItem({
  icon, iconColor, iconBg, title, subtitle,
  isDestructive = false, hasSwitch = false,
  value = false, onToggle = () => {}, onPress = () => {},
  isLast = false, rightLabel,
}: MenuItemProps) {
  const colors = useThemeColors();
  const resolvedIconColor = isDestructive ? colors.error : (iconColor || colors.primary);
  const resolvedIconBg   = isDestructive ? '#FEF2F2' : (iconBg || colors.inputBg);

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: colors.cardBg },
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
      onPress={hasSwitch ? undefined : onPress}
      activeOpacity={hasSwitch ? 1 : 0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: resolvedIconBg }]}>
        <Ionicons name={icon as any} size={19} color={resolvedIconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuText, { color: isDestructive ? colors.error : colors.textMain }]}>
          {title}
        </Text>
        {subtitle ? <Text style={[styles.menuSub, { color: colors.textSec }]}>{subtitle}</Text> : null}
      </View>
      {hasSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
      ) : rightLabel ? (
        <Text style={[styles.rightLabel, { color: colors.textSec }]}>{rightLabel}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
      )}
    </TouchableOpacity>
  );
}

/** Chip seçici satırı */
function ChipRow<T extends string | number>({
  label, options, value, onSelect, formatLabel,
}: {
  label: string;
  options: T[];
  value: T;
  onSelect: (v: T) => void;
  formatLabel?: (v: T) => string;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.chipRowContainer}>
      <Text style={[styles.chipRowLabel, { color: colors.textSec }]}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <TouchableOpacity
              key={String(opt)}
              style={[
                styles.chip,
                { borderColor: selected ? colors.primary : colors.border },
                selected && { backgroundColor: colors.primary },
              ]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: selected ? colors.white : colors.textSec }]}>
                {formatLabel ? formatLabel(opt) : String(opt)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** Küçük inline toggle satırı */
function InlineToggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  const colors = useThemeColors();
  return (
    <View style={styles.inlineToggle}>
      <Text style={[styles.chipRowLabel, { color: colors.textSec }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
      />
    </View>
  );
}

// ─── Ana Ekran ───────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();

  const {
    isDarkMode, notificationsEnabled, toggleNotifications, toggleDarkMode,
    notifyDaysBefore, budgetAlertEnabled, sharedAlertEnabled, notifyHour,
    setNotifyDaysBefore, setBudgetAlertEnabled, setSharedAlertEnabled, setNotifyHour,
    defaultCurrency, autoConvert, setDefaultCurrency, setAutoConvert,
    appLockEnabled, appLockMethod, lockAfterMinutes,
    setAppLockEnabled, setAppLockMethod, setLockAfterMinutes,
  } = useSettingsStore();

  const { subscriptions, getTotalExpense } = useUserSubscriptionStore();

  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string; monthlyBudget: number } | null>(null);
  const [showEditProfile, setShowEditProfile]       = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifPrefs, setShowNotifPrefs]         = useState(false);

  const loadProfile = async () => {
    try {
      const res = await agent.Auth.getProfile();
      if (res?.data) setUserProfile(res.data);
    } catch {}
  };

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  // Hesaplamalar
  const activeCount  = subscriptions.filter(s => s.isActive !== false).length;
  const totalExpense = getTotalExpense();
  const budget       = userProfile?.monthlyBudget ?? 0;

  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCalendarToggle = async (value: boolean) => {
    setCalendarSyncEnabled(value);
    if (value) {
      await syncSubscriptionsToCalendar(subscriptions);
    } else {
      Alert.alert('Bilgi', 'Otomatik senkronizasyon durduruldu.');
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const ok = await registerForPushNotificationsAsync();
      toggleNotifications(!!ok);
      if (ok) {
        const token = await getExpoPushToken();
        if (token) {
          try { await agent.Notifications.registerPushToken(token); } catch {}
        }
        Alert.alert('Bildirimler açıldı', 'Ödeme günlerinde hatırlatma alacaksınız.');
      }
    } else {
      await cancelAllNotifications();
      toggleNotifications(false);
      setShowNotifPrefs(false);
    }
  };

  const handleAppLockToggle = (value: boolean) => {
    if (value && appLockMethod === 'biometric') {
      Alert.alert(
        'Biyometrik Doğrulama',
        'Biyometrik kilit için expo-local-authentication paketinin kurulu olması gerekir. PIN kilidi kullanmak ister misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'PIN Kullan', onPress: () => { setAppLockMethod('pin'); setAppLockEnabled(true); } },
        ]
      );
      return;
    }
    setAppLockEnabled(value);
  };

  const handleExportData = async () => {
    try {
      const lines = [
        '📦 SubGuard — Verilerim',
        `Dışa aktarma tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
        '',
        `Kullanıcı: ${userProfile?.fullName || '—'}`,
        `E-posta: ${userProfile?.email || '—'}`,
        `Aylık bütçe hedefi: ${budget > 0 ? `${budget} ₺` : 'Tanımlanmamış'}`,
        '',
        `--- Abonelikler (${subscriptions.length} adet) ---`,
        ...subscriptions.map(s =>
          `• ${s.name} | ${s.price} ${s.currency}/ay | ${s.category} | ${s.isActive !== false ? 'Aktif' : s.cancelledAt ? 'İptal' : 'Durdurulmuş'}`
        ),
      ];
      await Share.share({ message: lines.join('\n'), title: 'SubGuard Verilerim' });
    } catch {
      Alert.alert('Hata', 'Veriler paylaşılamadı.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Tüm abonelik verileriniz, bildirimleriniz ve hesap bilgileriniz kalıcı olarak silinecek.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Emin misiniz?',
              'Hesabınızı kalıcı olarak silmek istediğinizi onaylayın.',
              [
                { text: 'Geri Dön', style: 'cancel' },
                {
                  text: 'Evet, Sil',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await agent.Auth.deleteAccount();
                      await removeToken();
                      navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
                    } catch {
                      // Hata toast'ı agent.ts interceptor tarafından gösterilir
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* ── HEADER ─────────────────────────────────── */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Ayarlar</Text>

        <View style={[styles.profileCard, { backgroundColor: colors.cardBg }]}>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.textMain }]} numberOfLines={1}>
              {userProfile?.fullName || 'Yükleniyor...'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSec }]} numberOfLines={1}>
              {userProfile?.email || ''}
            </Text>
            <View style={styles.profileStats}>
              <View style={[styles.profileStatChip, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="layers-outline" size={10} color={colors.primary} />
                <Text style={[styles.profileStatText, { color: colors.primary }]}>{activeCount} abonelik</Text>
              </View>
              <View style={[styles.profileStatChip, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="wallet-outline" size={10} color={colors.primary} />
                <Text style={[styles.profileStatText, { color: colors.primary }]}>{totalExpense.toFixed(0)}₺/ay</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: colors.inputBg }]}
            onPress={() => setShowEditProfile(true)}
          >
            <Ionicons name="create-outline" size={18} color={colors.textSec} />
          </TouchableOpacity>
        </View>

      </LinearGradient>

      {/* ── İÇERİK ─────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* HESAP */}
        <Text style={[styles.sectionLabel, { color: colors.textSec }]}>HESAP</Text>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <MenuItem
            icon="person-outline" iconColor="#6366F1" iconBg="#EEF2FF"
            title="Profil ve Bütçe Düzenle" subtitle="İsim, e-posta, aylık hedef"
            onPress={() => setShowEditProfile(true)}
          />
          <MenuItem
            icon="lock-closed-outline" iconColor="#64748B" iconBg={isDarkMode ? '#1E293B' : '#F1F5F9'}
            title="Şifre Değiştir" subtitle="Hesap güvenliğini güncelle"
            onPress={() => setShowChangePassword(true)} isLast
          />
        </View>

        {/* ── BİLDİRİM TERCİHLERİ ── */}
        <Text style={[styles.sectionLabel, { color: colors.textSec }]}>BİLDİRİMLER</Text>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <MenuItem
            icon="notifications-outline" iconColor="#F97316" iconBg={isDarkMode ? '#431407' : '#FFEDD5'}
            title="Bildirimler"
            subtitle={notificationsEnabled ? 'Açık — ödeme günü hatırlatması' : 'Kapalı'}
            hasSwitch value={notificationsEnabled} onToggle={handleNotificationToggle}
          />

          {/* Bildirim Tercihleri Detay */}
          {notificationsEnabled && (
            <>
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.cardBg, borderBottomWidth: 1, borderBottomColor: colors.border }]}
                onPress={() => setShowNotifPrefs(p => !p)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                  <Ionicons name="options-outline" size={19} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuText, { color: colors.textMain }]}>Bildirim Detayları</Text>
                  <Text style={[styles.menuSub, { color: colors.textSec }]}>
                    {notifyDaysBefore} gün önce · saat {notifyHour}:00
                  </Text>
                </View>
                <Ionicons
                  name={showNotifPrefs ? 'chevron-up' : 'chevron-down'}
                  size={18} color={colors.inactive}
                />
              </TouchableOpacity>

              {showNotifPrefs && (
                <View style={[styles.prefsPanel, { backgroundColor: colors.inputBg, borderBottomColor: colors.border }]}>
                  <ChipRow
                    label="Kaç gün önce uyarılsın?"
                    options={[1, 3, 7] as const}
                    value={notifyDaysBefore}
                    onSelect={setNotifyDaysBefore}
                    formatLabel={v => `${v} gün`}
                  />
                  <ChipRow
                    label="Uyarı saati"
                    options={[8, 10, 12, 18, 20]}
                    value={notifyHour}
                    onSelect={setNotifyHour}
                    formatLabel={v => `${v}:00`}
                  />
                  <InlineToggle
                    label="Bütçe uyarısı"
                    value={budgetAlertEnabled}
                    onToggle={setBudgetAlertEnabled}
                  />
                  <InlineToggle
                    label="Paylaşım bildirimleri"
                    value={sharedAlertEnabled}
                    onToggle={setSharedAlertEnabled}
                  />
                </View>
              )}
            </>
          )}

          <MenuItem
            icon="calendar-outline" iconColor="#8B5CF6" iconBg={isDarkMode ? '#2E1065' : '#EDE9FE'}
            title="Takvim Entegrasyonu" subtitle="Abonelikleri telefon takvimine ekle"
            hasSwitch value={calendarSyncEnabled} onToggle={handleCalendarToggle}
          />
          <MenuItem
            icon={isDarkMode ? 'moon' : 'moon-outline'} iconColor="#6366F1" iconBg={isDarkMode ? '#1E1B4B' : '#EEF2FF'}
            title="Karanlık Mod" subtitle={isDarkMode ? 'Açık' : 'Kapalı'}
            hasSwitch value={isDarkMode} onToggle={toggleDarkMode} isLast
          />
        </View>

        {/* ── 20. PARA BİRİMİ ── */}
        <Text style={[styles.sectionLabel, { color: colors.textSec }]}>PARA BİRİMİ</Text>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <View style={[styles.menuItem, { backgroundColor: colors.cardBg, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7' }]}>
              <Ionicons name="cash-outline" size={19} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: colors.textMain }]}>Varsayılan Para Birimi</Text>
              <View style={[styles.chipRow, { marginTop: 10 }]}>
                {(['TRY', 'USD', 'EUR'] as const).map(cur => {
                  const selected = defaultCurrency === cur;
                  return (
                    <TouchableOpacity
                      key={cur}
                      style={[
                        styles.chip,
                        { borderColor: selected ? colors.primary : colors.border },
                        selected && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setDefaultCurrency(cur)}
                    >
                      <Text style={[styles.chipText, { color: selected ? colors.white : colors.textSec }]}>{cur}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
          <MenuItem
            icon="swap-horizontal-outline" iconColor="#10B981" iconBg={isDarkMode ? '#064E3B' : '#D1FAE5'}
            title="Otomatik Dönüştürme"
            subtitle={autoConvert ? 'Tüm fiyatlar TRY olarak gösterilir' : 'Orijinal para birimi gösterilir'}
            hasSwitch value={autoConvert} onToggle={setAutoConvert} isLast
          />
        </View>

        {/* ── 22. GÜVENLİK / UYGULAMA KİLİDİ ── */}
        <Text style={[styles.sectionLabel, { color: colors.textSec }]}>GÜVENLİK</Text>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <MenuItem
            icon="shield-checkmark-outline" iconColor="#6366F1" iconBg={isDarkMode ? '#1E1B4B' : '#EEF2FF'}
            title="Uygulama Kilidi"
            subtitle={appLockEnabled ? `Açık — ${appLockMethod === 'pin' ? 'PIN' : 'Biyometrik'}` : 'Kapalı'}
            hasSwitch value={appLockEnabled} onToggle={handleAppLockToggle}
          />
          {appLockEnabled && (
            <View style={[styles.prefsPanel, { backgroundColor: colors.inputBg, borderBottomColor: colors.border }]}>
              <ChipRow
                label="Kilit yöntemi"
                options={['pin', 'biometric'] as const}
                value={appLockMethod}
                onSelect={setAppLockMethod}
                formatLabel={v => v === 'pin' ? 'PIN Kodu' : 'Biyometrik'}
              />
              <ChipRow
                label="Sonra kilitle"
                options={[5, 15, 30, 60] as const}
                value={lockAfterMinutes}
                onSelect={setLockAfterMinutes}
                formatLabel={v => v < 60 ? `${v} dk` : '1 saat'}
              />
            </View>
          )}
          <MenuItem
            icon="finger-print-outline" iconColor="#0EA5E9" iconBg={isDarkMode ? '#0C4A6E' : '#E0F2FE'}
            title="Şifre Değiştir" subtitle="Hesap güvenliğini güncelle"
            onPress={() => setShowChangePassword(true)} isLast
          />
        </View>

        {/* ── 21. VERİ & GİZLİLİK ── */}
        <Text style={[styles.sectionLabel, { color: colors.textSec }]}>VERİ & GİZLİLİK</Text>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <MenuItem
            icon="download-outline" iconColor="#10B981" iconBg={isDarkMode ? '#064E3B' : '#D1FAE5'}
            title="Verilerimi Dışa Aktar"
            subtitle="Aboneliklerinizin özeti paylaşılır"
            onPress={handleExportData}
          />
          <MenuItem
            icon="document-text-outline" iconColor="#0EA5E9" iconBg={isDarkMode ? '#0C4A6E' : '#E0F2FE'}
            title="Gizlilik Politikası"
            onPress={() => Linking.openURL('https://subguard.app/privacy')}
          />
          <MenuItem
            icon="help-circle-outline" iconColor="#0EA5E9" iconBg={isDarkMode ? '#0C4A6E' : '#E0F2FE'}
            title="Yardım & Destek" subtitle="support@subguard.app"
            onPress={() => Linking.openURL('mailto:support@subguard.app')}
          />
          <MenuItem
            icon="trash-outline"
            title="Hesabı Sil (GDPR)"
            subtitle="Tüm veriler kalıcı olarak silinir"
            isDestructive onPress={handleDeleteAccount}
          />
          <MenuItem
            icon="log-out-outline" title="Çıkış Yap"
            isDestructive onPress={handleLogout} isLast
          />
        </View>

        {/* VERSİYON */}
        <View style={[styles.versionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.appName, { color: colors.textMain }]}>SubGuard</Text>
          <Text style={[styles.versionText, { color: colors.textSec }]}>Versiyon 1.0.3</Text>
        </View>

        <View style={{ height: 50 }} />
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
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60, right: -40,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 16 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 6,
  },
  avatarGradient: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  userName: { fontSize: 16, fontWeight: '800', marginBottom: 1 },
  userEmail: { fontSize: 12, marginBottom: 6 },
  profileStats: { flexDirection: 'row' },
  profileStatChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8, marginRight: 6,
  },
  profileStatText: { fontSize: 10, fontWeight: '700', marginLeft: 3 },
  editBtn: { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },

  budgetBar: { marginTop: 14 },
  budgetBarBg: { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', marginBottom: 5 },
  budgetBarFill: { height: '100%', borderRadius: 3 },
  budgetBarText: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },

  content: { padding: 20 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    marginBottom: 10, marginLeft: 4, textTransform: 'uppercase',
  },
  section: { borderRadius: 18, marginBottom: 24, overflow: 'hidden', borderWidth: 1 },

  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 13 },
  menuText: { fontSize: 15, fontWeight: '600' },
  menuSub: { fontSize: 12, fontWeight: '400', marginTop: 1 },
  rightLabel: { fontSize: 13, fontWeight: '600' },

  // Prefs Panel
  prefsPanel: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 14,
  },
  chipRowContainer: { gap: 8 },
  chipRowLabel: { fontSize: 12, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  inlineToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  versionCard: { alignItems: 'center', padding: 18, borderRadius: 18, borderWidth: 1 },
  appName: { fontSize: 16, fontWeight: '800', marginBottom: 3 },
  versionText: { fontSize: 12 },
});
