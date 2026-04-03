import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';
import { UserSubscription } from '../types';
import { getNextBillingDateForSub } from './dateUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
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
    return false;
  }

  return true;
}

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

export async function scheduleSubscriptionNotification(
  title: string,
  body: string,
  triggerDate: Date,
) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch (error) {
    console.log('Bildirim planlama hatasi:', error);
    return null;
  }
}

export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

const toLocalClockDate = (date: Date, hour: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0, 0);

export async function syncLocalNotifications(subscriptions: UserSubscription[]) {
  await cancelAllNotifications();

  const now = new Date();
  const activeSubs = subscriptions.filter((s) => s.isActive !== false);

  for (const sub of activeSubs) {
    if (!sub.billingDay || sub.billingDay < 1) continue;

    const nextBillingDate = getNextBillingDateForSub(
      sub.billingDay,
      sub.billingPeriod,
      sub.billingMonth,
      sub.createdDate,
      sub.firstPaymentDate,
      sub.contractStartDate,
      now,
    );

    const nominalPaymentDate = toLocalClockDate(nextBillingDate, 9);
    const paymentNotificationDate =
      nominalPaymentDate > now
        ? nominalPaymentDate
        : new Date(now.getTime() + 60 * 1000);

    await scheduleSubscriptionNotification(
      `${sub.name} odemesi yaklasiyor`,
      `${sub.price} ${sub.currency} tutarinda odemeniz bugun.`,
      paymentNotificationDate,
    );

    const reminderDate = new Date(nominalPaymentDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    if (reminderDate > now) {
      await scheduleSubscriptionNotification(
        `${sub.name} odemesine 3 gun kaldi`,
        `${sub.price} ${sub.currency} tutarinda odemeniz 3 gun sonra.`,
        reminderDate,
      );
    }
  }
}

export const requestCalendarPermissions = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'ios') {
    await Calendar.requestRemindersPermissionsAsync();
  }

  return true;
};

const ensureSubGuardCalendar = async (): Promise<string | null> => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const subGuardCal = calendars.find(
      (calendar) => calendar.source.name === 'SubGuard' || calendar.title === 'SubGuard',
    );

    if (subGuardCal) {
      return subGuardCal.id;
    }

    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await Calendar.getDefaultCalendarAsync().then((calendar) => calendar.source)
        : { isLocalAccount: true, name: 'SubGuard', type: Calendar.SourceType.LOCAL };

    const newCalendarId = await Calendar.createCalendarAsync({
      title: 'SubGuard',
      color: '#334155',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: 'SubGuard',
      ownerAccount: defaultCalendarSource.name,
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    return newCalendarId;
  } catch (error) {
    console.log('Takvim olusturma hatasi:', error);
    return null;
  }
};

const buildRecurrenceRule = (sub: UserSubscription, nextBillingDate: Date) => {
  if (sub.billingPeriod === 'Yearly') {
    return {
      frequency: Calendar.Frequency.YEARLY,
      interval: 1,
      ...(Platform.OS === 'ios'
        ? {
            monthsOfTheYear: [
              (nextBillingDate.getMonth() + 1) as Calendar.MonthOfTheYear,
            ],
          }
        : {}),
    };
  }

  return {
    frequency: Calendar.Frequency.MONTHLY,
    interval: 1,
    ...(Platform.OS === 'ios'
      ? {
          daysOfTheMonth: [sub.billingDay],
        }
      : {}),
  };
};

export const syncSubscriptionsToCalendar = async (subscriptions: UserSubscription[]) => {
  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      Alert.alert('Izin Gerekli', 'Takvim izni verilmedi. Ayarlardan izin verebilirsiniz.');
      return;
    }

    const calendarId = await ensureSubGuardCalendar();
    if (!calendarId) return;

    const now = new Date();
    const cleanupStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const cleanupEnd = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
    const existingEvents = await Calendar.getEventsAsync([calendarId], cleanupStart, cleanupEnd);

    for (const event of existingEvents) {
      await Calendar.deleteEventAsync(event.id);
    }

    const activeSubs = subscriptions.filter((s) => s.isActive !== false);
    const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    for (const sub of activeSubs) {
      if (!sub.billingDay || sub.billingDay < 1) continue;

      const nextBillingDate = getNextBillingDateForSub(
        sub.billingDay,
        sub.billingPeriod,
        sub.billingMonth,
        sub.createdDate,
        sub.firstPaymentDate,
        sub.contractStartDate,
        now,
      );

      // Noon avoids timezone drift that can push midnight events to the previous day.
      const eventDate = toLocalClockDate(nextBillingDate, 12);

      await Calendar.createEventAsync(calendarId, {
        title: `${sub.name} Odemesi`,
        startDate: eventDate,
        endDate: new Date(eventDate.getTime() + 60 * 60 * 1000),
        timeZone: deviceTimeZone,
        notes: `Tutar: ${sub.price} ${sub.currency}`,
        recurrenceRule: buildRecurrenceRule(sub, nextBillingDate),
      });
    }

    Alert.alert('Basarili', 'Abonelikler cihaz takviminize islendi.');
  } catch (error) {
    console.error('Takvim senkronizasyon hatasi:', error);
    Alert.alert('Hata', 'Takvim senkronizasyonu sirasinda bir hata olustu.');
  }
};
