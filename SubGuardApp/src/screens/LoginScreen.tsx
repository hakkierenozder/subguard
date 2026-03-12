import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import agent from '../api/agent';
import { saveRefreshToken, saveToken, saveUserId } from '../utils/AuthManager';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Toast from 'react-native-toast-message';
import { emailRules } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const onboardingCompleted = useSettingsStore((state) => state.onboardingCompleted);

  const { control, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange', // Gerçek zamanlı validasyon
    defaultValues: { email: '', password: '' },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await agent.Auth.login(data);
      if (response?.data?.accessToken) {
        await saveToken(response.data.accessToken);
        if (response.data.userId) await saveUserId(response.data.userId);
        await saveRefreshToken(response.data.refreshToken);
        navigation.replace(onboardingCompleted ? 'Main' : 'Onboarding');
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: 'Giriş yapılamadı.', position: 'bottom' });
      }
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
          <Ionicons name="shield-checkmark" size={60} color={colors.white} />
        </View>
        <Text style={[styles.title, { color: colors.white }]}>SubGuard</Text>
        <Text style={styles.subtitle}>Aboneliklerini yönet, tasarruf et.</Text>
      </LinearGradient>

      <View style={[styles.formContainer, { backgroundColor: colors.cardBg, shadowColor: isDarkMode ? '#000' : '#000' }]}>
        <Text style={[styles.welcomeText, { color: colors.textMain }]}>Tekrar Hoşgeldin!</Text>

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
            rules={{ required: 'Şifre zorunludur.' }}
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

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            {loading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSec }]}>Hesabın yok mu?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.linkText, { color: colors.accent }]}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: { fontSize: 32, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  formContainer: {
    flex: 1,
    marginTop: -40,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  welcomeText: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 30 },
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
