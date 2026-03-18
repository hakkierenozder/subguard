import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../constants/theme';
import BudgetScreen from './BudgetScreen';
import ReportsScreen from './ReportsScreen';

type Tab = 'budget' | 'reports';

const TABS: { key: Tab; label: string }[] = [
  { key: 'budget', label: 'Bütçe' },
  { key: 'reports', label: 'Raporlar' },
];

export default function AnalyticsScreen() {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<Tab>('budget');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Safe area + segmented control */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.cardBg }}>
        <View style={[styles.segmentContainer, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
          <View style={[styles.segmentPill, { backgroundColor: colors.inputBg }]}>
            {TABS.map(({ key, label }) => {
              const isActive = activeTab === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.segmentBtn, isActive && { backgroundColor: colors.accent }]}
                  onPress={() => setActiveTab(key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentLabel, { color: isActive ? '#FFF' : colors.textSec }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      {/* Embedded content — top safe area handled above */}
      {activeTab === 'budget' ? (
        <BudgetScreen embedded />
      ) : (
        <ReportsScreen embedded />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  segmentPill: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
