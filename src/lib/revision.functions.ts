import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { QuestionSource, RevisionResource } from "./revision.server";

export const listRevision = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listRevisionFor } = await import("./revision.server");
    return listRevisionFor(context.userId);
  });

export const getRevisionCounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { revisionCountsFor } = await import("./revision.server");
    return revisionCountsFor(context.userId);
  });

export const toggleLessonBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lessonId: string; resource: RevisionResource; note?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const { toggleBookmarkFor } = await import("./revision.server");
    return toggleBookmarkFor(context.userId, data.lessonId, data.resource, data.note ?? null);
  });

export const listLessonBookmarks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lessonIds: string[] }) => data)
  .handler(async ({ data, context }) => {
    const { listBookmarkedLessonsFor } = await import("./revision.server");
    return listBookmarkedLessonsFor(context.userId, data.lessonIds);
  });

export const removeBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { removeBookmarkFor } = await import("./revision.server");
    return removeBookmarkFor(context.userId, data.id);
  });

export const saveQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { questionId: string; source?: QuestionSource; selectedIndex?: number | null }) => data,
  )
  .handler(async ({ data, context }) => {
    const { saveQuestionFor } = await import("./revision.server");
    return saveQuestionFor(
      context.userId,
      data.questionId,
      data.source ?? "manual",
      data.selectedIndex ?? null,
    );
  });

export const removeQuestionSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { removeQuestionSaveFor } = await import("./revision.server");
    return removeQuestionSaveFor(context.userId, data.id);
  });
