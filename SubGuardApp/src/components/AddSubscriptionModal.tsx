import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { CatalogItem, UserSubscription } from '../types';
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
  
  // State'ler
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Other');
  const [currency, setCurrency] = useState<CurrencyType>('TRY');
  const [billingDay, setBillingDay] = useState('1');
  
  const [hasContract, setHasContract] = useState(false);
  const [contractDate, setContractDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isEditing = !!subscriptionToEdit;
  const isCustom = !selectedCatalogItem && !isEditing;

  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        // --- DÜZENLEME MODU ---
        setName(subscriptionToEdit.name);
        setPrice(subscriptionToEdit.price.toString());
        setCurrency((subscriptionToEdit.currency as CurrencyType) || 'TRY');
        setBillingDay(subscriptionToEdit.billingDay.toString());
        setHasContract(subscriptionToEdit.hasContract || false);
        setCategory(subscriptionToEdit.category || 'Other');
        if (subscriptionToEdit.contractEndDate) {
          setContractDate(new Date(subscriptionToEdit.contractEndDate));
        }
      } else if (selectedCatalogItem) {
        // --- KATALOGDAN EKLEME MODU ---
        setName(selectedCatalogItem.name);
        // Katalog öğesinde fiyat bilgisi olmadığı için boş başlatıyoruz
        setPrice(''); 
        setCurrency('TRY'); 
        setCategory(selectedCatalogItem.category);
        setHasContract(false);
      } else {
        // --- ÖZEL EKLEME MODU ---
        setName('');
        setPrice('');
        setCategory('Other');
        setCurrency('TRY');
        setBillingDay('1');
        setHasContract(false);
      }
    }
  }, [visible, selectedCatalogItem, subscriptionToEdit]);

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

    // Renk Kodu Mantığı: Katalogdan geliyorsa onu kullan, yoksa rastgele veya sabit gri
    const defaultColor = '#333';
    // Basit bir hash ile isme göre renk üretebilir veya sabit verebiliriz
    const colorCode = selectedCatalogItem?.colorCode || defaultColor;

    const subData = {
      catalogId: selectedCatalogItem?.id || undefined, 
      name,
      price: parseFloat(price.replace(',', '.')),
      currency,
      billingDay: day,
      category,
      hasContract,
      contractEndDate: hasContract ? contractDate.toISOString() : undefined,
      colorCode: colorCode // <-- GÜNCELLENDİ
    };

    try {
        if (isEditing && subscriptionToEdit) {
          await updateSubscription(subscriptionToEdit.id, subData);
        } else {
          await addSubscription(subData as any);
        }
        onClose();
    } catch (error) {
        console.log(error);
        Alert.alert("Hata", "Kaydedilirken bir sorun oluştu.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Düzenle' : isCustom ? 'Özel Abonelik' : 'Yeni Abonelik'}
            </Text>
            <TouchableOpacity onPress={onClose} style={{padding: 5}}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            
            <Text style={styles.label}>Abonelik İsmi</Text>
            {selectedCatalogItem && !isEditing ? (
               <View style={styles.readOnlyInput}>
                 <Text style={{color:'#555'}}>{name}</Text>
               </View>
            ) : (
               <TextInput 
                 style={styles.input} 
                 value={name} 
                 onChangeText={setName} 
                 placeholder="Örn: Ev Kirası"
               />
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

            <Text style={styles.label}>Fiyat</Text>
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 2, marginRight: 10 }]} 
                value={price} 
                onChangeText={setPrice} 
                keyboardType="numeric" 
                placeholder="0.00"
              />
              <View style={styles.currencyContainer}>
                {(['TRY', 'USD', 'EUR'] as const).map((curr) => (
                  <TouchableOpacity 
                    key={curr} 
                    style={[styles.currencyButton, currency === curr && styles.activeCurrency]}
                    onPress={() => setCurrency(curr)}
                  >
                    <Text style={[styles.currencyText, currency === curr && {color:'white'}]}>{curr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.label}>Her ayın kaçında ödeniyor?</Text>
            <TextInput 
              style={styles.input} 
              value={billingDay} 
              onChangeText={setBillingDay} 
              keyboardType="numeric" 
              placeholder="1-31"
              maxLength={2}
            />

            <View style={[styles.row, { justifyContent: 'space-between', marginTop: 10 }]}>
              <Text style={styles.label}>Taahhüt / Sözleşme Var mı?</Text>
              <Switch value={hasContract} onValueChange={setHasContract} />
            </View>

            {hasContract && (
              <View>
                <Text style={styles.label}>Sözleşme Bitiş Tarihi</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text>{contractDate.toLocaleDateString('tr-TR')}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#333" />
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={contractDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setContractDate(date);
                    }}
                  />
                )}
              </View>
            )}

          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Güncelle' : 'Listeye Ekle'}
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  content: { paddingBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 10, fontWeight:'600' },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  readOnlyInput: { backgroundColor: '#eee', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  row: { flexDirection: 'row', alignItems: 'center' },
  currencyContainer: { flexDirection: 'row', flex: 1, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4 },
  currencyButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  activeCurrency: { backgroundColor: '#333' },
  currencyText: { fontWeight: 'bold', fontSize: 12, color: '#333' },
  dateButton: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#f5f5f5', borderRadius: 12, alignItems: 'center' },
  saveButton: { backgroundColor: '#333', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  catScroll: { flexDirection: 'row', marginBottom: 5 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  activeCatChip: { backgroundColor: '#333', borderColor: '#333' },
  catText: { fontSize: 12, color: '#555' },
  activeCatText: { color: '#fff' }
});