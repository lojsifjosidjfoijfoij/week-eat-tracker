// RevenueCat is configured ONLY here (never in AppDelegate.swift — configuring
// twice creates two StoreKit observers and breaks purchases).
import { Capacitor } from "@capacitor/core";
import {
  LOG_LEVEL,
  PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
  Purchases,
  type CustomerInfo,
  type PurchasesPackage,
} from "@revenuecat/purchases-capacitor";
import { ENTITLEMENT_ID, PRODUCT_IDS, REVENUECAT_IOS_KEY } from "@/config";

export const storeAvailable = () => Capacitor.getPlatform() === "ios";

let configuring: Promise<void> | null = null;

async function ensureConfigured(appUserID: string): Promise<void> {
  if (!configuring) {
    configuring = (async () => {
      const { isConfigured } = await Purchases.isConfigured();
      if (isConfigured) return;
      await Purchases.setLogLevel({ level: import.meta.env.DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN });
      await Purchases.configure({ apiKey: REVENUECAT_IOS_KEY, appUserID });
    })().catch((e) => {
      configuring = null; // allow a retry next time
      throw e;
    });
  }
  await configuring;
}

/** Configures RevenueCat for this Supabase user (the user id is the RevenueCat App User ID). */
export async function identify(userId: string): Promise<CustomerInfo | null> {
  if (!storeAvailable()) return null;
  await ensureConfigured(userId);
  const { appUserID } = await Purchases.getAppUserID();
  if (appUserID !== userId) {
    const { customerInfo } = await Purchases.logIn({ appUserID: userId });
    return customerInfo;
  }
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo;
}

export async function resetIdentity(): Promise<void> {
  if (!storeAvailable() || !configuring) return;
  try {
    const { isAnonymous } = await Purchases.isAnonymous();
    if (!isAnonymous) await Purchases.logOut();
  } catch (e) {
    console.warn("RevenueCat logOut failed", e);
  }
}

export function hasEntitlement(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  const active = info.entitlements?.active ?? {};
  return !!active[ENTITLEMENT_ID] || Object.keys(active).length > 0;
}

export async function onCustomerInfo(cb: (info: CustomerInfo) => void): Promise<() => void> {
  if (!storeAvailable()) return () => {};
  const id = await Purchases.addCustomerInfoUpdateListener(cb);
  return () => { Purchases.removeCustomerInfoUpdateListener({ listenerToRemove: id }).catch(() => {}); };
}

export type Plans = { yearly: PurchasesPackage | null; monthly: PurchasesPackage | null };

/** Finds the yearly/monthly packages even if the offering uses custom package ids. */
export async function loadPlans(): Promise<Plans> {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current ?? Object.values(offerings.all ?? {})[0] ?? null;
  const pkgs = offering?.availablePackages ?? [];
  const find = (type: PACKAGE_TYPE, productId: string) =>
    pkgs.find((p) => p.packageType === type) ??
    pkgs.find((p) => p.product.identifier === productId) ??
    null;
  return {
    yearly: offering?.annual ?? find(PACKAGE_TYPE.ANNUAL, PRODUCT_IDS.yearly),
    monthly: offering?.monthly ?? find(PACKAGE_TYPE.MONTHLY, PRODUCT_IDS.monthly),
  };
}

export async function purchase(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return customerInfo;
}

export async function restore(): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}

export type StoreErrorKind =
  | "cancelled" | "notReady" | "notAllowed" | "pending" | "network" | "store" | "alreadyOwned" | "unknown";

/** Turns a RevenueCat / Capacitor error into something we can show the user. */
export function classifyStoreError(e: unknown): { kind: StoreErrorKind; detail: string } {
  const err = (e ?? {}) as {
    code?: string | number; message?: string; userCancelled?: boolean;
    data?: { readableErrorCode?: string; underlyingErrorMessage?: string; userCancelled?: boolean };
    userInfo?: { readableErrorCode?: string };
    readableErrorCode?: string; underlyingErrorMessage?: string;
  };
  const code = String(err.code ?? "");
  const readable = err.readableErrorCode ?? err.userInfo?.readableErrorCode ?? err.data?.readableErrorCode ?? "";
  const underlying = err.underlyingErrorMessage ?? err.data?.underlyingErrorMessage ?? "";
  const detail = [code && `#${code}`, readable, underlying || err.message].filter(Boolean).join(" · ");
  const C = PURCHASES_ERROR_CODE;

  if (err.userCancelled || err.data?.userCancelled || code === C.PURCHASE_CANCELLED_ERROR) return { kind: "cancelled", detail };
  switch (code) {
    case C.CONFIGURATION_ERROR:
    case C.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
    case C.INVALID_APPLE_SUBSCRIPTION_KEY_ERROR:
    case C.INVALID_CREDENTIALS_ERROR:
      return { kind: "notReady", detail };
    case C.PURCHASE_NOT_ALLOWED_ERROR:
      return { kind: "notAllowed", detail };
    case C.PAYMENT_PENDING_ERROR:
      return { kind: "pending", detail };
    case C.NETWORK_ERROR:
    case C.OFFLINE_CONNECTION_ERROR:
      return { kind: "network", detail };
    case C.PRODUCT_ALREADY_PURCHASED_ERROR:
      return { kind: "alreadyOwned", detail };
    case C.STORE_PROBLEM_ERROR:
    case C.PRODUCT_REQUEST_TIMED_OUT_ERROR:
      return { kind: "store", detail };
    default:
      return { kind: "unknown", detail };
  }
}
