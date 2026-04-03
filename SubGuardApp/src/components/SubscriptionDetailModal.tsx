import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  Animated,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { ApiUsageLog, PriceHistoryEntry, UserSubscription } from '../types';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useThemeColors } from '../constants/theme';
import { useCatalogStore } from '../store/useCatalogStore';
import agent from '../api/agent';
import { CurrencyService } from '../utils/CurrencyService';
import { getNextBillingDateForSub, hasSubscriptionStarted } from '../utils/dateUtils';
import {
  getBillingPeriodCycleUnitLabel,
  getBillingPeriodDisplayLabel,
  getSubscriptionCycleShare,
  getSubscriptionMonthlyShare,
} from '../utils/subscriptionMath';

function DetailLogo({
  logoUrl,
  brandColor,
  name,
  size = 80,
}: {
  logoUrl?: string;
  brandColor: string;
  name: string;
  size?: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (logoUrl && !imgFailed) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: '72%', height: '72%' }}
        resizeMode="contain"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <Text style={{ fontSize: size * 0.4, fontWeight: '800', color: '#FFFFFF' }}>
      {name.charAt(0).toUpperCase()}
    </Text>
  );
}

interface Props {
  visible: boolean;
  subscription: UserSubscription | null;
  onClose: () => void;
  onEdit: (sub: UserSubscription) => void;
}

type SubscriptionActionStatus = 'active' | 'paused' | 'cancelled';
type SubscriptionLifecycle = 'pending' | 'active' | 'paused' | 'cancelled';

const parseCalendarDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const formatLongDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

const formatRelativeDays = (days: number) => {
  if (days === 0) return 'Bugun';
  if (days > 0) return `${days} gun kaldi`;
  return `${Math.abs(days)} gun gecti`;
};

export default function SubscriptionDetailModal({
  visible,
  subscription: initialSubscription,
  onClose,
  onEdit,
}: Props) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const {
    removeSubscription,
    updateSubscription,
    fetchAllUserSubscriptions,
    fetchUsageLogs,
  } = useUserSubscriptionStore();
  const { catalogItems } = useCatalogStore();

  const liveSubscription = useUserSubscriptionStore((state) =>
    state.subscriptions.find((item) => item.id === initialSubscription?.id),
  );
  const subscription = liveSubscription || initialSubscription;
  const usageLogs: ApiUsageLog[] = subscription?.usageLogs ?? [];

  const heroOpacity = useRef(new Animated.Value(1)).current;

  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(false);
  const [priceHistoryError, setPriceHistoryError] = useState<string | null>(null);
  const [usageLogsLoading, setUsageLogsLoading] = useState(false);
  const [usageLogsError, setUsageLogsError] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const hasStarted = useMemo(() => {
    if (!subscription) return true;
    return hasSubscriptionStarted(
      subscription.firstPaymentDate,
      subscription.contractStartDate,
      new Date(),
      subscription.createdDate,
    );
  }, [subscription?.firstPaymentDate, subscription?.contractStartDate, subscription?.createdDate]);

  const currentActionStatus: SubscriptionActionStatus = useMemo(() => {
    if (!subscription) return 'active';
    if (subscription.status === 'Cancelled' || subscription.cancelledDate || subscription.cancelledAt) {
      return 'cancelled';
    }
    if (subscription.status === 'Paused' || subscription.isActive === false) {
      return 'paused';
    }
    return 'active';
  }, [subscription?.status, subscription?.isActive, subscription?.cancelledDate, subscription?.cancelledAt]);

  const currentLifecycle: SubscriptionLifecycle = useMemo(() => {
    if (currentActionStatus === 'cancelled') return 'cancelled';
    if (currentActionStatus === 'paused') return 'paused';
    return hasStarted ? 'active' : 'pending';
  }, [currentActionStatus, hasStarted]);

  useEffect(() => {
    const targetOpacity =
      currentLifecycle === 'active'
        ? 1
        : currentLifecycle === 'pending'
          ? 0.88
          : 0.55;

    Animated.timing(heroOpacity, {
      toValue: targetOpacity,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentLifecycle, heroOpacity]);

  useEffect(() => {
    if (!visible || !subscription?.id) {
      setPriceHistory([]);
      setPriceHistoryLoading(false);
      setPriceHistoryError(null);
      setUsageLogsLoading(false);
      setUsageLogsError(null);
      return;
    }

    let isMounted = true;
    setPriceHistoryLoading(true);
    setPriceHistoryError(null);
    setUsageLogsLoading(true);
    setUsageLogsError(null);

    const loadPriceHistory = async () => {
      try {
        const response: any = await agent.UserSubscriptions.priceHistory(subscription.id);
        if (!isMounted) return;
        setPriceHistory(Array.isArray(response?.data) ? response.data : []);
      } catch {
        if (!isMounted) return;
        setPriceHistory([]);
        setPriceHistoryError('Fiyat gecmisi su an yuklenemedi.');
      } finally {
        if (isMounted) setPriceHistoryLoading(false);
      }
    };

    const loadUsageHistory = async () => {
      const success = await fetchUsageLogs(subscription.id);
      if (!isMounted) return;
      setUsageLogsLoading(false);
      setUsageLogsError(success ? null : 'Kullanim gecmisi su an yuklenemedi.');
    };

    void loadPriceHistory();
    void loadUsageHistory();

    return () => {
      isMounted = false;
    };
  }, [visible, subscription?.id, fetchUsageLogs]);

  if (!subscription) return null;

  const firstPaymentDate =
    parseCalendarDate(subscription.firstPaymentDate) ??
    parseCalendarDate(subscription.contractStartDate) ??
    parseCalendarDate(subscription.createdDate);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const nextDate = getNextBillingDateForSub(
    subscription.billingDay,
    subscription.billingPeriod,
    subscription.billingMonth,
    subscription.createdDate,
    subscription.firstPaymentDate,
    subscription.contractStartDate,
    todayMidnight,
  );
  const daysLeft = Math.round((nextDate.getTime() - todayMidnight.getTime()) / 86400000);

  const accessUntilDate = parseCalendarDate(subscription.accessUntilDate);
  const cancelledAt = parseCalendarDate(subscription.cancelledDate ?? subscription.cancelledAt);
  const pausedAt = parseCalendarDate(subscription.pausedDate);

  const partnersCount = (subscription.sharedWith?.length ?? 0) + (subscription.sharedGuests?.length ?? 0);
  const participantCount = partnersCount + 1;
  const myCycleShare = getSubscriptionCycleShare(subscription);
  const myMonthlyShare = getSubscriptionMonthlyShare(subscription);
  const cycleUnit = getBillingPeriodCycleUnitLabel(subscription.billingPeriod);
  const billingPeriodLabel = getBillingPeriodDisplayLabel(subscription.billingPeriod);
  const yearlyMonthIndex =
    subscription.billingMonth != null
      ? subscription.billingMonth - 1
      : (firstPaymentDate?.getMonth() ?? 0);
  const yearlyMonthLabel =
    subscription.billingPeriod === 'Yearly'
      ? new Date(2026, yearlyMonthIndex, 1).toLocaleDateString('tr-TR', { month: 'long' })
      : null;
  const billingScheduleLabel =
    subscription.billingPeriod === 'Yearly'
      ? `Her yil ${subscription.billingDay} ${yearlyMonthLabel}`
      : `Her ayin ${subscription.billingDay}. gunu`;

  const cancelInfo =
    currentLifecycle !== 'cancelled'
      ? null
      : (() => {
          let remainingDays: number | null = null;
          if (accessUntilDate) {
            remainingDays = Math.ceil((accessUntilDate.getTime() - todayMidnight.getTime()) / 86400000);
            if (remainingDays < 0) remainingDays = 0;
          }

          return {
            cancelledAt,
            accessUntilDate,
            remainingDays,
          };
        })();

  const lifecycleBadge = (() => {
    switch (currentLifecycle) {
      case 'pending':
        return {
          icon: 'time-outline' as const,
          label: 'ILK ODEME BEKLENIYOR',
          color: colors.primary,
          background: colors.primary + '15',
        };
      case 'paused':
        return {
          icon: 'pause-circle' as const,
          label: 'DURDURULDU',
          color: colors.warning,
          background: colors.warning + '15',
        };
      case 'cancelled':
        return {
          icon: 'close-circle' as const,
          label: 'IPTAL EDILDI',
          color: colors.error,
          background: colors.error + '15',
        };
      default:
        return null;
    }
  })();

  const nextPaymentCardTitle =
    currentLifecycle === 'pending'
      ? 'ILK ODEME'
      : currentLifecycle === 'cancelled'
        ? 'ERISIM BITISI'
        : 'SONRAKI ODEME';

  const brandColor = subscription.colorCode || colors.primary;
  const catalogLogoUrl = catalogItems.find((item) => item.id === subscription.catalogId)?.logoUrl;

  const handleDuplicate = () => {
    Alert.alert(
      'Aboneligi Kopyala',
      'Bu islem ayni fiyat, odeme duzeni, ilk odeme tarihi ve notlarla yeni bir kayit olusturur. Paylasimlar ve gecmis kayitlar kopyalanmaz.',
      [
        { text: 'Vazgec', style: 'cancel' },
        {
          text: 'Kopyala',
          onPress: async () => {
            setIsDuplicating(true);
            try {
              await agent.UserSubscriptions.duplicate(subscription.id);
              await fetchAllUserSubscriptions();
              Toast.show({
                type: 'success',
                text1: 'Kopyalandi',
                text2: `${subscription.name} icin yeni kayit olusturuldu.`,
                position: 'top',
              });
              onClose();
            } finally {
              setIsDuplicating(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Aboneligi Sil',
      `${subscription.name} aboneligini silmek istedigine emin misin?`,
      [
        { text: 'Vazgec', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeSubscription(subscription.id);
              onClose();
            } catch {
              Alert.alert('Hata', 'Abonelik silinemedi. Lutfen tekrar deneyin.');
            }
          },
        },
      ],
    );
  };

  const applyStatusChange = async (newStatus: SubscriptionActionStatus) => {
    let payload: Partial<UserSubscription>;

    if (newStatus === 'active') {
      payload = {
        isActive: true,
        status: 'Active',
        pausedDate: null,
        cancelledDate: null,
        accessUntilDate: null,
      };
    } else if (newStatus === 'paused') {
      payload = {
        isActive: false,
        status: 'Paused',
        pausedDate: new Date().toISOString(),
        cancelledDate: null,
        accessUntilDate: null,
      };
    } else {
      payload = {
        isActive: false,
        status: 'Cancelled',
        pausedDate: null,
        cancelledDate: new Date().toISOString(),
        accessUntilDate: null,
      };
    }

    await updateSubscription(subscription.id, payload);

    const toastMap = {
      active: {
        type: 'success' as const,
        text1: 'Abonelik yeniden aktif',
        text2: `${subscription.name} tekrar aktif duruma alindi.`,
      },
      paused: {
        type: 'info' as const,
        text1: 'Abonelik durduruldu',
        text2: `${subscription.name} odeme akisindan cikarildi.`,
      },
      cancelled: {
        type: 'error' as const,
        text1: 'Abonelik iptal edildi',
        text2: `${subscription.name} icin erisim bitis tarihi guncellendi.`,
      },
    };

    Toast.show({
      ...toastMap[newStatus],
      position: 'top',
    });
  };

  const handleStatusChange = (newStatus: SubscriptionActionStatus) => {
    if (newStatus === currentActionStatus) return;

    if (newStatus === 'cancelled') {
      Alert.alert(
        'Aboneligi Iptal Et',
        `${subscription.name} aboneligini iptal etmek istedigine emin misin? Erisim bitis tarihi mevcut fatura dongusune gore korunur.`,
        [
          { text: 'Vazgec', style: 'cancel' },
          {
            text: 'Iptal Et',
            style: 'destructive',
            onPress: () => void applyStatusChange('cancelled'),
          },
        ],
      );
      return;
    }

    if (newStatus === 'paused') {
      Alert.alert(
        'Aboneligi Durdur',
        `${subscription.name} aboneligini durdurmak istiyor musun?`,
        [
          { text: 'Vazgec', style: 'cancel' },
          { text: 'Durdur', onPress: () => void applyStatusChange('paused') },
        ],
      );
      return;
    }

    void applyStatusChange('active');
  };

  const renderContractInfo = () => {
    if (!subscription.hasContract) return null;

    const start = parseCalendarDate(subscription.contractStartDate);
    const end = parseCalendarDate(subscription.contractEndDate);

    return (
      <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 0 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Taahhut Bilgisi</Text>
          <Ionicons name="document-text-outline" size={18} color={colors.textSec} />
        </View>
        <View style={styles.contractRow}>
          <View style={styles.contractItem}>
            <Text style={[styles.contractLabel, { color: colors.textSec }]}>BASLANGIC</Text>
            <Text style={[styles.contractValue, { color: colors.textMain }]}>
              {formatLongDate(start)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.contractItem}>
            <Text style={[styles.contractLabel, { color: colors.textSec }]}>BITIS</Text>
            <Text style={[styles.contractValue, { color: colors.textMain }]}>
              {formatLongDate(end)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={[styles.iconBtn, { backgroundColor: colors.inputBg }]}>
            <Ionicons name="chevron-down" size={24} color={colors.textMain} />
          </TouchableOpacity>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              onPress={handleDuplicate}
              disabled={isDuplicating}
              style={[styles.iconBtn, { backgroundColor: colors.inputBg, marginRight: 10 }]}
            >
              <Ionicons name="copy-outline" size={20} color={isDuplicating ? colors.textSec : colors.textMain} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onClose();
                onEdit(subscription);
              }}
              style={[styles.iconBtn, { backgroundColor: colors.inputBg, marginRight: 10 }]}
            >
              <Ionicons name="pencil" size={20} color={colors.textMain} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={[styles.iconBtn, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.heroSection, { opacity: heroOpacity }]}>
            <View
              style={[
                styles.logoContainer,
                {
                  backgroundColor:
                    currentLifecycle === 'active' || currentLifecycle === 'pending'
                      ? (catalogLogoUrl ? colors.white : brandColor)
                      : colors.inactive,
                  shadowColor: brandColor,
                  overflow: 'hidden',
                },
              ]}
            >
              <DetailLogo logoUrl={catalogLogoUrl} brandColor={brandColor} name={subscription.name} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.textMain }]}>{subscription.name}</Text>
            <Text style={[styles.heroMetaText, { color: colors.textSec }]}>
              {`Toplam Plan - ${billingPeriodLabel}`}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.heroCurrency, { color: colors.textSec }]}>{subscription.currency}</Text>
              <Text style={[styles.heroPrice, { color: colors.textMain }]}>{subscription.price.toFixed(2)}</Text>
              <Text style={[styles.heroPeriod, { color: colors.textSec }]}>/{cycleUnit}</Text>
            </View>

            {partnersCount > 0 && (
              <View style={[styles.sharedSummaryCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.sharedSummaryLabel, { color: colors.textSec }]}>
                  {`Senin payin - ${participantCount} kisi`}
                </Text>
                <Text style={[styles.sharedSummaryValue, { color: colors.textMain }]}>
                  {CurrencyService.format(myCycleShare, subscription.currency)} / {cycleUnit}
                </Text>
                {subscription.billingPeriod === 'Yearly' && (
                  <Text style={[styles.sharedSummaryHint, { color: colors.textSec }]}>
                    Aylik karsiligi {CurrencyService.format(myMonthlyShare, subscription.currency)} / ay
                  </Text>
                )}
              </View>
            )}

            {lifecycleBadge && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: lifecycleBadge.background,
                    borderWidth: 1,
                    borderColor: lifecycleBadge.color,
                  },
                ]}
              >
                <Ionicons name={lifecycleBadge.icon} size={12} color={lifecycleBadge.color} />
                <Text style={[styles.badgeText, { color: lifecycleBadge.color, marginLeft: 4 }]}>
                  {lifecycleBadge.label}
                </Text>
              </View>
            )}
          </Animated.View>

          <View style={[styles.statusCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="radio-button-on-outline" size={16} color={colors.textSec} />
              <Text style={[styles.cardLabel, { color: colors.textSec }]}>ABONELIK DURUMU</Text>
            </View>

            <View style={styles.statusTabRow}>
              {[
                { key: 'active' as const, label: 'Aktif', icon: 'checkmark-circle', color: colors.success },
                { key: 'paused' as const, label: 'Durduruldu', icon: 'pause-circle', color: colors.warning },
              ].map((tab) => {
                const isSelected = currentActionStatus === tab.key;
                const isDisabled = currentActionStatus === 'cancelled';

                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.statusTab,
                      {
                        backgroundColor: isSelected ? tab.color + '1A' : colors.inputBg,
                        borderColor: isSelected ? tab.color : colors.border,
                        opacity: isDisabled ? 0.4 : 1,
                      },
                    ]}
                    onPress={() => !isDisabled && handleStatusChange(tab.key)}
                    activeOpacity={isDisabled ? 1 : 0.7}
                  >
                    <Ionicons
                      name={tab.icon as any}
                      size={18}
                      color={isSelected ? tab.color : colors.textSec}
                    />
                    <Text style={[styles.statusTabText, { color: isSelected ? tab.color : colors.textSec }]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.statusHelperText, { color: colors.textSec }]}>
              {currentLifecycle === 'pending'
                ? 'Ilk odeme tarihi gelene kadar bekliyor. Simdiden aktif gorunuyor ama henuz butceye dahil edilmiyor.'
                : currentActionStatus === 'cancelled'
                  ? 'Iptal edilen abonelik yeniden acilamaz. Kayit gecmisi korunur.'
                  : currentActionStatus === 'paused'
                    ? 'Durdurulan abonelik yaklasan odemelerden ve aktif yuk hesabindan cikarilir.'
                    : 'Aktif abonelik odeme planina gore yenilenir.'}
            </Text>

            {currentActionStatus !== 'cancelled' && (
              <TouchableOpacity
                style={[styles.cancelActionButton, { backgroundColor: colors.error + '12', borderColor: colors.error + '35' }]}
                onPress={() => handleStatusChange('cancelled')}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                <Text style={[styles.cancelActionText, { color: colors.error }]}>Aboneligi Iptal Et</Text>
              </TouchableOpacity>
            )}
          </View>

          {currentLifecycle === 'cancelled' && cancelInfo && (
            <View style={[styles.cancelCard, { backgroundColor: colors.error + '0D', borderColor: colors.error + '40' }]}>
              <View style={styles.cancelCardHeader}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                <Text style={[styles.cancelCardTitle, { color: colors.error }]}>Iptal Bilgisi</Text>
              </View>
              <View style={styles.cancelRows}>
                {cancelInfo.cancelledAt && (
                  <View style={styles.cancelRow}>
                    <Text style={[styles.cancelLabel, { color: colors.textSec }]}>Iptal Tarihi</Text>
                    <Text style={[styles.cancelValue, { color: colors.textMain }]}>
                      {formatLongDate(cancelInfo.cancelledAt)}
                    </Text>
                  </View>
                )}
                {cancelInfo.accessUntilDate && (
                  <View style={styles.cancelRow}>
                    <Text style={[styles.cancelLabel, { color: colors.textSec }]}>Erisim Sona Eriyor</Text>
                    <Text style={[styles.cancelValue, { color: colors.textMain }]}>
                      {formatLongDate(cancelInfo.accessUntilDate)}
                    </Text>
                  </View>
                )}
                {cancelInfo.remainingDays !== null && (
                  <View style={[styles.cancelRow, styles.cancelRowLast]}>
                    <Text style={[styles.cancelLabel, { color: colors.textSec }]}>Kalan Erisim</Text>
                    <View
                      style={[
                        styles.remainingBadge,
                        {
                          backgroundColor:
                            cancelInfo.remainingDays > 7 ? colors.success + '20' : colors.error + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.remainingText,
                          {
                            color: cancelInfo.remainingDays > 7 ? colors.success : colors.error,
                          },
                        ]}
                      >
                        {formatRelativeDays(cancelInfo.remainingDays)}
                      </Text>
                    </View>
                  </View>
                )}
                {!cancelInfo.accessUntilDate && (
                  <Text style={[styles.cancelNote, { color: colors.textSec }]}>
                    Erisim sonu bilgisi henuz alinamadi.
                  </Text>
                )}
              </View>
            </View>
          )}

          {currentLifecycle === 'paused' && pausedAt && (
            <View style={[styles.cancelCard, { backgroundColor: colors.warning + '0D', borderColor: colors.warning + '40' }]}>
              <View style={styles.cancelCardHeader}>
                <Ionicons name="pause-circle-outline" size={18} color={colors.warning} />
                <Text style={[styles.cancelCardTitle, { color: colors.warning }]}>Durdurma Bilgisi</Text>
              </View>
              <View style={styles.cancelRows}>
                <View style={styles.cancelRow}>
                  <Text style={[styles.cancelLabel, { color: colors.textSec }]}>Durdurulma Tarihi</Text>
                  <Text style={[styles.cancelValue, { color: colors.textMain }]}>
                    {formatLongDate(pausedAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {currentLifecycle === 'pending' && firstPaymentDate && (
            <View style={[styles.cancelCard, { backgroundColor: colors.primary + '0D', borderColor: colors.primary + '40' }]}>
              <View style={styles.cancelCardHeader}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.cancelCardTitle, { color: colors.primary }]}>Baslangic Bilgisi</Text>
              </View>
              <View style={styles.cancelRows}>
                <View style={styles.cancelRow}>
                  <Text style={[styles.cancelLabel, { color: colors.textSec }]}>Ilk Odeme Tarihi</Text>
                  <Text style={[styles.cancelValue, { color: colors.textMain }]}>
                    {formatLongDate(firstPaymentDate)}
                  </Text>
                </View>
                <View style={[styles.cancelRow, styles.cancelRowLast]}>
                  <Text style={[styles.cancelLabel, { color: colors.textSec }]}>Baslangica Kalan</Text>
                  <View style={[styles.remainingBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.remainingText, { color: colors.primary }]}>
                      {formatRelativeDays(daysLeft)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.nextPaymentCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSec} />
              <Text style={[styles.cardLabel, { color: colors.textSec }]}>{nextPaymentCardTitle}</Text>
            </View>

            {currentLifecycle === 'cancelled' ? (
              accessUntilDate ? (
                <View style={styles.nextPaymentBody}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={[styles.nextPaymentDate, { color: colors.textMain }]}>
                      {formatLongDate(accessUntilDate)}
                    </Text>
                    <Text style={[styles.sectionHelperText, { color: colors.textSec }]}>
                      Mevcut ucretli erisim bu tarihe kadar devam eder.
                    </Text>
                  </View>
                  <View style={[styles.daysLeftBadge, { backgroundColor: colors.error + '20' }]}>
                    <Text style={[styles.daysLeftText, { color: colors.error }]}>
                      {formatRelativeDays(cancelInfo?.remainingDays ?? 0)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.sectionEmptyText, { color: colors.textSec }]}>
                  Erisim bitis tarihi henuz alinamadi.
                </Text>
              )
            ) : currentLifecycle === 'paused' ? (
              <Text style={[styles.sectionEmptyText, { color: colors.textSec }]}>
                Abonelik durduruldugu icin yeni bir odeme tarihi hesaplanmiyor.
              </Text>
            ) : (
              <View style={styles.nextPaymentBody}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[styles.nextPaymentDate, { color: colors.textMain }]}>
                    {formatLongDate(nextDate)}
                  </Text>
                  <Text style={[styles.sectionHelperText, { color: colors.textSec }]}>
                    {currentLifecycle === 'pending' ? 'Ilk ucret kesimi' : 'Bir sonraki yenileme tarihi'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.daysLeftBadge,
                    {
                      backgroundColor: daysLeft <= 3 ? colors.error + '20' : colors.success + '20',
                    },
                  ]}
                >
                  <Text style={[styles.daysLeftText, { color: daysLeft <= 3 ? colors.error : colors.success }]}>
                    {formatRelativeDays(daysLeft)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {renderContractInfo()}

          <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 0 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Fiyat Gecmisi</Text>
              <Ionicons name="trending-up-outline" size={18} color={colors.textSec} />
            </View>
            {priceHistoryLoading ? (
              <Text style={[styles.sectionEmptyText, { color: colors.textSec }]}>Fiyat gecmisi yukleniyor...</Text>
            ) : priceHistoryError ? (
              <View style={[styles.errorRow, { backgroundColor: colors.error + '10' }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{priceHistoryError}</Text>
              </View>
            ) : priceHistory.length === 0 ? (
              <Text style={[styles.sectionEmptyText, { color: colors.textSec }]}>
                Henuz fiyat degisikligi kaydi yok.
              </Text>
            ) : (
              priceHistory.map((entry, index) => (
                <View
                  key={`${entry.changedAt}-${index}`}
                  style={[
                    styles.priceHistoryRow,
                    index < priceHistory.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                    <Ionicons name="swap-vertical-outline" size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.priceHistoryPrices}>
                      <Text style={[styles.priceHistoryOld, { color: colors.textSec }]}>
                        {CurrencyService.format(entry.oldPrice, entry.currency)}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color={entry.newPrice > entry.oldPrice ? colors.error : colors.success}
                        style={{ marginHorizontal: 6 }}
                      />
                      <Text style={[styles.priceHistoryNew, { color: entry.newPrice > entry.oldPrice ? colors.error : colors.success }]}>
                        {CurrencyService.format(entry.newPrice, entry.currency)}
                      </Text>
                      {entry.oldPrice > 0 && (
                        <View
                          style={[
                            {
                              marginLeft: 8,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 6,
                              backgroundColor: entry.newPrice > entry.oldPrice ? (colors.error + '18') : (colors.success + '18'),
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: entry.newPrice > entry.oldPrice ? colors.error : colors.success,
                            }}
                          >
                            {entry.newPrice > entry.oldPrice ? '+' : ''}
                            {(((entry.newPrice - entry.oldPrice) / entry.oldPrice) * 100).toFixed(0)}%
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.priceHistoryDate, { color: colors.textSec }]}>
                      {formatLongDate(parseCalendarDate(entry.changedAt))}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 0 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Kullanim Gecmisi</Text>
              <Ionicons name="pulse-outline" size={18} color={colors.textSec} />
            </View>
            {usageLogsLoading ? (
              <Text style={[styles.sectionEmptyText, { color: colors.textSec }]}>Kullanim gecmisi yukleniyor...</Text>
            ) : usageLogsError ? (
              <View style={[styles.errorRow, { backgroundColor: colors.error + '10' }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{usageLogsError}</Text>
              </View>
            ) : usageLogs.length === 0 ? (
              <Text style={[styles.sectionEmptyText, { color: colors.textSec }]}>
                Henuz kayitli bir kullanim girdisi yok.
              </Text>
            ) : (
              usageLogs.map((log, index) => (
                <View
                  key={log.id}
                  style={[
                    styles.priceHistoryRow,
                    index < usageLogs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                    <Ionicons name="analytics-outline" size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailLabel, { color: colors.textMain, marginBottom: 4 }]}>
                      {log.note?.trim() || 'Kullanim kaydi'}
                    </Text>
                    <Text style={[styles.priceHistoryDate, { color: colors.textSec }]}>
                      {formatLongDate(parseCalendarDate(log.date))}
                      {typeof log.amount === 'number' && log.unit ? ` · ${log.amount} ${log.unit}` : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {subscription.notes && subscription.notes.trim().length > 0 && (
            <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 0 }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Notlar</Text>
                <Ionicons name="create-outline" size={18} color={colors.textSec} />
              </View>
              <Text style={{ fontSize: 14, color: colors.textSec, lineHeight: 22 }}>
                {subscription.notes}
              </Text>
            </View>
          )}

          <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 8 }]}>
            <View style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                  <Ionicons name="folder-open" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textMain }]}>Kategori</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textSec }]}>{subscription.category}</Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                  <Ionicons name="refresh-circle-outline" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textMain }]}>Odeme Plani</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textSec }]}>{billingPeriodLabel}</Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                  <Ionicons name="flag-outline" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textMain }]}>Ilk Odeme Tarihi</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textSec }]}>{formatLongDate(firstPaymentDate)}</Text>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                  <Ionicons name="calendar-number-outline" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textMain }]}>Yenileme Takvimi</Text>
              </View>
              <View style={styles.detailValueStack}>
                <Text style={[styles.detailValue, { color: colors.textSec, textAlign: 'right' }]}>
                  {billingScheduleLabel}
                </Text>
                {subscription.billingPeriod === 'Yearly' && (
                  <Text style={[styles.detailHintText, { color: colors.textSec }]}>
                    Fatura ayi {yearlyMonthLabel}
                  </Text>
                )}
              </View>
            </View>

            <View style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: partnersCount > 0 ? 1 : 0 }]}>
              <View style={styles.detailLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                  <Ionicons name="people" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.detailLabel, { color: colors.textMain }]}>Abonelik Tipi</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textSec }]}>
                {partnersCount > 0 ? 'Ortak Plan' : 'Bireysel'}
              </Text>
            </View>

            {partnersCount > 0 && (
              <>
                <View style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                  <View style={styles.detailLeft}>
                    <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                      <Ionicons name="wallet" size={18} color={colors.accent} />
                    </View>
                    <Text style={[styles.detailLabel, { color: colors.textMain }]}>Senin Payin</Text>
                  </View>
                  <View style={styles.detailValueStack}>
                    <Text style={[styles.detailValue, { color: colors.success, fontWeight: '700', textAlign: 'right' }]}>
                      {CurrencyService.format(myCycleShare, subscription.currency)} / {cycleUnit}
                    </Text>
                    {subscription.billingPeriod === 'Yearly' && (
                      <Text style={[styles.detailHintText, { color: colors.textSec }]}>
                        Aylik karsiligi {CurrencyService.format(myMonthlyShare, subscription.currency)} / ay
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailLeft}>
                    <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                      <Ionicons name="people-outline" size={18} color={colors.accent} />
                    </View>
                    <Text style={[styles.detailLabel, { color: colors.textMain }]}>Ortaklar</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4, maxWidth: '60%' }}>
                    {(subscription.sharedWith ?? []).map((partner, index) => (
                      <View key={`sw-${index}`} style={[styles.partnerChip, { backgroundColor: colors.accent + '15' }]}>
                        <Ionicons name="mail-outline" size={11} color={colors.accent} />
                        <Text style={[styles.partnerChipText, { color: colors.accent }]} numberOfLines={1}>
                          {partner.email}
                        </Text>
                      </View>
                    ))}
                    {(subscription.sharedGuests ?? []).map((guest, index) => (
                      <View key={`sg-${index}`} style={[styles.partnerChip, { backgroundColor: colors.inputBg }]}>
                        <Ionicons name="person-outline" size={11} color={colors.textSec} />
                        <Text style={[styles.partnerChipText, { color: colors.textSec }]} numberOfLines={1}>
                          {guest.displayName}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 20,
    paddingBottom: 10,
  },
  topBarActions: { flexDirection: 'row' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroSection: { alignItems: 'center', marginTop: 20, marginBottom: 28 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  heroMetaText: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  heroCurrency: { fontSize: 18, fontWeight: '600', marginBottom: 8, marginRight: 4 },
  heroPrice: { fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  heroPeriod: { fontSize: 14, fontWeight: '500', marginBottom: 10, marginLeft: 4 },
  sharedSummaryCard: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 220,
  },
  sharedSummaryLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  sharedSummaryValue: { fontSize: 18, fontWeight: '800' },
  sharedSummaryHint: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  statusCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statusTabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusTab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  statusTabText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusHelperText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  cancelActionButton: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionText: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
  },

  cancelCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cancelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cancelCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  cancelRows: {},
  cancelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  cancelRowLast: {
    borderBottomWidth: 0,
  },
  cancelLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  cancelValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  cancelNote: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.7,
  },
  remainingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '800',
  },

  nextPaymentCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  nextPaymentBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  nextPaymentDate: {
    fontSize: 18,
    fontWeight: '700',
  },
  daysLeftBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  daysLeftText: {
    fontSize: 12,
    fontWeight: '800',
  },

  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionHelperText: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  sectionEmptyText: { fontSize: 14, lineHeight: 22 },

  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailLeft: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: { fontSize: 14, fontWeight: '600' },
  detailValue: { fontSize: 14, fontWeight: '500' },
  detailValueStack: {
    alignItems: 'flex-end',
    maxWidth: '58%',
  },
  detailHintText: {
    fontSize: 12,
    marginTop: 4,
  },

  contractRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contractItem: { flex: 1, alignItems: 'center' },
  contractLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  contractValue: { fontSize: 15, fontWeight: '600' },
  divider: { width: 1, height: 40, marginHorizontal: 10 },

  scrollContent: { paddingBottom: 40 },

  priceHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  priceHistoryPrices: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  priceHistoryOld: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  priceHistoryNew: {
    fontSize: 14,
    fontWeight: '700',
  },
  priceHistoryDate: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  partnerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  partnerChipText: { fontSize: 12, fontWeight: '600' },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
