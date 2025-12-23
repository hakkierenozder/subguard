import React, { useMemo } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, StatusBar, Switch, Platform, DimensionValue } from 'react-native';
import { UserSubscription } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore'; 
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../constants/theme'; 

interface Props {
    visible: boolean;
    subscription: UserSubscription | null;
    onClose: () => void;
    onEdit: (sub: UserSubscription) => void;
}

const { width } = Dimensions.get('window');

export default function SubscriptionDetailModal({ visible, subscription: initialSubscription, onClose, onEdit }: Props) {
    // --- TEMA VE STORE ---
    const colors = useThemeColors();
    const isDarkMode = useSettingsStore((state) => state.isDarkMode);
    
    const { removeSubscription, updateSubscription } = useUserSubscriptionStore();

    // Store'dan canlı veri
    const liveSubscription = useUserSubscriptionStore((state) => 
        state.subscriptions.find((s) => s.id === initialSubscription?.id)
    );

    const subscription = liveSubscription || initialSubscription;

    // --- KULLANIM VERİSİ HESAPLAMA ---
    const usageData = useMemo(() => {
        if (!subscription) return [];
        const history = subscription.usageHistory || [];
        const months = [];
        
        // Son 6 ay
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1); 
            d.setMonth(d.getMonth() - i);
            
            const key = d.toISOString().slice(0, 7);
            const log = history.find((h: any) => h.month === key);
            
            months.push({
                label: d.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase(),
                status: log ? log.status : 'missing',
            });
        }
        return months;
    }, [subscription]);

    if (!subscription) return null;

    // --- AKSİYONLAR ---
    const handleDelete = () => {
        Alert.alert(
            "Aboneliği Sil",
            `${subscription.name} aboneliğini silmek istediğine emin misin?`,
            [
                { text: "Vazgeç", style: "cancel" },
                { text: "Sil", style: "destructive", onPress: async () => { await removeSubscription(subscription.id); onClose(); }}
            ]
        );
    };

    const toggleStatus = async (value: boolean) => {
        await updateSubscription(subscription.id, { isActive: value });
    };

    // --- HESAPLAMALAR ---
    const totalCost = subscription.price;
    const partners = subscription.sharedWith || [];
    const partnersCount = partners.length;
    const myShare = totalCost / (partnersCount + 1);

    const getBillingData = () => {
        const today = new Date();
        const billingDay = subscription.billingDay;
        const safeDay = (billingDay > 0 && billingDay <= 31) ? billingDay : 1;
        
        let nextDate = new Date(today.getFullYear(), today.getMonth(), safeDay);
        
        if (nextDate < today) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        
        const diffTime = Math.abs(nextDate.getTime() - today.getTime());
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return { nextDate, daysLeft };
    };
    const { nextDate, daysLeft } = getBillingData();

    // Dinamik Marka Rengi
    const brandColor = subscription.colorCode || colors.primary;

    // --- TAAHHÜT HESAPLAMASI ---
    const renderContractInfo = () => {
        if (!subscription.hasContract) return null;

        const start = subscription.contractStartDate ? new Date(subscription.contractStartDate) : null;
        const end = subscription.contractEndDate ? new Date(subscription.contractEndDate) : null;

        return (
            <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 20 }]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Taahhüt Bilgisi</Text>
                    <Ionicons name="document-text-outline" size={18} color={colors.textSec} />
                </View>
                
                <View style={styles.contractRow}>
                    <View style={styles.contractItem}>
                        <Text style={[styles.contractLabel, { color: colors.textSec }]}>BAŞLANGIÇ</Text>
                        <Text style={[styles.contractValue, { color: colors.textMain }]}>
                            {start ? start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </Text>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.contractItem}>
                        <Text style={[styles.contractLabel, { color: colors.textSec }]}>BİTİŞ</Text>
                        <Text style={[styles.contractValue, { color: colors.textMain }]}>
                            {end ? end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
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
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

                {/* --- HEADER --- */}
                <View style={styles.topBar}>
                    <TouchableOpacity 
                        onPress={onClose} 
                        style={[styles.iconBtn, { backgroundColor: colors.inputBg }]}
                    >
                        <Ionicons name="chevron-down" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                    
                    <View style={styles.topBarActions}>
                        <TouchableOpacity 
                            onPress={() => { onClose(); onEdit(subscription); }} 
                            style={[styles.iconBtn, { backgroundColor: colors.inputBg, marginRight: 10 }]}
                        >
                            <Ionicons name="pencil" size={20} color={colors.textMain} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleDelete} 
                            style={[styles.iconBtn, { backgroundColor: colors.error + '20' }]} 
                        >
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* 1. HERO BÖLÜMÜ */}
                    <View style={[styles.heroSection, !subscription.isActive && styles.heroDisabled]}>
                        <View style={[styles.logoContainer, { backgroundColor: subscription.isActive ? brandColor : colors.inactive, shadowColor: brandColor }]}>
                            <Text style={styles.logoText}>{subscription.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        
                        <Text style={[styles.heroTitle, { color: colors.textMain }]}>{subscription.name}</Text>
                        
                        <View style={styles.priceContainer}>
                            <Text style={[styles.heroCurrency, { color: colors.textSec }]}>{subscription.currency}</Text>
                            <Text style={[styles.heroPrice, { color: colors.textMain }]}>{subscription.price}</Text>
                            <Text style={[styles.heroPeriod, { color: colors.textSec }]}>/ay</Text>
                        </View>

                        {!subscription.isActive && (
                            <View style={[styles.badge, { backgroundColor: colors.inactive }]}>
                                <Text style={styles.badgeText}>PASİF</Text>
                            </View>
                        )}
                    </View>

                    {/* 2. BİLGİ KARTLARI */}
                    <View style={styles.gridContainer}>
                        {/* Durum Kartı */}
                        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, flex: 1, marginRight: 8 }]}>
                            <View style={styles.cardHeader}>
                                <Ionicons name={subscription.isActive ? "power" : "power-outline"} size={18} color={colors.textSec} />
                                <Text style={[styles.cardLabel, { color: colors.textSec }]}>DURUM</Text>
                            </View>
                            <View style={styles.switchRow}>
                                <Text style={[styles.cardValue, { color: colors.textMain, fontSize: 13 }]}>
                                    {subscription.isActive ? 'Aktif' : 'Donduruldu'}
                                </Text>
                                <Switch
                                    trackColor={{ false: colors.border, true: colors.success }}
                                    thumbColor={colors.white}
                                    ios_backgroundColor={colors.border}
                                    onValueChange={toggleStatus}
                                    value={subscription.isActive}
                                    style={{ transform: [{ scaleX: .7 }, { scaleY: .7 }] }}
                                />
                            </View>
                        </View>

                        {/* Tarih Kartı */}
                        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, flex: 1, marginLeft: 8 }]}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="calendar-outline" size={18} color={colors.textSec} />
                                <Text style={[styles.cardLabel, { color: colors.textSec }]}>SONRAKİ</Text>
                            </View>
                            <View style={{marginTop: 6}}>
                                <Text style={[styles.cardValue, { color: colors.textMain }]}>
                                    {subscription.isActive 
                                        ? nextDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                                        : '-'}
                                </Text>
                                {subscription.isActive && (
                                    <Text style={[styles.subValue, { color: daysLeft <= 3 ? colors.error : colors.success }]}>
                                        {daysLeft} gün kaldı
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* 3. KULLANIM GEÇMİŞİ GRAFİĞİ */}
                    <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Kullanım Sıklığı</Text>
                            <Text style={[styles.sectionSubtitle, { color: colors.textSec }]}>Son 6 Ay</Text>
                        </View>

                        <View style={[styles.chartContainer, { backgroundColor: colors.inputBg }]}>
                            <View style={styles.chartRow}>
                                {usageData.map((m, i) => {
                                    let height: DimensionValue = '10%';        
                                    let bgColor = colors.border; 
                                    let labelColor = colors.textSec;

                                    if (m.status === 'active') {
                                        height = '80%'; 
                                        bgColor = colors.success; 
                                        labelColor = colors.success;
                                    } else if (m.status === 'low') {
                                        height = '45%'; 
                                        bgColor = colors.accent; 
                                        labelColor = colors.accent;
                                    } else if (m.status === 'none') {
                                        height = '20%'; 
                                        bgColor = colors.error; 
                                        labelColor = colors.error; 
                                    }

                                    return (
                                        <View key={i} style={styles.barWrapper}>
                                            <View style={styles.barTrack}>
                                                <View style={[styles.barFill, { height: height, backgroundColor: bgColor }]} />
                                            </View>
                                            <Text style={[styles.barLabel, { color: labelColor }]}>{m.label}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                        
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.success }]} /><Text style={[styles.legendText, { color: colors.textSec }]}>Yoğun</Text></View>
                            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.accent }]} /><Text style={[styles.legendText, { color: colors.textSec }]}>Normal</Text></View>
                            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.error }]} /><Text style={[styles.legendText, { color: colors.textSec }]}>Hiç</Text></View>
                        </View>
                    </View>

                    {/* YENİ: TAAHHÜT BİLGİSİ (Varsa Göster) */}
                    {renderContractInfo()}

                    {/* 4. DETAYLAR LİSTESİ */}
                    <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingVertical: 8 }]}>
                        
                        <View style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                            <View style={styles.detailLeft}>
                                <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                                    <Ionicons name="folder-open" size={18} color={colors.primary} />
                                </View>
                                <Text style={[styles.detailLabel, { color: colors.textMain }]}>Kategori</Text>
                            </View>
                            <Text style={[styles.detailValue, { color: colors.textSec }]}>{subscription.category}</Text>
                        </View>

                        <View style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: partnersCount > 0 ? 1 : 0 }]}>
                            <View style={styles.detailLeft}>
                                <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                                    <Ionicons name="people" size={18} color={colors.primary} />
                                </View>
                                <Text style={[styles.detailLabel, { color: colors.textMain }]}>Abonelik Tipi</Text>
                            </View>
                            <Text style={[styles.detailValue, { color: colors.textSec }]}>
                                {partnersCount > 0 ? 'Ortak Plan' : 'Bireysel'}
                            </Text>
                        </View>

                        {partnersCount > 0 && (
                            <View style={styles.detailItem}>
                                <View style={styles.detailLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                                        <Ionicons name="wallet" size={18} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.detailLabel, { color: colors.textMain }]}>Payına Düşen</Text>
                                </View>
                                <Text style={[styles.detailValue, { color: colors.success, fontWeight: '700' }]}>
                                    {myShare.toFixed(2)} {subscription.currency}
                                </Text>
                            </View>
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
    
    heroSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
    heroDisabled: { opacity: 0.5 },
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
    logoText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
    heroTitle: { fontSize: 24, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
    priceContainer: { flexDirection: 'row', alignItems: 'flex-end' },
    heroCurrency: { fontSize: 18, fontWeight: '600', marginBottom: 8, marginRight: 4 },
    heroPrice: { fontSize: 42, fontWeight: '900', letterSpacing: -1 },
    heroPeriod: { fontSize: 14, fontWeight: '500', marginBottom: 10, marginLeft: 4 },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

    gridContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
    card: { borderRadius: 20, padding: 16, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, opacity: 0.8 },
    cardLabel: { fontSize: 11, fontWeight: '700', marginLeft: 6, letterSpacing: 0.5 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardValue: { fontSize: 16, fontWeight: '700' },
    subValue: { fontSize: 11, fontWeight: '600', marginTop: 2 },

    sectionContainer: { marginHorizontal: 20, marginBottom: 20, borderRadius: 24, padding: 20, borderWidth: 1 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    sectionSubtitle: { fontSize: 12, fontWeight: '500' },

    chartContainer: { borderRadius: 16, padding: 16, height: 140, justifyContent: 'flex-end' },
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: '100%' },
    barWrapper: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
    barTrack: { width: '100%', height: '80%', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 6 },
    barFill: { width: 10, borderRadius: 5 },
    barLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
    legendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    legendText: { fontSize: 12, fontWeight: '500' },

    detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    detailLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    detailLabel: { fontSize: 14, fontWeight: '600' },
    detailValue: { fontSize: 14, fontWeight: '500' },

    // Contract Styles
    contractRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    contractItem: { flex: 1, alignItems: 'center' },
    contractLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
    contractValue: { fontSize: 15, fontWeight: '600' },
    divider: { width: 1, height: 40, marginHorizontal: 10 },

    scrollContent: { paddingBottom: 40 },
});