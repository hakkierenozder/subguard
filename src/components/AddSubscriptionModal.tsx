import React, { useState } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, 
  FlatList, TextInput, Alert 
} from 'react-native';
import { CatalogItem, Plan } from '../types';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCatalogItem: CatalogItem | null;
}

export default function AddSubscriptionModal({ visible, onClose, selectedCatalogItem }: Props) {
  const [billingDay, setBillingDay] = useState('1'); // Varsayılan: Ayın 1'i
  const addSubscription = useUserSubscriptionStore((state) => state.addSubscription);

  if (!selectedCatalogItem) return null;

  const handleSelectPlan = (plan: Plan) => {
    // 1. Basit bir validasyon
    const day = parseInt(billingDay);
    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert("Hata", "Lütfen geçerli bir gün giriniz (1-31)");
      return;
    }

    // 2. Kayıt Nesnesini Oluştur
    addSubscription({
      id: Date.now().toString(), // Basit ID üretimi
      catalogId: selectedCatalogItem.id,
      name: selectedCatalogItem.name,
      logoUrl: selectedCatalogItem.logoUrl,
      colorCode: selectedCatalogItem.colorCode,
      price: plan.price,
      currency: plan.currency,
      billingPeriod: 'monthly',
      billingDay: day,
      nextBillingDate: new Date().toISOString(), // Şimdilik bugün, sonra hesaplayacağız
      hasContract: false, // Şimdilik basit tutalım
    });

    // 3. Modalı kapat ve bilgi ver
    Alert.alert("Başarılı", `${selectedCatalogItem.name} (${plan.name}) eklendi!`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Başlık */}
          <View style={[styles.header, { backgroundColor: selectedCatalogItem.colorCode || '#333' }]}>
            <Text style={styles.title}>{selectedCatalogItem.name}</Text>
            <Text style={styles.subtitle}>Paketini Seç</Text>
          </View>

          {/* Fatura Günü Inputu */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Her ayın hangi günü ödeniyor?</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={billingDay}
              onChangeText={setBillingDay}
              maxLength={2}
            />
          </View>

          {/* Paket Listesi */}
          <Text style={styles.label}>Bir Paket Seç:</Text>
<FlatList
            // Eğer plans null gelirse boş dizi kullan ki uygulama çökmesin
            data={selectedCatalogItem.plans || []}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            
            // LİSTE BOŞSA BU GÖZÜKSÜN:
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#999', fontStyle: 'italic' }}>
                  Bu servis için tanımlı paket bulunamadı.
                </Text>
              </View>
            }
            
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.planCard} onPress={() => handleSelectPlan(item)}>
                <Text style={styles.planName}>{item.name}</Text>
                <Text style={styles.planPrice}>{item.price} {item.currency}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Kapat Butonu */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Vazgeç</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  header: { padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: 'rgba(255,255,255,0.8)' },
  
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16 },

  planCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 15, marginBottom: 10, borderRadius: 8, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee'
  },
  planName: { fontSize: 16, fontWeight: '600' },
  planPrice: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71' },

  closeButton: { marginTop: 10, padding: 15, alignItems: 'center' },
  closeText: { color: 'red', fontSize: 16 }
});