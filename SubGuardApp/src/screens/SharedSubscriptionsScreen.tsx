import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Platform, RefreshControl, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import agent from '../api/agent';
import { UserSubscription } from '../types';
import { isSubscriptionActiveNow } from '../utils/dateUtils';
import { formatCurrencyAmount, normalizeCurrencyCode } from '../utils/CurrencyService';
import { getSubscriptionCycleShare, getSubscriptionMonthlyShareInCurrency } from '../utils/subscriptionMath';

type Tab = 'subs' | 'people' | 'benimle';
type SharedStatus = 'active' | 'pending' | 'paused' | 'cancelled';
type SharedUser = { email: string; userId: string };
type SharedGuest = { id: number; displayName: string };
type PersonAggregate = { key: string; displayName: string; email?: string; subs: UserSubscription[]; activeMonthlyTRY: number };

const WHATSAPP_GREEN = '#25D366';
const fmt = (amount: number, currency: string) => formatCurrencyAmount(amount, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtBudget = (amount: number, currency: string) => formatCurrencyAmount(amount, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const cycleUnit = (period?: UserSubscription['billingPeriod']) => period === 'Yearly' ? 'yıl' : 'ay';
const periodLabel = (period?: UserSubscription['billingPeriod']) => period === 'Yearly' ? 'Yıllık' : 'Aylık';

const getShareStatus = (sub: UserSubscription): SharedStatus => {
  if (sub.isActive === false) return sub.cancelledDate ? 'cancelled' : 'paused';
  return isSubscriptionActiveNow(sub.isActive, sub.firstPaymentDate, sub.contractStartDate, new Date(), sub.createdDate) ? 'active' : 'pending';
};

const getStatusMeta = (status: SharedStatus, colors: ReturnType<typeof useThemeColors>) => {
  if (status === 'active') return { label: 'Aktif', text: colors.success, bg: `${colors.success}20` };
  if (status === 'pending') return { label: 'Bekliyor', text: colors.warning, bg: `${colors.warning}20` };
  if (status === 'paused') return { label: 'Duraklatıldı', text: colors.warning, bg: `${colors.warning}20` };
  return { label: 'İptal', text: colors.error, bg: `${colors.error}20` };
};

const buildReminder = (
  subs: UserSubscription[],
  rates: Record<string, number>,
  budgetCurrency: string,
  recipient?: string,
) => {
  const usable = subs.filter((sub) => ['active', 'pending'].includes(getShareStatus(sub)));
  const target = usable.length > 0 ? usable : subs;
  const total = target.reduce(
    (sum, sub) => sum + getSubscriptionMonthlyShareInCurrency(sub, rates, budgetCurrency, { unknownRateAsZero: true }),
    0,
  );
  const lines = target.map((sub) => {
    const pending = getShareStatus(sub) === 'pending' ? ' (başlangıç bekliyor)' : '';
    return `- ${sub.name}: ${fmt(getSubscriptionCycleShare(sub), sub.currency)} / ${cycleUnit(sub.billingPeriod)}${pending}`;
  });
  return [recipient ? `Merhaba ${recipient},` : 'Merhaba,', '', 'Seninle paylaşılan abonelik özeti:', ...lines, '', `Toplam aylık eşdeğer yük: ${fmtBudget(total, budgetCurrency)}`, '', 'SubGuard ile gönderildi.'].join('\n');
};

const openWhatsApp = async (subs: UserSubscription[], rates: Record<string, number>, budgetCurrency: string, recipient?: string) => {
  try { await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(buildReminder(subs, rates, budgetCurrency, recipient))}`); }
  catch { Alert.alert('Hata', 'WhatsApp yüklü değil.'); }
};

const openEmail = async (subs: UserSubscription[], rates: Record<string, number>, budgetCurrency: string, email: string, recipient?: string) => {
  try {
    const subject = encodeURIComponent(`${subs.length === 1 ? subs[0].name : 'Paylaşımlı abonelikler'} paylaşım özeti`);
    const body = encodeURIComponent(buildReminder(subs, rates, budgetCurrency, recipient));
    await Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  } catch {
    Alert.alert('Hata', 'E-posta uygulaması açılamadı.');
  }
};

function ManagePartnersPanel({ sub, colors, onClose, onRefresh }: { sub: UserSubscription; colors: ReturnType<typeof useThemeColors>; onClose: () => void; onRefresh: () => Promise<void>; }) {
  const [members, setMembers] = useState<SharedUser[]>(sub.sharedWith ?? []);
  const [guests, setGuests] = useState<SharedGuest[]>(sub.sharedGuests ?? []);
  const [memberInput, setMemberInput] = useState('');
  const [guestInput, setGuestInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMembers(sub.sharedWith ?? []);
    setGuests(sub.sharedGuests ?? []);
  }, [sub.id, sub.sharedWith, sub.sharedGuests]);

  const addMember = () => {
    const email = memberInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return;
    if (!emailRegex.test(email)) return Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin.');
    if (members.some((item) => item.email.toLowerCase() === email)) return Alert.alert('Zaten Ekli', 'Bu e-posta zaten listede.');
    setMembers((prev) => [...prev, { email, userId: '' }]);
    setMemberInput('');
  };

  const addGuest = () => {
    const name = guestInput.trim();
    if (!name) return;
    if (guests.some((item) => item.displayName.toLowerCase() === name.toLowerCase())) return Alert.alert('Zaten Ekli', 'Bu misafir zaten listede.');
    setGuests((prev) => [...prev, { id: 0, displayName: name }]);
    setGuestInput('');
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const existingMembers = sub.sharedWith ?? [];
      const existingGuests = sub.sharedGuests ?? [];
      const currentMemberSet = new Set(members.map((item) => item.email.toLowerCase()));
      const currentGuestSet = new Set(guests.map((item) => item.displayName.toLowerCase()));
      const results = await Promise.allSettled([
        ...members.filter((item) => !existingMembers.some((cur) => cur.email.toLowerCase() === item.email.toLowerCase())).map((item) => agent.UserSubscriptions.share(Number(sub.id), item.email)),
        ...existingMembers.filter((item) => !currentMemberSet.has(item.email.toLowerCase()) && item.userId).map((item) => agent.UserSubscriptions.removeShare(Number(sub.id), item.userId)),
        ...guests.filter((item) => !existingGuests.some((cur) => cur.displayName.toLowerCase() === item.displayName.toLowerCase())).map((item) => agent.UserSubscriptions.shareGuest(Number(sub.id), item.displayName)),
        ...existingGuests.filter((item) => !currentGuestSet.has(item.displayName.toLowerCase())).map((item) => agent.UserSubscriptions.removeGuestShare(Number(sub.id), item.id)),
      ]);
      await onRefresh();
      const failed = results.filter((item): item is PromiseRejectedResult => item.status === 'rejected').map((item) => item.reason?.response?.data?.errors?.[0] ?? 'Bir paylaşım işlemi başarısız oldu.');
      if (failed.length > 0) Alert.alert('Paylaşım Uyarısı', failed[0]);
      else onClose();
    } catch (error) {
      console.error('Paylaşım güncelleme hatası:', error);
      Alert.alert('Hata', 'Paylaşım güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const listRow = (label: string, onRemove: () => void, key: string) => (
    <View key={key} style={[styles.rowBetween, styles.partnerRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.partnerText, { color: colors.textMain }]} numberOfLines={1}>{label}</Text>
      <TouchableOpacity onPress={onRemove}><Ionicons name="trash-outline" size={16} color={colors.error} /></TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.panel, { backgroundColor: colors.cardBg, borderColor: colors.border }]}> 
      <View style={[styles.rowBetween, { marginBottom: 12 }]}> 
        <View style={{ flex: 1 }}>
          <Text style={[styles.panelTitle, { color: colors.textMain }]}>{sub.name}</Text>
          <Text style={[styles.panelSub, { color: colors.textSec }]}>Kişi başı {fmt(getSubscriptionCycleShare(sub), sub.currency)} / {cycleUnit(sub.billingPeriod)}</Text>
        </View>
        <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={colors.textSec} /></TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textSec }]}>Üyeler</Text>
      <View style={styles.inputRow}>
        <TextInput style={[styles.input, { color: colors.textMain, backgroundColor: colors.inputBg }]} placeholder="E-posta adresi" placeholderTextColor={colors.textSec} value={memberInput} onChangeText={setMemberInput} autoCapitalize="none" onSubmitEditing={addMember} />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={addMember}><Ionicons name="add" size={20} color="#FFF" /></TouchableOpacity>
      </View>
      {members.length === 0 ? <Text style={[styles.inlineEmpty, { color: colors.textSec }]}>Henüz üye eklenmedi.</Text> : members.map((item) => listRow(item.email, () => setMembers((prev) => prev.filter((cur) => cur.email !== item.email)), item.email))}

      <Text style={[styles.sectionLabel, { color: colors.textSec, marginTop: 12 }]}>Misafirler</Text>
      <View style={styles.inputRow}>
        <TextInput style={[styles.input, { color: colors.textMain, backgroundColor: colors.inputBg }]} placeholder="Misafir adı" placeholderTextColor={colors.textSec} value={guestInput} onChangeText={setGuestInput} onSubmitEditing={addGuest} />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={addGuest}><Ionicons name="add" size={20} color="#FFF" /></TouchableOpacity>
      </View>
      {guests.length === 0 ? <Text style={[styles.inlineEmpty, { color: colors.textSec }]}>Henüz misafir eklenmedi.</Text> : guests.map((item) => listRow(item.displayName, () => setGuests((prev) => prev.filter((cur) => cur.displayName !== item.displayName)), `${item.id}-${item.displayName}`))}

      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: saving ? colors.textSec : colors.accent }]} onPress={handleSave} disabled={saving}>
        <Text style={styles.primaryBtnText}>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</Text>
      </TouchableOpacity>
    </View>
  );
}
export default function SharedSubscriptionsScreen() {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const monthlyBudgetCurrency = useSettingsStore((state) => state.monthlyBudgetCurrency);
  const { subscriptions, sharedWithMe, sharedWithMeHasMore, loadingSharedWithMe, exchangeRates, fetchSharedWithMe, loadMoreSharedWithMe, fetchAllUserSubscriptions, fetchExchangeRates } = useUserSubscriptionStore();
  const budgetCurrency = normalizeCurrencyCode(monthlyBudgetCurrency);
  const [activeTab, setActiveTab] = useState<Tab>('subs');
  const [managingSub, setManagingSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const loadData = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(false);
    try {
      const results = await Promise.allSettled([fetchAllUserSubscriptions(), fetchExchangeRates(), fetchSharedWithMe()]);
      const sharedFailed = results[2].status === 'rejected';
      const current = useUserSubscriptionStore.getState();
      if (sharedFailed && current.sharedWithMe.length === 0 && current.subscriptions.length === 0) setError(true);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [fetchAllUserSubscriptions, fetchExchangeRates, fetchSharedWithMe]);

  useEffect(() => { void loadData(); }, [loadData]);
  const onRefresh = useCallback(async () => { setRefreshing(true); try { await loadData(false); } finally { setRefreshing(false); } }, [loadData]);

  const sharedSubs = useMemo(() => subscriptions.filter((sub) => ((sub.sharedWith?.length ?? 0) + (sub.sharedGuests?.length ?? 0)) > 0), [subscriptions]);
  const activeSharedMonthlyTRY = useMemo(
    () => sharedSubs.reduce(
      (sum, sub) => getShareStatus(sub) === 'active'
        ? sum + getSubscriptionMonthlyShareInCurrency(sub, exchangeRates, budgetCurrency, { unknownRateAsZero: true })
        : sum,
      0,
    ),
    [budgetCurrency, exchangeRates, sharedSubs],
  );

  const people = useMemo(() => {
    const map = new Map<string, PersonAggregate>();
    sharedSubs.forEach((sub) => {
      const monthly = getSubscriptionMonthlyShareInCurrency(sub, exchangeRates, budgetCurrency, { unknownRateAsZero: true });
      const isActive = getShareStatus(sub) === 'active';
      (sub.sharedWith ?? []).forEach((member) => {
        const key = `member:${member.email.toLowerCase()}`;
        const existing = map.get(key);
        if (existing) {
          existing.subs.push(sub);
          if (isActive) existing.activeMonthlyTRY += monthly;
        } else {
          map.set(key, { key, displayName: member.email, email: member.email, subs: [sub], activeMonthlyTRY: isActive ? monthly : 0 });
        }
      });
      (sub.sharedGuests ?? []).forEach((guest) => {
        const key = `guest:${guest.displayName.toLowerCase()}`;
        const existing = map.get(key);
        if (existing) {
          existing.subs.push(sub);
          if (isActive) existing.activeMonthlyTRY += monthly;
        } else {
          map.set(key, { key, displayName: guest.displayName, subs: [sub], activeMonthlyTRY: isActive ? monthly : 0 });
        }
      });
    });
    return [...map.values()].sort((a, b) => b.activeMonthlyTRY - a.activeMonthlyTRY || a.displayName.localeCompare(b.displayName, 'tr'));
  }, [budgetCurrency, exchangeRates, sharedSubs]);

  const refreshShares = useCallback(async () => {
    await Promise.allSettled([fetchAllUserSubscriptions(), fetchSharedWithMe()]);
  }, [fetchAllUserSubscriptions, fetchSharedWithMe]);

  const leaveShared = useCallback((sub: UserSubscription) => {
    Alert.alert('Paylaşımdan Ayrıl', `${sub.name} paylaşımından ayrılmak istediğine emin misin?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Ayrıl', style: 'destructive', onPress: async () => {
        setLeavingId(sub.id);
        try { await agent.UserSubscriptions.leaveShared(sub.id); await fetchSharedWithMe(); }
        catch (errorLeave) { console.error('Paylaşımdan ayrılma hatası:', errorLeave); }
        finally { setLeavingId(null); }
      } },
    ]);
  }, [fetchSharedWithMe]);

  const renderSubItem = ({ item }: { item: UserSubscription }) => {
    const statusMeta = getStatusMeta(getShareStatus(item), colors);
    const peopleText = [...(item.sharedWith ?? []).map((x) => x.email), ...(item.sharedGuests ?? []).map((x) => x.displayName)].join(', ');
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.colorBar, { backgroundColor: item.colorCode || colors.accent }]} />
        <View style={styles.cardBody}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.subtle, { color: colors.textSec }]}>{item.category} · {periodLabel(item.billingPeriod)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={[styles.chip, { backgroundColor: statusMeta.bg }]}><Text style={[styles.chipText, { color: statusMeta.text }]}>{statusMeta.label}</Text></View>
              <Text style={[styles.price, { color: colors.textMain }]}>{fmt(item.price, item.currency)} / {cycleUnit(item.billingPeriod)}</Text>
            </View>
          </View>
          <Text style={[styles.shareInfo, { color: colors.accent }]}>Kişi başı {fmt(getSubscriptionCycleShare(item), item.currency)} / {cycleUnit(item.billingPeriod)}</Text>
          <Text style={[styles.subtle, { color: colors.textSec }]}>
            {`Aylık eşdeğer yük: ${fmtBudget(getSubscriptionMonthlyShareInCurrency(item, exchangeRates, budgetCurrency, { unknownRateAsZero: true }), budgetCurrency)}`}
          </Text>
          <View style={[styles.row, { marginTop: 10 }]}><Ionicons name="people-outline" size={14} color={colors.textSec} /><Text style={[styles.peopleText, { color: colors.textSec }]} numberOfLines={2}>{peopleText}</Text></View>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={() => setManagingSub(item)}><Ionicons name="people" size={14} color={colors.accent} /><Text style={[styles.smallBtnText, { color: colors.accent }]}>Yönet</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, { backgroundColor: `${WHATSAPP_GREEN}20`, borderColor: `${WHATSAPP_GREEN}45` }]} onPress={() => void openWhatsApp([item], exchangeRates, budgetCurrency)}><FontAwesome5 name="whatsapp" size={13} color={WHATSAPP_GREEN} /><Text style={[styles.smallBtnText, { color: WHATSAPP_GREEN }]}>Hatırlat</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderPersonItem = ({ item }: { item: PersonAggregate }) => (
    <View style={[styles.personCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.rowBetween}>
        <View style={[styles.avatar, { backgroundColor: `${colors.accent}20` }]}><Text style={[styles.avatarText, { color: colors.accent }]}>{item.displayName.charAt(0).toUpperCase()}</Text></View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>{item.displayName}</Text>
          <Text style={[styles.subtle, { color: colors.textSec }]}>{item.subs.length} abonelik</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.personTotal, { color: colors.accent }]}>{fmtBudget(item.activeMonthlyTRY, budgetCurrency)}</Text>
          <Text style={[styles.personLabel, { color: colors.textSec }]}>aktif aylık yük</Text>
        </View>
      </View>
      {item.subs.map((sub) => {
        const statusMeta = getStatusMeta(getShareStatus(sub), colors);
        return (
          <View key={`${item.key}-${sub.id}`} style={[styles.subRow, { borderTopColor: colors.border }]}>
            <View style={[styles.dot, { backgroundColor: sub.colorCode || colors.accent }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.subRowName, { color: colors.textMain }]} numberOfLines={1}>{sub.name}</Text>
              <View style={[styles.row, { marginTop: 2 }]}>
                <Text style={[styles.miniMeta, { color: colors.textSec }]}>{fmt(getSubscriptionCycleShare(sub), sub.currency)} / {cycleUnit(sub.billingPeriod)}</Text>
                <View style={[styles.miniChip, { backgroundColor: statusMeta.bg }]}><Text style={[styles.miniChipText, { color: statusMeta.text }]}>{statusMeta.label}</Text></View>
              </View>
            </View>
            <Text style={[styles.miniTotal, { color: colors.textSec }]}>{`≈ ${fmtBudget(getSubscriptionMonthlyShareInCurrency(sub, exchangeRates, budgetCurrency, { unknownRateAsZero: true }), budgetCurrency)}/ay`}</Text>
          </View>
        );
      })}
      <View style={[styles.actions, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.smallBtn, { backgroundColor: `${WHATSAPP_GREEN}20`, borderColor: `${WHATSAPP_GREEN}45` }]} onPress={() => void openWhatsApp(item.subs, exchangeRates, budgetCurrency, item.displayName)}><FontAwesome5 name="whatsapp" size={13} color={WHATSAPP_GREEN} /><Text style={[styles.smallBtnText, { color: WHATSAPP_GREEN }]}>Hatırlat</Text></TouchableOpacity>
        {item.email && <TouchableOpacity style={[styles.smallBtn, { backgroundColor: `${colors.accent}18`, borderColor: `${colors.accent}35` }]} onPress={() => void openEmail(item.subs, exchangeRates, budgetCurrency, item.email!, item.displayName)}><Ionicons name="mail-outline" size={14} color={colors.accent} /><Text style={[styles.smallBtnText, { color: colors.accent }]}>E-posta</Text></TouchableOpacity>}
      </View>
    </View>
  );
  const renderSharedWithMeItem = ({ item }: { item: UserSubscription }) => {
    const statusMeta = getStatusMeta(getShareStatus(item), colors);
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.colorBar, { backgroundColor: item.colorCode || colors.accent }]} />
        <View style={styles.cardBody}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.subtle, { color: colors.textSec }]}>{item.category} · {periodLabel(item.billingPeriod)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={[styles.chip, { backgroundColor: statusMeta.bg }]}><Text style={[styles.chipText, { color: statusMeta.text }]}>{statusMeta.label}</Text></View>
              <Text style={[styles.price, { color: colors.textMain }]}>{fmt(item.price, item.currency)} / {cycleUnit(item.billingPeriod)}</Text>
            </View>
          </View>
          <Text style={[styles.shareInfo, { color: colors.accent }]}>Kişi başı {fmt(getSubscriptionCycleShare(item), item.currency)} / {cycleUnit(item.billingPeriod)}</Text>
          <Text style={[styles.subtle, { color: colors.textSec }]}>
            {`Aylık eşdeğer yük: ${fmtBudget(getSubscriptionMonthlyShareInCurrency(item, exchangeRates, budgetCurrency, { unknownRateAsZero: true }), budgetCurrency)}`}
          </Text>
          <View style={[styles.row, { marginTop: 10 }]}><Ionicons name="person-circle-outline" size={14} color={colors.textSec} /><Text style={[styles.peopleText, { color: colors.textSec }]} numberOfLines={1}>{item.ownerFullName ? `Paylaşan: ${item.ownerFullName}` : item.ownerEmail ? `Paylaşan: ${item.ownerEmail}` : 'Sahibi tarafından paylaşıldı'}</Text></View>
          {item.sharedAt && <View style={[styles.row, { marginTop: 4 }]}><Ionicons name="calendar-outline" size={13} color={colors.textSec} /><Text style={[styles.peopleText, { color: colors.textSec, fontSize: 11 }]}>{new Date(item.sharedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.smallBtn, { backgroundColor: `${colors.error}14`, borderColor: `${colors.error}35` }]} onPress={() => leaveShared(item)} disabled={leavingId === item.id}><Ionicons name="exit-outline" size={14} color={colors.error} /><Text style={[styles.smallBtnText, { color: colors.error }]}>{leavingId === item.id ? 'Ayrılıyor...' : 'Paylaşımdan Ayrıl'}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#4F46E5', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          Platform.OS === 'android' && { paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.headerTitle}>Paylaşımlı Abonelikler</Text>
            <Text style={styles.headerDesc}>Üyeler, misafirler ve seninle paylaşılanlar tek yerde.</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}><Ionicons name="close" size={22} color="#FFF" /></TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statNum}>{sharedSubs.length}</Text><Text style={styles.statLabel}>Paylaşım</Text></View>
          <View style={styles.divider} />
          <View style={styles.stat}><Text style={styles.statNum}>{people.length}</Text><Text style={styles.statLabel}>Kişi</Text></View>
          <View style={styles.divider} />
          <View style={styles.stat}><Text style={styles.statNum}>{fmtBudget(activeSharedMonthlyTRY, budgetCurrency)}</Text><Text style={styles.statLabel}>Aktif Aylık Yük</Text></View>
        </View>
      </LinearGradient>

      <View style={[styles.tabs, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        {([['subs', 'Paylaştıklarım'], ['people', 'Kişiler'], ['benimle', 'Benimle']] as [Tab, string][]).map(([tab, label]) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && { borderBottomColor: colors.accent }]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.accent : colors.textSec }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {managingSub && <ManagePartnersPanel sub={managingSub} colors={colors} onClose={() => setManagingSub(null)} onRefresh={refreshShares} />}

      {loading && !refreshing ? <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View> : error ? (
        <View style={styles.center}><Ionicons name="alert-circle-outline" size={48} color={colors.error} /><Text style={[styles.errorTitle, { color: colors.textMain }]}>Veriler yüklenemedi.</Text><TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.accent, marginTop: 16 }]} onPress={() => void loadData()}><Text style={styles.primaryBtnText}>Tekrar Dene</Text></TouchableOpacity></View>
      ) : activeTab === 'subs' ? (
        <FlatList data={sharedSubs} keyExtractor={(item) => item.id} renderItem={renderSubItem} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />} ListEmptyComponent={<View style={styles.empty}><Ionicons name="people-outline" size={52} color={colors.textSec} /><Text style={[styles.emptyTitle, { color: colors.textMain }]}>Paylaşım yok</Text><Text style={[styles.emptyDesc, { color: colors.textSec }]}>Abonelikler ekranından bir aboneliği düzenleyerek kişi ekleyebilirsin.</Text></View>} />
      ) : activeTab === 'people' ? (
        <FlatList data={people} keyExtractor={(item) => item.key} renderItem={renderPersonItem} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />} ListEmptyComponent={<View style={styles.empty}><Ionicons name="person-outline" size={52} color={colors.textSec} /><Text style={[styles.emptyTitle, { color: colors.textMain }]}>Kişi yok</Text><Text style={[styles.emptyDesc, { color: colors.textSec }]}>Bir üyeyi ya da misafiri paylaşıma eklediğinde burada görünecek.</Text></View>} />
      ) : (
        <FlatList data={sharedWithMe} keyExtractor={(item) => item.id} renderItem={renderSharedWithMeItem} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />} onEndReached={() => { if (sharedWithMeHasMore) void loadMoreSharedWithMe(); }} onEndReachedThreshold={0.3} ListFooterComponent={loadingSharedWithMe ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} /> : null} ListEmptyComponent={<View style={styles.empty}><Ionicons name="share-social-outline" size={52} color={colors.textSec} /><Text style={[styles.emptyTitle, { color: colors.textMain }]}>Paylaşım yok</Text><Text style={[styles.emptyDesc, { color: colors.textSec }]}>Başka biri seninle bir abonelik paylaştığında burada görünecek.</Text></View>} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerDesc: { marginTop: 4, color: 'rgba(255,255,255,0.78)', fontSize: 12, maxWidth: 250 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600', textAlign: 'center' },
  divider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', flexDirection: 'row' },
  colorBar: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '700' },
  subtle: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700' },
  shareInfo: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  peopleText: { fontSize: 12, flex: 1 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  smallBtnText: { fontSize: 12, fontWeight: '700' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '800' },
  personCard: { borderRadius: 18, borderWidth: 1, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  personTotal: { fontSize: 16, fontWeight: '800' },
  personLabel: { fontSize: 11, marginTop: 1 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  subRowName: { fontSize: 13, fontWeight: '600' },
  miniMeta: { fontSize: 11 },
  miniChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  miniChipText: { fontSize: 10, fontWeight: '700' },
  miniTotal: { fontSize: 12, fontWeight: '700', textAlign: 'right' },
  panel: { margin: 12, borderRadius: 20, borderWidth: 1, padding: 16 },
  panelTitle: { fontSize: 15, fontWeight: '700' },
  panelSub: { fontSize: 12, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: { flex: 1, borderRadius: 12, paddingHorizontal: 14, height: 42, fontSize: 14 },
  addBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inlineEmpty: { fontSize: 13, marginBottom: 6 },
  partnerRow: { gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  partnerText: { flex: 1, fontSize: 14, fontWeight: '600' },
  primaryBtn: { marginTop: 14, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  errorTitle: { fontSize: 16, marginTop: 12, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
