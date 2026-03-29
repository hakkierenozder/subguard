if (!process.env.EXPO_PUBLIC_API_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL ortam değişkeni tanımlı değil. ' +
    'Lütfen .env dosyasına EXPO_PUBLIC_API_URL=http://<server>:<port>/api satırını ekleyin.'
  );
}
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
