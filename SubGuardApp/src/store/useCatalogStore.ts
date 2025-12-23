import { create } from 'zustand';
import { CatalogItem, CatalogState } from '../types'; // CatalogState import edildi
import agent from '../api/agent';

export const useCatalogStore = create<CatalogState>((set) => ({
  catalogItems: [],
  loading: false,

  fetchCatalog: async () => {
    set({ loading: true });
    try {
      const response = await agent.Catalogs.list();
      // Backend yapına göre response.data veya response.data.data kontrolü
      const items = response?.data || [];
      
      set({ catalogItems: items, loading: false });
    } catch (error) {
      console.error('Katalog çekilemedi:', error);
      set({ loading: false });
    }
  },
}));