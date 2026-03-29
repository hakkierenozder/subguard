// src/utils/AuthManager.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserSubscriptionStore } from '../store/useUserSubscriptionStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useCatalogStore } from '../store/useCatalogStore';

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

export const removeRefreshToken = async () => {
  try {
    await SecureStore.deleteItemAsync('SUBGUARD_REFRESH_TOKEN');
  } catch (e) {
    console.error('Refresh Token silinemedi', e);
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

/** JWT payload'ını base64 decode ederek döner. Hata durumunda null. */
const decodeJwtPayload = (token: string): { exp?: number } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → base64 dönüşümü
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isLoggedIn = async () => {
  const token = await getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true; // exp yoksa token'a güven (non-standard)

  // exp saniye cinsinden; Date.now() ms cinsinden
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp > nowSec;
};

export const logout = async () => {
  await removeToken();
  // Kullanıcıya ait bellekteki state'leri temizle
  useUserSubscriptionStore.getState().reset();
  useNotificationStore.getState().reset();
  useSettingsStore.getState().clearUserSettings();
  useCatalogStore.getState().reset?.();
};
