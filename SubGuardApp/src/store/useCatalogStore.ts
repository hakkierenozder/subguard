import { create } from 'zustand';
import { CatalogItem, CatalogState } from '../types'; // CatalogState import edildi
import agent from '../api/agent';

export const useCatalogStore = create<CatalogState>((set) => ({
  catalogItems: [],
  loading: false,
  error: null, // [41]

  reset: () => set({ catalogItems: [], loading: false, error: null }),

  fetchCatalog: async () => {
    set({ loading: true, error: null });
    try {
      // B-14: Tüm katalog sayfalarını çek. Backend CachedCatalogService in-memory sayfalıyor,
      // büyük pageSize ile tek istekte tüm listeyi almak mümkün.
      // pageSize=200 yeterince büyük; büyüyünce loop ile tüm sayfalar toplanır.
      const PAGE_SIZE = 200;
      let page = 1;
      let allItems: CatalogItem[] = [];
      let totalCount = 0;

      do {
        const response = await agent.Catalogs.list(page, PAGE_SIZE);
        const raw = response?.data;
        const items: CatalogItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
        totalCount = raw?.totalCount ?? items.length;
        allItems = [...allItems, ...items];
        page++;
      } while (allItems.length < totalCount);

      set({ catalogItems: allItems, loading: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Katalog yüklenemedi.';
      console.error('Katalog çekilemedi:', error);
      set({ loading: false, error: msg }); // [41] hata state'e yazılıyor
    }
  },
}));