import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Alert, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { CatalogItem, UserSubscription, Plan } from '../types';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useThemeColors } from '../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCatalogItem: CatalogItem | null;
  subscriptionToEdit?: UserSubscription | null;
}

const CATEGORIES = ['Streaming', 'Music', 'Gaming', 'Cloud', 'Food', 'Gym', 'Rent', 'Bills', 'Other'];
type CurrencyType = 'TRY' | 'USD' | 'EUR';

export default function AddSubscriptionModal({ visible, onClose, selectedCatalogItem, subscriptionToEdit }: Props) {
  const colors = useThemeColors();
  const { addSubscription, updateSubscription } = useUserSubscriptionStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Other');
  const [currency, setCurrency] = useState<CurrencyType>('TRY');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  
  const [billingDate, setBillingDate] = useState(new Date()); 
  const [showBillingDatePicker, setShowBillingDatePicker] = useState(false);

  const [hasContract, setHasContract] = useState(false);
  const [startDate, setStartDate] = useState(new Date()); 
  const [endDate, setEndDate] = useState(new Date());     
  const [showContractDatePicker, setShowContractDatePicker] = useState<'start' | 'end' | null>(null);

  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [tempPerson, setTempPerson] = useState('');
  const [showShareInput, setShowShareInput] = useState(false);

  const isEditing = !!subscriptionToEdit;
  const isCatalogItem = !!selectedCatalogItem; 
  const hasPlans = selectedCatalogItem?.plans && selectedCatalogItem.plans.length > 0;

  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        setName(subscriptionToEdit.name);
        setPrice(subscriptionToEdit.price.toString());
        setCurrency((subscriptionToEdit.currency as CurrencyType) || 'TRY');
        setCategory(subscriptionToEdit.category || 'Other');
        
        const now = new Date();
        let targetMonth = now.getDate() > subscriptionToEdit.billingDay ? now.getMonth() + 1 : now.getMonth();
        const derivedDate = new Date(now.getFullYear(), targetMonth, subscriptionToEdit.billingDay);
        setBillingDate(derivedDate);

        setHasContract(subscriptionToEdit.hasContract || false);
        if (subscriptionToEdit.contractStartDate) setStartDate(new Date(subscriptionToEdit.contractStartDate));
        if (subscriptionToEdit.contractEndDate) setEndDate(new Date(subscriptionToEdit.contractEndDate));

        setSharedWith(subscriptionToEdit.sharedWith || []);
        setShowShareInput((subscriptionToEdit.sharedWith?.length || 0) > 0);
        setSelectedPlanId(null);
      } else if (selectedCatalogItem) {
        resetForm();
        setName(selectedCatalogItem.name);
        setCategory(selectedCatalogItem.category);
        setBillingDate(new Date());
      } else {
        resetForm();
        setBillingDate(new Date());
      }
    }
  }, [visible, selectedCatalogItem, subscriptionToEdit]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('Other');
    setCurrency('TRY');
    setBillingDate(new Date());
    setHasContract(false);
    setStartDate(new Date()); 
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
    if (!name || !price) {
      Alert.alert("Eksik Bilgi", "Lütfen isim ve fiyat alanlarını doldurun.");
      return;
    }
    const day = billingDate.getDate();
    const finalCatalogId = selectedCatalogItem?.id ?? subscriptionToEdit?.catalogId ?? undefined;
    const colorToSave = selectedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || colors.primary;

    const subData = {
      catalogId: finalCatalogId,
      name,
      price: parseFloat(price.replace(',', '.')),
      currency,
      billingDay: day,
      category,
      colorCode: colorToSave,
      sharedWith: sharedWith,
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

  const renderLogoSection = () => {
    if (selectedCatalogItem?.logoUrl) {
       return (
         <View style={[styles.logoContainer, { backgroundColor: colors.white }]}>
            <Image 
                source={{ uri: selectedCatalogItem.logoUrl }} 
                style={styles.logoImage} 
                resizeMode="contain"
            />
         </View>
       );
    }

    const displayColor = selectedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || colors.primary;
    const displayName = selectedCatalogItem?.name || name || "?";

    return (
        <View style={[styles.logoContainer, { backgroundColor: displayColor }]}>
             <Text style={styles.logoText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, { backgroundColor: colors.cardBg }]}>
          
          {/* HEADER ROW */}
          <View style={styles.headerRow}>
              <View style={styles.headerSpacer} />
              
              <View style={styles.headerCenter}>
                  {renderLogoSection()}
              </View>

              {/* Çarpı butonu zIndex düzeltmesi */}
              <TouchableOpacity 
                  onPress={onClose} 
                  style={[styles.closeBtn, { backgroundColor: colors.inputBg }]}
                  activeOpacity={0.7}
                  hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
              >
                  <Ionicons name="close" size={20} color={colors.textMain} />
              </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
             <Text style={[styles.title, { color: colors.textMain }]}>
                {isEditing ? 'Aboneliği Düzenle' : (name ? name : 'Yeni Abonelik')}
             </Text>
             <Text style={[styles.subtitle, { color: colors.textSec }]}>
                {isCatalogItem ? 'Detayları kontrol et ve kaydet' : 'Abonelik bilgilerini gir'}
             </Text>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {!isCatalogItem ? (
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSec }]}>Abonelik Adı</Text>
                    <TextInput 
                        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain }]} 
                        value={name} 
                        onChangeText={setName} 
                        placeholder="Örn: Ev Kirası" 
                        placeholderTextColor={colors.textSec}
                    />
                </View>
            ) : null}

            <View style={styles.priceContainer}>
                 <Text style={[styles.label, { color: colors.textSec, alignSelf: 'center' }]}>Aylık Tutar</Text>
                 <View style={styles.priceRow}>
                    <TextInput 
                        style={[styles.priceInput, { color: colors.textMain }]} 
                        value={price} 
                        onChangeText={setPrice} 
                        keyboardType="numeric" 
                        placeholder="0"
                        placeholderTextColor={colors.textSec + '50'}
                    />
                    <TouchableOpacity 
                        style={[styles.currencySelector, { backgroundColor: colors.inputBg }]}
                        onPress={() => setCurrency(currency === 'TRY' ? 'USD' : currency === 'USD' ? 'EUR' : 'TRY')}
                    >
                        <Text style={[styles.currencyText, { color: colors.textMain }]}>{currency}</Text>
                        <Ionicons name="chevron-down" size={12} color={colors.textSec} style={{marginLeft: 4}} />
                    </TouchableOpacity>
                 </View>
            </View>

            {(hasPlans && !isEditing) ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSec }]}>Paket Seç</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                  {selectedCatalogItem!.plans!.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      return (
                        <TouchableOpacity 
                            key={plan.id} 
                            style={[
                                styles.planChip, 
                                { 
                                    backgroundColor: isSelected ? colors.primary : colors.inputBg, 
                                    borderColor: isSelected ? colors.primary : colors.border
                                }
                            ]} 
                            onPress={() => handleSelectPlan(plan)}
                        >
                            <Text style={[styles.planName, { color: isSelected ? colors.white : colors.textMain }]}>{plan.name}</Text>
                            <Text style={[styles.planPrice, { color: isSelected ? colors.white + 'EE' : colors.textSec }]}>{plan.price} {plan.currency}</Text>
                        </TouchableOpacity>
                      );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSec }]}>İlk Ödeme Tarihi</Text>
                <TouchableOpacity 
                    style={[styles.rowInputBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                    onPress={() => setShowBillingDatePicker(true)}
                >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <MaterialCommunityIcons name="calendar-today" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textMain }}>
                             {billingDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.textSec }}>
                        Her ayın {billingDate.getDate()}. günü
                    </Text>
                </TouchableOpacity>

                {showBillingDatePicker ? (
                    <DateTimePicker
                        value={billingDate}
                        mode="date"
                        display="default"
                        onChange={(e, d) => {
                            setShowBillingDatePicker(false);
                            if (d) setBillingDate(d);
                        }}
                    />
                ) : null}
            </View>

            {!isCatalogItem ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSec }]}>Kategori</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CATEGORIES.map(cat => {
                      const isActive = category === cat;
                      return (
                        <TouchableOpacity 
                            key={cat} 
                            style={[
                                styles.catChip, 
                                { backgroundColor: isActive ? colors.primary : colors.inputBg }
                            ]} 
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.catText, { color: isActive ? colors.white : colors.textMain }]}>{cat}</Text>
                        </TouchableOpacity>
                      );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.extrasSection}>
                
                <View style={[styles.extraCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <View style={styles.rowBetween}>
                        <View style={styles.row}>
                            <Ionicons name="people" size={20} color={colors.textMain} style={{marginRight: 10}} />
                            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Ortak Kullanım</Text>
                        </View>
                        <Switch value={showShareInput} onValueChange={setShowShareInput} trackColor={{false: colors.border, true: colors.primary}} />
                    </View>
                    
                    {showShareInput ? (
                        <View style={{ marginTop: 12 }}>
                             <View style={styles.addPersonRow}>
                                <TextInput 
                                    style={[styles.smallInput, { backgroundColor: colors.cardBg, color: colors.textMain, borderColor: colors.border }]} 
                                    placeholder="Kişi Adı" 
                                    placeholderTextColor={colors.textSec}
                                    value={tempPerson} 
                                    onChangeText={setTempPerson} 
                                />
                                <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAddPerson}>
                                    <Ionicons name="add" size={24} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.chipRow}>
                                {sharedWith.map((person, index) => (
                                    <TouchableOpacity key={index} style={[styles.personChip, { backgroundColor: colors.cardBg }]} onPress={() => { const n = [...sharedWith]; n.splice(index, 1); setSharedWith(n) }}>
                                        <Text style={[styles.personName, { color: colors.textMain }]}>{person}</Text>
                                        <Ionicons name="close" size={12} color={colors.error} style={{marginLeft: 4}} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={{color: colors.success, fontWeight: '700', fontSize: 12, marginTop: 6, textAlign: 'right'}}>
                                Kişi başı: {shareAmount} {currency}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View style={[styles.extraCard, { backgroundColor: colors.inputBg, borderColor: colors.border, marginTop: 12 }]}>
                    <View style={styles.rowBetween}>
                        <View style={styles.row}>
                            <Ionicons name="document-text" size={20} color={colors.textMain} style={{marginRight: 10}} />
                            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Taahhütlü Abonelik</Text>
                        </View>
                        <Switch value={hasContract} onValueChange={setHasContract} trackColor={{false: colors.border, true: colors.primary}} />
                    </View>

                    {hasContract ? (
                        <View style={styles.contractDatesRow}>
                            <TouchableOpacity 
                                style={[styles.dateBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]} 
                                onPress={() => setShowContractDatePicker('start')}
                            >
                                <Text style={{fontSize: 10, color: colors.textSec}}>BAŞLANGIÇ</Text>
                                <Text style={{fontWeight: '600', color: colors.textMain, marginTop: 2}}>{startDate.toLocaleDateString('tr-TR')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.dateBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]} 
                                onPress={() => setShowContractDatePicker('end')}
                            >
                                <Text style={{fontSize: 10, color: colors.textSec}}>BİTİŞ</Text>
                                <Text style={{fontWeight: '600', color: colors.textMain, marginTop: 2}}>{endDate.toLocaleDateString('tr-TR')}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            </View>

            {showContractDatePicker ? (
                <DateTimePicker
                    value={showContractDatePicker === 'start' ? startDate : endDate}
                    mode="date"
                    display="default"
                    onChange={(e, d) => {
                        const mode = showContractDatePicker;
                        setShowContractDatePicker(null);
                        if (d) {
                            if (mode === 'start') setStartDate(d);
                            else setEndDate(d);
                        }
                    }}
                />
            ) : null}

            <View style={{ height: 80 }} />
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.cardBg, borderTopColor: colors.border }]}>
            <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
                onPress={handleSave}
                activeOpacity={0.8}
            >
                <Text style={styles.saveButtonText}>
                    {isEditing ? 'Değişiklikleri Kaydet' : 'Aboneliği Başlat'}
                </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
      flex: 1, 
      justifyContent: 'flex-end',
  },
  backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: { 
      borderTopLeftRadius: 28, 
      borderTopRightRadius: 28, 
      height: '92%', 
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 20,
      paddingTop: 16,
  },
  
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 10,
      zIndex: 100, // Header'ı üstte tut
  },
  headerSpacer: { width: 40 }, 
  headerCenter: { alignItems: 'center' },
  closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999, // Kesinlikle en üstte
      elevation: 10,
  },
  
  logoContainer: {
      width: 64,
      height: 64,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
  },
  logoImage: { width: 64, height: 64, borderRadius: 20 },
  logoText: { fontSize: 28, fontWeight: '800', color: '#FFF' },

  titleContainer: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 13, marginTop: 4, fontWeight: '500' },

  content: { paddingHorizontal: 24 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
      height: 52,
      borderRadius: 16,
      paddingHorizontal: 16,
      fontSize: 16,
      fontWeight: '600',
  },
  
  priceContainer: { alignItems: 'center', marginBottom: 24 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  priceInput: {
      fontSize: 36, 
      fontWeight: '800',
      textAlign: 'center',
      minWidth: 80,
  },
  currencySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 10,
      marginTop: 8,
  },
  currencyText: { fontWeight: '700', fontSize: 14 },

  planChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      marginRight: 8,
      borderWidth: 1,
      minWidth: 90,
  },
  planName: { fontWeight: '700', fontSize: 13, marginBottom: 2 },
  planPrice: { fontSize: 11, fontWeight: '600' },

  rowInputBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
  },

  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  catText: { fontSize: 13, fontWeight: '600' },

  extrasSection: { marginTop: 10 },
  extraCard: {
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600' },

  addPersonRow: { flexDirection: 'row', marginBottom: 10 },
  smallInput: { flex: 1, height: 44, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, marginRight: 8 },
  addBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  personChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, marginRight: 6, marginBottom: 6 },
  personName: { fontSize: 12, fontWeight: '500' },

  contractDatesRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  dateBox: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },

  footer: {
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      borderTopWidth: 1,
  },
  saveButton: {
      height: 56,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});