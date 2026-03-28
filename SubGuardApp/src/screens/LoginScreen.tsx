import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import agent from '../api/agent';
import { saveRefreshToken, saveToken, saveUserId } from '../utils/AuthManager';
import { useThemeColors, AUTH_GRADIENT } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { emailRules } from '../utils/validation';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function InputField({
  icon, focused, error, children, colors,
}: {
  icon: string; focused: boolean; error?: boolean;
  children: React.ReactNode; colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[
      styles.inputWrapper,
      {
        backgroundColor: colors.inputBg,
        borderColor: error ? colors.error : focused ? colors.accent : colors.border,
        borderWidth: focused ? 2 : 1.5,
      },
    ]}>
      <Ionicons name={icon as any} size={19} color={focused ? colors.accent : colors.textSec} style={styles.inputIcon} />
      {children}
    </View>
  );
}

function GradientButton({ onPress, loading, children, accentColor }: { onPress: () => void; loading: boolean; children: string; accentColor?: string }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.88} style={[styles.btnShadow, accentColor ? { shadowColor: accentColor } : undefined]}>
      <LinearGradient colors={AUTH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
        {loading
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.btnText}>{children}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function LoginScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);

  const { control, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

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
    } catch (err: any) {
      if (err?.response?.status === 403) {
        // Backend 403'te TokenDto.UserId'yi de döndürür (AccessToken/RefreshToken null).
        // UserId ile EmailVerification ekranına yönlendirip kullanıcının kod girmesini sağlarız.
        const userId: string = err?.response?.data?.data?.userId || '';
        Toast.show({
          type: 'info',
          text1: 'E-posta doğrulanmamış',
          text2: 'Doğrulama ekranına yönlendiriliyorsunuz...',
          position: 'bottom',
          visibilityTime: 2000,
        });
        setTimeout(() => {
          navigation.navigate('EmailVerification', { email: data.email, userId });
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Zone */}
          <View style={styles.brandZone}>
            <LinearGradient colors={AUTH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.logoCircle, { shadowColor: colors.accent }]}>
              <Ionicons name="shield-checkmark" size={36} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.appName, { color: colors.textMain }]}>SubGuard</Text>
            <Text style={[styles.appSub, { color: colors.textSec }]}>Aboneliklerini yönet, tasarruf et</Text>
          </View>

          <View style={styles.formZone}>
            <Text style={[styles.formTitle, { color: colors.textMain }]}>Tekrar hoşgeldin</Text>

            {/* E-posta */}
            <Text style={[styles.label, { color: colors.textSec }]}>E-posta</Text>
            <InputField icon="mail-outline" focused={focused === 'email'} error={!!errors.email} colors={colors}>
              <Controller
                control={control}
                name="email"
                rules={emailRules}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: colors.textMain }]}
                    placeholder="ornek@email.com"
                    placeholderTextColor={colors.textSec + '70'}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                  />
                )}
              />
            </InputField>
            {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email.message}</Text>}

            <View style={{ height: 14 }} />

            {/* Şifre */}
            <Text style={[styles.label, { color: colors.textSec }]}>Şifre</Text>
            <InputField icon="lock-closed-outline" focused={focused === 'pwd'} error={!!errors.password} colors={colors}>
              <Controller
                control={control}
                name="password"
                rules={{ required: 'Şifre zorunludur.' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: colors.textMain }]}
                    placeholder="Şifreniz"
                    placeholderTextColor={colors.textSec + '70'}
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocused('pwd')}
                    onBlur={() => setFocused(null)}
                  />
                )}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSec} />
              </TouchableOpacity>
            </InputField>
            {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password.message}</Text>}

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotText, { color: colors.accent }]}>Şifremi unuttum</Text>
            </TouchableOpacity>

            <View style={{ height: 8 }} />
            <GradientButton onPress={handleSubmit(onSubmit)} loading={loading} accentColor={colors.accent}>Giriş Yap</GradientButton>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSec }]}>Hesabın yok mu?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.footerLink, { color: colors.accent }]}>Kayıt ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },

  brandZone: { alignItems: 'center', paddingTop: 56, paddingBottom: 44 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  appName: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  appSub: { fontSize: 14, fontWeight: '500', textAlign: 'center' },

  formZone: {},
  formTitle: { fontSize: 22, fontWeight: '700', marginBottom: 24, letterSpacing: -0.2 },

  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14,
    height: 56, marginBottom: 4,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  eyeBtn: { padding: 4 },

  errorText: { fontSize: 12, marginLeft: 2, marginBottom: 4 },

  forgotLink: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 4, paddingVertical: 2 },
  forgotText: { fontSize: 13, fontWeight: '600' },

  btnShadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28, gap: 6 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
