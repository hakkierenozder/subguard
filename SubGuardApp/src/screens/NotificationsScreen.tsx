import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationDto } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// --- Bildirim ikonu ve rengi belirle ---
// Renk sabitleri — getNotifMeta içinde kullanmak için THEME'den bağımsız sabitler
const NOTIF_COLORS = {
  budget: '#EF4444',
  payment: '#4F46E5',
  shared: '#10B981',
  contract: '#8B5CF6',
  default: '#64748B',
};

function getNotifMeta(item: NotificationDto): { icon: string; colorKey: keyof typeof NOTIF_COLORS } {
  if (item.type === 'Budget' || item.type === 'CategoryBudget') return { icon: 'wallet-outline', colorKey: 'budget' };
  if (item.type === 'Payment')  return { icon: 'card-outline',          colorKey: 'payment' };
  if (item.type === 'Shared')   return { icon: 'people-outline',        colorKey: 'shared' };
  if (item.type === 'Contract') return { icon: 'document-text-outline', colorKey: 'contract' };

  // Fallback: type yoksa (eski kayıtlar) başlıktan tahmin et
  const t = item.title.toLowerCase();
  if (t.includes('bütçe') || t.includes('butce') || t.includes('aşım') || t.includes('asim')) {
    return { icon: 'wallet-outline', colorKey: 'budget' };
  }
  if (t.includes('ödeme') || t.includes('odeme') || t.includes('fatura')) {
    return { icon: 'card-outline', colorKey: 'payment' };
  }
  if (t.includes('paylaş') || t.includes('paylas')) {
    return { icon: 'people-outline', colorKey: 'shared' };
  }
  return { icon: 'notifications-outline', colorKey: 'default' };
}

function getNotifColor(colorKey: keyof typeof NOTIF_COLORS, colors: ReturnType<typeof useThemeColors>): string {
  switch (colorKey) {
    case 'budget': return colors.error;
    case 'payment': return colors.accent;
    case 'shared': return colors.success;
    case 'contract': return colors.purple;
    default: return colors.textSec;
  }
}

// --- Tarih formatla ---
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffH < 24) return `${diffH} sa önce`;
    if (diffD < 7) return `${diffD} gün önce`;

    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

// --- Tek Bildirim Satırı ---
interface NotifItemProps {
  item: NotificationDto;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigateToSub: (subscriptionId: number) => void;
  onNavigateToAnalytics: () => void;
  colors: ReturnType<typeof useThemeColors>;
  isDarkMode: boolean;
}

function NotifItem({ item, onRead, onDelete, onNavigateToSub, onNavigateToAnalytics, colors, isDarkMode }: NotifItemProps) {
  const { icon, colorKey } = getNotifMeta(item);
  const color = getNotifColor(colorKey, colors);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const swipeRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeRef.current?.close();
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onDelete(item.id));
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.swipeDeleteBtn}
      onPress={handleDelete}
      activeOpacity={0.8}
    >
      <Ionicons name="trash-outline" size={22} color="#FFF" />
      <Text style={styles.swipeDeleteText}>Sil</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        rightThreshold={60}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[
            styles.notifCard,
            {
              backgroundColor: item.isRead ? colors.cardBg : (colors.accent + '15'),
              borderColor: colors.border,
            },
          ]}
          onPress={() => {
            if (!item.isRead) onRead(item.id);
            if (item.userSubscriptionId) {
              onNavigateToSub(item.userSubscriptionId);
            } else if (item.type === 'Budget' || item.type === 'CategoryBudget') {
              onNavigateToAnalytics();
            }
          }}
          activeOpacity={0.75}
        >
          {/* Sol: İkon */}
          <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
            <Ionicons name={icon as any} size={22} color={color} />
          </View>

          {/* Orta: İçerik */}
          <View style={styles.notifContent}>
            <View style={styles.notifTitleRow}>
              <Text
                style={[
                  styles.notifTitle,
                  { color: colors.textMain, fontWeight: item.isRead ? '600' : '700' },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {!item.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: color }]} />
              )}
            </View>
            <Text
              style={[styles.notifMessage, { color: colors.textSec }]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <Text style={[styles.notifDate, { color: colors.textSec }]}>
                {formatDate(item.createdDate)}
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 3,
                paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
                backgroundColor: item.isSent ? (colors.success + '18') : (colors.textSec + '18'),
              }}>
                <Ionicons
                  name={item.isSent ? 'checkmark-circle-outline' : 'time-outline'}
                  size={10}
                  color={item.isSent ? colors.success : colors.textSec}
                />
                <Text style={{ fontSize: 10, fontWeight: '600', color: item.isSent ? colors.success : colors.textSec }}>
                  {item.isSent ? 'Gönderildi' : 'Beklemede'}
                </Text>
              </View>
            </View>
          </View>

          {/* Sağ: kaydır ipucu */}
          <Ionicons name="chevron-back-outline" size={14} color={colors.border} style={{ paddingTop: 2 }} />
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

// --- Boş Durum ---
function EmptyState({ colors }: { colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIconCircle, { backgroundColor: colors.inputBg }]}>
        <Ionicons name="notifications-off-outline" size={40} color={colors.textSec} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textMain }]}>Bildirim yok</Text>
      <Text style={[styles.emptyDesc, { color: colors.textSec }]}>
        Ödeme hatırlatmaları ve bütçe uyarıları burada görünecek.
      </Text>
    </View>
  );
}

// --- Ana Ekran ---
export default function NotificationsScreen() {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  // #48: loading store state'inden ayrı refreshing — pull-to-refresh spinner doğru çalışsın.
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Undo snackbar state
  const [deletedItem, setDeletedItem] = useState<NotificationDto | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const snackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleteWithUndo = useCallback((item: NotificationDto) => {
    // Anlık store silme
    deleteNotification(item.id);
    setDeletedItem(item);
    setSnackVisible(true);
    if (snackTimer.current) clearTimeout(snackTimer.current);
    snackTimer.current = setTimeout(() => {
      setSnackVisible(false);
      setDeletedItem(null);
    }, 4000);
  }, [deleteNotification]);

  const handleUndoDelete = useCallback(() => {
    if (snackTimer.current) clearTimeout(snackTimer.current);
    setSnackVisible(false);
    // Listeyi yeniden çek (silinen item zaten API'dan silindi ama optimistic undo için re-fetch en güvenli yol)
    fetchNotifications(true);
    setDeletedItem(null);
  }, [fetchNotifications]);

  // U-3: Tip bazlı filtre
  type NotifFilter = 'All' | 'Payment' | 'Budget' | 'Shared' | 'Contract';
  const [activeFilter, setActiveFilter] = useState<NotifFilter>('All');

  const FILTER_TABS: { key: NotifFilter; label: string; icon: string }[] = [
    { key: 'All',      label: 'Tümü',    icon: 'list-outline' },
    { key: 'Payment',  label: 'Ödeme',   icon: 'card-outline' },
    { key: 'Budget',   label: 'Bütçe',   icon: 'wallet-outline' },
    { key: 'Shared',   label: 'Paylaşım',icon: 'people-outline' },
    { key: 'Contract', label: 'Kontrat', icon: 'document-text-outline' },
  ];

  const filteredNotifications = activeFilter === 'All'
    ? notifications
    : notifications.filter(n =>
        activeFilter === 'Budget'
          ? (n.type === 'Budget' || n.type === 'CategoryBudget')
          : n.type === activeFilter
      );

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNotifications(true);
    setIsRefreshing(false);
  }, []);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading) fetchNotifications(false);
  }, [hasMore, loading]);

  const handleNavigateToSub = useCallback((subscriptionId: number) => {
    navigation.navigate('Main', {
      screen: 'MySubscriptions',
      params: { openSubscriptionId: String(subscriptionId) },
    } as any);
  }, [navigation]);

  const handleNavigateToAnalytics = useCallback(() => {
    navigation.navigate('Main', { screen: 'Analytics' } as any);
  }, [navigation]);

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    Alert.alert('Tümünü Okundu İşaretle', `${unreadCount} bildirimi okundu olarak işaretlemek istiyor musunuz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Evet', onPress: markAllAsRead },
    ]);
  };

  const renderItem = useCallback(
    ({ item }: { item: NotificationDto }) => (
      <NotifItem
        item={item}
        onRead={markAsRead}
        onDelete={(id) => {
          const found = notifications.find(n => n.id === id);
          if (found) handleDeleteWithUndo(found);
          else deleteNotification(id);
        }}
        onNavigateToSub={handleNavigateToSub}
        onNavigateToAnalytics={handleNavigateToAnalytics}
        colors={colors}
        isDarkMode={isDarkMode}
      />
    ),
    [colors, isDarkMode, markAsRead, deleteNotification, handleDeleteWithUndo, handleNavigateToSub, handleNavigateToAnalytics, notifications]
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Bildirimler</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSub}>
                {unreadCount} okunmamış bildirim
              </Text>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={handleMarkAllRead}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done-outline" size={16} color="#FFF" />
              <Text style={styles.markAllText}>Tümünü oku</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* U-3: FİLTRE CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        {FILTER_TABS.map(tab => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isActive ? colors.accent : colors.border,
                backgroundColor: isActive ? colors.accent : colors.cardBg,
              }}
            >
              <Ionicons name={tab.icon as any} size={13} color={isActive ? '#FFF' : colors.textSec} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#FFF' : colors.textSec }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* SKELETON LOADING */}
      {loading && notifications.length === 0 && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          {[1,2,3,4,5].map(i => (
            <View key={i} style={[styles.skeletonItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.skeletonIcon, { backgroundColor: colors.inputBg }]} />
              <View style={{ flex: 1, gap: 8 }}>
                <View style={[styles.skeletonLine, { backgroundColor: colors.inputBg, width: '70%' }]} />
                <View style={[styles.skeletonLine, { backgroundColor: colors.inputBg, width: '90%' }]} />
                <View style={[styles.skeletonLine, { backgroundColor: colors.inputBg, width: '40%' }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* LİSTE */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={!loading ? <EmptyState colors={colors} /> : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing} // #48: ayrı state — bildirimler yüklüyken de spinner çalışır
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      {/* Undo Snackbar */}
      {snackVisible && (
        <Animated.View style={[styles.snackbar, { backgroundColor: colors.cardBg, shadowColor: colors.textMain }]}>
          <Text style={[styles.snackText, { color: colors.textMain }]}>Bildirim silindi</Text>
          <TouchableOpacity onPress={handleUndoDelete} style={[styles.snackBtn, { backgroundColor: colors.accent + '15' }]}>
            <Text style={[styles.snackBtnText, { color: colors.accent }]}>Geri Al</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markAllText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Liste
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // Bildirim kartı
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    marginRight: 8,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  swipeDeleteBtn: {
    backgroundColor: '#EF4444', // kept as literal for StyleSheet (cannot use hook here)
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 18,
    marginLeft: 8,
    gap: 4,
  },
  swipeDeleteText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Footer loader
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // Skeleton
  skeletonItem: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  skeletonIcon: { width: 44, height: 44, borderRadius: 14 },
  skeletonLine: { height: 12, borderRadius: 6 },

  // Snackbar
  snackbar: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  snackText: { fontSize: 14, fontWeight: '600' },
  snackBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  snackBtnText: { fontSize: 14, fontWeight: '700' },

  // Boş durum
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
