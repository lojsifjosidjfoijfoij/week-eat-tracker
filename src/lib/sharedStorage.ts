import { Capacitor, registerPlugin } from "@capacitor/core";
import { APP_GROUP_KEY } from "@/config";

// Native plugin in ios/App/App/SharedStoragePlugin.swift — writes to the App
// Group so the home-screen widget can read tonight's meal.
interface SharedStoragePlugin {
  set(options: { key: string; value: string }): Promise<void>;
}
const SharedStorage = registerPlugin<SharedStoragePlugin>("SharedStorage");

let lastWritten = "";

/** days: index 0–6 (Mon–Sun) → meal name. Only writes when something changed. */
export async function syncWidget(days: string[], language: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const payload: Record<string, unknown> = { lang: language };
  days.forEach((meal, i) => { payload[String(i)] = { meal }; });
  const value = JSON.stringify(payload);
  if (value === lastWritten) return;
  try {
    await SharedStorage.set({ key: APP_GROUP_KEY, value });
    lastWritten = value;
  } catch (e) {
    console.warn("Widget sync failed", e);
  }
}

export function clearWidget(language: string): Promise<void> {
  lastWritten = "";
  return syncWidget(["", "", "", "", "", "", ""], language);
}
