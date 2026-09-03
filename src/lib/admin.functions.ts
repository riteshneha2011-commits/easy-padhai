import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DraftQuestion } from "./questions-parse";
import type { ChapterInput, LessonInput, SubjectInput } from "./admin.server";

export const getAdminCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.fetchAdminCatalog();
  });

export const saveSubject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SubjectInput) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.upsertSubject(data);
  });

export const saveChapter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ChapterInput) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.upsertChapter(data);
  });

export const saveLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: LessonInput) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.upsertLesson(data);
  });

export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { table: "lessons" | "chapters" | "tests" | "questions" | "subjects"; id: string }) => {
    const allowed = ["lessons", "chapters", "tests", "questions", "subjects"];
    if (!data || typeof data.table !== "string" || !allowed.includes(data.table)) {
      throw new Error("Invalid table");
    }
    if (typeof data.id !== "string" || !/^[0-9a-f-]{36}$/i.test(data.id)) {
      throw new Error("Invalid id");
    }
    return { table: data.table, id: data.id };
  })
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.removeRow(data.table, data.id);
  });

export const saveTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id?: string;
      chapter_id: string;
      lesson_id?: string | null;
      title: string;
      description?: string | null;
      duration_minutes?: number | null;
      published?: boolean;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.upsertTest(data);
  });

export const addQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { testId: string; questions: DraftQuestion[] }) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.insertQuestions(data.testId, data.questions);
  });

export const saveQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id?: string;
      test_id: string;
      prompt: string;
      options: string[];
      correct_index: number;
      explanation?: string | null;
      topic?: string | null;
      difficulty?: string;
      order_index?: number;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.upsertQuestion(data);
  });

export const getTestQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { testId: string }) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.listTestQuestions(data.testId);
  });


export const generateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      chapterId: string;
      lessonId?: string | null;
      count: number;
      difficulty: string;
      language?: "hindi" | "english" | "hinglish";
      sourceText?: string;
      sources?: {
        useSummary?: boolean;
        useLessons?: boolean;
        customNotes?: string;
      };
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.generateQuestionsWithAi({
      chapterId: data.chapterId,
      lessonId: data.lessonId,
      count: Math.min(Math.max(data.count, 1), 30),
      difficulty: data.difficulty,
      language: data.language,
      sourceText: data.sourceText,
      sources: data.sources,
    });
  });



export const getPeople = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await import("./admin.server");
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin access required");
    return admin.listPeople();
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: "admin" | "teacher" | "student" }) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin access required");
    return admin.setUserRole(data.userId, data.role);
  });

export const autofillChapterMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { title: string; subjectId?: string; hint?: string }) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    if (!data.title?.trim()) throw new Error("Enter a title first");
    return admin.generateChapterMeta(data);
  });

export const autofillLessonMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { title: string; chapterId?: string; kind?: string; hint?: string }) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    if (!data.title?.trim()) throw new Error("Enter a title first");
    return admin.generateLessonMeta(data);
  });

export const getSignedUploadUrlAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { fileName: string; folder: string }) => data)
  .handler(async ({ data, context }) => {
    const admin = await import("./admin.server");
    await admin.assertStaff(context.supabase, context.userId);
    return admin.createAdminSignedUploadUrl(data);
  });


