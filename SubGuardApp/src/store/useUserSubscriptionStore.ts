import { create } from 'zustand';
import { UserSubscription, UsageStatus } from '../types';
import agent from '../api/agent';
import { getUserId } from '../utils/AuthManager';
import { convertToTRY } from '../utils/CurrencyService';
import { Alert } from 'react-native';
import { scheduleSubscriptionNotification, cancelNotification, syncLocalNotifications } from '../utils/NotificationManager';

interface UserSubscriptionState {
  subscriptions: UserSubscription[];
  loading: boolean;
  exchangeRates: Record<string, number>; // YENİ: Kurları tutacak

  fetchUserSubscriptions: () => Promise<void>;
  addSubscription: (sub: UserSubscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, updatedData: Partial<UserSubscription>) => Promise<void>;

  logUsage: (id: string, status: UsageStatus) => void;
  getPendingSurvey: () => UserSubscription | null;
  getTotalExpense: () => number;
  getNextPayment: () => UserSubscription | null;
  fetchExchangeRates: () => Promise<void>; // YENİ: Kurları çekecek
}

// Güvenli JSON Parse Yardımcısı
const safeJsonParse = (jsonString: string | null | undefined, fallback: any) => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
};

export const useUserSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  loading: false,

  exchangeRates: {
      USD: 34.50,
      EUR: 37.20,
      GBP: 43.10,
      TRY: 1.0
  },

  // 1. VERİLERİ ÇEK (Güvenli Mod)
  fetchUserSubscriptions: async () => {
    set({ loading: true });
    try {
      const response = await agent.UserSubscriptions.list();
      if (response && response.data) {
        const formattedData = response.data.map((item: any) => ({
          ...item,
          id: item.id.toString(),
          contractStartDate: item.contractStartDate,
          contractEndDate: item.contractEndDate,
          sharedWith: safeJsonParse(item.sharedWithJson, []),
          usageHistory: safeJsonParse(item.usageHistoryJson, [])
        }));
        set({ subscriptions: formattedData });
      }
    } catch (error) {
      console.error('Abonelikler çekilemedi:', error);
    } finally {
      set({ loading: false });
    }
  },

  // YENİ FONKSİYON
  fetchExchangeRates: async () => {
      try {
          const response = await agent.Currencies.list();
          if (response && response.data) {
              set(state => ({
                  exchangeRates: { ...state.exchangeRates, ...response.data, TRY: 1.0 }
              }));
          }
      } catch (error) {
          console.error("Kurlar çekilemedi, varsayılanlar kullanılacak.", error);
      }
  },

  // 2. ABONELİK EKLE
  addSubscription: async (newSub) => {
  try {
    const currentUserId = await getUserId();

    // Backend'e gidecek veri
    const payload = {
      userId: currentUserId,
      catalogId: newSub.catalogId,
      name: newSub.name,
      price: newSub.price,
      currency: newSub.currency,
      billingDay: newSub.billingDay,
      category: newSub.category,
      colorCode: newSub.colorCode,
      hasContract: newSub.hasContract,
      
      // Tarih alanlarını düzgün formatlayarak gönder
      contractStartDate: newSub.contractStartDate 
        ? new Date(newSub.contractStartDate).toISOString() 
        : null,
      contractEndDate: newSub.contractEndDate 
        ? new Date(newSub.contractEndDate).toISOString() 
        : null,
      
      isActive: true,
      sharedWithJson: newSub.sharedWith ? JSON.stringify(newSub.sharedWith) : null
    };

    console.log('Payload gönderildi:', payload); // DEBUG için ekle
    const response = await agent.UserSubscriptions.create(payload);

      if (response && response.data) {
        const createdSub = {
          ...response.data,
          id: response.data.id.toString(),
          sharedWith: safeJsonParse(response.data.sharedWithJson, [])
        };
        set((state) => ({ subscriptions: [...state.subscriptions, createdSub] }));
      }
    } catch (error) {
      console.error("Ekleme hatası:", error);
      throw error;
    }
  },

  // 3. SİL
  removeSubscription: async (id) => {
    try {
      const subToRemove = get().subscriptions.find(s => s.id === id);
      if (subToRemove?.notificationId) {
        await cancelNotification(subToRemove.notificationId);
      }

      const currentList = get().subscriptions;
      set({ subscriptions: currentList.filter(s => s.id !== id) });

      await agent.UserSubscriptions.delete(id);
    } catch (error) {
      console.error("Silme hatası:", error);
      Alert.alert("Hata", "Silinemedi.");
    }
  },

  // 4. GÜNCELLE
  updateSubscription: async (id, updatedData) => {
    const oldSub = get().subscriptions.find((s) => s.id === id);
    if (!oldSub) return;

    // Optimistic Update (Arayüzde hemen güncelle)
    const newSub = { ...oldSub, ...updatedData };
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? newSub : s
      ),
    }));

    try {
      const currentUserId = await getUserId();

      const payload = {
        id: Number(newSub.id), // <--- ID'yi backend için Number'a çeviriyoruz
        userId: currentUserId,
        catalogId: newSub.catalogId,
        name: newSub.name,
        price: newSub.price,
        currency: newSub.currency,
        billingDay: newSub.billingDay,
        category: newSub.category,
        colorCode: newSub.colorCode,
        hasContract: newSub.hasContract,
        contractStartDate: newSub.contractStartDate ? newSub.contractStartDate : null,

        contractEndDate: newSub.contractEndDate ? newSub.contractEndDate : null,

        // Pasiflik durumu korunmalı veya güncellenmeli
        isActive: newSub.isActive !== undefined ? newSub.isActive : true,

        sharedWithJson: newSub.sharedWith ? JSON.stringify(newSub.sharedWith) : null,
        usageHistoryJson: newSub.usageHistory ? JSON.stringify(newSub.usageHistory) : null
      };

      // Backend güncellemesi
      await agent.UserSubscriptions.update(id, payload);

    } catch (error) {
      console.error("Güncelleme hatası:", error);
      // Hata olursa UI'ı geri al
      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === id ? oldSub : s
        ),
      }));
    }
  },

  // --- Yardımcılar ---

  logUsage: (id, status) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const sub = get().subscriptions.find(s => s.id === id);
    if (!sub) return;

    const history = sub.usageHistory || [];
    const existingIndex = history.findIndex(h => h.month === currentMonth);
    let newHistory;

    if (existingIndex >= 0) {
      newHistory = [...history];
      newHistory[existingIndex] = { month: currentMonth, status };
    } else {
      newHistory = [...history, { month: currentMonth, status }];
    }

    get().updateSubscription(id, { usageHistory: newHistory });
  },

  getPendingSurvey: () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // "2024-12"
    const subs = get().subscriptions;

    return subs.find(s => {
      // --- DÜZELTME BURADA ---
      // Eğer abonelik pasif ise (dondurulmuşsa), bunu atla ve anket sorma.
      if (s.isActive === false) return false;
      // -----------------------

      const history = s.usageHistory || [];
      // Bu ay için kayıt yoksa anket yap
      return !history.some(h => h.month === currentMonth);
    }) || null;
  },

  getTotalExpense: () => {
    const { subscriptions, exchangeRates } = get(); // Store'daki kurları kullan
    return subscriptions
      .filter(sub => sub.isActive !== false)
      .reduce((total, sub) => {
        // Dinamik kur çevirimi
        const rate = exchangeRates[sub.currency] || 1;
        const priceInTry = sub.price * rate;
        
        const partnerCount = (sub.sharedWith?.length || 0);
        const myShare = priceInTry / (partnerCount + 1);
        return total + myShare;
      }, 0);
  },

  getNextPayment: () => {
    const { subscriptions } = get();
    const activeSubs = subscriptions.filter(s => s.isActive !== false);
    if (activeSubs.length === 0) return null;

    const today = new Date().getDate();
    return activeSubs.sort((a, b) => {
      const dayA = a.billingDay < today ? a.billingDay + 30 : a.billingDay;
      const dayB = b.billingDay < today ? b.billingDay + 30 : b.billingDay;
      return dayA - dayB;
    })[0];
  },
}));