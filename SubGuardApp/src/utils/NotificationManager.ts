import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

export async function registerForPushNotificationsAsync() {
  // Android için Kanal Ayarı (Emülatörde ve Telefonda Şarttır)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // 2. DÜZELTME: "Device.isDevice" kontrolünü kaldırdık.
  // Artık Emülatörde de izin isteyecek.
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Bildirim izni verilmedi!');
    return;
  }
  
  console.log("Bildirim izinleri alındı.");
}

export async function scheduleSubscriptionNotification(
  title: string, 
  body: string, 
  dayOfMonth: number
) {
  // 3. DÜZELTME: 'type' özelliği eklendi.
  // Takvim tabanlı bildirim olduğu belirtilmeli.
  const trigger: Notifications.CalendarTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR, // EKLENDİ
    day: dayOfMonth,
    hour: 10, 
    minute: 0,
    repeats: true, 
  };

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
      },
      trigger,
    });
    console.log(`Bildirim kuruldu! ID: ${id}`);
    return id;
  } catch (error) {
    console.log("Bildirim hatası:", error);
    return null;
  }
}

export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  console.log(`Bildirim iptal edildi: ${notificationId}`);
}

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