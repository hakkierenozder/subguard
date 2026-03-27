import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '../constants/theme';

interface OtpBoxInputProps {
  onFill: (value: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}

export default function OtpBoxInput({ onFill, colors }: OtpBoxInputProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = useCallback((text: string, idx: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const next = Array(6).fill('');
      cleaned.slice(0, 6).split('').forEach((d, i) => { next[i] = d; });
      setDigits(next);
      onFill(next.join(''));
      refs.current[Math.min(cleaned.length, 5)]?.focus();
      return;
    }
    const digit = cleaned.slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    onFill(next.join(''));
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  }, [digits, onFill]);

  const handleKeyPress = useCallback((e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[idx] && idx > 0) {
      const next = [...digits];
      next[idx - 1] = '';
      setDigits(next);
      onFill(next.join(''));
      refs.current[idx - 1]?.focus();
    }
  }, [digits, onFill]);

  return (
    <View style={styles.otpRow}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={el => { refs.current[i] = el; }}
          value={d}
          onChangeText={t => handleChange(t, i)}
          onKeyPress={e => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
          style={[
            styles.otpBox,
            {
              borderColor: d ? colors.accent : colors.border,
              borderWidth: d ? 2 : 1.5,
              backgroundColor: d ? colors.accentLight : colors.inputBg,
              color: colors.textMain,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpBox: {
    width: 46, height: 58, borderRadius: 14,
    textAlign: 'center', fontSize: 24, fontWeight: '700',
  },
});
