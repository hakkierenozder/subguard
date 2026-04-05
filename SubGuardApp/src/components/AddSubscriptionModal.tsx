import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import agent from '../api/agent';
import { useThemeColors } from '../constants/theme';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import {
  AddSubscriptionPayload,
  CatalogItem,
  Plan,
  SubscriptionUpdatePayload,
  UserSubscription,
} from '../types';
import { serializeCalendarDate } from '../utils/dateUtils';
import { useCatalogStore } from '../store/useCatalogStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '../utils/CurrencyService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
  selectedCatalogItem: CatalogItem | null;
  subscriptionToEdit?: UserSubscription | null;
}

type CurrencyType = SupportedCurrency;
type BillingPeriodType = 'Monthly' | 'Yearly';
type StepKey = 1 | 2;
type ShareTab = 'member' | 'guest';

const CATEGORY_OPTIONS = [
  { value: 'Streaming', label: 'Streaming' },
  { value: 'Music', label: 'Müzik' },
  { value: 'Gaming', label: 'Oyun' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Food', label: 'Yemek' },
  { value: 'Gym', label: 'Spor' },
  { value: 'Rent', label: 'Kira' },
  { value: 'Bills', label: 'Faturalar' },
  { value: 'Other', label: 'Diğer' },
] as const;

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => {
  const next = normalizeDate(date);
  next.setDate(next.getDate() + days);
  return next;
};
const parsePriceInput = (value: string) => {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
};
const inferBillingPeriodFromPlan = (plan: Plan): BillingPeriodType => (plan.billingCycleDays >= 365 ? 'Yearly' : 'Monthly');
const getPeriodUnit = (period: BillingPeriodType) => (period === 'Yearly' ? 'yıl' : 'ay');
const getDefaultContractEndDate = (start: Date) => {
  const nextYear = normalizeDate(start);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  return nextYear > normalizeDate(start) ? nextYear : addDays(start, 1);
};
const ensureContractDates = (billingDate: Date, startDate: Date, endDate: Date) => {
  const minStartDate = normalizeDate(billingDate);
  const alignedStartDate = normalizeDate(startDate) < minStartDate ? minStartDate : normalizeDate(startDate);
  const alignedEndDate = normalizeDate(endDate) <= alignedStartDate
    ? getDefaultContractEndDate(alignedStartDate)
    : normalizeDate(endDate);
  return { startDate: alignedStartDate, endDate: alignedEndDate };
};
const getFallbackBillingDateForEdit = (subscription: UserSubscription) => {
  if (subscription.firstPaymentDate) return normalizeDate(new Date(subscription.firstPaymentDate));
  if (subscription.contractStartDate) return normalizeDate(new Date(subscription.contractStartDate));

  const now = normalizeDate(new Date());
  if (subscription.billingPeriod === 'Yearly' && subscription.billingMonth != null) {
    const targetMonth = subscription.billingMonth - 1;
    const daysInTargetMonth = new Date(now.getFullYear(), targetMonth + 1, 0).getDate();
    const safeDay = Math.min(subscription.billingDay, daysInTargetMonth);
    let targetDate = new Date(now.getFullYear(), targetMonth, safeDay);
    if (targetDate < now) {
      const nextYearDays = new Date(now.getFullYear() + 1, targetMonth + 1, 0).getDate();
      targetDate = new Date(now.getFullYear() + 1, targetMonth, Math.min(subscription.billingDay, nextYearDays));
    }
    return normalizeDate(targetDate);
  }

  let targetYear = now.getFullYear();
  let targetMonth = now.getDate() > subscription.billingDay ? now.getMonth() + 1 : now.getMonth();
  if (targetMonth > 11) {
    targetMonth = 0;
    targetYear += 1;
  }
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  return normalizeDate(new Date(targetYear, targetMonth, Math.min(subscription.billingDay, daysInMonth)));
};
const buildSignature = (payload: Record<string, unknown>) => JSON.stringify(payload);

function StepIndicator({ step, colors }: { step: StepKey; colors: ReturnType<typeof useThemeColors> }) {
  const items: { key: StepKey; label: string }[] = [
    { key: 1, label: 'Plan' },
    { key: 2, label: 'Detaylar' },
  ];

  return (
    <View style={styles.stepRow}>
      {items.map((item, index) => {
        const active = step === item.key;
        const done = step > item.key;
        return (
          <React.Fragment key={item.key}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, {
                backgroundColor: done ? colors.accent : active ? colors.accentLight : colors.inputBg,
                borderColor: done || active ? colors.accent : colors.border,
              }]}>
                {done ? <Ionicons name="checkmark" size={12} color="#FFF" /> : <Text style={[styles.stepNumber, { color: active ? colors.accent : colors.textSec }]}>{item.key}</Text>}
              </View>
              <Text style={[styles.stepLabel, { color: active ? colors.textMain : colors.textSec }]}>{item.label}</Text>
            </View>
            {index < items.length - 1 && <View style={[styles.stepLine, { backgroundColor: step > item.key ? colors.accent : colors.border }]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default function AddSubscriptionModal({
  visible,
  onClose,
  onSaved,
  selectedCatalogItem,
  subscriptionToEdit,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { addSubscription, updateSubscription } = useUserSubscriptionStore();
  const catalogItems = useCatalogStore((state) => state.catalogItems);
  const fetchCatalog = useCatalogStore((state) => state.fetchCatalog);
  const today = normalizeDate(new Date());
  const stepAnim = useRef(new Animated.Value(1)).current;
  const initialSignature = useRef('');

  const [step, setStep] = useState<StepKey>(1);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Other');
  const [currency, setCurrency] = useState<CurrencyType>('TRY');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [billingDate, setBillingDate] = useState(today);
  const [showBillingDatePicker, setShowBillingDatePicker] = useState(false);
  const [hasContract, setHasContract] = useState(false);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(getDefaultContractEndDate(today));
  const [showContractDatePicker, setShowContractDatePicker] = useState<'start' | 'end' | null>(null);
  const [iosDatePickerTarget, setIosDatePickerTarget] = useState<'billing' | 'start' | 'end' | null>(null);
  const [iosPickerDate, setIosPickerDate] = useState(today);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriodType>('Monthly');
  const [notes, setNotes] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [tempMemberEmail, setTempMemberEmail] = useState('');
  const [tempGuestName, setTempGuestName] = useState('');
  const [shareTab, setShareTab] = useState<ShareTab>('member');
  const [showShareInput, setShowShareInput] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [memberEmailError, setMemberEmailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const isEditing = !!subscriptionToEdit;
  const usesStepper = !isEditing;
  const isCatalogPreset = !!selectedCatalogItem && !isEditing;
  const resolvedCatalogItem = useMemo(
    () => selectedCatalogItem ?? catalogItems.find((item) => item.id === subscriptionToEdit?.catalogId) ?? null,
    [catalogItems, selectedCatalogItem, subscriptionToEdit?.catalogId],
  );
  const hasPlans = !!resolvedCatalogItem?.plans?.length;
  const requiresContract = resolvedCatalogItem?.requiresContract ?? false;
  const selectedPlan = useMemo(
    () => resolvedCatalogItem?.plans?.find((plan) => plan.id === selectedPlanId) ?? null,
    [resolvedCatalogItem, selectedPlanId],
  );
  const parsedPrice = parsePriceInput(price);
  const totalShareCount = memberEmails.length + guestNames.length;
  const shareAmount = Number.isFinite(parsedPrice) ? (parsedPrice / (totalShareCount + 1)).toFixed(2) : '0.00';

  useEffect(() => {
    if (!visible) return;
    if (!selectedCatalogItem && subscriptionToEdit?.catalogId && catalogItems.length === 0) {
      fetchCatalog();
    }
  }, [catalogItems.length, fetchCatalog, selectedCatalogItem, subscriptionToEdit?.catalogId, visible]);

  const currentSignature = buildSignature({
    name: name.trim(),
    price: price.trim(),
    category,
    currency,
    selectedPlanId,
    billingDate: serializeCalendarDate(billingDate),
    hasContract,
    startDate: serializeCalendarDate(startDate),
    endDate: serializeCalendarDate(endDate),
    billingPeriod,
    notes: notes.trim(),
    memberEmails: [...memberEmails].sort(),
    guestNames: [...guestNames].sort(),
    showShareInput,
  });

  const animateStep = (nextStep: StepKey) => {
    Animated.sequence([
      Animated.timing(stepAnim, { toValue: 0, duration: 110, useNativeDriver: true }),
      Animated.timing(stepAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setStep(nextStep);
  };

  useEffect(() => {
    if (!visible) return;

    setImgFailed(false);
    stepAnim.setValue(1);
    setStep(1);
    setTempMemberEmail('');
    setTempGuestName('');
    setMemberEmailError(null);
    setCheckingEmail(false);
    setShareTab('member');
    setIosDatePickerTarget(null);

    if (subscriptionToEdit) {
      const derivedBillingDate = getFallbackBillingDateForEdit(subscriptionToEdit);
      const nextHasContract = subscriptionToEdit.hasContract;
      const nextStartDate = subscriptionToEdit.contractStartDate
        ? normalizeDate(new Date(subscriptionToEdit.contractStartDate))
        : derivedBillingDate;
      const nextEndDate = subscriptionToEdit.contractEndDate
        ? normalizeDate(new Date(subscriptionToEdit.contractEndDate))
        : getDefaultContractEndDate(nextStartDate);
      const contractDates = nextHasContract
        ? ensureContractDates(derivedBillingDate, nextStartDate, nextEndDate)
        : { startDate: nextStartDate, endDate: nextEndDate };

      setName(subscriptionToEdit.name);
      setPrice(subscriptionToEdit.price.toString());
      setCategory(subscriptionToEdit.category || 'Other');
      setCurrency((subscriptionToEdit.currency as CurrencyType) || 'TRY');
      setSelectedPlanId(null);
      setBillingDate(derivedBillingDate);
      setHasContract(nextHasContract);
      setStartDate(contractDates.startDate);
      setEndDate(contractDates.endDate);
      setBillingPeriod(subscriptionToEdit.billingPeriod ?? 'Monthly');
      setNotes(subscriptionToEdit.notes ?? '');
      setMemberEmails((subscriptionToEdit.sharedWith ?? []).map((share) => share.email));
      setGuestNames((subscriptionToEdit.sharedGuests ?? []).map((guest) => guest.displayName));
      setShowShareInput((subscriptionToEdit.sharedWith ?? []).length > 0 || (subscriptionToEdit.sharedGuests ?? []).length > 0);
      initialSignature.current = buildSignature({
        name: subscriptionToEdit.name.trim(),
        price: subscriptionToEdit.price.toString(),
        category: subscriptionToEdit.category || 'Other',
        currency: (subscriptionToEdit.currency as CurrencyType) || 'TRY',
        selectedPlanId: null,
        billingDate: serializeCalendarDate(derivedBillingDate),
        hasContract: nextHasContract,
        startDate: serializeCalendarDate(contractDates.startDate),
        endDate: serializeCalendarDate(contractDates.endDate),
        billingPeriod: subscriptionToEdit.billingPeriod ?? 'Monthly',
        notes: (subscriptionToEdit.notes ?? '').trim(),
        memberEmails: (subscriptionToEdit.sharedWith ?? []).map((share) => share.email).sort(),
        guestNames: (subscriptionToEdit.sharedGuests ?? []).map((guest) => guest.displayName).sort(),
        showShareInput: (subscriptionToEdit.sharedWith ?? []).length > 0 || (subscriptionToEdit.sharedGuests ?? []).length > 0,
      });
    } else {
      const baseDate = normalizeDate(new Date());
      setName(selectedCatalogItem?.name ?? '');
      setPrice('');
      setCategory(selectedCatalogItem?.category ?? 'Other');
      setCurrency('TRY');
      setSelectedPlanId(null);
      setBillingDate(baseDate);
      setHasContract(requiresContract);
      setStartDate(baseDate);
      setEndDate(getDefaultContractEndDate(baseDate));
      setBillingPeriod('Monthly');
      setNotes('');
      setMemberEmails([]);
      setGuestNames([]);
      setShowShareInput(false);
      initialSignature.current = buildSignature({
        name: (selectedCatalogItem?.name ?? '').trim(),
        price: '',
        category: selectedCatalogItem?.category ?? 'Other',
        currency: 'TRY',
        selectedPlanId: null,
        billingDate: serializeCalendarDate(baseDate),
        hasContract: requiresContract,
        startDate: serializeCalendarDate(baseDate),
        endDate: serializeCalendarDate(getDefaultContractEndDate(baseDate)),
        billingPeriod: 'Monthly',
        notes: '',
        memberEmails: [],
        guestNames: [],
        showShareInput: false,
      });
    }
  }, [visible, selectedCatalogItem, subscriptionToEdit, stepAnim]);

  useEffect(() => {
    if (!hasContract) return;
    const aligned = ensureContractDates(billingDate, startDate, endDate);
    if (aligned.startDate.getTime() !== startDate.getTime()) setStartDate(aligned.startDate);
    if (aligned.endDate.getTime() !== endDate.getTime()) setEndDate(aligned.endDate);
  }, [billingDate, hasContract, startDate, endDate]);

  const handleRequestClose = () => {
    if (saving) return;
    if (currentSignature === initialSignature.current) {
      onClose();
      return;
    }
    Alert.alert('Formu kapat', 'Kaydedilmemiş değişiklikler silinecek. Yine de çıkmak istiyor musun?', [
      { text: 'Formda Kal', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: onClose },
    ]);
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setPrice(plan.price.toString());
    setCurrency((plan.currency as CurrencyType) || 'TRY');
    setBillingPeriod(inferBillingPeriodFromPlan(plan));
  };

  const openBillingDatePicker = () => {
    if (Platform.OS === 'ios') {
      setIosPickerDate(billingDate);
      setIosDatePickerTarget('billing');
      return;
    }
    setShowBillingDatePicker(true);
  };

  const openContractDatePicker = (target: 'start' | 'end') => {
    if (Platform.OS === 'ios') {
      setIosPickerDate(target === 'start' ? startDate : endDate);
      setIosDatePickerTarget(target);
      return;
    }
    setShowContractDatePicker(target);
  };

  const applyIOSDatePicker = () => {
    if (!iosDatePickerTarget) return;
    const normalizedDate = normalizeDate(iosPickerDate);
    if (iosDatePickerTarget === 'billing') {
      setBillingDate(normalizedDate);
    } else if (iosDatePickerTarget === 'start') {
      const aligned = ensureContractDates(billingDate, normalizedDate, endDate);
      setStartDate(aligned.startDate);
      setEndDate(aligned.endDate);
    } else {
      const aligned = ensureContractDates(billingDate, startDate, normalizedDate);
      setStartDate(aligned.startDate);
      setEndDate(aligned.endDate);
    }
    setIosDatePickerTarget(null);
  };

  const handlePrimaryValidation = () => {
    if (!name.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen abonelik adını girin.');
      return false;
    }
    if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir tutar girin.');
      return false;
    }
    return true;
  };

  const handleAddMember = async () => {
    const email = tempMemberEmail.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMemberEmailError('Geçerli bir e-posta adresi girin.');
      return;
    }
    if (memberEmails.some((item) => item.toLowerCase() === email)) {
      setMemberEmailError('Bu e-posta zaten eklendi.');
      return;
    }
    setMemberEmailError(null);
    setCheckingEmail(true);
    try {
      await agent.UserSubscriptions.checkUser(email);
      setMemberEmails((current) => [...current, email]);
      setTempMemberEmail('');
    } catch (error: any) {
      setMemberEmailError(error?.response?.data?.errors?.[0] ?? 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleAddGuest = () => {
    const guestName = tempGuestName.trim();
    if (!guestName || guestNames.some((item) => item.toLowerCase() === guestName.toLowerCase())) return;
    setGuestNames((current) => [...current, guestName]);
    setTempGuestName('');
  };

  const handleSave = async () => {
    if (saving) return;
    if (!handlePrimaryValidation()) return;

    setSaving(true);
    const normalizedBillingDate = normalizeDate(billingDate);
    const normalizedContractDates = ensureContractDates(normalizedBillingDate, startDate, endDate);
    const effectiveHasContract = requiresContract || hasContract;
    const addPayload: AddSubscriptionPayload = {
      catalogId: selectedCatalogItem?.id ?? subscriptionToEdit?.catalogId ?? undefined,
      name: name.trim(),
      price: parsedPrice,
      currency,
      billingDay: normalizedBillingDate.getDate(),
      billingPeriod,
      billingMonth: billingPeriod === 'Yearly' ? normalizedBillingDate.getMonth() + 1 : null,
      firstPaymentDate: serializeCalendarDate(normalizedBillingDate),
      category,
      colorCode: resolvedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || colors.accent,
      hasContract: effectiveHasContract,
      contractStartDate: effectiveHasContract ? serializeCalendarDate(normalizedContractDates.startDate) : undefined,
      contractEndDate: effectiveHasContract ? serializeCalendarDate(normalizedContractDates.endDate) : undefined,
      sharedWith: showShareInput ? memberEmails : [],
      sharedGuests: showShareInput ? guestNames : [],
      notes: notes.trim() || undefined,
    };

    try {
      if (isEditing && subscriptionToEdit) {
        const updatePayload: SubscriptionUpdatePayload = {
          name: addPayload.name,
          price: addPayload.price,
          currency: addPayload.currency,
          billingDay: addPayload.billingDay,
          billingMonth: addPayload.billingMonth ?? null,
          billingPeriod: addPayload.billingPeriod,
          firstPaymentDate: addPayload.firstPaymentDate,
          category: addPayload.category,
          colorCode: addPayload.colorCode,
          hasContract: addPayload.hasContract ?? false,
          contractStartDate: addPayload.contractStartDate,
          contractEndDate: addPayload.contractEndDate,
          notes: addPayload.notes ?? null,
          sharedUserEmails: showShareInput ? memberEmails : [],
          sharedGuestNames: showShareInput ? guestNames : [],
        };
        await updateSubscription(subscriptionToEdit.id, updatePayload);
        onClose();
      } else {
        await addSubscription(addPayload);
        if (onSaved) onSaved();
        else onClose();
      }
    } catch {
      Alert.alert('Hata', 'Kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const renderLogo = () => {
    if (resolvedCatalogItem?.logoUrl && !imgFailed) {
      return (
        <View style={[styles.logoShell, { backgroundColor: colors.white }]}>
          <Image source={{ uri: resolvedCatalogItem.logoUrl }} style={styles.logoImage} resizeMode="contain" onError={() => setImgFailed(true)} />
        </View>
      );
    }
    const fallbackColor = resolvedCatalogItem?.colorCode || subscriptionToEdit?.colorCode || colors.accent;
    const fallbackName = resolvedCatalogItem?.name || name || '?';
    return (
      <View style={[styles.logoShell, { backgroundColor: fallbackColor }]}>
        <Text style={styles.logoText}>{fallbackName.charAt(0).toUpperCase()}</Text>
      </View>
    );
  };

  const renderPlanStep = () => (
    <View style={styles.stack}>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        {!isCatalogPreset && (
          <View style={styles.group}>
            <Text style={[styles.label, { color: colors.textSec }]}>Abonelik Adı</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Örn: Ev interneti"
              placeholderTextColor={colors.textSec}
            />
          </View>
        )}

        {isCatalogPreset && (
          <View style={[styles.infoBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.infoTitle, { color: colors.textMain }]}>{selectedCatalogItem?.name}</Text>
              <Text style={[styles.infoText, { color: colors.textSec }]}>{selectedCatalogItem?.category} · hazır servis</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>Hazır</Text>
            </View>
          </View>
        )}

        {hasPlans && !isEditing && (
          <View style={styles.group}>
            <View style={styles.rowBetween}>
              <Text style={[styles.label, { color: colors.textSec }]}>Paket</Text>
              {selectedPlanId && (
                <TouchableOpacity onPress={() => setSelectedPlanId(null)}>
                  <Text style={[styles.linkText, { color: colors.accent }]}>Özel fiyat gir</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.planList}>
              {resolvedCatalogItem?.plans?.map((plan) => {
                const active = plan.id === selectedPlanId;
                const period = inferBillingPeriodFromPlan(plan);
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: active ? colors.accentLight : colors.cardBg,
                        borderColor: active ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectPlan(plan)}
                  >
                    <Text style={[styles.planName, { color: colors.textMain }]}>{plan.name}</Text>
                    <Text style={[styles.planPrice, { color: colors.textMain }]}>{plan.price.toFixed(2)} {plan.currency}</Text>
                    <Text style={[styles.planMeta, { color: colors.textSec }]}>{period === 'Yearly' ? 'Yıllık plan' : 'Aylık plan'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.textSec }]}>{billingPeriod === 'Yearly' ? 'Yıllık Tutar' : 'Aylık Tutar'}</Text>
          <TextInput
            style={[styles.priceInput, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
            value={price}
            onChangeText={(value) => {
              setSelectedPlanId(null);
              setPrice(value.replace(/[^0-9.,]/g, ''));
            }}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textSec}
            editable={!selectedPlanId}
          />
          {selectedPlan && <Text style={[styles.caption, { color: colors.textSec }]}>Seçili paket fiyatı, para birimi ve dönemi kilitler.</Text>}
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.textSec }]}>Para Birimi</Text>
          <View style={styles.choiceRow}>
            {SUPPORTED_CURRENCIES.map((item) => {
              const active = item === currency;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.choiceChip,
                    {
                      backgroundColor: active ? colors.accent : colors.inputBg,
                      borderColor: active ? colors.accent : colors.border,
                      opacity: selectedPlanId ? 0.55 : 1,
                    },
                  ]}
                  onPress={() => !selectedPlanId && setCurrency(item)}
                  disabled={!!selectedPlanId}
                >
                  <Text style={[styles.choiceText, { color: active ? '#FFF' : colors.textMain }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: colors.textSec }]}>Fatura Dönemi</Text>
          <View style={styles.choiceRow}>
            {(['Monthly', 'Yearly'] as BillingPeriodType[]).map((item) => {
              const active = item === billingPeriod;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.choiceChip,
                    {
                      backgroundColor: active ? colors.accent : colors.inputBg,
                      borderColor: active ? colors.accent : colors.border,
                      opacity: selectedPlanId ? 0.55 : 1,
                    },
                  ]}
                  onPress={() => !selectedPlanId && setBillingPeriod(item)}
                  disabled={!!selectedPlanId}
                >
                  <Text style={[styles.choiceText, { color: active ? '#FFF' : colors.textMain }]}>{item === 'Yearly' ? 'Yıllık' : 'Aylık'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!isCatalogPreset && (
          <View style={styles.group}>
            <Text style={[styles.label, { color: colors.textSec }]}>Kategori</Text>
            <View style={styles.wrap}>
              {CATEGORY_OPTIONS.map((item) => {
                const active = item.value === category;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: active ? colors.accent : colors.inputBg,
                        borderColor: active ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setCategory(item.value)}
                  >
                    <Text style={[styles.choiceText, { color: active ? '#FFF' : colors.textMain }]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stack}>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Ödeme Takvimi</Text>
        <TouchableOpacity style={[styles.infoBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={openBillingDatePicker}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="calendar-today" size={18} color={colors.accent} style={{ marginRight: 10 }} />
            <View>
              <Text style={[styles.infoTitle, { color: colors.textMain }]}>{billingDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              <Text style={[styles.infoText, { color: colors.textSec }]}>
                {billingPeriod === 'Yearly' ? `Her yıl ${billingDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}` : `Her ayın ${billingDate.getDate()}. günü`}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSec} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Taahhüt</Text>
            <Text style={[styles.infoText, { color: colors.textSec }]}>{requiresContract ? 'Bu servis taahhütlü akışla geliyor.' : 'Varsa başlangıç ve bitiş tarihini ekle.'}</Text>
          </View>
          <Switch
            value={requiresContract || hasContract}
            onValueChange={(value) => {
              if (requiresContract && !value) return;
              setHasContract(value);
            }}
            disabled={requiresContract}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </View>
        {(requiresContract || hasContract) && (
          <View style={styles.rowGap}>
            <TouchableOpacity style={[styles.dateCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => openContractDatePicker('start')}>
              <Text style={[styles.dateLabel, { color: colors.textSec }]}>Başlangıç</Text>
              <Text style={[styles.dateValue, { color: colors.textMain }]}>{startDate.toLocaleDateString('tr-TR')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dateCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => openContractDatePicker('end')}>
              <Text style={[styles.dateLabel, { color: colors.textSec }]}>Bitiş</Text>
              <Text style={[styles.dateValue, { color: colors.textMain }]}>{endDate.toLocaleDateString('tr-TR')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Ortak Kullanım</Text>
            <Text style={[styles.infoText, { color: colors.textSec }]}>Kullanıcı veya misafir ekleyip payını takip et.</Text>
          </View>
          <Switch value={showShareInput} onValueChange={setShowShareInput} trackColor={{ false: colors.border, true: colors.accent }} />
        </View>

        {showShareInput && (
          <>
            <View style={[styles.segment, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              {(['member', 'guest'] as ShareTab[]).map((item) => {
                const active = shareTab === item;
                return (
                  <TouchableOpacity key={item} style={[styles.segmentBtn, { backgroundColor: active ? colors.accent : 'transparent' }]} onPress={() => setShareTab(item)}>
                    <Text style={[styles.segmentText, { color: active ? '#FFF' : colors.textSec }]}>{item === 'member' ? 'Kayıtlı' : 'Misafir'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {shareTab === 'member' ? (
              <>
                <View style={styles.inlineRow}>
                  <TextInput
                    style={[styles.inlineInput, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: memberEmailError ? colors.error : colors.border }]}
                    value={tempMemberEmail}
                    onChangeText={(value) => {
                      setTempMemberEmail(value);
                      setMemberEmailError(null);
                    }}
                    placeholder="ornek@email.com"
                    placeholderTextColor={colors.textSec}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!checkingEmail}
                    onSubmitEditing={handleAddMember}
                  />
                  <TouchableOpacity style={[styles.iconButton, { backgroundColor: checkingEmail ? colors.border : colors.accent }]} onPress={handleAddMember} disabled={checkingEmail}>
                    {checkingEmail ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="add" size={20} color="#FFF" />}
                  </TouchableOpacity>
                </View>
                {memberEmailError && <Text style={[styles.errorText, { color: colors.error }]}>{memberEmailError}</Text>}
              </>
            ) : (
              <View style={styles.inlineRow}>
                <TextInput
                  style={[styles.inlineInput, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
                  value={tempGuestName}
                  onChangeText={setTempGuestName}
                  placeholder="Misafir adı"
                  placeholderTextColor={colors.textSec}
                  onSubmitEditing={handleAddGuest}
                />
                <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.accent }]} onPress={handleAddGuest}>
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {(memberEmails.length > 0 || guestNames.length > 0) && (
              <>
                <View style={styles.wrap}>
                  {memberEmails.map((email) => (
                    <TouchableOpacity key={email} style={[styles.personChip, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => setMemberEmails((current) => current.filter((item) => item !== email))}>
                      <Text style={[styles.personText, { color: colors.textMain }]} numberOfLines={1}>{email}</Text>
                      <Ionicons name="close-circle" size={14} color={colors.error} />
                    </TouchableOpacity>
                  ))}
                  {guestNames.map((guest) => (
                    <TouchableOpacity key={guest} style={[styles.personChip, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => setGuestNames((current) => current.filter((item) => item !== guest))}>
                      <Text style={[styles.personText, { color: colors.textMain }]} numberOfLines={1}>{guest}</Text>
                      <Ionicons name="close-circle" size={14} color={colors.error} />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.caption, { color: colors.success }]}>Kişi başı pay: {shareAmount} {currency} / {getPeriodUnit(billingPeriod)}</Text>
              </>
            )}
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Notlar</Text>
        <TextInput
          style={[styles.notesInput, { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: colors.border }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Bu abonelikle ilgili kısa notlarını buraya ekle..."
          placeholderTextColor={colors.textSec}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleRequestClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleRequestClose} />
        <View style={[styles.modal, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 18) }]}>
            <View style={styles.headerTop}>
              {renderLogo()}
              <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={handleRequestClose}>
                <Ionicons name="close" size={20} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: colors.textMain }]}>{isEditing ? 'Aboneliği Düzenle' : name || 'Yeni Abonelik'}</Text>
            <Text style={[styles.subtitle, { color: colors.textSec }]}>
              {isEditing
                ? 'Fiyat, takvim ve paylaşım detaylarını tek ekranda güncelle.'
                : isCatalogPreset
                  ? 'Planı seç, takvimi kontrol et ve kaydet.'
                  : 'Fiyat, takvim ve paylaşım detaylarını tamamla.'}
            </Text>
            {usesStepper && <StepIndicator step={step} colors={colors} />}
          </View>
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: stepAnim }}>
              {usesStepper ? (
                step === 1 ? renderPlanStep() : renderDetailsStep()
              ) : (
                <View style={styles.stack}>
                  {renderPlanStep()}
                  {renderDetailsStep()}
                </View>
              )}
            </Animated.View>

            {Platform.OS !== 'ios' && showBillingDatePicker && (
              <DateTimePicker
                value={billingDate}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  setShowBillingDatePicker(false);
                  if (date) setBillingDate(normalizeDate(date));
                }}
              />
            )}

            {Platform.OS !== 'ios' && showContractDatePicker && (
              <DateTimePicker
                value={showContractDatePicker === 'start' ? startDate : endDate}
                mode="date"
                display="default"
                minimumDate={showContractDatePicker === 'start' ? normalizeDate(billingDate) : addDays(startDate, 1)}
                onChange={(_, date) => {
                  const mode = showContractDatePicker;
                  setShowContractDatePicker(null);
                  if (!date) return;
                  const normalizedDate = normalizeDate(date);
                  if (mode === 'start') {
                    const aligned = ensureContractDates(billingDate, normalizedDate, endDate);
                    setStartDate(aligned.startDate);
                    setEndDate(aligned.endDate);
                  } else {
                    const aligned = ensureContractDates(billingDate, startDate, normalizedDate);
                    setStartDate(aligned.startDate);
                    setEndDate(aligned.endDate);
                  }
                }}
              />
            )}
          </ScrollView>
          <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 18) }]}>
            {!usesStepper ? (
              <View style={styles.footerRow}>
                <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={handleRequestClose}>
                  <Ionicons name="close-outline" size={18} color={colors.textSec} />
                  <Text style={[styles.secondaryText, { color: colors.textMain }]}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.accent, flex: 1 }]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator size="small" color="#FFF" /> : (
                    <>
                      <Text style={styles.primaryText}>Kaydet</Text>
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : step === 1 ? (
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.accent }]} onPress={() => {
                if (handlePrimaryValidation()) animateStep(2);
              }}>
                <Text style={styles.primaryText}>Detaylara Geç</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.footerRow}>
                <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={() => animateStep(1)}>
                  <Ionicons name="chevron-back" size={18} color={colors.textSec} />
                  <Text style={[styles.secondaryText, { color: colors.textMain }]}>Geri</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.accent, flex: 1 }]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator size="small" color="#FFF" /> : (
                    <>
                      <Text style={styles.primaryText}>{isEditing ? 'Kaydet' : 'Aboneliği Kaydet'}</Text>
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {Platform.OS === 'ios' && iosDatePickerTarget && (
            <View style={styles.dateOverlay}>
              <TouchableOpacity style={styles.dateBackdrop} activeOpacity={1} onPress={() => setIosDatePickerTarget(null)} />
              <View style={[styles.dateSheet, { backgroundColor: colors.cardBg, borderColor: colors.border, paddingBottom: Math.max(insets.bottom, 18) }]}>
                <View style={[styles.dateSheetHeader, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity onPress={() => setIosDatePickerTarget(null)}>
                    <Text style={[styles.dateSheetAction, { color: colors.textSec }]}>Vazgeç</Text>
                  </TouchableOpacity>
                  <Text style={[styles.dateSheetTitle, { color: colors.textMain }]}>
                    {iosDatePickerTarget === 'billing'
                      ? 'İlk ödeme tarihi'
                      : iosDatePickerTarget === 'start'
                        ? 'Taahhüt başlangıcı'
                        : 'Taahhüt bitişi'}
                  </Text>
                  <TouchableOpacity onPress={applyIOSDatePicker}>
                    <Text style={[styles.dateSheetAction, { color: colors.accent }]}>Uygula</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={iosPickerDate}
                  mode="date"
                  display="spinner"
                  locale="tr-TR"
                  minimumDate={iosDatePickerTarget === 'billing'
                    ? undefined
                    : iosDatePickerTarget === 'start'
                      ? normalizeDate(billingDate)
                      : addDays(startDate, 1)}
                  onChange={(_, date) => {
                    if (date) setIosPickerDate(normalizeDate(date));
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.56)' },
  modal: { flex: 1, borderWidth: 1, overflow: 'hidden' },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  logoShell: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: '70%', height: '70%' },
  logoText: { color: '#FFF', fontSize: 30, fontWeight: '800' },
  title: { marginTop: 14, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { marginTop: 6, fontSize: 13, fontWeight: '500', lineHeight: 18, textAlign: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 10 },
  stepItem: { alignItems: 'center', gap: 6 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  stepNumber: { fontSize: 12, fontWeight: '800' },
  stepLabel: { fontSize: 11, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, marginHorizontal: 10, marginBottom: 18 },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingBottom: 26 },
  stack: { gap: 14 },
  card: { borderRadius: 22, borderWidth: 1, padding: 16, gap: 14 },
  group: { gap: 10 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  input: { height: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
  priceInput: { height: 72, borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, textAlign: 'center', fontSize: 36, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowGap: { flexDirection: 'row', gap: 10 },
  infoBox: { minHeight: 68, borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  infoTitle: { fontSize: 15, fontWeight: '800' },
  infoText: { marginTop: 4, fontSize: 12, lineHeight: 17 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  linkText: { fontSize: 12, fontWeight: '700' },
  planList: { gap: 10 },
  planCard: { width: 180, borderRadius: 18, borderWidth: 1, padding: 14, gap: 6 },
  planName: { fontSize: 15, fontWeight: '800' },
  planPrice: { fontSize: 18, fontWeight: '800' },
  planMeta: { fontSize: 12, lineHeight: 17 },
  choiceRow: { flexDirection: 'row', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: { minWidth: 74, height: 42, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  choiceText: { fontSize: 13, fontWeight: '700' },
  caption: { fontSize: 12, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  dateCard: { flex: 1, minHeight: 72, borderRadius: 18, borderWidth: 1, padding: 14, justifyContent: 'center' },
  dateLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.35 },
  dateValue: { marginTop: 6, fontSize: 15, fontWeight: '800' },
  segment: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 4, gap: 4 },
  segmentBtn: { flex: 1, minHeight: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  segmentText: { fontSize: 12, fontWeight: '700' },
  inlineRow: { flexDirection: 'row', gap: 10 },
  inlineInput: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, fontWeight: '600' },
  iconButton: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  errorText: { marginTop: -4, fontSize: 12, fontWeight: '600' },
  personChip: { maxWidth: '100%', borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6 },
  personText: { maxWidth: 180, fontSize: 12, fontWeight: '600' },
  notesInput: { minHeight: 120, borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, lineHeight: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 34 : 18, borderTopWidth: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primaryButton: { height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
  primaryText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  secondaryButton: { height: 54, borderRadius: 18, borderWidth: 1, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6 },
  secondaryText: { fontSize: 15, fontWeight: '700' },
  dateOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  dateBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.34)' },
  dateSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dateSheetHeader: {
    minHeight: 54,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSheetTitle: { fontSize: 15, fontWeight: '800' },
  dateSheetAction: { fontSize: 15, fontWeight: '700' },
});
