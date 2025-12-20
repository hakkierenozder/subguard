import { create } from 'zustand';
import { CatalogItem } from '../types';
import agent from '../api/agent'; // Import the agent

interface CatalogState {
  items: CatalogItem[];
  loading: boolean;
  error: string | null;
  
  // Aksiyon (Fonksiyon)
  fetchCatalogs: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchCatalogs: async () => {
    set({ loading: true, error: null });
    
    try {
      // API'ye git
      const response = await agent.Catalogs.list();
      
      // Gelen veriyi (response.data.data) state'e at
      // Backend yapımız: { data: [...], statusCode: 200 } olduğu için response.data alıyoruz
      set({ items: response.data, loading: false });
      
    } catch (err) {
      console.error("API Hatası:", err);
      set({ error: 'Veri çekilemedi. IP ayarlarını kontrol et.', loading: false });
    }
  }
}));