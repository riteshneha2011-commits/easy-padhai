import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEFAULT_CLASS_LEVEL } from "@/lib/classes";

export type ProfileDetailsInput = {
  full_name: string;
  phone: string;
  class_level?: number | null;
  guardian_phone?: string | null;
  school_name?: string | null;
  city?: string | null;
  state?: string | null;
  board?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  preferred_language?: string | null;
  goal?: string | null;
};

const PROFILE_COLUMNS =
  "id, full_name, class_level, total_xp, credits, referral_code, phone, guardian_phone, school_name, city, state, board, gender, date_of_birth, preferred_language, goal, onboarding_completed, created_at";

export async function getProfileFor(userId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  return data;
}

function clean(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed.length ? trimmed.slice(0, 200) : null;
}

export async function saveProfileDetailsFor(userId: string, input: ProfileDetailsInput) {
  const fullName = clean(input.full_name);
  const phone = clean(input.phone);
  if (!fullName) throw new Error("Name is required");
  if (!phone || !/^[0-9+\-\s()]{8,20}$/.test(phone)) throw new Error("Enter a valid mobile number");

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      class_level: input.class_level ?? DEFAULT_CLASS_LEVEL,
      guardian_phone: clean(input.guardian_phone),
      school_name: clean(input.school_name),
      city: clean(input.city),
      state: clean(input.state),
      board: clean(input.board),
      gender: clean(input.gender),
      date_of_birth: clean(input.date_of_birth),
      preferred_language: clean(input.preferred_language),
      goal: clean(input.goal),
      onboarding_completed: true,
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Admin-only: full picture of one learner — identity, credits, XP, streak and activity. */
export async function getUserDetailFor(userId: string) {
  const [profile, auth, roles, streak, progress, attempts, unlocks, credits, referrals, badges] =
    await Promise.all([
      supabaseAdmin.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle(),
      supabaseAdmin.auth.admin.getUserById(userId),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
      supabaseAdmin.from("streaks").select("*").eq("user_id", userId).maybeSingle(),
      supabaseAdmin
        .from("lesson_progress")
        .select("lesson_id, completed_at, lessons(title, chapter_id)")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(25),
      supabaseAdmin
        .from("test_attempts")
        .select("id, test_id, score, total, created_at, tests(title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25),
      supabaseAdmin.from("lesson_unlocks").select("lesson_id, cost, created_at").eq("user_id", userId),
      supabaseAdmin
        .from("credit_events")
        .select("delta, reason, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25),
      supabaseAdmin.from("referrals").select("status, credits_awarded").eq("referrer_id", userId),
      supabaseAdmin.from("user_badges").select("badge_code, earned_at").eq("user_id", userId),
    ]);

  if (!profile.data) throw new Error("User not found");
  const authUser = auth.data?.user;

  return {
    profile: profile.data,
    email: authUser?.email ?? null,
    authPhone: authUser?.phone ?? null,
    lastSignInAt: authUser?.last_sign_in_at ?? null,
    provider: authUser?.app_metadata?.provider ?? null,
    roles: (roles.data ?? []).map((r) => r.role),
    streak: streak.data ?? null,
    lessonsCompleted: (progress.data ?? []).length,
    recentLessons: (progress.data ?? []).map((row) => ({
      lessonId: row.lesson_id,
      title: (row.lessons as { title?: string } | null)?.title ?? "Lesson",
      completedAt: row.completed_at,
    })),
    attempts: (attempts.data ?? []).map((a) => ({
      id: a.id,
      title: (a.tests as { title?: string } | null)?.title ?? "Test",
      score: a.score,
      total: a.total,
      createdAt: a.created_at,
    })),
    unlocks: unlocks.data ?? [],
    creditsSpent: (unlocks.data ?? []).reduce((sum, u) => sum + (u.cost ?? 0), 0),
    creditEvents: credits.data ?? [],
    referralsQualified: (referrals.data ?? []).filter((r) => r.status === "qualified").length,
    badges: badges.data ?? [],
  };
}
