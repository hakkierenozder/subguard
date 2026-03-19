import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import agent from '../api/agent';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Toast from 'react-native-toast-message';
import {
  emailRules,
  passwordRules,
  getPasswordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
} from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange', // Gerçek zamanlı validasyon
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordValue = watch('password');
  const strength = passwordValue ? getPasswordStrength(passwordValue) : null;

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await agent.Auth.register(data);
      const userId: string = response?.data ?? '';

      Toast.show({
        type: 'success',
        text1: 'Kayıt başarılı!',
        text2: 'Doğrulama kodu e-posta adresinize gönderildi.',
        position: 'bottom',
        visibilityTime: 3000,
      });

      // Backend'den dönen userId ile doğrulama ekranına yönlendir
      navigation.navigate('EmailVerification', { email: data.email, userId });
    } catch {
      // Hata toast'ı agent.ts interceptor'ı tarafından gösterilir
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="person-add" size={50} color={colors.white} />
        </View>
        <Text style={[styles.title, { color: colors.white }]}>Aramıza Katıl</Text>
        <Text style={styles.subtitle}>Hemen ücretsiz hesap oluştur.</Text>
      </LinearGradient>

      <ScrollView
        style={[styles.formContainer, { backgroundColor: colors.cardBg }]}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Ad Soyad */}
        <View style={[
          styles.inputWrapper,
          { backgroundColor: colors.inputBg, borderColor: errors.fullName ? colors.error : colors.border },
        ]}>
          <Ionicons name="person-outline" size={20} color={colors.textSec} style={styles.inputIcon} />
          <Controller
            control={control}
            name="fullName"
            rules={{ required: 'Ad Soyad zorunludur.' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { color: colors.textMain }]}
                placeholder="Ad Soyad"
                placeholderTextColor={colors.textSec}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
        {errors.fullName && (
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.fullName.message}</Text>
        )}

        {/* E-posta */}
        <View style={[
          styles.inputWrapper,
          { backgroundColor: colors.inputBg, borderColor: errors.email ? colors.error : colors.border },
        ]}>
          <Ionicons name="mail-outline" size={20} color={colors.textSec} style={styles.inputIcon} />
          <Controller
            control={control}
            name="email"
            rules={emailRules}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { color: colors.textMain }]}
                placeholder="E-posta"
                placeholderTextColor={colors.textSec}
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
        {errors.email && (
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.email.message}</Text>
        )}

        {/* Şifre */}
        <View style={[
          styles.inputWrapper,
          { backgroundColor: colors.inputBg, borderColor: errors.password ? colors.error : colors.border },
        ]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSec} style={styles.inputIcon} />
          <Controller
            control={control}
            name="password"
            rules={passwordRules}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { color: colors.textMain }]}
                placeholder="Şifre"
                placeholderTextColor={colors.textSec}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSec} />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.password.message}</Text>
        )}

        {/* Şifre Gücü */}
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

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            {loading ? 'Kaydediliyor...' : 'KAYIT OL'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSec }]}>Zaten hesabın var mı?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.linkText, { color: colors.accent }]}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  formContainer: {
    flex: 1,
    marginTop: -30,
    marginHorizontal: 20,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  formContent: { padding: 24, paddingBottom: 40 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50 },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, marginLeft: 4, marginBottom: 12 },

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '700', marginLeft: 10, width: 50, textAlign: 'right' },

  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { marginRight: 6 },
  linkText: { fontWeight: 'bold' },
});
