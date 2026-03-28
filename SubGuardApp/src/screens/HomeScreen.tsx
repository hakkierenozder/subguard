import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity, Animated, Easing, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { CatalogItem, UserSubscription } from '../types';
import { RootStackParamList } from '../../App';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import UsageSurveyModal from '../components/UsageSurveyModal';
import EmptyState from '../components/EmptyState';
import { HomeSkeletonLoader } from '../components/SkeletonLoader'; // #42
import agent from '../api/agent';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, THEME } from '../constants/theme';
import { useCatalogStore } from '../store/useCatalogStore';
import { getDaysLeftForSub } from '../utils/dateUtils';
import { CurrencyService } from '../utils/CurrencyService';

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
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const { catalogItems, fetchCatalog } = useCatalogStore();

    // Store'lar
    const {
        subscriptions,
        loading,
        fetchUserSubscriptions,
        getTotalExpense,
        getPendingSurvey,
        logUsage,
        exchangeRates,
    } = useUserSubscriptionStore();

    // State'ler
    const [userName, setUserName] = useState('');
    
    // MODAL YÖNETİMİ (Tek merkezden)
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);

    const [refreshing, setRefreshing] = useState(false);
    const [surveySub, setSurveySub] = useState<UserSubscription | null>(null);
    const [inactiveStats, setInactiveStats] = useState({ paused: 0, cancelled: 0 });
    const [error, setError] = useState(false); // [29] hata durumu
    const surveyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // [30] timeout ref
    const { monthlyBudget, setMonthlyBudget } = useSettingsStore();

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
                setInactiveStats({
                    paused:    d.pausedCount    ?? 0,
                    cancelled: d.cancelledCount ?? 0,
                });
            }

            // Bütçe → dashboard tek kaynak (profil fallback)
            const budgetSummary = dashRes.status === 'fulfilled'
                ? dashRes.value?.data?.budgetSummary
                : null;
            if (budgetSummary?.monthlyBudget) {
                setMonthlyBudget(Number(budgetSummary.monthlyBudget));
            } else if (profileRes.status === 'fulfilled' && profileRes.value?.data?.monthlyBudget) {
                setMonthlyBudget(profileRes.value.data.monthlyBudget);
            }
        } catch (e) {
            setError(true); // [29] hata durumunu işaretle
        }

        await fetchUserSubscriptions();
        checkSurvey();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const checkSurvey = () => {
        const pending = getPendingSurvey();
        if (pending) {
            if (surveyTimerRef.current) clearTimeout(surveyTimerRef.current); // [30]
            surveyTimerRef.current = setTimeout(() => setSurveySub(pending), 1500); // [30]
        }
    };

    // --- Abonelik Ekleme ---
    const handleCreateCustom = () => {
        setSelectedCatalogItem(null);
        setModalVisible(true);
    };

    // Hesaplamalar
    const totalExpense = getTotalExpense();
    const activeCount = subscriptions.filter(s => s.isActive !== false).length;
    const budgetPercentage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
    const isOverBudget = totalExpense > monthlyBudget;

    // Bütçe yüzdesine göre renk (yeşil → sarı → turuncu → kırmızı)
    const getBudgetBarColor = () => {
        if (budgetPercentage >= 100) return colors.error;
        if (budgetPercentage >= 80)  return colors.orange;
        if (budgetPercentage >= 60)  return colors.warning;
        return colors.success;
    };

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

    const sortedPayments = [...subscriptions]
        .filter(sub => sub.isActive !== false)
        .sort((a, b) => getDaysLeftForSub(a.billingDay, a.billingPeriod, a.createdDate) - getDaysLeftForSub(b.billingDay, b.billingPeriod, b.createdDate));

    const thisWeekPayments  = sortedPayments.filter(s => getDaysLeftForSub(s.billingDay, s.billingPeriod, s.createdDate) <= 7);
    const thisMonthPayments = sortedPayments.filter(s => {
        const d = getDaysLeftForSub(s.billingDay, s.billingPeriod, s.createdDate);
        return d > 7 && d <= 30;
    });

    const thisWeekTotal  = thisWeekPayments.reduce((sum, s) => sum + s.price, 0);
    const thisMonthTotal = thisMonthPayments.reduce((sum, s) => sum + s.price, 0);

    const categoryCount = new Set(subscriptions.filter(s => s.isActive !== false).map(s => s.category)).size;

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
        const anims = sortedPayments.map((_, i) =>
            Animated.timing(getCardAnim(i), {
                toValue: 1,
                duration: 350,
                delay: i * 60,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            })
        );
        Animated.stagger(60, anims).start();
    }, [subscriptions]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar 
                barStyle={isDarkMode ? "light-content" : "dark-content"} 
                backgroundColor={colors.bg} 
            />

            {/* [29] Hata durumu banner */}
            {error && (
                <TouchableOpacity
                    onPress={loadData}
                    style={{ backgroundColor: colors.error + '22', padding: 10, marginHorizontal: 16, marginTop: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                    <Text style={{ color: colors.error, fontSize: 13, flex: 1 }}>Veriler yüklenemedi. Tekrar denemek için dokun.</Text>
                </TouchableOpacity>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
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
                                color={colors.primary}
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
                        <View style={[styles.avatar, { backgroundColor: colors.inputBg }]}>
                            <Text style={[styles.avatarText, { color: colors.primary }]}>{userName?.charAt(0).toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* 2. DASHBOARD CARD */}
                <LinearGradient
                    colors={isOverBudget ? [colors.error + 'CC', colors.error] : [colors.primaryDark, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.dashboardCard, { shadowColor: isDarkMode ? '#000' : colors.primary }]}
                >
                    {/* Dekoratif daire */}
                    <View style={styles.dashDecorCircle} />

                    <View style={styles.dashTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.dashLabel}>AYLIK TOPLAM</Text>
                            <Text style={styles.dashValue}>{totalExpense.toFixed(2)} ₺</Text>
                            <View style={styles.dashSubRow}>
                                <View style={styles.dashCountBadge}>
                                    <Ionicons name="apps-outline" size={11} color="rgba(255,255,255,0.9)" />
                                    <Text style={styles.dashCountText}>{activeCount} abonelik</Text>
                                </View>
                                {categoryCount > 0 && (
                                    <View style={styles.dashCountBadge}>
                                        <Ionicons name="grid-outline" size={11} color="rgba(255,255,255,0.9)" />
                                        <Text style={styles.dashCountText}>{categoryCount} kategori</Text>
                                    </View>
                                )}
                                {thisWeekPayments.length > 0 && (
                                    <View style={[styles.dashCountBadge, { backgroundColor: 'rgba(249,115,22,0.35)' }]}>
                                        <Ionicons name="alarm-outline" size={11} color="rgba(255,255,255,0.95)" />
                                        <Text style={styles.dashCountText}>{thisWeekPayments.length} bu hafta</Text>
                                    </View>
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
                                {monthlyBudget > 0 ? `${monthlyBudget} ₺` : '-'}
                            </Text>
                            {monthlyBudget > 0 && (
                                <Text style={styles.budgetRemain}>
                                    {isOverBudget
                                        ? `+${(totalExpense - monthlyBudget).toFixed(0)} ₺ aşım`
                                        : `${(monthlyBudget - totalExpense).toFixed(0)} ₺ kaldı`}
                                </Text>
                            )}
                        </View>
                    </View>

                    {monthlyBudget > 0 && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressBarBg}>
                                <Animated.View style={[
                                    styles.progressBarFill,
                                    { width: animatedWidth, backgroundColor: getBudgetBarColor() }
                                ]} />
                            </View>
                            <View style={styles.progressFooter}>
                                <View style={[styles.progressDot, { backgroundColor: getBudgetBarColor() }]} />
                                <Text style={styles.progressText}>
                                    {isOverBudget
                                        ? '⚠ Bütçe aşıldı!'
                                        : `%${budgetPercentage.toFixed(0)} kullanıldı`}
                                </Text>
                            </View>
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
                        onAction={handleCreateCustom}
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

                        {/* BU HAFTA */}
                        {thisWeekPayments.length > 0 && (
                            <>
                                <View style={styles.upGroupHeader}>
                                    <View style={[styles.upGroupDot, { backgroundColor: colors.error }]} />
                                    <Text style={[styles.upGroupTitle, { color: colors.textSec }]}>Bu Hafta</Text>
                                    <View style={{ flex: 1 }} />
                                    <Text style={[styles.upGroupTotal, { color: colors.textMain }]}>
                                        {thisWeekTotal.toFixed(2)} ₺
                                    </Text>
                                </View>
                                {thisWeekPayments.map((item, idx) => {
                                    const daysLeft = getDaysLeftForSub(item.billingDay, item.billingPeriod, item.createdDate);
                                    const urgencyColor = daysLeft <= 2 ? colors.error : colors.orange;
                                    const urgencyBg   = daysLeft <= 2 ? (colors.error + '20') : (colors.orange + '20');
                                    const urgencyLabel = daysLeft === 0 ? 'Bugün!' : daysLeft === 1 ? 'Yarın!' : `${daysLeft} gün`;
                                    const anim = getCardAnim(idx);
                                    const itemColor = item.colorCode || colors.primary;
                                    const catalogLogoUrl = catalogItems.find(c => c.id === item.catalogId)?.logoUrl;
                                    const partnerCount = item.sharedWith?.length ?? 0;
                                    const myShare = partnerCount > 0 ? item.price / (partnerCount + 1) : null;
                                    const contractDaysLeft = item.hasContract && item.contractEndDate
                                        ? Math.ceil((new Date(item.contractEndDate).getTime() - Date.now()) / 86400000)
                                        : null;
                                    return (
                                        <Animated.View
                                            key={item.id}
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
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 10, marginTop: 2 }]} numberOfLines={1}>
                                                        📝 {item.notes}
                                                    </Text>
                                                )}
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.upRowPrice, { color: colors.textMain }]}>
                                                    {CurrencyService.format(item.price, item.currency)}
                                                </Text>
                                                {myShare !== null && (
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 11 }]}>
                                                        Payınız: {CurrencyService.format(myShare, item.currency)}
                                                    </Text>
                                                )}
                                                {item.currency !== 'TRY' && exchangeRates[item.currency] && (
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 11 }]}>
                                                        ≈ {(item.price * exchangeRates[item.currency]).toFixed(0)} ₺
                                                    </Text>
                                                )}
                                                <View style={[styles.upRowBadge, { backgroundColor: urgencyBg }]}>
                                                    <Text style={[styles.upRowBadgeText, { color: urgencyColor }]}>{urgencyLabel}</Text>
                                                </View>
                                            </View>
                                        </Animated.View>
                                    );
                                })}
                            </>
                        )}

                        {/* BU AY */}
                        {thisMonthPayments.length > 0 && (
                            <>
                                <View style={[styles.upGroupHeader, { marginTop: thisWeekPayments.length > 0 ? 14 : 0 }]}>
                                    <View style={[styles.upGroupDot, { backgroundColor: colors.primary }]} />
                                    <Text style={[styles.upGroupTitle, { color: colors.textSec }]}>Bu Ay</Text>
                                    <View style={{ flex: 1 }} />
                                    <Text style={[styles.upGroupTotal, { color: colors.textMain }]}>
                                        {thisMonthTotal.toFixed(2)} ₺
                                    </Text>
                                </View>
                                {thisMonthPayments.slice(0, 4).map((item, idx) => {
                                    const daysLeft = getDaysLeftForSub(item.billingDay, item.billingPeriod, item.createdDate);
                                    const animIdx = thisWeekPayments.length + idx;
                                    const anim = getCardAnim(animIdx);
                                    const itemColor = item.colorCode || colors.primary;
                                    const catalogLogoUrl = catalogItems.find(c => c.id === item.catalogId)?.logoUrl;
                                    const partnerCount = item.sharedWith?.length ?? 0;
                                    const myShare = partnerCount > 0 ? item.price / (partnerCount + 1) : null;
                                    const contractDaysLeft = item.hasContract && item.contractEndDate
                                        ? Math.ceil((new Date(item.contractEndDate).getTime() - Date.now()) / 86400000)
                                        : null;
                                    return (
                                        <Animated.View
                                            key={item.id}
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
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 10, marginTop: 2 }]} numberOfLines={1}>
                                                        📝 {item.notes}
                                                    </Text>
                                                )}
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.upRowPrice, { color: colors.textMain }]}>
                                                    {CurrencyService.format(item.price, item.currency)}
                                                </Text>
                                                {myShare !== null && (
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 11 }]}>
                                                        Payınız: {CurrencyService.format(myShare, item.currency)}
                                                    </Text>
                                                )}
                                                {item.currency !== 'TRY' && exchangeRates[item.currency] && (
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec, fontSize: 11 }]}>
                                                        ≈ {(item.price * exchangeRates[item.currency]).toFixed(0)} ₺
                                                    </Text>
                                                )}
                                                <View style={[styles.upRowBadge, { backgroundColor: colors.inputBg }]}>
                                                    <Text style={[styles.upRowBadgeText, { color: colors.primary }]}>{daysLeft} gün</Text>
                                                </View>
                                            </View>
                                        </Animated.View>
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

                {/* 5. KEŞFET & ABONELİK EKLEME */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 12 }]}>Abonelik Ekle</Text>

                    {/* Katalog — PRIMARY aksiyon */}
                    <TouchableOpacity
                        style={styles.catalogCard}
                        onPress={() => navigation.navigate('Discover')}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={[colors.accent, colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.catalogCardGradient}
                        >
                            <View style={styles.catalogDecorCircle} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.catalogCardTitle}>Katalogdan Seç</Text>
                                <Text style={styles.catalogCardSub}>50+ popüler servis hazır, tek dokunuşla ekle</Text>
                            </View>
                            <View style={styles.catalogCardIconWrap}>
                                <Ionicons name="compass" size={30} color="rgba(255,255,255,0.95)" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Manuel ekleme — SECONDARY aksiyon */}
                    <TouchableOpacity
                        style={[styles.createCustomCard, { borderColor: colors.border, backgroundColor: colors.cardBg }]}
                        onPress={handleCreateCustom}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.createIconCircle, { backgroundColor: colors.inputBg }]}>
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.createCustomTitle, { color: colors.textMain }]}>Kendin Oluştur</Text>
                            <Text style={[styles.createCustomSub, { color: colors.textSec }]}>Listede olmayan bir servisi ekle</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.inactive} />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* FAB — Abonelik Ekle */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.accent }]}
                onPress={handleCreateCustom}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>

            {/* MODALS */}
            {/* Tek Bir Modal, hem manuel hem katalog için */}
            <AddSubscriptionModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedCatalogItem(null);
                }}
                selectedCatalogItem={selectedCatalogItem}
                // subscriptionToEdit prop'u boş, çünkü yeni ekleme yapıyoruz
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
    avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
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
    dashSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
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

    // "KENDİN OLUŞTUR" KARTI
    createCustomCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    createIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    createCustomTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    createCustomSub: { fontSize: 13 },

    // Katalog primary kart
    catalogCard: {
        borderRadius: 20,
        marginBottom: 10,
        overflow: 'hidden',
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    catalogCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        overflow: 'hidden',
    },
    catalogDecorCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.08)',
        top: -30,
        right: 40,
    },
    catalogCardTitle: { color: '#FFF', fontSize: 17, fontWeight: '800', marginBottom: 4 },
    catalogCardSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500', lineHeight: 17 },
    catalogCardIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },

});