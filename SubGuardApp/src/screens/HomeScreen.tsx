import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../store/useCatalogStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore'; // Tema için
import { CatalogItem, UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import UsageSurveyModal from '../components/UsageSurveyModal';
import CatalogExplore from '../components/CatalogExplore';
import agent from '../api/agent';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../constants/theme'; // Tema Hook

export default function HomeScreen() {
    const colors = useThemeColors(); // Dinamik Renkler
    const isDarkMode = useSettingsStore((state) => state.isDarkMode);

    // Store'lar
    const { fetchCatalog } = useCatalogStore();
    const {
        subscriptions,
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
            const profileRes = await agent.Auth.getProfile();
            if (profileRes?.data) {
                setUserName(profileRes.data.fullName);
                setMonthlyBudget(profileRes.data.monthlyBudget || 0);
            }
        } catch (e) { }

        await Promise.all([
            fetchCatalog(),
            fetchUserSubscriptions()
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
    const budgetPercentage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
    const isOverBudget = totalExpense > monthlyBudget;

    const upcomingPayments = [...subscriptions]
        .filter(sub => sub.isActive !== false)
        .sort((a, b) => {
            const today = new Date().getDate();
            const dayA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
            const dayB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
            return dayA - dayB;
        })
        .slice(0, 3);

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
                    colors={[colors.primaryDark, colors.primary]} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.dashboardCard, { shadowColor: isDarkMode ? '#000' : colors.primary }]}
                >
                    <View style={styles.dashTopRow}>
                        <View>
                            <Text style={styles.dashLabel}>AYLIK TOPLAM</Text>
                            <Text style={styles.dashValue}>{totalExpense.toFixed(2)} ₺</Text>
                        </View>
                        <View style={styles.budgetBox}>
                            <Text style={styles.budgetLabel}>HEDEF</Text>
                            <Text style={styles.budgetValue}>{monthlyBudget > 0 ? `${monthlyBudget} ₺` : '-'}</Text>
                        </View>
                    </View>

                    {monthlyBudget > 0 && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { 
                                    width: `${Math.min(budgetPercentage, 100)}%`,
                                    backgroundColor: isOverBudget ? colors.error : colors.success
                                }]} />
                            </View>
                            <Text style={styles.progressText}>
                                {isOverBudget ? 'Bütçe aşıldı' : `%${budgetPercentage.toFixed(0)} kullanıldı`}
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                {/* 3. YAKLAŞAN ÖDEMELER */}
                {upcomingPayments.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Yaklaşan Ödemeler</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                            {upcomingPayments.map((item) => {
                                const today = new Date().getDate();
                                let daysLeft = item.billingDay - today;
                                if (daysLeft < 0) daysLeft += 30;
                                
                                return (
                                    <View key={item.id} style={[styles.upcomingCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                                        <View style={[styles.upIcon, { backgroundColor: item.colorCode || colors.inputBg }]}>
                                            <Text style={styles.upIconText}>{item.name.charAt(0)}</Text>
                                        </View>
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={[styles.upName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                                            <Text style={[styles.upPrice, { color: colors.textSec }]}>{item.price} {item.currency}</Text>
                                        </View>
                                        <View style={[styles.upBadge, { backgroundColor: colors.inputBg }]}>
                                            <Text style={[styles.upBadgeText, { color: colors.primary }]}>{daysLeft} gün</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* 4. YENİ ABONELİK EKLEME ALANI (BÜTÜNLEŞİK TASARIM) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginBottom: 12, color: colors.textMain }]}>Yeni Abonelik Ekle</Text>
                    
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
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    dashTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    dashLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', marginBottom: 4, letterSpacing: 1 },
    dashValue: { color: '#FFF', fontSize: 32, fontWeight: '800' },
    budgetBox: { alignItems: 'flex-end' },
    budgetLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700' },
    budgetValue: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    
    progressSection: { marginTop: 24 },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 6, fontWeight: '600', textAlign: 'right' },

    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    subSectionTitle: { fontSize: 13, fontWeight: '500', marginTop: 16, marginBottom: 10, marginLeft: 4 },

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

    upcomingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginRight: 12,
        width: 200,
        borderWidth: 1,
    },
    upIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    upIconText: { fontWeight: '700', color: '#FFF' },
    upName: { fontSize: 14, fontWeight: '700' },
    upPrice: { fontSize: 12, fontWeight: '500' },
    upBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    upBadgeText: { fontSize: 10, fontWeight: '700' },
});