import { create } from 'zustand';
import { NotificationDto } from '../types';
import agent from '../api/agent';

interface NotificationStore {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  page: number;
  hasMore: boolean;

  fetchNotifications: (reset?: boolean) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  page: 1,
  hasMore: true,

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
      });
    } catch {
      set({ loading: false });
    }
  },

  markAsRead: async (id: number) => {
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
    } catch {}
  },

  markAllAsRead: async () => {
    const unread = get().notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => agent.Notifications.markAsRead(n.id)));
    set((state) => ({
      notifications: state.notifications.map(n => ({
        ...n,
        isRead: true,
        readDate: n.readDate ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id: number) => {
    try {
      await agent.Notifications.delete(id);
      set((state) => {
        const updated = state.notifications.filter(n => n.id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.isRead).length,
        };
      });
    } catch {}
  },
}));
