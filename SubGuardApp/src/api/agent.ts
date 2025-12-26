import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getToken, getRefreshToken, saveToken, saveRefreshToken, removeToken } from '../utils/AuthManager';

// Android Emülatör: 10.0.2.2, iOS: localhost, Fiziksel Cihaz: Yerel IP
const MY_IP_ADDRESS = '192.168.1.4'; // Kendi IP'ni kontrol et
const API_PORT = '5252';

export const API_URL = `http://${MY_IP_ADDRESS}:${API_PORT}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request Interceptor: Her isteğe token ekle
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


// Response Interceptor: 401 yönetimi
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

    // Eğer hata 401 ise ve bu istek zaten yenilenmiş bir istek değilse
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Eğer zaten yenileme işlemi sürüyorsa, bu isteği kuyruğa ekle
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
            // Refresh token yoksa direkt çıkış yap
            throw new Error('Refresh token not found');
        }

        // Token yenileme isteği at (Axios instance kullanmıyoruz döngüye girmesin diye)
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
        await removeToken(); // Her şeyi sil
        // İsteğe bağlı: Kullanıcıyı login ekranına yönlendirecek bir global event tetiklenebilir
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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