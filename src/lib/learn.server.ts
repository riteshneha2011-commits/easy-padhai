import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { awardXp, grantBadge, touchStreak } from "./gamify.server";
import { applyStreakLadderFor, awardCredits, qualifyReferralFor } from "./credits.server";
import { CREDIT_REWARDS } from "./credits";

export async function completeLessonFor(userId: string, lessonId: string) {
  const { data: existing } = await supabaseAdmin
    .from("lesson_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing) return { alreadyDone: true, xp: 0, credits: 0 };

  const { data: lesson } = await supabaseAdmin
    .from("lessons")
    .select("id, chapter_id, duration_minutes")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) throw new Error("Lesson not found");

  await supabaseAdmin.from("lesson_progress").insert({ user_id: userId, lesson_id: lessonId });
  await awardXp(userId, 10, "Lesson completed");
  await touchStreak(userId, lesson.duration_minutes ?? 10);

  let credits = CREDIT_REWARDS.lessonComplete;
  await awardCredits(userId, CREDIT_REWARDS.lessonComplete, "Lesson completed", `lesson-${lessonId}`);
  credits += await applyStreakLadderFor(userId);
  const referral = await qualifyReferralFor(userId);
  credits += referral.awarded;

  const { count: totalDone } = await supabaseAdmin
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if ((totalDone ?? 0) <= 1) await grantBadge(userId, "first_lesson");

  const [{ data: chapterLessons }, { data: doneRows }] = await Promise.all([
    supabaseAdmin.from("lessons").select("id").eq("chapter_id", lesson.chapter_id).eq("published", true),
    supabaseAdmin.from("lesson_progress").select("lesson_id").eq("user_id", userId),
  ]);
  const doneSet = new Set((doneRows ?? []).map((r) => r.lesson_id));
  if ((chapterLessons ?? []).length > 0 && (chapterLessons ?? []).every((l) => doneSet.has(l.id))) {
    await grantBadge(userId, "chapter_master");
    await awardXp(userId, 25, "Chapter completed");
  }

  return { alreadyDone: false, xp: 10, credits };
}

function detectSubjectCategory(
  slug: string,
  title: string,
  subjectName: string,
  description?: string | null,
): string {
  const pName = (subjectName ?? "").toLowerCase();
  if (
    pName.includes("social") ||
    pName.includes("history") ||
    pName.includes("geography") ||
    pName.includes("civics") ||
    pName.includes("economics") ||
    pName.includes("sst")
  ) {
    return "Social Science";
  }
  if (pName.includes("math")) {
    return "Mathematics";
  }
  const text = `${slug} ${title} ${description ?? ""}`.toLowerCase();
  if (
    text.includes("history") ||
    text.includes("geography") ||
    text.includes("civics") ||
    text.includes("economics") ||
    text.includes("revolution") ||
    text.includes("democracy") ||
    text.includes("constitution") ||
    text.includes("drainage")
  ) {
    return "Social Science";
  }
  if (
    text.includes("atom") ||
    text.includes("matter") ||
    text.includes("mixture") ||
    text.includes("chemical") ||
    text.includes("reaction") ||
    text.includes("solution") ||
    text.includes("acid") ||
    text.includes("base")
  ) {
    return "Chemistry";
  }
  if (
    text.includes("cell") ||
    text.includes("tissue") ||
    text.includes("life") ||
    text.includes("living") ||
    text.includes("organism") ||
    text.includes("diversity") ||
    text.includes("reproduction")
  ) {
    return "Biology";
  }
  return "Physics";
}

export async function getDashboardFor(userId: string) {
  const [profileRes, streakData, progressRes, attemptsRes, badgesRes, lessonsRes, chaptersRes, subjectsRes] =
    await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      touchStreak(userId, 1),
      supabaseAdmin.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", userId),
      supabaseAdmin
        .from("test_attempts")
        .select("id, test_id, score, total, details, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin.from("user_badges").select("badge_code, earned_at").eq("user_id", userId),
      supabaseAdmin.from("lessons").select("id, title, chapter_id, kind").eq("published", true),
      supabaseAdmin
        .from("chapters")
        .select("id, slug, title, order_index, subject_id, description")
        .eq("published", true)
        .order("order_index"),
      supabaseAdmin.from("subjects").select("id, name, slug").eq("published", true),
    ]);

  const done = new Set((progressRes.data ?? []).map((p) => p.lesson_id));
  const lessons = lessonsRes.data ?? [];
  const chapters = chaptersRes.data ?? [];
  const subjects = subjectsRes.data ?? [];

  const chapterProgress = chapters.map((chapter) => {
    const own = lessons.filter((l) => l.chapter_id === chapter.id);
    const completed = own.filter((l) => done.has(l.id)).length;
    const sub = subjects.find((s) => s.id === chapter.subject_id);
    const subjectName = sub?.name ?? "Science";
    const subjectCategory = detectSubjectCategory(
      chapter.slug,
      chapter.title,
      subjectName,
      chapter.description,
    );

    return {
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      subjectId: chapter.subject_id,
      subjectName,
      subjectCategory,
      total: own.length,
      completed,
      percent: own.length ? Math.round((completed / own.length) * 100) : 0,
    };
  });

  const nextChapter =
    chapterProgress.find((c) => c.percent < 100 && c.total > 0) ?? chapterProgress[0] ?? null;

  const weakTopics: Record<string, number> = {};
  for (const attempt of attemptsRes.data ?? []) {
    const details = (attempt.details ?? []) as Array<{ topic?: string | null; correct?: boolean }>;
    for (const item of details) {
      if (item && item.correct === false && item.topic) {
        weakTopics[item.topic] = (weakTopics[item.topic] ?? 0) + 1;
      }
    }
  }

  const { data: allBadges } = await supabaseAdmin.from("badges").select("*");

  return {
    profile: profileRes.data,
    streak: streakData,
    lessonsCompleted: done.size,
    attempts: attemptsRes.data ?? [],
    badges: (badgesRes.data ?? []).map((b) => ({
      ...b,
      meta: (allBadges ?? []).find((x) => x.code === b.badge_code) ?? null,
    })),
    allBadges: allBadges ?? [],
    chapterProgress,
    nextChapter,
    weakTopics: Object.entries(weakTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([topic, misses]) => ({ topic, misses })),
  };
}

export async function getChapterProgressFor(userId: string, chapterId: string) {
  const { data: lessons } = await supabaseAdmin
    .from("lessons")
    .select("id")
    .eq("chapter_id", chapterId)
    .eq("published", true);
  const ids = (lessons ?? []).map((l) => l.id);
  if (ids.length === 0) return [];
  const { data } = await supabaseAdmin
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", ids);
  return (data ?? []).map((d) => d.lesson_id);
}
