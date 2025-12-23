import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../store/useCatalogStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { CatalogItem, UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import UsageSurveyModal from '../components/UsageSurveyModal';
import CatalogExplore from '../components/CatalogExplore';
import agent from '../api/agent';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Eklendi

export default function HomeScreen() {
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
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
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

    // Hesaplamalar
    const totalExpense = getTotalExpense();
    const budgetPercentage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
    const isOverBudget = totalExpense > monthlyBudget;

    // Yaklaşan Ödemeler
    const upcomingPayments = [...subscriptions]
        .filter(sub => sub.isActive !== false)
        .sort((a, b) => {
            const today = new Date().getDate();
            const dayA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
            const dayB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
            return dayA - dayB;
        })
        .slice(0, 3); // İlk 3 tanesi

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Tekrar hoş geldin,</Text>
                        <Text style={styles.username}>{userName.split(' ')[0] || 'Kullanıcı'}</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{userName?.charAt(0).toUpperCase()}</Text>
                    </View>
                </View>

                {/* 2. DASHBOARD CARD (Gradient Slate Blue) */}
                <LinearGradient
                    colors={['#1E293B', '#334155']} // Slate 800 -> Slate 700
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dashboardCard}
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
                                    backgroundColor: isOverBudget ? '#EF4444' : '#10B981'
                                }]} />
                            </View>
                            <Text style={styles.progressText}>
                                {isOverBudget ? 'Bütçe aşıldı' : `%${budgetPercentage.toFixed(0)} kullanıldı`}
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                {/* 3. YAKLAŞAN ÖDEMELER (Yatay Liste) */}
                {upcomingPayments.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Yaklaşan Ödemeler</Text>
                            <TouchableOpacity><Text style={styles.linkText}>Tümü</Text></TouchableOpacity>
                        </View>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                            {upcomingPayments.map((item) => {
                                const today = new Date().getDate();
                                let daysLeft = item.billingDay - today;
                                if (daysLeft < 0) daysLeft += 30;
                                
                                return (
                                    <View key={item.id} style={styles.upcomingCard}>
                                        <View style={[styles.upIcon, { backgroundColor: item.colorCode || '#E2E8F0' }]}>
                                            <Text style={styles.upIconText}>{item.name.charAt(0)}</Text>
                                        </View>
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={styles.upName} numberOfLines={1}>{item.name}</Text>
                                            <Text style={styles.upPrice}>{item.price} {item.currency}</Text>
                                        </View>
                                        <View style={styles.upBadge}>
                                            <Text style={styles.upBadgeText}>{daysLeft} gün</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* 4. KATALOG KEŞFET (Entegre Edildi) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Yeni Abonelik Ekle</Text>
                    {/* CatalogExplore artık kendi ScrollView'ını kullanmıyor, buraya gömülüyor */}
                    <CatalogExplore onSelect={(item) => setSelectedItem(item)} isEmbedded={true} />
                </View>

            </ScrollView>

            {/* MODALS */}
            <AddSubscriptionModal
                visible={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                selectedCatalogItem={selectedItem}
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
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    greeting: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    username: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
    avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#475569', fontSize: 18, fontWeight: '700' },

    // Dashboard Card
    dashboardCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#334155',
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
    
    // Progress
    progressSection: { marginTop: 24 },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 6, fontWeight: '600', textAlign: 'right' },

    // Section Geneli
    section: { marginBottom: 10 }, // Altındaki CatalogExplore'un kendi marginleri var
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    linkText: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },

    // Yaklaşan Ödemeler Kartı
    upcomingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 16,
        marginRight: 12,
        width: 200,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    upIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    upIconText: { fontWeight: '700', color: '#FFF' },
    upName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    upPrice: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    upBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    upBadgeText: { fontSize: 10, fontWeight: '700', color: '#475569' },
});