import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import agent from '../api/agent';
import { useThemeColors, AUTH_GRADIENT } from '../constants/theme';
import OtpBoxInput from '../components/OtpBoxInput';
import { useSettingsStore } from '../store/useSettingsStore';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

// ─── Input Field ──────────────────────────────────────────────────────────────
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

// ─── Gradient Button ──────────────────────────────────────────────────────────
function GradientButton({ onPress, loading, children, accentColor }: { onPress: () => void; loading: boolean; children: string; accentColor: string }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.88} style={[styles.btnShadow, { shadowColor: accentColor }]}>
      <LinearGradient colors={AUTH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
        {loading
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.btnText}>{children}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Ana Ekran ────────────────────────────────────────────────────────────────
export default function ForgotPasswordScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore(s => s.isDarkMode);

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'E-posta adresinizi girin.', position: 'bottom' });
      return;
    }
    setLoading(true);
    try {
      const res = await agent.Auth.forgotPassword(email.trim().toLowerCase());
      setUserId(res?.data ?? '');
      setStep(2);
      Toast.show({ type: 'success', text1: 'Kod Gönderildi', text2: 'E-postanızı kontrol edin.', position: 'bottom' });
    } catch {
      // agent interceptor gösterir
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (otp.replace(/[^0-9]/g, '').length < 6) {
      Toast.show({ type: 'error', text1: 'Hata', text2: '6 haneli doğrulama kodunu girin.', position: 'bottom' });
      return;
    }
    if (newPassword.length < 8) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Şifre en az 8 karakter olmalıdır.', position: 'bottom' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Şifreler eşleşmiyor.', position: 'bottom' });
      return;
    }
    setLoading(true);
    try {
      await agent.Auth.resetPassword(userId, otp, newPassword);
      Toast.show({ type: 'success', text1: 'Şifre Güncellendi', text2: 'Yeni şifrenizle giriş yapabilirsiniz.', position: 'bottom', visibilityTime: 3000 });
      navigation.navigate('Login');
    } catch {
      // agent interceptor gösterir
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Geri */}
          <TouchableOpacity style={styles.backBtn} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>

          {/* Step İndicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { backgroundColor: colors.accent }]}>
              <Text style={styles.stepNum}>1</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: step >= 2 ? colors.accent : colors.border }]} />
            <View style={[styles.stepDot, { backgroundColor: step >= 2 ? colors.accent : colors.border }]}>
              <Text style={[styles.stepNum, { color: step >= 2 ? '#FFF' : colors.textSec }]}>2</Text>
            </View>
          </View>

          {/* Brand Zone */}
          <View style={styles.brandZone}>
            <LinearGradient colors={AUTH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.logoCircle, { shadowColor: colors.accent }]}>
              <Ionicons name={step === 1 ? 'mail-outline' : 'lock-open-outline'} size={34} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.formTitle, { color: colors.textMain }]}>
              {step === 1 ? 'Şifreni Sıfırla' : 'Yeni Şifre Belirle'}
            </Text>
            <Text style={[styles.formSub, { color: colors.textSec }]}>
              {step === 1
                ? 'E-posta adresine doğrulama kodu gönderilecek'
                : `${email} adresine gönderilen 6 haneli kodu gir`}
            </Text>
          </View>

          {step === 1 ? (
            /* ── Adım 1: E-posta ── */
            <View style={styles.formZone}>
              <Text style={[styles.label, { color: colors.textSec }]}>E-posta</Text>
              <InputField icon="mail-outline" focused={focused === 'email'} colors={colors}>
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.textSec + '70'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                />
              </InputField>
              <View style={{ height: 24 }} />
              <GradientButton onPress={handleSendOtp} loading={loading} accentColor={colors.accent}>Kod Gönder</GradientButton>
            </View>
          ) : (
            /* ── Adım 2: OTP + Yeni Şifre ── */
            <View style={styles.formZone}>
              {/* OTP Kutular */}
              <Text style={[styles.label, { color: colors.textSec, textAlign: 'center', marginBottom: 16 }]}>
                Doğrulama Kodu
              </Text>
              <OtpBoxInput onFill={setOtp} colors={colors} />

              <View style={{ height: 28 }} />

              {/* Yeni Şifre */}
              <Text style={[styles.label, { color: colors.textSec }]}>Yeni Şifre</Text>
              <InputField icon="lock-closed-outline" focused={focused === 'pwd'} colors={colors}>
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="En az 8 karakter"
                  placeholderTextColor={colors.textSec + '70'}
                  secureTextEntry={!showPwd}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setFocused('pwd')}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSec} />
                </TouchableOpacity>
              </InputField>

              <View style={{ height: 14 }} />

              {/* Şifre Tekrar */}
              <Text style={[styles.label, { color: colors.textSec }]}>Şifre Tekrar</Text>
              <InputField icon="lock-closed-outline" focused={focused === 'confirm'} colors={colors}>
                <TextInput
                  style={[styles.input, { color: colors.textMain }]}
                  placeholder="Şifreyi tekrar girin"
                  placeholderTextColor={colors.textSec + '70'}
                  secureTextEntry={!showPwd}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                />
              </InputField>

              <View style={{ height: 28 }} />
              <GradientButton onPress={handleReset} loading={loading} accentColor={colors.accent}>Şifremi Güncelle</GradientButton>

              <TouchableOpacity style={styles.resendLink} onPress={() => setStep(1)}>
                <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>Kodu tekrar gönder</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },

  backBtn: { marginTop: 8, marginBottom: 4, padding: 4, alignSelf: 'flex-start' },

  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 8 },
  stepDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNum: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  stepLine: { flex: 0, width: 48, height: 2, marginHorizontal: 6 },

  brandZone: { alignItems: 'center', paddingTop: 32, paddingBottom: 36 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  formTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center', marginBottom: 8 },
  formSub: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },

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

  btnShadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  resendLink: { alignItems: 'center', marginTop: 20, paddingVertical: 8 },
});
