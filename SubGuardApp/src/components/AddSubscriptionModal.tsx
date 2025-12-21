import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { CatalogItem, UserSubscription, Plan } from '../types';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCatalogItem: CatalogItem | null;
  subscriptionToEdit?: UserSubscription | null;
}

const CATEGORIES = ['Streaming', 'Music', 'Gaming', 'Cloud', 'Food', 'Gym', 'Rent', 'Bills', 'Education', 'Other'];
type CurrencyType = 'TRY' | 'USD' | 'EUR';

export default function AddSubscriptionModal({ visible, onClose, selectedCatalogItem, subscriptionToEdit }: Props) {
  const { addSubscription, updateSubscription } = useUserSubscriptionStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Other');
  const [currency, setCurrency] = useState<CurrencyType>('TRY');
  const [billingDay, setBillingDay] = useState('1');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // --- SÖZLEŞME TARİHLERİ ---
  const [hasContract, setHasContract] = useState(false);
  const [startDate, setStartDate] = useState(new Date()); // Başlangıç
  const [endDate, setEndDate] = useState(new Date());     // Bitiş
  
  // Hangi tarih seçici açık? 'start', 'end' veya null
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  // Ortak Kullanıcılar
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [tempPerson, setTempPerson] = useState('');
  const [showShareInput, setShowShareInput] = useState(false);

  const isEditing = !!subscriptionToEdit;
  const isCustom = !selectedCatalogItem && !isEditing;
  const hasPlans = selectedCatalogItem?.plans && selectedCatalogItem.plans.length > 0;

  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        // Edit Modu
        setName(subscriptionToEdit.name);
        setPrice(subscriptionToEdit.price.toString());
        setCurrency((subscriptionToEdit.currency as CurrencyType) || 'TRY');
        setBillingDay(subscriptionToEdit.billingDay.toString());
        setCategory(subscriptionToEdit.category || 'Other');
        
        setHasContract(subscriptionToEdit.hasContract || false);
        if (subscriptionToEdit.contractStartDate) setStartDate(new Date(subscriptionToEdit.contractStartDate));
        if (subscriptionToEdit.contractEndDate) setEndDate(new Date(subscriptionToEdit.contractEndDate));
        
        setSharedWith(subscriptionToEdit.sharedWith || []);
        setShowShareInput((subscriptionToEdit.sharedWith?.length || 0) > 0);
        setSelectedPlanId(null);
      } else if (selectedCatalogItem) {
        // Katalog Modu
        resetForm();
        setName(selectedCatalogItem.name);
        setCategory(selectedCatalogItem.category);
      } else {
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
    setStartDate(new Date());
    
    // Varsayılan bitiş: 1 yıl sonrası
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setEndDate(nextYear);
    
    setSharedWith([]);
    setShowShareInput(false);
    setSelectedPlanId(null);
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setPrice(plan.price.toString());
    // @ts-ignore
    setCurrency(plan.currency as CurrencyType);
  };

  const handleAddPerson = () => {
    if (tempPerson.trim().length > 0) {
      setSharedWith([...sharedWith, tempPerson.trim()]);
      setTempPerson('');
    }
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
      colorCode: selectedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || '#333',
      sharedWith: sharedWith,
      
      // SÖZLEŞME VERİLERİ
      hasContract,
      contractStartDate: hasContract ? startDate.toISOString() : undefined,
      contractEndDate: hasContract ? endDate.toISOString() : undefined,
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
      Alert.alert("Hata", "Kaydedilirken bir sorun oluştu.");
    }
  };

  const shareAmount = price ? (parseFloat(price) / (sharedWith.length + 1)).toFixed(2) : '0';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.modalContainer}>

          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? 'Düzenle' : 'Yeni Abonelik'}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            
            {/* İSİM & KATEGORİ */}
            <Text style={styles.label}>Abonelik İsmi</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Örn: Spotify" editable={!selectedCatalogItem || isEditing} />

            {isCustom && (
              <View>
                <Text style={styles.label}>Kategori</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} style={[styles.catChip, category === cat && styles.activeCatChip]} onPress={() => setCategory(cat)}>
                      <Text style={[styles.catText, category === cat && styles.activeCatText]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* PAKETLER */}
            {hasPlans && !isEditing && (
              <View style={styles.plansSection}>
                <Text style={styles.label}>Paket Seçimi</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedCatalogItem!.plans!.map((plan) => (
                    <TouchableOpacity key={plan.id} style={[styles.planChip, selectedPlanId === plan.id && styles.activePlanChip]} onPress={() => handleSelectPlan(plan)}>
                      <Text style={[styles.planName, selectedPlanId === plan.id && styles.activePlanText]}>{plan.name}</Text>
                      <Text style={[styles.planPrice, selectedPlanId === plan.id && styles.activePlanText]}>{plan.price} {plan.currency}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* FİYAT VE GÜN */}
            <View style={styles.row}>
                <View style={{flex:1, marginRight:10}}>
                    <Text style={styles.label}>Fiyat</Text>
                    <View style={[styles.row, styles.input, {padding:0, paddingHorizontal:10}]}>
                        <TextInput style={{flex:1, fontSize:16}} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" />
                        <TouchableOpacity onPress={() => setCurrency(currency === 'TRY' ? 'USD' : currency === 'USD' ? 'EUR' : 'TRY')}>
                            <Text style={{fontWeight:'bold', color:'#333'}}>{currency}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.label}>Ödeme Günü</Text>
                    <TextInput style={styles.input} value={billingDay} onChangeText={setBillingDay} keyboardType="numeric" placeholder="1-31" maxLength={2} />
                </View>
            </View>

            {/* ORTAK KULLANIM */}
            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 15 }]}>
              <Text style={styles.label}>Ortak Kullanım</Text>
              <Switch value={showShareInput} onValueChange={setShowShareInput} />
            </View>
            {showShareInput && (
              <View style={styles.shareSection}>
                <View style={styles.addPersonRow}>
                  <TextInput style={[styles.input, { flex: 1, marginBottom: 0, height: 40 }]} placeholder="Kişi adı" value={tempPerson} onChangeText={setTempPerson} />
                  <TouchableOpacity style={styles.addBtn} onPress={handleAddPerson}><Ionicons name="add" size={24} color="white" /></TouchableOpacity>
                </View>
                <View style={styles.chipContainer}>
                  {sharedWith.map((person, index) => (
                    <View key={index} style={styles.personChip}>
                      <Text style={styles.personName}>{person}</Text>
                      <TouchableOpacity onPress={() => {const n=[...sharedWith]; n.splice(index,1); setSharedWith(n)}}><Ionicons name="close-circle" size={16} color="#666" style={{marginLeft:5}}/></TouchableOpacity>
                    </View>
                  ))}
                </View>
                <Text style={styles.helperText}>Kişi başı: {shareAmount} {currency}</Text>
              </View>
            )}

            {/* SÖZLEŞME (GÜNCELLENEN KISIM) */}
            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 15 }]}>
              <Text style={styles.label}>Taahhüt Var mı?</Text>
              <Switch value={hasContract} onValueChange={setHasContract} />
            </View>

            {hasContract && (
              <View style={styles.contractContainer}>
                <View style={styles.row}>
                    <View style={{flex:1, marginRight:10}}>
                        <Text style={styles.subLabel}>Başlangıç</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker('start')}>
                            <Text>{startDate.toLocaleDateString('tr-TR')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:1}}>
                        <Text style={styles.subLabel}>Bitiş</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker('end')}>
                            <Text>{endDate.toLocaleDateString('tr-TR')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* DATE PICKER LOGIC */}
                {showDatePicker && (
                  <DateTimePicker 
                    value={showDatePicker === 'start' ? startDate : endDate} 
                    mode="date" 
                    display="default" 
                    onChange={(e, d) => { 
                        if (d) {
                            if (showDatePicker === 'start') setStartDate(d);
                            else setEndDate(d);
                        }
                        setShowDatePicker(null); 
                    }} 
                  />
                )}
              </View>
            )}

          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
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
  label: { fontSize: 14, color: '#333', marginBottom: 6, marginTop: 10, fontWeight: '600' },
  subLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', alignItems: 'center' },
  catScroll: { flexDirection: 'row', marginBottom: 5 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  activeCatChip: { backgroundColor: '#333' },
  catText: { fontSize: 12, color: '#555' },
  activeCatText: { color: '#fff' },
  plansSection: { marginBottom: 10 },
  planChip: { padding: 10, borderRadius: 10, backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  activePlanChip: { backgroundColor: '#333', borderColor: '#333' },
  planName: { fontSize: 12, fontWeight: 'bold', color:'#333' },
  activePlanText: { color: '#fff' },
  planPrice: { fontSize: 10, color: '#666' },
  shareSection: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, marginTop: 5 },
  addPersonRow: { flexDirection: 'row', marginTop: 5 },
  addBtn: { backgroundColor: '#333', width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  personChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e0e0', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 15, marginRight: 5, marginBottom: 5 },
  personName: { fontSize: 11, marginRight: 5 },
  helperText: { fontSize: 11, color: '#2ecc71', marginTop: 5, fontWeight:'bold' },
  saveButton: { backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  // Sözleşme Stilleri
  contractContainer: { backgroundColor:'#f0f8ff', padding:10, borderRadius:10, marginTop:5, borderWidth:1, borderColor:'#dbeafe' },
  dateButton: { backgroundColor: '#fff', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth:1, borderColor:'#ddd' }
});