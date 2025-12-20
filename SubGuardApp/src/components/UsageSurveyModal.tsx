import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserSubscription, UsageStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  subscription: UserSubscription | null;
  onClose: () => void;
  onResponse: (status: UsageStatus) => void;
}

export default function UsageSurveyModal({ visible, subscription, onClose, onResponse }: Props) {
  if (!subscription) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
             <Ionicons name="analytics" size={40} color="#333" />
          </View>
          
          <Text style={styles.title}>Kullanım Kontrolü 🧐</Text>
          <Text style={styles.subtitle}>
            <Text style={{fontWeight:'bold'}}>{subscription.name}</Text> aboneliğini bu ay ne kadar kullandın?
          </Text>

          <View style={styles.optionsContainer}>
            {/* active: Çok Kullandım */}
            <TouchableOpacity style={[styles.optionBtn, {backgroundColor: '#2ecc71'}]} onPress={() => onResponse('active')}>
                <Text style={styles.emoji}>🔥</Text>
                <Text style={styles.btnText}>Çok Kullandım</Text>
            </TouchableOpacity>

            {/* low: Az/Eh İşte */}
            <TouchableOpacity style={[styles.optionBtn, {backgroundColor: '#f1c40f'}]} onPress={() => onResponse('low')}>
                <Text style={styles.emoji}>😐</Text>
                <Text style={styles.btnText}>Eh İşte</Text>
            </TouchableOpacity>

            {/* none: Hiç */}
            <TouchableOpacity style={[styles.optionBtn, {backgroundColor: '#e74c3c'}]} onPress={() => onResponse('none')}>
                <Text style={styles.emoji}>🕸️</Text>
                <Text style={styles.btnText}>Hiç Kullanmadım</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
            <Text style={styles.skipText}>Şimdilik Geç</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, width: '100%', alignItems: 'center', elevation: 5 },
  iconContainer: { marginBottom: 15, backgroundColor: '#f0f0f0', padding: 15, borderRadius: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  optionsContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  optionBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  emoji: { fontSize: 24, marginBottom: 5 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 11, textAlign:'center' },
  skipBtn: { marginTop: 20, padding: 10 },
  skipText: { color: '#999', textDecorationLine: 'underline' }
});