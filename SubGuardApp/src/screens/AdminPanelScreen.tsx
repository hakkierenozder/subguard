import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,
  Alert, ScrollView, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import agent from '../api/agent';

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  subscriptionCount: number;
}

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  topCatalogs: { name: string; logoUrl?: string; count: number }[];
  totalCatalogs?: number;
  allCatalogStats?: { name: string; logoUrl?: string; category?: string; count: number }[];
  categoryDistribution?: { category: string; catalogCount: number; subscriptionCount: number }[];
}

interface CatalogItem {
  id: number;
  name: string;
  logoUrl?: string;
  category?: string;
  colorCode?: string;
  plans?: { id: number; name: string; price: number; currency: string; billingCycleDays: number }[];
}

// ─── Yardımcı bileşenler ──────────────────────────────────────────────────────

function StatCard({
  icon, label, value, color, bg,
}: { icon: string; label: string; value: number | string; color: string; bg: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.textMain }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSec }]}>{label}</Text>
    </View>
  );
}

// ─── Ana Ekran ────────────────────────────────────────────────────────────────

type TabKey = 'stats' | 'users' | 'catalogs' | 'roles';
const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'stats',    label: 'İstatistik', icon: 'bar-chart-outline' },
  { key: 'users',    label: 'Kullanıcılar', icon: 'people-outline' },
  { key: 'catalogs', label: 'Kataloglar', icon: 'grid-outline' },
  { key: 'roles',    label: 'Roller', icon: 'shield-outline' },
];

export default function AdminPanelScreen() {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);

  const [activeTab, setActiveTab] = useState<TabKey>('stats');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-down" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="shield-checkmark" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Admin Paneli</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, active && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon as any} size={16} color={active ? colors.accent : colors.textSec} />
              <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.textSec, fontWeight: active ? '700' : '500' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* İçerik */}
      {activeTab === 'stats'    && <StatsTab />}
      {activeTab === 'users'    && <UsersTab />}
      {activeTab === 'catalogs' && <CatalogsTab />}
      {activeTab === 'roles'    && <RolesTab />}
    </SafeAreaView>
  );
}

// ─── Sekme: İstatistik ────────────────────────────────────────────────────────

function StatsTab() {
  const colors = useThemeColors();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await agent.Admin.getStats();
      // CustomResponseDto: { data: AdminStatsDto, statusCode, errors }
      const payload = res?.data ?? res;
      if (payload) setStats(payload);
      else setError('Veri alınamadı.');
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0] ?? e?.message ?? 'Sunucu hatası.');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );

  if (error) return (
    <View style={styles.centered}>
      <Ionicons name="alert-circle-outline" size={40} color={colors.error ?? '#EF4444'} />
      <Text style={[styles.emptyText, { color: colors.textSec, marginTop: 8, textAlign: 'center' }]}>{error}</Text>
      <TouchableOpacity onPress={() => load()} style={{ marginTop: 12 }}>
        <Text style={{ color: colors.accent, fontWeight: '700' }}>Tekrar Dene</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.accent} />}
    >
      {/* Özet Kartlar */}
      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Kullanıcı" value={stats?.totalUsers ?? 0} color={colors.accent} bg={colors.accent + '18'} />
        <StatCard icon="checkmark-circle" label="Aktif Abonelik" value={stats?.activeSubscriptions ?? 0} color={colors.success} bg={colors.success + '18'} />
        <StatCard icon="card" label="Toplam Abonelik" value={stats?.totalSubscriptions ?? 0} color={colors.orange} bg={colors.orange + '18'} />
        <StatCard icon="trending-up" label="Kataloğu Olan" value={stats?.topCatalogs?.length ?? 0} color={colors.purple} bg={colors.purple + '18'} />
      </View>

      {/* En Popüler Kataloglar */}
      {(stats?.topCatalogs?.length ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSec }]}>EN POPÜLER KATALOGLAR</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {stats!.topCatalogs.map((c, i) => (
              <View key={i} style={[styles.catalogRow, i < stats!.topCatalogs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.rankBadge, { backgroundColor: colors.inputBg }]}>
                  <Text style={[styles.rankText, { color: colors.accent }]}>#{i + 1}</Text>
                </View>
                <Text style={[styles.catalogName, { color: colors.textMain }]}>{c.name}</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.countText, { color: colors.accent }]}>{c.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* KATALOG İSTATİSTİKLERİ */}
      {(stats?.totalCatalogs ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSec, marginTop: 8 }]}>KATALOG İSTATİSTİKLERİ</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 14, color: colors.textMain, fontWeight: '600' }}>Toplam Katalog Sayısı</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[styles.countText, { color: colors.accent }]}>{stats!.totalCatalogs}</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* KATEGORİ DAĞILIMI */}
      {(stats?.categoryDistribution?.length ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSec, marginTop: 8 }]}>KATEGORİ DAĞILIMI</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {stats!.categoryDistribution!.map((cat, i) => {
              const maxCount = stats!.categoryDistribution![0]?.subscriptionCount || 1;
              const barPct = Math.round((cat.subscriptionCount / maxCount) * 100);
              const COLORS = ['#6366F1','#10B981','#F97316','#8B5CF6','#EF4444','#3B82F6','#EC4899'];
              const color = COLORS[i % COLORS.length];
              return (
                <View key={cat.category} style={[{ paddingVertical: 10 }, i < stats!.categoryDistribution!.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMain }}>{cat.category}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Text style={{ fontSize: 11, color: colors.textSec }}>{cat.catalogCount} katalog</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color }}>
                        {cat.subscriptionCount} abone
                      </Text>
                    </View>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.inputBg, overflow: 'hidden' }}>
                    <View style={{ width: `${barPct}%` as any, height: '100%', borderRadius: 3, backgroundColor: color }} />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* TÜM KATALOG SIRALAMASI (İlk 20) */}
      {(stats?.allCatalogStats?.length ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSec, marginTop: 8 }]}>TÜM KATALOG SIRALAMASI</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {stats!.allCatalogStats!.map((c, i) => (
              <View key={i} style={[styles.catalogRow, i < stats!.allCatalogStats!.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.rankBadge, { backgroundColor: colors.inputBg }]}>
                  <Text style={[styles.rankText, { color: colors.accent }]}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catalogName, { color: colors.textMain }]}>{c.name}</Text>
                  {c.category && <Text style={{ fontSize: 11, color: colors.textSec, marginTop: 1 }}>{c.category}</Text>}
                </View>
                <View style={[styles.countBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.countText, { color: colors.accent }]}>{c.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ─── Sekme: Kullanıcılar ──────────────────────────────────────────────────────

function UsersTab() {
  const colors = useThemeColors();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUsers = useCallback(async (s: string, p: number, append = false, silent = false) => {
    if (!append && !silent) setLoading(true);
    if (append) setLoadingMore(true);
    setError(null);
    try {
      const res = await agent.Admin.getUsers(s, p, 20);
      // CustomResponseDto: { data: PagedResponseDto, ... }
      const payload = res?.data ?? res;
      if (payload?.items !== undefined) {
        setTotal(payload.totalCount ?? 0);
        setUsers((prev: AdminUser[]) => append ? [...prev, ...payload.items] : payload.items);
      } else if (payload) {
        // Fallback: direkt array dönüyor olabilir
        const items = Array.isArray(payload) ? payload : [];
        setUsers((prev: AdminUser[]) => append ? [...prev, ...items] : items);
      }
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0] ?? e?.message ?? 'Sunucu hatası.');
    }
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadUsers('', 1); }, []);

  const onSearch = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadUsers(text, 1);
    }, 400);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadUsers(search, 1, false, true);
  };

  const onEndReached = () => {
    if (loadingMore || users.length >= total) return;
    const next = page + 1;
    setPage(next);
    loadUsers(search, next, true);
  };

  const toggleActive = (user: AdminUser) => {
    const action = user.isActive ? 'askıya al' : 'aktif et';
    Alert.alert(
      user.isActive ? 'Kullanıcıyı Askıya Al' : 'Kullanıcıyı Aktif Et',
      `${user.email} kullanıcısını ${action}mak istiyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: user.isActive ? 'Askıya Al' : 'Aktif Et',
          style: user.isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (user.isActive) {
                await agent.Admin.deactivate(user.id);
              } else {
                await agent.Admin.activate(user.id);
              }
              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
            } catch {}
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <TouchableOpacity
      style={[styles.userRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      onLongPress={() => toggleActive(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.userAvatar, { backgroundColor: item.isActive ? colors.accent + '20' : colors.border }]}>
        <Text style={[styles.userAvatarText, { color: item.isActive ? colors.accent : colors.textSec }]}>
          {(item.fullName || item.email)[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={[styles.userName, { color: colors.textMain }]} numberOfLines={1}>
            {item.fullName || '—'}
          </Text>
          {item.isAdmin && (
            <View style={[styles.adminBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        <Text style={[styles.userEmail, { color: colors.textSec }]} numberOfLines={1}>{item.email}</Text>
        <Text style={[styles.userMeta, { color: colors.textSec }]}>{item.subscriptionCount} abonelik</Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: item.isActive ? colors.success : colors.error }]} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Arama */}
      <View style={[styles.searchWrap, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSec} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.textMain }]}
          placeholder="E-posta veya isim ara..."
          placeholderTextColor={colors.textSec}
          value={search}
          onChangeText={onSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSec} />
          </TouchableOpacity>
        )}
      </View>

      {/* Toplam */}
      <Text style={[styles.totalText, { color: colors.textSec }]}>
        {total} kullanıcı  •  Uzun bas: askıya al / aktif et
      </Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={[styles.emptyText, { color: colors.textSec, marginTop: 8, textAlign: 'center' }]}>{error}</Text>
          <TouchableOpacity onPress={() => loadUsers(search, 1)} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={colors.accent} /> : null}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSec }]}>Kullanıcı bulunamadı</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Sekme: Kataloglar ────────────────────────────────────────────────────────

function CatalogsTab() {
  const colors = useThemeColors();
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Yeni katalog formu
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newLogo, setNewLogo] = useState('');
  const [newColor, setNewColor] = useState('#4F46E5');
  const [saving, setSaving] = useState(false);
  // Yeni plan formu
  const [planCatalogId, setPlanCatalogId] = useState<number | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [planCurrency, setPlanCurrency] = useState('TRY');
  const [planBillingDays, setPlanBillingDays] = useState(30);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await agent.Catalogs.list(1, 200);
      if (res?.data?.items) setCatalogs(res.data.items);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const deleteCatalog = (id: number, name: string) => {
    Alert.alert('Kataloğu Sil', `"${name}" kalıcı olarak silinecek. Emin misiniz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          try {
            await agent.Admin.deleteCatalog(id);
            setCatalogs(prev => prev.filter(c => c.id !== id));
          } catch {}
        },
      },
    ]);
  };

  const deletePlan = (catalogId: number, planId: number, planName: string) => {
    Alert.alert('Planı Sil', `"${planName}" silinecek.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          try {
            await agent.Admin.deletePlan(planId);
            setCatalogs(prev => prev.map(c =>
              c.id === catalogId
                ? { ...c, plans: (c.plans ?? []).filter(p => p.id !== planId) }
                : c
            ));
          } catch {}
        },
      },
    ]);
  };

  const createCatalog = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await agent.Admin.createCatalog({
        name: newName.trim(),
        category: newCategory.trim() || 'Diğer',
        logoUrl: newLogo.trim() || null,
        colorCode: newColor,
      });
      if (res?.data) {
        setCatalogs(prev => [...prev, res.data]);
        setNewName(''); setNewCategory(''); setNewLogo(''); setNewColor('#4F46E5');
        setShowNewForm(false);
      }
    } catch {}
    setSaving(false);
  };

  const addPlan = async (catalogId: number) => {
    if (!newPlanName.trim() || !newPlanPrice.trim()) return;
    setSaving(true);
    try {
      const res = await agent.Admin.createPlan(catalogId, {
        name: newPlanName.trim(),
        price: parseFloat(newPlanPrice.replace(',', '.')),
        currency: planCurrency,
        billingCycleDays: planBillingDays,
      });
      if (res?.data) {
        setCatalogs(prev => prev.map(c =>
          c.id === catalogId ? { ...c, plans: [...(c.plans ?? []), res.data] } : c
        ));
        setNewPlanName(''); setNewPlanPrice('');
        setPlanCurrency('TRY'); setPlanBillingDays(30);
        setPlanCatalogId(null);
      }
    } catch {}
    setSaving(false);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.accent} /></View>;

  return (
    <ScrollView
      contentContainerStyle={[styles.tabContent, { paddingBottom: 60 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.accent} />}
    >
      {/* Yeni Katalog FAB */}
      <TouchableOpacity
        style={[styles.fabBtn, { backgroundColor: colors.accent }]}
        onPress={() => setShowNewForm(v => !v)}
      >
        <Ionicons name={showNewForm ? 'close' : 'add'} size={18} color="#fff" />
        <Text style={styles.fabText}>{showNewForm ? 'İptal' : 'Yeni Katalog'}</Text>
      </TouchableOpacity>

      {/* Yeni Katalog Formu */}
      {showNewForm && (
        <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.textMain }]}>Yeni Katalog</Text>
          <TextInput style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            placeholder="Katalog adı *" placeholderTextColor={colors.textSec} value={newName} onChangeText={setNewName} />
          <TextInput style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            placeholder="Kategori (Streaming, Music...)" placeholderTextColor={colors.textSec} value={newCategory} onChangeText={setNewCategory} />
          <TextInput style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            placeholder="Logo URL" placeholderTextColor={colors.textSec} value={newLogo} onChangeText={setNewLogo} autoCapitalize="none" />
          <TextInput style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            placeholder="Renk kodu (#4F46E5)" placeholderTextColor={colors.textSec} value={newColor} onChangeText={setNewColor} autoCapitalize="none" />
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent, opacity: saving ? 0.6 : 1 }]}
            onPress={createCatalog} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Katalog Listesi */}
      {catalogs.map((catalog) => {
        const expanded = expandedId === catalog.id;
        const showPlanForm = planCatalogId === catalog.id;
        return (
          <View key={catalog.id} style={[styles.catalogCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.catalogHeader} onPress={() => setExpandedId(expanded ? null : catalog.id)}>
              <View style={[styles.catalogDot, { backgroundColor: catalog.colorCode ?? colors.accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.catalogCardName, { color: colors.textMain }]}>{catalog.name}</Text>
                <Text style={[styles.catalogMeta, { color: colors.textSec }]}>
                  {catalog.category ?? '—'}  •  {catalog.plans?.length ?? 0} plan
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteCatalog(catalog.id, catalog.name)} style={{ paddingLeft: 12 }}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSec} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {expanded && (
              <View style={[styles.plansWrap, { borderTopColor: colors.border }]}>
                {(catalog.plans ?? []).map(plan => (
                  <View key={plan.id} style={[styles.planRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.planName, { color: colors.textMain }]}>{plan.name}</Text>
                    <Text style={[styles.planPrice, { color: colors.accent }]}>
                      {plan.price} {plan.currency}
                    </Text>
                    <TouchableOpacity onPress={() => deletePlan(catalog.id, plan.id, plan.name)} style={{ paddingLeft: 10 }}>
                      <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Plan ekleme */}
                {showPlanForm ? (
                  <View style={styles.planForm}>
                    <TextInput
                      style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                      placeholder="Plan adı *" placeholderTextColor={colors.textSec}
                      value={newPlanName} onChangeText={setNewPlanName}
                    />
                    <TextInput
                      style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                      placeholder="Fiyat *" placeholderTextColor={colors.textSec}
                      value={newPlanPrice} onChangeText={setNewPlanPrice}
                      keyboardType="decimal-pad"
                    />
                    {/* Para Birimi */}
                    <View style={styles.pillRow}>
                      {(['TRY', 'USD', 'EUR'] as const).map(cur => (
                        <TouchableOpacity
                          key={cur}
                          style={[styles.pill, { borderColor: colors.accent, backgroundColor: planCurrency === cur ? colors.accent : 'transparent' }]}
                          onPress={() => setPlanCurrency(cur)}
                        >
                          <Text style={[styles.pillText, { color: planCurrency === cur ? '#fff' : colors.accent }]}>{cur}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {/* Fatura Döngüsü */}
                    <View style={styles.pillRow}>
                      {([30, 365] as const).map(days => (
                        <TouchableOpacity
                          key={days}
                          style={[styles.pill, { borderColor: colors.accent, backgroundColor: planBillingDays === days ? colors.accent : 'transparent' }]}
                          onPress={() => setPlanBillingDays(days)}
                        >
                          <Text style={[styles.pillText, { color: planBillingDays === days ? '#fff' : colors.accent }]}>{days === 30 ? 'Aylık' : 'Yıllık'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.planFormBtns}>
                      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent, flex: 1, opacity: saving ? 0.6 : 1 }]}
                        onPress={() => addPlan(catalog.id)} disabled={saving}>
                        {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Kaydet</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]}
                        onPress={() => { setPlanCatalogId(null); setNewPlanName(''); setNewPlanPrice(''); setPlanCurrency('TRY'); setPlanBillingDays(30); }}>
                        <Text style={[styles.cancelBtnText, { color: colors.textSec }]}>İptal</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addPlanBtn, { borderColor: colors.accent + '60' }]}
                    onPress={() => setPlanCatalogId(catalog.id)}
                  >
                    <Ionicons name="add" size={16} color={colors.accent} />
                    <Text style={[styles.addPlanText, { color: colors.accent }]}>Plan Ekle</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Sekme: Roller ────────────────────────────────────────────────────────────

function RolesTab() {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentAssignments, setRecentAssignments] = useState<string[]>([]);

  const assignRole = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    // E-posta format doğrulaması
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    // Admin yetkisi verilmeden önce onay dialogu
    Alert.alert(
      'Admin Yetkisi Ver',
      `"${trimmed}" kullanıcısına Admin rolü atanacak. Bu işlemi onaylıyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Admin Yap',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await agent.Admin.assignRole(trimmed);
              setRecentAssignments(prev => [trimmed, ...prev.slice(0, 9)]);
              setEmail('');
              Alert.alert('Başarılı', `${trimmed} kullanıcısına Admin rolü atandı.`);
            } catch {}
            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.textSec }]}>ADMIN ROLÜ ATA</Text>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.roleDesc, { color: colors.textSec }]}>
          Bir kullanıcıya Admin rolü atamak için e-posta adresini girin. Kullanıcı giriş yapıp
          profil bilgilerini yenilediğinde admin özellikleri aktif olur.
        </Text>
        <TextInput
          style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border, marginTop: 16 }]}
          placeholder="kullanici@ornek.com"
          placeholderTextColor={colors.textSec}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.accent, opacity: loading || !email.trim() ? 0.6 : 1 }]}
          onPress={assignRole}
          disabled={loading || !email.trim()}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : (
              <>
                <Ionicons name="shield-checkmark-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Admin Yap</Text>
              </>
            )}
        </TouchableOpacity>
      </View>

      {recentAssignments.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSec, marginTop: 20 }]}>BU OTURUMDA ATANANLAR</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {recentAssignments.map((e, i) => (
              <View key={i} style={[styles.recentRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.recentEmail, { color: colors.textMain }]}>{e}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 14,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  tabLabel: { fontSize: 10 },

  // Genel
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabContent: { padding: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },

  // İstatistik
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    width: '47%', borderRadius: 14, padding: 14,
    borderWidth: 1, alignItems: 'center', gap: 6,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  catalogRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 12, fontWeight: '700' },
  catalogName: { flex: 1, fontSize: 14, fontWeight: '600' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 13, fontWeight: '700' },

  // Kullanıcılar
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  totalText: { fontSize: 11, paddingHorizontal: 16, paddingVertical: 6 },
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1, padding: 12, gap: 12,
  },
  userAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  userName: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  adminBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  adminBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  userEmail: { fontSize: 12, marginBottom: 2 },
  userMeta: { fontSize: 11 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14 },

  // Kataloglar
  fabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 14,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  formCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  formTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  formInput: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, marginBottom: 10,
  },
  saveBtn: {
    flexDirection: 'row', borderRadius: 10,
    paddingVertical: 11, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  catalogCard: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  catalogHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  catalogDot: { width: 12, height: 12, borderRadius: 6 },
  catalogCardName: { fontSize: 14, fontWeight: '700' },
  catalogMeta: { fontSize: 12, marginTop: 1 },
  plansWrap: { borderTopWidth: 1, padding: 12 },
  planRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  planName: { flex: 1, fontSize: 13 },
  planPrice: { fontSize: 13, fontWeight: '600' },
  planForm: { marginTop: 10 },
  planFormBtns: { flexDirection: 'row', gap: 8 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 13, fontWeight: '700' },
  addPlanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 8, borderStyle: 'dashed',
    paddingVertical: 8, paddingHorizontal: 12, marginTop: 8,
    alignSelf: 'flex-start',
  },
  addPlanText: { fontSize: 13, fontWeight: '600' },

  // Roller
  roleDesc: { fontSize: 13, lineHeight: 20 },
  recentRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  recentEmail: { fontSize: 13 },
});
