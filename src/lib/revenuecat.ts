import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";

const API_KEY = "appl_gfCpjApFkaldDDRWMNsILWpAxdu";

let configured = false;

async function ensureConfigured() {
  if (configured) return;
  if (!Capacitor.isNativePlatform()) return;

  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey: API_KEY });
  configured = true;
}

export async function safeGetCustomerInfo() {
  await ensureConfigured();
  return await Purchases.getCustomerInfo();
}

export async function safeLogin(userEmail: string) {
  await ensureConfigured();
  return await Purchases.logIn({ appUserID: userEmail });
}

export async function safeRestorePurchases() {
  await ensureConfigured();
  return await Purchases.restorePurchases();
}

export async function safeGetOfferings() {
  await ensureConfigured();
  return await Purchases.getOfferings();
}