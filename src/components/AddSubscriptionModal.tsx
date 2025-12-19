import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, 
  FlatList, TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { CatalogItem, Plan, UserSubscription } from '../types';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCatalogItem: CatalogItem | null;
  subscriptionToEdit?: UserSubscription | null; // YENİ: Düzenlenecek veri (Opsiyonel)
}

export default function AddSubscriptionModal({ visible, onClose, selectedCatalogItem, subscriptionToEdit }: Props) {
  const [billingDay, setBillingDay] = useState('1'); 
  const [customPrice, setCustomPrice] = useState(''); // Fiyatı elle değiştirmek isterse
  const { addSubscription, updateSubscription } = useUserSubscriptionStore();

  // Modal açıldığında: Ekleme mi, Düzenleme mi?
  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        // DÜZENLEME MODU: Eski verileri doldur
        setBillingDay(subscriptionToEdit.billingDay.toString());
        setCustomPrice(subscriptionToEdit.price.toString());
      } else {
        // EKLEME MODU: Sıfırla
        setBillingDay('1');
        setCustomPrice('');
      }
    }
  }, [visible, subscriptionToEdit]);

  // Hangi öğeyi gösteriyoruz? (Düzenlemedeki mi, Katalogdan seçilen mi?)
  const activeItem = subscriptionToEdit 
    ? { name: subscriptionToEdit.name, colorCode: subscriptionToEdit.colorCode, plans: [], logoUrl: subscriptionToEdit.logoUrl } 
    : selectedCatalogItem;

  if (!activeItem) return null;

  const handleSave = async (plan?: Plan) => {
    const day = parseInt(billingDay);
    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert("Hata", "Lütfen geçerli bir gün giriniz (1-31)");
      return;
    }

    // Düzenleme Modu
    if (subscriptionToEdit) {
        await updateSubscription(subscriptionToEdit.id, {
            billingDay: day,
            price: plan ? plan.price : parseFloat(customPrice) || subscriptionToEdit.price,
            // Eğer plan seçtiyse ismini de güncelle (örn: Temel -> Standart)
            // Ama basitlik için şimdilik sadece fiyat ve günü güncelliyoruz.
        });
        Alert.alert("Güncellendi", "Abonelik başarıyla güncellendi.");
    } 
    // Yeni Ekleme Modu
    else if (selectedCatalogItem && plan) {
        await addSubscription({
            id: Date.now().toString(),
            catalogId: selectedCatalogItem.id,
            name: selectedCatalogItem.name,
            logoUrl: selectedCatalogItem.logoUrl,
            colorCode: selectedCatalogItem.colorCode,
            price: plan.price,
            currency: plan.currency,
            billingPeriod: 'monthly',
            billingDay: day,
            nextBillingDate: new Date().toISOString(), 
            hasContract: false, 
        });
        Alert.alert("Eklendi", `${selectedCatalogItem.name} eklendi.`);
    }

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={[styles.header, { backgroundColor: activeItem.colorCode || '#333' }]}>
            <Text style={styles.title}>{activeItem.name}</Text>
            <Text style={styles.subtitle}>{subscriptionToEdit ? 'Aboneliği Düzenle' : 'Paketini Seç'}</Text>
          </View>

          {/* Fatura Günü Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ödeme Günü (Ayın kaçı?)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={billingDay}
              onChangeText={setBillingDay}
              maxLength={2} 
            />
          </View>

          {/* SADECE DÜZENLEME MODUNDA: Fiyat Inputu (Paket değiştirmek yerine fiyatı elle girmek için) */}
          {subscriptionToEdit && (
             <View style={styles.inputContainer}>
                <Text style={styles.label}>Aylık Tutar</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  value={customPrice}
                  onChangeText={setCustomPrice}
                />
                 <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                 </TouchableOpacity>
             </View>
          )}

          {/* SADECE EKLEME MODUNDA: Paket Listesi */}
          {!subscriptionToEdit && activeItem.plans && (
            <>
                <Text style={styles.label}>Bir Paket Seç:</Text>
                <FlatList
                    data={activeItem.plans}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                    <TouchableOpacity style={styles.planCard} onPress={() => handleSave(item)}>
                        <Text style={styles.planName}>{item.name}</Text>
                        <Text style={styles.planPrice}>{item.price} {item.currency}</Text>
                    </TouchableOpacity>
                    )}
                />
            </>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Vazgeç</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  header: { padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: 'rgba(255,255,255,0.8)' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16 },
  planCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, marginBottom: 10, borderRadius: 8, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee' },
  planName: { fontSize: 16, fontWeight: '600' },
  planPrice: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71' },
  closeButton: { marginTop: 10, padding: 15, alignItems: 'center' },
  closeText: { color: 'red', fontSize: 16 },
  saveButton: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});