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

  // Custom Fiyat (Manuel Giriş) için
  const [customPrice, setCustomPrice] = useState('');
  const [currency, setCurrency] = useState('TRY');

  // Seçilen Paket (Varsa)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Taahhüt & Ortaklık
  const [hasContract, setHasContract] = useState(false);
  const [contractEndDate, setContractEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [sharedPeople, setSharedPeople] = useState<string[]>([]);

  const { addSubscription, updateSubscription } = useUserSubscriptionStore();

  // Modal Açılış Mantığı
  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        // DÜZENLEME MODU
        setBillingDay(subscriptionToEdit.billingDay.toString());
        setCustomPrice(subscriptionToEdit.price.toString());
        setCurrency(subscriptionToEdit.currency);
        setSelectedPlan(null); // Düzenlemede şimdilik paket seçimi yok, direkt fiyat var

        setHasContract(subscriptionToEdit.hasContract);
        if (subscriptionToEdit.contractEndDate) setContractEndDate(new Date(subscriptionToEdit.contractEndDate));

        if (subscriptionToEdit.sharedWith && subscriptionToEdit.sharedWith.length > 0) {
          setIsShared(true);
          setSharedPeople(subscriptionToEdit.sharedWith);
        } else {
          setIsShared(false);
          setSharedPeople([]);
        }

      } else if (selectedCatalogItem) {
        // YENİ EKLEME MODU
        setBillingDay('1');
        setCustomPrice('');
        setCurrency('TRY');
        setSelectedPlan(null); // Henüz paket seçmedi

        setHasContract(selectedCatalogItem.requiresContract);
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setContractEndDate(nextYear);

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

  // Paket Seçilince Çalışır
  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCustomPrice(plan.price.toString());
    setCurrency(plan.currency);
  };

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

  const handleSave = async () => {
    const day = parseInt(billingDay);
    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert("Hata", "Geçerli bir ödeme günü giriniz.");
      return;
    }

    // Fiyat Belirleme: Paket seçildiyse paketten, yoksa custom inputtan
    let finalPrice = 0;
    let finalCurrency = 'TRY';

    if (selectedPlan) {
      finalPrice = selectedPlan.price;
      finalCurrency = selectedPlan.currency;
    } else {
      finalPrice = parseFloat(customPrice);
      finalCurrency = currency;
    }

    if (!finalPrice || isNaN(finalPrice)) {
      Alert.alert("Hata", "Lütfen bir paket seçin veya fiyat girin.");
      return;
    }

    const subData: any = {
      billingDay: day,
      price: finalPrice,
      currency: finalCurrency,

      // DÜZELTME BURADA: Kategori Belirleme Mantığı
      // 1. Düzenleme yapılıyorsa eski kategoriyi koru.
      // 2. Yeni eklemeyse ve Katalogdan seçildiyse katalogdaki kategoriyi (örn: Cloud) al.
      // 3. Hiçbiri yoksa (Manuel giriş) 'Genel' yap.
      category: subscriptionToEdit?.category
        || selectedCatalogItem?.category
        || 'Genel',

      hasContract: hasContract,
      contractEndDate: hasContract ? contractEndDate.toISOString() : undefined,
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
            <Text style={styles.subtitle}>
              {selectedPlan ? `${selectedPlan.name} Paketi Seçildi` : 'Paket veya Tutar Belirle'}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* 1. Ödeme Günü */}
            <View style={styles.sectionContainer}>
              <Text style={styles.label}>Ödeme Günü (Ayın kaçı?)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={billingDay}
                onChangeText={setBillingDay}
                maxLength={2}
              />
            </View>

            {/* 2. PAKET VEYA TUTAR ALANI (KRİTİK GÜNCELLEME BURADA) */}
            <View style={styles.sectionContainer}>
              {selectedPlan ? (
                // DURUM A: Paket Seçildiyse -> Sadece Bilgi Göster (Değiştirilemez)
                <View style={styles.selectedPlanInfo}>
                  <View>
                    <Text style={styles.label}>Seçilen Paket</Text>
                    <Text style={styles.selectedPlanName}>{selectedPlan.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Tutar</Text>
                    <Text style={styles.selectedPlanPrice}>{selectedPlan.price} {selectedPlan.currency}</Text>
                  </View>
                  {/* Paketi İptal Et Butonu */}
                  <TouchableOpacity onPress={() => setSelectedPlan(null)} style={{ marginLeft: 10, padding: 5 }}>
                    <Ionicons name="close-circle" size={24} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              ) : (
                // DURUM B: Paket Yoksa -> Manuel Giriş Açık
                <View>
                  <Text style={styles.label}>Manuel Tutar (Paket seçmediysen)</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TextInput
                      style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                      keyboardType="numeric"
                      value={customPrice}
                      onChangeText={setCustomPrice}
                      placeholder="0.00"
                    />
                    {/* Para Birimi Seçici */}
                    <View style={styles.currencySelector}>
                      {SUPPORTED_CURRENCIES.map((curr) => (
                        <TouchableOpacity
                          key={curr}
                          onPress={() => setCurrency(curr)}
                          style={[styles.currencyButton, currency === curr && styles.currencyButtonActive]}
                        >
                          <Text style={[styles.currencyText, currency === curr && styles.currencyTextActive]}>{curr}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* 3. Paket Listesi (Eğer Katalogda Paket Varsa ve Henüz Seçilmediyse) */}
            {!subscriptionToEdit && !selectedPlan && activeItem.plans && activeItem.plans.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.label}>Bir Paket Seç:</Text>
                {activeItem.plans.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.planCard} onPress={() => handleSelectPlan(item)}>
                    <Text style={styles.planName}>{item.name}</Text>
                    <Text style={styles.planPrice}>{item.price} {item.currency}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 4. Sözleşme & Ortaklık (Aynı) */}
            {/* ... Diğer bölümler aynı kalacak ... */}

            {/* Sözleşme Switch */}
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

            {/* Ortakçı Bölümü */}
            <View style={styles.sectionContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.labelBold}>Ortak kullanıyor musun?</Text>
                <Switch value={isShared} onValueChange={setIsShared} trackColor={{ false: "#ccc", true: activeItem.colorCode }} />
              </View>

              {isShared && (
                <View style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder="Arkadaşının Adı"
                      value={newPartnerName}
                      onChangeText={setNewPartnerName}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddPartner}>
                      <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                  {sharedPeople.map((person, index) => (
                    <View key={index} style={styles.partnerChip}>
                      <Text style={styles.partnerName}>{person}</Text>
                      <TouchableOpacity onPress={() => handleRemovePartner(index)}>
                        <Ionicons name="close-circle" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>

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
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '90%' },
  header: { padding: 15, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

  sectionContainer: { marginBottom: 15 },
  label: { fontSize: 13, color: '#666', marginBottom: 5 },
  labelBold: { fontSize: 15, fontWeight: '600', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#f9f9f9' },

  // Paket Seçimi Stilleri (YENİ)
  selectedPlanInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#c8e6c9' },
  selectedPlanName: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71' },
  selectedPlanPrice: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  // Kur Seçici Stilleri
  currencySelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderLeftWidth: 0, borderTopRightRadius: 8, borderBottomRightRadius: 8, backgroundColor: '#f1f1f1' },
  currencyButton: { padding: 10, backgroundColor: 'transparent', marginHorizontal: 2, borderRadius: 4 },
  currencyButtonActive: { backgroundColor: '#333' },
  currencyText: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  currencyTextActive: { color: 'white' },

  planCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, marginBottom: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', elevation: 1 },
  planName: { fontSize: 15, fontWeight: '600' },
  planPrice: { fontSize: 15, fontWeight: 'bold', color: '#2ecc71' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateButton: { backgroundColor: 'white', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  addButton: { backgroundColor: '#333', padding: 10, borderRadius: 8, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  partnerChip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 5, borderWidth: 1, borderColor: '#eee' },
  partnerName: { fontSize: 14, fontWeight: '500' },

  saveButton: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  closeButton: { marginTop: 10, padding: 15, alignItems: 'center' },
  closeText: { color: 'red' }
});