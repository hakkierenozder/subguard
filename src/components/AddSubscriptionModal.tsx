import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  FlatList, TextInput, Alert, KeyboardAvoidingView, Platform, Switch, ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CatalogItem, Plan, UserSubscription } from '../types';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { Ionicons } from '@expo/vector-icons';
import { SUPPORTED_CURRENCIES } from '../utils/CurrencyService';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCatalogItem: CatalogItem | null;
  subscriptionToEdit?: UserSubscription | null;
}

export default function AddSubscriptionModal({ visible, onClose, selectedCatalogItem, subscriptionToEdit }: Props) {
  // --- State'ler ---
  const [billingDay, setBillingDay] = useState('1');
  const [customPrice, setCustomPrice] = useState('');

  // Taahhüt
  const [hasContract, setHasContract] = useState(false);
  const [contractEndDate, setContractEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // YENİ: Ortakçılar
  const [isShared, setIsShared] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [sharedPeople, setSharedPeople] = useState<string[]>([]);

  const { addSubscription, updateSubscription } = useUserSubscriptionStore();

  const [currency, setCurrency] = useState('TRY');

  // Modal Açılış
  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        // Düzenleme
        setBillingDay(subscriptionToEdit.billingDay.toString());
        setCustomPrice(subscriptionToEdit.price.toString());
        setHasContract(subscriptionToEdit.hasContract);
        setCurrency(subscriptionToEdit.currency);
        if (subscriptionToEdit.contractEndDate) setContractEndDate(new Date(subscriptionToEdit.contractEndDate));

        // Ortakları Yükle
        if (subscriptionToEdit.sharedWith && subscriptionToEdit.sharedWith.length > 0) {
          setIsShared(true);
          setSharedPeople(subscriptionToEdit.sharedWith);
        } else {
          setIsShared(false);
          setSharedPeople([]);
        }

      } else if (selectedCatalogItem) {
        // Yeni Ekleme
        setBillingDay('1');
        setCustomPrice('');
        setHasContract(selectedCatalogItem.requiresContract);
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setContractEndDate(nextYear);
        setCurrency('TRY'); // Varsayılan

        // Sıfırla
        setIsShared(false);
        setSharedPeople([]);
      }
    }
  }, [visible, subscriptionToEdit, selectedCatalogItem]);

  const activeItem = subscriptionToEdit
    ? { name: subscriptionToEdit.name, colorCode: subscriptionToEdit.colorCode, plans: [], logoUrl: subscriptionToEdit.logoUrl }
    : selectedCatalogItem;

  if (!activeItem) return null;

  // --- Yardımcı Fonksiyonlar ---

  const handleAddPartner = () => {
    if (newPartnerName.trim().length > 0) {
      setSharedPeople([...sharedPeople, newPartnerName.trim()]);
      setNewPartnerName('');
    }
  };

  const handleRemovePartner = (index: number) => {
    const newList = [...sharedPeople];
    newList.splice(index, 1);
    setSharedPeople(newList);
  };

  // Kişi Başı Maliyet Hesapla
  const calculateShare = (totalPrice: number) => {
    const totalPeople = sharedPeople.length + 1; // Sen + Ortaklar
    return (totalPrice / totalPeople).toFixed(2);
  };

  const handleSave = async (plan?: Plan) => {
    const day = parseInt(billingDay);
    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert("Hata", "Geçerli bir gün giriniz.");
      return;
    }

    const priceToUse = plan ? plan.price : parseFloat(customPrice);
    const currencyToUse = plan ? plan.currency : currency;

    const subData: any = {
      billingDay: day,
      price: priceToUse,
      currency: currencyToUse,
      hasContract: hasContract,
      contractEndDate: hasContract ? contractEndDate.toISOString() : undefined,
      // Ortakları Kaydet
      sharedWith: isShared ? sharedPeople : []
    };

    if (subscriptionToEdit) {
      await updateSubscription(subscriptionToEdit.id, subData);
    } else if (selectedCatalogItem) {
      await addSubscription({
        id: Date.now().toString(),
        catalogId: selectedCatalogItem.id,
        name: selectedCatalogItem.name,
        logoUrl: selectedCatalogItem.logoUrl,
        colorCode: selectedCatalogItem.colorCode,
        billingPeriod: 'monthly',
        nextBillingDate: new Date().toISOString(),
        ...subData
      });
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.modalContainer}>

          <View style={[styles.header, { backgroundColor: activeItem.colorCode || '#333' }]}>
            <Text style={styles.title}>{activeItem.name}</Text>
            <Text style={styles.subtitle}>Detayları Düzenle</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 1. Ödeme Günü & Fiyat */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Ödeme Günü</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={billingDay}
                  onChangeText={setBillingDay}
                  maxLength={2}
                />
              </View>
              {subscriptionToEdit && (
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Tutar</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TextInput
                      style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                      keyboardType="numeric"
                      value={customPrice}
                      onChangeText={setCustomPrice}
                    />
                    {/* Para Birimi Butonları */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderLeftWidth: 0, borderTopRightRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#f1f1f1' }}>
                      {SUPPORTED_CURRENCIES.map((curr) => (
                        <TouchableOpacity
                          key={curr}
                          onPress={() => setCurrency(curr)}
                          style={{
                            padding: 8,
                            backgroundColor: currency === curr ? '#333' : 'transparent',
                            borderRadius: 4,
                            margin: 2
                          }}
                        >
                          <Text style={{ color: currency === curr ? 'white' : '#666', fontSize: 10, fontWeight: 'bold' }}>{curr}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* 2. Sözleşme Switch */}
            <View style={styles.sectionContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.labelBold}>Taahhütlü mü?</Text>
                <Switch value={hasContract} onValueChange={setHasContract} trackColor={{ false: "#ccc", true: activeItem.colorCode }} />
              </View>
              {hasContract && (
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                  <Text>Bitiş: {contractEndDate.toLocaleDateString('tr-TR')}</Text>
                </TouchableOpacity>
              )}
              {showDatePicker && (
                <DateTimePicker value={contractEndDate} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if (d) setContractEndDate(d); }} />
              )}
            </View>

            {/* 3. ORTAKÇI BÖLÜMÜ (YENİ) */}
            <View style={styles.sectionContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.labelBold}>Ortak kullanıyor musun?</Text>
                <Switch value={isShared} onValueChange={setIsShared} trackColor={{ false: "#ccc", true: activeItem.colorCode }} />
              </View>

              {isShared && (
                <View style={{ marginTop: 10 }}>
                  {/* Kişi Ekleme Inputu */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder="Arkadaşının Adı (Örn: Ahmet)"
                      value={newPartnerName}
                      onChangeText={setNewPartnerName}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddPartner}>
                      <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                  </View>

                  {/* Eklenen Kişiler Listesi */}
                  {sharedPeople.map((person, index) => (
                    <View key={index} style={styles.partnerChip}>
                      <Text style={styles.partnerName}>{person}</Text>
                      <TouchableOpacity onPress={() => handleRemovePartner(index)}>
                        <Ionicons name="close-circle" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Maliyet Özeti */}
                  {sharedPeople.length > 0 && (
                    <View style={styles.costSummary}>
                      <Text style={styles.costText}>
                        Kişi Başı: <Text style={{ fontWeight: 'bold' }}>{calculateShare(parseFloat(customPrice) || 0)} {subscriptionToEdit?.currency || 'TL'}</Text>
                      </Text>
                      <Text style={styles.costSubText}>({sharedPeople.length + 1} Kişi Bölüşüyorsunuz)</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Paket Listesi (Sadece Yeni Eklemede) */}
            {!subscriptionToEdit && activeItem.plans && (
              <View>
                <Text style={styles.label}>Paket Seç:</Text>
                {activeItem.plans.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.planCard} onPress={() => handleSave(item)}>
                    <Text style={styles.planName}>{item.name}</Text>
                    <Text style={styles.planPrice}>{item.price} {item.currency}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {subscriptionToEdit && (
            <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
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
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '85%' },
  header: { padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  row: { flexDirection: 'row', marginBottom: 15 },
  label: { fontSize: 13, color: '#666', marginBottom: 5 },
  labelBold: { fontSize: 15, fontWeight: '600', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#f9f9f9' },

  sectionContainer: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateButton: { backgroundColor: 'white', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },

  addButton: { backgroundColor: '#333', padding: 10, borderRadius: 8, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  partnerChip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 5, borderWidth: 1, borderColor: '#eee' },
  partnerName: { fontSize: 14, fontWeight: '500' },
  costSummary: { marginTop: 10, alignItems: 'center', padding: 10, backgroundColor: '#e8f5e9', borderRadius: 8 },
  costText: { color: '#2ecc71', fontSize: 16, fontWeight: '600' },
  costSubText: { color: '#666', fontSize: 12 },

  planCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, marginBottom: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  planName: { fontSize: 15, fontWeight: '600' },
  planPrice: { fontSize: 15, fontWeight: 'bold', color: '#2ecc71' },

  saveButton: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  closeButton: { marginTop: 10, padding: 15, alignItems: 'center' },
  closeText: { color: 'red' }
});