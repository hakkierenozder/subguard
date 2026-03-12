// src/components/OfflineBanner.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();
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
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
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
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 9999,
    gap: 8,
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
