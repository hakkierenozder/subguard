import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity, Animated, Easing, Platform, Image, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { CatalogItem, DashboardDto, UpcomingPaymentDto, UserSubscription } from '../types';
import { RootStackParamList } from '../../App';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';
import UsageSurveyModal from '../components/UsageSurveyModal';
import EmptyState from '../components/EmptyState';
import { HomeSkeletonLoader } from '../components/SkeletonLoader'; // #42
import agent from '../api/agent';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, THEME } from '../constants/theme';
import { useCatalogStore } from '../store/useCatalogStore';
import { isSubscriptionActiveNow } from '../utils/dateUtils';
import { formatCurrencyAmount, normalizeCurrencyCode } from '../utils/CurrencyService';
import { convertAmountBetweenCurrencies, getSubscriptionPortfolioMetrics } from '../utils/subscriptionMath';

function UpcomingPaymentLogo({ logoUrl, colorCode, name }: { logoUrl?: string; colorCode: string; name: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (logoUrl && !imgFailed) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: '75%', height: '75%' }}
        resizeMode="contain"
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <Text style={{ fontSize: 16, fontWeight: '800', color: colorCode }}>
      {name.charAt(0)}
    </Text>
  );
}

export default function HomeScreen() {
    const colors = useThemeColors();
    const isDarkMode = useSettingsStore((state) => state.isDarkMode);
    const dashboardUpcomingDays = useSettingsStore((state) => state.dashboardUpcomingDays); // #35
    const isFocused = useIsFocused();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const { catalogItems, fetchCatalog } = useCatalogStore();

    // Store'lar
    const {
        subscriptions,
        loading,
        fetchUserSubscriptions,
        fetchExchangeRates,
        getPendingSurvey,
        logUsage,
        exchangeRates,
    } = useUserSubscriptionStore();

    // State'ler
    const [userName, setUserName] = useState('');
    
    // MODAL YÖNETİMİ (Tek merkezden)
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
    const [detailSub, setDetailSub] = useState<UserSubscription | null>(null);
    const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

    const [refreshing, setRefreshing] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const [surveySub, setSurveySub] = useState<UserSubscription | null>(null);
    const [inactiveStats, setInactiveStats] = useState({ paused: 0, cancelled: 0 });
    const [error, setError] = useState(false); // [29] hata durumu
    const [dashboardData, setDashboardData] = useState<DashboardDto | null>(null);
    const surveyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // [30] timeout ref
    const isFocusedRef = useRef(isFocused);
    const budgetAlertThreshold = useSettingsStore((state) => state.budgetAlertThreshold);
    const monthlyBudget = useSettingsStore((state) => state.monthlyBudget);
    const setMonthlyBudget = useSettingsStore((state) => state.setMonthlyBudget);
    const monthlyBudgetCurrency = useSettingsStore((state) => state.monthlyBudgetCurrency);
    const setMonthlyBudgetCurrency = useSettingsStore((state) => state.setMonthlyBudgetCurrency);

    useEffect(() => {
        isFocusedRef.current = isFocused;
        if (!isFocused) {
            if (surveyTimerRef.current) clearTimeout(surveyTimerRef.current);
            setSurveySub(null);
            setDetailSub(null);
            setBottomSheetVisible(false);
        }
    }, [isFocused]);

    useEffect(() => {
        loadData();
        if (catalogItems.length === 0) fetchCatalog();
        return () => { // [30] cleanup
            if (surveyTimerRef.current) clearTimeout(surveyTimerRef.current);
        };
    }, [dashboardUpcomingDays]); // [30] dashboardUpcomingDays bağımlılığı eklendi

    const loadData = async () => {
        setError(false); // [29] her yüklemede hatayı sıfırla
        try {
            // Dashboard tek çağrıda hem bütçe özetini hem yaklaşan ödeme verisini döner.
            // Profil sadece kullanıcı adı için çekiliyor.
            const [dashRes, profileRes] = await Promise.allSettled([
                agent.Dashboard.get(dashboardUpcomingDays), // #35: sabit 30 yerine kullanıcı tercihi
                agent.Auth.getProfile(),
            ]);

            // Kullanıcı adı → profil'den
            if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
                setUserName(profileRes.value.data.fullName);
            }

            // Paused / Cancelled sayıları → dashboard'dan
            if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
                const d = dashRes.value.data;
                setDashboardData(d);
                setInactiveStats({
                    paused:    d.pausedCount    ?? 0,
                    cancelled: d.cancelledCount ?? 0,
                });
            } else {
                setDashboardData(null);
            }

            // Bütçe → dashboard tek kaynak (profil fallback)
            const budgetSummary = dashRes.status === 'fulfilled'
                ? dashRes.value?.data?.budgetSummary
                : null;
            if (budgetSummary?.monthlyBudget) {
                setMonthlyBudget(Number(budgetSummary.monthlyBudget));
                setMonthlyBudgetCurrency(normalizeCurrencyCode(budgetSummary.currency));
            } else if (profileRes.status === 'fulfilled' && profileRes.value?.data?.monthlyBudget) {
                setMonthlyBudget(profileRes.value.data.monthlyBudget);
                setMonthlyBudgetCurrency(normalizeCurrencyCode(profileRes.value.data.monthlyBudgetCurrency));
            } else if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
                setMonthlyBudgetCurrency(normalizeCurrencyCode(profileRes.value.data.monthlyBudgetCurrency));
            }
        } catch (e) {
            setError(true); // [29] hata durumunu işaretle
        }

        await Promise.all([
            fetchUserSubscriptions(),
            fetchExchangeRates(),
        ]);
        checkSurvey();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const checkSurvey = () => {
        if (!isFocusedRef.current) return;
        const pending = getPendingSurvey();
        if (pending) {
            if (surveyTimerRef.current) clearTimeout(surveyTimerRef.current); // [30]
            surveyTimerRef.current = setTimeout(() => {
                if (isFocusedRef.current) {
                    setSurveySub(pending);
                }
            }, 1500); // [30]
        }
    };

    // --- Abonelik Ekleme ---
    const handleCreateCustom = () => {
        setSelectedCatalogItem(null);
        setModalVisible(true);
    };

    const handleEditFromDetail = (sub: UserSubscription) => {
        setDetailSub(null);
        setSelectedCatalogItem(null);
        setEditingSub(sub);
    };

    // Hesaplamalar
    const portfolioMetrics = getSubscriptionPortfolioMetrics(subscriptions, exchangeRates);
    const budgetSummary = dashboardData?.budgetSummary ?? null;
    const budgetCurrency = normalizeCurrencyCode(budgetSummary?.currency ?? monthlyBudgetCurrency);
    const fromTry = (amount: number) => convertAmountBetweenCurrencies(
        amount,
        'TRY',
        budgetCurrency,
        exchangeRates,
        { unknownRateAsZero: true },
    );
    const toBudgetCurrency = (amount: number, currency: string) => convertAmountBetweenCurrencies(
        amount,
        currency,
        budgetCurrency,
        exchangeRates,
        { unknownRateAsZero: true },
    );
    const formatBudgetAmount = (amount: number, fractionDigits = budgetCurrency === 'TRY' ? 0 : 2) =>
        formatCurrencyAmount(amount, budgetCurrency, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        });
    const totalExpense = budgetSummary?.totalSpent ?? fromTry(portfolioMetrics.monthlyEquivalentTotalTRY);
    const activeCount = portfolioMetrics.startedCount;
    const effectiveMonthlyBudget = budgetSummary?.monthlyBudget ?? monthlyBudget;
    const effectiveBudgetThreshold = budgetSummary?.budgetAlertThreshold ?? budgetAlertThreshold;
    const budgetPercentage = effectiveMonthlyBudget > 0 ? (totalExpense / effectiveMonthlyBudget) * 100 : 0;
    const isOverBudget = budgetSummary?.isOverBudget ?? (effectiveMonthlyBudget > 0 && totalExpense > effectiveMonthlyBudget);
    const isNearBudgetLimit = budgetSummary?.isNearLimit
        ?? (!isOverBudget && effectiveMonthlyBudget > 0 && budgetPercentage >= effectiveBudgetThreshold);
    const budgetBarColor = isOverBudget
        ? colors.error
        : isNearBudgetLimit
            ? colors.orange
            : colors.success;
    const budgetCardGradient: [string, string] = isOverBudget
        ? [colors.error + 'CC', colors.error]
        : isNearBudgetLimit
            ? [colors.orange, colors.warning]
            : ['#4F46E5', '#6D28D9'];
    const budgetCardShadowColor = isOverBudget ? colors.error : isNearBudgetLimit ? colors.orange : '#4F46E5';
    const budgetProgressText = isOverBudget
        ? '⚠ Bütçe aşıldı!'
        : isNearBudgetLimit
            ? `⚠ %${effectiveBudgetThreshold} eşiğine ulaşıldı`
            : `%${budgetPercentage.toFixed(0)} kullanıldı`;

    // Animasyonlu progress bar
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        progressAnim.setValue(0);
        Animated.timing(progressAnim, {
            toValue: Math.min(budgetPercentage, 100),
            duration: 1100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [budgetPercentage]);

    const animatedWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const subscriptionsById = useMemo(
        () => new Map(subscriptions.map((subscription) => [Number(subscription.id), subscription])),
        [subscriptions],
    );

    const fallbackUpcomingPayments = useMemo<UpcomingPaymentDto[]>(() =>
        subscriptions
            .filter((subscription) => {
                if (subscription.isActive === false) return false;
                if (!isSubscriptionActiveNow(
                    subscription.isActive,
                    subscription.firstPaymentDate,
                    subscription.contractStartDate,
                    new Date(),
                    subscription.createdDate,
                )) {
                    return false;
                }

                const billingAnchor = subscription.firstPaymentDate
                    ? new Date(subscription.firstPaymentDate)
                    : subscription.contractStartDate
                        ? new Date(subscription.contractStartDate)
                        : subscription.createdDate
                            ? new Date(subscription.createdDate)
                            : new Date();

                const nextBillingDate = new Date(billingAnchor);
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);

                if (subscription.billingPeriod === 'Yearly') {
                    while (nextBillingDate < todayDate) {
                        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                    }
                } else {
                    while (nextBillingDate < todayDate) {
                        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                    }
                }

                const daysUntilPayment = Math.ceil((nextBillingDate.getTime() - todayDate.getTime()) / 86400000);
                return daysUntilPayment <= dashboardUpcomingDays;
            })
            .map((subscription) => {
                const billingAnchor = subscription.firstPaymentDate
                    ? new Date(subscription.firstPaymentDate)
                    : subscription.contractStartDate
                        ? new Date(subscription.contractStartDate)
                        : subscription.createdDate
                            ? new Date(subscription.createdDate)
                            : new Date();
                const nextBillingDate = new Date(billingAnchor);
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);

                if (subscription.billingPeriod === 'Yearly') {
                    while (nextBillingDate < todayDate) {
                        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                    }
                } else {
                    while (nextBillingDate < todayDate) {
                        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                    }
                }

                const daysUntilPayment = Math.ceil((nextBillingDate.getTime() - todayDate.getTime()) / 86400000);

                return {
                    id: Number(subscription.id),
                    name: subscription.name,
                    price: subscription.price,
                    currency: subscription.currency,
                    billingDay: subscription.billingDay,
                    daysUntilPayment,
                    colorCode: subscription.colorCode,
                    billingPeriod: subscription.billingPeriod,
                    notes: subscription.notes,
                } satisfies UpcomingPaymentDto;
            })
            .sort((a, b) => a.daysUntilPayment - b.daysUntilPayment),
    [dashboardUpcomingDays, subscriptions]);

    const effectiveUpcomingPayments = useMemo(
        () => dashboardData?.upcomingPayments ?? fallbackUpcomingPayments,
        [dashboardData?.upcomingPayments, fallbackUpcomingPayments],
    );

    const upcomingPaymentCards = useMemo(() =>
        effectiveUpcomingPayments.map((payment) => {
            const matchedSubscription = subscriptionsById.get(payment.id) ?? null;
            const partnerCount = matchedSubscription
                ? (matchedSubscription.sharedWith?.length ?? 0) + (matchedSubscription.sharedGuests?.length ?? 0)
                : 0;
            const myShare = partnerCount > 0 ? payment.price / (partnerCount + 1) : null;
            const contractDaysLeft = matchedSubscription?.hasContract && matchedSubscription.contractEndDate
                ? Math.ceil((new Date(matchedSubscription.contractEndDate).getTime() - Date.now()) / 86400000)
                : null;

            return {
                payment,
                subscription: matchedSubscription,
                daysLeft: payment.daysUntilPayment,
                budgetAmount: toBudgetCurrency(payment.price, payment.currency),
                logoUrl: matchedSubscription?.catalogId
                    ? catalogItems.find((catalogItem) => catalogItem.id === matchedSubscription.catalogId)?.logoUrl
                    : undefined,
                myShare,
                contractDaysLeft,
                itemColor: payment.colorCode || matchedSubscription?.colorCode || colors.primary,
            };
        }),
    [catalogItems, colors.primary, effectiveUpcomingPayments, subscriptionsById, toBudgetCurrency]);

    const upcomingPaymentsTotal = useMemo(
        () => upcomingPaymentCards.reduce((sum, item) => sum + item.budgetAmount, 0),
        [upcomingPaymentCards],
    );

    const visibleUpcomingPaymentCards = useMemo(
        () => upcomingPaymentCards.slice(0, 8),
        [upcomingPaymentCards],
    );

    const upcomingWindowLabel = `Önümüzdeki ${dashboardUpcomingDays} gün`;
    const primaryUpcomingThreshold = Math.min(dashboardUpcomingDays, 7);
    const primaryUpcomingGroupTitle = dashboardUpcomingDays === 7 ? upcomingWindowLabel : 'İlk 7 Gün';
    const secondaryUpcomingGroupTitle = `Kalan ${dashboardUpcomingDays - primaryUpcomingThreshold} Gün`;

    const sortedPayments = useMemo(() =>
        upcomingPaymentCards.map((item) => {
            const payment = item.payment;
            const fallbackSubscription: UserSubscription = {
                id: payment.id.toString(),
                name: payment.name,
                price: payment.price,
                currency: payment.currency,
                category: '',
                billingDay: payment.billingDay,
                billingPeriod: payment.billingPeriod,
                notes: payment.notes ?? undefined,
                colorCode: payment.colorCode,
                hasContract: false,
                isActive: true,
                sharedWith: [],
                sharedGuests: [],
            };

            return {
                ...(item.subscription ?? fallbackSubscription),
                _daysLeft: item.daysLeft,
                _budgetAmount: item.budgetAmount,
            };
        }),
    [upcomingPaymentCards]);

    const thisWeekPayments = useMemo(
        () => sortedPayments.filter((item) => item._daysLeft <= primaryUpcomingThreshold),
        [primaryUpcomingThreshold, sortedPayments],
    );

    const thisMonthPayments = useMemo(
        () => sortedPayments.filter((item) => item._daysLeft > primaryUpcomingThreshold && item._daysLeft <= dashboardUpcomingDays),
        [dashboardUpcomingDays, primaryUpcomingThreshold, sortedPayments],
    );

    const thisWeekTotal = useMemo(
        () => thisWeekPayments.reduce((sum, item) => sum + item._budgetAmount, 0),
        [thisWeekPayments],
    );

    const thisMonthTotal = useMemo(
        () => thisMonthPayments.reduce((sum, item) => sum + item._budgetAmount, 0),
        [thisMonthPayments],
    );

    const thisMonthAllTotal = upcomingPaymentsTotal;

    const categoryCount = new Set(
        subscriptions
            .filter(s => isSubscriptionActiveNow(s.isActive, s.firstPaymentDate, s.contractStartDate, new Date(), s.createdDate))
            .map(s => s.category)
    ).size;

    // #40: Animasyon değerleri — lazy Map tabanlı; kaç kart olursa olsun doğru çalışır.
    // Eski `Array.from({ length: 8 })` yaklaşımı 8+ abonelikte idx-out-of-bounds veriyordu.
    const cardAnimsRef = useRef<Map<number, Animated.Value>>(new Map());
    const getCardAnim = (idx: number): Animated.Value => {
        if (!cardAnimsRef.current.has(idx)) {
            cardAnimsRef.current.set(idx, new Animated.Value(0));
        }
        return cardAnimsRef.current.get(idx)!;
    };

    useEffect(() => {
        // Tüm mevcut animasyonları sıfırla
        cardAnimsRef.current.forEach(a => a.setValue(0));
        const anims = visibleUpcomingPaymentCards.map((_, i) =>
            Animated.timing(getCardAnim(i), {
                toValue: 1,
                duration: 350,
                delay: i * 60,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            })
        );
        Animated.stagger(60, anims).start();
    }, [visibleUpcomingPaymentCards]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar 
                barStyle={isDarkMode ? "light-content" : "dark-content"} 
                backgroundColor={colors.bg} 
            />

            {/* [29] Hata durumu banner */}
            {error && (
                <TouchableOpacity
                    onPress={async () => { setRetrying(true); await loadData(); setRetrying(false); }}
                    style={{ backgroundColor: colors.error + '22', padding: 10, marginHorizontal: 16, marginTop: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    activeOpacity={0.8}
                    disabled={retrying}
                >
                    {retrying
                        ? <ActivityIndicator size="small" color={colors.error} />
                        : <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                    }
                    <Text style={{ color: colors.error, fontSize: 13, flex: 1 }}>
                        {retrying ? 'Yeniden yükleniyor...' : 'Veriler yüklenemedi. Tekrar denemek için dokun.'}
                    </Text>
                </TouchableOpacity>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textSec }]}>Tekrar hoş geldin,</Text>
                        <Text style={[styles.username, { color: colors.textMain }]}>{userName.split(' ')[0] || 'Kullanıcı'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {/* Bildirim Zili */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Notifications')}
                            style={[styles.avatar, { backgroundColor: colors.inputBg }]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
                                size={20}
                                color={colors.accent}
                            />
                            {unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute', top: 6, right: 6,
                                    backgroundColor: colors.error, borderRadius: 7,
                                    minWidth: 14, height: 14, alignItems: 'center',
                                    justifyContent: 'center', paddingHorizontal: 2,
                                }}>
                                    <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {/* Avatar */}
                        <TouchableOpacity
                            style={[styles.avatar, { backgroundColor: colors.inputBg }]}
                            onPress={() => (navigation as any).navigate('Settings')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.avatarText, { color: colors.accent }]}>
                                {userName
                                    ? userName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                                    : 'K'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. DASHBOARD CARD */}
                <LinearGradient
                    colors={budgetCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.dashboardCard, { shadowColor: budgetCardShadowColor }]}
                >
                    {/* Dekoratif daire */}
                    <View style={styles.dashDecorCircle} />

                    <View style={styles.dashTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.dashLabel}>AKTİF AYLIK YÜK</Text>
                            <Text style={styles.dashValue}>{formatBudgetAmount(totalExpense)}</Text>
                            <View style={styles.dashSubRow}>
                                <View style={styles.dashCountBadge}>
                                    <Ionicons name="apps-outline" size={11} color="rgba(255,255,255,0.9)" />
                                    <Text style={styles.dashCountText}>{activeCount} başlamış</Text>
                                </View>
                                {categoryCount > 0 && (
                                    <View style={styles.dashCountBadge}>
                                        <Ionicons name="grid-outline" size={11} color="rgba(255,255,255,0.9)" />
                                        <Text style={styles.dashCountText}>{categoryCount} kategori</Text>
                                    </View>
                                )}
                                {portfolioMetrics.pendingCount > 0 && (
                                    <View style={[styles.dashCountBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                                        <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.95)" />
                                        <Text style={styles.dashCountText}>{portfolioMetrics.pendingCount} bekliyor</Text>
                                    </View>
                                )}
                                {upcomingPaymentCards.length > 0 && (
                                    <TouchableOpacity
                                        style={[styles.dashCountBadge, { backgroundColor: 'rgba(249,115,22,0.35)' }]}
                                        onPress={() => navigation.navigate('Calendar')}
                                        activeOpacity={0.75}
                                    >
                                        <Ionicons name="alarm-outline" size={11} color="rgba(255,255,255,0.95)" />
                                        <Text style={styles.dashCountText}>{upcomingPaymentCards.length} yaklaşan</Text>
                                    </TouchableOpacity>
                                )}
                                {inactiveStats.paused > 0 && (
                                    <View style={[styles.dashCountBadge, { backgroundColor: 'rgba(251,191,36,0.35)' }]}>
                                        <Ionicons name="pause-circle-outline" size={11} color="rgba(255,255,255,0.95)" />
                                        <Text style={styles.dashCountText}>{inactiveStats.paused} durdurulmuş</Text>
                                    </View>
                                )}
                                {inactiveStats.cancelled > 0 && (
                                    <View style={[styles.dashCountBadge, { backgroundColor: 'rgba(239,68,68,0.35)' }]}>
                                        <Ionicons name="close-circle-outline" size={11} color="rgba(255,255,255,0.95)" />
                                        <Text style={styles.dashCountText}>{inactiveStats.cancelled} iptal</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={styles.budgetBox}>
                            <Text style={styles.budgetLabel}>HEDEF</Text>
                            <Text style={styles.budgetValue}>
                                {effectiveMonthlyBudget > 0 ? formatBudgetAmount(effectiveMonthlyBudget) : '-'}
                            </Text>
                            {effectiveMonthlyBudget > 0 && (
                                <Text style={styles.budgetRemain}>
                                    {isOverBudget
                                        ? `+${formatBudgetAmount(totalExpense - effectiveMonthlyBudget)} aşıldı`
                                        : `${formatBudgetAmount(effectiveMonthlyBudget - totalExpense)} kaldı`}
                                </Text>
                            )}
                        </View>
                    </View>

                    {effectiveMonthlyBudget > 0 && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressBarBg}>
                                <Animated.View style={[
                                    styles.progressBarFill,
                                    { width: animatedWidth, backgroundColor: budgetBarColor }
                                ]} />
                            </View>
                            <View style={styles.progressFooter}>
                                <View style={[styles.progressDot, { backgroundColor: budgetBarColor }]} />
                                <Text style={styles.progressText}>{budgetProgressText}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.billingSplitRow}>
                        <View style={styles.billingSplitCard}>
                            <Text style={styles.billingSplitLabel}>AYLIK</Text>
                            <Text style={styles.billingSplitValue}>{formatBudgetAmount(fromTry(portfolioMetrics.monthlyStartedTotalTRY))}</Text>
                            <Text style={styles.billingSplitMeta}>
                                {portfolioMetrics.monthlyStartedCount} başlamış
                                {portfolioMetrics.pendingMonthlyCount > 0
                                    ? ` · ${portfolioMetrics.pendingMonthlyCount} bekleyen (${formatBudgetAmount(fromTry(portfolioMetrics.pendingMonthlyTotalTRY))})`
                                    : ''}
                            </Text>
                        </View>
                        <View style={styles.billingSplitCard}>
                            <Text style={styles.billingSplitLabel}>YILLIK</Text>
                            <Text style={styles.billingSplitValue}>{formatBudgetAmount(fromTry(portfolioMetrics.yearlyStartedTotalTRY))}</Text>
                            <Text style={styles.billingSplitMeta}>
                                {portfolioMetrics.yearlyStartedCount} başlamış
                                {portfolioMetrics.pendingYearlyCount > 0
                                    ? ` · ${portfolioMetrics.pendingYearlyCount} bekleyen (${formatBudgetAmount(fromTry(portfolioMetrics.pendingYearlyTotalTRY))})`
                                    : ''}
                            </Text>
                            <Text style={styles.billingSplitMeta}>
                                ≈ {formatBudgetAmount(fromTry(portfolioMetrics.yearlyStartedTotalTRY / 12))}/ay eşdeğeri
                            </Text>
                        </View>
                    </View>

                    {portfolioMetrics.pendingCount > 0 && (
                        <View style={styles.pendingInfoRow}>
                            <Ionicons name="hourglass-outline" size={13} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.pendingInfoText}>
                                {portfolioMetrics.pendingCount} abonelik henüz başlamadı
                                {` · ${portfolioMetrics.pendingMonthlyCount} aylık`}
                                {` · ${portfolioMetrics.pendingYearlyCount} yıllık`}
                                {` · ≈ ${formatBudgetAmount(fromTry(portfolioMetrics.pendingMonthlyEquivalentTRY))}/ay bekliyor`}
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                {/* 3. BOŞ DURUM / SKELETON (#42) */}
                {loading && subscriptions.length === 0 && (
                    <HomeSkeletonLoader />
                )}
                {!loading && subscriptions.length === 0 && (
                    <EmptyState
                        icon="albums-outline"
                        title="Henüz abonelik yok"
                        description="İlk aboneliğini ekle, harcamalarını takip etmeye başla."
                        actionLabel="Abonelik Ekle"
                        onAction={() => setBottomSheetVisible(true)}
                    />
                )}


                {/* 4. YAKLAŞAN ÖDEMELER */}
                {sortedPayments.length > 0 && (
                    <View style={styles.section}>
                        {/* Section Header */}
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Yaklaşan Ödemeler</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Calendar')}
                                style={[styles.calendarBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                            >
                                <Ionicons name="calendar-outline" size={13} color={colors.accent} />
                                <Text style={[styles.calendarBtnText, { color: colors.accent }]}>Takvim</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Bu Ay Gerçek Toplamı */}
                        <View style={[styles.monthSummaryRow, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '25' }]}>
                            <Ionicons name="wallet-outline" size={13} color={colors.accent} />
                            <Text style={[styles.monthSummaryLabel, { color: colors.textSec }]}>{upcomingWindowLabel} toplamı</Text>
                            <Text style={[styles.monthSummaryValue, { color: colors.accent }]}>
                                {formatBudgetAmount(thisMonthAllTotal)}
                            </Text>
                        </View>

                        {/* BU HAFTA */}
                        {thisWeekPayments.length > 0 && (
                            <>
                                <View style={styles.upGroupHeader}>
                                    <View style={[styles.upGroupDot, { backgroundColor: colors.error }]} />
                                    <Text style={[styles.upGroupTitle, { color: colors.textSec }]}>{primaryUpcomingGroupTitle}</Text>
                                    <View style={{ flex: 1 }} />
                                    <Text style={[styles.upGroupTotal, { color: colors.textMain }]}>
                                        {formatBudgetAmount(thisWeekTotal)}
                                    </Text>
                                </View>
                                {thisWeekPayments.slice(0, 4).map((item, idx) => {
                                    const daysLeft = item._daysLeft;
                                    const urgencyColor = daysLeft <= 2 ? colors.error : colors.orange;
                                    const urgencyBg   = daysLeft <= 2 ? (colors.error + '20') : (colors.orange + '20');
                                    const urgencyLabel = daysLeft === 0 ? 'Bugün!' : daysLeft === 1 ? 'Yarın!' : `${daysLeft} gün`;
                                    const anim = getCardAnim(idx);
                                    const itemColor = item.colorCode || colors.primary;
                                    const catalogLogoUrl = catalogItems.find(c => c.id === item.catalogId)?.logoUrl;
                                    const partnerCount = (item.sharedWith?.length ?? 0) + (item.sharedGuests?.length ?? 0);
                                    const myShare = partnerCount > 0 ? item.price / (partnerCount + 1) : null;
                                    const contractDaysLeft = item.hasContract && item.contractEndDate
                                        ? Math.ceil((new Date(item.contractEndDate).getTime() - Date.now()) / 86400000)
                                        : null;
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            activeOpacity={0.86}
                                            onPress={() => setDetailSub(item)}
                                        >
                                        <Animated.View
                                            style={[styles.upRow, {
                                                backgroundColor: colors.cardBg,
                                                borderColor: daysLeft <= 2 ? (colors.error + '60') : (colors.orange + '60'),
                                                opacity: anim,
                                                transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
                                            }]}
                                        >
                                            {daysLeft <= 2 && <View style={[styles.upRowStripe, { backgroundColor: colors.error }]} />}
                                            <View style={[styles.upRowIcon, { backgroundColor: itemColor + '20', overflow: 'hidden' }]}>
                                                <UpcomingPaymentLogo logoUrl={catalogLogoUrl} colorCode={itemColor} name={item.name} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.upRowName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                                                <View style={styles.upRowMeta}>
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec }]}>
                                                        {item.billingPeriod === 'Yearly'
                                                            ? `${item.billingDay}. her yıl`
                                                            : `${item.billingDay}. her ay`}
                                                    </Text>
                                                    {item.billingPeriod === 'Yearly' && (
                                                        <View style={{ marginLeft: 5, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, backgroundColor: colors.accent + '22' }}>
                                                            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.accent }}>YILLIK</Text>
                                                        </View>
                                                    )}
                                                    {contractDaysLeft !== null && contractDaysLeft <= 30 && (
                                                        <View style={{ marginLeft: 6, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, backgroundColor: contractDaysLeft <= 0 ? (colors.error + '20') : '#F9731620' }}>
                                                            <Text style={{ fontSize: 10, fontWeight: '700', color: contractDaysLeft <= 0 ? colors.error : '#F97316' }}>
                                                                {contractDaysLeft <= 0 ? 'Kontrat bitti' : `Kontrat ${contractDaysLeft}g`}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                {!!item.notes && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                        <Ionicons name="document-text-outline" size={10} color={colors.textSec} />
                                                        <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 10 }]} numberOfLines={1}>
                                                            {item.notes}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.upRowPrice, { color: colors.textMain }]}>
                                                    {formatCurrencyAmount(item.price, item.currency, {
                                                        minimumFractionDigits: item.currency === 'TRY' ? 0 : 2,
                                                        maximumFractionDigits: item.currency === 'TRY' ? 0 : 2,
                                                    })}
                                                </Text>
                                                {myShare !== null && (
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 11 }]}>
                                                        Payınız: {formatCurrencyAmount(myShare, item.currency, {
                                                            minimumFractionDigits: item.currency === 'TRY' ? 0 : 2,
                                                            maximumFractionDigits: item.currency === 'TRY' ? 0 : 2,
                                                        })}
                                                    </Text>
                                                )}
                                                {item.currency !== budgetCurrency && exchangeRates[item.currency] && (
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 11 }]}>
                                                        ≈ {formatBudgetAmount(toBudgetCurrency(item.price, item.currency))}
                                                    </Text>
                                                )}
                                                <View style={[styles.upRowBadge, { backgroundColor: urgencyBg }]}>
                                                    <Text style={[styles.upRowBadgeText, { color: urgencyColor }]}>{urgencyLabel}</Text>
                                                </View>
                                            </View>
                                        </Animated.View>
                                        </TouchableOpacity>
                                    );
                                })}
                                {thisWeekPayments.length > 4 && (
                                    <TouchableOpacity
                                        style={[styles.upMoreBtn, { borderColor: colors.border }]}
                                        onPress={() => navigation.navigate('Calendar')}
                                    >
                                        <Text style={[styles.upMoreText, { color: colors.textSec }]}>
                                            +{thisWeekPayments.length - 4} daha  →
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}

                        {/* BU AY */}
                        {thisMonthPayments.length > 0 && (
                            <>
                                <View style={[styles.upGroupHeader, { marginTop: thisWeekPayments.length > 0 ? 14 : 0 }]}>
                                    <View style={[styles.upGroupDot, { backgroundColor: colors.accent }]} />
                                    <Text style={[styles.upGroupTitle, { color: colors.textSec }]}>{secondaryUpcomingGroupTitle}</Text>
                                    <View style={{ flex: 1 }} />
                                    <Text style={[styles.upGroupTotal, { color: colors.textMain }]}>
                                        {formatBudgetAmount(thisMonthTotal)}
                                    </Text>
                                </View>
                                {thisMonthPayments.slice(0, 4).map((item, idx) => {
                                    const daysLeft = item._daysLeft;
                                    const animIdx = thisWeekPayments.length + idx;
                                    const anim = getCardAnim(animIdx);
                                    const itemColor = item.colorCode || colors.primary;
                                    const catalogLogoUrl = catalogItems.find(c => c.id === item.catalogId)?.logoUrl;
                                    const partnerCount = (item.sharedWith?.length ?? 0) + (item.sharedGuests?.length ?? 0);
                                    const myShare = partnerCount > 0 ? item.price / (partnerCount + 1) : null;
                                    const contractDaysLeft = item.hasContract && item.contractEndDate
                                        ? Math.ceil((new Date(item.contractEndDate).getTime() - Date.now()) / 86400000)
                                        : null;
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            activeOpacity={0.86}
                                            onPress={() => setDetailSub(item)}
                                        >
                                        <Animated.View
                                            style={[styles.upRow, {
                                                backgroundColor: colors.cardBg,
                                                borderColor: colors.border,
                                                opacity: anim,
                                                transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
                                            }]}
                                        >
                                            <View style={[styles.upRowIcon, { backgroundColor: itemColor + '20', overflow: 'hidden' }]}>
                                                <UpcomingPaymentLogo logoUrl={catalogLogoUrl} colorCode={itemColor} name={item.name} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.upRowName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                                                <View style={styles.upRowMeta}>
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec }]}>
                                                        {item.billingPeriod === 'Yearly'
                                                            ? `${item.billingDay}. her yıl`
                                                            : `${item.billingDay}. her ay`}
                                                    </Text>
                                                    {item.billingPeriod === 'Yearly' && (
                                                        <View style={{ marginLeft: 5, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, backgroundColor: colors.accent + '22' }}>
                                                            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.accent }}>YILLIK</Text>
                                                        </View>
                                                    )}
                                                    {contractDaysLeft !== null && contractDaysLeft <= 30 && (
                                                        <View style={{ marginLeft: 6, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, backgroundColor: contractDaysLeft <= 0 ? (colors.error + '20') : (colors.orange + '20') }}>
                                                            <Text style={{ fontSize: 10, fontWeight: '700', color: contractDaysLeft <= 0 ? colors.error : colors.orange }}>
                                                                {contractDaysLeft <= 0 ? 'Kontrat bitti' : `Kontrat ${contractDaysLeft}g`}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                {!!item.notes && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                        <Ionicons name="document-text-outline" size={10} color={colors.textSec} />
                                                        <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 10 }]} numberOfLines={1}>
                                                            {item.notes}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.upRowPrice, { color: colors.textMain }]}>
                                                    {formatCurrencyAmount(item.price, item.currency, {
                                                        minimumFractionDigits: item.currency === 'TRY' ? 0 : 2,
                                                        maximumFractionDigits: item.currency === 'TRY' ? 0 : 2,
                                                    })}
                                                </Text>
                                                {myShare !== null && (
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 11 }]}>
                                                        Payınız: {formatCurrencyAmount(myShare, item.currency, {
                                                            minimumFractionDigits: item.currency === 'TRY' ? 0 : 2,
                                                            maximumFractionDigits: item.currency === 'TRY' ? 0 : 2,
                                                        })}
                                                    </Text>
                                                )}
                                                {item.currency !== budgetCurrency && exchangeRates[item.currency] && (
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 11 }]}>
                                                        ≈ {formatBudgetAmount(toBudgetCurrency(item.price, item.currency))}
                                                    </Text>
                                                )}
                                                <View style={[styles.upRowBadge, { backgroundColor: colors.inputBg }]}>
                                                    <Text style={[styles.upRowBadgeText, { color: colors.primary }]}>{daysLeft} gün</Text>
                                                </View>
                                            </View>
                                        </Animated.View>
                                        </TouchableOpacity>
                                    );
                                })}
                                {thisMonthPayments.length > 4 && (
                                    <TouchableOpacity
                                        style={[styles.upMoreBtn, { borderColor: colors.border }]}
                                        onPress={() => navigation.navigate('Calendar')}
                                    >
                                        <Text style={[styles.upMoreText, { color: colors.textSec }]}>
                                            +{thisMonthPayments.length - 4} daha  →
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                )}

            </ScrollView>

            {/* FAB — Abonelik Ekle */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.accent }]}
                onPress={() => setBottomSheetVisible(true)}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>

            {/* BOTTOM SHEET */}
            <Modal
                visible={bottomSheetVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setBottomSheetVisible(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
                    activeOpacity={1}
                    onPress={() => setBottomSheetVisible(false)}
                />
                <View style={[styles.bottomSheet, { backgroundColor: colors.cardBg }]}>
                    <View style={[styles.bottomSheetHandle, { backgroundColor: colors.border }]} />
                    <Text style={[styles.bottomSheetTitle, { color: colors.textMain }]}>Abonelik Ekle</Text>

                    <TouchableOpacity
                        style={[styles.bottomSheetOption, { backgroundColor: colors.inputBg }]}
                        onPress={() => {
                            setBottomSheetVisible(false);
                            navigation.navigate('Discover');
                        }}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#4F46E5', '#6D28D9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.bottomSheetOptionIcon}
                        >
                            <Ionicons name="compass" size={22} color="#FFF" />
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.bottomSheetOptionTitle, { color: colors.textMain }]}>Katalogdan Seç</Text>
                            <Text style={[styles.bottomSheetOptionSub, { color: colors.textSec }]}>50+ popüler servis hazır, tek dokunuşla ekle</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.bottomSheetOption, { backgroundColor: colors.inputBg }]}
                        onPress={() => {
                            setBottomSheetVisible(false);
                            handleCreateCustom();
                        }}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.bottomSheetOptionIcon, { backgroundColor: colors.accent + '22' }]}>
                            <Ionicons name="create-outline" size={22} color={colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.bottomSheetOptionTitle, { color: colors.textMain }]}>Kendin Oluştur</Text>
                            <Text style={[styles.bottomSheetOptionSub, { color: colors.textSec }]}>Listede olmayan bir servis ekle</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* MODALS */}
            {/* Tek Bir Modal, hem manuel hem katalog için */}
            <AddSubscriptionModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedCatalogItem(null);
                }}
                onSaved={() => {
                    setModalVisible(false);
                    setSelectedCatalogItem(null);
                    (navigation as any).navigate('MySubscriptions');
                }}
                selectedCatalogItem={selectedCatalogItem}
                // subscriptionToEdit prop'u boş, çünkü yeni ekleme yapıyoruz
            />

            <AddSubscriptionModal
                visible={!!editingSub}
                onClose={() => {
                    setEditingSub(null);
                }}
                selectedCatalogItem={null}
                subscriptionToEdit={editingSub}
            />

            <SubscriptionDetailModal
                visible={!!detailSub}
                subscription={detailSub}
                onClose={() => setDetailSub(null)}
                onEdit={handleEditFromDetail}
            />

            <UsageSurveyModal
                visible={!!surveySub}
                subscription={surveySub}
                onClose={() => setSurveySub(null)}
                onResponse={(status) => {
                    if (surveySub) logUsage(surveySub.id, status);
                    setSurveySub(null);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: Platform.OS === 'ios' ? 24 : 20,
        width: 58,
        height: 58,
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    greeting: { fontSize: 14, fontWeight: '500' },
    username: { fontSize: 22, fontWeight: '800' },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: '700' },

    dashboardCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    dashDecorCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: -40,
        right: -30,
    },
    dashTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    dashLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 1.2 },
    dashValue: { color: '#FFF', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
    dashSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 6 },
    dashCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    dashCountText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600', marginLeft: 4 },
    budgetBox: { alignItems: 'flex-end' },
    budgetLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
    budgetValue: { color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 2 },
    budgetRemain: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '500', marginTop: 2, textAlign: 'right' },

    progressSection: { marginTop: 20 },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    progressFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 6 },
    progressDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    progressText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700' },
    billingSplitRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
    billingSplitCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    billingSplitLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
    billingSplitValue: { color: '#FFF', fontSize: 18, fontWeight: '800', marginTop: 6 },
    billingSplitMeta: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '600', marginTop: 4, lineHeight: 16 },
    pendingInfoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    pendingInfoText: { color: 'rgba(255,255,255,0.88)', fontSize: 11, fontWeight: '600', lineHeight: 17, flex: 1 },

    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },

    upcomingCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    upcomingCountText: { fontSize: 12, fontWeight: '700' },

    calendarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
    },
    calendarBtnText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
    monthSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
    },
    monthSummaryLabel: { flex: 1, fontSize: 12, fontWeight: '500' },
    monthSummaryValue: { fontSize: 14, fontWeight: '800' },

    upGroupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    upGroupDot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
    upGroupTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
    upGroupTotal: { fontSize: 14, fontWeight: '800' },

    upRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
        overflow: 'hidden',
    },
    upRowStripe: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    upRowIcon: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    upRowIconText: { fontSize: 16, fontWeight: '800' },
    upRowName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    upRowMeta: { flexDirection: 'row', alignItems: 'center' },
    upRowCycle: { fontSize: 11, fontWeight: '500' },
    upRowPrice: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
    upRowBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    upRowBadgeText: { fontSize: 11, fontWeight: '700' },

    upMoreBtn: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 2,
        borderStyle: 'dashed',
    },
    upMoreText: { fontSize: 13, fontWeight: '600' },

    // BOTTOM SHEET
    bottomSheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        gap: 12,
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    bottomSheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 14,
    },
    bottomSheetOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSheetOptionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    bottomSheetOptionSub: { fontSize: 12 },

});
