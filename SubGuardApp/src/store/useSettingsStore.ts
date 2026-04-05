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
  notifyDaysBefore: number;
  budgetAlertEnabled: boolean;
  sharedAlertEnabled: boolean;
  emailEnabled: boolean; // F-9: push'tan bağımsız e-posta bildirimi
  notifyHour: number; // 0-23

  // 20 — Para Birimi (#49: GBP eklendi)

  // 22 — Uygulama Kilidi
  appLockEnabled: boolean;

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
  setNotifyDaysBefore: (v: number) => void;
  setBudgetAlertEnabled: (v: boolean) => void;
  setSharedAlertEnabled: (v: boolean) => void;
  setEmailEnabled: (v: boolean) => void; // F-9
  setNotifyHour: (v: number) => void;

  // Actions — 20

  // Actions — 22
  setAppLockEnabled: (v: boolean) => void;

  // Budget sync
  monthlyBudget: number;
  setMonthlyBudget: (v: number) => void;
  monthlyBudgetCurrency: 'TRY' | 'USD' | 'EUR' | 'GBP';
  setMonthlyBudgetCurrency: (v: 'TRY' | 'USD' | 'EUR' | 'GBP') => void;

  // Admin — profil yüklenince set edilir, persist edilmez (session bilgisi)
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;

  /**
   * Kullanıcıya özgü tüm ayarları sıfırlar.
   * Logout ve hesap silme sırasında çağrılmalı — aynı cihazda farklı kullanıcı girişinde veri sızıntısını önler.
   */
  clearUserSettings: () => void;
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
      emailEnabled: true, // F-9
      notifyHour: 9,

      // 20 defaults

      // 22 defaults
      appLockEnabled: false,

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
      setEmailEnabled: (v) => set({ emailEnabled: v }), // F-9
      setNotifyHour: (v) => set({ notifyHour: v }),


      setAppLockEnabled: (v) => set({ appLockEnabled: v }),
      setCalendarSyncEnabled: (v) => set({ calendarSyncEnabled: v }),
      setDashboardUpcomingDays: (v) => set({ dashboardUpcomingDays: v }),

      monthlyBudget: 0,
      setMonthlyBudget: (v) => set({ monthlyBudget: v }),
      monthlyBudgetCurrency: 'TRY',
      setMonthlyBudgetCurrency: (v) => set({ monthlyBudgetCurrency: v }),

      isAdmin: false,
      setIsAdmin: (v) => set({ isAdmin: v }),

      clearUserSettings: () => set({
        // Kullanıcıya özgü — sıfırlanır
        notificationsEnabled: true,
        budgetAlertThreshold: 80,
        notifyDaysBefore: 3,
        budgetAlertEnabled: true,
        sharedAlertEnabled: true,
        emailEnabled: true,
        notifyHour: 9,
        calendarSyncEnabled: false,
        dashboardUpcomingDays: 30,
        monthlyBudget: 0,
        monthlyBudgetCurrency: 'TRY',
        isAdmin: false,
        // Cihaz düzeyinde — korunur: isDarkMode, onboardingCompleted, appLockEnabled
      }),
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
