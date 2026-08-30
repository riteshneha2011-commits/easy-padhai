import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { DraftQuestion } from "./questions-parse";
import { DEFAULT_CLASS_LEVEL } from "@/lib/classes";

export async function assertStaff(
  supabase: { rpc: (fn: "is_staff", args: { _user_id: string }) => PromiseLike<{ data: unknown }> },
  userId: string,
) {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (data !== true) throw new Error("Forbidden: teacher or admin access required");
}

export async function fetchAdminCatalog() {
  const [{ data: subjects }, { data: chapters }, { data: lessons }, { data: tests }, { data: questions }] =
    await Promise.all([
      supabaseAdmin.from("subjects").select("*").order("order_index"),
      supabaseAdmin.from("chapters").select("*").order("order_index"),
      supabaseAdmin.from("lessons").select("*").order("order_index"),
      supabaseAdmin.from("tests").select("*"),
      supabaseAdmin.from("questions").select("id, test_id"),
    ]);

  return {
    subjects: subjects ?? [],
    chapters: chapters ?? [],
    lessons: lessons ?? [],
    tests: (tests ?? []).map((t) => {
      const isLesson = t.description?.startsWith("lesson:") ?? false;
      const lessonId = isLesson ? t.description?.slice(7).split("|")[0]?.trim() ?? null : null;
      return {
        ...t,
        lesson_id: lessonId,
        is_lesson_test: Boolean(lessonId),
        questionCount: (questions ?? []).filter((q) => q.test_id === t.id).length,
      };
    }),
  };
}

export type ChapterInput = {
  id?: string;
  subject_id: string;
  title: string;
  slug: string;
  description?: string | null;
  order_index?: number;
  published?: boolean;
};

export async function upsertChapter(input: ChapterInput) {
  const { data, error } = await supabaseAdmin
    .from("chapters")
    .upsert({ ...input, id: input.id ?? undefined })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export type LessonInput = {
  id?: string;
  chapter_id: string;
  title: string;
  kind: string;
  audio_url?: string | null;
  video_url?: string | null;
  pdf_url?: string | null;
  summary?: string | null;
  duration_minutes?: number;
  order_index?: number;
  published?: boolean;
};

export async function upsertLesson(input: LessonInput) {
  const { data, error } = await supabaseAdmin
    .from("lessons")
    .upsert({ ...input, id: input.id ?? undefined })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export type SubjectInput = {
  id?: string;
  name: string;
  slug: string;
  class_level?: number;
  description?: string | null;
  accent?: string;
  order_index?: number;
  published?: boolean;
};

export async function upsertSubject(input: SubjectInput) {
  const { data, error } = await supabaseAdmin
    .from("subjects")
    .upsert({ ...input, id: input.id ?? undefined })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export const DELETABLE_TABLES = ["lessons", "chapters", "tests", "questions", "subjects"] as const;
export type DeletableTable = (typeof DELETABLE_TABLES)[number];

const DELETABLE_TABLE_SET: ReadonlySet<string> = new Set(DELETABLE_TABLES);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function removeRow(table: string, id: string) {
  if (!DELETABLE_TABLE_SET.has(table)) throw new Error("Invalid table");
  if (typeof id !== "string" || !UUID_RE.test(id)) throw new Error("Invalid id");

  const { error } = await supabaseAdmin
    .from(table as DeletableTable)
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function upsertTest(input: {
  id?: string;
  chapter_id: string;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  duration_minutes?: number | null;
  published?: boolean;
}) {
  let description = input.description ?? null;
  if (input.lesson_id) {
    description = `lesson:${input.lesson_id}${input.description ? ` | ${input.description}` : ""}`;
  }
  const { data, error } = await supabaseAdmin
    .from("tests")
    .upsert({
      id: input.id ?? undefined,
      chapter_id: input.chapter_id,
      title: input.title,
      description,
      duration_minutes: input.duration_minutes,
      published: input.published ?? true,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}


export async function insertQuestions(testId: string, questions: DraftQuestion[]) {
  const { count } = await supabaseAdmin
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("test_id", testId);

  const start = count ?? 0;
  const rows = questions.map((q, i) => ({
    test_id: testId,
    prompt: q.prompt,
    options: q.options,
    correct_index: q.correctIndex,
    explanation: q.explanation ?? null,
    topic: q.topic ?? null,
    difficulty: q.difficulty ?? "medium",
    order_index: start + i + 1,
  }));

  const { error } = await supabaseAdmin.from("questions").insert(rows);
  if (error) throw new Error(error.message);
  return { inserted: rows.length };
}

export async function listTestQuestions(testId: string) {
  const { data } = await supabaseAdmin
    .from("questions")
    .select("*")
    .eq("test_id", testId)
    .order("order_index");
  return data ?? [];
}

async function requestAiChatCompletion(prompt: string, jsonMode = true): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  let endpoint = "";
  let apiKey = "";
  let model = "";

  if (geminiKey) {
    endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    apiKey = geminiKey;
    model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  } else if (groqKey) {
    endpoint = "https://api.groq.com/openai/v1/chat/completions";
    apiKey = groqKey;
    model = "llama-3.3-70b-versatile";
  } else if (openRouterKey) {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    apiKey = openRouterKey;
    model = "google/gemini-flash-1.5";
  } else if (openAiKey) {
    endpoint = "https://api.openai.com/v1/chat/completions";
    apiKey = openAiKey;
    model = "gpt-4o-mini";
  } else if (lovableKey) {
    endpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
    apiKey = lovableKey;
    model = "google/gemini-2.5-flash";
  } else {

    throw new Error(
      "AI is not configured. Please add GEMINI_API_KEY (from Google AI Studio - Free) to your environment variables.",
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 429) throw new Error("AI is busy right now. Please try again shortly.");
    if (response.status === 402)
      throw new Error("AI credits are exhausted. Please check your API quota.");
    throw new Error(`AI request failed [${response.status}]: ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return payload.choices?.[0]?.message?.content ?? "{}";
}

export async function generateQuestionsWithAi(params: {
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
}): Promise<DraftQuestion[]> {
  const { data: chapter } = await supabaseAdmin
    .from("chapters")
    .select("title, description, subjects(name, class_level)")
    .eq("id", params.chapterId)
    .maybeSingle();

  const chapterClassLevel =
    (chapter?.subjects as { class_level?: number } | null)?.class_level ?? DEFAULT_CLASS_LEVEL;
  const subjectName =
    (chapter?.subjects as { name?: string } | null)?.name ?? "Science";

  let targetContext = `Chapter: "${chapter?.title ?? "Core Chapter"}"`;
  let sourceMaterial = "";

  if (params.lessonId) {
    const { data: lesson } = await supabaseAdmin
      .from("lessons")
      .select("title, summary, kind")
      .eq("id", params.lessonId)
      .maybeSingle();

    if (lesson) {
      targetContext = `Specific Lesson: "${lesson.title}" from Chapter "${chapter?.title ?? "Core Chapter"}"`;
      sourceMaterial += `Target Lesson: ${lesson.title} (${lesson.kind})\n`;
      if (lesson.summary) {
        sourceMaterial += `Lesson Summary & Concepts:\n${lesson.summary}\n\n`;
      }
    }
  } else {
    const useSummary = params.sources?.useSummary ?? true;
    const useLessons = params.sources?.useLessons ?? true;

    if (useSummary && chapter?.description) {
      sourceMaterial += `Chapter Concept:\n${chapter.description}\n\n`;
    }

    if (useLessons) {
      const { data: lessons } = await supabaseAdmin
        .from("lessons")
        .select("title, summary")
        .eq("chapter_id", params.chapterId)
        .order("order_index");

      if (lessons && lessons.length > 0) {
        sourceMaterial += `Key Topics & Lesson Summaries:\n`;
        lessons.forEach((l) => {
          sourceMaterial += `• ${l.title}: ${l.summary || "Core concept"}\n`;
        });
        sourceMaterial += "\n";
      }
    }
  }

  const customNotes = params.sources?.customNotes?.trim() || params.sourceText?.trim() || "";
  if (customNotes) {
    sourceMaterial += `Additional Study Notes:\n${customNotes}\n\n`;
  }

  const language = params.language ?? "hindi";
  let languageInstruction = "";
  if (language === "hindi") {
    languageInstruction = `LANGUAGE REQUIREMENT: Pure NCERT Hindi (हिंदी - देवनागरी लिपि). All questions (prompt), options (A, B, C, D), and explanations MUST be written in high-quality, clear Hindi according to NCERT textbook standards. Do not use English script for the question text.`;
  } else if (language === "hinglish") {
    languageInstruction = `LANGUAGE REQUIREMENT: Natural Hinglish (Hindi words in Latin/English script, as spoken by Indian school students). Example: "Plants me photosynthesis process kahan hota hai?" Explanations should also be in helpful conversational Hinglish.`;
  } else {
    languageInstruction = `LANGUAGE REQUIREMENT: Standard CBSE/NCERT English. Clear, grammatically correct and appropriate for Class ${chapterClassLevel} students.`;
  }

  const prompt = `You are an expert NCERT Indian school teacher and curriculum designer for Class ${chapterClassLevel} ${subjectName}.
Generate exactly ${params.count} objective Multiple-Choice Questions (MCQs) for ${targetContext}.
${params.lessonId ? "Make sure questions test specifically the core concepts, definitions, and formulas of this single lecture/lesson." : ""}

${languageInstruction}

Difficulty Target: ${params.difficulty} (mix of recall, conceptual understanding, and practical application).

Source Material:
${sourceMaterial || `Standard NCERT Class ${chapterClassLevel} ${subjectName} syllabus.`}

Rules:

1. Every question must have EXACTLY 4 plausible, unambiguous options.
2. Provide correctIndex (0 for first option, 1 for second, 2 for third, 3 for fourth).
3. Provide a clear, educational 1-2 sentence explanation for why the correct answer is right.
4. Provide a short relevant topic tag (e.g., "प्रकाश संश्लेषण" / "Photosynthesis").
5. Never use phrases like "According to the passage" or "In the text above".

Return STRICT JSON ONLY matching this format without any surrounding text or markdown formatting:
{
  "questions": [
    {
      "prompt": "Question text here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 0,
      "explanation": "Explanation here",
      "topic": "Topic Name",
      "difficulty": "${params.difficulty}"
    }
  ]
}`;

  const content = await requestAiChatCompletion(prompt, true);
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    const parsed = JSON.parse(cleaned) as { questions?: DraftQuestion[] };
    return (parsed.questions ?? []).map((q) => ({
      prompt: String(q.prompt ?? "").trim(),
      options: (q.options ?? []).map((o) => String(o).trim()),
      correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex ?? 0))),
      explanation: q.explanation ? String(q.explanation).trim() : null,
      topic: q.topic ? String(q.topic).trim() : null,
      difficulty: q.difficulty ?? params.difficulty,
    }));
  } catch (err) {
    console.error("Failed to parse AI quiz JSON:", cleaned);
    throw new Error("Could not format AI questions. Please try generating again.");
  }
}


export async function listPeople() {
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, class_level, total_xp, created_at"),
    supabaseAdmin.from("user_roles").select("user_id, role"),
  ]);
  return (profiles ?? []).map((p) => ({
    ...p,
    roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
  }));
}

export async function setUserRole(userId: string, role: "admin" | "teacher" | "student") {
  await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
  const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
}

async function askAi(prompt: string) {
  const content = await requestAiChatCompletion(prompt, true);
  return JSON.parse(content) as Record<string, unknown>;
}

export async function generateChapterMeta(input: { title: string; subjectId?: string; hint?: string }) {
  const { data: subject } = input.subjectId
    ? await supabaseAdmin.from("subjects").select("name, class_level").eq("id", input.subjectId).maybeSingle()
    : { data: null };

  const out = await askAi(
    `You write SEO metadata for an Indian NCERT Class ${subject?.class_level ?? DEFAULT_CLASS_LEVEL} ${subject?.name ?? "Science"} learning site.
Chapter title: "${input.title}"
${input.hint ? `Extra context: ${input.hint}` : ""}
Return strict JSON: {"slug":"kebab-case-url-slug, 3-6 words, keyword-rich, no class numbers","description":"1-2 sentence description, max 155 characters, mentions what students learn"}`,
  );

  const slug = slugify(String(out.slug ?? "")) || slugify(input.title);
  const description = String(out.description ?? "").trim().slice(0, 300);
  return { slug, description };
}

export async function generateLessonMeta(input: {
  title: string;
  chapterId?: string;
  kind?: string;
  hint?: string;
}) {
  const { data: chapter } = input.chapterId
    ? await supabaseAdmin
        .from("chapters")
        .select("title, description, subjects(class_level)")
        .eq("id", input.chapterId)
        .maybeSingle()
    : { data: null };

  const out = await askAi(
    `You write short study summaries for Indian NCERT Class ${
      (chapter?.subjects as { class_level?: number } | null)?.class_level ?? DEFAULT_CLASS_LEVEL
    } students.
Chapter: "${chapter?.title ?? "Unknown"}"${chapter?.description ? ` — ${chapter.description}` : ""}
Lesson title: "${input.title}" (type: ${input.kind ?? "video"})
${input.hint ? `Extra context: ${input.hint}` : ""}
Return strict JSON: {"summary":"crisp revision summary of this lesson in 60-110 words, simple English, 3-5 key points separated by newlines starting with '• '"}`,
  );

  return { summary: String(out.summary ?? "").trim() };
}

export async function createAdminSignedUploadUrl(input: {
  fileName: string;
  folder: string;
}) {
  const ext = input.fileName.includes(".") ? input.fileName.split(".").pop() : "bin";
  const safePath = `${input.folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await supabaseAdmin.storage.from("lesson-media").createSignedUploadUrl(safePath);
  if (error || !data) throw new Error(error?.message || "Failed to generate upload URL");
  return {
    path: safePath,
    signedUrl: data.signedUrl,
    token: data.token,
    storageRef: `storage://${safePath}`,
  };
}


