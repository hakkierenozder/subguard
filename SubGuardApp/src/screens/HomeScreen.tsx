import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCatalogStore } from '../store/useCatalogStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CatalogItem, UserSubscription } from '../types';
import { RootStackParamList } from '../../App';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import UsageSurveyModal from '../components/UsageSurveyModal';
import CatalogExplore from '../components/CatalogExplore';
import EmptyState from '../components/EmptyState';
import agent from '../api/agent';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../constants/theme';

// ─── Akıllı Öneri tipi ─────────────────────────────────────────────────
interface Suggestion {
    id: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    accentColor: string;
    title: string;
    subtitle: string;
    onPress: () => void;
}

export default function HomeScreen() {
    const colors = useThemeColors();
    const isDarkMode = useSettingsStore((state) => state.isDarkMode);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Store'lar
    const { fetchCatalog } = useCatalogStore();
    const {
        subscriptions,
        loading,
        fetchUserSubscriptions,
        getTotalExpense,
        getPendingSurvey,
        logUsage
    } = useUserSubscriptionStore();

    // State'ler
    const [userName, setUserName] = useState('');
    
    // MODAL YÖNETİMİ (Tek merkezden)
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);

    const [refreshing, setRefreshing] = useState(false);
    const [surveySub, setSurveySub] = useState<UserSubscription | null>(null);
    const [monthlyBudget, setMonthlyBudget] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Dashboard + profil paralel çek
            const [dashRes, profileRes] = await Promise.allSettled([
                agent.Dashboard.get(30),
                agent.Auth.getProfile(),
            ]);

            if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
                setUserName(profileRes.value.data.fullName);
                setMonthlyBudget(profileRes.value.data.monthlyBudget || 0);
            }

            // Dashboard'dan bütçe bilgisi varsa profil değerini override et
            // DashboardDto yapısı: { budgetSummary: { monthlyBudget, ... } }
            const budgetSummary = dashRes.status === 'fulfilled'
                ? dashRes.value?.data?.budgetSummary
                : null;
            if (budgetSummary?.monthlyBudget) {
                setMonthlyBudget(Number(budgetSummary.monthlyBudget));
            }
        } catch (e) { }

        await Promise.all([
            fetchCatalog(),
            fetchUserSubscriptions(),
        ]);
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
            setTimeout(() => setSurveySub(pending), 1500);
        }
    };

    // --- Abonelik Ekleme Fonksiyonları ---
    
    // 1. Katalogdan Seçilince
    const handleSelectFromCatalog = (item: CatalogItem) => {
        setSelectedCatalogItem(item);
        setModalVisible(true);
    };

    // 2. Manuel (Özel) Ekleme Butonuna Basılınca
    const handleCreateCustom = () => {
        setSelectedCatalogItem(null); // Katalog öğesi yok, yani Custom mod
        setModalVisible(true);
    };

    // Hesaplamalar
    const totalExpense = getTotalExpense();
    const activeCount = subscriptions.filter(s => s.isActive !== false).length;
    const budgetPercentage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
    const isOverBudget = totalExpense > monthlyBudget;

    // Bütçe yüzdesine göre renk (yeşil → sarı → turuncu → kırmızı)
    const getBudgetBarColor = () => {
        if (budgetPercentage >= 100) return '#EF4444';
        if (budgetPercentage >= 80)  return '#F97316';
        if (budgetPercentage >= 60)  return '#FBBF24';
        return '#34D399';
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

    const today = new Date().getDate();

    const getDaysLeft = (billingDay: number) => {
        let d = billingDay - today;
        if (d < 0) d += 30;
        return d;
    };

    const sortedPayments = [...subscriptions]
        .filter(sub => sub.isActive !== false)
        .sort((a, b) => getDaysLeft(a.billingDay) - getDaysLeft(b.billingDay));

    const thisWeekPayments  = sortedPayments.filter(s => getDaysLeft(s.billingDay) <= 7);
    const thisMonthPayments = sortedPayments.filter(s => getDaysLeft(s.billingDay) > 7 && getDaysLeft(s.billingDay) <= 30);

    const thisWeekTotal  = thisWeekPayments.reduce((sum, s) => sum + s.price, 0);
    const thisMonthTotal = thisMonthPayments.reduce((sum, s) => sum + s.price, 0);

    // Quick Stats hesaplamaları
    const avgPerSub = activeCount > 0 ? totalExpense / activeCount : 0;
    const categoryCount = new Set(subscriptions.filter(s => s.isActive !== false).map(s => s.category)).size;

    // Stats kart animasyonları
    const statsAnims = useRef(
        Array.from({ length: 4 }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        statsAnims.forEach(a => a.setValue(0));
        Animated.stagger(80, statsAnims.map(a =>
            Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 })
        )).start();
    }, [subscriptions]);

    // ─── Akıllı Öneriler ──────────────────────────────────────────────────
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"

    const suggestions = useMemo<Suggestion[]>(() => {
        const result: Suggestion[] = [];

        // 1. Bütçe uyarıları
        if (monthlyBudget > 0) {
            if (budgetPercentage >= 100) {
                result.push({
                    id: 'budget_exceeded',
                    icon: 'warning-outline',
                    iconColor: '#EF4444',
                    iconBg: '#FEE2E2',
                    accentColor: '#EF4444',
                    title: 'Bütçe Aşıldı!',
                    subtitle: `Bu ay ${(totalExpense - monthlyBudget).toFixed(0)} ₺ fazla harcadınız`,
                    onPress: () => (navigation as any).navigate('Budget'),
                });
            } else if (budgetPercentage >= 90) {
                result.push({
                    id: 'budget_90',
                    icon: 'trending-up-outline',
                    iconColor: '#F97316',
                    iconBg: '#FFEDD5',
                    accentColor: '#F97316',
                    title: 'Bütçe Limitine Yaklaşıyorsunuz',
                    subtitle: `Bütçenizin %${budgetPercentage.toFixed(0)}'ini kullandınız`,
                    onPress: () => (navigation as any).navigate('Budget'),
                });
            } else if (budgetPercentage >= 80) {
                result.push({
                    id: 'budget_80',
                    icon: 'alert-circle-outline',
                    iconColor: '#FBBF24',
                    iconBg: '#FEF9C3',
                    accentColor: '#FBBF24',
                    title: 'Bütçenizi Takip Edin',
                    subtitle: `Bütçenizin %${budgetPercentage.toFixed(0)}'ini kullandınız`,
                    onPress: () => (navigation as any).navigate('Budget'),
                });
            }
        }

        // 2. Kullanılmayan abonelikler
        const unusedSubs = subscriptions.filter(s => {
            if (s.isActive === false) return false;
            const history = s.usageHistory ?? [];
            if (history.length === 0) return false; // Henüz hiç survey görmemiş
            const thisMonthLog = history.find(h => h.month === currentMonth);
            return thisMonthLog?.status === 'none';
        });

        if (unusedSubs.length >= 2) {
            result.push({
                id: 'unused_multi',
                icon: 'eye-off-outline',
                iconColor: '#8B5CF6',
                iconBg: '#EDE9FE',
                accentColor: '#8B5CF6',
                title: `${unusedSubs.length} Abonelik Kullanılmıyor`,
                subtitle: 'Bu ay kullanım kaydı yok, iptal etmeyi düşünebilirsiniz',
                onPress: () => (navigation as any).navigate('Subscriptions'),
            });
        } else if (unusedSubs.length === 1) {
            result.push({
                id: 'unused_single',
                icon: 'eye-off-outline',
                iconColor: '#8B5CF6',
                iconBg: '#EDE9FE',
                accentColor: '#8B5CF6',
                title: `"${unusedSubs[0].name}" Kullanılmıyor`,
                subtitle: 'Bu ay hiç kullanım kaydı yok',
                onPress: () => (navigation as any).navigate('Subscriptions'),
            });
        }

        // 3. En pahalı kategori (toplam harcamanın %50'sini geçiyorsa)
        const activeSubs = subscriptions.filter(s => s.isActive !== false);
        if (activeSubs.length >= 3 && totalExpense > 0) {
            const catTotals: Record<string, number> = {};
            activeSubs.forEach(s => {
                if (s.category) catTotals[s.category] = (catTotals[s.category] ?? 0) + s.price;
            });
            const top = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
            if (top && top[1] / totalExpense > 0.5) {
                result.push({
                    id: 'top_category',
                    icon: 'pie-chart-outline',
                    iconColor: '#0EA5E9',
                    iconBg: '#E0F2FE',
                    accentColor: '#0EA5E9',
                    title: `${top[0]} En Büyük Harcama Kalemin`,
                    subtitle: `Toplam harcamanın %${((top[1] / totalExpense) * 100).toFixed(0)}'i bu kategoride (${top[1].toFixed(0)} ₺)`,
                    onPress: () => (navigation as any).navigate('Reports'),
                });
            }
        }

        return result.slice(0, 3);
    }, [subscriptions, budgetPercentage, monthlyBudget, totalExpense, currentMonth]);

    // Öneri kart animasyonları
    const suggestAnims = useRef(
        Array.from({ length: 3 }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        suggestAnims.forEach(a => a.setValue(0));
        Animated.stagger(100, suggestAnims.slice(0, suggestions.length).map(a =>
            Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 55, friction: 8 })
        )).start();
    }, [suggestions.length]);

    // Animasyon değerleri (max 8 kart)
    const cardAnims = useRef(
        Array.from({ length: 8 }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const anims = cardAnims.slice(0, sortedPayments.length).map((anim, i) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 350,
                delay: i * 60,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            })
        );
        cardAnims.forEach(a => a.setValue(0));
        Animated.stagger(60, anims).start();
    }, [subscriptions]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar 
                barStyle={isDarkMode ? "light-content" : "dark-content"} 
                backgroundColor={colors.bg} 
            />

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
                    <View style={[styles.avatar, { backgroundColor: colors.inputBg }]}>
                        <Text style={[styles.avatarText, { color: colors.primary }]}>{userName?.charAt(0).toUpperCase()}</Text>
                    </View>
                </View>

                {/* 2. DASHBOARD CARD */}
                <LinearGradient
                    colors={isOverBudget ? ['#7F1D1D', '#DC2626'] : [colors.primaryDark, colors.primary]}
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

                {/* 3. BOŞ DURUM */}
                {!loading && subscriptions.length === 0 && (
                    <EmptyState
                        icon="albums-outline"
                        title="Henüz abonelik yok"
                        description="İlk aboneliğini ekle, harcamalarını takip etmeye başla."
                        actionLabel="Abonelik Ekle"
                        onAction={handleCreateCustom}
                    />
                )}

                {/* 4. QUICK STATS */}
                {activeCount > 0 && (
                    <View style={styles.statsGrid}>
                        {[
                            {
                                icon: 'layers-outline',
                                value: activeCount.toString(),
                                label: 'Aktif Abonelik',
                                color: '#6366F1',
                                bg: '#EEF2FF',
                            },
                            {
                                icon: 'trending-up-outline',
                                value: `${avgPerSub.toFixed(0)}₺`,
                                label: 'Aylık Ortalama',
                                color: '#10B981',
                                bg: '#D1FAE5',
                            },
                            {
                                icon: 'alarm-outline',
                                value: thisWeekPayments.length.toString(),
                                label: 'Bu Hafta Ödeme',
                                color: thisWeekPayments.length > 0 ? '#F97316' : '#94A3B8',
                                bg: thisWeekPayments.length > 0 ? '#FFEDD5' : colors.inputBg,
                            },
                            {
                                icon: 'grid-outline',
                                value: categoryCount.toString(),
                                label: 'Kategori',
                                color: '#0EA5E9',
                                bg: '#E0F2FE',
                            },
                        ].map((stat, i) => (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.statCardSlot,
                                    {
                                        opacity: statsAnims[i],
                                        transform: [{
                                            scale: statsAnims[i].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.85, 1],
                                            }),
                                        }],
                                    },
                                ]}
                            >
                                <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                                    <View style={[styles.statIconWrap, { backgroundColor: isDarkMode ? stat.color + '25' : stat.bg }]}>
                                        <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                                    </View>
                                    <Text style={[styles.statValue, { color: colors.textMain }]}>{stat.value}</Text>
                                    <Text style={[styles.statLabel, { color: colors.textSec }]}>{stat.label}</Text>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                )}

                {/* 4. AKILLI ÖNERİLER */}
                {suggestions.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.suggestionTitleRow}>
                                <View style={styles.suggestionTitleIcon}>
                                    <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
                                </View>
                                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Akıllı Öneriler</Text>
                            </View>
                            <Text style={[styles.suggestionCount, { color: colors.textSec }]}>
                                {suggestions.length} öneri
                            </Text>
                        </View>

                        {suggestions.map((s, i) => {
                            const anim = suggestAnims[i] ?? new Animated.Value(1);
                            return (
                                <Animated.View
                                    key={s.id}
                                    style={{
                                        opacity: anim,
                                        transform: [{
                                            translateY: anim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [12, 0],
                                            }),
                                        }],
                                        marginBottom: 10,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={[styles.suggestionCard, {
                                            backgroundColor: colors.cardBg,
                                            borderColor: colors.border,
                                        }]}
                                        onPress={s.onPress}
                                        activeOpacity={0.72}
                                    >
                                        {/* Sol renkli şerit */}
                                        <View style={[styles.suggestionStripe, { backgroundColor: s.accentColor }]} />

                                        {/* Icon */}
                                        <View style={[styles.suggestionIconWrap, {
                                            backgroundColor: isDarkMode ? s.iconColor + '22' : s.iconBg,
                                        }]}>
                                            <Ionicons name={s.icon as any} size={20} color={s.iconColor} />
                                        </View>

                                        {/* Metin */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.suggestionTitle, { color: colors.textMain }]}>
                                                {s.title}
                                            </Text>
                                            <Text style={[styles.suggestionSubtitle, { color: colors.textSec }]} numberOfLines={2}>
                                                {s.subtitle}
                                            </Text>
                                        </View>

                                        {/* Ok */}
                                        <View style={[styles.suggestionArrow, { backgroundColor: isDarkMode ? s.iconColor + '22' : s.iconBg }]}>
                                            <Ionicons name="chevron-forward" size={14} color={s.iconColor} />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                )}

                {/* 6. YAKLAŞAN ÖDEMELER */}
                {sortedPayments.length > 0 && (
                    <View style={styles.section}>
                        {/* Section Header */}
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Yaklaşan Ödemeler</Text>
                            <TouchableOpacity
                                onPress={() => (navigation as any).navigate('Calendar')}
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
                                    <View style={[styles.upGroupDot, { backgroundColor: '#EF4444' }]} />
                                    <Text style={[styles.upGroupTitle, { color: colors.textSec }]}>Bu Hafta</Text>
                                    <View style={{ flex: 1 }} />
                                    <Text style={[styles.upGroupTotal, { color: colors.textMain }]}>
                                        {thisWeekTotal.toFixed(2)} ₺
                                    </Text>
                                </View>
                                {thisWeekPayments.map((item, idx) => {
                                    const daysLeft = getDaysLeft(item.billingDay);
                                    const urgencyColor = daysLeft === 0 ? '#EF4444' : daysLeft <= 2 ? '#EF4444' : '#F97316';
                                    const urgencyBg   = daysLeft <= 2 ? '#FEE2E2' : '#FFEDD5';
                                    const urgencyLabel = daysLeft === 0 ? 'Bugün!' : daysLeft === 1 ? 'Yarın!' : `${daysLeft} gün`;
                                    const anim = cardAnims[idx] ?? new Animated.Value(1);
                                    return (
                                        <Animated.View
                                            key={item.id}
                                            style={[styles.upRow, {
                                                backgroundColor: colors.cardBg,
                                                borderColor: daysLeft <= 2 ? '#FCA5A5' : '#FDBA74',
                                                opacity: anim,
                                                transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
                                            }]}
                                        >
                                            {daysLeft <= 2 && <View style={styles.upRowStripe} />}
                                            <View style={[styles.upRowIcon, { backgroundColor: (item.colorCode || colors.primary) + '20' }]}>
                                                <Text style={[styles.upRowIconText, { color: item.colorCode || colors.primary }]}>
                                                    {item.name.charAt(0)}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.upRowName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                                                <View style={styles.upRowMeta}>
                                                    <Text style={[styles.upRowCycle, { color: colors.textSec }]}>
                                                        {item.billingDay}. her ay
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.upRowPrice, { color: colors.textMain }]}>
                                                    {item.price} {item.currency}
                                                </Text>
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
                                    const daysLeft = getDaysLeft(item.billingDay);
                                    const animIdx = thisWeekPayments.length + idx;
                                    const anim = cardAnims[animIdx] ?? new Animated.Value(1);
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
                                            <View style={[styles.upRowIcon, { backgroundColor: (item.colorCode || colors.primary) + '20' }]}>
                                                <Text style={[styles.upRowIconText, { color: item.colorCode || colors.primary }]}>
                                                    {item.name.charAt(0)}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.upRowName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                                                <Text style={[styles.upRowCycle, { color: colors.textSec }]}>
                                                    {item.billingDay}. her ay
                                                </Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.upRowPrice, { color: colors.textMain }]}>
                                                    {item.price} {item.currency}
                                                </Text>
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
                                        onPress={() => (navigation as any).navigate('Calendar')}
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

                {/* 7. YENİ ABONELİK EKLEME ALANI (BÜTÜNLEŞİK TASARIM) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Yeni Abonelik Ekle</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Discover')}
                            style={[styles.discoverBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                        >
                            <Ionicons name="compass-outline" size={14} color={colors.accent} />
                            <Text style={[styles.discoverBtnText, { color: colors.accent }]}>Keşfet</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* ÖZEL ABONELİK (MANUEL) BUTONU - YENİ TASARIM */}
                    <TouchableOpacity 
                        style={[styles.createCustomCard, { borderColor: colors.border, backgroundColor: colors.cardBg }]} 
                        onPress={handleCreateCustom}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.createIconCircle, { backgroundColor: colors.inputBg }]}>
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={[styles.createCustomTitle, { color: colors.textMain }]}>Kendin Oluştur</Text>
                            <Text style={[styles.createCustomSub, { color: colors.textSec }]}>Listede olmayan bir servisi ekle</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.inactive} />
                    </TouchableOpacity>

                    {/* KATALOG LİSTESİ */}
                    <Text style={[styles.subSectionTitle, { color: colors.textSec }]}>veya popüler servislerden seç</Text>
                    <CatalogExplore onSelect={handleSelectFromCatalog} isEmbedded={true} />
                </View>

            </ScrollView>

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
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },

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
    subSectionTitle: { fontSize: 13, fontWeight: '500', marginTop: 16, marginBottom: 10, marginLeft: 4 },
    discoverBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
    },
    discoverBtnText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },

    upcomingCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    upcomingCountText: { fontSize: 12, fontWeight: '700' },

    // QUICK STATS
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        marginHorizontal: -6,
    },
    statCardSlot: {
        width: '50%',
        paddingHorizontal: 6,
        marginBottom: 12,
    },
    statCard: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        alignItems: 'flex-start',
    },
    statIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 2 },
    statLabel: { fontSize: 12, fontWeight: '500' },

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
        backgroundColor: '#EF4444',
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

    // ─── AKILLI ÖNERİLER ────────────────────────────────────────────────────
    suggestionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionTitleIcon: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    suggestionCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        overflow: 'hidden',
    },
    suggestionStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    suggestionIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        marginRight: 12,
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 3,
    },
    suggestionSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
    },
    suggestionArrow: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },

    // YENİ "KENDİN OLUŞTUR" KARTI
    createCustomCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'dashed', // Kesik çizgili kenarlık
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

});