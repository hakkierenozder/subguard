import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import agent from '../api/agent';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  subscriptionCount: number;
  createdDate?: string;
}

interface CatalogPlan {
  id: number;
  name: string;
  price: number;
  currency: string;
  billingCycleDays: number;
}

interface CatalogItem {
  id: number;
  name: string;
  logoUrl?: string;
  category?: string;
  colorCode?: string;
  plans?: CatalogPlan[];
}

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  catalogsWithSubscriptionsCount: number;
  totalCatalogs?: number;
  topCatalogs: { name: string; logoUrl?: string; count: number }[];
  allCatalogStats?: { name: string; logoUrl?: string; category?: string; count: number }[];
  categoryDistribution?: { category: string; catalogCount: number; subscriptionCount: number }[];
}

interface PagedPayload<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

type TabKey = 'stats' | 'users' | 'catalogs' | 'roles';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'stats', label: 'Istatistik', icon: 'bar-chart-outline' },
  { key: 'users', label: 'Kullanicilar', icon: 'people-outline' },
  { key: 'catalogs', label: 'Kataloglar', icon: 'grid-outline' },
  { key: 'roles', label: 'Roller', icon: 'shield-outline' },
];

const extractPayload = <T,>(response: any): T => (response?.data ?? response) as T;

const getErrorMessage = (error: any, fallback = 'Sunucu hatasi.') => {
  const raw =
    error?.response?.data?.errors?.[0] ??
    error?.response?.data?.message ??
    error?.message;

  if (typeof raw === 'string' && raw.trim()) return raw;
  return fallback;
};

const formatDate = (value?: string) => {
  if (!value) return 'Bilinmiyor';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Bilinmiyor';
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getPlanCycleLabel = (billingCycleDays: number) =>
  billingCycleDays >= 365 ? 'Yillik' : 'Aylik';

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  bg: string;
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon as never} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.textMain }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSec }]}>{label}</Text>
    </View>
  );
}

function AccessDeniedState({ onClose }: { onClose: () => void }) {
  const colors = useThemeColors();

  return (
    <View style={styles.centered}>
      <View style={[styles.deniedIcon, { backgroundColor: colors.error + '18' }]}>
        <Ionicons name="lock-closed-outline" size={30} color={colors.error} />
      </View>
      <Text style={[styles.deniedTitle, { color: colors.textMain }]}>Bu alana erisim yok</Text>
      <Text style={[styles.deniedText, { color: colors.textSec }]}>
        Admin yetkiniz yoksa bu panel acilmaz. Yetkinizin kaldirildigini dusunuyorsaniz yeniden giris yapin.
      </Text>
      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.accent }]} onPress={onClose}>
        <Text style={styles.primaryBtnText}>Geri Don</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AdminPanelScreen() {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const isAdmin = useSettingsStore((state) => state.isAdmin);
  const [activeTab, setActiveTab] = useState<TabKey>('stats');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-down" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="shield-checkmark" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Admin Paneli</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {!isAdmin ? (
        <AccessDeniedState onClose={() => navigation.goBack()} />
      ) : (
        <>
          <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabItem, active && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Ionicons
                    name={tab.icon as never}
                    size={16}
                    color={active ? colors.accent : colors.textSec}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? colors.accent : colors.textSec, fontWeight: active ? '700' : '500' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'catalogs' && <CatalogsTab />}
          {activeTab === 'roles' && <RolesTab />}
        </>
      )}
    </SafeAreaView>
  );
}

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
      const payload = extractPayload<AdminStats>(await agent.Admin.getStats());
      setStats(payload);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
        <Text style={[styles.emptyText, { color: colors.textSec }]}>{error}</Text>
        <TouchableOpacity onPress={() => void load()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load(true);
          }}
          tintColor={colors.accent}
        />
      }
    >
      <View style={styles.statsGrid}>
        <StatCard icon="people" label="KULLANICI" value={stats?.totalUsers ?? 0} color={colors.accent} bg={colors.accent + '18'} />
        <StatCard
          icon="checkmark-circle"
          label="STATU AKTIF ABONELIK"
          value={stats?.activeSubscriptions ?? 0}
          color={colors.success}
          bg={colors.success + '18'}
        />
        <StatCard
          icon="card"
          label="TOPLAM ABONELIK"
          value={stats?.totalSubscriptions ?? 0}
          color={colors.orange}
          bg={colors.orange + '18'}
        />
        <StatCard
          icon="grid"
          label="ABONELIGI OLAN KATALOG"
          value={stats?.catalogsWithSubscriptionsCount ?? 0}
          color={colors.purple}
          bg={colors.purple + '18'}
        />
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.textSec }]}>
          Populer kataloglar ve kategori dagilimi tum silinmemis abonelik kayitlari uzerinden hesaplanir.
        </Text>
      </View>

      {(stats?.topCatalogs?.length ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSec }]}>EN POPULER KATALOGLAR</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {stats!.topCatalogs.map((catalog, index) => (
              <View
                key={`${catalog.name}-${index}`}
                style={[
                  styles.catalogRow,
                  index < stats!.topCatalogs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.rankBadge, { backgroundColor: colors.inputBg }]}>
                  <Text style={[styles.rankText, { color: colors.accent }]}>#{index + 1}</Text>
                </View>
                <Text style={[styles.catalogName, { color: colors.textMain }]}>{catalog.name}</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.countText, { color: colors.accent }]}>{catalog.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textSec }]}>KATALOG OZETI</Text>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textMain }]}>Toplam katalog sayisi</Text>
          <Text style={[styles.summaryValue, { color: colors.accent }]}>{stats?.totalCatalogs ?? 0}</Text>
        </View>
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMain }]}>Aboneligi olan katalog sayisi</Text>
          <Text style={[styles.summaryValue, { color: colors.accent }]}>{stats?.catalogsWithSubscriptionsCount ?? 0}</Text>
        </View>
      </View>

      {(stats?.categoryDistribution?.length ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSec }]}>KATEGORI DAGILIMI</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {stats!.categoryDistribution!.map((category, index) => {
              const maxCount = stats!.categoryDistribution?.[0]?.subscriptionCount || 1;
              const percentage = Math.round((category.subscriptionCount / maxCount) * 100);
              const palette = ['#6366F1', '#10B981', '#F97316', '#8B5CF6', '#EF4444', '#3B82F6'];
              const color = palette[index % palette.length];

              return (
                <View
                  key={category.category}
                  style={[styles.categoryRow, index < stats!.categoryDistribution!.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                >
                  <View style={styles.categoryRowHead}>
                    <Text style={[styles.categoryName, { color: colors.textMain }]}>{category.category}</Text>
                    <Text style={[styles.categoryMeta, { color }]}>
                      {category.catalogCount} katalog - {category.subscriptionCount} abonelik
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.inputBg }]}>
                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {(stats?.allCatalogStats?.length ?? 0) > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSec }]}>TUM KATALOG SIRALAMASI</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {stats!.allCatalogStats!.map((catalog, index) => (
              <View
                key={`${catalog.name}-${index}`}
                style={[
                  styles.catalogRow,
                  index < stats!.allCatalogStats!.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.rankBadge, { backgroundColor: colors.inputBg }]}>
                  <Text style={[styles.rankText, { color: colors.accent }]}>#{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catalogName, { color: colors.textMain }]}>{catalog.name}</Text>
                  {!!catalog.category && <Text style={[styles.catalogSubMeta, { color: colors.textSec }]}>{catalog.category}</Text>}
                </View>
                <View style={[styles.countBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.countText, { color: colors.accent }]}>{catalog.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

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
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async (query: string, nextPage: number, append = false, silent = false) => {
    if (!append && !silent) setLoading(true);
    if (append) setLoadingMore(true);
    setError(null);

    try {
      const payload = extractPayload<PagedPayload<AdminUser>>(await agent.Admin.getUsers(query, nextPage, 20));
      setTotal(payload.totalCount ?? 0);
      setUsers((prev) => (append ? [...prev, ...payload.items] : payload.items));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers('', 1);
  }, [loadUsers]);

  const onSearch = (text: string) => {
    setSearch(text);
    setPage(1);
    void loadUsers(text, 1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    void loadUsers(search, 1, false, true);
  };

  const onEndReached = () => {
    if (loadingMore || users.length >= total) return;
    const nextPage = page + 1;
    setPage(nextPage);
    void loadUsers(search, nextPage, true);
  };

  const showUserDetail = async (user: AdminUser) => {
    try {
      const payload = extractPayload<AdminUser>(await agent.Admin.getUser(user.id));
      Alert.alert(
        'Kullanici Detayi',
        [
          `E-posta: ${payload.email}`,
          `Ad Soyad: ${payload.fullName || '-'}`,
          `Durum: ${payload.isActive ? 'Aktif' : 'Askiya alinmis'}`,
          `Rol: ${payload.isAdmin ? 'Admin' : 'Standart kullanici'}`,
          `Abonelik: ${payload.subscriptionCount}`,
          `Kayit Tarihi: ${formatDate(payload.createdDate)}`,
        ].join('\n'),
      );
    } catch (e) {
      Alert.alert('Hata', getErrorMessage(e, 'Kullanici detayi yuklenemedi.'));
    }
  };

  const toggleActive = (user: AdminUser) => {
    const title = user.isActive ? 'Kullaniciyi Askiya Al' : 'Kullaniciyi Aktif Et';
    const message = user.isActive
      ? `${user.email} icin mevcut oturumlar sonlandirilacak ve yeni giris engellenecek.`
      : `${user.email} tekrar giris yapabilir hale gelecek.`;

    Alert.alert(title, message, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: user.isActive ? 'Askiya Al' : 'Aktif Et',
        style: user.isActive ? 'destructive' : 'default',
        onPress: async () => {
          setActionUserId(user.id);
          try {
            if (user.isActive) {
              await agent.Admin.deactivate(user.id);
            } else {
              await agent.Admin.activate(user.id);
            }

            setUsers((prev) =>
              prev.map((item) => (item.id === user.id ? { ...item, isActive: !item.isActive } : item)),
            );
          } catch (e) {
            Alert.alert('Islem Tamamlanamadi', getErrorMessage(e));
          } finally {
            setActionUserId(null);
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <TouchableOpacity
      style={[styles.userRow, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      onPress={() => void showUserDetail(item)}
      activeOpacity={0.82}
    >
      <View style={[styles.userAvatar, { backgroundColor: item.isActive ? colors.accent + '20' : colors.border }]}>
        <Text style={[styles.userAvatarText, { color: item.isActive ? colors.accent : colors.textSec }]}>
          {(item.fullName || item.email)[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={[styles.userName, { color: colors.textMain }]} numberOfLines={1}>
            {item.fullName || '-'}
          </Text>
          {item.isAdmin && (
            <View style={[styles.adminBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        <Text style={[styles.userEmail, { color: colors.textSec }]} numberOfLines={1}>
          {item.email}
        </Text>
        <Text style={[styles.userMeta, { color: colors.textSec }]}>
          {item.subscriptionCount} abonelik - {item.isActive ? 'Aktif' : 'Askiya alinmis'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.userActionBtn,
          {
            borderColor: item.isActive ? colors.error + '50' : colors.success + '50',
            backgroundColor: item.isActive ? colors.error + '10' : colors.success + '10',
          },
        ]}
        onPress={() => toggleActive(item)}
        disabled={actionUserId === item.id}
      >
        {actionUserId === item.id ? (
          <ActivityIndicator size="small" color={item.isActive ? colors.error : colors.success} />
        ) : (
          <Text style={[styles.userActionText, { color: item.isActive ? colors.error : colors.success }]}>
            {item.isActive ? 'Askiya Al' : 'Aktif Et'}
          </Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
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

      <Text style={[styles.totalText, { color: colors.textSec }]}>
        {total} kullanici - Karti ac: detay - Sag buton: aktif / askiya al
      </Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={[styles.emptyText, { color: colors.textSec }]}>{error}</Text>
          <TouchableOpacity onPress={() => void loadUsers(search, 1)} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
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
              <Text style={[styles.emptyText, { color: colors.textSec }]}>Kullanici bulunamadi</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function CatalogsTab() {
  const colors = useThemeColors();
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [showCatalogForm, setShowCatalogForm] = useState(false);
  const [editingCatalogId, setEditingCatalogId] = useState<number | null>(null);
  const [catalogName, setCatalogName] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('');
  const [catalogLogo, setCatalogLogo] = useState('');
  const [catalogColor, setCatalogColor] = useState('#4F46E5');
  const [savingCatalog, setSavingCatalog] = useState(false);

  const [planCatalogId, setPlanCatalogId] = useState<number | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planCurrency, setPlanCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY');
  const [planBillingDays, setPlanBillingDays] = useState<30 | 365>(30);
  const [savingPlan, setSavingPlan] = useState(false);

  const resetCatalogForm = () => {
    setEditingCatalogId(null);
    setCatalogName('');
    setCatalogCategory('');
    setCatalogLogo('');
    setCatalogColor('#4F46E5');
  };

  const resetPlanForm = () => {
    setPlanCatalogId(null);
    setEditingPlanId(null);
    setPlanName('');
    setPlanPrice('');
    setPlanCurrency('TRY');
    setPlanBillingDays(30);
  };

  const loadCatalogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError(null);

    try {
      const allItems: CatalogItem[] = [];
      let nextPage = 1;
      let totalPages = 1;

      do {
        const payload = extractPayload<PagedPayload<CatalogItem>>(await agent.Catalogs.list(nextPage, 100));
        allItems.push(...(payload.items ?? []));

        const pageSize = payload.pageSize || 100;
        totalPages = payload.totalPages ?? Math.max(1, Math.ceil((payload.totalCount || 0) / pageSize));
        nextPage += 1;
      } while (nextPage <= totalPages);

      setCatalogs(allItems);
    } catch (e) {
      setLoadError(getErrorMessage(e, 'Kataloglar yuklenemedi.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  const saveCatalog = async () => {
    const trimmedName = catalogName.trim();
    if (!trimmedName) {
      Alert.alert('Eksik Bilgi', 'Katalog adi zorunludur.');
      return;
    }

    const dto = {
      name: trimmedName,
      category: catalogCategory.trim() || 'Diger',
      logoUrl: catalogLogo.trim() || null,
      colorCode: catalogColor.trim() || '#4F46E5',
    };

    setSavingCatalog(true);
    try {
      if (editingCatalogId) {
        await agent.Admin.updateCatalog(editingCatalogId, dto);
      } else {
        await agent.Admin.createCatalog(dto);
      }

      resetCatalogForm();
      setShowCatalogForm(false);
      await loadCatalogs(true);
    } catch (e) {
      Alert.alert('Islem Tamamlanamadi', getErrorMessage(e));
    } finally {
      setSavingCatalog(false);
    }
  };

  const startCatalogEdit = (catalog: CatalogItem) => {
    setEditingCatalogId(catalog.id);
    setCatalogName(catalog.name);
    setCatalogCategory(catalog.category ?? '');
    setCatalogLogo(catalog.logoUrl ?? '');
    setCatalogColor(catalog.colorCode ?? '#4F46E5');
    setShowCatalogForm(true);
  };

  const deleteCatalog = (catalog: CatalogItem) => {
    Alert.alert('Katalogu Sil', `"${catalog.name}" silinecek. Bu islem planlari da etkiler.`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await agent.Admin.deleteCatalog(catalog.id);
            if (expandedId === catalog.id) setExpandedId(null);
            await loadCatalogs(true);
          } catch (e) {
            Alert.alert('Islem Tamamlanamadi', getErrorMessage(e));
          }
        },
      },
    ]);
  };

  const openPlanEditor = (catalogId: number, plan?: CatalogPlan) => {
    setPlanCatalogId(catalogId);
    setEditingPlanId(plan?.id ?? null);
    setPlanName(plan?.name ?? '');
    setPlanPrice(plan ? String(plan.price) : '');
    setPlanCurrency((plan?.currency as 'TRY' | 'USD' | 'EUR') ?? 'TRY');
    setPlanBillingDays(plan?.billingCycleDays === 365 ? 365 : 30);
  };

  const savePlan = async (catalogId: number) => {
    const trimmedName = planName.trim();
    const normalizedPrice = parseFloat(planPrice.replace(',', '.'));

    if (!trimmedName || Number.isNaN(normalizedPrice) || normalizedPrice <= 0) {
      Alert.alert('Eksik Bilgi', 'Plan adi ve gecerli fiyat zorunludur.');
      return;
    }

    const dto = {
      name: trimmedName,
      price: normalizedPrice,
      currency: planCurrency,
      billingCycleDays: planBillingDays,
    };

    setSavingPlan(true);
    try {
      if (editingPlanId) {
        await agent.Admin.updatePlan(editingPlanId, dto);
      } else {
        await agent.Admin.createPlan(catalogId, dto);
      }

      resetPlanForm();
      await loadCatalogs(true);
    } catch (e) {
      Alert.alert('Islem Tamamlanamadi', getErrorMessage(e));
    } finally {
      setSavingPlan(false);
    }
  };

  const deletePlan = (catalogId: number, plan: CatalogPlan) => {
    Alert.alert('Plani Sil', `"${plan.name}" silinecek.`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await agent.Admin.deletePlan(plan.id);
            if (planCatalogId === catalogId && editingPlanId === plan.id) resetPlanForm();
            await loadCatalogs(true);
          } catch (e) {
            Alert.alert('Islem Tamamlanamadi', getErrorMessage(e));
          }
        },
      },
    ]);
  };

  const renderCatalogItem = ({ item }: { item: CatalogItem }) => {
    const expanded = expandedId === item.id;
    const showPlanForm = planCatalogId === item.id;

    return (
      <View style={[styles.catalogCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.catalogHeader} onPress={() => setExpandedId(expanded ? null : item.id)} activeOpacity={0.8}>
          <View style={[styles.catalogDot, { backgroundColor: item.colorCode ?? colors.accent }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.catalogCardName, { color: colors.textMain }]}>{item.name}</Text>
            <Text style={[styles.catalogMeta, { color: colors.textSec }]}>
              {(item.category || 'Diger') + ' - ' + ((item.plans?.length ?? 0) + ' plan')}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconOnlyBtn} onPress={() => startCatalogEdit(item)}>
            <Ionicons name="create-outline" size={18} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconOnlyBtn} onPress={() => deleteCatalog(item)}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSec} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {expanded && (
          <View style={[styles.plansWrap, { borderTopColor: colors.border }]}>
            {(item.plans ?? []).map((plan, index) => (
              <View
                key={plan.id}
                style={[styles.planRow, index < (item.plans ?? []).length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planName, { color: colors.textMain }]}>{plan.name}</Text>
                  <Text style={[styles.planMeta, { color: colors.textSec }]}>
                    {plan.price} {plan.currency} - {getPlanCycleLabel(plan.billingCycleDays)}
                  </Text>
                </View>
                <TouchableOpacity style={styles.iconOnlyBtn} onPress={() => openPlanEditor(item.id, plan)}>
                  <Ionicons name="create-outline" size={18} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconOnlyBtn} onPress={() => deletePlan(item.id, plan)}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}

            {showPlanForm ? (
              <View style={styles.planForm}>
                <Text style={[styles.formTitle, { color: colors.textMain }]}>{editingPlanId ? 'Plani Duzenle' : 'Yeni Plan'}</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  placeholder="Plan adi *"
                  placeholderTextColor={colors.textSec}
                  value={planName}
                  onChangeText={setPlanName}
                />
                <TextInput
                  style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  placeholder="Fiyat *"
                  placeholderTextColor={colors.textSec}
                  value={planPrice}
                  onChangeText={setPlanPrice}
                  keyboardType="decimal-pad"
                />
                <View style={styles.pillRow}>
                  {(['TRY', 'USD', 'EUR'] as const).map((currency) => (
                    <TouchableOpacity
                      key={currency}
                      style={[styles.pill, { borderColor: colors.accent, backgroundColor: planCurrency === currency ? colors.accent : 'transparent' }]}
                      onPress={() => setPlanCurrency(currency)}
                    >
                      <Text style={[styles.pillText, { color: planCurrency === currency ? '#fff' : colors.accent }]}>{currency}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.pillRow}>
                  {([30, 365] as const).map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[styles.pill, { borderColor: colors.accent, backgroundColor: planBillingDays === days ? colors.accent : 'transparent' }]}
                      onPress={() => setPlanBillingDays(days)}
                    >
                      <Text style={[styles.pillText, { color: planBillingDays === days ? '#fff' : colors.accent }]}>{days === 30 ? 'Aylik' : 'Yillik'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.planFormBtns}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.accent, flex: 1, opacity: savingPlan ? 0.6 : 1 }]}
                    onPress={() => void savePlan(item.id)}
                    disabled={savingPlan}
                  >
                    {savingPlan ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryBtnText}>{editingPlanId ? 'Guncelle' : 'Kaydet'}</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={resetPlanForm}>
                    <Text style={[styles.secondaryBtnText, { color: colors.textSec }]}>Iptal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={[styles.addPlanBtn, { borderColor: colors.accent + '60' }]} onPress={() => openPlanEditor(item.id)}>
                <Ionicons name="add" size={16} color={colors.accent} />
                <Text style={[styles.addPlanText, { color: colors.accent }]}>Plan Ekle</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
        <Text style={[styles.emptyText, { color: colors.textSec }]}>{loadError}</Text>
        <TouchableOpacity onPress={() => void loadCatalogs()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={catalogs}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderCatalogItem}
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadCatalogs(true); }} tintColor={colors.accent} />}
      ListHeaderComponent={
        <>
          <TouchableOpacity
            style={[styles.fabBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              if (!showCatalogForm) resetCatalogForm();
              setShowCatalogForm((prev) => !prev);
            }}
          >
            <Ionicons name={showCatalogForm ? 'close' : 'add'} size={18} color="#fff" />
            <Text style={styles.fabText}>{showCatalogForm ? 'Formu Kapat' : 'Yeni Katalog'}</Text>
          </TouchableOpacity>

          {showCatalogForm && (
            <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.formTitle, { color: colors.textMain }]}>{editingCatalogId ? 'Katalogu Duzenle' : 'Yeni Katalog'}</Text>
              <TextInput
                style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                placeholder="Katalog adi *"
                placeholderTextColor={colors.textSec}
                value={catalogName}
                onChangeText={setCatalogName}
              />
              <TextInput
                style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                placeholder="Kategori"
                placeholderTextColor={colors.textSec}
                value={catalogCategory}
                onChangeText={setCatalogCategory}
              />
              <TextInput
                style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                placeholder="Logo URL"
                placeholderTextColor={colors.textSec}
                value={catalogLogo}
                onChangeText={setCatalogLogo}
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.formInput, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                placeholder="Renk kodu (#4F46E5)"
                placeholderTextColor={colors.textSec}
                value={catalogColor}
                onChangeText={setCatalogColor}
                autoCapitalize="none"
              />
              <View style={styles.planFormBtns}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.accent, flex: 1, opacity: savingCatalog ? 0.6 : 1 }]}
                  onPress={() => void saveCatalog()}
                  disabled={savingCatalog}
                >
                  {savingCatalog ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryBtnText}>{editingCatalogId ? 'Guncelle' : 'Kaydet'}</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryBtn, { borderColor: colors.border }]}
                  onPress={() => {
                    resetCatalogForm();
                    setShowCatalogForm(false);
                  }}
                >
                  <Text style={[styles.secondaryBtnText, { color: colors.textSec }]}>Iptal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Ionicons name="layers-outline" size={18} color={colors.accent} />
            <Text style={[styles.infoText, { color: colors.textSec }]}>
              Tum kataloglar sayfali olarak cekilir. Boylece 100+ katalogta da eksik veriyle yonetim yapilmaz.
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Ionicons name="grid-outline" size={48} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSec }]}>Katalog bulunamadi</Text>
        </View>
      }
    />
  );
}

function RolesTab() {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoadingAdmins(true);

    try {
      const admins: AdminUser[] = [];
      let nextPage = 1;
      let totalPages = 1;

      do {
        const payload = extractPayload<PagedPayload<AdminUser>>(await agent.Admin.getUsers('', nextPage, 100, true));
        admins.push(...(payload.items ?? []));

        const pageSize = payload.pageSize || 100;
        totalPages = payload.totalPages ?? Math.max(1, Math.ceil((payload.totalCount || 0) / pageSize));
        nextPage += 1;
      } while (nextPage <= totalPages);

      setAdminUsers(admins);
    } catch (e) {
      Alert.alert('Hata', getErrorMessage(e, 'Admin listesi yuklenemedi.'));
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const assignRole = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      Alert.alert('Gecersiz E-posta', 'Lutfen gecerli bir e-posta adresi girin.');
      return;
    }

    Alert.alert('Admin Yetkisi Ver', `"${trimmed}" kullanicisina admin rolu atanacak.`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Admin Yap',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await agent.Admin.assignRole(trimmed);
            setEmail('');
            await loadAdmins();
            Alert.alert('Basarili', `${trimmed} icin admin yetkisi tanimlandi.`);
          } catch (e) {
            Alert.alert('Islem Tamamlanamadi', getErrorMessage(e));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const removeRole = (target: AdminUser) => {
    Alert.alert('Admin Yetkisini Kaldir', `${target.email} kullanicisindan admin rolu alinacak.`, [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Kaldir',
        style: 'destructive',
        onPress: async () => {
          setRemovingEmail(target.email);
          try {
            await agent.Admin.removeRole(target.email);
            await loadAdmins();
          } catch (e) {
            Alert.alert('Islem Tamamlanamadi', getErrorMessage(e));
          } finally {
            setRemovingEmail(null);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.textSec }]}>ADMIN ROLU ATA</Text>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.roleDesc, { color: colors.textSec }]}>
          Yetki atamasi yapildiktan sonra kullanici yeni token aldiginda admin ozellikleri aktif olur.
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
          style={[styles.primaryBtn, { backgroundColor: colors.accent, opacity: loading || !email.trim() ? 0.6 : 1 }]}
          onPress={() => void assignRole()}
          disabled={loading || !email.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="shield-checkmark-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnText}>Admin Yap</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSec, marginTop: 8 }]}>MEVCUT ADMINLER</Text>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        {loadingAdmins ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : adminUsers.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="shield-outline" size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSec }]}>Admin kullanici bulunamadi</Text>
          </View>
        ) : (
          adminUsers.map((user, index) => (
            <View key={user.id} style={[styles.roleRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: colors.textMain }]}>{user.fullName || '-'}</Text>
                <Text style={[styles.userEmail, { color: colors.textSec }]}>{user.email}</Text>
              </View>
              <TouchableOpacity
                style={[styles.roleRemoveBtn, { borderColor: colors.error + '40', backgroundColor: colors.error + '10' }]}
                onPress={() => removeRole(user)}
                disabled={removingEmail === user.email}
              >
                {removingEmail === user.email ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <Text style={[styles.roleRemoveText, { color: colors.error }]}>Yetkiyi Kaldir</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  deniedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  deniedText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 320,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  statCard: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  catalogName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  catalogSubMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryRowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  totalText: {
    fontSize: 11,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 6,
    flexShrink: 1,
  },
  userEmail: {
    fontSize: 12,
  },
  userMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  adminBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  userActionBtn: {
    minWidth: 88,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  fabText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  catalogCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  catalogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  catalogDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  catalogCardName: {
    fontSize: 15,
    fontWeight: '700',
  },
  catalogMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  iconOnlyBtn: {
    paddingLeft: 12,
    paddingVertical: 2,
  },
  plansWrap: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
  },
  planMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  planForm: {
    paddingTop: 12,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  planFormBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addPlanBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addPlanText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  secondaryBtn: {
    marginLeft: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roleDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  roleRemoveBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleRemoveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
