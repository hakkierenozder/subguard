import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Modal, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Alert, 
    StatusBar,
    Image,
    Dimensions
} from 'react-native';
import { UserSubscription, UsageLog } from '../types';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AddSubscriptionModal from './AddSubscriptionModal';

interface Props {
  visible: boolean;
  subscription: UserSubscription | null;
  onClose: () => void;
}

const THEME = {
    primary: '#334155',    // Slate 700
    primaryDark: '#1E293B',// Slate 800
    accent: '#4F46E5',     // Indigo
    bg: '#F8FAFC',
    cardBg: '#FFFFFF',
    textMain: '#0F172A',
    textSec: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    inactive: '#94A3B8'
};

export default function SubscriptionDetailModal({ visible, subscription, onClose }: Props) {
  const { removeSubscription, updateSubscription } = useUserSubscriptionStore();
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  
  // OPTIMISTIC UI İÇİN LOCAL STATE
  const [localSub, setLocalSub] = useState<UserSubscription | null>(null);

  // Modal her açıldığında veya subscription prop'u değiştiğinde local state'i güncelle
  useEffect(() => {
      setLocalSub(subscription);
  }, [subscription, visible]);

  if (!localSub) return null;

  const isActive = localSub.isActive !== false; // null veya true ise aktiftir
  const cardColor = localSub.colorCode || THEME.primary;

  // --- HESAPLAMALAR ---
  const sharedCount = (localSub.sharedWith?.length || 0) + 1; // Kullanıcı + Ortaklar
  const pricePerPerson = (localSub.price / sharedCount).toFixed(2);

  // --- AKSİYONLAR ---
  const handleDelete = () => {
    Alert.alert(
      "Aboneliği Sil",
      `${localSub.name} aboneliğini silmek istediğine emin misin?`,
      [
        { text: "Vazgeç", style: "cancel" },
        { 
            text: "Sil", 
            style: "destructive", 
            onPress: async () => {
                await removeSubscription(localSub.id);
                onClose();
            }
        }
      ]
    );
  };

  const handleToggleStatus = async () => {
      // 1. Önce UI'ı hemen güncelle (Optimistic Update)
      const newStatus = !isActive;
      setLocalSub(prev => prev ? ({ ...prev, isActive: newStatus }) : null);

      // 2. Arka planda API'ye gönder
      const updateData = {
          ...localSub,
          isActive: newStatus,
          // Tarihleri string güvenliği için kontrol et
          contractStartDate: localSub.contractStartDate || undefined,
          contractEndDate: localSub.contractEndDate || undefined,
      };

      try {
          await updateSubscription(localSub.id, updateData);
      } catch (error) {
          // Hata olursa UI'ı geri al
          setLocalSub(prev => prev ? ({ ...prev, isActive: !newStatus }) : null);
          Alert.alert("Hata", "Durum güncellenemedi, değişiklik geri alındı.");
      }
  };

  const getUsageColor = (status: string) => {
      switch(status) {
          case 'active': return THEME.success;
          case 'low': return THEME.warning;
          case 'none': return THEME.danger;
          default: return THEME.textSec;
      }
  };

  const getUsageLabel = (status: string) => {
      switch(status) {
          case 'active': return 'Aktif';
          case 'low': return 'Az';
          case 'none': return 'Kullanılmıyor';
          default: return '-';
      }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.7)" />
        
        <View style={styles.modalContainer}>
            
            {/* ÜST HERO ALANI */}
            <LinearGradient
                colors={isActive ? [cardColor, THEME.primaryDark] : [THEME.inactive, '#475569']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.logoWrapper}>
                    {localSub.logoUrl ? (
                        <Image source={{ uri: localSub.logoUrl }} style={styles.logoImage} />
                    ) : (
                        <Text style={[styles.logoText, { color: cardColor }]}>
                            {localSub.name.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>

                <Text style={styles.subName}>{localSub.name}</Text>
                
                {/* Durum Badge */}
                <TouchableOpacity onPress={handleToggleStatus} activeOpacity={0.8}>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)' }]}>
                        <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#CBD5E1' }]} />
                        <Text style={styles.statusText}>{isActive ? 'Aktif Abonelik' : 'Durduruldu'}</Text>
                    </View>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                
                {/* 1. FİYAT & ÖDEME BİLGİSİ */}
                <View style={styles.priceSection}>
                    <Text style={styles.sectionTitle}>MALİYET DETAYLARI</Text>
                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>Toplam Tutar</Text>
                            <Text style={[styles.priceValue, !isActive && { color: THEME.textSec }]}>
                                {localSub.price} <Text style={{fontSize: 16}}>{localSub.currency}</Text>
                            </Text>
                        </View>
                        {sharedCount > 1 && (
                            <View style={styles.splitPriceBox}>
                                <Text style={styles.priceLabel}>Sana Düşen</Text>
                                <Text style={[styles.priceValue, { color: THEME.accent }]}>
                                    {pricePerPerson} <Text style={{fontSize: 16}}>{localSub.currency}</Text>
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.billingInfo}>
                        <Ionicons name="calendar-outline" size={14} color={THEME.textSec} /> Her ayın {localSub.billingDay}. günü yenilenir.
                    </Text>
                </View>

                {/* 2. ORTAKLAR (Varsa) */}
                {localSub.sharedWith && localSub.sharedWith.length > 0 && (
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>ORTAK KULLANIM ({sharedCount} Kişi)</Text>
                        <View style={styles.sharedContainer}>
                            <View style={styles.sharedChip}>
                                <Ionicons name="person" size={12} color="#FFF" />
                                <Text style={styles.sharedTextMe}>Sen</Text>
                            </View>
                            {localSub.sharedWith.map((person, idx) => (
                                <View key={idx} style={[styles.sharedChip, styles.sharedChipOther]}>
                                    <Text style={styles.sharedText}>{person}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 3. KULLANIM GEÇMİŞİ (Varsa) */}
                {localSub.usageHistory && localSub.usageHistory.length > 0 && (
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>KULLANIM GEÇMİŞİ</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 8}}>
                            {localSub.usageHistory.map((log, idx) => (
                                <View key={idx} style={styles.usageCard}>
                                    <View style={[styles.usageDot, { backgroundColor: getUsageColor(log.status) }]} />
                                    <Text style={styles.usageMonth}>{log.month}</Text>
                                    <Text style={[styles.usageStatus, { color: getUsageColor(log.status) }]}>
                                        {getUsageLabel(log.status)}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* 4. DİĞER DETAYLAR */}
                <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>DİĞER BİLGİLER</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kategori</Text>
                        <Text style={styles.infoValue}>{localSub.category || 'Genel'}</Text>
                    </View>
                    {localSub.hasContract && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Taahhüt Bitiş</Text>
                            <Text style={[styles.infoValue, { color: '#D97706' }]}>
                                {localSub.contractEndDate 
                                    ? new Date(localSub.contractEndDate).toLocaleDateString('tr-TR') 
                                    : '-'}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{height: 20}} />

                {/* AKSİYON BUTONLARI */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: isActive ? '#FEF2F2' : '#F0FDF4' }]} 
                        onPress={handleToggleStatus}
                    >
                        <Ionicons name={isActive ? "pause" : "play"} size={20} color={isActive ? THEME.danger : THEME.success} />
                        <Text style={[styles.actionText, { color: isActive ? THEME.danger : THEME.success }]}>
                            {isActive ? 'Durdur' : 'Başlat'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]} onPress={() => setEditModalVisible(true)}>
                        <Ionicons name="create-outline" size={20} color={THEME.accent} />
                        <Text style={[styles.actionText, { color: THEME.accent }]}>Düzenle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F1F5F9' }]} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={20} color={THEME.textSec} />
                        <Text style={[styles.actionText, { color: THEME.textSec }]}>Sil</Text>
                    </TouchableOpacity>
                </View>

                <View style={{height: 40}} />
            </ScrollView>
        </View>

        {/* DÜZENLEME MODALI */}
        {isEditModalVisible && (
            <AddSubscriptionModal
                visible={isEditModalVisible}
                onClose={() => {
                    setEditModalVisible(false);
                    // Modal kapandığında ana listeyi tazelemek için parent'ı tetikleyebiliriz
                    // Ama store zaten güncel, bir sonraki girişte güncellenir.
                }}
                selectedCatalogItem={null}
                subscriptionToEdit={localSub}
            />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    justifyContent: 'flex-end', // Alttan açılır gibi dursun
  },
  modalContainer: {
    width: '100%',
    height: '92%', // Ekranı neredeyse kaplasın
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  
  // Header
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: THEME.textSec,
      marginBottom: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
  },
  
  // Price Section
  priceSection: {
      marginBottom: 24,
      backgroundColor: '#F8FAFC',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
  },
  priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  splitPriceBox: {
      alignItems: 'flex-end',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
  },
  priceLabel: {
      fontSize: 12,
      color: THEME.textSec,
      marginBottom: 2,
  },
  priceValue: {
      fontSize: 24,
      fontWeight: '800',
      color: THEME.textMain,
  },
  billingInfo: {
      marginTop: 12,
      fontSize: 13,
      color: THEME.textSec,
      fontWeight: '500',
  },

  // Shared Section
  detailSection: {
      marginBottom: 24,
  },
  sharedContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
  },
  sharedChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
  },
  sharedChipOther: {
      backgroundColor: '#E2E8F0',
  },
  sharedTextMe: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
  },
  sharedText: {
      color: THEME.textMain,
      fontSize: 12,
      fontWeight: '600',
  },

  // Usage History
  usageCard: {
      backgroundColor: '#FFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 12,
      padding: 10,
      marginRight: 10,
      width: 80,
      alignItems: 'center',
  },
  usageDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: 6,
  },
  usageMonth: {
      fontSize: 12,
      fontWeight: '700',
      color: THEME.textMain,
  },
  usageStatus: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
  },

  // Info Row
  infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
      fontSize: 14,
      color: THEME.textSec,
      fontWeight: '500',
  },
  infoValue: {
      fontSize: 14,
      color: THEME.textMain,
      fontWeight: '600',
  },

  // Actions
  actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 14,
      marginHorizontal: 4,
  },
  actionText: {
      fontSize: 13,
      fontWeight: '700',
      marginLeft: 6,
  },
});