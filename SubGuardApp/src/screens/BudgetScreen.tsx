import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CategoryBudget } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressChart } from 'react-native-chart-kit';
import { useThemeColors, getCategoryColor } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { convertToTRY } from '../utils/CurrencyService';
import agent from '../api/agent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = Math.min(Math.round(SCREEN_WIDTH * 0.44), 200);

const ALERT_THRESHOLDS = [60, 70, 80, 90, 100];

export default function BudgetScreen({ embedded = false }: { embedded?: boolean }) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const { budgetAlertThreshold, setBudgetAlertThreshold, monthlyBudget, setMonthlyBudget } = useSettingsStore();

  // Eşik backend'e senkronize edilir (Fix 21)
  const handleThresholdChange = async (t: number) => {
    setBudgetAlertThreshold(t);
    try {
      await agent.Auth.updateProfile({ budgetAlertThreshold: t });
    } catch {
      Alert.alert('Senkronizasyon Hatası', 'Uyarı eşiği sunucuya kaydedilemedi. Bağlantınızı kontrol edin.');
    }
  };
  const { subscriptions } = useUserSubscriptionStore();
  const [budgetCurrency, setBudgetCurrency] = useState('TRY');
  const [budgetInput, setBudgetInput] = useState('');

  // Para birimi sembolü
  const currencySymbol = budgetCurrency === 'USD' ? '$' : budgetCurrency === 'EUR' ? '€' : '₺';
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // [39] hata durumu
  const [editMode, setEditMode] = useState(false);

  // Kategori bütçeleri
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [catLimitInput, setCatLimitInput] = useState('');
  const [savingCat, setSavingCat] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Seed input from store while API loads
    if (monthlyBudget > 0) setBudgetInput(monthlyBudget.toString());
    Promise.all([
      agent.Auth.getProfile(),
      agent.CategoryBudgets.getAll(),
    ])
      .then(([profileRes, catRes]) => {
        const data = profileRes?.data;
        if (data) {
          if (data.monthlyBudget > 0) {
            setMonthlyBudget(data.monthlyBudget);
            setBudgetInput(data.monthlyBudget.toString());
          }
          setBudgetCurrency(data.monthlyBudgetCurrency ?? 'TRY');
          if (data.budgetAlertThreshold > 0) {
            setBudgetAlertThreshold(data.budgetAlertThreshold);
          }
        }
        setCategoryBudgets(catRes?.data ?? []);
      })
      .catch(() => { setError(true); })
      .finally(() => setLoading(false));
  }, []);

  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.isActive !== false),
    [subscriptions],
  );

  // Toplam harcama (TRY)
  const totalExpense = useMemo(() => {
    return activeSubs.reduce((total, sub) => {
      const partnerCount = sub.sharedWith?.length ?? 0;
      return total + convertToTRY(sub.price, sub.currency) / (partnerCount + 1);
    }, 0);
  }, [activeSubs]);

  // Kategori bazlı harcama
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    activeSubs.forEach((sub) => {
      const myShare = convertToTRY(sub.price, sub.currency) / ((sub.sharedWith?.length ?? 0) + 1);
      map[sub.category] = (map[sub.category] ?? 0) + myShare;
    });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeSubs]);

  const budgetPercentage = monthlyBudget > 0 ? Math.min(totalExpense / monthlyBudget, 1) : 0;
  const percentDisplay = (budgetPercentage * 100).toFixed(0);
  const isOverBudget = totalExpense > monthlyBudget && monthlyBudget > 0;
  const isNearLimit = !isOverBudget && budgetPercentage * 100 >= budgetAlertThreshold;

  const ringColor =
    isOverBudget ? colors.error : isNearLimit ? colors.warning : colors.accent;

  const handleSaveBudget = async () => {
    const parsed = parseFloat(budgetInput.replace(',', '.'));
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Hatalı Değer', 'Geçerli bir bütçe miktarı girin.');
      return;
    }
    // Mevcut kategori limitlerinden büyük olanlar varsa uyar
    const exceedingCats = categoryBudgets.filter(b => parsed > 0 && b.monthlyLimit > parsed);
    if (exceedingCats.length > 0) {
      const names = exceedingCats.map(b => `• ${b.category} (${currencySymbol}${b.monthlyLimit.toLocaleString('tr-TR')})`).join('\n');
      Alert.alert(
        'Kategori Limitleri Uyarısı',
        `Aşağıdaki kategori limitleri yeni bütçe hedefini aşıyor:\n\n${names}\n\nBütçeyi kaydetmek istiyor musun?`,
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Kaydet', onPress: () => saveBudget(parsed) },
        ],
      );
      return;
    }
    await saveBudget(parsed);
  };

  const saveBudget = async (parsed: number) => {
    setSaving(true);
    try {
      await agent.Budget.updateSettings({ monthlyBudget: parsed, monthlyBudgetCurrency: budgetCurrency });
      setMonthlyBudget(parsed); // updates store → HomeScreen sees new value immediately
      setEditMode(false);
    } catch {
      // Hata toast'ı agent.ts interceptor tarafından gösterilir
    } finally {
      setSaving(false);
    }
  };

  const openCatEdit = (category: string, prefill: string) => {
    setCatLimitInput(prefill);
    setEditingCategory(category);
    // Klavye açılınca input görünür kalması için sona scroll
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleSaveCatBudget = async (category: string) => {
    const parsed = parseFloat(catLimitInput.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Hatalı Değer', 'Geçerli bir limit girin.');
      return;
    }
    if (monthlyBudget > 0 && parsed > monthlyBudget) {
      Alert.alert(
        'Limit Aşıldı',
        `Kategori limiti, aylık bütçe hedefini (${currencySymbol}${monthlyBudget.toLocaleString('tr-TR')}) aşamaz.`,
      );
      return;
    }
    setSavingCat(true);
    try {
      const res = await agent.CategoryBudgets.upsert({ category, monthlyLimit: parsed });
      const updated: CategoryBudget = res?.data;
      if (updated) {
        setCategoryBudgets((prev) => {
          const exists = prev.find((b) => b.category === category);
          return exists
            ? prev.map((b) => (b.category === category ? updated : b))
            : [...prev, updated];
        });
      }
      setEditingCategory(null);
      setCatLimitInput('');
    } catch {
      // agent.ts interceptor hatayı gösterir
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCatBudget = async (category: string) => {
    Alert.alert(
      'Limiti Kaldır',
      `${category} kategorisi için belirlenen limiti kaldırmak istiyor musun?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              await agent.CategoryBudgets.remove(category);
              setCategoryBudgets((prev) => prev.filter((b) => b.category !== category));
            } catch {}
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={embedded ? [] : ['top']}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]} edges={embedded ? [] : ['top']}>
        <Ionicons name="alert-circle-outline" size={52} color={colors.error} />
        <Text style={{ color: colors.textMain, fontSize: 16, marginTop: 12, textAlign: 'center' }}>Bütçe verileri yüklenemedi.</Text>
        <TouchableOpacity
          onPress={() => {
            setError(false);
            setLoading(true);
            Promise.all([agent.Auth.getProfile(), agent.CategoryBudgets.getAll()])
              .then(([profileRes, catRes]) => {
                const data = profileRes?.data;
                if (data) {
                  if (data.monthlyBudget > 0) { setMonthlyBudget(data.monthlyBudget); setBudgetInput(data.monthlyBudget.toString()); }
                  setBudgetCurrency(data.monthlyBudgetCurrency ?? 'TRY');
                  if (data.budgetAlertThreshold > 0) setBudgetAlertThreshold(data.budgetAlertThreshold);
                }
                setCategoryBudgets(catRes?.data ?? []);
              })
              .catch(() => setError(true))
              .finally(() => setLoading(false));
          }}
          style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Tekrar Dene</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    // [39] SafeAreaView en dışta, KeyboardAvoidingView içinde
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={embedded ? [] : ['top']}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* HEADER */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Bütçe Yönetimi</Text>
        <Text style={styles.headerSub}>
          {monthlyBudget > 0
            ? `Hedef: ${currencySymbol}${monthlyBudget.toLocaleString('tr-TR')}`
            : 'Henüz bütçe belirlenmedi'}
        </Text>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* RING CHART */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          {monthlyBudget > 0 ? (
            <View style={styles.ringWrap}>
              <ProgressChart
                data={{ data: [budgetPercentage] }}
                width={RING_SIZE + 32}
                height={RING_SIZE}
                strokeWidth={18}
                radius={68}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: colors.cardBg,
                  backgroundGradientTo: colors.cardBg,
                  color: (opacity = 1) => {
                    const hex = ringColor.replace('#', '');
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    return `rgba(${r},${g},${b},${opacity})`;
                  },
                }}
                hideLegend
              />
              {/* Merkez yazı */}
              <View style={styles.ringCenter} pointerEvents="none">
                <Text style={[styles.ringPercent, { color: ringColor }]}>{percentDisplay}%</Text>
                <Text style={[styles.ringLabel, { color: colors.textSec }]}>kullanıldı</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noBudgetWrap}>
              <Ionicons name="wallet-outline" size={48} color={colors.textSec} />
              <Text style={[styles.noBudgetText, { color: colors.textSec }]}>
                Bütçe hedefi belirlenmedi
              </Text>
            </View>
          )}

          {/* Harcama / Hedef bilgisi */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSec }]}>Bu Ay Harcama</Text>
              <Text style={[styles.statValue, { color: colors.textMain }]}>
                {currencySymbol}{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSec }]}>Bütçe Hedefi</Text>
              <Text style={[styles.statValue, { color: colors.textMain }]}>
                {monthlyBudget > 0
                  ? `${currencySymbol}${monthlyBudget.toLocaleString('tr-TR')}`
                  : '—'}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSec }]}>
                {isOverBudget ? 'Aşım' : 'Kalan'}
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: isOverBudget ? colors.error : colors.success },
                ]}
              >
                {monthlyBudget > 0
                  ? `${currencySymbol}${Math.abs(monthlyBudget - totalExpense).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '—'}
              </Text>
            </View>
          </View>

          {/* Uyarı mesajı */}
          {(isOverBudget || isNearLimit) && (
            <View
              style={[
                styles.warningBanner,
                {
                  backgroundColor: isOverBudget
                    ? colors.error + '18'
                    : colors.warning + '18',
                  borderColor: isOverBudget ? colors.error : colors.warning,
                },
              ]}
            >
              <Ionicons
                name={isOverBudget ? 'alert-circle-outline' : 'warning-outline'}
                size={16}
                color={isOverBudget ? colors.error : colors.warning}
              />
              <Text style={[styles.warningText, { color: isOverBudget ? colors.error : colors.warning }]}>
                {isOverBudget
                  ? `Bütçen ${currencySymbol}${(totalExpense - monthlyBudget).toFixed(2)} aşıldı!`
                  : `Bütçenin %${percentDisplay}'ini kullandın.`}
              </Text>
            </View>
          )}
        </View>

        {/* BÜTÇE HEDEF DÜZENLE */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="create-outline" size={18} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Aylık Bütçe Hedefi</Text>
            {!editMode && (
              <TouchableOpacity
                onPress={() => {
                  setBudgetInput(monthlyBudget > 0 ? monthlyBudget.toString() : '');
                  setEditMode(true);
                }}
                style={[styles.editBtn, { backgroundColor: colors.inputBg }]}
              >
                <Text style={[styles.editBtnText, { color: colors.accent }]}>Düzenle</Text>
              </TouchableOpacity>
            )}
          </View>

          {editMode ? (
            <View style={styles.editRow}>
              <View style={[styles.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={[styles.inputPrefix, { color: colors.textSec }]}>{currencySymbol}</Text>
                <TextInput
                  style={[styles.budgetInput, { color: colors.textMain }]}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSec}
                  autoFocus
                />
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.accent, opacity: saving ? 0.7 : 1 }]}
                onPress={handleSaveBudget}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setEditMode(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSec }]}>İptal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.currentBudgetText, { color: monthlyBudget > 0 ? colors.accent : colors.textSec }]}>
              {monthlyBudget > 0 ? `${currencySymbol}${monthlyBudget.toLocaleString('tr-TR')} / ay` : 'Henüz belirlenmedi'}
            </Text>
          )}
        </View>

        {/* BÜTÇE LİMİT ÖNERİSİ */}
        {totalExpense > 0 && (
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
              <Text style={[styles.cardTitle, { color: colors.textMain }]}>Önerilen Bütçe</Text>
            </View>
            <Text style={[{ fontSize: 12, color: colors.textSec, marginBottom: 12, lineHeight: 18 }]}>
              Mevcut harcamanıza göre uygun bütçe aralıkları:
            </Text>
            <View style={{ gap: 8 }}>
              {[
                { label: 'Sıkı', multiplier: 1.05, desc: '+%5 tampon' },
                { label: 'Dengeli', multiplier: 1.15, desc: '+%15 tampon' },
                { label: 'Rahat', multiplier: 1.30, desc: '+%30 tampon' },
              ].map(opt => {
                const suggested = Math.ceil((totalExpense * opt.multiplier) / 50) * 50;
                const isCurrentMatch = Math.abs(monthlyBudget - suggested) < 25;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    onPress={() => {
                      setBudgetInput(suggested.toString());
                      setEditMode(true);
                    }}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isCurrentMatch ? colors.accent : colors.border,
                      backgroundColor: isCurrentMatch ? (colors.accent + '12') : colors.inputBg,
                    }}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isCurrentMatch ? colors.accent : colors.textMain }}>
                        {opt.label}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textSec, marginTop: 2 }}>{opt.desc}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: isCurrentMatch ? colors.accent : colors.textMain }}>
                        {currencySymbol}{suggested.toLocaleString('tr-TR')}
                      </Text>
                      {!isCurrentMatch && (
                        <Ionicons name="chevron-forward" size={14} color={colors.textSec} />
                      )}
                      {isCurrentMatch && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* UYARI EŞİĞİ */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={18} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Uyarı Eşiği</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.textSec }]}>
            Bütçenin kaçta kaçı kullanıldığında uyarı gösterilsin?
          </Text>
          <View style={styles.thresholdRow}>
            {ALERT_THRESHOLDS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.thresholdBtn,
                  {
                    backgroundColor:
                      budgetAlertThreshold === t ? colors.accent : colors.inputBg,
                    borderColor:
                      budgetAlertThreshold === t ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => handleThresholdChange(t)}
              >
                <Text
                  style={[
                    styles.thresholdBtnText,
                    { color: budgetAlertThreshold === t ? '#FFF' : colors.textMain },
                  ]}
                >
                  %{t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* KATEGORİ DAĞILIMI */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="pie-chart-outline" size={18} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.textMain }]}>Kategori Dağılımı</Text>
          </View>

          {categoryBreakdown.length === 0 ? (
            <Text style={[styles.cardDesc, { color: colors.textSec }]}>Aktif abonelik yok.</Text>
          ) : (
            categoryBreakdown.map(({ category, amount }) => {
              const pct = totalExpense > 0 ? amount / totalExpense : 0;
              const dotColor = getCategoryColor(category);
              const catBudget = categoryBudgets.find((b) => b.category === category);
              const isEditing = editingCategory === category;

              // Bar değerleri: bütçe varsa spent/limit, yoksa toplam içindeki pay
              const barPct = catBudget
                ? Math.min(amount / catBudget.monthlyLimit, 1)
                : pct;
              const barColor = catBudget
                ? catBudget.isOverBudget
                  ? colors.error
                  : catBudget.isNearLimit
                    ? colors.warning
                    : colors.success
                : dotColor;

              return (
                <View key={category} style={styles.catRow}>
                  {/* Başlık satırı */}
                  <View style={styles.catLabelRow}>
                    <View style={[styles.catDot, { backgroundColor: dotColor }]} />
                    <Text style={[styles.catName, { color: colors.textMain }]} numberOfLines={1}>
                      {category}
                    </Text>
                    {catBudget ? (
                      <>
                        <Text style={[styles.catAmount, { color: barColor, flex: 1, textAlign: 'right' }]}>
                          {currencySymbol}{amount.toFixed(0)} / {currencySymbol}{catBudget.monthlyLimit.toFixed(0)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => isEditing
                            ? setEditingCategory(null)
                            : openCatEdit(category, catBudget.monthlyLimit.toString())}
                          style={styles.catIconBtn}
                        >
                          <Ionicons name="pencil-outline" size={14} color={colors.textSec} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteCatBudget(category)}
                          style={styles.catIconBtn}
                        >
                          <Ionicons name="trash-outline" size={14} color={colors.error} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.catPct, { color: colors.textSec }]}>
                          %{(pct * 100).toFixed(0)}
                        </Text>
                        <Text style={[styles.catAmount, { color: dotColor }]}>
                          {currencySymbol}{amount.toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => isEditing
                            ? setEditingCategory(null)
                            : openCatEdit(category, '')}
                          style={[styles.catIconBtn, { backgroundColor: colors.inputBg, borderRadius: 8 }]}
                        >
                          <Ionicons name="add" size={16} color={colors.accent} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  {/* Progress bar */}
                  <View style={[styles.catBarBg, { backgroundColor: colors.inputBg }]}>
                    <View
                      style={[
                        styles.catBarFill,
                        { width: `${barPct * 100}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>

                  {/* Inline düzenleme */}
                  {isEditing && (() => {
                    const catParsed = parseFloat(catLimitInput.replace(',', '.'));
                    const isOverMain = monthlyBudget > 0 && !isNaN(catParsed) && catParsed > monthlyBudget;
                    return (
                      <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                        <View style={[styles.catEditRow, { marginTop: 0, paddingTop: 0, borderTopWidth: 0 }]}>
                          <View style={[
                            styles.catInputWrap,
                            {
                              backgroundColor: colors.inputBg,
                              borderColor: isOverMain ? colors.error : colors.border,
                            },
                          ]}>
                            <Text style={[styles.inputPrefix, { color: colors.textSec }]}>{currencySymbol}</Text>
                            <TextInput
                              style={[styles.budgetInput, { color: isOverMain ? colors.error : colors.textMain }]}
                              value={catLimitInput}
                              onChangeText={setCatLimitInput}
                              keyboardType="numeric"
                              placeholder="Limit"
                              placeholderTextColor={colors.textSec}
                              autoFocus
                            />
                          </View>
                          <TouchableOpacity
                            style={[styles.catSaveBtn, { backgroundColor: isOverMain ? colors.border : colors.accent, opacity: savingCat ? 0.7 : 1 }]}
                            onPress={() => handleSaveCatBudget(category)}
                            disabled={savingCat || isOverMain}
                          >
                            {savingCat
                              ? <ActivityIndicator size="small" color="#FFF" />
                              : <Text style={styles.saveBtnText}>Kaydet</Text>}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.cancelBtn, { borderColor: colors.border }]}
                            onPress={() => setEditingCategory(null)}
                          >
                            <Text style={[styles.cancelBtnText, { color: colors.textSec }]}>İptal</Text>
                          </TouchableOpacity>
                        </View>
                        {isOverMain && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                            <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
                            <Text style={{ fontSize: 11, color: colors.error, fontWeight: '600' }}>
                              Ana bütçeyi ({currencySymbol}{monthlyBudget.toLocaleString('tr-TR')}) aşamazsın
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })()}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '500' },

  scrollContent: { padding: 16, gap: 14 },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },

  // Ring chart
  ringWrap: { alignItems: 'center', position: 'relative' },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringPercent: { fontSize: 28, fontWeight: '800' },
  ringLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  noBudgetWrap: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  noBudgetText: { fontSize: 14 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, marginVertical: 4 },
  statLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '800', textAlign: 'center' },

  // Warning
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: { fontSize: 13, fontWeight: '600', flex: 1 },

  // Edit budget
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  editBtnText: { fontSize: 13, fontWeight: '700' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  inputPrefix: { fontSize: 16, fontWeight: '600', marginRight: 4 },
  budgetInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  saveBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  cancelBtn: {
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  currentBudgetText: { fontSize: 20, fontWeight: '800', marginTop: 4 },

  // Threshold
  thresholdRow: { flexDirection: 'row', gap: 10 },
  thresholdBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  thresholdBtnText: { fontSize: 15, fontWeight: '700' },

  // Category
  catRow: { marginBottom: 14 },
  catLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  catDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  catName: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
  catPct: { fontSize: 12 },
  catAmount: { fontSize: 13, fontWeight: '700', minWidth: 70, textAlign: 'right' },
  catBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },
  catIconBtn: { padding: 4 },
  catEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  catInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
  },
  catSaveBtn: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
