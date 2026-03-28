import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { verifyPin } from '../utils/AppLockManager';
import { logout } from '../utils/AuthManager';

const DOTS = 4;

interface Props {
  onUnlock: () => void;
  onForceLogout: () => void;
}

// 5 başarısız denemeden sonra PIN kilidi açılıp kullanıcı otomatik çıkış yapılır.
const MAX_ATTEMPTS = 5;

export default function AppLockOverlay({ onUnlock, onForceLogout }: Props) {
  const [entered, setEntered] = useState('');
  const [error, setError] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = async (digit: string) => {
    if (entered.length >= DOTS) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);

    if (next.length === DOTS) {
      const ok = await verifyPin(next);
      if (ok) {
        onUnlock();
      } else {
        const newCount = attemptCount + 1;
        setAttemptCount(newCount);
        setError(true);
        shake();

        if (newCount >= MAX_ATTEMPTS) {
          // Maksimum deneme aşıldı: kullanıcıyı bilgilendirip zorla çıkış yap.
          setTimeout(() => {
            Alert.alert(
              'Çok Fazla Hatalı Deneme',
              `${MAX_ATTEMPTS} kez hatalı PIN girdiniz. Güvenliğiniz için oturumunuz kapatılıyor.`,
              [{ text: 'Tamam', style: 'destructive', onPress: async () => { await logout(); onForceLogout(); } }],
              { cancelable: false }
            );
          }, 400);
        } else {
          const remaining = MAX_ATTEMPTS - newCount;
          setTimeout(() => setEntered(''), 700);
          if (remaining <= 2) {
            // Son 2 denemede uyarı göster
            setTimeout(() => {
              Alert.alert('Uyarı', `${remaining} deneme hakkınız kaldı.`);
            }, 800);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setEntered(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleForgotPin = () => {
    Alert.alert(
      "PIN'i Unuttum",
      "PIN kodunuzu unuttuysanız çıkış yapmanız gerekiyor. Tüm abonelik verileriniz korunacak, yeniden giriş yapabilirsiniz.",
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            onForceLogout();
          },
        },
      ]
    );
  };

  const PAD_ROWS: string[][] = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.inner}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Ionicons name="shield-checkmark" size={48} color="#6C63FF" />
          </View>
          <Text style={styles.title}>SubGuard</Text>
          <Text style={styles.subtitle}>PIN kodunuzu girin</Text>

          {/* Nokta göstergeleri */}
          <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length: DOTS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i < entered.length
                      ? (error ? '#EF4444' : '#6C63FF')
                      : 'transparent',
                    borderColor: error ? '#EF4444' : '#6C63FF',
                  },
                ]}
              />
            ))}
          </Animated.View>

          {error && (
            <Text style={styles.errorText}>
              {`Hatalı PIN. ${MAX_ATTEMPTS - attemptCount} deneme hakkınız kaldı.`}
            </Text>
          )}

          {/* Numpad */}
          <View style={styles.pad}>
            {PAD_ROWS.map((row, ri) => (
              <View key={ri} style={styles.padRow}>
                {row.map((key, ki) => {
                  if (key === '') return <View key={ki} style={styles.padKey} />;
                  if (key === '⌫') {
                    return (
                      <TouchableOpacity
                        key={ki}
                        style={[styles.padKey, styles.padKeyBtn]}
                        onPress={handleDelete}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="backspace-outline" size={26} color="#6C63FF" />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={ki}
                      style={[styles.padKey, styles.padKeyBtn]}
                      onPress={() => handlePress(key)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.padKeyText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handleForgotPin} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>PIN'imi Unuttum</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5FF' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },

  logoWrap: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
  },
  title:    { fontSize: 26, fontWeight: '800', color: '#1E1B4B', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 36, fontWeight: '500' },

  dotsRow: { flexDirection: 'row', gap: 18, marginBottom: 10 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },

  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginBottom: 20, marginTop: 6 },

  pad:    { marginTop: 32, gap: 14, width: '100%', maxWidth: 280 },
  padRow: { flexDirection: 'row', justifyContent: 'space-between' },

  padKey:    { width: 78, height: 78, borderRadius: 39, justifyContent: 'center', alignItems: 'center' },
  padKeyBtn: { backgroundColor: '#EEEEFF' },
  padKeyText:{ fontSize: 30, fontWeight: '600', color: '#1E1B4B' },

  forgotBtn:  { marginTop: 36 },
  forgotText: { fontSize: 14, color: '#6C63FF', fontWeight: '600' },
});
