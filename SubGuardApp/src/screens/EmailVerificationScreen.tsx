import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
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
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

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

export default function EmailVerificationScreen({ route, navigation }: Props) {
  const { email, userId } = route.params;
  const colors = useThemeColors();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (otp.replace(/[^0-9]/g, '').length < 6) {
      Toast.show({ type: 'error', text1: 'Hata', text2: '6 haneli doğrulama kodunu girin.', position: 'bottom' });
      return;
    }
    setLoading(true);
    try {
      await agent.Auth.confirmEmail(userId, otp.trim());
      Toast.show({
        type: 'success',
        text1: 'E-posta doğrulandı!',
        text2: 'Artık giriş yapabilirsiniz.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      navigation.navigate('Login');
    } catch {
      // Hata agent interceptor tarafından gösterilir
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await agent.Auth.resendConfirmationEmail(email);
      Toast.show({
        type: 'success',
        text1: 'Yeni kod gönderildi',
        text2: `${email} adresine yeni doğrulama kodu gönderdik.`,
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch {
      // Hata agent interceptor tarafından gösterilir
    } finally {
      setResending(false);
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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
            <Ionicons name="arrow-back" size={22} color={colors.textMain} />
          </TouchableOpacity>

          {/* Brand Zone */}
          <View style={styles.brandZone}>
            <LinearGradient colors={AUTH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.logoCircle, { shadowColor: colors.accent }]}>
              <Ionicons name="mail-open-outline" size={34} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.formTitle, { color: colors.textMain }]}>E-postanı doğrula</Text>
            <Text style={[styles.formSub, { color: colors.textSec }]}>
              <Text style={{ color: colors.textMain, fontWeight: '700' }}>{email}</Text>
              {'\n'}adresine gönderilen 6 haneli kodu gir
            </Text>
          </View>

          <View style={styles.formZone}>
            <Text style={[styles.label, { color: colors.textSec, textAlign: 'center', marginBottom: 16 }]}>
              Doğrulama Kodu
            </Text>
            <OtpBoxInput onFill={setOtp} colors={colors} />

            <View style={{ height: 32 }} />
            <GradientButton onPress={handleVerify} loading={loading} accentColor={colors.accent}>Doğrula</GradientButton>

            <View style={{ height: 24 }} />
            <Text style={[styles.hintText, { color: colors.textSec }]}>
              Kod gelmedi mi? Spam klasörünü kontrol et.
            </Text>

            <TouchableOpacity
              style={[styles.resendBtn, { borderColor: colors.border }]}
              onPress={handleResend}
              disabled={resending}
              activeOpacity={0.7}
            >
              {resending
                ? <ActivityIndicator size="small" color={colors.accent} />
                : (
                  <>
                    <Ionicons name="refresh-outline" size={16} color={colors.accent} />
                    <Text style={[styles.resendText, { color: colors.accent }]}>Kodu tekrar gönder</Text>
                  </>
                )
              }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },

  backBtn: { marginTop: 8, marginBottom: 4, padding: 4, alignSelf: 'flex-start' },

  brandZone: { alignItems: 'center', paddingTop: 32, paddingBottom: 36 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  formTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center', marginBottom: 8 },
  formSub: { fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 22 },

  formZone: {},

  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },

  btnShadow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  hintText: { fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 19 },

  resendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
  },
  resendText: { fontSize: 14, fontWeight: '600' },
});
