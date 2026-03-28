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
import { useThemeColors, AUTH_GRADIENT } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  emailRules, passwordRules, getPasswordStrength, STRENGTH_LABELS, STRENGTH_COLORS,
} from '../utils/validation';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

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

export default function RegisterScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

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
      navigation.navigate('EmailVerification', { email: data.email, userId });
    } catch {
      // Hata agent interceptor tarafından gösterilir
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
              <Ionicons name="person-add" size={32} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.formTitle, { color: colors.textMain }]}>Aramıza katıl</Text>
            <Text style={[styles.formSub, { color: colors.textSec }]}>Ücretsiz hesabını hemen oluştur</Text>
          </View>

          <View style={styles.formZone}>
            {/* Ad Soyad */}
            <Text style={[styles.label, { color: colors.textSec }]}>Ad Soyad</Text>
            <InputField icon="person-outline" focused={focused === 'name'} error={!!errors.fullName} colors={colors}>
              <Controller
                control={control}
                name="fullName"
                rules={{ required: 'Ad Soyad zorunludur.' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: colors.textMain }]}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor={colors.textSec + '70'}
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                  />
                )}
              />
            </InputField>
            {errors.fullName && <Text style={[styles.errorText, { color: colors.error }]}>{errors.fullName.message}</Text>}

            <View style={{ height: 14 }} />

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
                rules={passwordRules}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { color: colors.textMain }]}
                    placeholder="En az 8 karakter"
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
                        style={[styles.strengthBar, { backgroundColor: active ? STRENGTH_COLORS[strength] : colors.border }]}
                      />
                    );
                  })}
                </View>
                <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength] }]}>
                  {STRENGTH_LABELS[strength]}
                </Text>
              </View>
            )}

            <View style={{ height: 24 }} />
            <GradientButton onPress={handleSubmit(onSubmit)} loading={loading} accentColor={colors.accent}>Kayıt Ol</GradientButton>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSec }]}>Zaten hesabın var mı?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.footerLink, { color: colors.accent }]}>Giriş yap</Text>
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

  brandZone: { alignItems: 'center', paddingTop: 40, paddingBottom: 36 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  formTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center', marginBottom: 8 },
  formSub: { fontSize: 14, fontWeight: '500', textAlign: 'center' },

  formZone: {},

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

  strengthRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '700', marginLeft: 10, width: 60, textAlign: 'right' },

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
