import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

/**
 * Durable key/value storage for the auth session.
 * On iOS this is UserDefaults (survives WebView storage purges); on the web
 * it falls back to localStorage. Old sessions in localStorage are migrated.
 */
export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) return safeLocal.get(key);
    const { value } = await Preferences.get({ key });
    if (value !== null) return value;
    const legacy = safeLocal.get(key);
    if (legacy !== null) {
      await Preferences.set({ key, value: legacy });
      safeLocal.remove(key);
    }
    return legacy;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return safeLocal.set(key, value);
    await Preferences.set({ key, value });
  },
  async removeItem(key: string): Promise<void> {
    safeLocal.remove(key);
    if (Capacitor.isNativePlatform()) await Preferences.remove({ key });
  },
};

/** localStorage that never throws (private mode, quota, disabled storage). */
export const safeLocal = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
  getJSON<T>(key: string, fallback: T): T {
    const raw = safeLocal.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJSON(key: string, value: unknown): void {
    safeLocal.set(key, JSON.stringify(value));
  },
};
