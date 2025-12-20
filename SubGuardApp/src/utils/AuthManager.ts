import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid'; // Eğer hata verirse: npx expo install uuid react-native-get-random-values

const USER_ID_KEY = 'SUBGUARD_USER_ID';

export const getUserId = async (): Promise<string> => {
  try {
    // 1. Hafızaya bak, ID var mı?
    const existingId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (existingId) {
      return existingId;
    }

    // 2. Yoksa yeni bir tane oluştur ve kaydet
    const newId = uuidv4();
    await AsyncStorage.setItem(USER_ID_KEY, newId);
    return newId;

  } catch (error) {
    console.error("Kimlik hatası:", error);
    return "guest-user"; // Acil durum ID'si
  }
};