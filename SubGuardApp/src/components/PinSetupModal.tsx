import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { savePin } from '../utils/AppLockManager';
import { useThemeColors } from '../constants/theme';

const DOTS = 4;

interface Props {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinSetupModal({ visible, onSuccess, onCancel }: Props) {
  const colors = useThemeColors();
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [entered, setEntered] = useState('');
  const [error, setError] = useState(false);
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

  const reset = () => {
    setStep('enter');
    setFirstPin('');
    setEntered('');
    setError(false);
  };

  const handlePress = async (digit: string) => {
    if (entered.length >= DOTS) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);

    if (next.length === DOTS) {
      if (step === 'enter') {
        setFirstPin(next);
        setEntered('');
        setStep('confirm');
      } else {
        if (next === firstPin) {
          await savePin(next);
          reset();
          onSuccess();
        } else {
          setError(true);
          shake();
          setTimeout(() => {
            setEntered('');
            setStep('enter');
            setFirstPin('');
            setError(false);
          }, 900);
        }
      }
    }
  };

  const handleDelete = () => {
    setEntered(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const PAD_ROWS: string[][] = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.accent }]}>İptal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inner}>
          <View style={[styles.iconWrap, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="lock-closed" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.textMain }]}>
            {step === 'enter' ? 'PIN Belirle' : 'PIN Onayla'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSec }]}>
            {step === 'enter'
              ? '4 haneli PIN kodunuzu girin'
              : 'PIN kodunuzu tekrar girin'}
          </Text>

          {step === 'confirm' && (
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, { backgroundColor: colors.accent }]} />
              <View style={[styles.stepLine, { backgroundColor: colors.accent }]} />
              <View style={[styles.stepDot, styles.stepDotActive, { backgroundColor: colors.accent, borderColor: colors.accent }]} />
            </View>
          )}

          <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length: DOTS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i < entered.length
                      ? (error ? colors.error : colors.accent)
                      : 'transparent',
                    borderColor: error ? colors.error : colors.accent,
                  },
                ]}
              />
            ))}
          </Animated.View>

          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>PIN eşleşmedi. Baştan deneyin.</Text>
          )}

          <View style={styles.pad}>
            {PAD_ROWS.map((row, ri) => (
              <View key={ri} style={styles.padRow}>
                {row.map((key, ki) => {
                  if (key === '') return <View key={ki} style={styles.padKey} />;
                  if (key === '⌫') {
                    return (
                      <TouchableOpacity
                        key={ki}
                        style={[styles.padKey, styles.padKeyBtn, { backgroundColor: colors.cardBg }]}
                        onPress={handleDelete}
                        activeOpacity={0.6}
                      >
                        <Ionicons name="backspace-outline" size={26} color={colors.accent} />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={ki}
                      style={[styles.padKey, styles.padKeyBtn, { backgroundColor: colors.cardBg }]}
                      onPress={() => handlePress(key)}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.padKeyText, { color: colors.textMain }]}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 8, alignItems: 'flex-start' },
  cancelBtn: { padding: 8 },
  cancelText: { fontSize: 16, fontWeight: '600' },

  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },

  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
  },
  title:    { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 28, fontWeight: '500', textAlign: 'center' },

  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6 },
  stepDot:       { width: 10, height: 10, borderRadius: 5 },
  stepDotActive: { width: 14, height: 14, borderRadius: 7 },
  stepLine:      { width: 30, height: 2, borderRadius: 1 },

  dotsRow: { flexDirection: 'row', gap: 18, marginBottom: 10 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },

  errorText: { fontSize: 13, fontWeight: '600', marginBottom: 16, marginTop: 6 },

  pad:    { marginTop: 32, gap: 14, width: '100%', maxWidth: 280 },
  padRow: { flexDirection: 'row', justifyContent: 'space-between' },

  padKey:    { width: 78, height: 78, borderRadius: 39, justifyContent: 'center', alignItems: 'center' },
  padKeyBtn: {},
  padKeyText:{ fontSize: 30, fontWeight: '600' },
});
