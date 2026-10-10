// POST /functions/v1/revenuecat-webhook   (deploy with --no-verify-jwt)
// RevenueCat → Project settings → Integrations → Webhooks
//   URL:                  https://exfsipwxedgvlhsmfrub.supabase.co/functions/v1/revenuecat-webhook
//   Authorization header: the same value as the REVENUECAT_WEBHOOK_SECRET secret
// On every event we re-read the customer from the RevenueCat API (the payload
// itself is not trusted) and update public.entitlements.
import { adminClient, json } from "../_shared/http.ts";
import { isUuid, refreshEntitlement } from "../_shared/revenuecat.ts";

function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  if (!secret) {
    console.error("revenuecat-webhook: REVENUECAT_WEBHOOK_SECRET not set");
    return json({ error: "not_configured" }, 500);
  }
  const header = (req.headers.get("Authorization") ?? "").trim();
  const presented = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!safeEqual(presented, secret)) return json({ error: "unauthorized" }, 401);

  let event: Record<string, unknown> = {};
  try {
    event = ((await req.json()) as { event?: Record<string, unknown> }).event ?? {};
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  // Collect every app user id mentioned by the event (aliases, transfers…)
  const candidates = new Set<string>();
  const add = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(add);
    else if (isUuid(v)) candidates.add(v.toLowerCase());
  };
  add(event.app_user_id);
  add(event.original_app_user_id);
  add(event.aliases);
  add(event.transferred_from);
  add(event.transferred_to);

  const admin = adminClient();
  const results = await Promise.allSettled([...candidates].map((id) => refreshEntitlement(admin, id)));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.warn("revenuecat-webhook: refresh failed for", [...candidates][i], r.reason);
  });

  // Always 200 so RevenueCat doesn't retry forever for ids that aren't dinrr users
  return json({ ok: true, type: event.type ?? null, users: candidates.size });
});
