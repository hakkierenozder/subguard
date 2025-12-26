import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message'; // <--- EKLENDİ
import { getToken, getRefreshToken, saveToken, saveRefreshToken, removeToken } from '../utils/AuthManager';

const MY_IP_ADDRESS = '192.168.1.4'; // IP'ni kontrol et
const API_PORT = '5252';

export const API_URL = `http://${MY_IP_ADDRESS}:${API_PORT}/api`;

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
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- 1. TOKEN YENİLEME MANTIĞI (MEVCUT KOD) ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        
        if (!refreshToken) {
            throw new Error('Refresh token not found');
        }

        const response = await axios.post(`${API_URL}/auth/create-token-by-refresh-token`, {
            token: refreshToken
        });

        if (response.data && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            await saveToken(accessToken);
            await saveRefreshToken(newRefreshToken);

            axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

            processQueue(null, accessToken);
            return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        await removeToken(); 
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- 2. MERKEZİ HATA GÖSTERİMİ (YENİ EKLENEN KISIM) ---
    if (error.response) {
        const { data, status } = error.response;
        let message = 'Bir hata oluştu.';

        // Backend'deki CustomResponseDto formatına göre: { statusCode, errors: ["..."], ... }
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            message = data.errors[0]; // İlk hatayı göster
        } else if (data.errors && typeof data.errors === 'string') {
            message = data.errors;
        } else if (status === 500) {
            message = 'Sunucu tarafında bir hata oluştu.';
        } else if (status === 404) {
            message = 'İstenilen kaynak bulunamadı.';
        }

        // 401 hatası zaten yukarıda refresh deneniyor, eğer refresh de başarısızsa logout oluyor.
        // Tekrar hata basmaya gerek yok, ancak diğer durumlar için basıyoruz.
        // Retry edilen istek (originalRequest._retry) tekrar 401 yerse (refresh token fail) o zaman hata basabiliriz.
        if (status !== 401 || (status === 401 && originalRequest._retry)) {
            Toast.show({
                type: 'error',
                text1: 'Hata',
                text2: message,
                position: 'bottom',
                visibilityTime: 4000,
            });
        }
    } else if (error.message === 'Network Error') {
        Toast.show({
            type: 'error',
            text1: 'Bağlantı Hatası',
            text2: 'Sunucuya erişilemiyor. İnternetinizi kontrol edin.',
            position: 'bottom',
        });
    }

    return Promise.reject(error);
  }
);

const responseBody = (response: any) => response.data;

const requests = {
  get: (url: string) => axiosInstance.get(url).then(responseBody),
  post: (url: string, body: {}) => axiosInstance.post(url, body).then(responseBody),
  del: (url: string) => axiosInstance.delete(url).then(responseBody),
  put: (url: string, body: {}) => axiosInstance.put(url, body).then(responseBody),
};

const Catalogs = {
  list: () => requests.get('/catalogs'),
  details: (id: number) => requests.get(`/catalogs/${id}`),
};

const UserSubscriptions = {
  list: () => requests.get('/usersubscriptions'),
  create: (subscription: any) => requests.post('/usersubscriptions', subscription),
  update: (id: string, subscription: any) => requests.put(`/usersubscriptions/${id}`, subscription),
  delete: (id: number | string) => requests.del(`/usersubscriptions/${id}`),
};

const Auth = {
  login: (body: any) => requests.post('/auth/login', body),
  register: (body: any) => requests.post('/auth/register', body),
  getProfile: () => requests.get('/auth/profile'),
  updateProfile: (body: { fullName?: string; monthlyBudget?: number }) => requests.put('/auth/profile', body),
  changePassword: (body: any) => requests.post('/auth/change-password', body),
};

export default {
  Catalogs,
  UserSubscriptions,
  Auth,
};