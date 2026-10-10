import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config";
import { authStorage } from "@/lib/storage";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // deep links are handled in AuthContext
  },
});

/** Calls a Postgres function that returns { ok, error?, ... } and normalises failures. */
export async function rpc<T extends object = Record<string, unknown>>(
  fn: string,
  args?: Record<string, unknown>,
): Promise<({ ok: true } & T) | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    console.warn(`rpc ${fn} failed`, error);
    const missing = error.code === "PGRST202" || /could not find the function/i.test(error.message);
    return { ok: false, error: missing ? "server_outdated" : "network" };
  }
  const result = data as { ok?: boolean; error?: string } & T;
  if (result && result.ok === false) return { ok: false, error: result.error ?? "unknown" };
  return { ok: true, ...(result as T) };
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Fallback for very old WebViews
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
