// Reads a customer's subscription straight from RevenueCat (the source of truth)
// and stores it in public.entitlements. Requires the secret REVENUECAT_SECRET_KEY
// (RevenueCat dashboard → Project settings → API keys → Secret API key, v1 "sk_...").
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const ENTITLEMENT_ID = Deno.env.get("REVENUECAT_ENTITLEMENT_ID") ?? "dinerr +";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);
export const revenueCatConfigured = () => !!Deno.env.get("REVENUECAT_SECRET_KEY");

type RcEntitlement = {
  expires_date: string | null;
  grace_period_expires_date?: string | null;
  product_identifier?: string;
};

export type EntitlementState = { isActive: boolean; expiresAt: string | null; productId: string | null };

export async function fetchEntitlement(appUserId: string): Promise<EntitlementState> {
  const key = Deno.env.get("REVENUECAT_SECRET_KEY");
  if (!key) throw new Error("REVENUECAT_SECRET_KEY is not set");

  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`RevenueCat ${res.status}: ${await res.text()}`);
  const body = await res.json();
  const all: Record<string, RcEntitlement> = body?.subscriber?.entitlements ?? {};

  const now = Date.now();
  const endOf = (e: RcEntitlement): number | null => {
    if (e.expires_date === null) return null; // lifetime / non-expiring
    const ends = [e.expires_date, e.grace_period_expires_date]
      .filter((d): d is string => !!d)
      .map((d) => Date.parse(d));
    return ends.length ? Math.max(...ends) : 0;
  };
  const isLive = (e: RcEntitlement) => {
    const end = endOf(e);
    return end === null || end > now;
  };

  // Prefer the configured entitlement; otherwise any live entitlement counts.
  const chosen = all[ENTITLEMENT_ID] ?? Object.values(all).find(isLive);
  if (!chosen) return { isActive: false, expiresAt: null, productId: null };
  const end = endOf(chosen);
  return {
    isActive: isLive(chosen),
    expiresAt: end === null ? null : new Date(end).toISOString(),
    productId: chosen.product_identifier ?? null,
  };
}

/** Refreshes one user's row in public.entitlements. Never touches manual_grant. */
export async function refreshEntitlement(admin: SupabaseClient, userId: string): Promise<EntitlementState> {
  const state = await fetchEntitlement(userId);
  const { error } = await admin.from("entitlements").upsert({
    user_id: userId,
    is_active: state.isActive,
    expires_at: state.expiresAt,
    product_id: state.productId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return state;
}
