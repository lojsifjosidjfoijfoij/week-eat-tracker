// POST /functions/v1/delete-account
// Permanently deletes the caller: family membership (ownership is handed to
// another member, or the family is removed if empty), app data, the
// RevenueCat customer record and finally the auth user.
// Note: an App Store subscription can only be cancelled by the user in iOS
// Settings — the app tells them so before they delete.
import { adminClient, json, preflight, requireUser } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;
  const { user } = auth;
  const admin = adminClient();

  const { error: dataError } = await admin.rpc("delete_user_data", { p_user_id: user.id });
  if (dataError) {
    console.error("delete-account: delete_user_data failed", dataError);
    return json({ error: "delete_failed" }, 500);
  }

  const rcKey = Deno.env.get("REVENUECAT_SECRET_KEY");
  if (rcKey) {
    try {
      await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${rcKey}` },
      });
    } catch (e) {
      console.warn("delete-account: RevenueCat delete failed (continuing)", e);
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("delete-account: deleteUser failed", error);
    return json({ error: "delete_failed" }, 500);
  }
  return json({ ok: true });
});
