export interface Plan {
  id: number;
  name: string;
  price: number;
  currency: string;
  billingCycleDays: number;
}

export interface CatalogItem {
  id: number;
  name: string;
  logoUrl?: string;
  colorCode?: string;
  category: string;
  requiresContract: boolean; // Backend'de zaten var!
  plans?: Plan[];
}

export interface ApiResponse<T> {
  data: T;           // Asıl veri burada
  statusCode: number;
  errors: string[] | null;
}

export interface UserSubscription {
  id: string;
  catalogId: number;
  name: string;
  logoUrl?: string;
  colorCode?: string;
  price: number;
  currency: string;

  billingPeriod: 'monthly' | 'yearly';
  billingDay: number; // Fatura kesim günü (örn: Her ayın 15'i)

  // YENİ EKLENENLER (Taahhüt Sayacı İçin)
  hasContract: boolean;        // Sözleşmeli mi?
  contractStartDate?: string;  // Başlangıç (ISO String)
  contractEndDate?: string;    // Bitiş (Kritik Alan!)

  notificationId?: string;
  
  // YENİ: Ortakçı Listesi (Sadece isimleri tutuyoruz şimdilik)
  sharedWith?: string[];
}
