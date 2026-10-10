import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/contexts/AuthContext";
import { rpc, supabase } from "@/lib/supabase";
import { safeLocal } from "@/lib/storage";
import { moveLocalPlanIntoFamily } from "@/lib/useWeekPlan";

export type Family = { id: string; name: string; code: string; owner_id: string };
export type FamilyMember = { user_id: string; email: string | null; name: string | null; is_owner: boolean };
export type FamilyResult = { ok: true } | { ok: false; error: string };

type FamilyContextType = {
  family: Family | null;
  familyId: string | null;
  members: FamilyMember[];
  isOwner: boolean;
  /** false until the server has answered at least once (cached data may be shown before) */
  loaded: boolean;
  refresh: () => Promise<void>;
  createFamily: (name: string) => Promise<FamilyResult & { code?: string }>;
  joinFamily: (code: string) => Promise<FamilyResult & { name?: string }>;
  leaveFamily: () => Promise<FamilyResult>;
  removeMember: (userId: string) => Promise<FamilyResult>;
  regenerateCode: () => Promise<FamilyResult>;
};

const FamilyContext = createContext<FamilyContextType | null>(null);

type Cached = { family: Family | null; members: FamilyMember[] };

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const cacheKey = userId ? `dinrr:family:${userId}` : null;

  const [state, setState] = useState<Cached>(() =>
    cacheKey ? safeLocal.getJSON<Cached>(cacheKey, { family: null, members: [] }) : { family: null, members: [] },
  );
  const [loaded, setLoaded] = useState(false);
  const loadSeq = useRef(0);

  const apply = useCallback((next: Cached) => {
    setState(next);
    if (cacheKey) safeLocal.setJSON(cacheKey, next);
  }, [cacheKey]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const seq = ++loadSeq.current;
    const res = await rpc<{ family: Family | null; members: FamilyMember[] }>("get_my_family");
    if (seq !== loadSeq.current) return; // a newer load started
    if (res.ok) {
      apply({ family: res.family ?? null, members: res.members ?? [] });
      setLoaded(true);
    } else {
      console.warn("get_my_family failed:", res.error);
    }
  }, [userId, apply]);

  // The provider is remounted for every account (key in App.tsx), so a
  // family can never leak from one user to the next.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async: state is only set after the network call
    if (userId) refresh();
  }, [userId, refresh]);

  // Live updates: someone joins/leaves, the family is renamed, or I'm removed
  const familyId = state.family?.id ?? null;
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`family-meta:${userId}`);
    channel.on("postgres_changes", { event: "*", schema: "public", table: "family_members", filter: `user_id=eq.${userId}` }, () => refresh());
    if (familyId) {
      channel
        .on("postgres_changes", { event: "*", schema: "public", table: "family_members", filter: `family_id=eq.${familyId}` }, () => refresh())
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "families", filter: `id=eq.${familyId}` }, () => refresh());
    }
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, familyId, refresh]);

  // Coming back to the app: re-check (covers missed realtime events)
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !userId) return;
    const l = App.addListener("resume", () => refresh());
    return () => { l.then((h) => h.remove()); };
  }, [userId, refresh]);

  const value = useMemo<FamilyContextType>(() => ({
    family: state.family,
    familyId,
    members: state.members,
    isOwner: !!state.family && state.family.owner_id === userId,
    loaded,
    refresh,

    createFamily: async (name) => {
      const res = await rpc<{ family: Family }>("create_family", { p_name: name });
      if (!res.ok) return res;
      if (userId) await moveLocalPlanIntoFamily(userId, res.family.id);
      await refresh();
      return { ok: true, code: res.family.code };
    },

    joinFamily: async (code) => {
      const res = await rpc<{ family: Family }>("join_family", { p_code: code });
      if (!res.ok) return res;
      await refresh();
      return { ok: true, name: res.family.name };
    },

    leaveFamily: async () => {
      const res = await rpc("leave_family");
      if (res.ok) apply({ family: null, members: [] });
      return res.ok ? { ok: true } : res;
    },

    removeMember: async (memberId) => {
      const res = await rpc("remove_family_member", { p_user_id: memberId });
      if (res.ok) await refresh();
      return res.ok ? { ok: true } : res;
    },

    regenerateCode: async () => {
      const res = await rpc("regenerate_family_code");
      if (res.ok) await refresh();
      return res.ok ? { ok: true } : res;
    },
  }), [state, familyId, userId, loaded, refresh, apply]);

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};

export const useFamily = () => {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used within FamilyProvider");
  return ctx;
};
