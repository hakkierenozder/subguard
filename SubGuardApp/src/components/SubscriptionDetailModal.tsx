import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { UserSubscription, UsageStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { convertToTRY } from '../utils/CurrencyService';

interface Props {
  visible: boolean;
  subscription: UserSubscription | null;
  onClose: () => void;
  onEdit: (sub: UserSubscription) => void;
}

const { width } = Dimensions.get('window');

export default function SubscriptionDetailModal({ visible, subscription, onClose, onEdit }: Props) {
  const { removeSubscription } = useUserSubscriptionStore();

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
          const key = d.toISOString().slice(0, 7); // "2024-01"
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
      switch(status) {
          case 'active': return { backgroundColor: '#2ecc71', height: 24 }; // Yüksek
          case 'low': return { backgroundColor: '#f1c40f', height: 16 };    // Orta
          case 'none': return { backgroundColor: '#e74c3c', height: 8 };    // Düşük/Yok
          default: return { backgroundColor: '#eee', height: 4 };           // Veri Yok
      }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        
        {/* HEADER: İsim ve İkon */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="chevron-down" size={28} color="#999" />
            </TouchableOpacity>
            
            <View style={[styles.logoContainer, { backgroundColor: subscription.colorCode || '#333' }]}>
                <Text style={styles.logoText}>{subscription.name.charAt(0)}</Text>
            </View>
            
            <Text style={styles.title}>{subscription.name}</Text>
            <Text style={styles.price}>{subscription.price} {subscription.currency}</Text>
            
            <View style={styles.badgeRow}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{subscription.category}</Text>
                </View>
                {subscription.hasContract && (
                    <View style={[styles.badge, { backgroundColor: '#fff3cd' }]}>
                        <Text style={[styles.badgeText, { color: '#856404' }]}>Sözleşmeli</Text>
                    </View>
                )}
            </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
            
            {/* 1. ÖZET KARTLARI */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Sonraki Ödeme</Text>
                    <Text style={styles.statValue}>{daysLeft} Gün</Text>
                    <Text style={styles.statSub}>{nextBillingDate.toLocaleDateString('tr-TR')}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Senin Payın</Text>
                    <Text style={[styles.statValue, { color: '#2ecc71' }]}>{myShare.toFixed(1)} {subscription.currency}</Text>
                    <Text style={styles.statSub}>{partnersCount > 0 ? `${partnersCount} kişiyle ortak` : 'Bireysel'}</Text>
                </View>
            </View>

            {/* 2. KULLANIM GEÇMİŞİ */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kullanım Sıklığı (Son 6 Ay)</Text>
                {renderUsageHistory()}
                <Text style={styles.helperText}>* Veriler anket yanıtlarına göre oluşturulur.</Text>
            </View>

{/* 3. ORTAK KULLANICILAR VE PAYLAŞIM */}
            {partnersCount > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Maliyet Paylaşımı</Text>
                    
                    <View style={styles.partnerList}>
                        {/* 1. KENDİSİ (Ben) */}
                        <View style={styles.partnerRow}>
                            <View style={styles.partnerLeft}>
                                <View style={[styles.avatarSmall, { backgroundColor: '#333' }]}>
                                    <Text style={[styles.avatarTextSmall, { color: '#fff' }]}>Ben</Text>
                                </View>
                                <Text style={styles.partnerName}>Ben (Abonelik Sahibi)</Text>
                            </View>
                            <Text style={styles.partnerAmount}>{myShare.toFixed(1)} {subscription.currency}</Text>
                        </View>

                        {/* 2. DİĞER ORTAKLAR */}
                        {subscription.sharedWith?.map((person, idx) => (
                            <View key={idx} style={styles.partnerRow}>
                                <View style={styles.partnerLeft}>
                                    <View style={[styles.avatarSmall, { backgroundColor: '#f0f0f0' }]}>
                                        <Text style={[styles.avatarTextSmall, { color: '#555' }]}>
                                            {person.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.partnerName}>{person}</Text>
                                </View>
                                <Text style={styles.partnerAmount}>{myShare.toFixed(1)} {subscription.currency}</Text>
                            </View>
                        ))}
                    </View>
                    
                    <Text style={styles.helperText}>Toplam tutar {partnersCount + 1} kişiye eşit bölünmüştür.</Text>
                </View>
            )}

            {/* 4. SÖZLEŞME BİLGİSİ */}
            {subscription.hasContract && subscription.contractEndDate && (
                <View style={[styles.section, { borderLeftWidth: 4, borderLeftColor: '#e74c3c', paddingLeft: 10 }]}>
                    <Text style={styles.sectionTitle}>Sözleşme Bitiş</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {new Date(subscription.contractEndDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                    <Text style={{ color: '#666', marginTop: 5 }}>İptal etmeden önce taahhüt bedelini kontrol et.</Text>
                </View>
            )}

        </ScrollView>

        {/* FOOTER: İşlemler */}
        <View style={styles.footer}>
            <TouchableOpacity style={styles.editBtn} onPress={() => { onClose(); onEdit(subscription); }}>
                <Ionicons name="create-outline" size={20} color="#333" />
                <Text style={styles.editBtnText}>Düzenle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.deleteBtnText}>Aboneliği İptal Et</Text>
            </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  closeBtn: { position: 'absolute', top: 15, left: 20, padding: 10, zIndex: 9 },
  logoContainer: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  logoText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  price: { fontSize: 18, color: '#666', fontWeight: '500' },
  badgeRow: { flexDirection: 'row', marginTop: 10 },
  badge: { backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginHorizontal: 4 },
  badgeText: { fontSize: 12, color: '#666', fontWeight: '600' },

  content: { padding: 20 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { flex: 0.48, backgroundColor: '#fff', padding: 15, borderRadius: 16, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
  statLabel: { fontSize: 12, color: '#999', marginBottom: 5, textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statSub: { fontSize: 11, color: '#bbb', marginTop: 2 },

  section: { marginBottom: 25, backgroundColor: '#fff', padding: 15, borderRadius: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  usageContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 60, paddingBottom: 5 },
  usageItem: { alignItems: 'center', width: (width - 80) / 6 },
  usageDot: { width: 12, borderRadius: 6, marginBottom: 8 },
  usageText: { fontSize: 10, color: '#999' },
  helperText: { fontSize: 10, color: '#ccc', marginTop: 10, fontStyle: 'italic' },
  avatarMe: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: -10, borderWidth: 2, borderColor: '#fff', zIndex: 2 },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  avatarPartner: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: -10, borderWidth: 2, borderColor: '#fff' },
  partnerText: { color: '#555', fontWeight: 'bold' },

  footer: { flexDirection: 'row', padding: 20, paddingBottom: 40, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  editBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 16, borderRadius: 12, marginRight: 10 },
  editBtnText: { marginLeft: 8, fontWeight: '600', color: '#333' },
  deleteBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff4444', padding: 16, borderRadius: 12 },
  deleteBtnText: { marginLeft: 8, fontWeight: '600', color: '#fff' },
  partnerList: {
    marginTop: 5,
  },
  partnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    paddingBottom: 8,
  },
  partnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarTextSmall: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  partnerName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  partnerAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});