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
  createdDate?: string;   // ISO string — BaseEntity'den gelir, trend hesabı için gerekli
  catalogId?: number;
  userId?: string;
  name: string;
  logoUrl?: string;
  colorCode?: string | null;
  price: number;
  currency: string;
  category: string;

  // Backend BillingPeriod enum → JsonStringEnumConverter → "Monthly" | "Yearly"
  billingPeriod?: 'Monthly' | 'Yearly';
  billingDay: number;
  /** Yıllık abonelikler için fatura ayı (1-12). Null/undefined ise createdDate.getMonth()+1 kullanılır. */
  billingMonth?: number | null;
  firstPaymentDate?: string;

  hasContract: boolean;
  contractStartDate?: string;  // ISO string
  contractEndDate?: string;    // ISO string

  notificationId?: string;

  // Üyeli paylaşım: { email, userId } çifti — removeShare için userId zorunlu
  sharedWith?: { email: string; userId: string }[];
  // Üyesiz paylaşım: sadece isim, shareId kaldırma için gerekli
  sharedGuests?: { id: number; displayName: string }[];

  // Survey: YEREL, AsyncStorage'da tutulur — backend'e gönderilmez
  usageHistory?: UsageLog[];

  // Backend usage log: /api/usersubscriptions/{id}/usage endpoint'i (backend UsageLogDto[])
  usageLogs?: ApiUsageLog[];

  notes?: string | null;

  // Benimle paylaşım bilgileri (SharedWithMeItemDto'dan)
  sharedAt?: string | null;
  ownerEmail?: string | null;
  ownerFullName?: string | null;

  isActive: boolean;
  // Backend'de CancelledDate (PascalCase) → camelCase'de cancelledDate
  // cancelledAt alias olarak da desteklenir (geçiş dönemi uyumu)
  cancelledDate?: string | null;
  cancelledAt?: string | null;
  pausedDate?: string | null;
  accessUntilDate?: string | null;
  status?: 'Active' | 'Paused' | 'Cancelled';
}

// ─── SURVEY (yerel, AsyncStorage tabanlı) ───────────────────────────────────
// "Bu ay bu aboneliği kullandın mı?" sorusunun cevabı — backend'e gönderilmez
export type UsageStatus = 'active' | 'low' | 'none';

export interface UsageLog {
  month: string;  // "2024-03"
  status: UsageStatus;
}

// ─── BACKEND USAGE LOG (SubGuard.Core.DTOs.UsageLogDto ile birebir) ─────────
// GET/POST /api/usersubscriptions/{id}/usage endpoint'lerinden dönen kayıt
export interface ApiUsageLog {
  id: string;
  date: string;    // ISO datetime string
  note?: string;
  amount?: number;
  unit?: string;   // "saat", "GB", "adet" vb.
}

// Abonelik oluştururken formdan gelen payload (id, isActive vb. backend tarafından atanır)
export interface AddSubscriptionPayload {
  catalogId?: number;
  name: string;
  price: number;
  currency: string;
  billingDay: number;
  billingMonth?: number | null;
  billingPeriod?: 'Monthly' | 'Yearly';
  firstPaymentDate?: string;
  category: string;
  colorCode?: string;
  hasContract?: boolean;
  contractStartDate?: string;
  contractEndDate?: string;
  sharedWith?: string[];       // üyeli kullanıcı emailleri
  sharedGuests?: string[];     // üyesiz kullanıcı isimleri
  notes?: string;
}

// Backend API'den gelen raw UserSubscription response shape
export interface RawSubscriptionApiItem {
  id: number | string;
  createdDate?: string;
  catalogId?: number;
  userId?: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  billingDay: number;
  billingMonth?: number | null;
  billingPeriod?: 'Monthly' | 'Yearly';
  firstPaymentDate?: string | null;
  colorCode?: string | null;
  hasContract: boolean;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  notes?: string | null;
  isActive: boolean;
  status?: 'Active' | 'Paused' | 'Cancelled';
  pausedDate?: string | null;
  cancelledDate?: string | null;
  cancelledAt?: string | null;
  accessUntilDate?: string | null;
  // B-13: Üyeli paylaşım e-postaları ve userId'leri
  sharedUserEmails?: string[];
  sharedUserIds?: string[];
  // Üyesiz paylaşımlar
  sharedGuests?: { id: number; displayName: string }[];
  // Benimle paylaşım alanları (SharedWithMeItemDto'dan)
  sharedAt?: string | null;
  ownerEmail?: string | null;
  ownerFullName?: string | null;
}

export interface CategoryBudget {
  category: string;
  monthlyLimit: number;
  spent: number;
  currency: string;
  remaining: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface PriceHistoryEntry {
  oldPrice: number;
  newPrice: number;
  currency: string;
  changedAt: string; // ISO string (UTC)
}

export interface CatalogState {
    catalogItems: CatalogItem[];
    loading: boolean;
    error: string | null; // [41] hata durumu
    fetchCatalog: () => Promise<void>;
    reset: () => void;
}

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  isSent: boolean;
  createdDate: string;
  scheduledDate: string;
  readDate?: string | null;
  type?: 'Payment' | 'Budget' | 'CategoryBudget' | 'Shared' | 'Contract';
  userSubscriptionId?: number | null;
}

// ─── DASHBOARD (SubGuard.Core.DTOs.DashboardDto ile birebir) ─────────────────
export interface DashboardDto {
  activeSubscriptionCount: number;
  pendingSubscriptionCount: number;
  pausedCount: number;
  cancelledCount: number;
  startedMonthlyEquivalentTotal: number;
  pendingMonthlyEquivalentTotal: number;
  totalByCurrency: CurrencyTotalDto[];
  spendingByCategory: CategorySpendingDto[];
  upcomingPayments: UpcomingPaymentDto[];
  budgetSummary: BudgetSummaryDto | null;
}

export interface SpendingLineDto {
  subscriptionId: number;
  name: string;
  category: string;
  currency: string;
  unitPrice: number;
  paymentCount: number;
  totalAmount: number;
  billingPeriod: 'Monthly' | 'Yearly' | string;
}

export interface SpendingReportDto {
  from: string;
  to: string;
  totalByCurrency: Record<string, number>;
  lines: SpendingLineDto[];
}

export interface BudgetSummaryDto {
  monthlyBudget: number;
  currency: string;
  totalSpent: number;
  remaining: number;
  isOverBudget: boolean;
  overAmount: number;
}

export interface CurrencyTotalDto {
  currency: string;
  total: number;
}

export interface CategorySpendingDto {
  category: string;
  currency: string;
  total: number;
  count: number;
}

export interface UpcomingPaymentDto {
  id: number;
  name: string;
  price: number;
  currency: string;
  billingDay: number;
  daysUntilPayment: number;
  colorCode?: string | null;
  billingPeriod?: 'Monthly' | 'Yearly';
  notes?: string | null;
}

// ─── USER PROFILE (SubGuard.Core.DTOs.Auth.UserProfileDto ile birebir) ───────
export interface UserProfileDto {
  email: string;
  fullName: string;
  totalSubscriptions: number;
  monthlyBudget: number;
  monthlyBudgetCurrency?: string | null;
  budgetAlertThreshold?: number;
  budgetAlertEnabled?: boolean;
  sharedAlertEnabled?: boolean;
  isAdmin?: boolean;
}
