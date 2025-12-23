// src/utils/AuthManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('SUBGUARD_TOKEN', token);
  } catch (e) {
    console.error('Token kaydedilemedi', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('SUBGUARD_TOKEN');
  } catch (e) {
    return null;
  }
};

export const saveUserId = async (id: string) => {
    try {
      await AsyncStorage.setItem('SUBGUARD_USER_ID', id);
    } catch (e) {
      console.error('User ID kaydedilemedi', e);
    }
};

export const getUserId = async () => {
    try {
      return await AsyncStorage.getItem('SUBGUARD_USER_ID');
    } catch (e) {
      return null;
    }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('SUBGUARD_TOKEN');
    await AsyncStorage.removeItem('SUBGUARD_USER_ID');
  } catch (e) {
    console.error('Token silinemedi', e);
  }
};

// KRİTİK DÜZELTME: Fonksiyon adı App.tsx ile uyumlu hale getirildi
export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};

export const logout = async () => {
    await removeToken();
};