import { create } from 'zustand';
import { UserSubscription, UsageStatus } from '../types';
import agent from '../api/agent'; // Düzelttiğimiz agent dosyası
import { getUserId } from '../utils/AuthManager';
import { convertToTRY } from '../utils/CurrencyService';
import { Alert } from 'react-native';
import { scheduleSubscriptionNotification, cancelNotification } from '../utils/NotificationManager';

interface UserSubscriptionState {
  subscriptions: UserSubscription[];
  loading: boolean;
  
  // Fonksiyonlar
  fetchUserSubscriptions: () => Promise<void>;
  addSubscription: (sub: UserSubscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, updatedData: Partial<UserSubscription>) => Promise<void>;
  
  // Yardımcılar
  logUsage: (id: string, status: UsageStatus) => void;
  getPendingSurvey: () => UserSubscription | null;
  getTotalExpense: () => number;
  getNextPayment: () => UserSubscription | null;
}

export const useUserSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  loading: false,

  // 1. VERİLERİ ÇEK (READ)
  fetchUserSubscriptions: async () => {
    set({ loading: true });
    try {
      const userId = await getUserId();
      // Burada hata alırsan agent.ts dosyan güncellenmemiş demektir!
      const response = await agent.UserSubscriptions.list(userId);
      
      if (response && response.data) {
        const mappedSubs = response.data.map((s: any) => ({
          ...s,
          id: s.id.toString(),
          usageHistory: [] // Backend tarafında henüz yoksa boş
        }));
        set({ subscriptions: mappedSubs, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      set({ loading: false });
    }
  },

  // 2. ABONELİK EKLE (CREATE)
  addSubscription: async (sub) => {
    try {
      const userId = await getUserId();
      
      // Bildirim Planla
      const notifId = await scheduleSubscriptionNotification(
          "Ödeme Hatırlatıcı",
          `${sub.name} ödemen yaklaştı!`,
          sub.billingDay
      );

      const payload = {
        userId: userId,
        catalogId: sub.catalogId,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        billingDay: sub.billingDay,
        category: sub.category,
        hasContract: sub.hasContract,
        contractEndDate: sub.contractEndDate ? sub.contractEndDate : null
      };

      const response = await agent.UserSubscriptions.create(payload);
      
      if (response && response.data) {
        const newSubFromDb = response.data;
        const newSubForState: UserSubscription = {
            ...sub,
            id: newSubFromDb.id.toString(),
            notificationId: notifId || undefined,
            usageHistory: []
        };

        set((state) => ({
          subscriptions: [...state.subscriptions, newSubForState]
        }));
      }
    } catch (error) {
      console.error("Ekleme hatası:", error);
      Alert.alert("Hata", "Kaydedilemedi. Backend çalışıyor mu?");
    }
  },

  // 3. SİL (DELETE)
  removeSubscription: async (id) => {
    try {
      const subToRemove = get().subscriptions.find(s => s.id === id);
      if (subToRemove?.notificationId) {
        await cancelNotification(subToRemove.notificationId);
      }

      const currentList = get().subscriptions;
      set({ subscriptions: currentList.filter(s => s.id !== id) }); // Hızlı sil
      
      await agent.UserSubscriptions.delete(id); // Arkada API'ye at
    } catch (error) {
      console.error("Silme hatası:", error);
      Alert.alert("Hata", "Silinemedi.");
    }
  },

  // 4. GÜNCELLE (UPDATE - Şimdilik Local + Notification)
  updateSubscription: async (id, updatedData) => {
    const oldSub = get().subscriptions.find((s) => s.id === id);
    if (!oldSub) return;

    let newNotifId = oldSub.notificationId;

    if (updatedData.billingDay !== undefined || updatedData.name !== undefined) {
        if (oldSub.notificationId) await cancelNotification(oldSub.notificationId);
        const nameToUse = updatedData.name || oldSub.name;
        const dayToUse = updatedData.billingDay || oldSub.billingDay;
        const result = await scheduleSubscriptionNotification("Ödeme Hatırlatıcı", `${nameToUse} ödemen yaklaştı!`, dayToUse);
        newNotifId = result || undefined;
    }

    set((state) => ({
      subscriptions: state.subscriptions.map((s) => 
        s.id === id ? { ...s, ...updatedData, notificationId: newNotifId } : s
      ),
    }));
  },

  // --- Yardımcılar ---
  logUsage: (id, status) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) => {
        if (sub.id !== id) return sub;
        const history = sub.usageHistory || [];
        const existingIndex = history.findIndex(h => h.month === currentMonth);
        let newHistory = existingIndex >= 0 
            ? [...history] 
            : [...history, { month: currentMonth, status }];
        
        if (existingIndex >= 0) newHistory[existingIndex] = { month: currentMonth, status };
        
        return { ...sub, usageHistory: newHistory };
      }),
    }));
  },

  getPendingSurvey: () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const subs = get().subscriptions;
    return subs.find(s => {
        const history = s.usageHistory || [];
        return !history.some(h => h.month === currentMonth);
    }) || null;
  },

  getTotalExpense: () => {
    const subs = get().subscriptions;
    return subs.reduce((sum, sub) => sum + convertToTRY(sub.price, sub.currency), 0);
  },

  getNextPayment: () => {
    const subs = get().subscriptions;
    if (subs.length === 0) return null;
    const today = new Date().getDate();
    const sorted = [...subs].sort((a, b) => {
        const dayA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
        const dayB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
        return dayA - dayB;
    });
    return sorted[0];
  }
}));