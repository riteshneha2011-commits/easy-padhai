import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEFAULT_CLASS_LEVEL } from "./classes";
import {
  CREDIT_REWARDS,
  STREAK_LADDER,
  STUDY_BLOCK_SECONDS,
  lessonCost,
} from "./credits";

/** Learner-local day (IST) so the daily bonus rolls over at midnight in India. */
function today() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * Every learner needs a profile row: it holds the credit balance. The signup
 * trigger cannot be relied upon (it lives on a managed schema), so we make
 * sure the row exists — idempotently — before touching credits.
 */
export async function ensureProfileFor(userId: string) {
  const { data: auth } = await supabaseAdmin.auth.admin.getUserById(userId);
  const meta = (auth?.user?.user_metadata ?? {}) as { full_name?: string; class_level?: number };
  const fallbackName = meta.full_name ?? (auth?.user?.email ?? "").split("@")[0] ?? "Student";
  const { data, error } = await supabaseAdmin.rpc("ensure_profile", {
    _user_id: userId,
    _full_name: fallbackName,
    _class_level: meta.class_level ?? DEFAULT_CLASS_LEVEL,
  });
  if (error) throw new Error(error.message);
  return (data ?? { created: false, balance: 0 }) as { created: boolean; balance: number };
}

/**
 * Atomic + duplicate-proof: the balance update and the history row are written
 * together inside one locked database call. Repeating the same `refId` never
 * pays twice, so refreshes and retries are safe.
 */
export async function awardCredits(
  userId: string,
  delta: number,
  reason: string,
  refId?: string | null,
) {
  if (delta === 0) return null;
  const result = await awardCreditsOnce(userId, delta, reason, refId);
  return result.balance;
}

export async function awardCreditsOnce(
  userId: string,
  delta: number,
  reason: string,
  refId?: string | null,
) {
  const { data, error } = await supabaseAdmin.rpc("award_credits_once", {
    _user_id: userId,
    _delta: delta,
    _reason: reason,
    _ref_id: refId ?? undefined,
  });
  if (error) throw new Error(error.message);
  return (data ?? { balance: 0, awarded: 0, duplicate: true }) as {
    balance: number;
    awarded: number;
    duplicate: boolean;
  };
}

export async function getBalance(userId: string) {
  const { data } = await supabaseAdmin.from("profiles").select("credits").eq("id", userId).maybeSingle();
  if (!data) return (await ensureProfileFor(userId)).balance;
  return data.credits ?? 0;
}


/** Free lessons: the first published lesson of each chapter, and summary-only lessons. */
async function isFreeLesson(lesson: { id: string; chapter_id: string; audio_url: string | null; video_url: string | null; pdf_url: string | null }) {
  if (!lesson.audio_url && !lesson.video_url && !lesson.pdf_url) return true;
  const { data: first } = await supabaseAdmin
    .from("lessons")
    .select("id")
    .eq("chapter_id", lesson.chapter_id)
    .eq("published", true)
    .order("order_index")
    .limit(1);
  return (first ?? [])[0]?.id === lesson.id;
}

export type LessonAccess = {
  lessonId: string;
  locked: boolean;
  free: boolean;
  cost: number;
  balance: number;
  media: { audio: string | null; video: string | null; pdf: string | null } | null;
};

async function isStaff(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "teacher"])
    .maybeSingle();
  return Boolean(data);
}

export async function getChapterUnlocksFor(
  userId: string | null,
  chapterId: string,
): Promise<string[]> {
  if (!userId) return [];
  const staff = await isStaff(userId);
  if (staff) {
    const { data: allLessons } = await supabaseAdmin
      .from("lessons")
      .select("id")
      .eq("chapter_id", chapterId);
    return (allLessons ?? []).map((l) => l.id);
  }

  const { data: unlocks } = await supabaseAdmin
    .from("lesson_unlocks")
    .select("lesson_id, lessons!inner(chapter_id)")
    .eq("user_id", userId)
    .eq("lessons.chapter_id", chapterId);

  return (unlocks ?? []).map((u) => u.lesson_id);
}

export async function getLessonAccessFor(
  userId: string | null,
  lessonId: string,
): Promise<LessonAccess> {
  const { data: lesson } = await supabaseAdmin
    .from("lessons")
    .select("id, chapter_id, audio_url, video_url, pdf_url, published")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson || !lesson.published) throw new Error("Lesson not found");

  const cost = lessonCost(lesson);
  const isFirst = await isFreeLesson(lesson);

  let isUnlocked = false;
  let balance = 0;

  if (userId) {
    balance = await getBalance(userId);
    const staff = await isStaff(userId);
    if (staff) {
      isUnlocked = true;
    } else {
      const { data } = await supabaseAdmin
        .from("lesson_unlocks")
        .select("id")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      isUnlocked = Boolean(data);
    }
  }

  // First lesson of each chapter: Audio lecture and summary are 100% free!
  // Subsequent lessons (or premium video/pdf) require credits earned by learning.
  const audioUnlocked = isFirst || isUnlocked;
  const videoUnlocked = isUnlocked;
  const pdfUnlocked = isUnlocked;
  const locked = !audioUnlocked;

  return {
    lessonId,
    locked,
    free: isFirst,
    cost,
    balance,
    media: {
      audio: audioUnlocked ? await signMedia(lesson.audio_url) : null,
      video: videoUnlocked ? await signMedia(lesson.video_url) : null,
      pdf: pdfUnlocked ? await signMedia(lesson.pdf_url) : null,
    },
  };
}

const STORAGE_PREFIX = "storage://";
const R2_PREFIX = "r2://";
const LESSON_BUCKET = "lesson-media";

/**
 * Uploaded files live in Cloudflare R2 CDN or private Supabase bucket.
 * Resolves to high-speed CDN URL or signed URL.
 */
async function signMedia(value: string | null) {
  if (!value) return null;
  if (value.startsWith(R2_PREFIX)) {
    const { resolveR2Url } = await import("./r2.server");
    return resolveR2Url(value);
  }
  if (!value.startsWith(STORAGE_PREFIX)) return value;
  const { data } = await supabaseAdmin.storage
    .from(LESSON_BUCKET)
    .createSignedUrl(value.slice(STORAGE_PREFIX.length), 60 * 60 * 4);
  return data?.signedUrl ?? null;
}

export async function unlockLessonFor(userId: string, lessonId: string) {
  const access = await getLessonAccessFor(userId, lessonId);
  if (!access.locked) return access;

  if (access.balance < access.cost) {
    throw new Error(
      `You need ${access.cost - access.balance} more credits. Finish a lesson or invite a friend to earn more.`,
    );
  }

  await supabaseAdmin
    .from("lesson_unlocks")
    .upsert({ user_id: userId, lesson_id: lessonId, cost: access.cost }, { onConflict: "user_id,lesson_id" });
  await awardCredits(userId, -access.cost, "Lesson unlocked", `unlock-${lessonId}`);

  return getLessonAccessFor(userId, lessonId);
}

/** Daily visit bonus. The database rejects a second award for the same day. */
export async function claimDailyLoginFor(userId: string) {
  await ensureProfileFor(userId);
  const result = await awardCreditsOnce(
    userId,
    CREDIT_REWARDS.dailyLogin,
    "Daily visit",
    `daily-${today()}`,
  );

  // Maintain and build daily study streak for learner
  const { touchStreak } = await import("./gamify.server");
  const streakData = await touchStreak(userId, 1);
  const streakBonus = await applyStreakLadderFor(userId);
  const totalBalance = result.balance + streakBonus;

  return {
    awarded: result.awarded,
    balance: totalBalance,
    streak: streakData.current_streak,
    streakBonus,
  };
}

export async function recordStudySecondsFor(userId: string, lessonId: string, seconds: number) {
  const safe = Math.max(0, Math.min(Math.round(seconds), 900));
  if (safe === 0) return { awarded: 0 };
  const day = today();

  const { data: existing } = await supabaseAdmin
    .from("study_time")
    .select("id, seconds, credited_blocks")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .eq("day", day)
    .maybeSingle();

  const total = (existing?.seconds ?? 0) + safe;
  const blocks = Math.floor(total / STUDY_BLOCK_SECONDS);
  const already = existing?.credited_blocks ?? 0;
  const newBlocks = Math.max(0, blocks - already);

  if (existing) {
    await supabaseAdmin
      .from("study_time")
      .update({ seconds: total, credited_blocks: blocks, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabaseAdmin
      .from("study_time")
      .insert({ user_id: userId, lesson_id: lessonId, day, seconds: total, credited_blocks: blocks });
  }

  let awarded = 0;
  if (newBlocks > 0) {
    awarded = newBlocks * CREDIT_REWARDS.studyBlock;
    await awardCredits(userId, awarded, `${newBlocks * 10} min of study time`, `study-${lessonId}-${day}-${blocks}`);
  }

  // Update streak minutes on study
  const { touchStreak } = await import("./gamify.server");
  await touchStreak(userId, Math.max(1, Math.round(safe / 60))).catch(() => null);

  return { awarded, minutes: Math.floor(total / 60) };
}

export async function applyStreakLadderFor(userId: string) {
  const { data: streak } = await supabaseAdmin
    .from("streaks")
    .select("current_streak")
    .eq("user_id", userId)
    .maybeSingle();
  const current = streak?.current_streak ?? 0;
  let awarded = 0;
  for (const step of STREAK_LADDER) {
    if (current < step.day) continue;
    const result = await awardCreditsOnce(
      userId,
      step.credits,
      `${step.day}-day streak bonus`,
      `streak-${step.day}`,
    );
    awarded += result.awarded;
  }
  return awarded;
}

/** Attach a referral code to a brand new account. Idempotent, blocks self-referral. */
export async function attachReferralFor(userId: string, rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { attached: false, reason: "empty" as const };

  const { data: existing } = await supabaseAdmin
    .from("referrals")
    .select("id")
    .eq("referred_id", userId)
    .maybeSingle();
  if (existing) return { attached: false, reason: "already" as const };

  const { data: referrer } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();
  if (!referrer || referrer.id === userId) return { attached: false, reason: "invalid" as const };

  await supabaseAdmin
    .from("referrals")
    .insert({ referrer_id: referrer.id, referred_id: userId, code, status: "pending" });
  await supabaseAdmin.from("profiles").update({ referred_by: referrer.id }).eq("id", userId);

  return { attached: true, reason: "ok" as const };
}

/** Called when a student finishes their first lesson: pays both sides. */
export async function qualifyReferralFor(userId: string) {
  const { data: referral } = await supabaseAdmin
    .from("referrals")
    .select("id, referrer_id, referred_id, status")
    .eq("referred_id", userId)
    .eq("status", "pending")
    .maybeSingle();
  if (!referral) return { awarded: 0 };

  await supabaseAdmin
    .from("referrals")
    .update({
      status: "qualified",
      qualified_at: new Date().toISOString(),
      credits_awarded: CREDIT_REWARDS.referral,
    })
    .eq("id", referral.id)
    .eq("status", "pending");

  await awardCredits(referral.referred_id, CREDIT_REWARDS.referral, "Referral bonus (joined via a friend)", `ref-${referral.id}-in`);
  await awardCredits(referral.referrer_id, CREDIT_REWARDS.referral, "Referral bonus (a friend started learning)", `ref-${referral.id}-out`);

  return { awarded: CREDIT_REWARDS.referral };
}

export async function getWalletFor(userId: string) {
  const { touchStreak } = await import("./gamify.server");
  const streakData = await touchStreak(userId, 0).catch(() => null);

  const [profileRes, eventsRes, referralsRes, streakRes, unlocksRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("credits, referral_code, full_name").eq("id", userId).maybeSingle(),
    supabaseAdmin
      .from("credit_events")
      .select("id, delta, reason, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(60),
    supabaseAdmin
      .from("referrals")
      .select("id, referred_id, status, credits_awarded, created_at")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("streaks").select("current_streak, longest_streak").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("lesson_unlocks").select("id").eq("user_id", userId),
  ]);

  const referrals = referralsRes.data ?? [];
  const friendIds = referrals.map((r) => r.referred_id);
  const { data: friends } = friendIds.length
    ? await supabaseAdmin.from("profiles").select("id, full_name").in("id", friendIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  return {
    credits: profileRes.data?.credits ?? 0,
    referralCode: profileRes.data?.referral_code ?? null,
    events: eventsRes.data ?? [],
    unlockedCount: (unlocksRes.data ?? []).length,
    streak: streakData?.current_streak ?? streakRes.data?.current_streak ?? 0,
    earnedFromReferrals: referrals.reduce((sum, r) => sum + (r.credits_awarded ?? 0), 0),
    referrals: referrals.map((r) => ({
      id: r.id,
      status: r.status,
      credits: r.credits_awarded ?? 0,
      created_at: r.created_at,
      name: (friends ?? []).find((f) => f.id === r.referred_id)?.full_name ?? "A friend",
    })),
  };
}

export async function getReferralBoard() {
  const { data: rows } = await supabaseAdmin
    .from("referrals")
    .select("referrer_id, status")
    .eq("status", "qualified");

  const counts = new Map<string, number>();
  for (const row of rows ?? []) counts.set(row.referrer_id, (counts.get(row.referrer_id) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  if (top.length === 0) return [];

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .in("id", top.map(([id]) => id));

  return top.map(([id, count]) => ({
    id,
    name: (profiles ?? []).find((p) => p.id === id)?.full_name ?? "Learner",
    friends: count,
    credits: count * CREDIT_REWARDS.referral,
  }));
}
