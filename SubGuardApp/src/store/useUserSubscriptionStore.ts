import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSubscription, UserSubscriptionCreateDto, UserSubscriptionUpdateDto } from '../types';
import agent from '../api/agent';

interface UserSubscriptionState {
    subscriptions: UserSubscription[];
    loading: boolean;
    error: string | null;
    fetchUserSubscriptions: () => Promise<void>;
    addSubscription: (dto: UserSubscriptionCreateDto) => Promise<void>;
    updateSubscription: (id: number, dto: UserSubscriptionUpdateDto) => Promise<void>;
    removeSubscription: (id: number) => Promise<void>;
    logUsage: (subscriptionId: number, status: string) => Promise<void>;
    getTotalExpense: () => number;
    getPendingSurvey: () => UserSubscription | undefined;
}

export const useUserSubscriptionStore = create<UserSubscriptionState>()(
    persist(
        (set, get) => ({
            subscriptions: [],
            loading: false,
            error: null,

            fetchUserSubscriptions: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await agent.UserSubscriptions.list();
                    if (response && response.data) {
                        set({ subscriptions: response.data, loading: false });
                    }
                } catch (error) {
                    set({ loading: false, error: 'Abonelikler yüklenemedi' });
                }
            },

            addSubscription: async (dto) => {
                set({ loading: true, error: null });
                try {
                    await agent.UserSubscriptions.create(dto);
                    await get().fetchUserSubscriptions();
                } catch (error) {
                    set({ loading: false, error: 'Ekleme başarısız' });
                    throw error;
                }
            },

            updateSubscription: async (id, dto) => {
                set({ loading: true, error: null });
                try {
                    await agent.UserSubscriptions.update(id, dto);
                    await get().fetchUserSubscriptions();
                } catch (error) {
                    set({ loading: false, error: 'Güncelleme başarısız' });
                    throw error;
                }
            },

            removeSubscription: async (id) => {
                set({ loading: true, error: null });
                try {
                    await agent.UserSubscriptions.delete(id);
                    await get().fetchUserSubscriptions();
                } catch (error) {
                    set({ loading: false, error: 'Silme başarısız' });
                }
            },

            logUsage: async (subscriptionId, status) => {
                try {
                    await agent.UserSubscriptions.logUsage(subscriptionId, { status });
                    await get().fetchUserSubscriptions(); 
                } catch (error) {
                    console.error("Usage log error", error);
                }
            },

            getTotalExpense: () => {
                const { subscriptions } = get();
                return subscriptions
                    .filter(sub => sub.isActive !== false)
                    .reduce((total, sub) => total + sub.price, 0);
            },

            getPendingSurvey: () => {
                const { subscriptions } = get();
                const activeSubs = subscriptions.filter(s => s.isActive !== false);
                if (activeSubs.length === 0) return undefined;
                
                if (Math.random() > 0.7) {
                    const randomIndex = Math.floor(Math.random() * activeSubs.length);
                    return activeSubs[randomIndex];
                }
                return undefined;
            }
        }),
        {
            name: 'subguard-user-subscriptions-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ subscriptions: state.subscriptions }),
        }
    )
);