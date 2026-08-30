import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

const ALLOWED = ["/onboarding", "/auth"];

/**
 * Sends freshly registered learners to the details form once, right after
 * email/password or Google sign-up.
 */
export function OnboardingGate() {
  const { user, profile, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user || !profile) return;
    if (profile.onboarding_completed) return;
    if (ALLOWED.some((p) => pathname.startsWith(p))) return;
    navigate({ to: "/onboarding", replace: true });
  }, [loading, user, profile, pathname, navigate]);

  return null;
}
