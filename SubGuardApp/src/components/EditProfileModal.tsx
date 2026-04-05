import React, { useEffect, useRef } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useThemeColors } from '../constants/theme';
import agent from '../api/agent';
import { normalizeCurrencyCode, SUPPORTED_CURRENCIES } from '../utils/CurrencyService';
import { convertAmountBetweenCurrencies } from '../utils/subscriptionMath';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
const CURRENCIES = [...SUPPORTED_CURRENCIES];

interface Props {
  visible: boolean;
  onClose: () => void;
  currentUser: { fullName: string; monthlyBudget: number; monthlyBudgetCurrency: string | null | undefined } | null;
  onUpdateSuccess: () => void;
}

export default function EditProfileModal({ visible, onClose, currentUser, onUpdateSuccess }: Props) {
  const colors = useThemeColors();
  const exchangeRates = useUserSubscriptionStore((state) => state.exchangeRates);
  const previousCurrencyRef = useRef<string>('TRY');
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { fullName: '', monthlyBudget: '', monthlyBudgetCurrency: 'TRY' },
  });
  const watchedBudget = watch('monthlyBudget');
  const watchedBudgetCurrency = normalizeCurrencyCode(watch('monthlyBudgetCurrency'));

  useEffect(() => {
    if (currentUser) {
      const normalizedCurrency = normalizeCurrencyCode(currentUser.monthlyBudgetCurrency);
      previousCurrencyRef.current = normalizedCurrency;
      reset({
        fullName: currentUser.fullName || '',
        monthlyBudget: currentUser.monthlyBudget ? currentUser.monthlyBudget.toString() : '',
        monthlyBudgetCurrency: normalizedCurrency,
      });
    }
  }, [currentUser, visible, reset]);

  useEffect(() => {
    if (!visible) return;

    const previousCurrency = previousCurrencyRef.current;
    const nextCurrency = watchedBudgetCurrency;

    if (previousCurrency === nextCurrency) return;

    const rawBudgetValue = typeof watchedBudget === 'string' ? watchedBudget.trim() : '';
    if (rawBudgetValue !== '') {
      const parsedBudget = parseFloat(rawBudgetValue.replace(',', '.'));
      if (!Number.isNaN(parsedBudget) && parsedBudget >= 0) {
        const convertedBudget = convertAmountBetweenCurrencies(
          parsedBudget,
          previousCurrency,
          nextCurrency,
          exchangeRates,
        );

        if (parsedBudget === 0 || convertedBudget > 0) {
          const fractionDigits = nextCurrency === 'TRY' ? 0 : 2;
          setValue('monthlyBudget', convertedBudget.toFixed(fractionDigits), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }
    }

    previousCurrencyRef.current = nextCurrency;
  }, [exchangeRates, setValue, visible, watchedBudget, watchedBudgetCurrency]);

  const onSubmit = async (data: any) => {
    try {
      const calls: Promise<any>[] = [];
      const trimmedName = data.fullName?.trim() ?? '';
      const normalizedCurrency = data.monthlyBudgetCurrency || currentUser?.monthlyBudgetCurrency || 'TRY';
      const rawBudgetValue = typeof data.monthlyBudget === 'string' ? data.monthlyBudget.trim() : '';

      if (trimmedName) {
        calls.push(agent.Auth.updateProfile({ fullName: trimmedName }));
      }

      if (rawBudgetValue === '') {
        calls.push(agent.Budget.updateSettings({
          monthlyBudget: 0,
          monthlyBudgetCurrency: normalizedCurrency,
        }));
      } else {
        const budget = parseFloat(rawBudgetValue);
        if (!Number.isNaN(budget) && budget >= 0) {
          calls.push(agent.Budget.updateSettings({
            monthlyBudget: budget,
            monthlyBudgetCurrency: normalizedCurrency,
          }));
        }
      }

      if (calls.length === 0) {
        onClose();
        return;
      }

      await Promise.all(calls);
      Alert.alert('Basarili', 'Profil bilgileri guncellendi.');
      onUpdateSuccess();
      onClose();
    } catch {
      // Hata agent interceptor tarafindan gosterilir
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.title, { color: colors.accent }]}>Profili Duzenle</Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: colors.textSec }]}>Ad Soyad</Text>
            <Controller
              control={control}
              name="fullName"
              rules={{ required: 'Ad Soyad zorunludur.' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: errors.fullName ? colors.error : colors.border },
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ad Soyad"
                  placeholderTextColor={colors.textSec}
                />
              )}
            />
            {errors.fullName && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.fullName.message}</Text>
            )}

            <Text style={[styles.label, { color: colors.textSec }]}>Aylik Hedef Butce</Text>
            <Controller
              control={control}
              name="monthlyBudget"
              rules={{
                validate: (v) => {
                  if (!v) return true;
                  const n = parseFloat(v);
                  if (Number.isNaN(n) || n < 0) return 'Gecerli bir tutar girin.';
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBg, color: colors.textMain, borderColor: errors.monthlyBudget ? colors.error : colors.border },
                  ]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Bos birakirsan butce sifirlanir"
                  placeholderTextColor={colors.textSec}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.monthlyBudget && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.monthlyBudget.message}</Text>
            )}

            <Text style={[styles.label, { color: colors.textSec }]}>Butce Para Birimi</Text>
            <Controller
              control={control}
              name="monthlyBudgetCurrency"
              render={({ field: { onChange, value } }) => (
                <View style={styles.currencyRow}>
                  {CURRENCIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => onChange(c)}
                      style={[
                        styles.currencyBtn,
                        {
                          backgroundColor: value === c ? colors.accent : colors.inputBg,
                          borderColor: value === c ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.currencyText, { color: value === c ? '#FFF' : colors.textSec }]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textSec }]}>Iptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.saveText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  container: { borderRadius: 20, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, marginBottom: 6, fontWeight: '600' },
  input: {
    borderRadius: 12, padding: 12, marginBottom: 4,
    borderWidth: 1.5,
  },
  errorText: { fontSize: 12, marginBottom: 12, marginLeft: 2 },
  currencyRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  currencyBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  currencyText: { fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 14, flex: 1, alignItems: 'center' },
  cancelText: { fontWeight: '600' },
  saveBtn: { padding: 14, borderRadius: 12, flex: 1, alignItems: 'center', marginLeft: 10 },
  saveText: { color: '#FFF', fontWeight: 'bold' },
});
