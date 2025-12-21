import React, { useMemo } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, StatusBar, Switch } from 'react-native';
import { UserSubscription } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    visible: boolean;
    subscription: UserSubscription | null;
    onClose: () => void;
    onEdit: (sub: UserSubscription) => void;
}

const { width } = Dimensions.get('window');

// --- RENK PALETİ ---
const COLORS = {
    primaryDark: '#1E293B',
    primary: '#334155',
    primaryLight: '#475569',

    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceHighlight: '#F1F5F9',

    textMain: '#0F172A',
    textBody: '#334155',
    textMuted: '#94A3B8',

    white: '#FFFFFF',
    border: '#E2E8F0',

    // Semantik Renkler (Düzeltildi)
    success: '#10B981', // Yeşil
    warning: '#F59E0B', // Turuncu
    inactive: '#CBD5E1', // Gri
    error: '#EF4444',
};

export default function SubscriptionDetailModal({ visible, subscription: initialSubscription, onClose, onEdit }: Props) {
    const { removeSubscription, updateSubscription, subscriptions } = useUserSubscriptionStore();

    // ÇÖZÜM: Store'dan canlı veriyi çekiyoruz. 
    // Böylece Switch değiştiği an bu değişken güncelleniyor ve ekran yeniden çiziliyor.
    const liveSubscription = useUserSubscriptionStore((state) =>
        state.subscriptions.find((s) => s.id === initialSubscription?.id)
    );

    // Eğer store'da bulamazsak (örn silinmişse) initial veriyi kullan, o da yoksa null.
    const subscription = liveSubscription || initialSubscription;

    // --- KULLANIM VERİSİ HESAPLAMA (Düzeltildi) ---
    const usageData = useMemo(() => {
        if (!subscription) return [];
        const history = subscription.usageHistory || [];
        const months = [];

        // Son 6 ay
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1); // KRİTİK DÜZELTME: 31 çeken ay hatasını önlemek için günü 1'e sabitliyoruz.
            d.setMonth(d.getMonth() - i);

            const key = d.toISOString().slice(0, 7); // "2023-12" formatı
            const log = history.find((h: any) => h.month === key);

            months.push({
                label: d.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase(),
                // Eğer log varsa status'ü al, yoksa 'missing' (veri yok) olarak işaretle
                status: log ? log.status : 'missing',
            });
        }
        return months;
    }, [subscription]);; // subscription değiştiğinde (Switch'e basınca) burası da güncellenir

    if (!subscription) return null;

    // --- AKSİYONLAR ---
    const handleDelete = () => {
        Alert.alert(
            "Aboneliği Sil",
            `${subscription.name} aboneliğini silmek istediğine emin misin?`,
            [
                { text: "Vazgeç", style: "cancel" },
                { text: "Sil", style: "destructive", onPress: async () => { await removeSubscription(subscription.id); onClose(); } }
            ]
        );
    };

    const toggleStatus = async (value: boolean) => {
        // Switch'ten gelen değer ile store'u güncelliyoruz.
        // liveSubscription sayesinde ekran anında güncellenecek.
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
        let nextDate = new Date(today.getFullYear(), today.getMonth(), billingDay);

        if (nextDate < today) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }

        const diffTime = Math.abs(nextDate.getTime() - today.getTime());
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { nextDate, daysLeft };
    };
    const { nextDate, daysLeft } = getBillingData();

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />

                {/* --- HEADER --- */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                        <Ionicons name="chevron-down" size={28} color={COLORS.textMain} />
                    </TouchableOpacity>
                    <View style={styles.topBarActions}>
                        <TouchableOpacity onPress={() => { onClose(); onEdit(subscription); }} style={styles.iconBtn}>
                            <Ionicons name="pencil-outline" size={22} color={COLORS.textMain} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={[styles.iconBtn, { marginLeft: 8 }]}>
                            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* 1. HERO BÖLÜMÜ (İsim ve Fiyat) */}
                    <View style={[styles.heroSection, !subscription.isActive && styles.heroDisabled]}>
                        <View style={[styles.logoPlaceholder, { backgroundColor: subscription.isActive ? (subscription.colorCode || COLORS.primary) : COLORS.inactive }]}>
                            <Text style={styles.logoText}>{subscription.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.heroTitle}>{subscription.name}</Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.heroCurrency}>{subscription.currency}</Text>
                            <Text style={styles.heroPrice}>{subscription.price}</Text>
                            <Text style={styles.heroPeriod}>/ay</Text>
                        </View>
                    </View>

                    {/* 2. DURUM YÖNETİMİ (Switch) */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusTitle}>Abonelik Durumu</Text>
                            <Text style={styles.statusDesc}>
                                {subscription.isActive
                                    ? "Şu an aktif. Takvimde ve raporlarda görünür."
                                    : "Donduruldu. Ödemeler ve hatırlatmalar kapalı."}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: COLORS.border, true: COLORS.success }}
                            thumbColor={COLORS.white}
                            ios_backgroundColor={COLORS.border}
                            onValueChange={toggleStatus}
                            value={subscription.isActive}
                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                        />
                    </View>

                    {/* 3. ÖDEME BİLGİSİ (Canlı Güncellenen Kart) */}
                    <LinearGradient
                        colors={subscription.isActive ? [COLORS.primary, COLORS.primaryDark] : [COLORS.inactive, '#94A3B8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.billingCard}
                    >
                        <View style={styles.billingRow}>
                            <View>
                                <Text style={styles.billingLabel}>SIRADAKİ ÖDEME</Text>
                                <Text style={styles.billingDate}>
                                    {subscription.isActive
                                        ? nextDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'Donduruldu'}
                                </Text>
                            </View>
                            {subscription.isActive && (
                                <View style={styles.daysLeftBadge}>
                                    <Text style={styles.daysLeftText}>{daysLeft} gün kaldı</Text>
                                </View>
                            )}
                        </View>
                    </LinearGradient>

                    {/* 4. KULLANIM GEÇMİŞİ (Düzeltilmiş Renkler ve Mantık) */}
<View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>KULLANIM SIKLIĞI</Text>
                            <Text style={styles.sectionBadge}>Son 6 Ay</Text>
                        </View>

                        <View style={styles.usageContainer}>
                            <View style={styles.chartRow}>
                                {usageData.map((m, i) => {
                                    // GÖRSEL AYARLAR
                                    let height = 4;        // Varsayılan (Veri Yok - Missing)
                                    let color = '#E2E8F0'; // Çok silik gri
                                    let labelColor = COLORS.textMuted;

                                    if (m.status === 'active') {
                                        height = 60; 
                                        color = COLORS.success; // YEŞİL
                                        labelColor = COLORS.success;
                                    } else if (m.status === 'low') {
                                        height = 32; 
                                        color = COLORS.warning; // TURUNCU
                                        labelColor = COLORS.warning;
                                    } else if (m.status === 'none') {
                                        // "Hiç Kullanmadım" seçimi
                                        height = 12; // Kısa ama belirgin bir çubuk
                                        color = COLORS.textMuted; // Koyu Gri
                                    }

                                    return (
                                        <View key={i} style={styles.usageItem}>
                                            <View style={styles.barContainer}>
                                                <View style={[styles.barFill, { height, backgroundColor: color }]} />
                                            </View>
                                            <Text style={[styles.barLabel, { color: m.status !== 'missing' ? labelColor : '#CBD5E1' }]}>
                                                {m.label}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                            
                            {/* LEJANT (Renk Açıklaması - Güncellendi) */}
                            <View style={styles.legendContainer}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                                    <Text style={styles.legendText}>Yoğun</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
                                    <Text style={styles.legendText}>Seyrek</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: COLORS.textMuted }]} />
                                    <Text style={styles.legendText}>Hiç</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 5. DETAYLAR */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>DETAYLAR</Text>

                        <View style={styles.detailRow}>
                            <View style={styles.detailIconBox}>
                                <Ionicons name="people-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Abonelik Tipi</Text>
                                <Text style={styles.detailValue}>
                                    {partnersCount > 0 ? `${partnersCount + 1} Kişilik Ortak Plan` : 'Bireysel Abonelik'}
                                </Text>
                            </View>
                            {partnersCount > 0 && (
                                <Text style={styles.detailRightText}>-{myShare.toFixed(1)} {subscription.currency} / kişi</Text>
                            )}
                        </View>
                    </View>

                    <View style={{ height: 60 }} />
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    topBarActions: {
        flexDirection: 'row',
    },
    iconBtn: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // HERO
    heroSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    heroDisabled: {
        opacity: 0.6,
    },
    logoPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textMain,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    heroCurrency: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textMuted,
        marginBottom: 6,
        marginRight: 4,
    },
    heroPrice: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.textMain,
        letterSpacing: -1,
    },
    heroPeriod: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textMuted,
        marginBottom: 8,
        marginLeft: 2,
    },

    // STATUS CARD
    statusCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusInfo: {
        flex: 1,
        marginRight: 12,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textMain,
        marginBottom: 2,
    },
    statusDesc: {
        fontSize: 11,
        color: COLORS.textMuted,
        lineHeight: 16,
    },

    // BILLING CARD
    billingCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 5,
    },
    billingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billingLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 1,
    },
    billingDate: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '700',
    },
    daysLeftBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    daysLeftText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },

    // SECTIONS
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textMuted,
        letterSpacing: 1,
    },
    sectionBadge: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.primary,
        backgroundColor: COLORS.surfaceHighlight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },

    // CHART
    usageContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
    },
    chartRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 80,
        marginBottom: 16,
    },
    usageItem: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    barContainer: {
        height: 60,
        justifyContent: 'flex-end',
        marginBottom: 8,
        width: '100%',
        alignItems: 'center',
    },
    barFill: {
        width: 12,
        borderRadius: 6,
    },
    barLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 4,
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 11,
        color: COLORS.textBody,
        fontWeight: '500',
    },

    // DETAILS
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    detailRightText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
    },

    scrollContent: {
        paddingBottom: 40,
    },
});