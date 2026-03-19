import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { savePin } from '../utils/AppLockManager';

const DOTS = 4;

interface Props {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinSetupModal({ visible, onSuccess, onCancel }: Props) {
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inner}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed" size={40} color="#6C63FF" />
          </View>
          <Text style={styles.title}>
            {step === 'enter' ? 'PIN Belirle' : 'PIN Onayla'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'enter'
              ? '4 haneli PIN kodunuzu girin'
              : 'PIN kodunuzu tekrar girin'}
          </Text>

          {step === 'confirm' && (
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotDone]} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, styles.stepDotActive]} />
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
                      ? (error ? '#EF4444' : '#6C63FF')
                      : 'transparent',
                    borderColor: error ? '#EF4444' : '#6C63FF',
                  },
                ]}
              />
            ))}
          </Animated.View>

          {error && (
            <Text style={styles.errorText}>PIN eşleşmedi. Baştan deneyin.</Text>
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
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: { paddingHorizontal: 20, paddingTop: 8, alignItems: 'flex-start' },
  cancelBtn: { padding: 8 },
  cancelText: { fontSize: 16, color: '#6C63FF', fontWeight: '600' },

  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },

  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
  },
  title:    { fontSize: 24, fontWeight: '800', color: '#1E1B4B', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 28, fontWeight: '500', textAlign: 'center' },

  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6 },
  stepDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#CBD5E1' },
  stepDotDone:   { backgroundColor: '#6C63FF' },
  stepDotActive: { backgroundColor: '#6C63FF', width: 14, height: 14, borderRadius: 7 },
  stepLine:      { width: 30, height: 2, backgroundColor: '#6C63FF', borderRadius: 1 },

  dotsRow: { flexDirection: 'row', gap: 18, marginBottom: 10 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },

  errorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginBottom: 16, marginTop: 6 },

  pad:    { marginTop: 32, gap: 14, width: '100%', maxWidth: 280 },
  padRow: { flexDirection: 'row', justifyContent: 'space-between' },

  padKey:    { width: 78, height: 78, borderRadius: 39, justifyContent: 'center', alignItems: 'center' },
  padKeyBtn: { backgroundColor: '#F8FAFC' },
  padKeyText:{ fontSize: 30, fontWeight: '600', color: '#1E1B4B' },
});
