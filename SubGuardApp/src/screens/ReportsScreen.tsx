import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { UserSubscription, UsageStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import agent from '../api/agent'; // API çağrısı için

interface Props {
    visible: boolean;
    subscription: UserSubscription | null;
    onClose: () => void;
    onEdit: (sub: UserSubscription) => void;
}

const { width } = Dimensions.get('window');

// --- MODERN RENK PALETİ (Slate 700 Temelli) ---
const COLORS = {
    // Ana Renkler
    primary: '#334155',      // Slate 700 - Fırtına Mavisi
    primaryLight: '#475569',  // Slate 600
    primaryDark: '#1e293b',   // Slate 800
    accent: '#38bdf8',        // Sky 400 - Canlı bir vurgu rengi

    // Arka Plan ve Kartlar
    background: '#F8FAFC',    // Slate 50 - Ferah bir arka plan
    cardBackground: '#FFFFFF',
    surface: '#F1F5F9',       // Slate 100 - Daha az önemli alanlar için

    // Metin Renkleri
    text: '#0F172A',          // Slate 900 - En güçlü metin
    textLight: '#475569',     // Slate 600 - İkincil metin
    textMuted: '#94A3B8',     // Slate 400 - Yardımcı metin

    // Durum Renkleri
    success: '#10b981',       // Emerald 500
    warning: '#f59e0b',       // Amber 500
    danger: '#ef4444',        // Red 500

    // Diğer
    border: '#E2E8F0',        // Slate 200 - Çizgiler ve ayırıcılar
    shadow: 'rgba(15, 23, 42, 0.08)', // Daha yumuşak, metin tabanlı gölge
};

export default function SubscriptionDetailModal({ visible, subscription, onClose, onEdit }: Props) {
    const { removeSubscription, updateSubscription } = useUserSubscriptionStore();

    if (!subscription) return null;

    const handleDelete = () => {
        Alert.alert(
            "Aboneliği Sil",
            `${subscription.name} aboneliğini silmek istediğine emin misin?`,
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        await removeSubscription(subscription.id);
                        onClose();
                    }
                }
            ]
        );
    };

    // --- Maliyet Hesaplama ---
    const totalCost = subscription.price;
    const partnersCount = subscription.sharedWith?.length || 0;
    const myShare = totalCost / (partnersCount + 1);

    // --- Tarih Hesaplama ---
    const today = new Date();
    const nextBillingDate = new Date();
    if (subscription.billingDay < today.getDate()) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }
    nextBillingDate.setDate(subscription.billingDay);
    const daysLeft = Math.ceil((nextBillingDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    // --- Kullanım Geçmişi (Son 6 Ay) ---
    const renderUsageHistory = () => {
        const history = subscription.usageHistory || [];
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toISOString().slice(0, 7);
            const log = history.find(h => h.month === key);
            months.push({
                label: d.toLocaleDateString('tr-TR', { month: 'short' }),
                status: log?.status || 'unknown'
            });
        }

        return (
            <View style={styles.usageContainer}>
                {months.map((m, index) => (
                    <View key={index} style={styles.usageItem}>
                        <View style={[styles.usageDot, getUsageStyle(m.status)]} />
                        <Text style={styles.usageText}>{m.label}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const getUsageStyle = (status: string | undefined) => {
        switch (status) {
            case 'active': return { backgroundColor: COLORS.success, height: 28 };
            case 'low': return { backgroundColor: COLORS.warning, height: 18 };
            case 'none': return { backgroundColor: COLORS.danger, height: 10 };
            default: return { backgroundColor: COLORS.border, height: 6 };
        }
    };

    const toggleStatus = async () => {
        if (!subscription) return;
        const newStatus = !subscription.isActive;
        await updateSubscription(subscription.id, { isActive: newStatus });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* HEADER: Daha temiz ve odaklı */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    <View style={[styles.logoContainer, { backgroundColor: subscription.colorCode || COLORS.primary }]}>
                        <Text style={styles.logoText}>{subscription.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.title}>{subscription.name}</Text>
                    <Text style={styles.price}>{subscription.price} {subscription.currency}</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: COLORS.surface }]}>
                            <Text style={[styles.badgeText, { color: COLORS.primaryLight }]}>{subscription.category}</Text>
                        </View>
                        {subscription.hasContract && (
                            <View style={[styles.badge, { backgroundColor: COLORS.danger + '20' }]}>
                                <Text style={[styles.badgeText, { color: COLORS.danger }]}>Sözleşmeli</Text>
                            </View>
                        )}
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* 1. ÖZET KARTI: TEK KART İÇİNDE İKİ BÖLÜM */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryItem}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.accent + '20' }]}>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.accent} />
                            </View>
                            <View style={styles.summaryTextContainer}>
                                <Text style={styles.summaryLabel}>Sonraki Ödeme</Text>
                                <Text style={styles.summaryValue}>{daysLeft} gün</Text>
                                <Text style={styles.summarySub}>{nextBillingDate.toLocaleDateString('tr-TR')}</Text>
                            </View>
                        </View>
                        <View style={[styles.verticalSeparator, { backgroundColor: COLORS.border }]} />
                        <View style={styles.summaryItem}>
                            <View style={[styles.iconContainer, { backgroundColor: COLORS.success + '20' }]}>
                                <Ionicons name="wallet-outline" size={20} color={COLORS.success} />
                            </View>
                            <View style={styles.summaryTextContainer}>
                                <Text style={styles.summaryLabel}>Senin Payın</Text>
                                <Text style={[styles.summaryValue, { color: COLORS.success }]}>{myShare.toFixed(2)} {subscription.currency}</Text>
                                <Text style={styles.summarySub}>{partnersCount > 0 ? `${partnersCount} kişiyle` : 'Bireysel'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* 2. KULLANIM GEÇMİŞİ */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Kullanım Sıklığı</Text>
                        {renderUsageHistory()}
                        <Text style={styles.helperText}>Son 6 ay</Text>
                    </View>

                    {/* 3. ORTAK KULLANICILAR */}
                    {partnersCount > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Maliyet Paylaşımı</Text>
                            <View style={styles.partnerList}>
                                <View style={styles.partnerRow}>
                                    <View style={styles.partnerLeft}>
                                        <View style={[styles.avatarSmall, { backgroundColor: COLORS.primary }]}>
                                            <Text style={[styles.avatarTextSmall, { color: '#fff' }]}>B</Text>
                                        </View>
                                        <Text style={styles.partnerName}>Sen</Text>
                                    </View>
                                    <Text style={styles.partnerAmount}>{myShare.toFixed(2)} {subscription.currency}</Text>
                                </View>
                                {subscription.sharedWith?.map((person, idx) => (
                                    <View key={idx} style={styles.partnerRow}>
                                        <View style={styles.partnerLeft}>
                                            <View style={[styles.avatarSmall, { backgroundColor: COLORS.surface }]}>
                                                <Text style={[styles.avatarTextSmall, { color: COLORS.textLight }]}>{person.charAt(0).toUpperCase()}</Text>
                                            </View>
                                            <Text style={styles.partnerName}>{person}</Text>
                                        </View>
                                        <Text style={styles.partnerAmount}>{myShare.toFixed(2)} {subscription.currency}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* 4. SÖZLEŞME DURUMU */}
                    {subscription.hasContract && subscription.contractEndDate && (
                        <View style={[styles.section, styles.contractCard]}>
                            <View style={styles.contractHeader}>
                                <Text style={styles.sectionTitle}>Taahhüt Durumu</Text>
                                <View style={[styles.statusChip, { backgroundColor: COLORS.primary + '20' }]}>
                                    <Text style={[styles.statusChipText, { color: COLORS.primary }]}>Aktif</Text>
                                </View>
                            </View>
                            {(() => {
                                const start = subscription.contractStartDate ? new Date(subscription.contractStartDate) : new Date();
                                const end = new Date(subscription.contractEndDate);
                                const today = new Date();
                                if (!subscription.contractStartDate) start.setFullYear(end.getFullYear() - 1);
                                const totalDuration = end.getTime() - start.getTime();
                                const elapsed = today.getTime() - start.getTime();
                                let progress = Math.max(0, Math.min(1, elapsed / totalDuration));
                                const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
                                return (
                                    <View>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: progress > 0.8 ? COLORS.danger : COLORS.primary }]} />
                                        </View>
                                        <View style={styles.dateRow}>
                                            <Text style={styles.dateText}>{start.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</Text>
                                            <Text style={styles.daysLeftText}>{daysLeft} gün kaldı</Text>
                                            <Text style={styles.dateText}>{end.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</Text>
                                        </View>
                                    </View>
                                );
                            })()}
                        </View>
                )}

                </ScrollView>

                {/* FOOTER: DAHA NET HİYERARŞİYE SAHİP BUTONLAR */}
                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={() => { onClose(); onEdit(subscription); }}>
                        <Ionicons name="create-outline" size={20} color={COLORS.primaryLight} />
                        <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>Düzenle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={toggleStatus}>
                        <Ionicons name={subscription.isActive ? "pause-circle" : "play-circle"} size={20} color="white" />
                        <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>
                            {subscription.isActive ? 'Dondur' : 'Aktifleştir'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDestructive]} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 30,
        backgroundColor: COLORS.cardBackground,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
    },
    closeBtn: { position: 'absolute', top: 20, right: 20, padding: 5, zIndex: 9 },
    logoContainer: {
        width: 80, height: 80, borderRadius: 40,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16, marginTop: 10,
        shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    logoText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
    title: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    price: { fontSize: 20, color: COLORS.textLight, fontWeight: '600' },
    badgeRow: { flexDirection: 'row', marginTop: 12 },
    badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginHorizontal: 4 },
    badgeText: { fontSize: 13, fontWeight: '600' },

    content: { paddingHorizontal: 20, paddingBottom: 20 },

    // YENİ ÖZET KARTI
    summaryCard: {
        flexDirection: 'row', backgroundColor: COLORS.cardBackground,
        borderRadius: 16, paddingVertical: 20, paddingHorizontal: 16,
        marginBottom: 24, alignItems: 'center',
        shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4,
    },
    summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    summaryTextContainer: { flex: 1 },
    summaryLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },
    summarySub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    verticalSeparator: { width: 1, height: '70%', marginHorizontal: 16 },

    section: { backgroundColor: COLORS.cardBackground, borderRadius: 16, padding: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
    helperText: { fontSize: 11, color: COLORS.textMuted, marginTop: 12, fontStyle: 'italic', textAlign: 'center' },

    usageContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 70, paddingBottom: 5 },
    usageItem: { alignItems: 'center', flex: 1 },
    usageDot: { width: 14, borderRadius: 7, marginBottom: 8, alignSelf: 'center' },
    usageText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },

    partnerList: { marginTop: 5 },
    partnerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    partnerLeft: { flexDirection: 'row', alignItems: 'center' },
    avatarSmall: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarTextSmall: { fontSize: 14, fontWeight: 'bold' },
    partnerName: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
    partnerAmount: { fontSize: 15, fontWeight: 'bold', color: COLORS.textLight },

    contractCard: { borderWidth: 1.5, borderColor: COLORS.primary, borderLeftWidth: 5, borderLeftColor: COLORS.primary },
    contractHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusChipText: { fontSize: 11, fontWeight: 'bold' },
    progressBarBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginVertical: 12 },
    progressBarFill: { height: '100%', borderRadius: 4 },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    daysLeftText: { fontSize: 13, fontWeight: 'bold', color: COLORS.text },

    footer: {
        flexDirection: 'row', padding: 20, paddingBottom: 34,
        backgroundColor: COLORS.cardBackground, borderTopWidth: 1, borderTopColor: COLORS.border,
        shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 8,
    },
    actionBtn: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 14, borderRadius: 12, marginHorizontal: 6,
    },
    actionBtnText: { marginLeft: 8, fontWeight: 'bold', fontSize: 14 },
    actionBtnSecondary: { backgroundColor: COLORS.surface },
    actionBtnTextSecondary: { color: COLORS.primaryLight },
    actionBtnPrimary: { backgroundColor: COLORS.primary },
    actionBtnTextPrimary: { color: 'white' },
    actionBtnDestructive: { backgroundColor: COLORS.danger + '15' },
});