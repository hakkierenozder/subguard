import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { UserSubscription, UsageLog } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  subscription: UserSubscription | null;
  onClose: () => void;
  onEdit: () => void; // Düzenleme ekranını tetiklemek için
}

const { width } = Dimensions.get('window');

export default function SubscriptionDetailModal({ visible, subscription, onClose, onEdit }: Props) {
  if (!subscription) return null;

  const themeColor = subscription.colorCode || '#333';

  // Kullanım Geçmişi ikonlarını belirle
  const getUsageIcon = (status: string) => {
    switch (status) {
      case 'active': return '🔥';
      case 'low': return '😐';
      case 'none': return '🕸️';
      default: return '❓';
    }
  };

  const getUsageLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Yoğun';
      case 'low': return 'Az';
      case 'none': return 'Kullanılmadı';
      default: return '-';
    }
  };

  // Son 6 aylık veriyi (veya mevcut tüm veriyi) tersten sırala (en yeni en başta)
  const history = [...(subscription.usageHistory || [])].reverse();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        
        {/* HERO HEADER (Renkli Alan) */}
        <View style={[styles.header, { backgroundColor: themeColor }]}>
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.navBar}>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detaylar</Text>
              <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.subName}>{subscription.name}</Text>
              <Text style={styles.subPrice}>
                {subscription.price} <Text style={{fontSize: 20, fontWeight:'500'}}>{subscription.currency}</Text>
              </Text>
              <Text style={styles.billingText}>Her ayın {subscription.billingDay}. günü yenilenir</Text>
            </View>
          </SafeAreaView>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          {/* 1. KULLANIM GEÇMİŞİ (Analiz) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kullanım Geçmişi 📊</Text>
            {history.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
                {history.map((log, index) => (
                  <View key={index} style={styles.historyCard}>
                    <Text style={styles.historyEmoji}>{getUsageIcon(log.status)}</Text>
                    <Text style={styles.historyMonth}>{log.month}</Text>
                    <Text style={[
                      styles.historyLabel, 
                      { color: log.status === 'active' ? '#2ecc71' : log.status === 'none' ? '#e74c3c' : '#f1c40f' }
                    ]}>
                      {getUsageLabel(log.status)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="analytics-outline" size={32} color="#ccc" />
                <Text style={styles.emptyText}>Henüz kullanım verisi yok.</Text>
                <Text style={styles.emptySubText}>Her ay sana sorduğumuzda burası dolacak.</Text>
              </View>
            )}
          </View>

          {/* 2. ORTAK KULLANIM BİLGİSİ */}
          {(subscription.sharedWith && subscription.sharedWith.length > 0) && (
             <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ortaklar 🤝</Text>
                <View style={styles.sharedList}>
                    {/* Kendisi */}
                    <View style={styles.personChip}>
                        <View style={[styles.avatar, {backgroundColor: themeColor}]}>
                            <Text style={styles.avatarText}>B</Text>
                        </View>
                        <Text style={styles.personName}>Ben</Text>
                    </View>
                    
                    {/* Diğerleri */}
                    {subscription.sharedWith.map((person, idx) => (
                        <View key={idx} style={styles.personChip}>
                             <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{person.charAt(0).toUpperCase()}</Text>
                             </View>
                            <Text style={styles.personName}>{person}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.shareNote}>
                    Kişi başı düşen tutar: <Text style={{fontWeight:'bold', color: themeColor}}>
                        {(subscription.price / (subscription.sharedWith.length + 1)).toFixed(2)} {subscription.currency}
                    </Text>
                </Text>
             </View>
          )}

          {/* 3. SÖZLEŞME BİLGİSİ */}
          {subscription.hasContract && subscription.contractEndDate && (
             <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sözleşme Durumu 📜</Text>
                <View style={styles.contractCard}>
                    <Ionicons name="calendar" size={24} color="#555" />
                    <View style={{marginLeft: 15}}>
                        <Text style={styles.contractLabel}>Bitiş Tarihi</Text>
                        <Text style={styles.contractDate}>
                            {new Date(subscription.contractEndDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                </View>
             </View>
          )}

          {/* 4. DİĞER BİLGİLER */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bilgiler</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kategori</Text>
                <Text style={styles.infoValue}>{subscription.category}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sonraki Ödeme</Text>
                <Text style={styles.infoValue}>{subscription.billingDay}. Gün</Text>
            </View>
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  safeArea: { flex: 1 },
  header: { height: 250, paddingHorizontal: 20 },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '600', opacity: 0.9 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  
  heroContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 },
  subName: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 5, textAlign: 'center' },
  subPrice: { fontSize: 42, fontWeight: '800', color: 'white' },
  billingText: { color: 'rgba(255,255,255,0.8)', marginTop: 5, fontSize: 13 },

  content: { padding: 20, paddingTop: 25, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#f8f9fa', marginTop: -20 },
  
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  
  // Usage History Styles
  historyScroll: { flexDirection: 'row' },
  historyCard: { 
      backgroundColor: 'white', padding: 12, borderRadius: 12, marginRight: 10, alignItems: 'center',
      minWidth: 90, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3 
  },
  historyEmoji: { fontSize: 24, marginBottom: 5 },
  historyMonth: { fontSize: 12, color: '#666', fontWeight: '600' },
  historyLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  
  emptyBox: { alignItems: 'center', padding: 20, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#eee', borderStyle: 'dashed' },
  emptyText: { color: '#666', marginTop: 10, fontWeight: '600' },
  emptySubText: { color: '#999', fontSize: 11, marginTop: 2 },

  // Shared Styles
  sharedList: { flexDirection: 'row', flexWrap: 'wrap' },
  personChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 6, paddingRight: 12, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  personName: { fontSize: 13, color: '#333' },
  shareNote: { fontSize: 12, color: '#666', marginTop: 5, marginLeft: 5 },

  // Contract Styles
  contractCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  contractLabel: { fontSize: 12, color: '#999' },
  contractDate: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 2 },

  // Info Styles
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, backgroundColor: 'white', paddingHorizontal: 15, borderRadius: 12 },
  infoLabel: { color: '#666' },
  infoValue: { fontWeight: '600', color: '#333' },
  divider: { height: 8 }, // Boşluk
});