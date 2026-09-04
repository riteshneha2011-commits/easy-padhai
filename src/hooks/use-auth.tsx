import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { startSession } from "@/lib/credits.functions";
import { getMyProfile } from "@/lib/profile.functions";
import { REF_STORAGE_KEY } from "@/lib/credits";
import { soundFx } from "@/lib/sound-effects";

export type AppRole = "admin" | "teacher" | "student";

type Profile = {
  id: string;
  full_name: string | null;
  class_level: number | null;
  total_xp: number;
  avatar_url: string | null;
  credits: number;
  referral_code: string | null;
  phone: string | null;
  onboarding_completed: boolean;
};

type AuthValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  credits: number;
  roles: AppRole[];
  isStaff: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const bootstrapped = useRef<string | null>(null);

  const load = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      return;
    }
    const [profileRow, { data: roleRows }] = await Promise.all([
      getMyProfile().catch(() => null),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile((profileRow ?? null) as Profile | null);
    setRoles(((roleRows ?? []) as { role: AppRole }[]).map((r) => r.role));
  }, []);

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      void load(nextSession?.user?.id);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      void load(data.session?.user?.id).finally(() => setLoading(false));
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [load]);

  // Daily credit bonus + referral attachment, once per signed-in session.
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || bootstrapped.current === userId) return;
    bootstrapped.current = userId;

    const refCode = typeof window === "undefined" ? null : window.localStorage.getItem(REF_STORAGE_KEY);

    startSession({ data: { refCode } })
      .then((result) => {
        if (refCode) window.localStorage.removeItem(REF_STORAGE_KEY);
        if (result?.referral?.attached) {
          toast.success("Referral applied — bonus credits land when you finish your first lesson 🎁");
        }
        if (result?.streakBonus && result.streakBonus > 0) {
          soundFx.playSuccess();
          toast.success(`🔥 ${result.streak}-Day Streak Milestone! +${result.streakBonus} bonus credits! 🎉`);
        } else if (result?.awarded) {
          const streakText = result.streak ? ` · 🔥 Day ${result.streak} Streak` : "";
          toast.success(`Daily visit bonus: +${result.awarded} credits${streakText}`);
        }
        void load(userId);
        void qc.invalidateQueries({ queryKey: ["wallet"] });
        void qc.invalidateQueries({ queryKey: ["dashboard"] });
      })
      .catch(() => {
        /* non-critical */
      });
  }, [session?.user?.id, load, qc]);

  const value = useMemo<AuthValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      credits: profile?.credits ?? 0,
      roles,
      isStaff: roles.includes("admin") || roles.includes("teacher"),
      isAdmin: roles.includes("admin"),
      refresh: async () => {
        await Promise.all([
          load(session?.user?.id),
          qc.invalidateQueries({ queryKey: ["wallet"] }),
          qc.invalidateQueries({ queryKey: ["dashboard"] }),
        ]);
      },
      signOut: async () => {
        bootstrapped.current = null;
        await supabase.auth.signOut();
      },
    }),
    [loading, session, profile, roles, load, qc],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
