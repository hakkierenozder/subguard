import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { CatalogItem, UserSubscription, Plan } from '../types'; // Plan eklendi
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCatalogItem: CatalogItem | null;
  subscriptionToEdit?: UserSubscription | null;
}

const CATEGORIES = ['Streaming', 'Music', 'Gaming', 'Cloud', 'Food', 'Gym', 'Rent', 'Bills', 'Other'];
type CurrencyType = 'TRY' | 'USD' | 'EUR';

export default function AddSubscriptionModal({ visible, onClose, selectedCatalogItem, subscriptionToEdit }: Props) {
  const { addSubscription, updateSubscription } = useUserSubscriptionStore();

  // Temel Bilgiler
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Other');
  const [currency, setCurrency] = useState<CurrencyType>('TRY');
  const [billingDay, setBillingDay] = useState('1');

  // Paket Seçimi (Yeni)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Sözleşme
  const [hasContract, setHasContract] = useState(false);
  const [contractDate, setContractDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Ortak Kullanıcılar
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [tempPerson, setTempPerson] = useState('');
  const [showShareInput, setShowShareInput] = useState(false);

  const isEditing = !!subscriptionToEdit;
  const isCustom = !selectedCatalogItem && !isEditing;

  // Seçilen katalog öğesinin paketleri var mı?
  const hasPlans = selectedCatalogItem?.plans && selectedCatalogItem.plans.length > 0;

  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        // Edit Modu
        setName(subscriptionToEdit.name);
        setPrice(subscriptionToEdit.price.toString());
        setCurrency((subscriptionToEdit.currency as CurrencyType) || 'TRY');
        setBillingDay(subscriptionToEdit.billingDay.toString());
        setHasContract(subscriptionToEdit.hasContract || false);
        setCategory(subscriptionToEdit.category || 'Other');
        if (subscriptionToEdit.contractEndDate) {
          setContractDate(new Date(subscriptionToEdit.contractEndDate));
        }
        setSharedWith(subscriptionToEdit.sharedWith || []);
        setShowShareInput((subscriptionToEdit.sharedWith?.length || 0) > 0);
        setSelectedPlanId(null); // Edit modunda paket seçimi sıfırlanır (manuel kabul edilir)

      } else if (selectedCatalogItem) {
        // Katalog Modu
        resetForm();
        setName(selectedCatalogItem.name);
        setCategory(selectedCatalogItem.category);

        // Eğer katalogda sadece 1 tane plan varsa otomatik seç
        // if (selectedCatalogItem.plans && selectedCatalogItem.plans.length === 1) {
        //     handleSelectPlan(selectedCatalogItem.plans[0]);
        // }
      } else {
        // Özel Mod
        resetForm();
      }
    }
  }, [visible, selectedCatalogItem, subscriptionToEdit]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('Other');
    setCurrency('TRY');
    setBillingDay('1');
    setHasContract(false);
    setSharedWith([]);
    setShowShareInput(false);
    setSelectedPlanId(null);
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setPrice(plan.price.toString());
    // @ts-ignore - Backend'den gelen currency string olabilir, type casting yapıyoruz
    setCurrency(plan.currency as CurrencyType);
  };

  const handleAddPerson = () => {
    if (tempPerson.trim().length > 0) {
      setSharedWith([...sharedWith, tempPerson.trim()]);
      setTempPerson('');
    }
  };

  const handleRemovePerson = (index: number) => {
    const newList = [...sharedWith];
    newList.splice(index, 1);
    setSharedWith(newList);
  };

  const handleSave = async () => {
    if (!name || !price || !billingDay) {
      Alert.alert("Eksik Bilgi", "Lütfen isim, fiyat ve gün alanlarını doldurun.");
      return;
    }

    const day = parseInt(billingDay);
    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert("Hata", "Ödeme günü 1-31 arasında olmalıdır.");
      return;
    }

    const subData = {
      catalogId: selectedCatalogItem?.id || undefined,
      name,
      price: parseFloat(price.replace(',', '.')),
      currency,
      billingDay: day,
      category,
      hasContract,
      contractEndDate: hasContract ? contractDate.toISOString() : undefined,
      colorCode: selectedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || '#333',
      sharedWith: sharedWith
    };

    try {
      if (isEditing && subscriptionToEdit) {
        await updateSubscription(subscriptionToEdit.id, subData);
      } else {
        // @ts-ignore
        await addSubscription(subData);
      }
      onClose();
    } catch (error) {
      console.log(error);
      Alert.alert("Hata", "Kaydedilirken bir sorun oluştu.");
    }
  };

  // Kişi başı maliyet hesaplama
  const shareAmount = price ? (parseFloat(price) / (sharedWith.length + 1)).toFixed(2) : '0';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.modalContainer}>

          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Düzenle' : isCustom ? 'Özel Abonelik' : 'Yeni Abonelik'}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

            {/* İSİM & KATEGORİ */}
            <Text style={styles.label}>Abonelik İsmi</Text>
            {selectedCatalogItem && !isEditing ? (
              <View style={styles.readOnlyInput}><Text style={{ color: '#555' }}>{name}</Text></View>
            ) : (
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Örn: Ev Kirası" />
            )}

            {isCustom && (
              <View>
                <Text style={styles.label}>Kategori</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, category === cat && styles.activeCatChip]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* --- YENİ BÖLÜM: PAKET SEÇİMİ (Varsa Göster) --- */}
            {hasPlans && !isEditing && (
              <View style={styles.plansSection}>
                <Text style={styles.label}>Paket Seçimi</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
                  {selectedCatalogItem!.plans!.map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[styles.planChip, selectedPlanId === plan.id && styles.activePlanChip]}
                      onPress={() => handleSelectPlan(plan)}
                    >
                      <Text style={[styles.planName, selectedPlanId === plan.id && styles.activePlanText]}>
                        {plan.name}
                      </Text>
                      <Text style={[styles.planPrice, selectedPlanId === plan.id && styles.activePlanText]}>
                        {plan.price} {plan.currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* FİYAT */}
            <Text style={styles.label}>Fiyat (Toplam Tutar)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 2, marginRight: 10 }]}
                value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00"
              />
              <View style={styles.currencyContainer}>
                {(['TRY', 'USD', 'EUR'] as const).map((curr) => (
                  <TouchableOpacity key={curr} style={[styles.currencyButton, currency === curr && styles.activeCurrency]} onPress={() => setCurrency(curr)}>
                    <Text style={[styles.currencyText, currency === curr && { color: 'white' }]}>{curr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ÖDEME GÜNÜ */}
            <Text style={styles.label}>Her ayın kaçında ödeniyor?</Text>
            <TextInput style={styles.input} value={billingDay} onChangeText={setBillingDay} keyboardType="numeric" placeholder="1-31" maxLength={2} />

            {/* ORTAK KULLANIM */}
            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 15 }]}>
              <Text style={styles.label}>Bu aboneliği paylaşıyor musun?</Text>
              <Switch value={showShareInput} onValueChange={setShowShareInput} />
            </View>

            {showShareInput && (
              <View style={styles.shareSection}>
                <Text style={styles.helperText}>Sen dahil {sharedWith.length + 1} kişi kullanıyorsunuz.</Text>
                <Text style={styles.helperText}>Senin Payın: <Text style={{ fontWeight: 'bold', color: '#2ecc71' }}>{shareAmount} {currency}</Text></Text>

                <View style={styles.addPersonRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, height: 45 }]}
                    placeholder="Kişi adı (Örn: Ahmet)"
                    value={tempPerson}
                    onChangeText={setTempPerson}
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={handleAddPerson}>
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.chipContainer}>
                  {sharedWith.map((person, index) => (
                    <View key={index} style={styles.personChip}>
                      <Text style={styles.personName}>{person}</Text>
                      <TouchableOpacity onPress={() => handleRemovePerson(index)}>
                        <Ionicons name="close-circle" size={18} color="#666" style={{ marginLeft: 5 }} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* SÖZLEŞME */}
            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 10 }]}>
              <Text style={styles.label}>Taahhüt / Sözleşme Var mı?</Text>
              <Switch value={hasContract} onValueChange={setHasContract} />
            </View>

            {hasContract && (
              <View>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text>{contractDate.toLocaleDateString('tr-TR')}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#333" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker value={contractDate} mode="date" display="default" onChange={(e, d) => { setShowDatePicker(false); if (d) setContractDate(d); }} />
                )}
              </View>
            )}

          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{isEditing ? 'Güncelle' : 'Listeye Ekle'}</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  content: { paddingBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 10, fontWeight: '600' },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  readOnlyInput: { backgroundColor: '#eee', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  row: { flexDirection: 'row', alignItems: 'center' },
  currencyContainer: { flexDirection: 'row', flex: 1, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4 },
  currencyButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  activeCurrency: { backgroundColor: '#333' },
  currencyText: { fontWeight: 'bold', fontSize: 12, color: '#333' },
  dateButton: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f5f5f5', borderRadius: 12, alignItems: 'center', marginTop: 5 },
  saveButton: { backgroundColor: '#333', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  catScroll: { flexDirection: 'row', marginBottom: 5 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  activeCatChip: { backgroundColor: '#333', borderColor: '#333' },
  catText: { fontSize: 12, color: '#555' },
  activeCatText: { color: '#fff' },

  // Yeni Stiller (Paket Seçimi)
  plansSection: { marginBottom: 10 },
  plansScroll: { flexDirection: 'row' },
  planChip: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 100,
    alignItems: 'center'
  },
  activePlanChip: {
    backgroundColor: '#333',
    borderColor: '#333',
    elevation: 2
  },
  planName: { fontSize: 13, color: '#333', fontWeight: 'bold', marginBottom: 2 },
  planPrice: { fontSize: 11, color: '#666' },
  activePlanText: { color: '#fff' },

  // Ortak Stiller
  shareSection: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginTop: 5 },
  helperText: { fontSize: 12, color: '#666', marginBottom: 5 },
  addPersonRow: { flexDirection: 'row', marginTop: 10 },
  addBtn: { backgroundColor: '#333', width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  personChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e0e0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  personName: { fontSize: 12, color: '#333', fontWeight: '600' }
});