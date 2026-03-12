// src/utils/offlineCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'SUBGUARD_CACHE_';

export const saveCache = async (key: string, data: any): Promise<void> => {
  try {
    const payload = JSON.stringify({ data, savedAt: Date.now() });
    await AsyncStorage.setItem(CACHE_PREFIX + key, payload);
  } catch (e) {
    console.warn('Cache kaydedilemedi:', key, e);
  }
};

export const loadCache = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data } = JSON.parse(raw);
    return data as T;
  } catch (e) {
    return null;
  }
};

export const clearCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch (e) {
    // ignore
  }
};
