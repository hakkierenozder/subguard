import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { UserSubscription, UsageStatus } from '../types/index';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  subscription: UserSubscription | null;
  onAnswer: (status: UsageStatus) => void;
  onClose: () => void;
}

export default function UsageSurveyModal({ visible, subscription, onAnswer, onClose }: Props) {
  if (!subscription) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { borderTopColor: subscription.colorCode || '#333' }]}>
          
          {/* Başlık ve Kapatma */}
          <View style={styles.header}>
            <Text style={styles.title}>Kullanım Kontrolü 🕵️‍♂️</Text>
            <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Soru */}
          <View style={styles.content}>
            <Text style={styles.question}>
              Bu ay <Text style={{fontWeight: 'bold', color: subscription.colorCode || '#333'}}>{subscription.name}</Text> servisini ne kadar kullandın?
            </Text>
            <Text style={styles.priceInfo}>({subscription.price} {subscription.currency} ödedin)</Text>
          </View>

          {/* Cevap Butonları */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnActive]} onPress={() => onAnswer('active')}>
                <Text style={styles.emoji}>🔥</Text>
                <Text style={styles.btnText}>Çok / Aktif</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnLow]} onPress={() => onAnswer('low')}>
                <Text style={styles.emoji}>👀</Text>
                <Text style={styles.btnText}>Arada Bir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnNone]} onPress={() => onAnswer('none')}>
                <Text style={styles.emoji}>👻</Text>
                <Text style={styles.btnText}>Hiç Girmedim</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, borderTopWidth: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { marginBottom: 20, alignItems: 'center' },
  question: { fontSize: 18, textAlign: 'center', color: '#444', marginBottom: 5 },
  priceInfo: { fontSize: 14, color: '#999' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginHorizontal: 4 },
  btnActive: { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' },
  btnLow: { backgroundColor: '#fff8e1', borderColor: '#ffecb3' },
  btnNone: { backgroundColor: '#ffebee', borderColor: '#ffcdd2' },
  emoji: { fontSize: 24, marginBottom: 5 },
  btnText: { fontSize: 11, fontWeight: 'bold', color: '#555', textAlign: 'center' }
});