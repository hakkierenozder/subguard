import React, { useMemo } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, StatusBar, Platform } from 'react-native';
import { UserSubscription } from '../types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';

interface Props {
    visible: boolean;
    subscription: UserSubscription | null;
    onClose: () => void;
    onEdit: (sub: UserSubscription) => void;
}

const { width } = Dimensions.get('window');

// --- SLATE BLUE TEMA ---
const COLORS = {
    primary: '#334155', // Slate 700
    primaryLight: '#E2E8F0', // Slate 200
    primarySoft: '#F1F5F9', // Slate 100
    
    background: '#FFFFFF', 
    surface: '#F8FAFC',
    
    textMain: '#0F172A', // Slate 900
    textBody: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    
    border: '#E2E8F0',
    
    success: '#10B981',
    successBg: '#DCFCE7',
    successText: '#166534',
    
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    warningText: '#92400E',
    
    error: '#EF4444',
    errorBg: '#FEE2E2',
    errorText: '#991B1B'
};

export default function SubscriptionDetailModal({ visible, subscription, onClose, onEdit }: Props) {
    const { removeSubscription, updateSubscription } = useUserSubscriptionStore();

    // HATA DÜZELTME: useMemo Hook'u, "if (!subscription)" kontrolünden ÖNCE çağrılmalı.
    // React Hook'ları her render'da aynı sırada çalışmalıdır.
    const usageData = useMemo(() => {
        if (!subscription) return [];

        const history = subscription.usageHistory || [];
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toISOString().slice(0, 7); 
            
            // Backend yapısına uygun kontrol
            const log = history.find((h: any) => h.month === key);
            
            months.push({
                label: d.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase(),
                status: log ? log.status : 'none'
            });
        }
        return months;
    }, [subscription]); // subscription değiştiğinde yeniden hesapla

    // HATA DÜZELTME: Early return (erken çıkış) hook çağrılarından SONRA yapılmalı.
    if (!subscription) return null;

    // --- MANTIK ---
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

    const toggleStatus = async () => {
        const newStatus = !subscription.isActive;
        await updateSubscription(subscription.id, { isActive: newStatus });
    };

    // Hesaplamalar
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
                
                {/* Modal Tutamacı */}
                <View style={styles.dragHandle} />

                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                        <Ionicons name="close" size={24} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.logoContainer, { backgroundColor: subscription.colorCode || COLORS.primary }]}>
                        <Text style={styles.logoText}>{subscription.name.charAt(0).toUpperCase()}</Text>
                    </View>

                    <Text style={styles.title}>{subscription.name}</Text>
                    
                    <View style={styles.priceContainer}>
                        <Text style={styles.currency}>{subscription.currency}</Text>
                        <Text style={styles.price}>{subscription.price}</Text>
                        <Text style={styles.period}>/ay</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: subscription.isActive ? COLORS.successBg : COLORS.warningBg }]}>
                        <View style={[styles.statusDot, { backgroundColor: subscription.isActive ? COLORS.success : COLORS.warning }]} />
                        <Text style={[styles.statusText, { color: subscription.isActive ? COLORS.successText : COLORS.warningText }]}>
                            {subscription.isActive ? 'Aktif' : 'Donduruldu'}
                        </Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* 1. İSTATİSTİK GRID */}
                    <View style={styles.gridContainer}>
                        <View style={styles.gridItem}>
                            <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} style={{marginBottom:6}}/>
                            <Text style={styles.gridLabel}>Sonraki Ödeme</Text>
                            <Text style={styles.gridValue}>{daysLeft} Gün</Text>
                            <Text style={styles.gridSub}>{nextDate.toLocaleDateString('tr-TR', {day:'numeric', month:'long'})}</Text>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.gridItem}>
                            <Ionicons name="wallet-outline" size={18} color={COLORS.textMuted} style={{marginBottom:6}}/>
                            <Text style={styles.gridLabel}>Senin Payın</Text>
                            <Text style={[styles.gridValue, { color: COLORS.primary }]}>{myShare.toFixed(1)} {subscription.currency}</Text>
                            <Text style={styles.gridSub}>{partnersCount > 0 ? `${partnersCount + 1} Ortaklı` : 'Bireysel'}</Text>
                        </View>
                    </View>

                    {/* 2. KULLANIM GEÇMİŞİ */}
                    <View style={styles.sectionContainer}>
                        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                            <Text style={styles.sectionHeader}>KULLANIM SIKLIĞI</Text>
                            <Text style={styles.sectionSubHeader}>Son 6 Ay</Text>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.usageChart}>
                                {usageData.map((m, i) => {
                                    // Yükseklik ve Renk Ayarı
                                    let barHeight = 6; 
                                    let barColor = COLORS.primaryLight;
                                    
                                    if (m.status === 'active') { barHeight = 40; barColor = COLORS.primary; }
                                    else if (m.status === 'low') { barHeight = 20; barColor = COLORS.textMuted; }
                                    
                                    return (
                                        <View key={i} style={styles.usageCol}>
                                            <View style={[styles.usageBar, { height: barHeight, backgroundColor: barColor }]} />
                                            <Text style={styles.usageLabel}>{m.label}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <Text style={styles.chartLegend}>* Keşfet ekranından yapılan işaretlemelere göre</Text>
                        </View>
                    </View>

                    {/* 3. ORTAKLAR */}
                    {partnersCount > 0 && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionHeader}>MALİYET PAYLAŞIMI</Text>
                            <View style={styles.card}>
                                {/* Ben */}
                                <View style={styles.partnerItem}>
                                    <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                                        <Text style={[styles.avatarText, { color: 'white' }]}>B</Text>
                                    </View>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.partnerName}>Ben</Text>
                                        <Text style={styles.partnerRole}>Abonelik Sahibi</Text>
                                    </View>
                                    <Text style={styles.partnerAmount}>{myShare.toFixed(1)} {subscription.currency}</Text>
                                </View>
                                
                                <View style={styles.divider} />

                                {/* Diğerleri */}
                                {partners.map((p, i) => (
                                    <React.Fragment key={i}>
                                        <View style={styles.partnerItem}>
                                            <View style={[styles.avatar, { backgroundColor: COLORS.primarySoft }]}>
                                                <Text style={[styles.avatarText, { color: COLORS.primary }]}>{p.charAt(0).toUpperCase()}</Text>
                                            </View>
                                            <View style={{flex: 1}}>
                                                <Text style={styles.partnerName}>{p}</Text>
                                                <Text style={styles.partnerRole}>Ortak</Text>
                                            </View>
                                            <Text style={styles.partnerAmount}>{myShare.toFixed(1)} {subscription.currency}</Text>
                                        </View>
                                        {i < partnersCount - 1 && <View style={styles.divider} />}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* 4. TAAHHÜT DURUMU */}
                    {subscription.hasContract && subscription.contractEndDate && (
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionHeader}>TAAHHÜT DETAYI</Text>
                            <View style={styles.card}>
                                {(() => {
                                    const start = subscription.contractStartDate ? new Date(subscription.contractStartDate) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
                                    const end = new Date(subscription.contractEndDate);
                                    const total = end.getTime() - start.getTime();
                                    const passed = new Date().getTime() - start.getTime();
                                    const percent = Math.min(Math.max(passed / total, 0), 1) * 100;

                                    return (
                                        <>
                                            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 10}}>
                                                <Text style={styles.contractLabel}>Sözleşme İlerlemesi</Text>
                                                <Text style={styles.contractValue}>%{percent.toFixed(0)}</Text>
                                            </View>
                                            <View style={styles.progressBarBg}>
                                                <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: percent > 85 ? COLORS.warning : COLORS.primary }]} />
                                            </View>
                                            <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 8}}>
                                                <Text style={styles.contractDate}>{start.toLocaleDateString()}</Text>
                                                <Text style={styles.contractDate}>{end.toLocaleDateString()}</Text>
                                            </View>
                                        </>
                                    );
                                })()}
                            </View>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* --- FOOTER ACTIONS --- */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.footerBtn} onPress={toggleStatus}>
                        <View style={[styles.footerIconBox, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
                            <Ionicons name={subscription.isActive ? "pause" : "play"} size={20} color={COLORS.textBody} />
                        </View>
                        <Text style={styles.footerText}>{subscription.isActive ? 'Dondur' : 'Başlat'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.footerBtn} onPress={() => { onClose(); onEdit(subscription); }}>
                        <View style={[styles.footerIconBox, { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primaryLight }]}>
                            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.footerText, { color: COLORS.primary }]}>Düzenle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.footerBtn} onPress={handleDelete}>
                        <View style={[styles.footerIconBox, { backgroundColor: COLORS.errorBg, borderColor: '#FECACA' }]}>
                            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                        </View>
                        <Text style={[styles.footerText, { color: COLORS.error }]}>Sil</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
    },
    
    // HEADER
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: COLORS.background,
    },
    closeBtn: {
        position: 'absolute',
        right: 20,
        top: 20,
        padding: 4,
        zIndex: 10,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textMain,
        marginBottom: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    currency: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textBody,
        marginBottom: 5,
        marginRight: 4,
    },
    price: {
        fontSize: 34,
        fontWeight: '800',
        color: COLORS.textMain,
        letterSpacing: -1,
    },
    period: {
        fontSize: 15,
        color: COLORS.textMuted,
        fontWeight: '500',
        marginBottom: 6,
        marginLeft: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },

    // CONTENT
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    // GRID
    gridContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gridItem: {
        flex: 1,
        alignItems: 'center',
    },
    verticalDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 12,
    },
    gridLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    gridValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textMain,
        marginBottom: 2,
    },
    gridSub: {
        fontSize: 11,
        color: COLORS.textBody,
    },

    // SECTIONS
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textMuted,
        letterSpacing: 1,
        marginLeft: 4,
    },
    sectionSubHeader: {
        fontSize: 12,
        color: COLORS.textBody,
        marginRight: 4,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // USAGE CHART
    usageChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 60,
        marginBottom: 10,
    },
    usageCol: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: (width - 80) / 6,
    },
    usageBar: {
        width: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    usageLabel: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    chartLegend: {
        fontSize: 10,
        color: COLORS.textMuted,
        fontStyle: 'italic',
        textAlign: 'center',
    },

    // PARTNERS
    partnerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
    },
    partnerName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    partnerRole: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    partnerAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textBody,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
        marginLeft: 48,
    },

    // CONTRACT
    contractLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    contractValue: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    contractDate: {
        fontSize: 11,
        color: COLORS.textMuted,
        fontWeight: '500',
    },

    // FOOTER
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        justifyContent: 'space-between',
        gap: 12,
    },
    footerBtn: {
        flex: 1,
        alignItems: 'center',
    },
    footerIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        borderWidth: 1,
    },
    footerText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textBody,
    },
});