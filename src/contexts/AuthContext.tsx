import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { supabase } from "@/lib/supabase";
import { AUTH_REDIRECT_URL } from "@/config";
import { clearWidget } from "@/lib/sharedStorage";
import { resetIdentity } from "@/lib/revenuecat";
import { safeLocal } from "@/lib/storage";

export type AuthErrorKind =
  | "wrongCredentials" | "emailNotConfirmed" | "emailInUse" | "tooManyAttempts" | "weakPassword"
  | "invalidEmail" | "linkExpired" | "network" | "unknown";

type Result = { ok: true } | { ok: false; error: AuthErrorKind; message?: string };

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** true after opening a password-reset link — show the "choose new password" screen */
  recovering: boolean;
  linkError: AuthErrorKind | null;
  clearLinkError: () => void;
  signUp: (email: string, password: string, fullName: string) => Promise<Result>;
  signIn: (email: string, password: string) => Promise<Result>;
  resendConfirmation: (email: string) => Promise<Result>;
  requestPasswordReset: (email: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<Result>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function classify(error: AuthError | Error | null | undefined): AuthErrorKind {
  if (!error) return "unknown";
  const code = (error as AuthError).code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login")) return "wrongCredentials";
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) return "emailNotConfirmed";
  if (code === "user_already_exists" || code === "email_exists" || msg.includes("already registered")) return "emailInUse";
  if (code.startsWith("over_") || msg.includes("rate limit") || msg.includes("too many")) return "tooManyAttempts";
  if (code === "weak_password" || msg.includes("weak") || msg.includes("pwned")) return "weakPassword";
  if (code === "email_address_invalid" || msg.includes("invalid email") || msg.includes("unable to validate email")) return "invalidEmail";
  if (code === "otp_expired" || msg.includes("expired")) return "linkExpired";
  if (msg.includes("fetch") || msg.includes("network")) return "network";
  return "unknown";
}

const fail = (error: AuthError | Error | null | undefined): Result => ({
  ok: false,
  error: classify(error),
  message: error?.message,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [linkError, setLinkError] = useState<AuthErrorKind | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (event === "SIGNED_OUT") setRecovering(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Email links (confirm sign-up / reset password) open the app via dinrr://login-callback
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handle = async (url: string) => {
      if (!url.includes("login-callback")) return;
      const parsed = new URL(url.replace("dinrr://", "https://dinrr.app/"));
      const params = new URLSearchParams(parsed.hash.replace(/^#/, ""));
      parsed.searchParams.forEach((v, k) => params.set(k, v));

      if (params.get("error") || params.get("error_code")) {
        setLinkError(classify(new Error(params.get("error_description") ?? params.get("error_code") ?? "expired")));
        return;
      }
      const isRecovery = params.get("type") === "recovery";
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const code = params.get("code");

      let error: AuthError | null;
      if (accessToken && refreshToken) {
        ({ error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }));
      } else if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
      } else {
        return;
      }
      if (error) setLinkError(classify(error));
      else if (isRecovery) setRecovering(true);
    };

    App.getLaunchUrl().then((r) => { if (r?.url) handle(r.url); }).catch(() => {});
    const listener = App.addListener("appUrlOpen", (e) => { handle(e.url); });
    return () => { listener.then((l) => l.remove()); };
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    recovering,
    linkError,
    clearLinkError: () => setLinkError(null),

    signUp: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() }, emailRedirectTo: AUTH_REDIRECT_URL },
      });
      if (error) return fail(error);
      // Supabase hides "already registered" behind a user with no identities
      if (data.user && (data.user.identities?.length ?? 0) === 0) return { ok: false, error: "emailInUse" };
      return { ok: true };
    },

    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? fail(error) : { ok: true };
    },

    resendConfirmation: async (email) => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: AUTH_REDIRECT_URL },
      });
      return error ? fail(error) : { ok: true };
    },

    requestPasswordReset: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: AUTH_REDIRECT_URL });
      return error ? fail(error) : { ok: true };
    },

    updatePassword: async (password) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return fail(error);
      setRecovering(false);
      return { ok: true };
    },

    signOut: async () => {
      await resetIdentity();
      await clearWidget(safeLocal.get("mealweek-language") ?? "en");
      await supabase.auth.signOut({ scope: "local" });
    },

    deleteAccount: async () => {
      const userId = session?.user.id;
      const { error } = await supabase.functions.invoke("delete-account", { method: "POST" });
      if (error) return fail(error);
      if (userId) {
        for (const k of ["plan", "extras", "family", "familyPlan"]) safeLocal.remove(`dinrr:${k}:${userId}`);
      }
      await resetIdentity();
      await clearWidget(safeLocal.get("mealweek-language") ?? "en");
      await supabase.auth.signOut({ scope: "local" });
      return { ok: true };
    },
  }), [session, loading, recovering, linkError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
