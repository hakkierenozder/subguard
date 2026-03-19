import { create } from 'zustand';
import { UserSubscription, UsageStatus, UsageLog, ApiUsageLog, AddSubscriptionPayload, RawSubscriptionApiItem } from '../types';
import { getDaysLeft } from '../utils/dateUtils';
import agent from '../api/agent';
import { getUserId } from '../utils/AuthManager';
import { convertToTRY } from '../utils/CurrencyService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleSubscriptionNotification, cancelNotification, syncLocalNotifications } from '../utils/NotificationManager';
import { saveCache, loadCache } from '../utils/offlineCache';

// Survey verisinin AsyncStorage anahtar şeması
const surveyKey = (id: string) => `@survey_${id}`;

interface UserSubscriptionState {
  subscriptions: UserSubscription[];
  sharedWithMe: UserSubscription[];
  loading: boolean;
  loadingMore: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  exchangeRates: Record<string, number>;

  _restoreSurveyHistory: (items: UserSubscription[]) => Promise<UserSubscription[]>;
  fetchUserSubscriptions: () => Promise<void>;
  loadMoreSubscriptions: () => Promise<void>;
  fetchSharedWithMe: () => Promise<void>;
  addSubscription: (sub: AddSubscriptionPayload) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, updatedData: Partial<UserSubscription>) => Promise<void>;

  logUsage: (id: string, status: UsageStatus) => Promise<void>;
  fetchUsageLogs: (id: string) => Promise<boolean>;
  getPendingSurvey: () => UserSubscription | null;
  getTotalExpense: () => number;
  getNextPayment: () => UserSubscription | null;
  fetchExchangeRates: () => Promise<void>;
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

const PAGE_SIZE = 20;

const formatItems = (rawItems: RawSubscriptionApiItem[]): UserSubscription[] =>
  rawItems.map((item) => ({
    ...item,
    id: item.id.toString(),
    contractStartDate: item.contractStartDate ?? undefined,
    contractEndDate: item.contractEndDate ?? undefined,
    sharedWith: safeJsonParse(item.sharedWithJson, []),
    // Backend CancelledDate → camelCase cancelledDate. cancelledAt alias ile frontend uyumu sağlanır.
    cancelledAt: item.cancelledDate ?? item.cancelledAt ?? null,
    // usageHistory (survey): AsyncStorage'dan ayrıca yüklenir, burada boş başlar
    usageHistory: [],
    // usageLogs: backend UsageLogDto[] formatı (ApiUsageLog[])
    usageLogs: [],
  }));

export const useUserSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  sharedWithMe: [],
  loading: false,
  loadingMore: false,
  page: 1,
  pageSize: PAGE_SIZE,
  totalCount: 0,
  hasMore: false,

  // Fallback kurlar — sadece API çağrısı başarısız olursa kullanılır.
  // Uygulama açılışında fetchExchangeRates() gerçek kurları yükler (Fix 15 & 16).
  exchangeRates: {
      USD: 38.0,
      EUR: 41.0,
      GBP: 48.0,
      TRY: 1.0
  },

  // Survey verilerini AsyncStorage'dan yükleyip store'daki aboneliklere uygula.
  // #36: AsyncStorage'da kayıt yoksa sunucudan gelen usageHistoryJson fallback olarak kullanılır.
  _restoreSurveyHistory: async (items: UserSubscription[]): Promise<UserSubscription[]> => {
    const keys = items.map(s => surveyKey(s.id));
    const pairs = await AsyncStorage.multiGet(keys);
    return items.map((sub, i) => {
      const raw = pairs[i][1];
      if (raw) {
        try {
          return { ...sub, usageHistory: JSON.parse(raw) as UsageLog[] };
        } catch {}
      }
      // AsyncStorage'da yoksa backend'den gelen usageHistoryJson'ı dene
      const serverHistory = safeJsonParse((sub as any).usageHistoryJson, null);
      if (serverHistory) return { ...sub, usageHistory: serverHistory as UsageLog[] };
      return sub;
    });
  },

  // 1. VERİLERİ ÇEK — sayfa 1'den başlar, listeyi sıfırlar
  fetchUserSubscriptions: async () => {
    set({ loading: true });
    try {
      const response = await agent.UserSubscriptions.list(1, PAGE_SIZE);
      if (response && response.data) {
        const raw = response.data;
        const rawItems: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const totalCount: number = raw?.totalCount ?? rawItems.length;
        const formatted = formatItems(rawItems);
        // Survey geçmişini AsyncStorage'dan geri yükle
        const withSurveys = await (get() as any)._restoreSurveyHistory(formatted);
        set({
          subscriptions: withSurveys,
          page: 1,
          totalCount,
          hasMore: formatted.length < totalCount,
        });
        await saveCache('subscriptions', { items: rawItems, totalCount });
      }
    } catch (error) {
      console.error('Abonelikler çekilemedi:', error);
      const cached = await loadCache<{ items: any[]; totalCount: number }>('subscriptions');
      if (cached) {
        const formatted = formatItems(cached.items);
        const withSurveys = await (get() as any)._restoreSurveyHistory(formatted);
        set({ subscriptions: withSurveys, totalCount: cached.totalCount, hasMore: false });
      }
    } finally {
      set({ loading: false });
    }
  },

  // 2. DAHA FAZLA YÜKlE — sonraki sayfayı listeye ekler
  loadMoreSubscriptions: async () => {
    const { loadingMore, hasMore, page, subscriptions } = get();
    if (loadingMore || !hasMore) return;

    set({ loadingMore: true });
    try {
      const nextPage = page + 1;
      const response = await agent.UserSubscriptions.list(nextPage, PAGE_SIZE);
      if (response && response.data) {
        const raw = response.data;
        const rawItems: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const totalCount: number = raw?.totalCount ?? 0;
        const newItems = formatItems(rawItems);
        const merged = [...subscriptions, ...newItems];
        set({
          subscriptions: merged,
          page: nextPage,
          totalCount,
          hasMore: merged.length < totalCount,
        });
      }
    } catch (error) {
      console.error('Daha fazla abonelik yüklenemedi:', error);
    } finally {
      set({ loadingMore: false });
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

  // BENİMLE PAYLAŞILANLAR
  // #34: pageSize=100 — SharedSubscriptionsScreen'de pagination uygulanmıyor;
  // tüm kayıtları tek istekte çekmek için varsayılan 20 yerine 100 kullanılır.
  fetchSharedWithMe: async () => {
    try {
      const response = await agent.UserSubscriptions.sharedWithMe(1, 100);
      if (response && response.data) {
        const raw = response.data;
        const rawItems: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const formatted = formatItems(rawItems);
        set({ sharedWithMe: formatted });
      }
    } catch (error) {
      console.error('Benimle paylaşılanlar çekilemedi:', error);
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
      billingPeriod: newSub.billingPeriod ?? 'Monthly',
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
      notes: newSub.notes ?? null,
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
    // Rollback için mevcut listeyi sakla
    const previousSubscriptions = get().subscriptions;
    const subToRemove = previousSubscriptions.find(s => s.id === id);

    // Bildirimden iptal et
    if (subToRemove?.notificationId) {
      await cancelNotification(subToRemove.notificationId);
    }

    // Optimistic: UI'dan hemen kaldır
    set({ subscriptions: previousSubscriptions.filter(s => s.id !== id) });

    try {
      await agent.UserSubscriptions.delete(id);
    } catch (error) {
      // API hatası → listeyi geri yükle
      console.error("Silme hatası:", error);
      set({ subscriptions: previousSubscriptions });
      Alert.alert("Hata", "Abonelik silinemedi. Lütfen tekrar deneyin.");
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
      // Sadece durum alanları değişiyorsa → PATCH /status kullan
      const STATUS_FIELDS: (keyof UserSubscription)[] = ['isActive', 'cancelledAt', 'cancelledDate', 'status', 'pausedDate'];
      const changedKeys = Object.keys(updatedData) as (keyof UserSubscription)[];
      const isStatusOnlyChange = changedKeys.length > 0 && changedKeys.every(k => STATUS_FIELDS.includes(k));

      if (isStatusOnlyChange) {
        // cancelledAt veya cancelledDate dolu ise → Cancelled; isActive true ise → Active; yoksa → Paused
        const apiStatus = newSub.isActive
          ? 'Active'
          : (newSub.cancelledAt || newSub.cancelledDate)
            ? 'Cancelled'
            : 'Paused';
        await agent.UserSubscriptions.changeStatus(id, apiStatus);
      } else {
        const currentUserId = await getUserId();
        const payload = {
          id: Number(newSub.id),
          userId: currentUserId,
          catalogId: newSub.catalogId,
          name: newSub.name,
          price: newSub.price,
          currency: newSub.currency,
          billingDay: newSub.billingDay,
          billingPeriod: newSub.billingPeriod ?? 'Monthly',
          category: newSub.category,
          colorCode: newSub.colorCode,
          hasContract: newSub.hasContract,
          contractStartDate: newSub.contractStartDate ?? null,
          contractEndDate: newSub.contractEndDate ?? null,
          isActive: newSub.isActive !== undefined ? newSub.isActive : true,
          // Backend DTO field: CancelledDate (camelCase: cancelledDate)
          cancelledDate: newSub.cancelledAt ?? newSub.cancelledDate ?? null,
          notes: newSub.notes ?? null,
          sharedWithJson: newSub.sharedWith ? JSON.stringify(newSub.sharedWith) : null,
          usageHistoryJson: newSub.usageHistory ? JSON.stringify(newSub.usageHistory) : null,
        };
        await agent.UserSubscriptions.update(id, payload);
      }

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

  logUsage: async (id, status) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const sub = get().subscriptions.find(s => s.id === id);
    if (!sub) return;

    const history = sub.usageHistory || [];
    const existingIndex = history.findIndex(h => h.month === currentMonth);
    let newHistory: UsageLog[];

    if (existingIndex >= 0) {
      newHistory = history.map((h, i) =>
        i === existingIndex ? { month: currentMonth, status } : h
      );
    } else {
      newHistory = [...history, { month: currentMonth, status }];
    }

    // Yerel state güncellenir
    set((state) => ({
      subscriptions: state.subscriptions.map(s =>
        s.id === id ? { ...s, usageHistory: newHistory } : s
      ),
    }));

    // AsyncStorage'a yedekle (offline erişim)
    try {
      await AsyncStorage.setItem(surveyKey(id), JSON.stringify(newHistory));
    } catch (e) {
      console.error('Survey AsyncStorage kaydedilemedi:', e);
    }

    // #36 — Backend'e usageHistoryJson olarak sync et.
    // Telefon değiştirilse veya AsyncStorage temizlense bile sunucudan geri yüklenebilir.
    try {
      await agent.UserSubscriptions.update(id, {
        usageHistoryJson: JSON.stringify(newHistory),
      } as any);
    } catch {
      // Sessizce başarısız ol — yerel veri zaten kaydedildi
    }
  },

  fetchUsageLogs: async (id) => {
    try {
      const response = await agent.UserSubscriptions.getUsage(id);
      const logs: ApiUsageLog[] = Array.isArray(response?.data) ? response.data : [];
      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === id ? { ...s, usageLogs: logs } : s
        ),
      }));
      return true;
    } catch (e) {
      console.error('Kullanım logları alınamadı:', e);
      return false;
    }
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

    // Gerçek takvim hesabı — sabit +30 yerine dateUtils.getDaysLeft kullan (Fix 22)
    return activeSubs.sort((a, b) => getDaysLeft(a.billingDay) - getDaysLeft(b.billingDay))[0];
  },
}));