import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// IP adresini kendi ortamına göre güncelle (Emülatör için 10.0.2.2 veya kendi IP'n)
const MY_IP_ADDRESS = '192.168.1.4'; 
const API_PORT = '5252';

export const API_URL = `http://${MY_IP_ADDRESS}:${API_PORT}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('SUBGUARD_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

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
  // DÜZELTME: id tipi number yapıldı
  update: (id: number, subscription: any) => requests.put(`/usersubscriptions/${id}`, subscription),
  delete: (id: number) => requests.del(`/usersubscriptions/${id}`),
  // EKLENDİ: logUsage
  logUsage: (id: number, body: { status: string }) => requests.post(`/usersubscriptions/${id}/usage`, body),
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