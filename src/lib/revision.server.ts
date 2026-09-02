import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type RevisionResource = "lesson" | "audio" | "video" | "summary" | "pdf";
export type QuestionSource = "manual" | "mistake";

export async function toggleBookmarkFor(
  userId: string,
  lessonId: string,
  resource: RevisionResource,
  note: string | null,
) {
  const { data: existing } = await supabaseAdmin
    .from("lesson_bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .eq("resource", resource)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("lesson_bookmarks").delete().eq("id", existing.id);
    return { bookmarked: false };
  }

  await supabaseAdmin
    .from("lesson_bookmarks")
    .insert({ user_id: userId, lesson_id: lessonId, resource, note: note || null });
  return { bookmarked: true };
}

export async function removeBookmarkFor(userId: string, id: string) {
  await supabaseAdmin.from("lesson_bookmarks").delete().eq("id", id).eq("user_id", userId);
  return { ok: true };
}

export async function listBookmarkedLessonsFor(userId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return [];
  const { data } = await supabaseAdmin
    .from("lesson_bookmarks")
    .select("lesson_id, resource")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return (data ?? []).map((r) => `${r.lesson_id}:${r.resource}`);
}

export async function saveQuestionFor(
  userId: string,
  questionId: string,
  source: QuestionSource,
  selectedIndex: number | null,
) {
  const { data: existing } = await supabaseAdmin
    .from("question_saves")
    .select("id, source")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existing) {
    const { error: updErr } = await supabaseAdmin
      .from("question_saves")
      .update({
        source,
        selected_index: selectedIndex,
        resolved_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (updErr) console.error("Error updating question_saves:", updErr);
    return { saved: true };
  }

  const { error: insErr } = await supabaseAdmin.from("question_saves").insert({
    user_id: userId,
    question_id: questionId,
    source,
    selected_index: selectedIndex,
  });
  if (insErr) {
    console.error("Error inserting question_saves:", insErr);
  }
  return { saved: true };
}

export async function removeQuestionSaveFor(userId: string, id: string) {
  await supabaseAdmin.from("question_saves").delete().eq("id", id).eq("user_id", userId);
  return { ok: true };
}

/** Called after a test submit: add wrong answers to the mistake box, resolve fixed ones. */
export async function syncMistakesFor(
  userId: string,
  details: Array<{ id: string; correct: boolean; selected: number | null }>,
) {
  for (const d of details) {
    if (!d.correct) {
      await saveQuestionFor(userId, d.id, "mistake", d.selected);
    } else {
      await supabaseAdmin
        .from("question_saves")
        .update({ resolved_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("question_id", d.id)
        .eq("source", "mistake")
        .is("resolved_at", null);
    }
  }
}

export async function listRevisionFor(userId: string) {
  const [bookmarksRes, savesRes] = await Promise.all([
    supabaseAdmin
      .from("lesson_bookmarks")
      .select("id, lesson_id, resource, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("question_saves")
      .select("id, question_id, source, selected_index, resolved_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const bookmarkRows = bookmarksRes.data ?? [];
  const saveRows = savesRes.data ?? [];

  const lessonIds = [...new Set(bookmarkRows.map((b) => b.lesson_id))];
  const questionIds = [...new Set(saveRows.map((s) => s.question_id))];

  const [lessonsRes, questionsRes] = await Promise.all([
    lessonIds.length
      ? supabaseAdmin.from("lessons").select("id, title, chapter_id, kind").in("id", lessonIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; chapter_id: string; kind: string }> }),
    questionIds.length
      ? supabaseAdmin
          .from("questions")
          .select("id, prompt, options, correct_index, explanation, topic, test_id")
          .in("id", questionIds)
      : Promise.resolve({
          data: [] as Array<{
            id: string;
            prompt: string;
            options: unknown;
            correct_index: number;
            explanation: string | null;
            topic: string | null;
            test_id: string;
          }>,
        }),
  ]);

  const lessons = lessonsRes.data ?? [];
  const questions = questionsRes.data ?? [];

  const testIds = [...new Set(questions.map((q) => q.test_id).filter(Boolean))];
  const { data: tests } = testIds.length
    ? await supabaseAdmin.from("tests").select("id, title, chapter_id").in("id", testIds)
    : { data: [] as Array<{ id: string; title: string; chapter_id: string }> };

  const chapterIds = [
    ...new Set([...lessons.map((l) => l.chapter_id), ...(tests ?? []).map((t) => t.chapter_id).filter(Boolean)]),
  ];
  const { data: chapters } = chapterIds.length
    ? await supabaseAdmin.from("chapters").select("id, slug, title").in("id", chapterIds)
    : { data: [] as Array<{ id: string; slug: string; title: string }> };

  const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]));
  const testById = new Map((tests ?? []).map((t) => [t.id, t]));
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  const questionById = new Map(questions.map((q) => [q.id, q]));

  const bookmarks = bookmarkRows
    .map((b) => {
      const lesson = lessonById.get(b.lesson_id);
      if (!lesson) return null;
      const chapter = chapterById.get(lesson.chapter_id) ?? null;
      return {
        id: b.id,
        lessonId: b.lesson_id,
        lessonTitle: lesson.title,
        lessonKind: lesson.kind,
        resource: b.resource,
        note: b.note,
        chapterSlug: chapter?.slug ?? null,
        chapterTitle: chapter?.title ?? null,
        createdAt: b.created_at,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const questionItems = saveRows
    .map((s) => {
      const q = questionById.get(s.question_id);
      if (!q) return null;
      const test = q.test_id ? testById.get(q.test_id) ?? null : null;
      const chapter = test?.chapter_id ? chapterById.get(test.chapter_id) ?? null : null;
      return {
        id: s.id,
        source: (s.source || "mistake") as QuestionSource,
        questionId: q.id,
        prompt: q.prompt,
        options: (q.options ?? []) as string[],
        correctIndex: q.correct_index,
        explanation: q.explanation,
        topic: q.topic,
        selectedIndex: s.selected_index,
        resolvedAt: s.resolved_at,
        testId: q.test_id,
        testTitle: test?.title ?? null,
        chapterSlug: chapter?.slug ?? null,
        chapterTitle: chapter?.title ?? null,
        createdAt: s.created_at,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return {
    bookmarks,
    bank: questionItems.filter((q) => q.source === "manual"),
    mistakes: questionItems.filter((q) => q.source === "mistake"),
  };
}

export async function revisionCountsFor(userId: string) {
  const [b, s] = await Promise.all([
    supabaseAdmin
      .from("lesson_bookmarks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin.from("question_saves").select("source").eq("user_id", userId),
  ]);
  const rows = s.data ?? [];
  return {
    bookmarks: b.count ?? 0,
    bank: rows.filter((r) => r.source === "manual").length,
    mistakes: rows.filter((r) => r.source === "mistake").length,
  };
}
