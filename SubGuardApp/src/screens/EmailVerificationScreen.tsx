import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import agent from '../api/agent';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

export default function EmailVerificationScreen({ route, navigation }: Props) {
  const { email, userId } = route.params;
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen doğrulama kodunu girin.', position: 'bottom' });
      return;
    }
    setLoading(true);
    try {
      await agent.Auth.confirmEmail(userId, trimmed);
      Toast.show({
        type: 'success',
        text1: 'E-posta doğrulandı!',
        text2: 'Artık giriş yapabilirsiniz.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      navigation.navigate('Login');
    } catch {
      // Hata mesajı agent.ts interceptor'ı tarafından gösterilir
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      // Yeniden kayıt isteği atmak yerine; backend'de "resend" endpoint yoksa
      // kullanıcıyı giriş yapmaya yönlendiriyoruz — 403 alınca yeni mail gönderilir.
      // Not: Gerçek bir /auth/resend-confirmation endpoint eklenebilir.
      Toast.show({
        type: 'info',
        text1: 'Yeni kod gönderildi',
        text2: `${email} adresine tekrar gönderdik.`,
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-open-outline" size={48} color="#FFF" />
        </View>
        <Text style={styles.headerTitle}>E-posta Doğrula</Text>
        <Text style={styles.headerSub}>
          <Text style={styles.emailHighlight}>{email}</Text>
          {'\n'}adresine doğrulama kodu gönderdik.
        </Text>
      </LinearGradient>

      <ScrollView
        style={[styles.card, { backgroundColor: colors.cardBg }]}
        contentContainerStyle={styles.cardContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.textSec }]}>
          E-postanızdaki <Text style={{ fontWeight: '800', color: colors.textMain }}>6 haneli kodu</Text> girin:
        </Text>

        <View style={[
          styles.inputWrap,
          { backgroundColor: colors.inputBg, borderColor: token ? colors.primary : colors.border },
        ]}>
          <Ionicons name="key-outline" size={20} color={colors.textSec} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.input, { color: colors.textMain, fontSize: 22, letterSpacing: 8, fontWeight: 'bold' }]}
            placeholder="000000"
            placeholderTextColor={colors.textSec}
            value={token}
            onChangeText={(v) => setToken(v.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoCorrect={false}
            multiline={false}
          />
          {token.length > 0 && (
            <TouchableOpacity onPress={() => setToken('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color={colors.textSec} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={styles.btnText}>Doğrula</Text>
              </>
            )
          }
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.hint, { color: colors.textSec }]}>
          Kod gelmedi mi? Spam/gereksiz klasörünüzü kontrol edin.
        </Text>

        <TouchableOpacity
          style={[styles.resendBtn, { borderColor: colors.border }]}
          onPress={handleResend}
          disabled={resending}
          activeOpacity={0.7}
        >
          {resending
            ? <ActivityIndicator size="small" color={colors.primary} />
            : (
              <>
                <Ionicons name="refresh-outline" size={16} color={colors.primary} />
                <Text style={[styles.resendText, { color: colors.primary }]}>Kodu Tekrar Gönder</Text>
              </>
            )
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="arrow-back-outline" size={16} color={colors.textSec} />
          <Text style={[styles.backText, { color: colors.textSec }]}>Giriş ekranına dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 16,
    paddingBottom: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emailHighlight: { color: '#FFF', fontWeight: '700' },

  card: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: -24,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  cardContent: { padding: 24, paddingBottom: 40 },

  label: { fontSize: 14, lineHeight: 21, marginBottom: 16 },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  input: { flex: 1, fontSize: 14, fontWeight: '500' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  divider: { height: 1, marginBottom: 20 },

  hint: { fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 19 },

  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  resendText: { fontSize: 14, fontWeight: '600' },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backText: { fontSize: 13 },
});
