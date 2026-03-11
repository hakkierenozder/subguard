import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  budgetAlertThreshold: number; // 0-100 arası yüzde, ör: 80
  onboardingCompleted: boolean;

  toggleDarkMode: () => void;
  toggleNotifications: (isEnabled: boolean) => void;
  setBudgetAlertThreshold: (value: number) => void;
  setOnboardingCompleted: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      notificationsEnabled: true,
      budgetAlertThreshold: 80,
      onboardingCompleted: false,

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleNotifications: (isEnabled: boolean) => set({ notificationsEnabled: isEnabled }),
      setBudgetAlertThreshold: (value: number) => set({ budgetAlertThreshold: value }),
      setOnboardingCompleted: () => set({ onboardingCompleted: true }),
    }),
    {
      name: 'subguard-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);