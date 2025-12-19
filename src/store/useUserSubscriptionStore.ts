import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSubscription } from '../types';

interface UserSubscriptionState {
  subscriptions: UserSubscription[];
  
  // Aksiyonlar
  addSubscription: (sub: UserSubscription) => void;
  removeSubscription: (id: string) => void;
  
  // Hesaplanan Veriler (Toplam Gider vb.)
  getTotalExpense: () => number;
}

export const useUserSubscriptionStore = create<UserSubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],

      addSubscription: (sub) => {
        set((state) => ({
          subscriptions: [...state.subscriptions, sub],
        }));
      },

      removeSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        }));
      },

      getTotalExpense: () => {
        // Basitçe tüm aboneliklerin fiyatını toplar
        return get().subscriptions.reduce((total, sub) => total + sub.price, 0);
      },
    }),
    {
      name: 'user-subscriptions-storage', // Telefon hafızasındaki dosya adı
      storage: createJSONStorage(() => AsyncStorage), // Kayıt motoru
    }
  )
);