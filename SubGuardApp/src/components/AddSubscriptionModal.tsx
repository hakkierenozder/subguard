import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Alert, Platform, KeyboardAvoidingView, Image, Animated } from 'react-native';
import { CatalogItem, UserSubscription, Plan, AddSubscriptionPayload } from '../types';
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

// ─── Adım göstergesi ─────────────────────────────────────────────────────────
function StepIndicator({ step, colors }: { step: number; colors: ReturnType<typeof useThemeColors> }) {
  const steps = ['Temel', 'Ödeme', 'Detaylar'];
  return (
    <View style={siStyles.row}>
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = step === num;
        const isDone = step > num;
        return (
          <React.Fragment key={num}>
            <View style={siStyles.item}>
              <View style={[
                siStyles.circle,
                { borderColor: isDone || isActive ? colors.primary : colors.border,
                  backgroundColor: isDone ? colors.primary : isActive ? (colors.primary + '22') : colors.inputBg },
              ]}>
                {isDone
                  ? <Ionicons name="checkmark" size={11} color="#FFF" />
                  : <Text style={[siStyles.num, { color: isActive ? colors.primary : colors.textSec }]}>{num}</Text>
                }
              </View>
              <Text style={[siStyles.label, { color: isActive ? colors.primary : colors.textSec }]}>{label}</Text>
            </View>
            {i < 2 && (
              <View style={[siStyles.line, { backgroundColor: step > num ? colors.primary : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const siStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginBottom: 20 },
  item: { alignItems: 'center', gap: 4 },
  circle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  num: { fontSize: 11, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  line: { flex: 1, height: 2, marginHorizontal: 6, marginBottom: 14 },
});

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function AddSubscriptionModal({ visible, onClose, selectedCatalogItem, subscriptionToEdit }: Props) {
  const colors = useThemeColors();
  const { addSubscription, updateSubscription } = useUserSubscriptionStore();

  const [step, setStep] = useState(1);
  const stepAnim = useRef(new Animated.Value(1)).current;

  const animateStep = (newStep: number) => {
    Animated.sequence([
      Animated.timing(stepAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(stepAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setStep(newStep);
  };

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

  const [billingPeriod, setBillingPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');

  const [notes, setNotes] = useState('');

  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [tempPerson, setTempPerson] = useState('');
  const [showShareInput, setShowShareInput] = useState(false);

  const isEditing = !!subscriptionToEdit;
  const isCatalogItem = !!selectedCatalogItem;
  const hasPlans = selectedCatalogItem?.plans && selectedCatalogItem.plans.length > 0;
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (visible) {
      setImgFailed(false);
      stepAnim.setValue(1);
      setStep(1);
      if (subscriptionToEdit) {
        setName(subscriptionToEdit.name);
        setPrice(subscriptionToEdit.price.toString());
        setCurrency((subscriptionToEdit.currency as CurrencyType) || 'TRY');
        setCategory(subscriptionToEdit.category || 'Other');

        const now = new Date();
        let targetYear = now.getFullYear();
        let targetMonth = now.getDate() > subscriptionToEdit.billingDay ? now.getMonth() + 1 : now.getMonth();
        // Ay taşmasını düzelt (örn. Aralık+1 → Ocak yeni yıl)
        if (targetMonth > 11) { targetMonth = 0; targetYear += 1; }
        // billingDay o ayda geçersizse (örn. Şubat'ta 29-31) ayın son gününe clamp et
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const safeDay = Math.min(subscriptionToEdit.billingDay, daysInMonth);
        const derivedDate = new Date(targetYear, targetMonth, safeDay);
        setBillingDate(derivedDate);

        setHasContract(subscriptionToEdit.hasContract || false);
        if (subscriptionToEdit.contractStartDate) setStartDate(new Date(subscriptionToEdit.contractStartDate));
        if (subscriptionToEdit.contractEndDate) setEndDate(new Date(subscriptionToEdit.contractEndDate));

        setNotes(subscriptionToEdit.notes || '');
        setSharedWith(subscriptionToEdit.sharedWith || []);
        setShowShareInput((subscriptionToEdit.sharedWith?.length || 0) > 0);
        setBillingPeriod(subscriptionToEdit.billingPeriod ?? 'Monthly');
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
    setNotes('');
    setSharedWith([]);
    setShowShareInput(false);
    setBillingPeriod('Monthly');
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

  // Adım 1 → 2 geçişi için validation
  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Eksik Bilgi', 'Lütfen abonelik adını girin.');
        return;
      }
      if (!price || isNaN(parseFloat(price.replace(',', '.')))) {
        Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir fiyat girin.');
        return;
      }
    }
    animateStep(Math.min(step + 1, 3));
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Eksik Bilgi', 'Lütfen isim ve fiyat alanlarını doldurun.');
      return;
    }
    const day = billingDate.getDate();
    if (day < 1 || day > 31) {
      Alert.alert('Geçersiz Gün', 'Fatura günü 1 ile 31 arasında olmalıdır.');
      return;
    }
    const finalCatalogId = selectedCatalogItem?.id ?? subscriptionToEdit?.catalogId ?? undefined;
    const colorToSave = selectedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || colors.primary;

    const subData: AddSubscriptionPayload = {
      catalogId: finalCatalogId,
      name,
      price: parseFloat(price.replace(',', '.')),
      currency,
      billingDay: day,
      billingPeriod,
      category,
      colorCode: colorToSave,
      sharedWith: showShareInput ? sharedWith : [],
      hasContract,
      contractStartDate: hasContract ? startDate.toISOString() : undefined,
      contractEndDate: hasContract ? endDate.toISOString() : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEditing && subscriptionToEdit) {
        await updateSubscription(subscriptionToEdit.id, subData);
      } else {
        await addSubscription(subData);
      }
      onClose();
    } catch (error) {
      Alert.alert('Hata', 'Kaydedilirken bir sorun oluştu.');
    }
  };

  const shareAmount = price ? (parseFloat(price) / (sharedWith.length + 1)).toFixed(2) : '0';

  const renderLogoSection = () => {
    if (selectedCatalogItem?.logoUrl && !imgFailed) {
      return (
        <View style={[styles.logoContainer, { backgroundColor: colors.white, overflow: 'hidden' }]}>
          <Image
            source={{ uri: selectedCatalogItem.logoUrl }}
            style={styles.logoImage}
            resizeMode="contain"
            onError={() => setImgFailed(true)}
          />
        </View>
      );
    }
    const displayColor = selectedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || colors.primary;
    const displayName = selectedCatalogItem?.name || name || '?';
    return (
      <View style={[styles.logoContainer, { backgroundColor: displayColor }]}>
        <Text style={styles.logoText}>{displayName.charAt(0).toUpperCase()}</Text>
      </View>
    );
  };

  // ─── Adım 1: Temel Bilgiler ────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      {!isCatalogItem && (
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
      )}

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
            <Ionicons name="chevron-down" size={12} color={colors.textSec} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {(hasPlans && !isEditing) && (
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
                    { backgroundColor: isSelected ? colors.primary : colors.inputBg, borderColor: isSelected ? colors.primary : colors.border },
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
      )}

      {!isCatalogItem && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSec }]}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => {
              const isActive = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, { backgroundColor: isActive ? colors.primary : colors.inputBg }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, { color: isActive ? colors.white : colors.textMain }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </>
  );

  // ─── Adım 2: Ödeme Planı ──────────────────────────────────────────────────
  const renderStep2 = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSec }]}>İlk Ödeme Tarihi</Text>
        <TouchableOpacity
          style={[styles.rowInputBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
          onPress={() => setShowBillingDatePicker(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar-today" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textMain }}>
              {billingDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.textSec }}>
            {billingPeriod === 'Yearly'
              ? `Her yıl ${billingDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`
              : `Her ayın ${billingDate.getDate()}. günü`}
          </Text>
        </TouchableOpacity>

        {/* U-9: Yıllık abonelik billingDay açıklaması */}
        {billingPeriod === 'Yearly' && (
          <View style={{
            flexDirection: 'row', alignItems: 'flex-start', gap: 6,
            marginTop: 8, padding: 10, borderRadius: 10,
            backgroundColor: colors.primary + '15',
          }}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} style={{ marginTop: 1 }} />
            <Text style={{ fontSize: 12, color: colors.primary, flex: 1, lineHeight: 17 }}>
              Yıllık aboneliklerde seçtiğiniz tarih her yıl tekrarlanır.
              Ödeme ayı olarak bu tarihin ayı kullanılır.
            </Text>
          </View>
        )}

        {showBillingDatePicker && (
          <DateTimePicker
            value={billingDate}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setShowBillingDatePicker(false);
              if (d) setBillingDate(d);
            }}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSec }]}>Fatura Dönemi</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Monthly', 'Yearly'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setBillingPeriod(period)}
              style={[
                styles.periodBtn,
                {
                  borderColor: billingPeriod === period ? colors.primary : colors.border,
                  backgroundColor: billingPeriod === period ? colors.primary : colors.inputBg,
                },
              ]}
            >
              <Text style={{ color: billingPeriod === period ? '#fff' : colors.textSec, fontWeight: '600', fontSize: 13 }}>
                {period === 'Monthly' ? 'Aylık' : 'Yıllık'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  // ─── Adım 3: Ek Ayarlar ───────────────────────────────────────────────────
  const renderStep3 = () => (
    <View style={styles.extrasSection}>
      {/* Ortak Kullanım */}
      <View style={[styles.extraCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Ionicons name="people" size={20} color={colors.textMain} style={{ marginRight: 10 }} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Ortak Kullanım</Text>
          </View>
          <Switch value={showShareInput} onValueChange={setShowShareInput} trackColor={{ false: colors.border, true: colors.primary }} />
        </View>

        {showShareInput && (
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
                <TouchableOpacity
                  key={index}
                  style={[styles.personChip, { backgroundColor: colors.cardBg }]}
                  onPress={() => { const n = [...sharedWith]; n.splice(index, 1); setSharedWith(n); }}
                >
                  <Text style={[styles.personName, { color: colors.textMain }]}>{person}</Text>
                  <Ionicons name="close" size={12} color={colors.error} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: colors.success, fontWeight: '700', fontSize: 12, marginTop: 6, textAlign: 'right' }}>
              Kişi başı: {shareAmount} {currency}
            </Text>
          </View>
        )}
      </View>

      {/* Notlar */}
      <View style={[styles.extraCard, { backgroundColor: colors.inputBg, borderColor: colors.border, marginTop: 12 }]}>
        <View style={styles.row}>
          <Ionicons name="create-outline" size={20} color={colors.textMain} style={{ marginRight: 10 }} />
          <Text style={[styles.cardTitle, { color: colors.textMain }]}>Notlar</Text>
        </View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBg,
              color: colors.textMain,
              marginTop: 12,
              height: 90,
              textAlignVertical: 'top',
              paddingTop: 10,
            },
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Bu abonelikle ilgili notlarını buraya ekle..."
          placeholderTextColor={colors.textSec}
          multiline
          maxLength={500}
        />
        {notes.length > 0 && (
          <Text style={{ fontSize: 11, color: colors.textSec, textAlign: 'right', marginTop: 4 }}>
            {notes.length}/500
          </Text>
        )}
      </View>

      {/* Taahhüt */}
      <View style={[styles.extraCard, { backgroundColor: colors.inputBg, borderColor: colors.border, marginTop: 12 }]}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Ionicons name="document-text" size={20} color={colors.textMain} style={{ marginRight: 10 }} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Taahhütlü Abonelik</Text>
          </View>
          <Switch value={hasContract} onValueChange={setHasContract} trackColor={{ false: colors.border, true: colors.primary }} />
        </View>

        {hasContract && (
          <View style={styles.contractDatesRow}>
            <TouchableOpacity
              style={[styles.dateBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => setShowContractDatePicker('start')}
            >
              <Text style={{ fontSize: 10, color: colors.textSec }}>BAŞLANGIÇ</Text>
              <Text style={{ fontWeight: '600', color: colors.textMain, marginTop: 2 }}>{startDate.toLocaleDateString('tr-TR')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => setShowContractDatePicker('end')}
            >
              <Text style={{ fontSize: 10, color: colors.textSec }}>BİTİŞ</Text>
              <Text style={{ fontWeight: '600', color: colors.textMain, marginTop: 2 }}>{endDate.toLocaleDateString('tr-TR')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.modalContainer, { backgroundColor: colors.cardBg }]}>

          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <View style={styles.headerCenter}>
              {renderLogoSection()}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
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

          <StepIndicator step={step} colors={colors} />

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: stepAnim }}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </Animated.View>

            {showContractDatePicker && (
              <DateTimePicker
                value={showContractDatePicker === 'start' ? startDate : endDate}
                mode="date"
                display="default"
                minimumDate={showContractDatePicker === 'end' ? startDate : undefined}
                onChange={(e, d) => {
                  const mode = showContractDatePicker;
                  setShowContractDatePicker(null);
                  if (d) {
                    if (mode === 'start') {
                      setStartDate(d);
                      // Başlangıç bitiş tarihini geçerse bitiş tarihini de güncelle
                      if (d >= endDate) {
                        const newEnd = new Date(d);
                        newEnd.setFullYear(newEnd.getFullYear() + 1);
                        setEndDate(newEnd);
                      }
                    } else {
                      setEndDate(d);
                    }
                  }
                }}
              />
            )}

            <View style={{ height: 80 }} />
          </ScrollView>

          {/* Footer: navigasyon butonları */}
          <View style={[styles.footer, { backgroundColor: colors.cardBg, borderTopColor: colors.border }]}>
            {step === 1 ? (
              <TouchableOpacity
                style={[styles.nextButtonFull, { backgroundColor: colors.primary }]}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>İleri</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={[styles.backButton, { borderColor: colors.border }]}
                  onPress={() => animateStep(step - 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.textSec} />
                  <Text style={[styles.backButtonText, { color: colors.textSec }]}>Geri</Text>
                </TouchableOpacity>

                {step < 3 ? (
                  <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: colors.primary }]}
                    onPress={handleNext}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonText}>İleri</Text>
                    <Ionicons name="chevron-forward" size={18} color="#FFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveButtonText}>
                      {isEditing ? 'Değişiklikleri Kaydet' : 'Aboneliği Başlat'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
    shadowColor: '#000',
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
    zIndex: 100,
  },
  headerSpacer: { width: 40 },
  headerCenter: { alignItems: 'center' },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },

  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: { width: '70%', height: '70%' },
  logoText: { fontSize: 28, fontWeight: '800', color: '#FFF' },

  titleContainer: { alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
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

  periodBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1, alignItems: 'center' },

  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  catText: { fontSize: 13, fontWeight: '600' },

  extrasSection: { marginTop: 4 },
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
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 4,
  },
  backButtonText: { fontSize: 15, fontWeight: '600' },
  nextButtonFull: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  nextButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
