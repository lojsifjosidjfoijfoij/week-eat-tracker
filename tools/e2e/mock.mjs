// In-memory fake of the Supabase endpoints the app uses
export function makeBackend({ family = null, premium = { self: false, family: false } } = {}) {
  const db = { meal_plans: [], ingredients: [], calls: [] };
  const state = { family, premium, members: family ? [{ user_id: "u1", email: "louis@example.com", name: "Louis", is_owner: true }, { user_id: "u2", email: "mor@example.com", name: "Mor", is_owner: false }] : [] };
  const json = (route, body, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

  async function handle(route) {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    db.calls.push(`${method} ${path}${url.search}`);
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    const body = req.postData() ? JSON.parse(req.postData()) : null;

    if (path === "/rest/v1/rpc/get_my_family") return json(route, { ok: true, family: state.family, members: state.members, premium: state.premium });
    if (path === "/rest/v1/rpc/get_premium_status") return json(route, state.premium);
    if (path === "/rest/v1/rpc/create_family") {
      if (!state.premium.self) return json(route, { ok: false, error: "premium_required" });
      state.family = { id: "f-new", name: body.p_name, code: "K7M2QX9P", owner_id: "u1" };
      state.members = [{ user_id: "u1", email: "louis@example.com", name: "Louis", is_owner: true }];
      return json(route, { ok: true, family: state.family });
    }
    if (path === "/rest/v1/rpc/join_family") return json(route, { ok: false, error: "invalid_code" });
    if (path === "/rest/v1/rpc/reset_family_week") { db.meal_plans = []; db.ingredients = db.ingredients.filter(i => i.day_index === 7); return json(route, { ok: true }); }
    if (path === "/functions/v1/sync-premium") return json(route, { ...state.premium, synced: true });
    if (path === "/functions/v1/suggest-ingredients") return json(route, { ingredients: ["Spaghetti", "Hakket oksekød", "Hakkede tomater", "Løg", "Hvidløg", "Parmesan"] });

    const table = path.replace("/rest/v1/", "");
    if (table === "meal_plans" || table === "ingredients") {
      const rows = db[table];
      if (method === "GET") return json(route, rows);
      if (method === "POST") {
        const list = Array.isArray(body) ? body : [body];
        for (const r of list) {
          if (table === "meal_plans") {
            const i = rows.findIndex((x) => x.family_id === r.family_id && x.day_index === r.day_index);
            if (i >= 0) rows[i] = { ...rows[i], ...r }; else rows.push({ id: `m${rows.length}`, ...r });
          } else rows.push({ created_at: new Date().toISOString(), ...r });
        }
        return route.fulfill({ status: 201, body: "" });
      }
      if (method === "PATCH") {
        const ids = (url.searchParams.get("id") || "").replace(/^in\.\(|\)$/g, "").replace(/^eq\./, "").split(",").map(s => s.replace(/"/g, ""));
        rows.forEach((r) => { if (ids.includes(r.id)) Object.assign(r, body); });
        return route.fulfill({ status: 204, body: "" });
      }
      if (method === "DELETE") {
        const id = (url.searchParams.get("id") || "").replace(/^eq\./, "");
        db[table] = rows.filter((r) => r.id !== id);
        return route.fulfill({ status: 204, body: "" });
      }
    }
    return json(route, { message: "not mocked: " + path }, 404);
  }
  return { db, state, handle };
}

export function fakeSession() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600 * 24 * 30;
  const user = { id: "u1", aud: "authenticated", role: "authenticated", email: "louis@example.com", user_metadata: { full_name: "Louis" }, app_metadata: {}, created_at: new Date().toISOString() };
  const access_token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: "u1", exp, role: "authenticated", email: user.email, aud: "authenticated" })}.sig`;
  return { access_token, refresh_token: "r", token_type: "bearer", expires_in: 3600 * 24 * 30, expires_at: exp, user };
}
