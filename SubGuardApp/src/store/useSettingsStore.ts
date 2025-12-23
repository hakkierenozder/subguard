import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  
  toggleDarkMode: () => void;
  toggleNotifications: (isEnabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      notificationsEnabled: true,

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      toggleNotifications: (isEnabled: boolean) => set({ notificationsEnabled: isEnabled }),
    }),
    {
      name: 'subguard-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);