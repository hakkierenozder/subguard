import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Modal, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    ScrollView, 
    Switch, 
    Alert, 
    Platform, 
    KeyboardAvoidingView,
    StatusBar,
    Image,
    LayoutAnimation,
    UIManager
} from 'react-native';
import { CatalogItem, UserSubscription, Plan } from '../types';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Android için animasyon aktivasyonu
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCatalogItem: CatalogItem | null;
  subscriptionToEdit?: UserSubscription | null;
}

const CATEGORIES = ['Streaming', 'Music', 'Gaming', 'Cloud', 'Food', 'Gym', 'Rent', 'Bills', 'Other'];
type CurrencyType = 'TRY' | 'USD' | 'EUR';

const THEME = {
    primary: '#334155',    
    primaryDark: '#1E293B',
    accent: '#4F46E5',     
    bg: '#F8FAFC',         
    inputBg: '#F1F5F9',    
    border: '#E2E8F0',     
    textMain: '#0F172A',
    textSec: '#64748B',
    white: '#FFFFFF',
};

export default function AddSubscriptionModal({ visible, onClose, selectedCatalogItem, subscriptionToEdit }: Props) {
  const { addSubscription, updateSubscription } = useUserSubscriptionStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Other');
  const [currency, setCurrency] = useState<CurrencyType>('TRY');
  const [billingDay, setBillingDay] = useState<number>(1);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // UI State
  const [showDayPicker, setShowDayPicker] = useState(false); // Takvim görünürlüğü

  // Sözleşme
  const [hasContract, setHasContract] = useState(false);
  const [startDate, setStartDate] = useState(new Date()); 
  const [endDate, setEndDate] = useState(new Date());     
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  // Paylaşım
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [tempPerson, setTempPerson] = useState('');
  const [showShareInput, setShowShareInput] = useState(false);

  const isEditing = !!subscriptionToEdit;
  const isCustom = !selectedCatalogItem && !isEditing;
  const hasPlans = selectedCatalogItem?.plans && selectedCatalogItem.plans.length > 0;

  const displayColor = selectedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || THEME.primary;
  const displayLogoUrl = selectedCatalogItem?.logoUrl || subscriptionToEdit?.logoUrl;

  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        setName(subscriptionToEdit.name);
        setPrice(subscriptionToEdit.price.toString());
        setCurrency((subscriptionToEdit.currency as CurrencyType) || 'TRY');
        setBillingDay(subscriptionToEdit.billingDay);
        setCategory(subscriptionToEdit.category || 'Other');
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
    setBillingDay(1);
    setHasContract(false);
    setStartDate(new Date()); 
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setEndDate(nextYear);
    setSharedWith([]);
    setShowShareInput(false);
    setSelectedPlanId(null);
    setShowDayPicker(false);
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

  const toggleDayPicker = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowDayPicker(!showDayPicker);
  };

  const handleDaySelect = (day: number) => {
      setBillingDay(day);
      toggleDayPicker(); // Seçince kapat
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert("Eksik Bilgi", "Lütfen isim ve fiyat alanlarını doldurun.");
      return;
    }

    const subData = {
      catalogId: selectedCatalogItem?.id ?? subscriptionToEdit?.catalogId,
      name,
      price: parseFloat(price.replace(',', '.')),
      currency,
      billingDay,
      category,
      colorCode: displayColor,
      logoUrl: displayLogoUrl, 
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <StatusBar barStyle="light-content" />
        
        {/* 1. HERO SECTION (Geliştirilmiş) */}
        <View style={styles.heroContainer}>
            <LinearGradient
                colors={[displayColor, THEME.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
            >
                {/* Dekoratif Halkalar (Estetik için) */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />

                {/* Close Button */}
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.heroContent}>
                    {/* Logo Badge */}
                    <View style={styles.logoBadge}>
                        {displayLogoUrl ? (
                            <Image source={{ uri: displayLogoUrl }} style={styles.logoImage} />
                        ) : (
                            <Text style={[styles.logoText, { color: displayColor }]}>
                                {name ? name.charAt(0).toUpperCase() : '?'}
                            </Text>
                        )}
                    </View>

                    {/* İsim Input */}
                    <TextInput 
                        style={styles.heroInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Abonelik İsmi"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        editable={!selectedCatalogItem || isEditing} 
                        selectionColor="#FFF"
                    />
                </View>
            </LinearGradient>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* 2. FORM BODY */}
                
                {/* FİYAT ALANI */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.label}>Aylık Tutar</Text>
                    <View style={styles.priceRow}>
                        <TextInput 
                            style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]} 
                            value={price} 
                            onChangeText={setPrice} 
                            keyboardType="numeric" 
                            placeholder="0.00" 
                        />
                        <TouchableOpacity 
                            style={styles.currencyBtn} 
                            onPress={() => setCurrency(currency === 'TRY' ? 'USD' : currency === 'USD' ? 'EUR' : 'TRY')}
                        >
                            <Text style={styles.currencyText}>{currency}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ÖDEME GÜNÜ (MODERN TAKVİM SEÇİCİ) */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.label}>Ödeme Günü</Text>
                    <TouchableOpacity 
                        style={[styles.dateSelectorBtn, showDayPicker && styles.dateSelectorActive]} 
                        onPress={toggleDayPicker}
                        activeOpacity={0.8}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Ionicons name="calendar-outline" size={20} color={THEME.textMain} style={{marginRight: 10}} />
                            <Text style={styles.dateSelectorText}>Her ayın <Text style={{fontWeight:'800', color: THEME.accent}}>{billingDay}.</Text> günü</Text>
                        </View>
                        <Ionicons name={showDayPicker ? "chevron-up" : "chevron-down"} size={20} color={THEME.textSec} />
                    </TouchableOpacity>

                    {/* GİZLİ TAKVİM IZGARASI (1-31) */}
                    {showDayPicker && (
                        <View style={styles.calendarGrid}>
                            {[...Array(31)].map((_, i) => {
                                const day = i + 1;
                                const isSelected = billingDay === day;
                                return (
                                    <TouchableOpacity 
                                        key={day} 
                                        style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}
                                        onPress={() => handleDaySelect(day)}
                                    >
                                        <Text style={[styles.calendarText, isSelected && styles.calendarTextSelected]}>{day}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    )}
                </View>

                {/* KATEGORİ (Sadece Custom) */}
                {isCustom && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.label}>Kategori</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity 
                                    key={cat} 
                                    style={[styles.chip, category === cat && styles.activeChip]} 
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* PLANLAR */}
                {hasPlans && !isEditing && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.label}>Paket Seçimi</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
                            {selectedCatalogItem!.plans!.map((plan) => (
                                <TouchableOpacity 
                                    key={plan.id} 
                                    style={[styles.planChip, selectedPlanId === plan.id && styles.activePlanChip]} 
                                    onPress={() => handleSelectPlan(plan)}
                                >
                                    <Text style={[styles.planName, selectedPlanId === plan.id && styles.activePlanText]}>{plan.name}</Text>
                                    <Text style={[styles.planPrice, selectedPlanId === plan.id && styles.activePlanText]}>{plan.price} {plan.currency}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* DİĞER SEÇENEKLER (Switch) */}
                <View style={styles.sectionContainer}>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Ortak Kullanım</Text>
                        <Switch value={showShareInput} onValueChange={setShowShareInput} trackColor={{ false: THEME.border, true: THEME.primary }} />
                    </View>
                    
                    {showShareInput && (
                        <View style={styles.expandedContent}>
                            <View style={styles.addPersonRow}>
                                <TextInput 
                                    style={[styles.input, { flex: 1 }]} 
                                    placeholder="Kişi adı" 
                                    value={tempPerson} 
                                    onChangeText={setTempPerson} 
                                />
                                <TouchableOpacity style={styles.addBtn} onPress={handleAddPerson}>
                                    <Ionicons name="add" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.chipContainer}>
                                {sharedWith.map((person, index) => (
                                    <View key={index} style={styles.personChip}>
                                        <Text style={styles.personName}>{person}</Text>
                                        <TouchableOpacity onPress={() => { const n = [...sharedWith]; n.splice(index, 1); setSharedWith(n) }}>
                                            <Ionicons name="close-circle" size={16} color={THEME.textSec} style={{marginLeft:4}} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            {sharedWith.length > 0 && <Text style={styles.helperText}>Kişi başı: {shareAmount} {currency}</Text>}
                        </View>
                    )}
                </View>

                {/* TAAHHÜT */}
                <View style={[styles.sectionContainer, { marginBottom: 100 }]}>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Taahhütlü Abonelik</Text>
                        <Switch value={hasContract} onValueChange={setHasContract} trackColor={{ false: THEME.border, true: THEME.primary }} />
                    </View>

                    {hasContract && (
                        <View style={styles.expandedContent}>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={styles.subLabel}>Başlangıç</Text>
                                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker('start')}>
                                        <Text style={styles.dateText}>{startDate.toLocaleDateString('tr-TR')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.subLabel}>Bitiş</Text>
                                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker('end')}>
                                        <Text style={styles.dateText}>{endDate.toLocaleDateString('tr-TR')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={showDatePicker === 'start' ? startDate : endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, d) => {
                      if (d) {
                        if (showDatePicker === 'start') setStartDate(d);
                        else setEndDate(d);
                      }
                      setShowDatePicker(null);
                    }}
                  />
                )}

            </ScrollView>
        </KeyboardAvoidingView>

        {/* FOOTER */}
        <View style={styles.footer}>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
                <LinearGradient
                    colors={[THEME.primary, THEME.primaryDark]}
                    style={styles.saveButton}
                >
                    <Text style={styles.saveButtonText}>KAYDET</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  
  // --- HERO SECTION (DEKORATİF) ---
  heroContainer: {
      overflow: 'hidden',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
  },
  heroGradient: {
      paddingTop: Platform.OS === 'ios' ? 50 : 20,
      paddingBottom: 25,
      paddingHorizontal: 20,
      position: 'relative',
  },
  // Arkaplan halkaları
  decorativeCircle1: {
      position: 'absolute',
      top: -30,
      right: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
      position: 'absolute',
      bottom: -40,
      left: 10,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(255,255,255,0.05)',
  },
  closeBtn: {
      alignSelf: 'flex-end',
      padding: 8,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      marginBottom: 10,
  },
  heroContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  logoBadge: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
  },
  logoImage: {
      width: 36,
      height: 36,
      resizeMode: 'contain',
  },
  logoText: {
      fontSize: 24,
      fontWeight: 'bold',
  },
  heroInput: {
      flex: 1,
      fontSize: 22,
      fontWeight: '700',
      color: '#FFF',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.3)',
      paddingBottom: 4,
  },

  // --- CONTENT ---
  content: {
    padding: 20,
    paddingTop: 24,
  },
  sectionContainer: {
      marginBottom: 20,
  },
  label: {
      fontSize: 13,
      fontWeight: '700',
      color: THEME.textMain,
      marginBottom: 8,
  },
  subLabel: {
      fontSize: 12,
      color: THEME.textSec,
      marginBottom: 4,
  },
  
  // DATE PICKER (GRID)
  dateSelectorBtn: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: THEME.white,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: THEME.border,
  },
  dateSelectorActive: {
      borderColor: THEME.accent,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
  },
  dateSelectorText: {
      fontSize: 16,
      color: THEME.textMain,
      fontWeight: '500',
  },
  calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: '#FFF',
      padding: 10,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: THEME.border,
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
  },
  calendarCell: {
      width: '14.28%', // 7 sütun
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
  },
  calendarCellSelected: {
      backgroundColor: THEME.accent,
      borderRadius: 20,
  },
  calendarText: {
      fontSize: 14,
      color: THEME.textMain,
      fontWeight: '600',
  },
  calendarTextSelected: {
      color: '#FFF',
      fontWeight: '700',
  },

  // Inputs
  row: {
      flexDirection: 'row',
  },
  input: {
      backgroundColor: THEME.white,
      height: 50,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: THEME.textMain,
      borderWidth: 1,
      borderColor: THEME.border,
  },
  priceRow: {
      flexDirection: 'row',
  },
  currencyBtn: {
      backgroundColor: '#E2E8F0',
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderWidth: 1,
      borderColor: THEME.border,
      borderLeftWidth: 0,
  },
  currencyText: {
      fontWeight: '700',
      color: THEME.textMain,
  },

  // Chips & Switches (Mevcut stiller aynı)
  scrollRow: { flexDirection: 'row', paddingBottom: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: THEME.white, marginRight: 8, borderWidth: 1, borderColor: THEME.border },
  activeChip: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: THEME.textSec },
  activeChipText: { color: '#FFF' },
  planChip: { padding: 14, borderRadius: 14, backgroundColor: THEME.white, marginRight: 10, borderWidth: 1, borderColor: THEME.border, minWidth: 100, alignItems: 'center' },
  activePlanChip: { borderColor: THEME.primary, borderWidth: 2, backgroundColor: '#F1F5F9' },
  planName: { fontSize: 13, fontWeight: '700', color: THEME.textMain, marginBottom: 4 },
  planPrice: { fontSize: 12, color: THEME.textSec },
  activePlanText: { color: THEME.primary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: THEME.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: THEME.border },
  switchLabel: { fontSize: 15, fontWeight: '600', color: THEME.textMain },
  expandedContent: { marginTop: 12, paddingLeft: 4 },
  addPersonRow: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { backgroundColor: THEME.primary, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  personChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E7FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  personName: { fontSize: 12, fontWeight: '600', color: THEME.accent },
  helperText: { fontSize: 13, color: THEME.textSec, marginTop: 8 },
  dateBtn: { backgroundColor: THEME.white, height: 46, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  dateText: { fontSize: 14, color: THEME.textMain, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: THEME.border, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  saveButton: { justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
});