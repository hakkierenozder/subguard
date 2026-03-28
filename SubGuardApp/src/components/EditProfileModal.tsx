import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useThemeColors } from '../constants/theme';
import agent from '../api/agent';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentUser: { fullName: string; monthlyBudget: number; monthlyBudgetCurrency: string } | null;
  onUpdateSuccess: () => void;
}

export default function EditProfileModal({ visible, onClose, currentUser, onUpdateSuccess }: Props) {
  const colors = useThemeColors();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { fullName: '', monthlyBudget: '', monthlyBudgetCurrency: 'TRY' }
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        fullName: currentUser.fullName || '',
        monthlyBudget: currentUser.monthlyBudget ? currentUser.monthlyBudget.toString() : '',
        monthlyBudgetCurrency: currentUser.monthlyBudgetCurrency || 'TRY',
      });
    }
  }, [currentUser, visible, reset]);

  const onSubmit = async (data: any) => {
    try {
      await agent.Auth.updateProfile({
        fullName: data.fullName,
        monthlyBudget: parseFloat(data.monthlyBudget) || 0,
        monthlyBudgetCurrency: data.monthlyBudgetCurrency || 'TRY',
      });
      Alert.alert('Başarılı', 'Profil bilgileri güncellendi.');
      onUpdateSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme sırasında bir sorun oluştu.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.title, { color: colors.primary }]}>Profili Düzenle</Text>

          <Text style={[styles.label, { color: colors.textSec }]}>Ad Soyad</Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain }]}
                value={value}
                onChangeText={onChange}
                placeholder="Ad Soyad"
                placeholderTextColor={colors.textSec}
              />
            )}
          />

          <Text style={[styles.label, { color: colors.textSec }]}>Aylık Hedef Bütçe (TRY)</Text>
          <Controller
            control={control}
            name="monthlyBudget"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textMain }]}
                value={value}
                onChangeText={onChange}
                placeholder="0.00"
                placeholderTextColor={colors.textSec}
                keyboardType="numeric"
              />
            )}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textSec }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit(onSubmit)}>
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
  input: { borderRadius: 12, padding: 12, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 14, flex: 1, alignItems: 'center' },
  cancelText: { fontWeight: '600' },
  saveBtn: { padding: 14, borderRadius: 12, flex: 1, alignItems: 'center', marginLeft: 10 },
  saveText: { color: '#FFF', fontWeight: 'bold' }
});
