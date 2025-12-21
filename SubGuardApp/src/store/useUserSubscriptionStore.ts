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
  
  fetchUserSubscriptions: () => Promise<void>;
  addSubscription: (sub: UserSubscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, updatedData: Partial<UserSubscription>) => Promise<void>;
  
  logUsage: (id: string, status: UsageStatus) => void;
  getPendingSurvey: () => UserSubscription | null;
  getTotalExpense: () => number;
  getNextPayment: () => UserSubscription | null;
}

// Güvenli JSON Parse Yardımcısı
const safeJsonParse = (jsonString: string | null) => {
    if (!jsonString) return [];
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn("JSON Parse Hatası:", e);
        return [];
    }
};

export const useUserSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  loading: false,

  // 1. VERİLERİ ÇEK (Güvenli Mod)
fetchUserSubscriptions: async () => {
    set({ loading: true });
    try {
      const response = await agent.UserSubscriptions.list();
      
      if (response && response.data) {
        const mappedSubs = response.data.map((s: any) => ({
          ...s,
          id: s.id.toString(),
          sharedWith: safeJsonParse(s.sharedWithJson),
          usageHistory: safeJsonParse(s.usageHistoryJson)
        }));
        
        set({ subscriptions: mappedSubs, loading: false });
        syncLocalNotifications(mappedSubs);
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      set({ loading: false });
    }
  },

  // 2. ABONELİK EKLE
addSubscription: async (sub) => {
    try {
      // --- DÜZELTME: USER ID ALINIYOR ---
      const currentUserId = await getUserId(); 

      const notifId = await scheduleSubscriptionNotification(
          "Ödeme Hatırlatıcı",
          `${sub.name} ödemen yaklaştı!`,
          sub.billingDay
      );

      const payload = {
        userId: currentUserId, // <-- VALIDATION İÇİN EKLENDİ (Backend ezecek ama boş gitmemeli)
        catalogId: sub.catalogId || null,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        billingDay: sub.billingDay,
        category: sub.category,
        hasContract: sub.hasContract,
        contractEndDate: sub.contractEndDate ? sub.contractEndDate : null,
        
        sharedWithJson: sub.sharedWith ? JSON.stringify(sub.sharedWith) : null,
        usageHistoryJson: sub.usageHistory ? JSON.stringify(sub.usageHistory) : null
      };

      const response = await agent.UserSubscriptions.create(payload);
      
      if (response && response.data) {
        const newSubFromDb = response.data;
        const newSubForStore: UserSubscription = {
            ...sub,
            id: newSubFromDb.id.toString(),
            notificationId: notifId || undefined,
            sharedWith: sub.sharedWith || [],
            usageHistory: sub.usageHistory || []
        };

        set((state) => ({
          subscriptions: [...state.subscriptions, newSubForStore]
        }));
      }
    } catch (error: any) { // Hata detayını görmek için 'any'
      console.error("Ekleme hatası:", error);
      // Detaylı hata mesajı (Varsa)
      if (error.response) {
          console.log("Backend Hatası:", error.response.data);
          console.log("Status:", error.response.status);
      }
      Alert.alert("Hata", "Abonelik kaydedilemedi. Bilgileri kontrol edin.");
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

    // Optimistic Update (Arayüzde anında güncelle)
    const newSub = { ...oldSub, ...updatedData };
    set((state) => ({
      subscriptions: state.subscriptions.map((s) => 
        s.id === id ? newSub : s
      ),
    }));

    try {
        const currentUserId = await getUserId(); 

        const payload = {
            id: Number(newSub.id),
            userId: currentUserId,
            catalogId: newSub.catalogId,
            name: newSub.name,
            price: newSub.price,
            currency: newSub.currency,
            billingDay: newSub.billingDay,
            category: newSub.category,
            colorCode: newSub.colorCode, // <-- Bunu da eklemek iyi olur
            hasContract: newSub.hasContract,
            contractEndDate: newSub.contractEndDate ? newSub.contractEndDate : null,
            // isActive durumunu da payload'a eklemeliyiz (Dondurma özelliği için)
            isActive: newSub.isActive !== undefined ? newSub.isActive : true, 
            
            sharedWithJson: newSub.sharedWith ? JSON.stringify(newSub.sharedWith) : null,
            usageHistoryJson: newSub.usageHistory ? JSON.stringify(newSub.usageHistory) : null
        };

        // --- DÜZELTME BURADA ---
        // Artık agent.ts'de tanımladığımız gibi 2 parametre gönderiyoruz: (id, payload)
        await agent.UserSubscriptions.update(id, payload);
        
    } catch (error) {
        console.error("Güncelleme hatası:", error);
        // Hata olursa eski haline döndürebilirsin (Opsiyonel)
        set((state) => ({
            subscriptions: state.subscriptions.map((s) => 
              s.id === id ? oldSub : s
            ),
        }));
        // Kullanıcıya hata mesajı göstermek için Alert eklenebilir ama store içinde Alert pek önerilmez.
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
    const currentMonth = new Date().toISOString().slice(0, 7);
    const subs = get().subscriptions;
    return subs.find(s => {
        const history = s.usageHistory || [];
        return !history.some(h => h.month === currentMonth);
    }) || null;
  },

getTotalExpense: () => {
    const { subscriptions } = get();
    return subscriptions
        .filter(sub => sub.isActive !== false) // Sadece aktifleri topla (undefined ise aktif say)
        .reduce((total, sub) => {
            const price = convertToTRY(sub.price, sub.currency);
            // Ortaklı hesaplama mantığı (önceki geliştirmemiz)
            const partnerCount = (sub.sharedWith?.length || 0);
            const myShare = price / (partnerCount + 1);
            return total + myShare;
        }, 0);
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