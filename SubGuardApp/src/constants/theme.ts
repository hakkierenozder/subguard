// SubGuardApp/src/constants/theme.ts

export const COLORS = {
  // Ana Marka Renkleri (Güven ve Teknoloji hissi veren Maviler/Morlar)
  primary: '#4F46E5', // İndigo mavisi - Ana aksiyonlar için
  secondary: '#7C3AED', // Mor - Vurgular için
  tertiary: '#EC4899', // Pembe - Dikkat çekici butonlar/ikonlar için
  
  // Arkaplanlar
  background: '#F9FAFB', // Çok açık gri (Göz yormayan beyaz alternatifi)
  cardBackground: '#FFFFFF',
  
  // Metin Renkleri
  textPrimary: '#1F2937', // Koyu gri (Siyah yerine)
  textSecondary: '#6B7280', // Gri
  textLight: '#FFFFFF',
  
  // Durum Renkleri
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Kenarlıklar
  border: '#E5E7EB',
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const SIZES = {
  padding: 20,
  radius: 12,
  h1: 24,
  h2: 20,
  h3: 16,
  body: 14,
};