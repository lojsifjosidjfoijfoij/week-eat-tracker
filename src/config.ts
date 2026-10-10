// Public app configuration. Everything here ships inside the app anyway —
// the Supabase anon key and the RevenueCat *public* key are designed to be public.
// Never put a secret key (service role, sk_..., OpenAI) in this file.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://exfsipwxedgvlhsmfrub.supabase.co";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZnNpcHd4ZWRndmxoc21mcnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODU5MjEsImV4cCI6MjA4OTk2MTkyMX0.xTbNOnxJQtbB-WznEHXCrP7mqJWVVH5yl-mx7G50kYw";

export const REVENUECAT_IOS_KEY = "appl_gfCpjApFkaldDDRWMNsILWpAxdu";
export const ENTITLEMENT_ID = "dinerr +";
export const PRODUCT_IDS = {
  monthly: "com.louis.weekmealplanner.monthly",
  yearly: "com.louis.weekmealplanner.yearly",
} as const;

export const AUTH_REDIRECT_URL = "dinrr://login-callback";
export const APP_GROUP_KEY = "mealWeekPlanner";

export const LINKS = {
  privacy: "https://lojsifjosidjfoijfoij.github.io/dinrr-site/privacy.html",
  terms: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  manageSubscriptions: "https://apps.apple.com/account/subscriptions",
  supportEmail: "dinrr.app@gmail.com",
};

export const APP_VERSION = __APP_VERSION__;
