import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { THEME } from '../constants/theme';
import agent from '../api/agent';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  const onSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      Alert.alert("Hata", "Yeni şifreler birbiriyle eşleşmiyor.");
      return;
    }
    try {
      await agent.Auth.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
      reset();
      onClose();
    } catch (error) {
      Alert.alert("Hata", "Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Şifre Değiştir</Text>

          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Mevcut Şifre" secureTextEntry />
            )}
          />
          
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Yeni Şifre" secureTextEntry />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Yeni Şifre (Tekrar)" secureTextEntry />
            )}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.saveText}>Güncelle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: THEME.primary, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: THEME.inputBg, borderRadius: 12, padding: 12, marginBottom: 16, color: THEME.textMain },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 14, flex: 1, alignItems: 'center' },
  cancelText: { color: THEME.textSec, fontWeight: '600' },
  saveBtn: { backgroundColor: THEME.primary, padding: 14, borderRadius: 12, flex: 1, alignItems: 'center', marginLeft: 10 },
  saveText: { color: '#FFF', fontWeight: 'bold' }
});