import { a as DEFAULT_CLASS_LEVEL } from "./classes-DRcecDr1.mjs";
import { n as supabaseAdmin } from "./client.server-BeJ_4qvM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.server-pHrEiKeT.js
async function assertStaff(supabase, userId) {
	const { data } = await supabase.rpc("is_staff", { _user_id: userId });
	if (data !== true) throw new Error("Forbidden: teacher or admin access required");
}
async function fetchAdminCatalog() {
	const [{ data: subjects }, { data: chapters }, { data: lessons }, { data: tests }, { data: questions }] = await Promise.all([
		supabaseAdmin.from("subjects").select("*").order("order_index"),
		supabaseAdmin.from("chapters").select("*").order("order_index"),
		supabaseAdmin.from("lessons").select("*").order("order_index"),
		supabaseAdmin.from("tests").select("*"),
		supabaseAdmin.from("questions").select("id, test_id")
	]);
	return {
		subjects: subjects ?? [],
		chapters: chapters ?? [],
		lessons: lessons ?? [],
		tests: (tests ?? []).map((t) => ({
			...t,
			questionCount: (questions ?? []).filter((q) => q.test_id === t.id).length
		}))
	};
}
async function upsertChapter(input) {
	const { data, error } = await supabaseAdmin.from("chapters").upsert({
		...input,
		id: input.id ?? void 0
	}).select("*").single();
	if (error) throw new Error(error.message);
	return data;
}
async function upsertLesson(input) {
	const { data, error } = await supabaseAdmin.from("lessons").upsert({
		...input,
		id: input.id ?? void 0
	}).select("*").single();
	if (error) throw new Error(error.message);
	return data;
}
async function upsertSubject(input) {
	const { data, error } = await supabaseAdmin.from("subjects").upsert({
		...input,
		id: input.id ?? void 0
	}).select("*").single();
	if (error) throw new Error(error.message);
	return data;
}
var DELETABLE_TABLE_SET = /* @__PURE__ */ new Set([
	"lessons",
	"chapters",
	"tests",
	"questions",
	"subjects"
]);
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function removeRow(table, id) {
	if (!DELETABLE_TABLE_SET.has(table)) throw new Error("Invalid table");
	if (typeof id !== "string" || !UUID_RE.test(id)) throw new Error("Invalid id");
	const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
	if (error) throw new Error(error.message);
	return { ok: true };
}
async function upsertTest(input) {
	const { data, error } = await supabaseAdmin.from("tests").upsert({
		...input,
		id: input.id ?? void 0
	}).select("*").single();
	if (error) throw new Error(error.message);
	return data;
}
async function insertQuestions(testId, questions) {
	const { count } = await supabaseAdmin.from("questions").select("id", {
		count: "exact",
		head: true
	}).eq("test_id", testId);
	const start = count ?? 0;
	const rows = questions.map((q, i) => ({
		test_id: testId,
		prompt: q.prompt,
		options: q.options,
		correct_index: q.correctIndex,
		explanation: q.explanation ?? null,
		topic: q.topic ?? null,
		difficulty: q.difficulty ?? "medium",
		order_index: start + i + 1
	}));
	const { error } = await supabaseAdmin.from("questions").insert(rows);
	if (error) throw new Error(error.message);
	return { inserted: rows.length };
}
async function listTestQuestions(testId) {
	const { data } = await supabaseAdmin.from("questions").select("*").eq("test_id", testId).order("order_index");
	return data ?? [];
}
async function requestAiChatCompletion(prompt, jsonMode = true) {
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
		model = "gemini-2.0-flash";
	} else if (groqKey) {
		endpoint = "https://api.groq.com/openai/v1/chat/completions";
		apiKey = groqKey;
		model = "llama-3.3-70b-versatile";
	} else if (openRouterKey) {
		endpoint = "https://openrouter.ai/api/v1/chat/completions";
		apiKey = openRouterKey;
		model = "google/gemini-2.0-flash-001";
	} else if (openAiKey) {
		endpoint = "https://api.openai.com/v1/chat/completions";
		apiKey = openAiKey;
		model = "gpt-4o-mini";
	} else if (lovableKey) {
		endpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
		apiKey = lovableKey;
		model = "google/gemini-2.0-flash";
	} else throw new Error("AI is not configured. Please add GEMINI_API_KEY (from Google AI Studio - Free) to your environment variables.");
	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			messages: [{
				role: "user",
				content: prompt
			}],
			...jsonMode ? { response_format: { type: "json_object" } } : {}
		})
	});
	if (!response.ok) {
		const body = await response.text();
		if (response.status === 429) throw new Error("AI is busy right now. Please try again shortly.");
		if (response.status === 402) throw new Error("AI credits are exhausted. Please check your API quota.");
		throw new Error(`AI request failed [${response.status}]: ${body}`);
	}
	return (await response.json()).choices?.[0]?.message?.content ?? "{}";
}
async function generateQuestionsWithAi(params) {
	let source = params.sourceText?.trim() ?? "";
	const { data: chapter } = await supabaseAdmin.from("chapters").select("title, description, subjects(class_level)").eq("id", params.chapterId).maybeSingle();
	const chapterClassLevel = (chapter?.subjects)?.class_level ?? DEFAULT_CLASS_LEVEL;
	if (!source) {
		const { data: lessons } = await supabaseAdmin.from("lessons").select("summary").eq("chapter_id", params.chapterId);
		source = (lessons ?? []).map((l) => l.summary).filter(Boolean).join("\n\n");
	}
	const content = await requestAiChatCompletion(`You are writing objective multiple-choice questions for Indian Class ${chapterClassLevel} students (NCERT syllabus).
Chapter: ${chapter?.title ?? "Unknown"}${chapter?.description ? ` — ${chapter.description}` : ""}
Difficulty: ${params.difficulty}
Number of questions: ${params.count}

Source material:
${source || `Use standard NCERT Class ${chapterClassLevel} content for this chapter.`}

Return strict JSON only, shaped as:
{"questions":[{"prompt":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"one short sentence","topic":"short topic name","difficulty":"${params.difficulty}"}]}
Exactly 4 options per question. Never reference "the passage".`, true);
	return (JSON.parse(content).questions ?? []).map((q) => ({
		prompt: String(q.prompt ?? "").trim(),
		options: (q.options ?? []).map((o) => String(o)),
		correctIndex: Number(q.correctIndex ?? 0),
		explanation: q.explanation ?? null,
		topic: q.topic ?? null,
		difficulty: q.difficulty ?? params.difficulty
	}));
}
async function listPeople() {
	const [{ data: profiles }, { data: roles }] = await Promise.all([supabaseAdmin.from("profiles").select("id, full_name, class_level, total_xp, created_at"), supabaseAdmin.from("user_roles").select("user_id, role")]);
	return (profiles ?? []).map((p) => ({
		...p,
		roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role)
	}));
}
async function setUserRole(userId, role) {
	await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
	const { error } = await supabaseAdmin.from("user_roles").insert({
		user_id: userId,
		role
	});
	if (error) throw new Error(error.message);
	return { ok: true };
}
function slugify(text) {
	return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/^-|-$/g, "");
}
async function askAi(prompt) {
	const content = await requestAiChatCompletion(prompt, true);
	return JSON.parse(content);
}
async function generateChapterMeta(input) {
	const { data: subject } = input.subjectId ? await supabaseAdmin.from("subjects").select("name, class_level").eq("id", input.subjectId).maybeSingle() : { data: null };
	const out = await askAi(`You write SEO metadata for an Indian NCERT Class ${subject?.class_level ?? DEFAULT_CLASS_LEVEL} ${subject?.name ?? "Science"} learning site.
Chapter title: "${input.title}"
${input.hint ? `Extra context: ${input.hint}` : ""}
Return strict JSON: {"slug":"kebab-case-url-slug, 3-6 words, keyword-rich, no class numbers","description":"1-2 sentence description, max 155 characters, mentions what students learn"}`);
	return {
		slug: slugify(String(out.slug ?? "")) || slugify(input.title),
		description: String(out.description ?? "").trim().slice(0, 300)
	};
}
async function generateLessonMeta(input) {
	const { data: chapter } = input.chapterId ? await supabaseAdmin.from("chapters").select("title, description, subjects(class_level)").eq("id", input.chapterId).maybeSingle() : { data: null };
	const out = await askAi(`You write short study summaries for Indian NCERT Class ${(chapter?.subjects)?.class_level ?? DEFAULT_CLASS_LEVEL} students.
Chapter: "${chapter?.title ?? "Unknown"}"${chapter?.description ? ` — ${chapter.description}` : ""}
Lesson title: "${input.title}" (type: ${input.kind ?? "video"})
${input.hint ? `Extra context: ${input.hint}` : ""}
Return strict JSON: {"summary":"crisp revision summary of this lesson in 60-110 words, simple English, 3-5 key points separated by newlines starting with '• '"}`);
	return { summary: String(out.summary ?? "").trim() };
}
//#endregion
export { assertStaff, fetchAdminCatalog, generateChapterMeta, generateLessonMeta, generateQuestionsWithAi, insertQuestions, listPeople, listTestQuestions, removeRow, setUserRole, upsertChapter, upsertLesson, upsertSubject, upsertTest };
