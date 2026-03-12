// src/utils/AuthManager.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Token işlemleri (Keychain/Keystore - şifreli) ──────────────────────────

export const saveToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('SUBGUARD_TOKEN', token);
  } catch (e) {
    console.error('Token kaydedilemedi', e);
  }
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync('SUBGUARD_TOKEN');
  } catch (e) {
    return null;
  }
};

export const saveRefreshToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('SUBGUARD_REFRESH_TOKEN', token);
  } catch (e) {
    console.error('Refresh Token kaydedilemedi', e);
  }
};

export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync('SUBGUARD_REFRESH_TOKEN');
  } catch (e) {
    return null;
  }
};

export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync('SUBGUARD_TOKEN');
    await SecureStore.deleteItemAsync('SUBGUARD_REFRESH_TOKEN');
    await AsyncStorage.removeItem('SUBGUARD_USER_ID');
  } catch (e) {
    console.error('Token silinemedi', e);
  }
};

// ─── User ID (SecureStore değil AsyncStorage — daha az hassas) ──────────────

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

// ─── Auth helpers ────────────────────────────────────────────────────────────

export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};

export const logout = async () => {
  await removeToken();
};
