import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'SUBGUARD_TOKEN';
const USER_ID_KEY = 'SUBGUARD_USER_ID';
const USER_NAME_KEY = 'SUBGUARD_USER_NAME';

// Giriş Başarılıysa Verileri Kaydet
export const saveAuthData = async (token: string, userId: string, fullName: string) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_ID_KEY, userId],
    [USER_NAME_KEY, fullName]
  ]);
};

// Çıkış Yap (Verileri Sil)
export const logoutUser = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY, USER_NAME_KEY]);
};

// Token Var mı? (Giriş yapılmış mı?)
export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return !!token;
};

// Aktif Kullanıcı ID'sini Getir
export const getUserId = async () => {
  const id = await AsyncStorage.getItem(USER_ID_KEY);
  return id || '';
};

// Aktif Kullanıcı Adını Getir
export const getUserName = async () => {
    const name = await AsyncStorage.getItem(USER_NAME_KEY);
    return name || 'Kullanıcı';
};