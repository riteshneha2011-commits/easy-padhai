import { createPublicClient } from "./db.server";

export type CatalogChapter = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  lessonCount: number;
  testId: string | null;
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
      supabase.from("lessons").select("id, chapter_id").eq("published", true),
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
      .map((chapter) => ({
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        description: chapter.description,
        order_index: chapter.order_index,
        lessonCount: (lessons ?? []).filter((l) => l.chapter_id === chapter.id).length,
        testId: (tests ?? []).find((t) => t.chapter_id === chapter.id)?.id ?? null,
      })),
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

  const [{ data: lessons }, { data: test }] = await Promise.all([
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
      .eq("published", true)
      .maybeSingle(),
  ]);

  const list = lessons ?? [];
  const firstId = list[0]?.id ?? null;

  // Media URLs are never sent to the browser here — they are released per lesson
  // by getLessonAccess once the lesson is free or unlocked with credits.
  const safeLessons = list.map(({ audio_url, video_url, pdf_url, ...rest }) => ({
    ...rest,
    hasAudio: Boolean(audio_url),
    hasVideo: Boolean(video_url),
    hasPdf: Boolean(pdf_url),
    isFree: rest.id === firstId || (!audio_url && !video_url && !pdf_url),
  }));

  return { chapter, lessons: safeLessons, test: test ?? null };
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
