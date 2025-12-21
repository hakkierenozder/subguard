import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalogStore } from '../store/useCatalogStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { CatalogItem, UserSubscription } from '../types';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import UsageSurveyModal from '../components/UsageSurveyModal';
import CatalogExplore from '../components/CatalogExplore';
import { getUserName } from '../utils/AuthManager';
import agent from '../api/agent';

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
        // Profil bilgisini de çekiyoruz
        try {
            const profileRes = await agent.Auth.getProfile();
            if (profileRes?.data) {
                setUserName(profileRes.data.fullName);
                setMonthlyBudget(profileRes.data.monthlyBudget || 0); // Bütçeyi al
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

    // Yaklaşan Ödemeler (En yakın 2)
    const upcomingPayments = [...subscriptions]
        .filter(sub => sub.isActive !== false) // <--- DÜZELTME BURADA: Pasifleri listeye alma
        .sort((a, b) => {
            const today = new Date().getDate();
            const dayA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
            const dayB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
            return dayA - dayB;
        })
        .slice(0, 2);

    const renderUpcomingCard = (item: UserSubscription) => {
        const today = new Date().getDate();
        let daysLeft = item.billingDay - today;
        if (daysLeft < 0) daysLeft += 30;

        return (
            <View key={item.id} style={[styles.upcomingCard, { borderLeftColor: item.colorCode || '#333' }]}>
                <View>
                    <Text style={styles.upName}>{item.name}</Text>
                    <Text style={styles.upPrice}>{item.price} {item.currency}</Text>
                </View>
                <View style={styles.upDayContainer}>
                    <Text style={styles.upDayVal}>{daysLeft}</Text>
                    <Text style={styles.upDayLabel}>gün kaldı</Text>
                </View>
            </View>
        );
    };

    const totalExpense = getTotalExpense();
    const budgetPercentage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
    const isOverBudget = totalExpense > monthlyBudget;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Merhaba,</Text>
                        <Text style={styles.username}>{userName} 👋</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{userName?.charAt(0).toUpperCase()}</Text>
                    </View>
                </View>

                {/* ÖZET PANOSU */}
                <View style={styles.dashboard}>

                    {/* DÜZELTME: İstatistikleri yan yana tutan Row Wrapper */}
                    <View style={[styles.dashRow, { marginBottom: monthlyBudget > 0 ? 15 : 0 }]}>
                        <View style={styles.dashItem}>
                            <Text style={styles.dashLabel}>Aylık Toplam</Text>
                            <Text style={styles.dashValue}>{getTotalExpense().toFixed(0)} ₺</Text>
                        </View>
                        <View style={styles.dashDivider} />
                        <View style={styles.dashItem}>
                            <Text style={styles.dashLabel}>Bütçe Hedefi</Text>
                            <Text style={styles.dashValue}>{monthlyBudget > 0 ? `${monthlyBudget} ₺` : '-'}</Text>
                        </View>
                    </View>

                    {/* BÜTÇE PROGRESS BAR */}
                    {monthlyBudget > 0 && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${Math.min(budgetPercentage, 100)}%`,
                                            backgroundColor: isOverBudget ? '#ff4444' : '#2ecc71'
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {isOverBudget
                                    ? `Bütçeyi ${(totalExpense - monthlyBudget).toFixed(0)} ₺ aştın!`
                                    : `%${budgetPercentage.toFixed(0)} kullanıldı`}
                            </Text>
                        </View>
                    )}
                </View>

                {/* YAKLAŞAN ÖDEMELER */}
                {upcomingPayments.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Yaklaşan Ödemeler</Text>
                        <View style={styles.upcomingRow}>
                            {upcomingPayments.map(renderUpcomingCard)}
                        </View>
                    </View>
                )}

                {/* KEŞFET (KATALOG) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Yeni Abonelik Ekle</Text>
                    <CatalogExplore onSelect={(item) => setSelectedItem(item)} />
                </View>

            </ScrollView>

            {/* MODALLAR */}
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
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContent: { padding: 20 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    greeting: { fontSize: 16, color: '#666' },
    username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    avatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    // Dashboard
    dashboard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 25,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
        flexDirection: 'column' // Alt alta dizilim (Row + Progress Bar)
    },
    dashRow: {
        flexDirection: 'row',
        alignItems: 'center'
        // marginBottom buradan kaldırıldı, inline olarak veriliyor.
    },
    dashItem: { flex: 1, alignItems: 'center' },
    dashLabel: { fontSize: 12, color: '#999', marginBottom: 5, textTransform: 'uppercase', fontWeight: '600' },
    dashValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    dashDivider: { width: 1, backgroundColor: '#eee', marginHorizontal: 10 },

    // Progress Bar
    progressContainer: { marginTop: 5 },
    progressBarBg: { height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 5 },
    progressText: { fontSize: 11, color: '#666', marginTop: 5, textAlign: 'right', fontWeight: '600' },

    // Yaklaşanlar
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    upcomingRow: { flexDirection: 'row', justifyContent: 'space-between' },
    upcomingCard: {
        flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, marginRight: 10,
        borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    upName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    upPrice: { fontSize: 12, color: '#666', marginTop: 2 },
    upDayContainer: { alignItems: 'center' },
    upDayVal: { fontSize: 16, fontWeight: 'bold', color: '#e74c3c' },
    upDayLabel: { fontSize: 8, color: '#999' },
});