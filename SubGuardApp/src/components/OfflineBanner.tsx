// src/components/OfflineBanner.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useThemeColors } from '../constants/theme';

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const colors = useThemeColors();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOnline ? -50 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [isOnline]);

  return (
    <Animated.View
      style={[styles.banner, { backgroundColor: colors.error, transform: [{ translateY: slideAnim }] }]}
      pointerEvents="none"
    >
      <Ionicons name="cloud-offline-outline" size={14} color="#FFF" />
      <Text style={styles.text}>Çevrimdışı — Önbellek gösteriliyor</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 9999,
    gap: 8,
  },
  text: {
    color: '#FFF', // Kırmızı arka plan üzerinde beyaz metin — kasıtlı
    fontSize: 13,
    fontWeight: '700',
  },
});
