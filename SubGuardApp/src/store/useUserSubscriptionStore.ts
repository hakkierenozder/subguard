import { create } from 'zustand';
import { UserSubscription, UsageStatus, UsageLog, ApiUsageLog, AddSubscriptionPayload, RawSubscriptionApiItem } from '../types';
import { getDaysLeftForSub, isSubscriptionActiveNow, serializeCalendarDate } from '../utils/dateUtils';
import agent from '../api/agent';
import { convertToTRY } from '../utils/CurrencyService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleSubscriptionNotification, cancelNotification, syncLocalNotifications, syncSubscriptionsToCalendar } from '../utils/NotificationManager';
import { saveCache, loadCache } from '../utils/offlineCache';
import { useSettingsStore } from './useSettingsStore';
import { getSubscriptionMonthlyShareInTry } from '../utils/subscriptionMath';

// Survey verisinin AsyncStorage anahtar ÅŸemasÄ±
const surveyKey = (id: string) => `@survey_${id}`;

interface UserSubscriptionState {
  subscriptions: UserSubscription[];
  sharedWithMe: UserSubscription[];
  sharedWithMePage: number;
  sharedWithMeHasMore: boolean;
  loadingSharedWithMe: boolean;
  loading: boolean;
  loadingMore: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  exchangeRates: Record<string, number>;
  searchQuery: string; // F-5: backend aramasÄ± iÃ§in

  _restoreSurveyHistory: (items: UserSubscription[]) => Promise<UserSubscription[]>;
  fetchUserSubscriptions: () => Promise<void>;
  fetchAllUserSubscriptions: () => Promise<void>;
  loadMoreSubscriptions: () => Promise<void>;
  setSearchQuery: (q: string) => void; // F-5: arama sorgusunu gÃ¼ncelle
  fetchSharedWithMe: () => Promise<void>;
  loadMoreSharedWithMe: () => Promise<void>;
  addSubscription: (sub: AddSubscriptionPayload) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, updatedData: Partial<UserSubscription>) => Promise<void>;

  logUsage: (id: string, status: UsageStatus) => Promise<void>;
  fetchUsageLogs: (id: string) => Promise<boolean>;
  getPendingSurvey: () => UserSubscription | null;
  getTotalExpense: () => number;
  getNextPayment: () => UserSubscription | null;
  fetchExchangeRates: () => Promise<void>;
  reset: () => void;
}

// GÃ¼venli JSON Parse YardÄ±mcÄ±sÄ±
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
    firstPaymentDate: item.firstPaymentDate ?? item.contractStartDate ?? item.createdDate ?? undefined,
    contractStartDate: item.contractStartDate ?? undefined,
    contractEndDate: item.contractEndDate ?? undefined,
    // B-13: Backend'den gelen sharedUserEmails + sharedUserIds listelerini sharedWith nesne dizisine dÃ¶nÃ¼ÅŸtÃ¼r.
    // sharedUserIds eksikse (eski API yanÄ±tÄ±) userId boÅŸ string olarak kalÄ±r.
    sharedWith: (item.sharedUserEmails ?? []).map((email: string, i: number) => ({
      email,
      userId: item.sharedUserIds?.[i] ?? '',
    })),
    sharedGuests: item.sharedGuests ?? [],
    // Backend CancelledDate â†’ camelCase cancelledDate (canonical field)
    cancelledDate: item.cancelledDate ?? item.cancelledAt ?? null,
    // usageHistory (survey): AsyncStorage'dan ayrÄ±ca yÃ¼klenir, burada boÅŸ baÅŸlar
    usageHistory: [],
    // usageLogs: backend UsageLogDto[] formatÄ± (ApiUsageLog[])
    usageLogs: [],
  }));

// F-2: YÄ±llÄ±k abonelik iÃ§in sonraki Ã¶demeye kaÃ§ gÃ¼n kaldÄ±ÄŸÄ±nÄ± hesapla
const getDaysUntilNextBilling = (sub: UserSubscription): number => {
  return getDaysLeftForSub(
    sub.billingDay,
    sub.billingPeriod,
    sub.billingMonth,
    sub.createdDate,
    sub.firstPaymentDate,
    sub.contractStartDate,
  );
};

const SHARED_PAGE_SIZE = 20;

export const useUserSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  sharedWithMe: [],
  sharedWithMePage: 1,
  sharedWithMeHasMore: false,
  loadingSharedWithMe: false,
  loading: false,
  loadingMore: false,
  page: 1,
  pageSize: PAGE_SIZE,
  totalCount: 0,
  hasMore: false,
  searchQuery: '', // F-5

  // Fallback kurlar â€” AsyncStorage'dan yÃ¼klenene veya API baÅŸarÄ±lÄ± olana kadar kullanÄ±lÄ±r.
  // GerÃ§ek kurlar fetchExchangeRates() sonrasÄ± hem store'a hem AsyncStorage'a kaydedilir.
  exchangeRates: { TRY: 1.0 },

  reset: () => {
    // AsyncStorage'daki survey cache'lerini temizle (logout sonrasÄ± data leak Ã¶nlenir)
    AsyncStorage.getAllKeys()
      .then(keys => {
        const surveyKeys = keys.filter(k => k.startsWith('@survey_'));
        if (surveyKeys.length > 0) AsyncStorage.multiRemove(surveyKeys).catch(() => {});
      })
      .catch(() => {});

    set({
      subscriptions: [],
      sharedWithMe: [],
      sharedWithMePage: 1,
      sharedWithMeHasMore: false,
      loadingSharedWithMe: false,
      loading: false,
      loadingMore: false,
      page: 1,
      totalCount: 0,
      hasMore: false,
      searchQuery: '',
      exchangeRates: { TRY: 1.0 },
    });
  },

  // Survey verilerini AsyncStorage'dan yÃ¼kleyip store'daki aboneliklere uygula.
  // #36: AsyncStorage'da kayÄ±t yoksa sunucudan gelen usageHistoryJson fallback olarak kullanÄ±lÄ±r.
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
      // AsyncStorage'da yoksa backend'den gelen usageHistoryJson'Ä± dene
      const serverHistory = safeJsonParse((sub as any).usageHistoryJson, null);
      if (serverHistory) return { ...sub, usageHistory: serverHistory as UsageLog[] };
      return sub;
    });
  },

  // F-5: arama sorgusunu gÃ¼ncelle â€” fetchUserSubscriptions Ã§aÄŸrÄ±sÄ± ekranÄ±n sorumluluÄŸunda
  setSearchQuery: (q: string) => set({ searchQuery: q }),

  // 1. VERÄ°LERÄ° Ã‡EK â€” sayfa 1'den baÅŸlar, listeyi sÄ±fÄ±rlar
  fetchUserSubscriptions: async () => {
    if (get().loading) return; // [40] race condition Ã¶nlemi
    set({ loading: true });
    const q = get().searchQuery || undefined; // F-5: backend aramasÄ±
    try {
      const response = await agent.UserSubscriptions.list(1, PAGE_SIZE, q);
      if (response && response.data) {
        const raw = response.data;
        const rawItems: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const totalCount: number = raw?.totalCount ?? rawItems.length;
        const formatted = formatItems(rawItems);
        // Survey geÃ§miÅŸini AsyncStorage'dan geri yÃ¼kle
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
      console.error('Abonelikler Ã§ekilemedi:', error);
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

  fetchAllUserSubscriptions: async () => {
    if (get().loading) return;
    set({ loading: true });

    try {
      const pageSize = 100;
      let page = 1;
      let totalCount = 0;
      let merged: UserSubscription[] = [];
      let rawMerged: RawSubscriptionApiItem[] = [];

      while (true) {
        const response = await agent.UserSubscriptions.list(page, pageSize);
        if (!response?.data) break;

        const raw = response.data;
        const rawItems: RawSubscriptionApiItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        totalCount = raw?.totalCount ?? rawItems.length;
        rawMerged = [...rawMerged, ...rawItems];

        const formatted = formatItems(rawItems);
        const withSurveys = await (get() as any)._restoreSurveyHistory(formatted);
        merged = [...merged, ...withSurveys];

        if (rawItems.length === 0 || merged.length >= totalCount) {
          break;
        }

        page += 1;
      }

      set({
        subscriptions: merged,
        page,
        totalCount,
        hasMore: merged.length < totalCount,
      });
      await saveCache('subscriptions', {
        items: rawMerged,
        totalCount,
      });
    } catch (error) {
      console.error('Tum abonelikler cekilemedi:', error);
      const cached = await loadCache<{ items: RawSubscriptionApiItem[]; totalCount: number }>('subscriptions');
      if (cached) {
        const formatted = formatItems(cached.items);
        const withSurveys = await (get() as any)._restoreSurveyHistory(formatted);
        set({
          subscriptions: withSurveys,
          totalCount: cached.totalCount,
          hasMore: false,
        });
      }
    } finally {
      set({ loading: false });
    }
  },

  // 2. DAHA FAZLA YÃœKlE â€” sonraki sayfayÄ± listeye ekler
  loadMoreSubscriptions: async () => {
    const { loadingMore, hasMore, page, subscriptions } = get();
    if (loadingMore || !hasMore) return;

    set({ loadingMore: true });
    try {
      const nextPage = page + 1;
      const response = await agent.UserSubscriptions.list(nextPage, PAGE_SIZE, get().searchQuery || undefined);
      if (response && response.data) {
        const raw = response.data;
        const rawItems: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const totalCount: number = raw?.totalCount ?? 0;
        const newItems = formatItems(rawItems);
        // F-3: survey geÃ§miÅŸini geri yÃ¼kle (fetchUserSubscriptions ile tutarlÄ±)
        const withSurveys = await (get() as any)._restoreSurveyHistory(newItems);
        const merged = [...subscriptions, ...withSurveys];
        set({
          subscriptions: merged,
          page: nextPage,
          totalCount,
          hasMore: merged.length < totalCount,
        });
      }
    } catch (error) {
      console.error('Daha fazla abonelik yÃ¼klenemedi:', error);
    } finally {
      set({ loadingMore: false });
    }
  },

  fetchExchangeRates: async () => {
      // Ã–nce AsyncStorage'dan son bilinen kurlarÄ± yÃ¼kle (offline veya API yavaÅŸsa bile doÄŸru kur gÃ¶sterilir)
      try {
          const cached = await AsyncStorage.getItem('@exchange_rates');
          if (cached) {
              const parsed = JSON.parse(cached);
              set(state => ({ exchangeRates: { ...state.exchangeRates, ...parsed, TRY: 1.0 } }));
          }
      } catch {}
      // ArdÄ±ndan API'den gÃ¼ncel kurlarÄ± Ã§ek ve hem store'a hem cache'e yaz
      try {
          const response = await agent.Currencies.list();
          if (response && response.data) {
              const rates = { ...response.data, TRY: 1.0 };
              set(state => ({ exchangeRates: { ...state.exchangeRates, ...rates } }));
              await AsyncStorage.setItem('@exchange_rates', JSON.stringify(rates));
          }
      } catch (error) {
          console.error("Kurlar Ã§ekilemedi, son bilinen deÄŸerler kullanÄ±lÄ±yor.", error);
      }
  },

  // BENÄ°MLE PAYLAÅILANLAR â€” ilk sayfa
  fetchSharedWithMe: async () => {
    set({ loadingSharedWithMe: true });
    try {
      const response = await agent.UserSubscriptions.sharedWithMe(1, SHARED_PAGE_SIZE);
      if (response && response.data) {
        const raw = response.data;
        const rawItems: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const totalCount: number = raw?.totalCount ?? rawItems.length;
        const formatted = formatItems(rawItems);
        set({
          sharedWithMe: formatted,
          sharedWithMePage: 1,
          sharedWithMeHasMore: totalCount > SHARED_PAGE_SIZE,
        });
      }
    } catch (error) {
      console.error('Benimle paylasilanlar cekilemedi:', error);
      throw error;
    } finally {
      set({ loadingSharedWithMe: false });
    }
  },

  // BENÄ°MLE PAYLAÅILANLAR â€” sonraki sayfa (infinite scroll)
  loadMoreSharedWithMe: async () => {
    const { sharedWithMePage, sharedWithMeHasMore, loadingSharedWithMe } = get();
    if (!sharedWithMeHasMore || loadingSharedWithMe) return;
    set({ loadingSharedWithMe: true });
    try {
      const nextPage = sharedWithMePage + 1;
      const response = await agent.UserSubscriptions.sharedWithMe(nextPage, SHARED_PAGE_SIZE);
      if (response && response.data) {
        const raw = response.data;
        const rawItems: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const totalCount: number = raw?.totalCount ?? 0;
        const formatted = formatItems(rawItems);
        set((state) => ({
          sharedWithMe: [...state.sharedWithMe, ...formatted],
          sharedWithMePage: nextPage,
          sharedWithMeHasMore: state.sharedWithMe.length + formatted.length < totalCount,
        }));
      }
    } catch (error) {
      console.error('Daha fazla paylaÅŸÄ±m Ã§ekilemedi:', error);
    } finally {
      set({ loadingSharedWithMe: false });
    }
  },

  // 2. ABONELÄ°K EKLE
  addSubscription: async (newSub) => {
  try {
    // AddUserSubscriptionDto'daki field'larla birebir eÅŸleÅŸen payload.
    // userId JWT token'dan alÄ±nÄ±yor, isActive/Status entity default'larÄ±yla baÅŸlÄ±yor.
    const payload = {
      catalogId: newSub.catalogId,
      name: newSub.name,
      price: newSub.price,
      currency: newSub.currency,
      billingDay: newSub.billingDay,
      billingPeriod: newSub.billingPeriod ?? 'Monthly',
      // B-11: YÄ±llÄ±k abonelikler iÃ§in fatura ayÄ± backend'e iletilir
      billingMonth: newSub.billingMonth ?? null,
      firstPaymentDate: newSub.firstPaymentDate
        ? serializeCalendarDate(new Date(newSub.firstPaymentDate))
        : null,
      category: newSub.category,
      colorCode: newSub.colorCode,
      hasContract: newSub.hasContract,
      contractStartDate: newSub.contractStartDate
        ? serializeCalendarDate(new Date(newSub.contractStartDate))
        : null,
      contractEndDate: newSub.contractEndDate
        ? serializeCalendarDate(new Date(newSub.contractEndDate))
        : null,
      notes: newSub.notes ?? null,
      // B-11: PaylaÅŸÄ±m e-postalarÄ± backend'e iletilir (AddUserSubscriptionDto.SharedUserEmails).
      // AddSubscriptionPayload.sharedWith form katmanÄ±nda string[] (sadece email) olarak gelir.
      sharedUserEmails: newSub.sharedWith ?? null,
    };

    const response = await agent.UserSubscriptions.create(payload);

      if (response && response.data) {
        const createdSub = formatItems([response.data])[0];
        const emails: string[] = payload.sharedUserEmails ?? [];
        const guests: string[] = newSub.sharedGuests ?? [];
        const hasShareTargets = emails.length > 0 || guests.length > 0;

        if (!hasShareTargets) {
          set((state) => ({
            subscriptions: [...state.subscriptions, createdSub],
            totalCount: state.totalCount + 1,
          }));
          await saveCache('subscriptions', { items: get().subscriptions, totalCount: get().totalCount });
        } else {
          const guestResults = await Promise.allSettled(
            guests.map((name) => agent.UserSubscriptions.shareGuest(Number(createdSub.id), name)),
          );
          const failedGuests = guestResults
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .map((r) => r.reason?.response?.data?.errors?.[0] ?? 'Bir misafir paylasim islemi basarisiz oldu.');

          await get().fetchAllUserSubscriptions();

          if (failedGuests.length > 0) {
            Alert.alert('Paylasim Uyarisi', failedGuests[0]);
          }
        }

        if (useSettingsStore.getState().calendarSyncEnabled) {
          await syncSubscriptionsToCalendar(get().subscriptions);
        }
      }
    } catch (error) {
      console.error("Ekleme hatasÄ±:", error);
      throw error;
    }
  },

  // 3. SÄ°L
  removeSubscription: async (id) => {
    // Rollback iÃ§in mevcut listeyi sakla
    const previousSubscriptions = get().subscriptions;
    const subToRemove = previousSubscriptions.find(s => s.id === id);

    // Bildirimden iptal et
    if (subToRemove?.notificationId) {
      await cancelNotification(subToRemove.notificationId);
    }

    // Optimistic: UI'dan hemen kaldÄ±r
    set({ subscriptions: previousSubscriptions.filter(s => s.id !== id) });

    try {
      await agent.UserSubscriptions.delete(id);
      await saveCache('subscriptions', { items: get().subscriptions, totalCount: get().totalCount }); // [42]
      // F-8: takvim senkronizasyonu
      if (useSettingsStore.getState().calendarSyncEnabled) {
        await syncSubscriptionsToCalendar(get().subscriptions);
      }
    } catch (error) {
      // API hatasÄ± â†’ listeyi geri yÃ¼kle ve hatayÄ± yukarÄ± ilet
      console.error("Silme hatasÄ±:", error);
      set({ subscriptions: previousSubscriptions });
      throw error;
    }
  },

  // 4. GÃœNCELLE
  updateSubscription: async (id, updatedData) => {
    const oldSub = get().subscriptions.find((s) => s.id === id);
    if (!oldSub) return;

    // Optimistic Update (ArayÃ¼zde hemen gÃ¼ncelle)
    const newSub = { ...oldSub, ...updatedData };
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? newSub : s
      ),
    }));

    // B-18: catch scope iÃ§in try dÄ±ÅŸÄ±na alÄ±ndÄ±
    const STATUS_FIELDS: (keyof UserSubscription)[] = ['isActive', 'cancelledAt', 'cancelledDate', 'status', 'pausedDate'];
    const changedKeys = Object.keys(updatedData) as (keyof UserSubscription)[];
    const isStatusOnlyChange = changedKeys.length > 0 && changedKeys.every(k => STATUS_FIELDS.includes(k));
    const shouldRefreshShareData = updatedData.sharedWith !== undefined || updatedData.sharedGuests !== undefined;
    const apiStatus = isStatusOnlyChange
      ? (newSub.isActive
          ? 'Active'
          : (newSub.cancelledAt || newSub.cancelledDate)
            ? 'Cancelled'
            : 'Paused')
      : null;

    try {
      if (isStatusOnlyChange) {
        await agent.UserSubscriptions.changeStatus(id, apiStatus!);
      } else {
        // UpdateUserSubscriptionDto'daki field'larla birebir eÅŸleÅŸen payload.
        // id, userId, isActive, cancelledDate, usageHistoryJson DTO'da olmadÄ±ÄŸÄ± iÃ§in gÃ¶nderilmiyor.
        const payload = {
          name: newSub.name,
          price: newSub.price,
          currency: newSub.currency,
          billingDay: newSub.billingDay,
          billingPeriod: newSub.billingPeriod ?? 'Monthly',
          // B-1: YÄ±llÄ±k abonelikte fatura ayÄ±
          billingMonth: newSub.billingPeriod === 'Yearly' ? (newSub.billingMonth ?? null) : null,
          firstPaymentDate: newSub.firstPaymentDate
            ? serializeCalendarDate(new Date(newSub.firstPaymentDate))
            : null,
          category: newSub.category,
          colorCode: newSub.colorCode,
          hasContract: newSub.hasContract,
          contractStartDate: newSub.contractStartDate
            ? serializeCalendarDate(new Date(newSub.contractStartDate))
            : null,
          contractEndDate: newSub.contractEndDate
            ? serializeCalendarDate(new Date(newSub.contractEndDate))
            : null,
          notes: newSub.notes ?? null,
          // B-6: sharedWithJson kaldÄ±rÄ±ldÄ± â€” paylaÅŸÄ±m deÄŸiÅŸikliÄŸi ayrÄ± share/removeShare Ã§aÄŸrÄ±larÄ±yla yapÄ±lÄ±yor
        };

        await agent.UserSubscriptions.update(id, payload);

        // PaylaÅŸÄ±m deÄŸiÅŸikliklerini share/removeShare endpoint'leriyle senkronize et.
        // Update'ten sonra, baÄŸÄ±msÄ±z olarak Ã§alÄ±ÅŸÄ±r â€” sharing hatasÄ± update'i engellemez.
        if (updatedData.sharedWith !== undefined) {
          const currentShared = (oldSub.sharedWith ?? []) as { email: string; userId: string }[];
          const incomingRaw = (updatedData.sharedWith ?? []) as (string | { email: string; userId?: string })[];
          const newEmails = new Set(incomingRaw.map((p) => (typeof p === 'string' ? p : p.email)));
          const currentEmails = new Set(currentShared.map((p) => p.email));

          const addedEmails = [...newEmails].filter((e) => !currentEmails.has(e));
          const removedUsers = currentShared.filter((p) => !newEmails.has(p.email));

          const shareResults = await Promise.allSettled([
            ...addedEmails.map((email) => agent.UserSubscriptions.share(Number(id), email)),
            ...removedUsers
              .filter((p) => p.userId)
              .map((p) => agent.UserSubscriptions.removeShare(Number(id), p.userId)),
          ]);

          const failedShares = shareResults
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .map((r) => r.reason?.response?.data?.errors?.[0] ?? 'Bir paylaÅŸÄ±m iÅŸlemi baÅŸarÄ±sÄ±z oldu.');

          if (failedShares.length > 0) {
            Alert.alert('PaylaÅŸÄ±m UyarÄ±sÄ±', failedShares[0]);
          }
        }

        // Ãœyesiz paylaÅŸÄ±m (guest) deÄŸiÅŸikliklerini senkronize et
        if (updatedData.sharedGuests !== undefined) {
          const currentGuests = oldSub.sharedGuests ?? [];
          const newGuests = updatedData.sharedGuests ?? [];
          const newGuestNames = new Set(newGuests.map((g) => g.displayName));
          const currentGuestNames = new Set(currentGuests.map((g) => g.displayName));

          const addedGuests = newGuests
            .filter((g) => !currentGuestNames.has(g.displayName))
            .map((g) => g.displayName);
          const removedGuests = currentGuests.filter((g) => !newGuestNames.has(g.displayName));

          const guestResults = await Promise.allSettled([
            ...addedGuests.map((name) => agent.UserSubscriptions.shareGuest(Number(id), name)),
            ...removedGuests.map((g) => agent.UserSubscriptions.removeGuestShare(Number(id), g.id)),
          ]);

          const failedGuests = guestResults
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .map((r) => r.reason?.response?.data?.errors?.[0] ?? 'Bir misafir paylaÅŸÄ±m iÅŸlemi baÅŸarÄ±sÄ±z oldu.');
          if (failedGuests.length > 0) {
            Alert.alert('PaylaÅŸÄ±m UyarÄ±sÄ±', failedGuests[0]);
          }


        }
      }
      if (shouldRefreshShareData) {
        await get().fetchAllUserSubscriptions();
      }
      await saveCache('subscriptions', { items: get().subscriptions, totalCount: get().totalCount }); // [42]
      // F-8: takvim senkronizasyonu
      if (useSettingsStore.getState().calendarSyncEnabled) {
        await syncSubscriptionsToCalendar(get().subscriptions);
      }
    } catch (error: any) {
      // B-18: 409 = kontratlÄ± abonelik erken iptal â†’ onay dialog'u gÃ¶ster
      if (isStatusOnlyChange && apiStatus === 'Cancelled' && error?.response?.status === 409) {
        set((state) => ({
          subscriptions: state.subscriptions.map((s) => s.id === id ? oldSub : s),
        }));
        Alert.alert(
          'Aktif Kontrat',
          'Bu aboneliÄŸin sÃ¶zleÅŸmesi henÃ¼z bitmedi. Yine de erken iptal etmek istiyor musunuz?',
          [
            { text: 'VazgeÃ§', style: 'cancel' },
            {
              text: 'Yine de Ä°ptal Et',
              style: 'destructive',
              onPress: async () => {
                try {
                  await agent.UserSubscriptions.changeStatus(id, 'Cancelled', true);
                  set((state) => ({
                    subscriptions: state.subscriptions.map((s) =>
                      s.id === id
                        ? { ...s, isActive: false, status: 'Cancelled', cancelledDate: new Date().toISOString() }
                        : s
                    ),
                  }));
                } catch {
                  Alert.alert('Hata', 'Ä°ptal iÅŸlemi gerÃ§ekleÅŸtirilemedi. LÃ¼tfen tekrar deneyin.');
                }
              },
            },
          ]
        );
        return;
      }

      console.error("GÃ¼ncelleme hatasÄ±:", error);
      set((state) => ({
        subscriptions: state.subscriptions.map((s) => s.id === id ? oldSub : s),
      }));
      Alert.alert('Hata', 'DeÄŸiÅŸiklikler kaydedilemedi. LÃ¼tfen tekrar deneyin.');
    }
  },

  // --- YardÄ±mcÄ±lar ---

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

    // Yerel state gÃ¼ncellenir
    set((state) => ({
      subscriptions: state.subscriptions.map(s =>
        s.id === id ? { ...s, usageHistory: newHistory } : s
      ),
    }));

    // AsyncStorage'a yedekle (offline eriÅŸim)
    try {
      await AsyncStorage.setItem(surveyKey(id), JSON.stringify(newHistory));
    } catch (e) {
      console.error('Survey AsyncStorage kaydedilemedi:', e);
    }

    // Backend'e survey geÃ§miÅŸini sync et â€” dedicated PATCH /survey endpoint kullanÄ±lÄ±yor.
    // PUT /usersubscriptions/{id} yerine bu endpoint kullanÄ±lÄ±r Ã§Ã¼nkÃ¼ PUT tÃ¼m alanlarÄ± gerektirir;
    // sadece usageHistoryJson gÃ¶ndermek abonelik verisini bozardÄ±.
    try {
      await agent.UserSubscriptions.updateSurvey(id, JSON.stringify(newHistory));
    } catch {
      // Sessizce baÅŸarÄ±sÄ±z ol â€” yerel veri AsyncStorage'a zaten kaydedildi
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
      console.error('KullanÄ±m loglarÄ± alÄ±namadÄ±:', e);
      return false;
    }
  },

  getPendingSurvey: () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // "2024-12"
    const subs = get().subscriptions;

    return subs.find(s => {
      // --- DÃœZELTME BURADA ---
      // EÄŸer abonelik pasif ise (dondurulmuÅŸsa), bunu atla ve anket sorma.
      if (s.isActive === false) return false;
      // -----------------------

      const history = s.usageHistory || [];
      // Bu ay iÃ§in kayÄ±t yoksa anket yap
      return !history.some(h => h.month === currentMonth);
    }) || null;
  },

  getTotalExpense: () => {
    const { subscriptions, exchangeRates } = get();
    return subscriptions
      .filter(sub => isSubscriptionActiveNow(sub.isActive, sub.firstPaymentDate, sub.contractStartDate, new Date(), sub.createdDate))
      .reduce((total, sub) => {
        // Gelecekte baÅŸlayacak abonelikler bugÃ¼nkÃ¼ aylÄ±k yÃ¼ke dahil edilmez.
        return total + getSubscriptionMonthlyShareInTry(sub, exchangeRates);
      }, 0);
  },

  getNextPayment: () => {
    const { subscriptions } = get();
    const activeSubs = subscriptions.filter(s => s.isActive !== false);
    if (activeSubs.length === 0) return null;

    // F-2: yÄ±llÄ±k abonelikler iÃ§in yÄ±l-bazlÄ± gÃ¼n hesabÄ± kullan
    return activeSubs.sort((a, b) => getDaysUntilNextBilling(a) - getDaysUntilNextBilling(b))[0];
  },
}));
