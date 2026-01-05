import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';
import { UserSubscription } from '../types'; // Tip tanımının doğru yerden geldiğine emin olun

// --- 1. NOTIFICATION CONFIGURATION ---

// Bildirimlerin uygulama açıkken nasıl görüneceği
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// İzin İsteme (Push Notification)
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
    return false;
  }

  return true;
}

// Bildirim Planla
export async function scheduleSubscriptionNotification(title: string, body: string, triggerDate: Date) {
  try {
    // TypeScript Fix: trigger tipi uyumsuzluğunu aşmak için cast işlemi
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

export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function syncLocalNotifications(subscriptions: UserSubscription[]) {
  await cancelAllNotifications();
  // Basit bir örnek: Her birinin ödeme gününde bildirim kur
  // (Burada detaylı tarih hesaplama mantığı eklenebilir)
  console.log(`${subscriptions.length} adet bildirim senkronize edildi (Simülasyon).`);
}

// --- 2. CALENDAR INTEGRATION ---

export const requestCalendarPermissions = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status === 'granted') {
    const remindersStatus = await Calendar.requestRemindersPermissionsAsync();
    return remindersStatus.status === 'granted';
  }
  return false;
};

// Cihazda 'SubGuard' adında bir takvim var mı bakar, yoksa oluşturur.
const ensureSubGuardCalendar = async (): Promise<string | null> => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const subGuardCal = calendars.find(c => c.source.name === 'SubGuard' || c.title === 'SubGuard');

    if (subGuardCal) {
      return subGuardCal.id;
    }

    // iOS ve Android için kaynak (source) belirleme
    const defaultCalendarSource = Platform.OS === 'ios'
      ? await Calendar.getDefaultCalendarAsync().then(c => c.source)
      : { isLocalAccount: true, name: 'SubGuard', type: Calendar.SourceType.LOCAL };

    const newCalendarId = await Calendar.createCalendarAsync({
      title: 'SubGuard',
      color: '#334155', // SubGuard Slate Blue
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: 'SubGuard',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    return newCalendarId;
  } catch (error) {
    console.log('Takvim oluşturma hatası:', error);
    return null;
  }
};

// Abonelikleri Takvime Senkronize Et
export const syncSubscriptionsToCalendar = async (subscriptions: UserSubscription[]) => {
  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      Alert.alert("İzin Gerekli", "Takvim izni verilmedi. Ayarlardan izin verebilirsiniz.");
      return;
    }

    const calendarId = await ensureSubGuardCalendar();
    if (!calendarId) return;

    // 1. Önce SubGuard takvimindeki eski etkinlikleri temizleyelim (Dublike olmaması için)
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);
    
    const existingEvents = await Calendar.getEventsAsync([calendarId], now, oneYearLater);
    for (const event of existingEvents) {
      await Calendar.deleteEventAsync(event.id);
    }

    // 2. Aktif abonelikleri ekle
    const activeSubs = subscriptions.filter(s => s.isActive !== false);

    for (const sub of activeSubs) {
      // Bir sonraki ödeme tarihini hesapla
      const today = new Date();
      let eventDate = new Date(today.getFullYear(), today.getMonth(), sub.billingDay);
      
      // Eğer bu ayki gün geçtiyse, gelecek aya at
      if (eventDate < today) {
         eventDate.setMonth(eventDate.getMonth() + 1);
      }

      // Etkinlik oluştur
      await Calendar.createEventAsync(calendarId, {
        title: `${sub.name} Ödemesi`,
        startDate: eventDate,
        endDate: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 saatlik etkinlik
        timeZone: 'GMT',
        notes: `Tutar: ${sub.price} ${sub.currency}`,
        recurrenceRule: {
          frequency: Calendar.Frequency.MONTHLY,
          interval: 1,
          daysOfTheMonth: [sub.billingDay > 28 ? 28 : sub.billingDay] 
        },
      });
    }
    
    Alert.alert("Başarılı", "Abonelikler cihaz takviminize işlendi.");

  } catch (error) {
    console.error("Takvim senkronizasyon hatası:", error);
    Alert.alert("Hata", "Takvim senkronizasyonu sırasında bir hata oluştu.");
  }
};