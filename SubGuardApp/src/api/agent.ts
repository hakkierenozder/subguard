import axios from 'axios';
import Toast from 'react-native-toast-message';
import { getToken, getRefreshToken, saveToken, saveRefreshToken, removeToken, removeRefreshToken } from '../utils/AuthManager';
import { setNetworkStatus } from '../hooks/useNetworkStatus';
import { API_URL } from '../config';

export { API_URL };

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


// Refresh token başarısız olduğunda (süresi dolmuş, iptal edilmiş) çağrılacak callback.
// App.tsx tarafından NavigationContainer hazır olunca set edilir.
// Kullanıcıyı Login ekranına yönlendirir; token storage zaten temizlenir.
let _logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (fn: () => void) => { _logoutCallback = fn; };

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => { setNetworkStatus(true); return response; },
  async (error) => {
    const originalRequest = error.config;

    // --- 1. TOKEN YENİLEME — Promise Queue Pattern (race condition safe) ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      // _retry'ı HEMEN set et — kuyruğa alınan istekler de dahil, sonsuz döngü önlenir
      originalRequest._retry = true;

      if (isRefreshing) {
        // Başka bir istek zaten yeniliyor → kuyruğa al, yeni token bekliyoruz
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('Refresh token bulunamadı');

        const response = await axios.post(`${API_URL}/auth/create-token-by-refresh-token`, {
          token: refreshToken,
        }, { timeout: 15000 });

        const tokenData = response.data?.data;
        if (!tokenData?.accessToken) throw new Error('Geçersiz refresh yanıtı');

        const { accessToken, refreshToken: newRefreshToken } = tokenData;

        await saveToken(accessToken);
        await saveRefreshToken(newRefreshToken);

        axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

        // Bekleyen tüm istekleri yeni token ile çöz
        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await removeToken();
        await removeRefreshToken();
        // Token yenileme başarısız → kullanıcıyı Login'e yönlendir.
        // Callback set edilmemişse (NavigationContainer henüz hazır değil) sessizce geç.
        _logoutCallback?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- 2. MERKEZİ HATA GÖSTERİMİ ---
    if (error.response) {
      const { data, status } = error.response;
      let message = 'Bir hata oluştu.';

      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors[0];
      } else if (data?.errors && typeof data.errors === 'string') {
        message = data.errors;
      } else if (status === 403) {
        message = 'Bu işlem için yetkiniz yok.';
      } else if (status === 500) {
        message = 'Sunucu tarafında bir hata oluştu.';
      } else if (status === 404) {
        message = 'İstenilen kaynak bulunamadı.';
      }

      // 401 Token yenilemeye gider; Toast sadece yenileme de başarısız olursa (_retry) gösterilir.
      // 403 Forbidden her zaman gösterilir.
      if (status !== 401 || originalRequest._retry) {
        Toast.show({
          type: 'error',
          text1: 'Hata',
          text2: message,
          position: 'bottom',
          visibilityTime: 4000,
        });
      }
    } else if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      setNetworkStatus(false);
      Toast.show({
        type: 'error',
        text1: 'Bağlantı Hatası',
        text2: 'Sunucuya erişilemiyor. İnternet bağlantınızı kontrol edin.',
        position: 'bottom',
      });
    } else {
      setNetworkStatus(true);
    }

    return Promise.reject(error);
  }
);

const responseBody = (response: any) => response.data;

const requests = {
  get:   (url: string)                              => axiosInstance.get(url).then(responseBody),
  post:  (url: string, body: Record<string, unknown>) => axiosInstance.post(url, body).then(responseBody),
  put:   (url: string, body: Record<string, unknown>) => axiosInstance.put(url, body).then(responseBody),
  patch: (url: string, body: Record<string, unknown>) => axiosInstance.patch(url, body).then(responseBody),
  del:   (url: string)                              => axiosInstance.delete(url).then(responseBody),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = {
  get: (upcomingDays = 30) => requests.get(`/dashboard?upcomingDays=${upcomingDays}`),
};

// ─── Currencies ───────────────────────────────────────────────────────────────
const Currencies = {
  list: () => requests.get('/currencies'),
};

// ─── Catalogs ─────────────────────────────────────────────────────────────────
// #41: CachedCatalogService tüm kataloğu önbelleğe alıp in-memory sayfalıyor.
// Bu yüzden frontend'den pageSize büyük verilirse backend doğrudan önbellekten servis eder.
// pageSize varsayılanı 200 — katalog büyüdüğünde de tek istekte tüm liste alınır.
const Catalogs = {
  list:     (page = 1, pageSize = 200) => requests.get(`/catalogs?page=${page}&pageSize=${pageSize}`),
  details:  (id: number)    => requests.get(`/catalogs/${id}`),
  trending: (limit = 10)    => requests.get(`/catalogs/trending?limit=${limit}`),
};

// ─── UserSubscriptions ────────────────────────────────────────────────────────
const UserSubscriptions = {
  list:           (page = 1, pageSize = 20, q?: string) =>
    requests.get(`/usersubscriptions?page=${page}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  create:         (subscription: any)       => requests.post('/usersubscriptions', subscription),
  update:         (id: string | number, subscription: any) => requests.put(`/usersubscriptions/${id}`, subscription),
  delete:         (id: number | string)     => requests.del(`/usersubscriptions/${id}`),

  // Durum değiştirme (Aktif / Durduruldu / İptal)
  // forceCancel: kontratlı aboneliği erken iptal etmek için true gönderilir
  changeStatus:   (id: number | string, status: string, forceCancel = false) =>
    requests.patch(`/usersubscriptions/${id}/status`, { status, forceCancel }),

  // Kullanıcı e-posta kontrolü (paylaşım öncesi)
  checkUser:      (email: string) =>
    requests.get(`/usersubscriptions/check-user?email=${encodeURIComponent(email)}`),

  // Paylaşım
  sharedWithMe:   (page = 1, pageSize = 20) =>
    requests.get(`/usersubscriptions/shared-with-me?page=${page}&pageSize=${pageSize}`),
  share:          (id: number | string, email: string) =>
    requests.post(`/usersubscriptions/${id}/share`, { email }),
  removeShare:    (id: number | string, targetUserId: string) =>
    requests.del(`/usersubscriptions/${id}/share/${targetUserId}`),
  shareGuest:     (id: number | string, displayName: string) =>
    requests.post(`/usersubscriptions/${id}/share/guest`, { displayName }),
  removeGuestShare: (id: number | string, shareId: number) =>
    requests.del(`/usersubscriptions/${id}/share/guest/${shareId}`),

  // Kullanım geçmişi
  getUsage:       (id: number | string) => requests.get(`/usersubscriptions/${id}/usage`),
  addUsageLog:    (id: number | string, dto: any) => requests.post(`/usersubscriptions/${id}/usage`, dto),
  deleteUsageLog: (id: number | string, logId: string) => requests.del(`/usersubscriptions/${id}/usage/${logId}`),
  duplicate:      (id: number | string) => requests.post(`/usersubscriptions/${id}/duplicate`, {}),

  // Fiyat geçmişi
  priceHistory:   (id: number | string) => requests.get(`/usersubscriptions/${id}/price-history`),

  // Survey geçmişi (kullanım anketi) — ayrı PATCH endpoint, PUT abonelik verisine dokunmaz
  updateSurvey:   (id: number | string, usageHistoryJson: string) =>
    requests.patch(`/usersubscriptions/${id}/survey`, { usageHistoryJson }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
const Auth = {
  login:          (body: any) => requests.post('/auth/login', body),
  register:       (body: any) => requests.post('/auth/register', body),
  confirmEmail:          (userId: string, token: string) =>
    requests.post('/auth/confirm-email', { userId, token }),
  resendConfirmationEmail: (email: string) =>
    requests.post('/auth/resend-confirmation-email', { email }),
  getProfile:     ()          => requests.get('/auth/profile'),
  updateProfile:  (body: { fullName?: string; monthlyBudget?: number; monthlyBudgetCurrency?: string; budgetAlertThreshold?: number }) =>
    requests.put('/auth/profile', body),
  changePassword:      (body: any)     => requests.post('/auth/change-password', body),
  deleteAccount:       ()              => requests.del('/auth/me'),
  revokeRefreshToken:  (token: string) => requests.post('/auth/revoke-refresh-token', { token }),
  forgotPassword:      (email: string) => requests.post('/auth/forgot-password', { email }),
  resetPassword:       (userId: string, otp: string, newPassword: string) =>
    requests.post('/auth/reset-password', { userId, otp, newPassword }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
const Notifications = {
  list:              (page = 1, pageSize = 20) =>
    requests.get(`/notifications?page=${page}&pageSize=${pageSize}`),
  markAsRead:        (id: number)  => requests.put(`/notifications/${id}/read`, {}),
  markAllAsRead:     ()            => requests.put('/notifications/read-all', {}),
  delete:            (id: number)  => requests.del(`/notifications/${id}`),
  registerPushToken:  (token: string) => requests.put('/notifications/push-token', { token }),
  getPreferences:     ()              => requests.get('/notifications/preferences'),
  updatePreferences:  (body: { pushEnabled: boolean; emailEnabled: boolean; budgetAlertEnabled?: boolean; sharedAlertEnabled?: boolean; reminderDaysBefore: number; notifyHour?: number }) =>
    requests.put('/notifications/preferences', body),   // #33: POST → PUT (idempotent güncelleme)
  sendReminder:       (subscriptionId: number | string) =>
    requests.post(`/notifications/send-reminder/${subscriptionId}`, {}),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
const Admin = {
  getStats:      ()                              => requests.get('/admin/stats'),
  getUsers:      (search = '', page = 1, pageSize = 20) =>
    requests.get(`/admin/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`),
  getUser:       (id: string)                    => requests.get(`/admin/users/${id}`),
  deactivate:    (id: string)                    => requests.patch(`/admin/users/${id}/deactivate`, {}),
  activate:      (id: string)                    => requests.patch(`/admin/users/${id}/activate`, {}),
  assignRole:    (email: string)                 => requests.post('/admin/assign-role', { email }),
  removeRole:    (email: string)                 => requests.post('/admin/remove-role', { email }),
  // Katalog/Plan CRUD (backend zaten hazır)
  createCatalog: (dto: Record<string, unknown>)  => requests.post('/admin/catalogs', dto),
  updateCatalog: (id: number, dto: Record<string, unknown>) => requests.put(`/admin/catalogs/${id}`, dto),
  deleteCatalog: (id: number)                    => requests.del(`/admin/catalogs/${id}`),
  createPlan:    (catalogId: number, dto: Record<string, unknown>) => requests.post(`/admin/catalogs/${catalogId}/plans`, dto),
  updatePlan:    (id: number, dto: Record<string, unknown>) => requests.put(`/admin/plans/${id}`, dto),
  deletePlan:    (id: number)                    => requests.del(`/admin/plans/${id}`),
};

// ─── Budget ───────────────────────────────────────────────────────────────────
// PUT /budget/settings → BudgetController (ayrı endpoint, profile'dan bağımsız)
const Budget = {
  updateSettings: (body: { monthlyBudget: number; monthlyBudgetCurrency: string }) =>
    requests.put('/budget/settings', body),
};

// ─── Category Budgets ─────────────────────────────────────────────────────────
const CategoryBudgets = {
  getAll: () => requests.get('/budget/categories'),
  upsert: (body: { category: string; monthlyLimit: number }) =>
    requests.put('/budget/categories', body),
  remove: (category: string) =>
    requests.del(`/budget/categories/${encodeURIComponent(category)}`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
const Reports = {
  spending: (from: string, to: string) =>
    requests.get(`/reports/spending?from=${from}&to=${to}`),
};

export default {
  Dashboard,
  Catalogs,
  UserSubscriptions,
  Currencies,
  Auth,
  Admin,
  Budget,
  CategoryBudgets,
  Notifications,
  Reports,
};
