import { Platform, Vibration } from 'react-native';

/**
 * Hafif geri bildirim — başarılı seçim, chip press vb.
 * iOS: sessiz (expo-haptics olmadan çalışmaz)
 * Android: kısa titreşim
 */
export const hapticLight = () => {
  if (Platform.OS === 'android') {
    Vibration.vibrate(10);
  }
};

/**
 * Orta geri bildirim — durum değişimi, swipe aksiyonu vb.
 */
export const hapticMedium = () => {
  if (Platform.OS === 'android') {
    Vibration.vibrate(30);
  }
};

/**
 * Güçlü geri bildirim — silme onayı, bütçe aşımı uyarısı vb.
 */
export const hapticHeavy = () => {
  if (Platform.OS === 'android') {
    Vibration.vibrate(60);
  }
};

/**
 * Başarı bildirimi — ekleme/güncelleme başarılı
 * Kısa-uzun pattern
 */
export const hapticSuccess = () => {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 10, 60, 10]);
  }
};

/**
 * Hata / silme geri bildirimi
 * Güçlü-kısa pattern
 */
export const hapticError = () => {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 20, 80, 20]);
  }
};
