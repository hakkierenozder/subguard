import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '../constants/theme';
import { useNotificationStore } from '../store/useNotificationStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { logout, getRefreshToken } from '../utils/AuthManager';
import {
  cancelAllNotifications,
  clearSubGuardCalendarEvents,
  getExpoPushToken,
  registerForPushNotificationsAsync,
  syncSubscriptionsToCalendar,
} from '../utils/NotificationManager';
import agent from '../api/agent';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { UserProfileDto, UserSubscription } from '../types';
import {
  formatCurrencyAmount,
  normalizeCurrencyCode,
  SUPPORTED_CURRENCIES,
} from '../utils/CurrencyService';
import {
  convertAmountBetweenCurrencies,
  getSubscriptionMonthlyShareInCurrency,
  getSubscriptionPortfolioMetrics,
} from '../utils/subscriptionMath';

const APP_VERSION = (require('../../app.json').expo.version as string) || '1.0.0';
const REMINDER_DAY_PRESETS = [1, 3, 7] as const;
const NOTIFY_HOUR_PRESETS = [9, 18, 20] as const;
const UPCOMING_DAY_OPTIONS = [7, 14, 30] as const;
const BUDGET_THRESHOLD_OPTIONS = [50, 70, 80, 90] as const;

type PickerType = 'currency' | 'upcomingDays' | 'threshold' | null;
type PushRegistrationResult =
  | { success: true }
  | { success: false; message: string };

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.errors?.[0]
  || error?.response?.data?.message
  || error?.message
  || fallback;

const buildPresetOptions = (presets: readonly number[], current: number) =>
  Array.from(new Set([current, ...presets])).sort((a, b) => a - b);

const formatHourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

interface SettingsRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightText?: string;
  hasSwitch?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  isLast?: boolean;
  isDestructive?: boolean;
  disabled?: boolean;
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  rightText,
  hasSwitch = false,
  value = false,
  onToggle,
  isLast = false,
  isDestructive = false,
  disabled = false,
}: SettingsRowProps) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const iconTint = isDestructive ? colors.error : colors.accent;
  const iconBackground = isDestructive
    ? (isDarkMode ? '#321818' : '#FEF2F2')
    : colors.inputBg;

  return (
    <TouchableOpacity
      activeOpacity={hasSwitch || disabled ? 1 : 0.82}
      disabled={hasSwitch || disabled || !onPress}
      onPress={onPress}
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
        disabled && { opacity: 0.55 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon as any} size={18} color={iconTint} />
      </View>

      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: isDestructive ? colors.error : colors.textMain }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.textSec }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rowTrailing}>
        {rightText ? (
          <Text style={[styles.rowRightText, { color: colors.textSec }]}>
            {rightText}
          </Text>
        ) : null}

        {hasSwitch ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.white}
          />
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function SheetToggleRow({
  label,
  value,
  onToggle,
  isLast = false,
}: {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  isLast?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.sheetToggleRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.sheetToggleLabel, { color: colors.textMain }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={colors.white}
      />
    </View>
  );
}

function SelectionPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? colors.accent : colors.inputBg,
          borderColor: selected ? colors.accent : colors.border,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: selected ? colors.white : colors.textMain }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SettingsSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const colors = useThemeColors();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.sheetBackdrop}>
        <TouchableOpacity style={styles.sheetDismissArea} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheetContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderText}>
              <Text style={[styles.sheetTitle, { color: colors.textMain }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.sheetSubtitle, { color: colors.textSec }]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.sheetCloseButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.82}
            >
              <Ionicons name="close" size={18} color={colors.textSec} />
            </TouchableOpacity>
          </View>

          {children}
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();

  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const toggleNotifications = useSettingsStore((state) => state.toggleNotifications);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  const notifyDaysBefore = useSettingsStore((state) => state.notifyDaysBefore);
  const budgetAlertEnabled = useSettingsStore((state) => state.budgetAlertEnabled);
  const sharedAlertEnabled = useSettingsStore((state) => state.sharedAlertEnabled);
  const emailEnabled = useSettingsStore((state) => state.emailEnabled);
  const notifyHour = useSettingsStore((state) => state.notifyHour);
  const setNotifyDaysBefore = useSettingsStore((state) => state.setNotifyDaysBefore);
  const setBudgetAlertEnabled = useSettingsStore((state) => state.setBudgetAlertEnabled);
  const setSharedAlertEnabled = useSettingsStore((state) => state.setSharedAlertEnabled);
  const setEmailEnabled = useSettingsStore((state) => state.setEmailEnabled);
  const setNotifyHour = useSettingsStore((state) => state.setNotifyHour);
  const calendarSyncEnabled = useSettingsStore((state) => state.calendarSyncEnabled);
  const setCalendarSyncEnabled = useSettingsStore((state) => state.setCalendarSyncEnabled);
  const dashboardUpcomingDays = useSettingsStore((state) => state.dashboardUpcomingDays);
  const setDashboardUpcomingDays = useSettingsStore((state) => state.setDashboardUpcomingDays);
  const isAdmin = useSettingsStore((state) => state.isAdmin);
  const setIsAdmin = useSettingsStore((state) => state.setIsAdmin);
  const budgetAlertThreshold = useSettingsStore((state) => state.budgetAlertThreshold);
  const setBudgetAlertThreshold = useSettingsStore((state) => state.setBudgetAlertThreshold);
  const monthlyBudget = useSettingsStore((state) => state.monthlyBudget);
  const setMonthlyBudget = useSettingsStore((state) => state.setMonthlyBudget);
  const monthlyBudgetCurrency = useSettingsStore((state) => state.monthlyBudgetCurrency);
  const setMonthlyBudgetCurrency = useSettingsStore((state) => state.setMonthlyBudgetCurrency);

  const subscriptions = useUserSubscriptionStore((state) => state.subscriptions);
  const exchangeRates = useUserSubscriptionStore((state) => state.exchangeRates);
  const fetchAllUserSubscriptions = useUserSubscriptionStore((state) => state.fetchAllUserSubscriptions);
  const fetchExchangeRates = useUserSubscriptionStore((state) => state.fetchExchangeRates);

  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [notificationPrefsError, setNotificationPrefsError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await agent.Auth.getProfile();
      if (res?.data) {
        setUserProfile(res.data);
        setIsAdmin(!!res.data.isAdmin);
        setMonthlyBudget(res.data.monthlyBudget ?? 0);
        setMonthlyBudgetCurrency(normalizeCurrencyCode(res.data.monthlyBudgetCurrency));
        if (typeof res.data.budgetAlertThreshold === 'number') setBudgetAlertThreshold(res.data.budgetAlertThreshold);
        if (typeof res.data.budgetAlertEnabled === 'boolean') setBudgetAlertEnabled(res.data.budgetAlertEnabled);
        if (typeof res.data.sharedAlertEnabled === 'boolean') setSharedAlertEnabled(res.data.sharedAlertEnabled);
        setProfileError(null);
      }
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Profil bilgileri yuklenemedi.'));
    }
  }, [
    setBudgetAlertEnabled,
    setBudgetAlertThreshold,
    setIsAdmin,
    setMonthlyBudget,
    setMonthlyBudgetCurrency,
    setSharedAlertEnabled,
  ]);

  const loadNotifPrefs = useCallback(async () => {
    try {
      const res = await agent.Notifications.getPreferences();
      if (res?.data) {
        const prefs = res.data;
        if (typeof prefs.pushEnabled === 'boolean') toggleNotifications(prefs.pushEnabled);
        if (typeof prefs.emailEnabled === 'boolean') setEmailEnabled(prefs.emailEnabled);
        if (typeof prefs.reminderDaysBefore === 'number' && prefs.reminderDaysBefore >= 1 && prefs.reminderDaysBefore <= 14) {
          setNotifyDaysBefore(prefs.reminderDaysBefore);
        }
        if (typeof prefs.notifyHour === 'number') setNotifyHour(prefs.notifyHour);
        if (typeof prefs.budgetAlertEnabled === 'boolean') setBudgetAlertEnabled(prefs.budgetAlertEnabled);
        if (typeof prefs.sharedAlertEnabled === 'boolean') setSharedAlertEnabled(prefs.sharedAlertEnabled);
        setNotificationPrefsError(null);
      }
    } catch (error) {
      setNotificationPrefsError(getErrorMessage(error, 'Bildirim tercihleri yuklenemedi.'));
    }
  }, [
    setBudgetAlertEnabled,
    setEmailEnabled,
    setNotifyDaysBefore,
    setNotifyHour,
    setSharedAlertEnabled,
    toggleNotifications,
  ]);

  const refreshSettingsData = useCallback(async () => {
    await Promise.allSettled([
      loadProfile(),
      loadNotifPrefs(),
      fetchAllUserSubscriptions(),
      fetchExchangeRates(),
    ]);
  }, [fetchAllUserSubscriptions, fetchExchangeRates, loadNotifPrefs, loadProfile]);

  useFocusEffect(useCallback(() => {
    void refreshSettingsData();
  }, [refreshSettingsData]));

  const portfolioMetrics = useMemo(
    () => getSubscriptionPortfolioMetrics(subscriptions, exchangeRates),
    [exchangeRates, subscriptions],
  );

  const budgetCurrency = normalizeCurrencyCode(userProfile?.monthlyBudgetCurrency || monthlyBudgetCurrency);
  const budget = userProfile?.monthlyBudget ?? monthlyBudget;
  const activeCount = portfolioMetrics.startedCount;
  const totalExpenseTRY = portfolioMetrics.monthlyEquivalentTotalTRY;
  const totalExpense = useMemo(
    () => convertAmountBetweenCurrencies(totalExpenseTRY, 'TRY', budgetCurrency, exchangeRates),
    [budgetCurrency, exchangeRates, totalExpenseTRY],
  );

  const notificationsMasterEnabled = notificationsEnabled || emailEnabled;
  const notificationsSubtitle = !notificationsMasterEnabled
    ? 'Kapali'
    : notificationsEnabled && emailEnabled
      ? 'Push ve e-posta acik'
      : notificationsEnabled
        ? 'Yalnizca push acik'
        : 'Yalnizca e-posta acik';

  const reminderDayOptions = useMemo(
    () => buildPresetOptions(REMINDER_DAY_PRESETS, notifyDaysBefore),
    [notifyDaysBefore],
  );

  const notifyHourOptions = useMemo(
    () => buildPresetOptions(NOTIFY_HOUR_PRESETS, notifyHour),
    [notifyHour],
  );

  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const syncNotifPrefs = useCallback(async (opts: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    budgetAlertEnabled?: boolean;
    sharedAlertEnabled?: boolean;
    reminderDaysBefore?: number;
    notifyHour?: number;
  }) => {
    await agent.Notifications.updatePreferences({
      pushEnabled: opts.pushEnabled ?? notificationsEnabled,
      emailEnabled: opts.emailEnabled ?? emailEnabled,
      budgetAlertEnabled: opts.budgetAlertEnabled ?? budgetAlertEnabled,
      sharedAlertEnabled: opts.sharedAlertEnabled ?? sharedAlertEnabled,
      reminderDaysBefore: opts.reminderDaysBefore ?? notifyDaysBefore,
      notifyHour: opts.notifyHour ?? notifyHour,
    });
  }, [
    budgetAlertEnabled,
    emailEnabled,
    notificationsEnabled,
    notifyDaysBefore,
    notifyHour,
    sharedAlertEnabled,
  ]);

  const registerPushChannel = useCallback(async (): Promise<PushRegistrationResult> => {
    const granted = await registerForPushNotificationsAsync();
    if (!granted) {
      toggleNotifications(false);
      return {
        success: false,
        message: 'Push izni verilmedigi icin push kanali acilamadi.',
      };
    }

    const token = await getExpoPushToken();
    if (!token) {
      toggleNotifications(false);
      return {
        success: false,
        message: 'Push token alinamadi. Cihaz ayarlarinizi ve development build kullandiginizi kontrol edin.',
      };
    }

    try {
      await agent.Notifications.registerPushToken(token);
      toggleNotifications(true);
      return { success: true };
    } catch (error) {
      toggleNotifications(false);
      return {
        success: false,
        message: getErrorMessage(error, 'Push token sunucuya kaydedilemedi.'),
      };
    }
  }, [toggleNotifications]);

  const handleCalendarToggle = async (value: boolean) => {
    if (value) {
      const synced = await syncSubscriptionsToCalendar(subscriptions);
      setCalendarSyncEnabled(synced);
      if (!synced) {
        Alert.alert('Takvim acilamadi', 'Izin verilmedigi veya takvim olusturulamadigi icin senkron acilmadi.');
      }
      return;
    }

    const cleared = await clearSubGuardCalendarEvents();
    setCalendarSyncEnabled(false);
    Alert.alert(
      'Bilgi',
      cleared
        ? 'Takvim senkronizasyonu durduruldu ve SubGuard etkinlikleri temizlendi.'
        : 'Takvim senkronizasyonu durduruldu. Etkinlikler temizlenemedi; izinleri kontrol edin.',
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const pushResult = notificationsEnabled ? { success: true as const } : await registerPushChannel();
      const pushEnabled = pushResult.success;
      setEmailEnabled(true);
      setShowNotificationSheet(true);

      try {
        await syncNotifPrefs({ pushEnabled, emailEnabled: true });
        setNotificationPrefsError(pushEnabled ? null : pushResult.message);
      } catch (error) {
        setNotificationPrefsError(getErrorMessage(error, 'Bildirim tercihleri kaydedilemedi.'));
        await loadNotifPrefs();
      }

      Alert.alert(
        pushEnabled ? 'Bildirimler acildi' : 'Kismi acildi',
        pushEnabled
          ? 'Push ve e-posta bildirimleri aktif.'
          : `${pushResult.message} E-posta bildirimleri aktif.`,
      );
      return;
    }

    await cancelAllNotifications();
    toggleNotifications(false);
    setEmailEnabled(false);
    setShowNotificationSheet(false);

    try {
      await syncNotifPrefs({ pushEnabled: false, emailEnabled: false });
      setNotificationPrefsError(null);
    } catch (error) {
      setNotificationPrefsError(getErrorMessage(error, 'Bildirim tercihleri kaydedilemedi.'));
      await loadNotifPrefs();
    }
  };

  const handlePushNotificationsToggle = async (value: boolean) => {
    if (value) {
      const pushResult = notificationsEnabled ? { success: true as const } : await registerPushChannel();
      const pushEnabled = pushResult.success;

      try {
        await syncNotifPrefs({ pushEnabled });
        setNotificationPrefsError(pushEnabled ? null : pushResult.message);
      } catch (error) {
        setNotificationPrefsError(getErrorMessage(error, 'Push tercihi kaydedilemedi.'));
        await loadNotifPrefs();
      }

      if (!pushEnabled) {
        Alert.alert('Push acilamadi', pushResult.message);
      }
      return;
    }

    await cancelAllNotifications();
    toggleNotifications(false);

    try {
      await syncNotifPrefs({ pushEnabled: false });
      setNotificationPrefsError(null);
    } catch (error) {
      setNotificationPrefsError(getErrorMessage(error, 'Push tercihi kaydedilemedi.'));
      await loadNotifPrefs();
    }
  };

  const handleEmailNotificationsToggle = async (value: boolean) => {
    setEmailEnabled(value);

    try {
      await syncNotifPrefs({ emailEnabled: value });
      setNotificationPrefsError(null);
    } catch (error) {
      setNotificationPrefsError(getErrorMessage(error, 'E-posta tercihi kaydedilemedi.'));
      await loadNotifPrefs();
    }
  };

  const handleNotifyDaysChange = async (days: number) => {
    setNotifyDaysBefore(days);

    try {
      await syncNotifPrefs({ reminderDaysBefore: days });
      setNotificationPrefsError(null);
    } catch (error) {
      setNotificationPrefsError(getErrorMessage(error, 'Hatirlatma gunu kaydedilemedi.'));
      await loadNotifPrefs();
    }
  };

  const handleNotifyHourChange = async (hour: number) => {
    setNotifyHour(hour);

    try {
      await syncNotifPrefs({ notifyHour: hour });
      setNotificationPrefsError(null);
    } catch (error) {
      setNotificationPrefsError(getErrorMessage(error, 'Bildirim saati kaydedilemedi.'));
      await loadNotifPrefs();
    }
  };

  const handleBudgetCurrencyChange = async (currency: string) => {
    if (currency === budgetCurrency) return;

    try {
      const response = await agent.Budget.updateSettings({
        monthlyBudgetCurrency: currency,
      });
      const updatedBudget = response?.data?.monthlyBudget ?? budget;
      const updatedCurrency = normalizeCurrencyCode(response?.data?.monthlyBudgetCurrency ?? currency);
      setMonthlyBudget(updatedBudget);
      setMonthlyBudgetCurrency(updatedCurrency);
      setUserProfile((current) => (current ? {
        ...current,
        monthlyBudgetCurrency: updatedCurrency,
        monthlyBudget: updatedBudget,
      } : current));
      setProfileError(null);
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Butce para birimi guncellenemedi.'));
      await loadProfile();
    }
  };

  const handleBudgetThresholdChange = async (threshold: number) => {
    const previous = budgetAlertThreshold;
    setBudgetAlertThreshold(threshold);

    try {
      await agent.Auth.updateProfile({ budgetAlertThreshold: threshold });
      setUserProfile((current) => (current ? { ...current, budgetAlertThreshold: threshold } : current));
      setProfileError(null);
    } catch (error) {
      setBudgetAlertThreshold(previous);
      setProfileError(getErrorMessage(error, 'Butce uyarisi guncellenemedi.'));
      await loadProfile();
    }
  };

  const handleBudgetAlertToggle = async (value: boolean) => {
    const previous = budgetAlertEnabled;
    setBudgetAlertEnabled(value);

    try {
      await syncNotifPrefs({ budgetAlertEnabled: value });
      setNotificationPrefsError(null);
    } catch (error) {
      setBudgetAlertEnabled(previous);
      setNotificationPrefsError(getErrorMessage(error, 'Butce bildirimi guncellenemedi.'));
      await loadNotifPrefs();
    }
  };

  const handleSharedAlertToggle = async (value: boolean) => {
    const previous = sharedAlertEnabled;
    setSharedAlertEnabled(value);

    try {
      await syncNotifPrefs({ sharedAlertEnabled: value });
      setNotificationPrefsError(null);
    } catch (error) {
      setSharedAlertEnabled(previous);
      setNotificationPrefsError(getErrorMessage(error, 'Paylasim bildirimi guncellenemedi.'));
      await loadNotifPrefs();
    }
  };

  const handleExportData = async () => {
    try {
      const lines = [
        'SubGuard - Verilerim',
        `Disa aktarma tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
        '',
        `Kullanici: ${userProfile?.fullName || '-'}`,
        `E-posta: ${userProfile?.email || '-'}`,
        `Butce para birimi: ${budgetCurrency}`,
        `Aylik aktif yuk: ${formatCurrencyAmount(totalExpense, budgetCurrency, { minimumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2, maximumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2 })}/ay`,
        `Aylik butce hedefi: ${budget > 0 ? formatCurrencyAmount(budget, budgetCurrency, { minimumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2, maximumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2 }) : 'Tanimlanmamis'}`,
        '',
        `--- Abonelikler (${subscriptions.length} adet) ---`,
        ...subscriptions.map((subscription: UserSubscription) => {
          const normalizedMonthly = getSubscriptionMonthlyShareInCurrency(subscription, exchangeRates, budgetCurrency, { unknownRateAsZero: true });
          const cycleLabel = subscription.billingPeriod === 'Yearly' ? 'yil' : 'ay';
          const statusLabel = subscription.isActive !== false
            ? 'Aktif'
            : subscription.cancelledDate
              ? 'Iptal'
              : 'Dondurulmus';

          return [
            `- ${subscription.name}`,
            `${formatCurrencyAmount(subscription.price, subscription.currency, { minimumFractionDigits: subscription.currency === 'TRY' ? 0 : 2, maximumFractionDigits: subscription.currency === 'TRY' ? 0 : 2 })}/${cycleLabel}`,
            `~ ${formatCurrencyAmount(normalizedMonthly, budgetCurrency, { minimumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2, maximumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2 })}/ay`,
            subscription.category,
            statusLabel,
          ].join(' | ');
        }),
      ];

      await Share.share({ message: lines.join('\n'), title: 'SubGuard Verilerim' });
    } catch {
      Alert.alert('Hata', 'Veriler paylasilamadi.');
    }
  };

  const openExternalUrl = async (url: string, fallbackMessage: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Acilamadi', fallbackMessage);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Acilamadi', fallbackMessage);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabi Sil',
      'Bu islem geri alinamaz. Tum abonelik verileriniz ve hesap bilgileriniz kalici olarak silinecek.',
      [
        { text: 'Vazgec', style: 'cancel' },
        {
          text: 'Hesabimi Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Emin misiniz?',
              'Hesabinizi kalici olarak silmek istediginizi onaylayin.',
              [
                { text: 'Geri Don', style: 'cancel' },
                {
                  text: 'Evet, Sil',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await agent.Auth.deleteAccount();
                      try {
                        const refreshToken = await getRefreshToken();
                        if (refreshToken) await agent.Auth.revokeRefreshToken(refreshToken);
                      } catch {}
                      await cancelAllNotifications();
                      if (calendarSyncEnabled) {
                        await clearSubGuardCalendarEvents();
                      }
                      useSettingsStore.getState().clearUserSettings();
                      useUserSubscriptionStore.getState().reset();
                      useNotificationStore.getState().reset();
                      await logout();
                      navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
                    } catch {}
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Cikis Yap', 'Hesabinizdan cikis yapmak istiyor musunuz?', [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Cikis Yap',
        style: 'destructive',
        onPress: async () => {
          try {
            const refreshToken = await getRefreshToken();
            if (refreshToken) await agent.Auth.revokeRefreshToken(refreshToken);
          } catch {}
          await cancelAllNotifications();
          if (calendarSyncEnabled) {
            await clearSubGuardCalendarEvents();
          }
          useSettingsStore.getState().clearUserSettings();
          useUserSubscriptionStore.getState().reset();
          useNotificationStore.getState().reset();
          await logout();
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const openPicker = (picker: PickerType) => setActivePicker(picker);
  const closePicker = () => setActivePicker(null);

  const pickerTitle = activePicker === 'currency'
    ? 'Ozet para birimi'
    : activePicker === 'upcomingDays'
      ? 'Yaklasan odemeler'
      : activePicker === 'threshold'
        ? 'Butce uyari esigi'
        : '';

  const pickerSubtitle = activePicker === 'currency'
    ? 'Aylik hedef ve ozet sayilar bu para biriminde gosterilir.'
    : activePicker === 'upcomingDays'
      ? 'Ana sayfadaki yaklasan odemeler penceresini sec.'
      : activePicker === 'threshold'
        ? 'Butcenin hangi seviyesinde uyari verilecegini sec.'
        : '';

  const pickerOptions = activePicker === 'currency'
    ? SUPPORTED_CURRENCIES
    : activePicker === 'upcomingDays'
      ? UPCOMING_DAY_OPTIONS
      : activePicker === 'threshold'
        ? BUDGET_THRESHOLD_OPTIONS
        : [];

  const pickerValue = activePicker === 'currency'
    ? budgetCurrency
    : activePicker === 'upcomingDays'
      ? dashboardUpcomingDays
      : activePicker === 'threshold'
        ? budgetAlertThreshold
        : null;

  const notificationRowSubtitle = `${notifyDaysBefore} gun once · ${formatHourLabel(notifyHour)}`;
  const summaryBudgetText = budget > 0
    ? formatCurrencyAmount(budget, budgetCurrency, { minimumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2, maximumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2 })
    : 'Tanimlanmamis';

  const pickerOptionLabel = (option: string | number) => {
    if (activePicker === 'currency') return option as string;
    if (activePicker === 'upcomingDays') return `${option} gun`;
    if (activePicker === 'threshold') return `%${option}`;
    return String(option);
  };

  const pickerOptionDescription = (option: string | number) => {
    if (activePicker === 'currency') {
      return option === budgetCurrency ? 'Su an kullanilan para birimi' : 'Ozet ve butce gosterimlerinde kullan';
    }
    if (activePicker === 'upcomingDays') return `${option} gunluk odeme penceresi`;
    if (activePicker === 'threshold') return `Butcenin %${option}'ine ulasinca uyar`;
    return '';
  };

  const handlePickerSelect = (value: string | number) => {
    if (activePicker === 'currency') {
      closePicker();
      void handleBudgetCurrencyChange(String(value));
      return;
    }

    if (activePicker === 'upcomingDays') {
      setDashboardUpcomingDays(value as 7 | 14 | 30);
      closePicker();
      return;
    }

    if (activePicker === 'threshold') {
      closePicker();
      void handleBudgetThresholdChange(Number(value));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>Ayarlar</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSec }]}>
            Hesap, bildirim ve uygulama tercihlerini yonet.
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.summaryTop}>
            <View style={[styles.avatar, { backgroundColor: colors.inputBg }]}>
              {userProfile ? (
                <Text style={[styles.avatarText, { color: colors.accent }]}>{initials}</Text>
              ) : (
                <ActivityIndicator size="small" color={colors.accent} />
              )}
            </View>

            <View style={styles.summaryIdentity}>
              <Text style={[styles.summaryName, { color: colors.textMain }]}>
                {userProfile?.fullName || 'Profil yukleniyor'}
              </Text>
              <Text style={[styles.summaryEmail, { color: colors.textSec }]}>
                {userProfile?.email || 'Hesap bilgileri aliniyor...'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              disabled={!userProfile}
              onPress={() => setShowEditProfile(true)}
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  opacity: userProfile ? 1 : 0.6,
                },
              ]}
            >
              <Ionicons name="pencil-outline" size={14} color={colors.accent} />
              <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>Duzenle</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatColumn}>
              <Text style={[styles.summaryStatLabel, { color: colors.textSec }]}>Aktif abonelik</Text>
              <Text style={[styles.summaryStatValue, { color: colors.textMain }]}>{activeCount}</Text>
            </View>

            <View style={[styles.summaryStatDivider, { backgroundColor: colors.border }]} />

            <View style={styles.summaryStatColumn}>
              <Text style={[styles.summaryStatLabel, { color: colors.textSec }]}>Aylik aktif yuk</Text>
              <Text style={[styles.summaryStatValue, { color: colors.textMain }]}>
                {formatCurrencyAmount(totalExpense, budgetCurrency, { minimumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2, maximumFractionDigits: budgetCurrency === 'TRY' ? 0 : 2 })}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryFooterRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.summaryFooterLabel, { color: colors.textSec }]}>Aylik hedef</Text>
            <Text style={[styles.summaryFooterValue, { color: colors.textMain }]}>{summaryBudgetText}</Text>
          </View>
        </View>

        {profileError ? (
          <View style={[styles.errorCard, { backgroundColor: colors.cardBg, borderColor: colors.error }]}>
            <View style={[styles.errorIcon, { backgroundColor: isDarkMode ? '#321818' : '#FEF2F2' }]}>
              <Ionicons name="warning-outline" size={18} color={colors.error} />
            </View>
            <View style={styles.errorBody}>
              <Text style={[styles.errorTitle, { color: colors.textMain }]}>Profil senkron degil</Text>
              <Text style={[styles.errorText, { color: colors.textSec }]}>{profileError}</Text>
            </View>
            <TouchableOpacity onPress={() => void refreshSettingsData()} activeOpacity={0.82}>
              <Text style={[styles.errorAction, { color: colors.accent }]}>Yenile</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {notificationPrefsError ? (
          <View style={[styles.errorCard, { backgroundColor: colors.cardBg, borderColor: colors.warning }]}>
            <View style={[styles.errorIcon, { backgroundColor: isDarkMode ? '#332A15' : '#FEF3C7' }]}>
              <Ionicons name="notifications-off-outline" size={18} color={colors.warning} />
            </View>
            <View style={styles.errorBody}>
              <Text style={[styles.errorTitle, { color: colors.textMain }]}>Bildirim tercihleri senkron degil</Text>
              <Text style={[styles.errorText, { color: colors.textSec }]}>{notificationPrefsError}</Text>
            </View>
            <TouchableOpacity onPress={() => void loadNotifPrefs()} activeOpacity={0.82}>
              <Text style={[styles.errorAction, { color: colors.accent }]}>Yenile</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Hesap</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <SettingsRow
              icon="person-outline"
              title="Profil ve butce duzenle"
              subtitle="Isim ve aylik hedef bilgilerini guncelle"
              onPress={() => setShowEditProfile(true)}
            />
            <SettingsRow
              icon="lock-closed-outline"
              title="Sifre degistir"
              subtitle="Hesabinin giris sifresini yenile"
              onPress={() => setShowChangePassword(true)}
              isLast={!isAdmin}
            />
            {isAdmin ? (
              <SettingsRow
                icon="shield-checkmark-outline"
                title="Admin paneli"
                subtitle="Kullanicilar ve kataloglar icin operasyon alani"
                onPress={() => navigation.navigate('AdminPanel')}
                isLast
              />
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Bildirimler</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <SettingsRow
              icon="notifications-outline"
              title="Bildirimler"
              subtitle={notificationsSubtitle}
              hasSwitch
              value={notificationsMasterEnabled}
              onToggle={(value) => void handleNotificationToggle(value)}
            />
            <SettingsRow
              icon="options-outline"
              title="Bildirim tercihleri"
              subtitle="Kanal ve hatirlatma zamanini duzenle"
              rightText={notificationRowSubtitle}
              onPress={() => setShowNotificationSheet(true)}
            />
            <SettingsRow
              icon="calendar-outline"
              title="Takvim entegrasyonu"
              subtitle={calendarSyncEnabled ? 'SubGuard odemeleri cihaz takvimine yaziliyor' : 'Abonelikleri cihaz takvimiyle esitle'}
              hasSwitch
              value={calendarSyncEnabled}
              onToggle={(value) => void handleCalendarToggle(value)}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Uygulama</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <SettingsRow
              icon="cash-outline"
              title="Butce para birimi"
              subtitle="Aylik hedef ve butce ozetlerinde kullanilir"
              rightText={budgetCurrency}
              onPress={() => openPicker('currency')}
            />
            <SettingsRow
              icon="time-outline"
              title="Yaklasan odemeler"
              subtitle="Ana sayfadaki pencereyi belirle"
              rightText={`${dashboardUpcomingDays} gun`}
              onPress={() => openPicker('upcomingDays')}
            />
            <SettingsRow
              icon="warning-outline"
              title="Butce uyari esigi"
              subtitle="Butcenin hangi seviyesinde uyari verilecegini sec"
              rightText={`%${budgetAlertThreshold}`}
              onPress={() => openPicker('threshold')}
            />
            <SettingsRow
              icon="moon-outline"
              title="Koyu mod"
              subtitle="Tum uygulama temasini koyu gorunume gecir"
              hasSwitch
              value={isDarkMode}
              onToggle={toggleDarkMode}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Veri ve Destek</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <SettingsRow
              icon="download-outline"
              title="Verilerimi disa aktar"
              subtitle="Abonelik ozetini paylasilabilir metin olarak olustur"
              onPress={() => void handleExportData()}
            />
            <SettingsRow
              icon="document-text-outline"
              title="Gizlilik politikasi"
              subtitle="SubGuard veri kullanimi ve saklama detaylari"
              onPress={() => void openExternalUrl('https://subguard.app/privacy', 'Gizlilik politikasi sayfasi acilamadi.')}
            />
            <SettingsRow
              icon="mail-outline"
              title="Destek"
              subtitle="Sorunlari ve geri bildirimleri e-posta ile ilet"
              onPress={() => void openExternalUrl('mailto:destek@subguard.app', 'Destek e-postasi acilamadi.')}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Oturum</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <SettingsRow
              icon="log-out-outline"
              title="Cikis yap"
              subtitle="Bu cihazdaki oturumu kapat"
              onPress={handleLogout}
              isDestructive
            />
            <SettingsRow
              icon="trash-outline"
              title="Hesabi sil"
              subtitle="Hesabini ve tum verilerini kalici olarak kaldir"
              onPress={handleDeleteAccount}
              isDestructive
              isLast
            />
          </View>
        </View>

        <View style={[styles.versionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.versionLabel, { color: colors.textSec }]}>Uygulama surumu</Text>
            <Text style={[styles.versionValue, { color: colors.textMain }]}>{APP_VERSION}</Text>
          </View>
          <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
        </View>
      </ScrollView>

      <SettingsSheet
        visible={showNotificationSheet}
        title="Bildirim tercihleri"
        subtitle="Kanal ve hatirlatma zamanini yonet."
        onClose={() => setShowNotificationSheet(false)}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
          {!notificationsMasterEnabled ? (
            <View style={[styles.sheetNotice, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
              <Text style={[styles.sheetNoticeText, { color: colors.textSec }]}>
                Genel bildirimler kapali. Buradaki tercihler kaydedilir ama gonderim yapilmaz.
              </Text>
            </View>
          ) : null}

          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionTitle, { color: colors.textMain }]}>Kanallar</Text>
            <View style={[styles.sheetGroup, { borderColor: colors.border }]}>
              <SheetToggleRow
                label="Push kanali"
                value={notificationsEnabled}
                onToggle={(value) => void handlePushNotificationsToggle(value)}
              />
              <SheetToggleRow
                label="E-posta kanali"
                value={emailEnabled}
                onToggle={(value) => void handleEmailNotificationsToggle(value)}
              />
              <SheetToggleRow
                label="Butce uyarilari"
                value={budgetAlertEnabled}
                onToggle={(value) => void handleBudgetAlertToggle(value)}
              />
              <SheetToggleRow
                label="Paylasim uyarilari"
                value={sharedAlertEnabled}
                onToggle={(value) => void handleSharedAlertToggle(value)}
                isLast
              />
            </View>
          </View>

          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionTitle, { color: colors.textMain }]}>Hatirlatma gunu</Text>
            <View style={styles.pillWrap}>
              {reminderDayOptions.map((option) => (
                <SelectionPill
                  key={option}
                  label={`${option} gun`}
                  selected={option === notifyDaysBefore}
                  onPress={() => void handleNotifyDaysChange(option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionTitle, { color: colors.textMain }]}>Bildirim saati</Text>
            <View style={styles.pillWrap}>
              {notifyHourOptions.map((option) => (
                <SelectionPill
                  key={option}
                  label={formatHourLabel(option)}
                  selected={option === notifyHour}
                  onPress={() => void handleNotifyHourChange(option)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SettingsSheet>

      <SettingsSheet
        visible={activePicker !== null}
        title={pickerTitle}
        subtitle={pickerSubtitle}
        onClose={closePicker}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
          <View style={styles.optionList}>
            {pickerOptions.map((option) => {
              const selected = option === pickerValue;

              return (
                <TouchableOpacity
                  key={String(option)}
                  activeOpacity={0.82}
                  onPress={() => handlePickerSelect(option)}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: selected ? colors.inputBg : colors.cardBg,
                      borderColor: selected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <View style={styles.optionRowBody}>
                    <Text style={[styles.optionRowTitle, { color: colors.textMain }]}>
                      {pickerOptionLabel(option)}
                    </Text>
                    <Text style={[styles.optionRowSubtitle, { color: colors.textSec }]}>
                      {pickerOptionDescription(option)}
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={selected ? colors.accent : colors.inactive}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SettingsSheet>

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentUser={userProfile ? {
          fullName: userProfile.fullName,
          monthlyBudget: userProfile.monthlyBudget,
          monthlyBudgetCurrency: userProfile.monthlyBudgetCurrency,
        } : null}
        onUpdateSuccess={() => void refreshSettingsData()}
      />

      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 20,
  },
  header: {
    paddingHorizontal: 2,
    gap: 6,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 20,
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryIdentity: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryEmail: {
    fontSize: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryStatColumn: {
    flex: 1,
    gap: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryStatDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  summaryFooterRow: {
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryFooterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryFooterValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  errorCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBody: {
    flex: 1,
    gap: 2,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
  },
  errorAction: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    marginLeft: 2,
    fontSize: 17,
    fontWeight: '800',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 142,
  },
  rowRightText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
  },
  versionCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  versionValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.36)',
    justifyContent: 'flex-end',
  },
  sheetDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '84%',
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetHeaderText: {
    flex: 1,
    gap: 4,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    paddingTop: 18,
    paddingBottom: 4,
    gap: 18,
  },
  sheetNotice: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  sheetNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  sheetSection: {
    gap: 10,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  sheetGroup: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sheetToggleRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetToggleLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    minWidth: 74,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionRowBody: {
    flex: 1,
    gap: 4,
  },
  optionRowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionRowSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
});
