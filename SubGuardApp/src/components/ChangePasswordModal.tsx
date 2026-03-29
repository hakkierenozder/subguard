import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useThemeColors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import agent from '../api/agent';
import Toast from 'react-native-toast-message';
import {
  passwordRules,
  getPasswordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
} from '../utils/validation';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const colors = useThemeColors();
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const newPasswordValue = watch('newPassword');
  const strength = newPasswordValue ? getPasswordStrength(newPasswordValue) : null;

  const onSubmit = async (data: FormValues) => {
    try {
      await agent.Auth.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.newPassword,
      });
      Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Şifreniz değiştirildi.', position: 'bottom' });
      reset();
      onClose();
    } catch {
      // Hata agent.ts interceptor tarafından gösterilir
    }
  };

  const PasswordField = ({
    name,
    placeholder,
    show,
    onToggle,
    rules,
  }: {
    name: 'currentPassword' | 'newPassword' | 'confirmPassword';
    placeholder: string;
    show: boolean;
    onToggle: () => void;
    rules?: any;
  }) => (
    <>
      <View style={[
        styles.inputWrapper,
        { backgroundColor: colors.inputBg, borderColor: errors[name] ? colors.error : colors.border },
      ]}>
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { color: colors.textMain }]}
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={colors.textSec}
              secureTextEntry={!show}
            />
          )}
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSec} />
        </TouchableOpacity>
      </View>
      {errors[name] && (
        <Text style={[styles.errorText, { color: colors.error }]}>{errors[name]?.message}</Text>
      )}
    </>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.title, { color: colors.primary }]}>Şifre Değiştir</Text>

          <PasswordField
            name="currentPassword"
            placeholder="Mevcut Şifre"
            show={showCurrent}
            onToggle={() => setShowCurrent(v => !v)}
            rules={{ required: 'Mevcut şifre gereklidir.' }}
          />

          <PasswordField
            name="newPassword"
            placeholder="Yeni Şifre"
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
            rules={passwordRules}
          />

          {/* Yeni şifre gücü */}
          {strength && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBars}>
                {(['weak', 'medium', 'strong', 'very_strong'] as const).map((s, i) => {
                  const levels = { weak: 1, medium: 2, strong: 3, very_strong: 4 };
                  const active = levels[strength] > i;
                  return (
                    <View
                      key={s}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: active ? STRENGTH_COLORS[strength] : colors.border },
                      ]}
                    />
                  );
                })}
              </View>
              <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength] }]}>
                {STRENGTH_LABELS[strength]}
              </Text>
            </View>
          )}

          <PasswordField
            name="confirmPassword"
            placeholder="Yeni Şifre (Tekrar)"
            show={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
            rules={{
              required: 'Şifre onayı gereklidir.',
              validate: (v: string) => v === newPasswordValue || 'Şifreler eşleşmiyor.',
            }}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textSec }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit(onSubmit)}
            >
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
  container: { borderRadius: 20, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  input: { flex: 1, height: 48, fontSize: 15 },
  eyeBtn: { padding: 6 },
  errorText: { fontSize: 12, marginLeft: 4, marginBottom: 10 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 2 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', marginLeft: 8, width: 44, textAlign: 'right' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelBtn: { padding: 14, flex: 1, alignItems: 'center' },
  cancelText: { fontWeight: '600' },
  saveBtn: { padding: 14, borderRadius: 12, flex: 1, alignItems: 'center', marginLeft: 10 },
  saveText: { color: '#FFF', fontWeight: 'bold' },
});
