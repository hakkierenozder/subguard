export interface Plan {
  id: number;
  name: string;      // "Premium"
  price: number;     // 229.99
  currency: string;  // "TRY"
  billingCycleDays: number;
}

export interface CatalogItem {
  id: number;
  name: string;      // "Netflix"
  logoUrl: string;   
  colorCode: string; // "#E50914"
  category: string;
  plans: Plan[];     // İçinde planları da barındırır
}

export interface ApiResponse<T> {
  data: T;           // Asıl veri burada
  statusCode: number;
  errors: string[] | null;
}

export interface UserSubscription {
  id: string;               // Local Unique ID (Silmek/Düzenlemek için)
  catalogId?: number;       // Katalogdan geldiyse ID'si
  
  name: string;             // "Netflix"
  logoUrl?: string;         // Logosu
  colorCode?: string;       // "#E50914"
  
  price: number;            // 229.99
  currency: string;         // "TRY"
  
  billingPeriod: 'monthly' | 'yearly';
  billingDay: number;       // Her ayın kaçı? (Örn: 15)
  nextBillingDate: string;  // "2024-03-15" (Hesaplama için kritik)

  // Taahhüt Bilgileri (Faz 1'in yıldızı)
  hasContract: boolean;
  contractEndDate?: string; // "2025-01-20"
}