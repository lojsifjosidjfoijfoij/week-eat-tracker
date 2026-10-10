// POST /functions/v1/sync-premium
// Called by the app on launch and right after a purchase/restore.
// Refreshes the caller's subscription from RevenueCat, plus any family member
// whose stored subscription has run out (in case it renewed and the webhook
// was missed), and returns { self, family } premium flags.
import { adminClient, json, preflight, requireUser } from "../_shared/http.ts";
import { refreshEntitlement, revenueCatConfigured } from "../_shared/revenuecat.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;
  const { user, userClient } = auth;

  const admin = adminClient();
  let synced = false;

  if (revenueCatConfigured()) {
    try {
      await refreshEntitlement(admin, user.id);
      synced = true;

      // Re-check family members whose stored subscription looks expired
      const { data: me } = await admin.from("family_members").select("family_id").eq("user_id", user.id).maybeSingle();
      if (me?.family_id) {
        const { data: members } = await admin
          .from("family_members").select("user_id").eq("family_id", me.family_id).neq("user_id", user.id).limit(12);
        const ids = (members ?? []).map((m) => m.user_id as string);
        if (ids.length) {
          const { data: rows } = await admin
            .from("entitlements").select("user_id, is_active, expires_at, updated_at").in("user_id", ids);
          const stale = (rows ?? []).filter((r) =>
            r.is_active && r.expires_at && Date.parse(r.expires_at) < Date.now() &&
            Date.now() - Date.parse(r.updated_at) > 10 * 60 * 1000
          );
          await Promise.allSettled(stale.map((r) => refreshEntitlement(admin, r.user_id)));
        }
      }
    } catch (e) {
      console.error("sync-premium: RevenueCat refresh failed", e);
    }
  } else {
    console.warn("sync-premium: REVENUECAT_SECRET_KEY not set — using stored entitlements only");
  }

  const { data, error } = await userClient.rpc("get_premium_status");
  if (error) {
    console.error("sync-premium: get_premium_status failed", error);
    return json({ error: "status_failed" }, 500);
  }
  return json({ ...(data as Record<string, boolean>), synced });
});
