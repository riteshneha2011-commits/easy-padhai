import { createPublicClient } from "./db.server";

export type CatalogLesson = {
  id: string;
  chapter_id: string;
  title: string;
  order_index: number;
  kind: string | null;
  duration_minutes: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
  hasPdf: boolean;
  hasSummary: boolean;
};

export type CatalogChapter = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  lessonCount: number;
  testId: string | null;
  lessons: CatalogLesson[];
};

export type CatalogSubject = {
  id: string;
  slug: string;
  name: string;
  class_level: number;
  description: string | null;
  chapters: CatalogChapter[];
};

export async function fetchCatalog(): Promise<CatalogSubject[]> {
  const supabase = createPublicClient();

  const [{ data: subjects }, { data: chapters }, { data: lessons }, { data: tests }] =
    await Promise.all([
      supabase.from("subjects").select("*").eq("published", true).order("order_index"),
      supabase.from("chapters").select("*").eq("published", true).order("order_index"),
      supabase
        .from("lessons")
        .select("id, chapter_id, title, order_index, kind, duration_minutes, audio_url, video_url, pdf_url, summary")
        .eq("published", true)
        .order("order_index"),
      supabase
        .from("tests")
        .select("id, chapter_id, description, questions(id)")
        .eq("published", true),
    ]);

  return (subjects ?? []).map((subject) => ({
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    class_level: subject.class_level,
    description: subject.description,
    chapters: (chapters ?? [])
      .filter((chapter) => chapter.subject_id === subject.id)
      .map((chapter) => {
        const ownLessons = (lessons ?? [])
          .filter((l) => l.chapter_id === chapter.id)
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map((l) => ({
            id: l.id,
            chapter_id: l.chapter_id,
            title: l.title,
            order_index: l.order_index ?? 0,
            kind: l.kind ?? "concept",
            duration_minutes: l.duration_minutes ?? null,
            hasAudio: Boolean(l.audio_url),
            hasVideo: Boolean(l.video_url),
            hasPdf: Boolean(l.pdf_url),
            hasSummary: Boolean(l.summary),
          }));

        return {
          id: chapter.id,
          slug: chapter.slug,
          title: chapter.title,
          description: chapter.description,
          order_index: chapter.order_index,
          lessonCount: ownLessons.length,
          testId:
            (tests as Array<{ id: string; chapter_id: string; description: string | null; questions?: Array<{ id: string }> }> ?? []).find(
              (t) =>
                t.chapter_id === chapter.id &&
                !t.description?.startsWith("lesson:") &&
                Array.isArray(t.questions) &&
                t.questions.length > 0,
            )?.id ?? null,
          lessons: ownLessons,
        };
      }),
  }));
}

export async function fetchChapterBySlug(slug: string) {
  const supabase = createPublicClient();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("*, subjects(name, slug, class_level)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!chapter) return null;

  const [{ data: lessons }, { data: allTests }, { data: siblingChapters }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .eq("chapter_id", chapter.id)
      .eq("published", true)
      .order("order_index"),
    supabase
      .from("tests")
      .select("id, title, description, duration_minutes, questions(id)")
      .eq("chapter_id", chapter.id)
      .eq("published", true),
    supabase
      .from("chapters")
      .select("id, title, slug, order_index")
      .eq("subject_id", chapter.subject_id)
      .eq("published", true)
      .order("order_index"),
  ]);

  type TestRecord = {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number | null;
    questions?: Array<{ id: string }>;
  };

  const list = lessons ?? [];
  const testsList = (allTests as TestRecord[] | null) ?? [];
  const firstId = list[0]?.id ?? null;

  // Chapter-level test is the test NOT tagged with a specific lesson AND containing questions:
  const chapterTestRecord =
    testsList.find(
      (t) =>
        !t.description?.startsWith("lesson:") &&
        Array.isArray(t.questions) &&
        t.questions.length > 0,
    ) ?? null;

  const chapterTest = chapterTestRecord
    ? {
        id: chapterTestRecord.id,
        title: chapterTestRecord.title,
        duration_minutes: chapterTestRecord.duration_minutes,
      }
    : null;

  // Media URLs are never sent to the browser here — they are released per lesson
  // by getLessonAccess once the lesson is free or unlocked with credits.
  const safeLessons = list.map(({ audio_url, video_url, pdf_url, ...rest }) => {
    const lessonTest =
      testsList.find(
        (t) =>
          t.description?.startsWith(`lesson:${rest.id}`) &&
          Array.isArray(t.questions) &&
          t.questions.length > 0,
      ) ?? null;
    return {
      ...rest,
      hasAudio: Boolean(audio_url),
      hasVideo: Boolean(video_url),
      hasPdf: Boolean(pdf_url),
      isFree: rest.id === firstId || (!audio_url && !video_url && !pdf_url),
      test: lessonTest ? { id: lessonTest.id, title: lessonTest.title, duration_minutes: lessonTest.duration_minutes } : null,
    };
  });

  return { chapter, lessons: safeLessons, test: chapterTest, siblingChapters: siblingChapters ?? [] };
}

export async function fetchLeaderboard(userId?: string | null) {
  // Profiles are not publicly readable; the leaderboard exposes only display
  // name, class level and XP via a trusted server-side read.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [profilesRes, badgesRes, userBadgesRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, full_name, total_xp, class_level")
      .order("total_xp", { ascending: false })
      .limit(25),
    supabaseAdmin
      .from("badges")
      .select("code, name, description, icon")
      .order("code"),
    userId
      ? supabaseAdmin.from("user_badges").select("badge_code").eq("user_id", userId)
      : Promise.resolve({ data: [] }),
  ]);

  const earnedCodes = new Set((userBadgesRes.data ?? []).map((b) => b.badge_code));

  let userRank: { rank: number; xp: number; full_name: string; class_level?: number | null } | null = null;
  if (userId) {
    const { data: myProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, total_xp, class_level")
      .eq("id", userId)
      .maybeSingle();

    if (myProfile) {
      const { count } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gt("total_xp", myProfile.total_xp ?? 0);

      userRank = {
        rank: (count ?? 0) + 1,
        xp: myProfile.total_xp ?? 0,
        full_name: myProfile.full_name ?? "You",
        class_level: myProfile.class_level,
      };
    }
  }

  return {
    leaderboard: (profilesRes.data ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      total_xp: p.total_xp ?? 0,
      class_level: p.class_level,
    })),
    badges: (badgesRes.data ?? []).map((b) => ({
      code: b.code,
      name: b.name,
      description: b.description,
      icon: b.icon,
      earned: earnedCodes.has(b.code),
    })),
    userRank,
  };
}
