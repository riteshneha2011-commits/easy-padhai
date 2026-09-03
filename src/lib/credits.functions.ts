import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getWallet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getWalletFor } = await import("./credits.server");
    return getWalletFor(context.userId);
  });

/** Called once per session: pays the daily visit bonus and attaches a pending referral code. */
export const startSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { refCode?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const { claimDailyLoginFor, attachReferralFor } = await import("./credits.server");
    const { ensureOwnerAdmin } = await import("./owner.server");
    await ensureOwnerAdmin(context.userId).catch(() => null);
    const referral = data.refCode ? await attachReferralFor(context.userId, data.refCode) : null;
    const daily = await claimDailyLoginFor(context.userId);
    return { ...daily, referral };
  });

export const getLessonAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lessonId: string }) => data)
  .handler(async ({ data, context }) => {
    const { getLessonAccessFor } = await import("./credits.server");
    return getLessonAccessFor(context.userId, data.lessonId);
  });

/** Public: only ever returns media for a free lesson. */
export const getPublicLessonAccess = createServerFn({ method: "POST" })
  .inputValidator((data: { lessonId: string }) => data)
  .handler(async ({ data }) => {
    const { getLessonAccessFor } = await import("./credits.server");
    return getLessonAccessFor(null, data.lessonId);
  });

export const unlockLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lessonId: string }) => data)
  .handler(async ({ data, context }) => {
    const { unlockLessonFor } = await import("./credits.server");
    return unlockLessonFor(context.userId, data.lessonId);
  });

export const recordStudySeconds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lessonId: string; seconds: number }) => data)
  .handler(async ({ data, context }) => {
    const { recordStudySecondsFor } = await import("./credits.server");
    return recordStudySecondsFor(context.userId, data.lessonId, data.seconds);
  });

export const getChapterUnlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { chapterId: string }) => data)
  .handler(async ({ data, context }) => {
    const { getChapterUnlocksFor } = await import("./credits.server");
    return getChapterUnlocksFor(context.userId, data.chapterId);
  });

export const getReferralLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
  const { getReferralBoard } = await import("./credits.server");
  return getReferralBoard();
});
