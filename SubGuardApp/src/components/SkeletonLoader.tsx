import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, ViewStyle, StyleProp } from 'react-native';
import { useThemeColors } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Tek bir shimmer kutusu ──────────────────────────────────────────────────

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonBoxProps) {
  const colors = useThemeColors();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const baseBg = colors.inputBg;
  const shimmerColor = colors.cardBg;

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseBg,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
            borderRadius,
          },
        ]}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1, backgroundColor: baseBg }} />
          <View style={{ flex: 2, backgroundColor: shimmerColor, opacity: 0.6 }} />
          <View style={{ flex: 1, backgroundColor: baseBg }} />
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Abonelik satırı skeleton'ı ──────────────────────────────────────────────

function SkeletonSubscriptionRow() {
  const colors = useThemeColors();
  return (
    <View style={[styles.row, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Logo */}
      <SkeletonBox width={44} height={44} borderRadius={12} style={{ marginRight: 14 }} />
      {/* Metin */}
      <View style={{ flex: 1 }}>
        <SkeletonBox width="60%" height={14} borderRadius={7} style={{ marginBottom: 8 }} />
        <SkeletonBox width="40%" height={11} borderRadius={6} />
      </View>
      {/* Fiyat */}
      <View style={{ alignItems: 'flex-end' }}>
        <SkeletonBox width={50} height={16} borderRadius={7} style={{ marginBottom: 6 }} />
        <SkeletonBox width={30} height={11} borderRadius={5} />
      </View>
    </View>
  );
}

// ─── Tam ekran skeleton (abonelik listesi için) ──────────────────────────────

interface SubscriptionSkeletonListProps {
  count?: number;
}

export function SubscriptionSkeletonList({ count = 5 }: SubscriptionSkeletonListProps) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonSubscriptionRow key={i} />
      ))}
    </View>
  );
}

// ─── Home ekranı hero skeleton'ı ─────────────────────────────────────────────

export function HomeSkeletonLoader() {
  const colors = useThemeColors();
  return (
    <View style={styles.homeContainer}>
      {/* Hero card skeleton */}
      <View style={[styles.heroSkeleton, { backgroundColor: colors.inputBg }]}>
        <SkeletonBox width="45%" height={12} borderRadius={6} style={{ marginBottom: 12 }} />
        <SkeletonBox width="65%" height={40} borderRadius={8} style={{ marginBottom: 20 }} />
        <View style={styles.heroStatRow}>
          <SkeletonBox width={80} height={36} borderRadius={10} />
          <SkeletonBox width={80} height={36} borderRadius={10} />
          <SkeletonBox width={80} height={36} borderRadius={10} />
        </View>
      </View>
      {/* Payment card skeletons */}
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.paymentSkeleton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <SkeletonBox width={40} height={40} borderRadius={12} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <SkeletonBox width="55%" height={13} borderRadius={6} style={{ marginBottom: 8 }} />
            <SkeletonBox width="35%" height={10} borderRadius={5} />
          </View>
          <SkeletonBox width={55} height={14} borderRadius={7} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  homeContainer: {
    padding: 20,
  },
  heroSkeleton: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  heroStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
});
