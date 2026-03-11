import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../constants/theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationDto } from '../types';

// --- Bildirim ikonu ve rengi belirle ---
function getNotifMeta(title: string): { icon: string; color: string } {
  const t = title.toLowerCase();
  if (t.includes('bütçe') || t.includes('butce') || t.includes('aşım') || t.includes('asim')) {
    return { icon: 'wallet-outline', color: '#EF4444' };
  }
  if (t.includes('ödeme') || t.includes('odeme') || t.includes('fatura')) {
    return { icon: 'card-outline', color: '#4F46E5' };
  }
  if (t.includes('paylaş') || t.includes('paylas')) {
    return { icon: 'people-outline', color: '#10B981' };
  }
  return { icon: 'notifications-outline', color: '#64748B' };
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
  colors: ReturnType<typeof useThemeColors>;
}

function NotifItem({ item, onRead, onDelete, colors }: NotifItemProps) {
  const { icon, color } = getNotifMeta(item.title);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    Alert.alert('Bildirimi Sil', 'Bu bildirimi silmek istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onDelete(item.id));
        },
      },
    ]);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[
          styles.notifCard,
          {
            backgroundColor: item.isRead ? colors.cardBg : (colors.cardBg === '#FFFFFF' ? '#EEF2FF' : '#1E293B'),
            borderColor: colors.border,
          },
        ]}
        onPress={() => !item.isRead && onRead(item.id)}
        activeOpacity={0.75}
      >
        {/* Sol: İkon */}
        <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>

        {/* Orta: İçerik */}
        <View style={styles.notifContent}>
          <View style={styles.notifTitleRow}>
            <Text
              style={[
                styles.notifTitle,
                { color: colors.textMain, fontWeight: item.isRead ? '600' : '800' },
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
          <Text style={[styles.notifDate, { color: colors.textSec }]}>
            {formatDate(item.createdDate)}
          </Text>
        </View>

        {/* Sağ: Sil */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.textSec} />
        </TouchableOpacity>
      </TouchableOpacity>
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

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  const onRefresh = useCallback(() => {
    fetchNotifications(true);
  }, []);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading) fetchNotifications(false);
  }, [hasMore, loading]);

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
        onDelete={deleteNotification}
        colors={colors}
      />
    ),
    [colors, markAsRead, deleteNotification]
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

      {/* LİSTE */}
      <FlatList
        data={notifications}
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
            refreshing={loading && notifications.length === 0}
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
  deleteBtn: {
    paddingTop: 2,
    flexShrink: 0,
  },

  // Footer loader
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

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
