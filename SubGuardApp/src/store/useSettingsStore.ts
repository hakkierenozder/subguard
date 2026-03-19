import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  // Mevcut
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  budgetAlertThreshold: number; // 0-100 arası yüzde
  onboardingCompleted: boolean;

  // 19 — Bildirim Tercihleri
  notifyDaysBefore: 1 | 3 | 7;
  budgetAlertEnabled: boolean;
  sharedAlertEnabled: boolean;
  notifyHour: number; // 0-23

  // 20 — Para Birimi (#49: GBP eklendi)
  defaultCurrency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  autoConvert: boolean;

  // 22 — Uygulama Kilidi
  appLockEnabled: boolean;
  appLockMethod: 'pin' | 'biometric';
  lockAfterMinutes: 5 | 15 | 30 | 60;

  // 23 — Takvim Senkronizasyonu
  calendarSyncEnabled: boolean;
  setCalendarSyncEnabled: (v: boolean) => void;

  // 35 — Dashboard yaklaşan ödeme aralığı
  dashboardUpcomingDays: 7 | 14 | 30;
  setDashboardUpcomingDays: (v: 7 | 14 | 30) => void;

  // Actions — Mevcut
  toggleDarkMode: () => void;
  toggleNotifications: (isEnabled: boolean) => void;
  setBudgetAlertThreshold: (value: number) => void;
  setOnboardingCompleted: () => void;

  // Actions — 19
  setNotifyDaysBefore: (v: 1 | 3 | 7) => void;
  setBudgetAlertEnabled: (v: boolean) => void;
  setSharedAlertEnabled: (v: boolean) => void;
  setNotifyHour: (v: number) => void;

  // Actions — 20
  setDefaultCurrency: (v: 'TRY' | 'USD' | 'EUR' | 'GBP') => void;
  setAutoConvert: (v: boolean) => void;

  // Actions — 22
  setAppLockEnabled: (v: boolean) => void;
  setAppLockMethod: (v: 'pin' | 'biometric') => void;
  setLockAfterMinutes: (v: 5 | 15 | 30 | 60) => void;

  // Budget sync
  monthlyBudget: number;
  setMonthlyBudget: (v: number) => void;

  // Admin — profil yüklenince set edilir, persist edilmez (session bilgisi)
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Mevcut defaults
      isDarkMode: false,
      notificationsEnabled: true,
      budgetAlertThreshold: 80,
      onboardingCompleted: false,

      // 19 defaults
      notifyDaysBefore: 3,
      budgetAlertEnabled: true,
      sharedAlertEnabled: true,
      notifyHour: 9,

      // 20 defaults
      defaultCurrency: 'TRY',
      autoConvert: true,

      // 22 defaults
      appLockEnabled: false,
      appLockMethod: 'pin',
      lockAfterMinutes: 15,

      // 23 defaults
      calendarSyncEnabled: false,

      // 35 defaults
      dashboardUpcomingDays: 30,

      // Actions
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      toggleNotifications: (isEnabled) => set({ notificationsEnabled: isEnabled }),
      setBudgetAlertThreshold: (value) => set({ budgetAlertThreshold: value }),
      setOnboardingCompleted: () => set({ onboardingCompleted: true }),

      setNotifyDaysBefore: (v) => set({ notifyDaysBefore: v }),
      setBudgetAlertEnabled: (v) => set({ budgetAlertEnabled: v }),
      setSharedAlertEnabled: (v) => set({ sharedAlertEnabled: v }),
      setNotifyHour: (v) => set({ notifyHour: v }),

      setDefaultCurrency: (v) => set({ defaultCurrency: v }),
      setAutoConvert: (v) => set({ autoConvert: v }),

      setAppLockEnabled: (v) => set({ appLockEnabled: v }),
      setAppLockMethod: (v) => set({ appLockMethod: v }),
      setLockAfterMinutes: (v) => set({ lockAfterMinutes: v }),
      setCalendarSyncEnabled: (v) => set({ calendarSyncEnabled: v }),
      setDashboardUpcomingDays: (v) => set({ dashboardUpcomingDays: v }),

      monthlyBudget: 0,
      setMonthlyBudget: (v) => set({ monthlyBudget: v }),

      isAdmin: false,
      setIsAdmin: (v) => set({ isAdmin: v }),
    }),
    {
      name: 'subguard-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // isAdmin persist edilmez — her oturumda profil yüklenince belirlenir
      partialize: (state) => {
        const { isAdmin, setIsAdmin, ...persisted } = state;
        return persisted;
      },
    }
  )
);
