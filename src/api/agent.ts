import axios from 'axios';

// DİKKAT: Burayı kendi IP adresinle güncelle!
// Android Emulator için genelde: 'http://10.0.2.2:5034/api' çalışır.
// Fiziksel cihaz veya genel kullanım için yerel IP şarttır.
const MY_IP_ADDRESS = '192.168.1.4'; // <-- Senin IP adresin buraya!
const API_PORT = '5252'; 

export const API_URL = `http://${MY_IP_ADDRESS}:${API_PORT}/api`;

const agent = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 saniye içinde cevap gelmezse hata ver
});

// İstekleri yöneten nesne
export const CatalogService = {
  // GET /api/catalogs isteği atar
  getAll: async () => {
    const response = await agent.get('/catalogs');
    return response.data; // ApiResponse döner
  }
};

export default agent;