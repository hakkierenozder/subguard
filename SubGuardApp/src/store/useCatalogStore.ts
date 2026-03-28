import { create } from 'zustand';
import { CatalogItem, CatalogState } from '../types'; // CatalogState import edildi
import agent from '../api/agent';

export const useCatalogStore = create<CatalogState>((set) => ({
  catalogItems: [],
  loading: false,
  error: null, // [41]

  fetchCatalog: async () => {
    set({ loading: true, error: null });
    try {
      const response = await agent.Catalogs.list();
      // Backend PagedResponseDto döndürüyor: { items: [...], totalCount: N }
      const raw = response?.data;
      const items: CatalogItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      set({ catalogItems: items, loading: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Katalog yüklenemedi.';
      console.error('Katalog çekilemedi:', error);
      set({ loading: false, error: msg }); // [41] hata state'e yazılıyor
    }
  },
}));