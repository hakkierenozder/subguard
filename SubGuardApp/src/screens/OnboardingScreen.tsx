import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useSettingsStore } from '../store/useSettingsStore';
import agent from '../api/agent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface OnboardingPage {
  key: string;
  icon: string;
  iconColor: string;
  gradientColors: [string, string];
  title: string;
  description: string;
  isSetup?: boolean;
}

const PAGES: OnboardingPage[] = [
  {
    key: 'welcome',
    icon: 'shield-checkmark',
    iconColor: '#4F46E5',
    gradientColors: ['#EEF2FF', '#E0E7FF'],
    title: 'SubGuard\'a Hoş Geldin!',
    description:
      'Tüm aboneliklerini tek bir yerden takip et. Ödeme günlerini hiç kaçırma, gereksiz harcamaları fark et.',
  },
  {
    key: 'subscriptions',
    icon: 'card',
    iconColor: '#10B981',
    gradientColors: ['#ECFDF5', '#D1FAE5'],
    title: 'Aboneliklerini Yönet',
    description:
      'Netflix\'ten Spotify\'a, GitHub\'dan fitness uygulamalarına — hepsini ekle, kategorize et ve takip et.',
  },
  {
    key: 'insights',
    icon: 'analytics',
    iconColor: '#F59E0B',
    gradientColors: ['#FFFBEB', '#FEF3C7'],
    title: 'Harcamalarını Analiz Et',
    description:
      'Aylık ne kadar harcadığını gör. Bütçe hedefi belirle, aşımlarda uyarı al. Takvim ile ödeme günlerini takip et.',
  },
  {
    key: 'setup',
    icon: 'rocket',
    iconColor: '#8B5CF6',
    gradientColors: ['#F5F3FF', '#EDE9FE'],
    title: 'Hemen Başla',
    description:
      'Aylık bütçe hedefini belirle ve bildirimlere izin ver. İstersen bunları atla ve ayarlardan düzenle.',
    isSetup: true,
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const { setOnboardingCompleted } = useSettingsStore();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dotAnims = useRef(PAGES.map((_, i) => new Animated.Value(i === 0 ? 24 : 8))).current;
  const [budgetInput, setBudgetInput] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  const isLast = currentIndex === PAGES.length - 1;

  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    const next = currentIndex + 1;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
    dotAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === next ? 24 : 8,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  const finish = async () => {
    // Bütçeyi kaydet (boş değilse)
    const parsed = parseFloat(budgetInput.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      setSavingBudget(true);
      try {
        await agent.Auth.updateProfile({ monthlyBudget: parsed });
      } catch {
        // Sessizce devam et
      } finally {
        setSavingBudget(false);
      }
    }

    setOnboardingCompleted();
    navigation.replace('Main');
  };

  const requestNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotifGranted(status === 'granted');
    } catch {
      setNotifGranted(false);
    }
  };

  const renderPage = ({ item }: { item: OnboardingPage }) => (
    <View style={styles.page}>
      <LinearGradient
        colors={item.gradientColors}
        style={styles.iconCircle}
      >
        <Ionicons name={item.icon as any} size={64} color={item.iconColor} />
      </LinearGradient>

      <Text style={styles.pageTitle}>{item.title}</Text>
      <Text style={styles.pageDesc}>{item.description}</Text>

      {item.isSetup && (
        <View style={styles.setupSection}>
          {/* Bütçe girişi */}
          <View style={styles.setupBlock}>
            <Text style={styles.setupLabel}>
              <Ionicons name="wallet-outline" size={15} /> Aylık Bütçe Hedefi
            </Text>
            <View style={styles.budgetInputRow}>
              <Text style={styles.currencyPrefix}>₺</Text>
              <TextInput
                style={styles.budgetInput}
                value={budgetInput}
                onChangeText={setBudgetInput}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Bildirim izni */}
          <View style={styles.setupBlock}>
            <Text style={styles.setupLabel}>
              <Ionicons name="notifications-outline" size={15} /> Bildirimler
            </Text>
            {notifGranted === null ? (
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={requestNotifications}
              >
                <Ionicons name="notifications" size={16} color="#FFF" />
                <Text style={styles.notifBtnText}>Bildirimlere İzin Ver</Text>
              </TouchableOpacity>
            ) : notifGranted ? (
              <View style={styles.notifGranted}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.notifGrantedText}>Bildirimler açık!</Text>
              </View>
            ) : (
              <View style={styles.notifGranted}>
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={[styles.notifGrantedText, { color: '#EF4444' }]}>
                  İzin verilmedi. Ayarlardan açabilirsin.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Atla butonu */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>
      )}

      {/* Sayfa listesi */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        keyExtractor={(item) => item.key}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* Alt kısım: Dots + Buton */}
      <View style={styles.footer}>
        {/* Dot göstergesi */}
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotAnims[i],
                  backgroundColor: i === currentIndex ? '#4F46E5' : '#CBD5E1',
                },
              ]}
            />
          ))}
        </View>

        {/* İleri / Başla butonu */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={goNext}
          disabled={savingBudget}
        >
          {savingBudget ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>
                {isLast ? 'Başla' : 'Sonraki'}
              </Text>
              <Ionicons
                name={isLast ? 'rocket-outline' : 'arrow-forward'}
                size={18}
                color="#FFF"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  skipText: { color: '#64748B', fontSize: 13, fontWeight: '600' },

  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 20,
  },

  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  pageDesc: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Setup sayfası
  setupSection: { width: '100%', marginTop: 28, gap: 16 },
  setupBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  setupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 46,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginRight: 6,
  },
  budgetInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  notifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  notifBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  notifGranted: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifGrantedText: { fontSize: 14, fontWeight: '600', color: '#10B981' },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 8 : 20,
    paddingTop: 16,
    gap: 20,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { height: 8, borderRadius: 4 },

  nextBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    height: 54,
    borderRadius: 16,
  },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
