import { create } from 'zustand';
import { NotificationDto } from '../types';
import agent from '../api/agent';
import Toast from 'react-native-toast-message';

interface NotificationStore {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  page: number;
  hasMore: boolean;
  error: string | null;

  fetchNotifications: (reset?: boolean) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  page: 1,
  hasMore: true,
  error: null,

  fetchNotifications: async (reset = false) => {
    const { loading, page, hasMore } = get();
    if (loading || (!reset && !hasMore)) return;

    const currentPage = reset ? 1 : page;
    set({ loading: true });

    try {
      const res = await agent.Notifications.list(currentPage, 20);
      const items: NotificationDto[] = res?.data?.items ?? [];
      const total: number = res?.data?.totalCount ?? 0;

      const existing = reset ? [] : get().notifications;
      const merged = reset ? items : [...existing, ...items];

      set({
        notifications: merged,
        unreadCount: merged.filter(n => !n.isRead).length,
        page: currentPage + 1,
        hasMore: merged.length < total,
        loading: false,
        error: null,
      });
    } catch {
      set({ loading: false, error: 'Bildirimler yuklenemedi.' });
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Bildirimler yuklenemedi.', position: 'bottom' });
    }
  },

  markAsRead: async (id: number) => {
    const previousState = get().notifications;
    try {
      await agent.Notifications.markAsRead(id);
      set((state) => {
        const updated = state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true, readDate: new Date().toISOString() } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.isRead).length,
        };
      });
    } catch {
      set({ notifications: previousState, unreadCount: previousState.filter(n => !n.isRead).length });
      Toast.show({ type: 'error', text1: 'Hata', text2: 'İşlem gerçekleştirilemedi.', position: 'bottom' });
    }
  },

  markAllAsRead: async () => {
    const previousState = get().notifications;
    try {
      await agent.Notifications.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map(n => ({
          ...n,
          isRead: true,
          readDate: n.readDate ?? new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch {
      set({ notifications: previousState, unreadCount: previousState.filter(n => !n.isRead).length });
      Toast.show({ type: 'error', text1: 'Hata', text2: 'İşlem gerçekleştirilemedi.', position: 'bottom' });
    }
  },

  reset: () => set({ notifications: [], unreadCount: 0, loading: false, page: 1, hasMore: true, error: null }),

  deleteNotification: async (id: number) => {
    const previous = get().notifications;
    // Optimistic: hemen state'ten kaldır
    const updated = previous.filter(n => n.id !== id);
    set({ notifications: updated, unreadCount: updated.filter(n => !n.isRead).length });
    try {
      await agent.Notifications.delete(id);
    } catch {
      // API hatası → listeyi geri yükle
      set({ notifications: previous, unreadCount: previous.filter(n => !n.isRead).length });
      Toast.show({ type: 'error', text1: 'Hata', text2: 'İşlem gerçekleştirilemedi.', position: 'bottom' });
    }
  },
}));
