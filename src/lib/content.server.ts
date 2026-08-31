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
        .select("id, chapter_id, title, order_index, kind, duration_seconds, audio_url, video_url, pdf_url, summary_text")
        .eq("published", true)
        .order("order_index"),
      supabase.from("tests").select("id, chapter_id").eq("published", true),
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
            duration_minutes: l.duration_seconds ? Math.round(l.duration_seconds / 60) : null,
            hasAudio: Boolean(l.audio_url),
            hasVideo: Boolean(l.video_url),
            hasPdf: Boolean(l.pdf_url),
            hasSummary: Boolean(l.summary_text),
          }));

        return {
          id: chapter.id,
          slug: chapter.slug,
          title: chapter.title,
          description: chapter.description,
          order_index: chapter.order_index,
          lessonCount: ownLessons.length,
          testId:
            (tests ?? []).find(
              (t) => t.chapter_id === chapter.id && !t.description?.startsWith("lesson:"),
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

  const [{ data: lessons }, { data: allTests }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .eq("chapter_id", chapter.id)
      .eq("published", true)
      .order("order_index"),
    supabase
      .from("tests")
      .select("id, title, description, duration_minutes")
      .eq("chapter_id", chapter.id)
      .eq("published", true),
  ]);

  const list = lessons ?? [];
  const testsList = allTests ?? [];
  const firstId = list[0]?.id ?? null;

  // Chapter-level test is the test NOT tagged with a specific lesson:
  const chapterTest = testsList.find((t) => !t.description?.startsWith("lesson:")) ?? null;

  // Media URLs are never sent to the browser here — they are released per lesson
  // by getLessonAccess once the lesson is free or unlocked with credits.
  const safeLessons = list.map(({ audio_url, video_url, pdf_url, ...rest }) => {
    const lessonTest = testsList.find((t) => t.description?.startsWith(`lesson:${rest.id}`)) ?? null;
    return {
      ...rest,
      hasAudio: Boolean(audio_url),
      hasVideo: Boolean(video_url),
      hasPdf: Boolean(pdf_url),
      isFree: rest.id === firstId || (!audio_url && !video_url && !pdf_url),
      test: lessonTest ? { id: lessonTest.id, title: lessonTest.title, duration_minutes: lessonTest.duration_minutes } : null,
    };
  });

  return { chapter, lessons: safeLessons, test: chapterTest };
}

export async function fetchLeaderboard() {
  // Profiles are not publicly readable; the leaderboard exposes only display
  // name, class level and XP via a trusted server-side read.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, total_xp, class_level")
    .order("total_xp", { ascending: false })
    .limit(25);
  return (data ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    total_xp: p.total_xp,
    class_level: p.class_level,
  }));
}
