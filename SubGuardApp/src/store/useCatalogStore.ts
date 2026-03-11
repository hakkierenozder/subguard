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
      // Backend PagedResponseDto döndürüyor: { items: [...], totalCount: N }
      const raw = response?.data;
      const items: CatalogItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      set({ catalogItems: items, loading: false });
    } catch (error) {
      console.error('Katalog çekilemedi:', error);
      set({ loading: false });
    }
  },
}));