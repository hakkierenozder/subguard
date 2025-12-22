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
  requiresContract: boolean;
  plans?: Plan[];
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  errors: string[] | null;
}

export interface UserSubscription {
  id: number; // DÜZELTME: Backend int olduğu için number yaptık
  catalogId?: number;
  userId?: string;
  name: string;
  logoUrl?: string;
  colorCode?: string;
  price: number;
  currency: string;
  category: string;

  billingPeriod: 'monthly' | 'yearly';
  billingDay: number;

  hasContract: boolean;
  contractStartDate?: string;
  contractEndDate?: string;

  notificationId?: string;
  
  sharedWith?: string[];
  usageHistory?: UsageLog[];

  sharedWithJson?: string | null;
  usageHistoryJson?: string | null;

  isActive: boolean;
}

// --- EKSİK DTO'LAR EKLENDİ ---
export interface UserSubscriptionCreateDto {
  catalogId?: number;
  name: string;
  price: number;
  currency: string;
  category: string;
  billingDay: number;
  colorCode?: string;
  logoUrl?: string;
  sharedWith?: string[];
  hasContract?: boolean;
  contractStartDate?: string;
  contractEndDate?: string;
}

export interface UserSubscriptionUpdateDto {
  catalogId?: number;
  name?: string;
  price?: number;
  currency?: string;
  billingDay?: number;
  category?: string;
  colorCode?: string;
  logoUrl?: string;
  sharedWith?: string[];
  hasContract?: boolean;
  contractStartDate?: string;
  contractEndDate?: string;
  isActive?: boolean;
}

export type UsageStatus = 'active' | 'low' | 'none';

export interface UsageLog {
  month: string;
  status: UsageStatus;
}

export interface CatalogState {
    catalogItems: CatalogItem[];
    loading: boolean;
    fetchCatalog: () => Promise<void>;
}