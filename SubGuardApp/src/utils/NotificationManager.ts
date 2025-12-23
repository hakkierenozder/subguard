import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// 1. DÜZELTME: shouldShowBanner ve shouldShowList eklendi.
// TypeScript artık bu alanları zorunlu tutuyor.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // EKLENDİ
    shouldShowList: true,   // EKLENDİ
  }),
});

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Hata', 'Bildirim izni verilmedi!');
    return false; // DÜZELTME: Mutlaka boolean dön
  }

  return true; // DÜZELTME: Mutlaka boolean dön
}

// Bildirim Planla
export async function scheduleSubscriptionNotification(title: string, body: string, triggerDate: Date) {
  try {
    // DÜZELTME 2: triggerDate'i doğrudan vermek yerine { date: ... } veya cast işlemi
    // Expo Notifications 'trigger' olarak Date kabul eder ama TS bazen bunu tanımaz.
    // 'as any' kullanarak bu tip çakışmasını aşıyoruz çünkü çalışma zamanında Date geçerlidir.
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: { date: triggerDate } as unknown as Notifications.NotificationTriggerInput, 
    });
    return id;
  } catch (error) {
    console.log("Bildirim planlama hatası:", error);
    return null;
  }
}

export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Tüm bildirimleri iptal et (Ayarlardan kapatınca)
export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// 2. Toplu Senkronizasyon (Buluttan gelen verilerle alarmları kurar)
export async function syncLocalNotifications(subscriptions: any[]) {
  // Önce temizlik
  await cancelAllNotifications();

  // Sonra hepsi için tek tek kur
  for (const sub of subscriptions) {
    if (sub.billingDay) {
      await scheduleSubscriptionNotification(
        "Ödeme Hatırlatıcı",
        `${sub.name} ödemen yaklaştı!`,
        sub.billingDay
      );
    }
  }
  console.log(`${subscriptions.length} adet bildirim senkronize edildi.`);
}