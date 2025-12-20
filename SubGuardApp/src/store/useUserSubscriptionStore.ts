import { create } from 'zustand';
import { UserSubscription, UsageStatus } from '../types';
import agent from '../api/agent'; // Düzelttiğimiz agent dosyası
import { getUserId } from '../utils/AuthManager';
import { convertToTRY } from '../utils/CurrencyService';
import { Alert } from 'react-native';
import { scheduleSubscriptionNotification, cancelNotification, syncLocalNotifications } from '../utils/NotificationManager';

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
      const response = await agent.UserSubscriptions.list(userId);
      
      if (response && response.data) {
        const mappedSubs = response.data.map((s: any) => ({
          ...s,
          id: s.id.toString(),
          usageHistory: s.usageHistoryJson ? JSON.parse(s.usageHistoryJson) : [],
          sharedWith: s.sharedWithJson ? JSON.parse(s.sharedWithJson) : []
        }));
        
        set({ subscriptions: mappedSubs, loading: false });

        // --- YENİ EKLENEN SATIR: BİLDİRİMLERİ KUR ---
        // Veri buluttan geldi, şimdi telefonun alarmlarını buna göre ayarla.
        syncLocalNotifications(mappedSubs); 

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

      // Bildirim Planla (Aynı kalıyor)
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
        contractEndDate: sub.contractEndDate ? sub.contractEndDate : null,

        // --- DİZİLERİ STRING'E ÇEVİR (Serialize) ---
        sharedWithJson: sub.sharedWith ? JSON.stringify(sub.sharedWith) : null,
        usageHistoryJson: sub.usageHistory ? JSON.stringify(sub.usageHistory) : null
      };

      const response = await agent.UserSubscriptions.create(payload);

      if (response && response.data) {
        const newSubFromDb = response.data;

        const newSubForState: UserSubscription = {
          ...sub,
          id: newSubFromDb.id.toString(),
          notificationId: notifId || undefined,
          // State'e kaydederken orijinal dizi halini kullanıyoruz
          sharedWith: sub.sharedWith || [],
          usageHistory: sub.usageHistory || []
        };

        set((state) => ({
          subscriptions: [...state.subscriptions, newSubForState]
        }));
      }
    } catch (error) {
      // ... (Hata yönetimi aynı)
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
    // 1. Önce mevcut halini bul
    const oldSub = get().subscriptions.find((s) => s.id === id);
    if (!oldSub) return;

    // 2. Yeni objeyi oluştur (Eski veriler + Yeni veriler)
    const newSub = { ...oldSub, ...updatedData };

    // 3. Local State'i hemen güncelle (Hız hissi için)
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? newSub : s
      ),
    }));

    // 4. Backend'e Gönder (UserSubscriptionDto formatında)
    try {
      const payload = {
        id: Number(newSub.id), // ID'yi number yap
        userId: await getUserId(), // UserId'yi al
        catalogId: newSub.catalogId,
        name: newSub.name,
        price: newSub.price,
        currency: newSub.currency,
        billingDay: newSub.billingDay,
        category: newSub.category,
        hasContract: newSub.hasContract,
        contractEndDate: newSub.contractEndDate ? newSub.contractEndDate : null,

        // JSON Dönüşümleri (Kritik!)
        sharedWithJson: newSub.sharedWith ? JSON.stringify(newSub.sharedWith) : null,
        usageHistoryJson: newSub.usageHistory ? JSON.stringify(newSub.usageHistory) : null
      };

      await agent.UserSubscriptions.update(payload);

      // Bildirim mantığı (Mevcut kodunda varsa kalsın)
      // ...

    } catch (error) {
      console.error("Güncelleme hatası:", error);
      // Hata olursa kullanıcıya uyarı ver veya değişikliği geri al
    }
  },

  // --- Yardımcılar ---
  logUsage: (id, status) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const sub = get().subscriptions.find(s => s.id === id);
    if (!sub) return;

    // Yeni geçmişi hesapla
    const history = sub.usageHistory || [];
    const existingIndex = history.findIndex(h => h.month === currentMonth);
    let newHistory;

    if (existingIndex >= 0) {
      newHistory = [...history];
      newHistory[existingIndex] = { month: currentMonth, status };
    } else {
      newHistory = [...history, { month: currentMonth, status }];
    }

    // ARTIK SADECE LOCAL DEĞİL, UPDATE FONKSİYONUNU ÇAĞIRIYORUZ
    // Bu sayede hem store hem backend güncelleniyor.
    get().updateSubscription(id, { usageHistory: newHistory });
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