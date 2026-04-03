import { create } from 'zustand';
import { UserSubscription, UsageStatus, UsageLog, ApiUsageLog, AddSubscriptionPayload, RawSubscriptionApiItem } from '../types';
import { getDaysLeft } from '../utils/dateUtils';
import agent from '../api/agent';
import { convertToTRY } from '../utils/CurrencyService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleSubscriptionNotification, cancelNotification, syncLocalNotifications, syncSubscriptionsToCalendar } from '../utils/NotificationManager';
import { saveCache, loadCache } from '../utils/offlineCache';
import { useSettingsStore } from './useSettingsStore';

// Survey verisinin AsyncStorage anahtar şeması
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
  searchQuery: string; // F-5: backend araması için

  _restoreSurveyHistory: (items: UserSubscription[]) => Promise<UserSubscription[]>;
  fetchUserSubscriptions: () => Promise<void>;
  loadMoreSubscriptions: () => Promise<void>;
  setSearchQuery: (q: string) => void; // F-5: arama sorgusunu güncelle
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
    // B-13: Backend'den gelen sharedUserEmails + sharedUserIds listelerini sharedWith nesne dizisine dönüştür.
    // sharedUserIds eksikse (eski API yanıtı) userId boş string olarak kalır.
    sharedWith: (item.sharedUserEmails ?? []).map((email: string, i: number) => ({
      email,
      userId: item.sharedUserIds?.[i] ?? '',
    })),
    sharedGuests: item.sharedGuests ?? [],
    // Backend CancelledDate → camelCase cancelledDate (canonical field)
    cancelledDate: item.cancelledDate ?? item.cancelledAt ?? null,
    // usageHistory (survey): AsyncStorage'dan ayrıca yüklenir, burada boş başlar
    usageHistory: [],
    // usageLogs: backend UsageLogDto[] formatı (ApiUsageLog[])
    usageLogs: [],
  }));

// F-2: Yıllık abonelik için sonraki ödemeye kaç gün kaldığını hesapla
const getDaysUntilNextBilling = (sub: UserSubscription): number => {
  if (sub.billingPeriod !== 'Yearly') return getDaysLeft(sub.billingDay);
  const now = new Date();
  const anchor = sub.contractStartDate ? new Date(sub.contractStartDate) : now;
  let next = new Date(now.getFullYear(), anchor.getMonth(), anchor.getDate());
  if (next.getTime() <= now.getTime()) next.setFullYear(next.getFullYear() + 1);
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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

  // Fallback kurlar — AsyncStorage'dan yüklenene veya API başarılı olana kadar kullanılır.
  // Gerçek kurlar fetchExchangeRates() sonrası hem store'a hem AsyncStorage'a kaydedilir.
  exchangeRates: { TRY: 1.0 },

  reset: () => {
    // AsyncStorage'daki survey cache'lerini temizle (logout sonrası data leak önlenir)
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

  // F-5: arama sorgusunu güncelle — fetchUserSubscriptions çağrısı ekranın sorumluluğunda
  setSearchQuery: (q: string) => set({ searchQuery: q }),

  // 1. VERİLERİ ÇEK — sayfa 1'den başlar, listeyi sıfırlar
  fetchUserSubscriptions: async () => {
    if (get().loading) return; // [40] race condition önlemi
    set({ loading: true });
    const q = get().searchQuery || undefined; // F-5: backend araması
    try {
      const response = await agent.UserSubscriptions.list(1, PAGE_SIZE, q);
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
      const response = await agent.UserSubscriptions.list(nextPage, PAGE_SIZE, get().searchQuery || undefined);
      if (response && response.data) {
        const raw = response.data;
        const rawItems: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const totalCount: number = raw?.totalCount ?? 0;
        const newItems = formatItems(rawItems);
        // F-3: survey geçmişini geri yükle (fetchUserSubscriptions ile tutarlı)
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
      console.error('Daha fazla abonelik yüklenemedi:', error);
    } finally {
      set({ loadingMore: false });
    }
  },

  fetchExchangeRates: async () => {
      // Önce AsyncStorage'dan son bilinen kurları yükle (offline veya API yavaşsa bile doğru kur gösterilir)
      try {
          const cached = await AsyncStorage.getItem('@exchange_rates');
          if (cached) {
              const parsed = JSON.parse(cached);
              set(state => ({ exchangeRates: { ...state.exchangeRates, ...parsed, TRY: 1.0 } }));
          }
      } catch {}
      // Ardından API'den güncel kurları çek ve hem store'a hem cache'e yaz
      try {
          const response = await agent.Currencies.list();
          if (response && response.data) {
              const rates = { ...response.data, TRY: 1.0 };
              set(state => ({ exchangeRates: { ...state.exchangeRates, ...rates } }));
              await AsyncStorage.setItem('@exchange_rates', JSON.stringify(rates));
          }
      } catch (error) {
          console.error("Kurlar çekilemedi, son bilinen değerler kullanılıyor.", error);
      }
  },

  // BENİMLE PAYLAŞILANLAR — ilk sayfa
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
      console.error('Benimle paylaşılanlar çekilemedi:', error);
    } finally {
      set({ loadingSharedWithMe: false });
    }
  },

  // BENİMLE PAYLAŞILANLAR — sonraki sayfa (infinite scroll)
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
      console.error('Daha fazla paylaşım çekilemedi:', error);
    } finally {
      set({ loadingSharedWithMe: false });
    }
  },

  // 2. ABONELİK EKLE
  addSubscription: async (newSub) => {
  try {
    // AddUserSubscriptionDto'daki field'larla birebir eşleşen payload.
    // userId JWT token'dan alınıyor, isActive/Status entity default'larıyla başlıyor.
    const payload = {
      catalogId: newSub.catalogId,
      name: newSub.name,
      price: newSub.price,
      currency: newSub.currency,
      billingDay: newSub.billingDay,
      billingPeriod: newSub.billingPeriod ?? 'Monthly',
      // B-11: Yıllık abonelikler için fatura ayı backend'e iletilir
      billingMonth: newSub.billingMonth ?? null,
      category: newSub.category,
      colorCode: newSub.colorCode,
      hasContract: newSub.hasContract,
      contractStartDate: newSub.contractStartDate
        ? new Date(newSub.contractStartDate).toISOString()
        : null,
      contractEndDate: newSub.contractEndDate
        ? new Date(newSub.contractEndDate).toISOString()
        : null,
      notes: newSub.notes ?? null,
      // B-11: Paylaşım e-postaları backend'e iletilir (AddUserSubscriptionDto.SharedUserEmails).
      // AddSubscriptionPayload.sharedWith form katmanında string[] (sadece email) olarak gelir.
      sharedUserEmails: newSub.sharedWith ?? null,
    };

    const response = await agent.UserSubscriptions.create(payload);

      if (response && response.data) {
        const createdSub = {
          ...response.data,
          id: response.data.id.toString(),
          sharedWith: [],
          usageHistory: [],
          usageLogs: [],
        };
        set((state) => ({ subscriptions: [...state.subscriptions, createdSub] }));
        await saveCache('subscriptions', { items: get().subscriptions, totalCount: get().totalCount });

        // Paylaşım e-postaları varsa oluşturulan aboneliğe share isteği at.
        // Backend create sırasında kayıtsız emaili sessizce geçiyor; burada hata yakala ve uyar.
        const emails: string[] = payload.sharedUserEmails ?? [];
        const guests: string[] = newSub.sharedGuests ?? [];
        if (emails.length > 0 || guests.length > 0) {
          const shareResults = await Promise.allSettled([
            ...emails.map((email) => agent.UserSubscriptions.share(Number(createdSub.id), email)),
            ...guests.map((name) => agent.UserSubscriptions.shareGuest(Number(createdSub.id), name)),
          ]);
          const failedShares = shareResults
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .map((r) => r.reason?.response?.data?.errors?.[0] ?? 'Bir paylaşım işlemi başarısız oldu.');
          if (failedShares.length > 0) {
            Alert.alert('Paylaşım Uyarısı', failedShares[0]);
          }
          // Store'u paylaşım verileriyle güncelle (ID'ler 0, sonraki fetch'te doğrulanır)
          set((state) => ({
            subscriptions: state.subscriptions.map((s) =>
              s.id === createdSub.id
                ? { ...s, sharedGuests: guests.map((name) => ({ id: 0, displayName: name })) }
                : s
            ),
          }));
        }

        if (useSettingsStore.getState().calendarSyncEnabled) {
          await syncSubscriptionsToCalendar(get().subscriptions);
        }
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
      await saveCache('subscriptions', { items: get().subscriptions, totalCount: get().totalCount }); // [42]
      // F-8: takvim senkronizasyonu
      if (useSettingsStore.getState().calendarSyncEnabled) {
        await syncSubscriptionsToCalendar(get().subscriptions);
      }
    } catch (error) {
      // API hatası → listeyi geri yükle ve hatayı yukarı ilet
      console.error("Silme hatası:", error);
      set({ subscriptions: previousSubscriptions });
      throw error;
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

    // B-18: catch scope için try dışına alındı
    const STATUS_FIELDS: (keyof UserSubscription)[] = ['isActive', 'cancelledAt', 'cancelledDate', 'status', 'pausedDate'];
    const changedKeys = Object.keys(updatedData) as (keyof UserSubscription)[];
    const isStatusOnlyChange = changedKeys.length > 0 && changedKeys.every(k => STATUS_FIELDS.includes(k));
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
        // UpdateUserSubscriptionDto'daki field'larla birebir eşleşen payload.
        // id, userId, isActive, cancelledDate, usageHistoryJson DTO'da olmadığı için gönderilmiyor.
        const payload = {
          name: newSub.name,
          price: newSub.price,
          currency: newSub.currency,
          billingDay: newSub.billingDay,
          billingPeriod: newSub.billingPeriod ?? 'Monthly',
          // B-1: Yıllık abonelikte fatura ayı
          billingMonth: newSub.billingPeriod === 'Yearly' ? (newSub.billingMonth ?? null) : null,
          category: newSub.category,
          colorCode: newSub.colorCode,
          hasContract: newSub.hasContract,
          contractStartDate: newSub.contractStartDate ?? null,
          contractEndDate: newSub.contractEndDate ?? null,
          notes: newSub.notes ?? null,
          // B-6: sharedWithJson kaldırıldı — paylaşım değişikliği ayrı share/removeShare çağrılarıyla yapılıyor
        };

        await agent.UserSubscriptions.update(id, payload);

        // Paylaşım değişikliklerini share/removeShare endpoint'leriyle senkronize et.
        // Update'ten sonra, bağımsız olarak çalışır — sharing hatası update'i engellemez.
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
            .map((r) => r.reason?.response?.data?.errors?.[0] ?? 'Bir paylaşım işlemi başarısız oldu.');

          if (failedShares.length > 0) {
            Alert.alert('Paylaşım Uyarısı', failedShares[0]);
          }
        }

        // Üyesiz paylaşım (guest) değişikliklerini senkronize et
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
            .map((r) => r.reason?.response?.data?.errors?.[0] ?? 'Bir misafir paylaşım işlemi başarısız oldu.');
          if (failedGuests.length > 0) {
            Alert.alert('Paylaşım Uyarısı', failedGuests[0]);
          }

          // Gerçek ID'leri almak için tek aboneliği sessizce yenile
          if (addedGuests.length > 0 || removedGuests.length > 0) {
            try {
              const refreshed = await agent.UserSubscriptions.list(1, PAGE_SIZE);
              if (refreshed?.data) {
                const rawItems: any[] = Array.isArray(refreshed.data) ? refreshed.data : (refreshed.data?.items ?? []);
                const formatted = formatItems(rawItems);
                const updated = formatted.find((s) => s.id === id);
                if (updated) {
                  set((state) => ({
                    subscriptions: state.subscriptions.map((s) => s.id === id ? { ...s, sharedGuests: updated.sharedGuests } : s),
                  }));
                }
              }
            } catch {}
          }
        }
      }
      await saveCache('subscriptions', { items: get().subscriptions, totalCount: get().totalCount }); // [42]
      // F-8: takvim senkronizasyonu
      if (useSettingsStore.getState().calendarSyncEnabled) {
        await syncSubscriptionsToCalendar(get().subscriptions);
      }
    } catch (error: any) {
      // B-18: 409 = kontratlı abonelik erken iptal → onay dialog'u göster
      if (isStatusOnlyChange && apiStatus === 'Cancelled' && error?.response?.status === 409) {
        set((state) => ({
          subscriptions: state.subscriptions.map((s) => s.id === id ? oldSub : s),
        }));
        Alert.alert(
          'Aktif Kontrat',
          'Bu aboneliğin sözleşmesi henüz bitmedi. Yine de erken iptal etmek istiyor musunuz?',
          [
            { text: 'Vazgeç', style: 'cancel' },
            {
              text: 'Yine de İptal Et',
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
                  Alert.alert('Hata', 'İptal işlemi gerçekleştirilemedi. Lütfen tekrar deneyin.');
                }
              },
            },
          ]
        );
        return;
      }

      console.error("Güncelleme hatası:", error);
      set((state) => ({
        subscriptions: state.subscriptions.map((s) => s.id === id ? oldSub : s),
      }));
      Alert.alert('Hata', 'Değişiklikler kaydedilemedi. Lütfen tekrar deneyin.');
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

    // Backend'e survey geçmişini sync et — dedicated PATCH /survey endpoint kullanılıyor.
    // PUT /usersubscriptions/{id} yerine bu endpoint kullanılır çünkü PUT tüm alanları gerektirir;
    // sadece usageHistoryJson göndermek abonelik verisini bozardı.
    try {
      await agent.UserSubscriptions.updateSurvey(id, JSON.stringify(newHistory));
    } catch {
      // Sessizce başarısız ol — yerel veri AsyncStorage'a zaten kaydedildi
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
    const { subscriptions, exchangeRates } = get();
    return subscriptions
      .filter(sub => sub.isActive !== false)
      .reduce((total, sub) => {
        const rate = exchangeRates[sub.currency] || 1;
        // F-1: yıllık aboneliği aylık eşdeğerine çevir
        const monthlyPrice = sub.billingPeriod === 'Yearly' ? sub.price / 12 : sub.price;
        const priceInTry = monthlyPrice * rate;
        const partnerCount = (sub.sharedWith?.length || 0) + (sub.sharedGuests?.length || 0);
        const myShare = priceInTry / (partnerCount + 1);
        return total + myShare;
      }, 0);
  },

  getNextPayment: () => {
    const { subscriptions } = get();
    const activeSubs = subscriptions.filter(s => s.isActive !== false);
    if (activeSubs.length === 0) return null;

    // F-2: yıllık abonelikler için yıl-bazlı gün hesabı kullan
    return activeSubs.sort((a, b) => getDaysUntilNextBilling(a) - getDaysUntilNextBilling(b))[0];
  },
}));