import axios from 'axios';
import Toast from 'react-native-toast-message';
import { getToken, getRefreshToken, saveToken, saveRefreshToken, removeToken } from '../utils/AuthManager';
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
        });

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
      } else if (status === 500) {
        message = 'Sunucu tarafında bir hata oluştu.';
      } else if (status === 404) {
        message = 'İstenilen kaynak bulunamadı.';
      }

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
        text1: 'Çevrimdışı',
        text2: 'Sunucuya erişilemiyor. Önbellek gösteriliyor.',
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
const Catalogs = {
  list:    ()           => requests.get('/catalogs'),
  details: (id: number) => requests.get(`/catalogs/${id}`),
};

// ─── UserSubscriptions ────────────────────────────────────────────────────────
const UserSubscriptions = {
  list:           (page = 1, pageSize = 20) => requests.get(`/usersubscriptions?page=${page}&pageSize=${pageSize}`),
  create:         (subscription: any)       => requests.post('/usersubscriptions', subscription),
  update:         (id: string, subscription: any) => requests.put('/usersubscriptions', subscription),
  delete:         (id: number | string)     => requests.del(`/usersubscriptions/${id}`),

  // Durum değiştirme (Aktif / Durduruldu / İptal)
  changeStatus:   (id: number | string, status: string) =>
    requests.patch(`/usersubscriptions/${id}/status`, { status }),

  // Paylaşım
  sharedWithMe:   (page = 1, pageSize = 20) =>
    requests.get(`/usersubscriptions/shared-with-me?page=${page}&pageSize=${pageSize}`),
  share:          (id: number | string, email: string) =>
    requests.post(`/usersubscriptions/${id}/share`, { email }),
  removeShare:    (id: number | string, targetUserId: string) =>
    requests.del(`/usersubscriptions/${id}/share/${targetUserId}`),

  // Kullanım geçmişi
  getUsage:       (id: number | string) => requests.get(`/usersubscriptions/${id}/usage`),
  addUsageLog:    (id: number | string, dto: any) => requests.post(`/usersubscriptions/${id}/usage`, dto),
  deleteUsageLog: (id: number | string, logId: string) => requests.del(`/usersubscriptions/${id}/usage/${logId}`),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
const Auth = {
  login:          (body: any) => requests.post('/auth/login', body),
  register:       (body: any) => requests.post('/auth/register', body),
  getProfile:     ()          => requests.get('/auth/profile'),
  updateProfile:  (body: { fullName?: string; monthlyBudget?: number; monthlyBudgetCurrency?: string }) =>
    requests.put('/auth/profile', body),
  changePassword: (body: any) => requests.post('/auth/change-password', body),
  deleteAccount:  ()          => requests.del('/auth/me'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
const Notifications = {
  list:              (page = 1, pageSize = 20) =>
    requests.get(`/notifications?page=${page}&pageSize=${pageSize}`),
  markAsRead:        (id: number)  => requests.put(`/notifications/${id}/read`, {}),
  delete:            (id: number)  => requests.del(`/notifications/${id}`),
  registerPushToken: (token: string) => requests.put('/notifications/push-token', { token }),
};

export default {
  Dashboard,
  Catalogs,
  UserSubscriptions,
  Currencies,
  Auth,
  Notifications,
};
