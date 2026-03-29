import { LocalNotifications } from '@capacitor/local-notifications';

export const requestNotificationPermission = async () => {
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
};

export const scheduleMondayReminder = async () => {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1,
        title: "Plan your week 🍽️",
        body: "What's on the menu this week? Tap to plan your meals.",
        schedule: {
          on: {
            weekday: 2,
            hour: 9,
            minute: 0,
          },
          repeats: true,
        },
        sound: undefined,
        actionTypeId: "",
        extra: null,
      },
    ],
  });

  return true;
};

export const cancelMondayReminder = async () => {
  await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
};
