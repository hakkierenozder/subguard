import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import agent from '../api/agent';
import { CatalogItem } from '../types';

interface CatalogState {
    catalogItems: CatalogItem[];
    loading: boolean;
    error: string | null;
    fetchCatalog: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>()(
    persist(
        (set) => ({
            catalogItems: [],
            loading: false,
            error: null,

            fetchCatalog: async () => {
                // Loading true yapıyoruz ama eski veriler ekranda kalmaya devam ediyor (Skeleton göstermiyoruz)
                set({ loading: true, error: null });
                try {
                    const response = await agent.Catalogs.list();
                    if (response && response.data) {
                        set({ catalogItems: response.data, loading: false });
                    } else {
                        set({ loading: false, error: 'Veri alınamadı' });
                    }
                } catch (error) {
                    console.error("Katalog hatası:", error);
                    set({ loading: false, error: 'Katalog yüklenirken hata oluştu' });
                }
            },
        }),
        {
            name: 'subguard-catalog-storage', // AsyncStorage key ismi
            storage: createJSONStorage(() => AsyncStorage), // React Native için adapter
            // Sadece catalogItems'ı kaydet, loading veya error durumunu kaydetme
            partialize: (state) => ({ catalogItems: state.catalogItems }), 
        }
    )
);