import { Capacitor } from "@capacitor/core";
import { LocalNotifications, Weekday } from "@capacitor/local-notifications";

const REMINDER_ID = 1;

/** Schedules the weekly Monday 09:00 reminder. Returns false if the user said no. */
export async function scheduleMondayReminder(title: string, body: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  let { display } = await LocalNotifications.checkPermissions();
  if (display === "prompt" || display === "prompt-with-rationale") {
    ({ display } = await LocalNotifications.requestPermissions());
  }
  if (display !== "granted") return false;

  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [{
      id: REMINDER_ID,
      title,
      body,
      schedule: { on: { weekday: Weekday.Monday, hour: 9, minute: 0 } }, // repeats weekly
    }],
  });
  return true;
}

export async function cancelMondayReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
}
