import { useSettingsStore } from "../store/useSettingsStore";

// src/constants/theme.ts
// Sabit Renkler (Marka Kimliği)
const PALETTE = {
    slate900: '#0F172A',
    slate800: '#1E293B',
    slate700: '#334155', // Ana Renk
    slate500: '#64748B',
    slate200: '#E2E8F0',
    slate100: '#F1F5F9',
    slate50:  '#F8FAFC',
    
    white: '#FFFFFF',
    black: '#000000',
    
    indigo: '#4F46E5',
    red: '#EF4444',
    emerald: '#10B981',
    
    // Dark Mode Özel
    darkBg: '#020617',      // Slate 950
    darkCard: '#1E293B',    // Slate 800
    darkBorder: '#334155',  // Slate 700
    darkTextMain: '#F8FAFC', // Slate 50
    darkTextSec: '#94A3B8', // Slate 400
};
export const THEME = {
    primary: '#334155',    // Slate 700 - Fırtına Mavisi
    primaryDark: '#1E293B',// Slate 800
    accent: '#4F46E5',     // Indigo
    bg: '#F8FAFC',         // Slate 50 - Arka Plan
    inputBg: '#F1F5F9',    // Slate 100
    border: '#E2E8F0',     // Slate 200
    textMain: '#0F172A',   // Slate 900
    textSec: '#64748B',    // Slate 500
    white: '#FFFFFF',
    error: '#EF4444',      // Red 500
    success: '#10B981',    // Emerald 500
    cardBg: '#FFFFFF',
    inactive: '#94A3B8'
};


// Dinamik Tema Hook'u
// Merkezi kategori renk paleti (tüm ekranlar bu kaynaktan kullanır)
export const CATEGORY_COLORS: Record<string, string> = {
  // İngilizce anahtarlar (ExpenseChart / katalog)
  Streaming:    '#E50914',
  Music:        '#1DB954',
  GSM:          '#FFC900',
  Cloud:        '#00A8E8',
  Gaming:       '#9B59B6',
  Game:         '#9B59B6',
  Fitness:      '#FF6B35',
  Productivity: '#4ECDC4',
  News:         '#45B7D1',
  Education:    '#96CEB4',
  // Türkçe anahtarlar (BudgetScreen / kullanıcı kategorileri)
  Müzik:        '#EC4899',
  Oyun:         '#F59E0B',
  Yazılım:      '#10B981',
  Eğitim:       '#3B82F6',
  Haber:        '#8B5CF6',
  // Genel
  Diğer:        '#64748B',
  Genel:        '#94A3B8',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#64748B';
}

export const useThemeColors = () => {
    const isDarkMode = useSettingsStore((state) => state.isDarkMode);

    if (isDarkMode) {
        return {
            ...THEME,
            bg: PALETTE.darkBg,
            cardBg: PALETTE.darkCard,
            textMain: PALETTE.darkTextMain,
            textSec: PALETTE.darkTextSec,
            border: PALETTE.darkBorder,
            inputBg: PALETTE.slate800, // Inputlar koyu olsun
            primary: '#475569', // Dark mode'da primary biraz daha açık olabilir veya aynı kalabilir
            primaryDark: '#0F172A',
        };
    }

    return THEME;
};