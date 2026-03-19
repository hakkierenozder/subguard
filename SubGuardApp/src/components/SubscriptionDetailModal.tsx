import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Dimensions, StatusBar, Platform, DimensionValue, Animated, Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { UserSubscription, ApiUsageLog, PriceHistoryEntry } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useThemeColors } from '../constants/theme';
import { useCatalogStore } from '../store/useCatalogStore';
import agent from '../api/agent';

function DetailLogo({ logoUrl, brandColor, name, size = 80 }: { logoUrl?: string; brandColor: string; name: string; size?: number }) {
    const [imgFailed, setImgFailed] = useState(false);
    if (logoUrl && !imgFailed) {
        return (
            <Image
                source={{ uri: logoUrl }}
                style={{ width: '72%', height: '72%' }}
                resizeMode="contain"
                onError={() => setImgFailed(true)}
            />
        );
    }
    return (
        <Text style={{ fontSize: size * 0.4, fontWeight: 'bold', color: '#FFFFFF' }}>
            {name.charAt(0).toUpperCase()}
        </Text>
    );
}

interface Props {
    visible: boolean;
    subscription: UserSubscription | null;
    onClose: () => void;
    onEdit: (sub: UserSubscription) => void;
}

const { width } = Dimensions.get('window');

type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export default function SubscriptionDetailModal({ visible, subscription: initialSubscription, onClose, onEdit }: Props) {
    const colors = useThemeColors();
    const isDarkMode = useSettingsStore((state) => state.isDarkMode);
    const { removeSubscription, updateSubscription, fetchUsageLogs, fetchUserSubscriptions } = useUserSubscriptionStore();
    const { catalogItems } = useCatalogStore();

    // Canlı veri (store'dan)
    const liveSubscription = useUserSubscriptionStore((state) =>
        state.subscriptions.find((s) => s.id === initialSubscription?.id)
    );
    const subscription = liveSubscription || initialSubscription;

    // Hero animasyonu
    const heroOpacity = useRef(new Animated.Value(1)).current;

    // Mevcut durum türetme
    const currentStatus: SubscriptionStatus = (() => {
        if (!subscription) return 'active';
        if (subscription.isActive !== false) return 'active';
        if (subscription.cancelledAt) return 'cancelled';
        return 'paused';
    })();

    // Status değişince hero opacity'yi güncelle
    useEffect(() => {
        const target = currentStatus === 'active' ? 1 : 0.55;
        Animated.timing(heroOpacity, { toValue: target, duration: 300, useNativeDriver: true }).start();
    }, [currentStatus]);

    const [usageLogsError, setUsageLogsError] = useState(false);
    const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
    const [isDuplicating, setIsDuplicating] = useState(false);

    // Modal açıldığında backend kullanım loglarını ve fiyat geçmişini çek
    useEffect(() => {
        if (visible && subscription?.id) {
            setUsageLogsError(false);
            fetchUsageLogs(subscription.id).then(ok => {
                if (!ok) setUsageLogsError(true);
            });
            // Fiyat geçmişini çek
            agent.UserSubscriptions.priceHistory(subscription.id).then((res: any) => {
                if (res?.data) setPriceHistory(res.data);
                else setPriceHistory([]);
            }).catch(() => setPriceHistory([]));
        } else if (!visible) {
            setPriceHistory([]);
        }
    }, [visible, subscription?.id]);

    // Kullanım geçmişi
    const usageData = useMemo(() => {
        if (!subscription) return [];
        const history = subscription.usageHistory || [];
        const months = [];
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

    // İptal bilgisi hesaplama (early return öncesinde olmalı)
    const cancelInfo = useMemo(() => {
        if (currentStatus !== 'cancelled' || !subscription) return null;
        const cancelledAt = subscription.cancelledAt ? new Date(subscription.cancelledAt) : null;
        const contractEnd = subscription.contractEndDate ? new Date(subscription.contractEndDate) : null;

        let remainingDays: number | null = null;
        if (contractEnd) {
            const now = new Date();
            const diff = Math.ceil((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            remainingDays = diff > 0 ? diff : 0;
        }
        return { cancelledAt, contractEnd, remainingDays };
    }, [currentStatus, subscription?.cancelledAt, subscription?.contractEndDate]);

    if (!subscription) return null;

    // --- AKSİYONLAR ---
    const handleDuplicate = () => {
        Alert.alert(
            'Aboneliği Kopyala',
            `${subscription.name} aboneliğini kopyalamak istiyor musun?`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Kopyala',
                    onPress: async () => {
                        setIsDuplicating(true);
                        try {
                            await agent.UserSubscriptions.duplicate(subscription.id);
                            await fetchUserSubscriptions();
                            Toast.show({ type: 'success', text1: '✅ Kopyalandı', text2: `${subscription.name} kopyalandı.`, position: 'top' });
                            onClose();
                        } catch {
                            // Hata agent interceptor'ı tarafından toast ile gösteriliyor
                        } finally {
                            setIsDuplicating(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Aboneliği Sil',
            `${subscription.name} aboneliğini silmek istediğine emin misin?`,
            [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: async () => { await removeSubscription(subscription.id); onClose(); } },
            ]
        );
    };

    const handleStatusChange = (newStatus: SubscriptionStatus) => {
        if (newStatus === currentStatus) return;

        // Animasyon useEffect([currentStatus]) tarafından yönetiliyor —
        // buradaki manuel tetikleme useEffect ile çakışarak görsel glitch yaratırdı.

        let payload: Partial<UserSubscription> = {};

        if (newStatus === 'active') {
            payload = { isActive: true, cancelledAt: null };
            Toast.show({ type: 'success', text1: '✅ Abonelik Aktifleştirildi', text2: `${subscription.name} yeniden aktif.`, position: 'top' });
        } else if (newStatus === 'paused') {
            payload = { isActive: false, cancelledAt: null };
            Toast.show({ type: 'info', text1: '⏸ Abonelik Durduruldu', text2: `${subscription.name} duraklatıldı.`, position: 'top' });
        } else {
            payload = { isActive: false, cancelledAt: new Date().toISOString() };
            Toast.show({ type: 'error', text1: '❌ Abonelik İptal Edildi', text2: `${subscription.name} iptal edildi.`, position: 'top' });
        }

        updateSubscription(subscription.id, payload);
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
        if (nextDate < today) nextDate.setMonth(nextDate.getMonth() + 1);
        const diffTime = Math.abs(nextDate.getTime() - today.getTime());
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { nextDate, daysLeft };
    };
    const { nextDate, daysLeft } = getBillingData();

    const brandColor = subscription.colorCode || colors.primary;
    const catalogLogoUrl = catalogItems.find(c => c.id === subscription.catalogId)?.logoUrl;

    // Durum sekmeleri config

    const statusTabs: { key: SubscriptionStatus; label: string; icon: string; color: string }[] = [
        { key: 'active',    label: 'Aktif',       icon: 'checkmark-circle',  color: colors.success },
        { key: 'paused',    label: 'Durduruldu',  icon: 'pause-circle',      color: '#F59E0B' },
        { key: 'cancelled', label: 'İptal',        icon: 'close-circle',      color: colors.error },
    ];

    // --- TAAHHÜT ---
    const renderContractInfo = () => {
        if (!subscription.hasContract) return null;
        const start = subscription.contractStartDate ? new Date(subscription.contractStartDate) : null;
        const end = subscription.contractEndDate ? new Date(subscription.contractEndDate) : null;
        return (
            <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 0 }]}>
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
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

                {/* HEADER */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={onClose} style={[styles.iconBtn, { backgroundColor: colors.inputBg }]}>
                        <Ionicons name="chevron-down" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                    <View style={styles.topBarActions}>
                        <TouchableOpacity
                            onPress={handleDuplicate}
                            disabled={isDuplicating}
                            style={[styles.iconBtn, { backgroundColor: colors.inputBg, marginRight: 10 }]}
                        >
                            <Ionicons name="copy-outline" size={20} color={isDuplicating ? colors.textSec : colors.textMain} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { onClose(); onEdit(subscription); }}
                            style={[styles.iconBtn, { backgroundColor: colors.inputBg, marginRight: 10 }]}
                        >
                            <Ionicons name="pencil" size={20} color={colors.textMain} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={[styles.iconBtn, { backgroundColor: colors.error + '20' }]}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* 1. HERO */}
                    <Animated.View style={[styles.heroSection, { opacity: heroOpacity }]}>
                        <View style={[styles.logoContainer, {
                            backgroundColor: currentStatus === 'active' ? (catalogLogoUrl ? colors.white : brandColor) : colors.inactive,
                            shadowColor: brandColor,
                            overflow: 'hidden',
                        }]}>
                            <DetailLogo logoUrl={catalogLogoUrl} brandColor={brandColor} name={subscription.name} />
                        </View>
                        <Text style={[styles.heroTitle, { color: colors.textMain }]}>{subscription.name}</Text>
                        <View style={styles.priceContainer}>
                            <Text style={[styles.heroCurrency, { color: colors.textSec }]}>{subscription.currency}</Text>
                            <Text style={[styles.heroPrice, { color: colors.textMain }]}>{subscription.price}</Text>
                            <Text style={[styles.heroPeriod, { color: colors.textSec }]}>/ay</Text>
                        </View>
                        {/* Durum badge */}
                        {currentStatus !== 'active' && (
                            <View style={[styles.badge, {
                                backgroundColor: currentStatus === 'cancelled' ? colors.error + '20' : '#F59E0B20',
                                borderWidth: 1,
                                borderColor: currentStatus === 'cancelled' ? colors.error : '#F59E0B',
                            }]}>
                                <Ionicons
                                    name={currentStatus === 'cancelled' ? 'close-circle' : 'pause-circle'}
                                    size={12}
                                    color={currentStatus === 'cancelled' ? colors.error : '#F59E0B'}
                                />
                                <Text style={[styles.badgeText, {
                                    color: currentStatus === 'cancelled' ? colors.error : '#F59E0B',
                                    marginLeft: 4,
                                }]}>
                                    {currentStatus === 'cancelled' ? 'İPTAL EDİLDİ' : 'DURDURULDU'}
                                </Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* 2. DURUM SEKMELERİ (Full width) */}
                    <View style={[styles.statusCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="radio-button-on-outline" size={16} color={colors.textSec} />
                            <Text style={[styles.cardLabel, { color: colors.textSec }]}>ABONELİK DURUMU</Text>
                        </View>
                        <View style={styles.statusTabRow}>
                            {statusTabs.map((tab) => {
                                const isSelected = currentStatus === tab.key;
                                // Cancelled terminal state: Active ve Paused butonları devre dışı
                                const isDisabled = currentStatus === 'cancelled' && tab.key !== 'cancelled';
                                return (
                                    <TouchableOpacity
                                        key={tab.key}
                                        style={[
                                            styles.statusTab,
                                            {
                                                backgroundColor: isSelected ? tab.color + '1A' : colors.inputBg,
                                                borderColor: isSelected ? tab.color : colors.border,
                                                opacity: isDisabled ? 0.35 : 1,
                                            },
                                        ]}
                                        onPress={() => !isDisabled && handleStatusChange(tab.key)}
                                        activeOpacity={isDisabled ? 1 : 0.7}
                                    >
                                        <Ionicons
                                            name={tab.icon as any}
                                            size={18}
                                            color={isSelected ? tab.color : colors.textSec}
                                        />
                                        <Text style={[styles.statusTabText, { color: isSelected ? tab.color : colors.textSec }]}>
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* 3. İPTAL BİLGİ KARTI (sadece iptal durumunda) */}
                    {currentStatus === 'cancelled' && cancelInfo && (
                        <View style={[styles.cancelCard, { backgroundColor: colors.error + '0D', borderColor: colors.error + '40' }]}>
                            <View style={styles.cancelCardHeader}>
                                <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                                <Text style={[styles.cancelCardTitle, { color: colors.error }]}>İptal Bilgisi</Text>
                            </View>
                            <View style={styles.cancelRows}>
                                {cancelInfo.cancelledAt && (
                                    <View style={styles.cancelRow}>
                                        <Text style={[styles.cancelLabel, { color: colors.textSec }]}>İptal Tarihi</Text>
                                        <Text style={[styles.cancelValue, { color: colors.textMain }]}>
                                            {cancelInfo.cancelledAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </Text>
                                    </View>
                                )}
                                {cancelInfo.contractEnd && (
                                    <View style={styles.cancelRow}>
                                        <Text style={[styles.cancelLabel, { color: colors.textSec }]}>Erişim Sona Eriyor</Text>
                                        <Text style={[styles.cancelValue, { color: colors.textMain }]}>
                                            {cancelInfo.contractEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </Text>
                                    </View>
                                )}
                                {cancelInfo.remainingDays !== null && (
                                    <View style={[styles.cancelRow, styles.cancelRowLast]}>
                                        <Text style={[styles.cancelLabel, { color: colors.textSec }]}>Kalan Erişim</Text>
                                        <View style={[styles.remainingBadge, {
                                            backgroundColor: cancelInfo.remainingDays > 7 ? colors.success + '20' : colors.error + '20',
                                        }]}>
                                            <Text style={[styles.remainingText, {
                                                color: cancelInfo.remainingDays > 7 ? colors.success : colors.error,
                                            }]}>
                                                {cancelInfo.remainingDays} gün kaldı
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                {!cancelInfo.contractEnd && (
                                    <Text style={[styles.cancelNote, { color: colors.textSec }]}>
                                        Taahhüt bilgisi bulunamadı.
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* 4. SONRAKİ ÖDEME KARTI */}
                    <View style={[styles.nextPaymentCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="calendar-outline" size={16} color={colors.textSec} />
                            <Text style={[styles.cardLabel, { color: colors.textSec }]}>SONRAKİ ÖDEME</Text>
                        </View>
                        {currentStatus === 'active' ? (
                            <View style={styles.nextPaymentBody}>
                                <Text style={[styles.nextPaymentDate, { color: colors.textMain }]}>
                                    {nextDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                </Text>
                                <View style={[styles.daysLeftBadge, {
                                    backgroundColor: daysLeft <= 3 ? colors.error + '20' : colors.success + '20',
                                }]}>
                                    <Text style={[styles.daysLeftText, { color: daysLeft <= 3 ? colors.error : colors.success }]}>
                                        {daysLeft} gün kaldı
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={[styles.nextPaymentDate, { color: colors.textSec, fontSize: 15 }]}>—</Text>
                        )}
                    </View>

                    {/* 5. KULLANIM GEÇMİŞİ */}
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
                                    if (m.status === 'active') { height = '80%'; bgColor = colors.success; labelColor = colors.success; }
                                    else if (m.status === 'low') { height = '45%'; bgColor = colors.accent; labelColor = colors.accent; }
                                    else if (m.status === 'none') { height = '20%'; bgColor = colors.error; labelColor = colors.error; }
                                    return (
                                        <View key={i} style={styles.barWrapper}>
                                            <View style={styles.barTrack}>
                                                <View style={[styles.barFill, { height, backgroundColor: bgColor }]} />
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

                    {/* 6. BACKEND KULLANIM LOGLARI */}
                    {(usageLogsError || (subscription.usageLogs && subscription.usageLogs.length > 0)) && (
                        <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Kayıtlı Kullanımlar</Text>
                                {!usageLogsError && (
                                    <Text style={[styles.sectionSubtitle, { color: colors.textSec }]}>{subscription.usageLogs!.length} kayıt</Text>
                                )}
                            </View>
                            {usageLogsError ? (
                                <View style={[styles.errorRow, { backgroundColor: colors.error + '12' }]}>
                                    <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                                    <Text style={[styles.errorText, { color: colors.error }]}>
                                        Kullanım kayıtları yüklenemedi.
                                    </Text>
                                </View>
                            ) : subscription.usageLogs!.map((log: ApiUsageLog) => (
                                <View key={log.id} style={[styles.detailItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                    <View style={styles.detailLeft}>
                                        <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                                            <Ionicons name="time-outline" size={18} color={colors.primary} />
                                        </View>
                                        <View>
                                            <Text style={[styles.detailLabel, { color: colors.textMain }]}>
                                                {new Date(log.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </Text>
                                            {log.note ? <Text style={[styles.legendText, { color: colors.textSec }]}>{log.note}</Text> : null}
                                        </View>
                                    </View>
                                    {log.amount != null && (
                                        <Text style={[styles.detailValue, { color: colors.textSec }]}>
                                            {log.amount} {log.unit ?? ''}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* 7. TAAHHÜT BİLGİSİ */}
                    {renderContractInfo()}

                    {/* 8. FİYAT GEÇMİŞİ */}
                    {priceHistory.length > 0 && (
                        <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 0 }]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Fiyat Geçmişi</Text>
                                <Ionicons name="trending-up-outline" size={18} color={colors.textSec} />
                            </View>
                            {priceHistory.map((entry, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.priceHistoryRow,
                                        idx < priceHistory.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                                    ]}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                                        <Ionicons name="swap-vertical-outline" size={18} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.priceHistoryPrices}>
                                            <Text style={[styles.priceHistoryOld, { color: colors.textSec }]}>
                                                {entry.oldPrice} {entry.currency}
                                            </Text>
                                            <Ionicons name="arrow-forward" size={14} color={entry.newPrice > entry.oldPrice ? colors.error : colors.success} style={{ marginHorizontal: 6 }} />
                                            <Text style={[styles.priceHistoryNew, { color: entry.newPrice > entry.oldPrice ? colors.error : colors.success }]}>
                                                {entry.newPrice} {entry.currency}
                                            </Text>
                                        </View>
                                        <Text style={[styles.priceHistoryDate, { color: colors.textSec }]}>
                                            {new Date(entry.changedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* 9. NOTLAR (eski 8) */}
                    {subscription.notes && subscription.notes.trim().length > 0 && (
                        <View style={[styles.sectionContainer, { backgroundColor: colors.cardBg, borderColor: colors.border, marginTop: 0 }]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Notlar</Text>
                                <Ionicons name="create-outline" size={18} color={colors.textSec} />
                            </View>
                            <Text style={{ fontSize: 14, color: colors.textSec, lineHeight: 22 }}>
                                {subscription.notes}
                            </Text>
                        </View>
                    )}

                    {/* 9. DETAYLAR */}
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

    // Hero
    heroSection: { alignItems: 'center', marginTop: 20, marginBottom: 28 },
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
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        marginTop: 10,
    },
    badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

    // Durum Kartı
    statusCard: {
        marginHorizontal: 20,
        marginBottom: 14,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    statusTabRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statusTab: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 4,
    },
    statusTabText: {
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },

    // İptal Kartı
    cancelCard: {
        marginHorizontal: 20,
        marginBottom: 14,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    cancelCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    cancelCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },
    cancelRows: {},
    cancelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(239,68,68,0.12)',
    },
    cancelRowLast: {
        borderBottomWidth: 0,
    },
    cancelLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    cancelValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    cancelNote: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
        opacity: 0.7,
    },
    remainingBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    remainingText: {
        fontSize: 12,
        fontWeight: '800',
    },

    // Sonraki Ödeme
    nextPaymentCard: {
        marginHorizontal: 20,
        marginBottom: 14,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    nextPaymentBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    nextPaymentDate: {
        fontSize: 18,
        fontWeight: '700',
    },
    daysLeftBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    daysLeftText: {
        fontSize: 12,
        fontWeight: '800',
    },

    // Bölümler
    sectionContainer: {
        marginHorizontal: 20,
        marginBottom: 14,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    sectionSubtitle: { fontSize: 12, fontWeight: '500' },

    // Grafik
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

    // Detay Listesi
    detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    detailLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    detailLabel: { fontSize: 14, fontWeight: '600' },
    detailValue: { fontSize: 14, fontWeight: '500' },

    // Taahhüt
    contractRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    contractItem: { flex: 1, alignItems: 'center' },
    contractLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
    contractValue: { fontSize: 15, fontWeight: '600' },
    divider: { width: 1, height: 40, marginHorizontal: 10 },

    scrollContent: { paddingBottom: 40 },

    // Fiyat Geçmişi
    priceHistoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    priceHistoryPrices: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    priceHistoryOld: {
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'line-through',
    },
    priceHistoryNew: {
        fontSize: 14,
        fontWeight: '700',
    },
    priceHistoryDate: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },

    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
