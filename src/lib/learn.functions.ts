import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { completeLessonFor, getChapterProgressFor, getDashboardFor } from "./learn.server";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getDashboardFor(context.userId));

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lessonId: string }) => data)
  .handler(async ({ data, context }) => completeLessonFor(context.userId, data.lessonId));

export const getChapterProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { chapterId: string }) => data)
  .handler(async ({ data, context }) => getChapterProgressFor(context.userId, data.chapterId));
