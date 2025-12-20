import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UsageStatus, UserSubscription } from '../types';
import { scheduleSubscriptionNotification, cancelNotification } from '../utils/NotificationManager';
import { convertToTRY } from '../utils/CurrencyService';

interface UserSubscriptionState {
  subscriptions: UserSubscription[];
  addSubscription: (sub: UserSubscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  // YENİ: Güncelleme Fonksiyonu
  updateSubscription: (id: string, updatedData: Partial<UserSubscription>) => Promise<void>;
  getTotalExpense: () => number;
  getNextPayment: () => UserSubscription | null;
  logUsage: (id: string, status: UsageStatus) => void;
  getPendingSurvey: () => UserSubscription | null; // Sıradaki anket sorusu
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
        const subs = get().subscriptions;

        // Hepsini TL'ye çevirip topla
        const total = subs.reduce((sum, sub) => {
          return sum + convertToTRY(sub.price, sub.currency);
        }, 0);

        return total;
      },

      // 1. KULLANIM DURUMUNU KAYDET
      logUsage: (id, status) => {
        const currentMonth = new Date().toISOString().slice(0, 7); // "2023-10"
        
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => {
            if (sub.id !== id) return sub;
            
            // Eski geçmişi al, bu ayın kaydı varsa güncelle, yoksa ekle
            const history = sub.usageHistory || [];
            // Bu ay zaten girilmiş mi?
            const existingIndex = history.findIndex(h => h.month === currentMonth);
            
            let newHistory;
            if (existingIndex >= 0) {
                newHistory = [...history];
                newHistory[existingIndex] = { month: currentMonth, status };
            } else {
                newHistory = [...history, { month: currentMonth, status }];
            }

            return { ...sub, usageHistory: newHistory };
          }),
        }));
      },

      // 2. KONTROL EDİLMEMİŞ ABONELİK BUL (Anket İçin)
      getPendingSurvey: () => {
        const currentMonth = new Date().toISOString().slice(0, 7); // "2023-10"
        const subs = get().subscriptions;

        // Henüz bu ay için log girilmemiş ilk aboneliği döndür
        return subs.find(s => {
            // Yeni eklenenlerin history'si undefined olabilir
            const history = s.usageHistory || [];
            const hasLogThisMonth = history.some(h => h.month === currentMonth);
            return !hasLogThisMonth;
        }) || null;
      },
      
    }),
    {
      name: 'user-subscriptions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }

  )
);