import axios from 'axios';
import { Platform } from 'react-native';

// Android Emülatör: 10.0.2.2, iOS: localhost
const MY_IP_ADDRESS = '192.168.1.4'; // <-- Senin IP adresin buraya!
const API_PORT = '5252'; 

export const API_URL = `http://${MY_IP_ADDRESS}:${API_PORT}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const responseBody = (response: any) => response.data;

const requests = {
  get: (url: string) => axiosInstance.get(url).then(responseBody),
  post: (url: string, body: {}) => axiosInstance.post(url, body).then(responseBody),
  del: (url: string) => axiosInstance.delete(url).then(responseBody),
  put: (url: string, body: {}) => axiosInstance.put(url, body).then(responseBody),
};

// Katalog İşlemleri
const Catalogs = {
  list: () => requests.get('/catalogs'),
  details: (id: number) => requests.get(`/catalogs/${id}`),
};

// YENİ: Kullanıcı Abonelik İşlemleri
const UserSubscriptions = {
  list: (userId: string) => requests.get(`/usersubscriptions/${userId}`),
  create: (subscription: any) => requests.post('/usersubscriptions', subscription),
  update: (subscription: any) => requests.put('/usersubscriptions', subscription),
  delete: (id: number | string) => requests.del(`/usersubscriptions/${id}`),
};

const Auth = {
  login: (body: any) => requests.post('/auth/login', body),
  register: (body: any) => requests.post('/auth/register', body),
};

export default {
  Catalogs,
  UserSubscriptions,
  Auth,
};