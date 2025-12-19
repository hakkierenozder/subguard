import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSubscription } from '../types';
import { scheduleSubscriptionNotification, cancelNotification } from '../utils/NotificationManager';

interface UserSubscriptionState {
  subscriptions: UserSubscription[];
  addSubscription: (sub: UserSubscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  // YENİ: Güncelleme Fonksiyonu
  updateSubscription: (id: string, updatedData: Partial<UserSubscription>) => Promise<void>;
  getTotalExpense: () => number;
  getNextPayment: () => UserSubscription | null;
}

export const useUserSubscriptionStore = create<UserSubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],

      addSubscription: async (sub) => {
        const notifId = await scheduleSubscriptionNotification(
          "Ödeme Hatırlatıcı",
          `${sub.name} ödemen yaklaştı!`,
          sub.billingDay
        );
        const newSub = { ...sub, notificationId: notifId || undefined };
        set((state) => ({ subscriptions: [...state.subscriptions, newSub] }));
      },

      // YENİ: GÜNCELLEME FONKSİYONU
      updateSubscription: async (id, updatedData) => {
        const oldSub = get().subscriptions.find((s) => s.id === id);
        if (!oldSub) return;

        let newNotifId = oldSub.notificationId;

        // Eğer fatura günü veya ismi değiştiyse, eski bildirimi silip yenisini kuralım
        if (updatedData.billingDay !== undefined || updatedData.name !== undefined) {

          // 1. Eskiyi İptal Et
          if (oldSub.notificationId) {
            await cancelNotification(oldSub.notificationId);
          }

          // 2. Yenisini Kur
          const nameToUse = updatedData.name || oldSub.name;
          const dayToUse = updatedData.billingDay || oldSub.billingDay;

          const result = await scheduleSubscriptionNotification(
            "Ödeme Hatırlatıcı",
            `${nameToUse} ödemen yaklaştı!`,
            dayToUse
          );

          // DÜZELTME BURADA: null gelirse undefined yapıyoruz
          newNotifId = result || undefined;
        }

        // 3. Veriyi Güncelle
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...updatedData, notificationId: newNotifId } : s
          ),
        }));
      },

      removeSubscription: async (id) => {
        const subToRemove = get().subscriptions.find(s => s.id === id);
        if (subToRemove?.notificationId) {
          await cancelNotification(subToRemove.notificationId);
        }
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        }));
      },

      getNextPayment: () => {
        const subs = get().subscriptions;
        if (subs.length === 0) return null;

        const today = new Date();
        const currentDay = today.getDate();

        // Abonelikleri "Kalan Gün"e göre sırala
        const sorted = [...subs].sort((a, b) => {
          // Eğer fatura günü bugünden büyükse (gelecek), farkı al.
          // Eğer küçükse (geçmiş), gelecek aya atacağı için (30 - bugün + fatura günü) gibi düşün.

          const getDaysUntil = (billingDay: number) => {
            if (billingDay >= currentDay) return billingDay - currentDay;
            return 30 - (currentDay - billingDay); // Basit mantık: Gelecek ay
          };

          return getDaysUntil(a.billingDay) - getDaysUntil(b.billingDay);
        });

        // En yakını döndür
        return sorted[0];
      },


      getTotalExpense: () => {
        return get().subscriptions.reduce((total, sub) => total + sub.price, 0);
      },
    }),
    {
      name: 'user-subscriptions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }

  )
);