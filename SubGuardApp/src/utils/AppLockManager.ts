import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'subguard_app_lock_pin';

/** 4 haneli PIN'i güvenli depoya kaydeder */
export const savePin = async (pin: string): Promise<void> => {
  await SecureStore.setItemAsync(PIN_KEY, pin);
};

/** Girilen PIN'in kayıtlı PIN ile eşleşip eşleşmediğini döner */
export const verifyPin = async (pin: string): Promise<boolean> => {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored !== null && stored === pin;
};

/** Kayıtlı PIN var mı? */
export const hasPin = async (): Promise<boolean> => {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored !== null && stored.length > 0;
};

/** PIN'i depolardan siler */
export const clearPin = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(PIN_KEY);
};
