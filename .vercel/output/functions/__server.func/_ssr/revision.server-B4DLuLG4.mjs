import { n as supabaseAdmin, r as __exportAll } from "./client.server-BeJ_4qvM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/revision.server-B4DLuLG4.js
var revision_server_exports = /* @__PURE__ */ __exportAll({
	listBookmarkedLessonsFor: () => listBookmarkedLessonsFor,
	listRevisionFor: () => listRevisionFor,
	removeBookmarkFor: () => removeBookmarkFor,
	removeQuestionSaveFor: () => removeQuestionSaveFor,
	revisionCountsFor: () => revisionCountsFor,
	saveQuestionFor: () => saveQuestionFor,
	syncMistakesFor: () => syncMistakesFor,
	toggleBookmarkFor: () => toggleBookmarkFor
});
async function toggleBookmarkFor(userId, lessonId, resource, note) {
	const { data: existing } = await supabaseAdmin.from("lesson_bookmarks").select("id").eq("user_id", userId).eq("lesson_id", lessonId).eq("resource", resource).maybeSingle();
	if (existing) {
		await supabaseAdmin.from("lesson_bookmarks").delete().eq("id", existing.id);
		return { bookmarked: false };
	}
	await supabaseAdmin.from("lesson_bookmarks").insert({
		user_id: userId,
		lesson_id: lessonId,
		resource,
		note: note || null
	});
	return { bookmarked: true };
}
async function removeBookmarkFor(userId, id) {
	await supabaseAdmin.from("lesson_bookmarks").delete().eq("id", id).eq("user_id", userId);
	return { ok: true };
}
async function listBookmarkedLessonsFor(userId, lessonIds) {
	if (lessonIds.length === 0) return [];
	const { data } = await supabaseAdmin.from("lesson_bookmarks").select("lesson_id, resource").eq("user_id", userId).in("lesson_id", lessonIds);
	return (data ?? []).map((r) => `${r.lesson_id}:${r.resource}`);
}
async function saveQuestionFor(userId, questionId, source, selectedIndex) {
	const { data: existing } = await supabaseAdmin.from("question_saves").select("id").eq("user_id", userId).eq("question_id", questionId).eq("source", source).maybeSingle();
	if (existing) {
		await supabaseAdmin.from("question_saves").update({
			selected_index: selectedIndex,
			resolved_at: null
		}).eq("id", existing.id);
		return { saved: true };
	}
	await supabaseAdmin.from("question_saves").insert({
		user_id: userId,
		question_id: questionId,
		source,
		selected_index: selectedIndex
	});
	return { saved: true };
}
async function removeQuestionSaveFor(userId, id) {
	await supabaseAdmin.from("question_saves").delete().eq("id", id).eq("user_id", userId);
	return { ok: true };
}
/** Called after a test submit: add wrong answers to the mistake box, resolve fixed ones. */
async function syncMistakesFor(userId, details) {
	for (const d of details) if (!d.correct) await saveQuestionFor(userId, d.id, "mistake", d.selected);
	else await supabaseAdmin.from("question_saves").update({ resolved_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", userId).eq("question_id", d.id).is("resolved_at", null);
}
async function listRevisionFor(userId) {
	const [bookmarksRes, savesRes] = await Promise.all([supabaseAdmin.from("lesson_bookmarks").select("id, lesson_id, resource, note, created_at").eq("user_id", userId).order("created_at", { ascending: false }), supabaseAdmin.from("question_saves").select("id, question_id, source, selected_index, resolved_at, created_at").eq("user_id", userId).order("created_at", { ascending: false })]);
	const bookmarkRows = bookmarksRes.data ?? [];
	const saveRows = savesRes.data ?? [];
	const lessonIds = [...new Set(bookmarkRows.map((b) => b.lesson_id))];
	const questionIds = [...new Set(saveRows.map((s) => s.question_id))];
	const [lessonsRes, questionsRes] = await Promise.all([lessonIds.length ? supabaseAdmin.from("lessons").select("id, title, chapter_id, kind").in("id", lessonIds) : Promise.resolve({ data: [] }), questionIds.length ? supabaseAdmin.from("questions").select("id, prompt, options, correct_index, explanation, topic, test_id").in("id", questionIds) : Promise.resolve({ data: [] })]);
	const lessons = lessonsRes.data ?? [];
	const questions = questionsRes.data ?? [];
	const testIds = [...new Set(questions.map((q) => q.test_id))];
	const { data: tests } = testIds.length ? await supabaseAdmin.from("tests").select("id, title, chapter_id").in("id", testIds) : { data: [] };
	const chapterIds = [.../* @__PURE__ */ new Set([...lessons.map((l) => l.chapter_id), ...(tests ?? []).map((t) => t.chapter_id)])];
	const { data: chapters } = chapterIds.length ? await supabaseAdmin.from("chapters").select("id, slug, title").in("id", chapterIds) : { data: [] };
	const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]));
	const testById = new Map((tests ?? []).map((t) => [t.id, t]));
	const lessonById = new Map(lessons.map((l) => [l.id, l]));
	const questionById = new Map(questions.map((q) => [q.id, q]));
	const bookmarks = bookmarkRows.map((b) => {
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
			createdAt: b.created_at
		};
	}).filter((x) => x !== null);
	const questionItems = saveRows.map((s) => {
		const q = questionById.get(s.question_id);
		if (!q) return null;
		const test = testById.get(q.test_id) ?? null;
		const chapter = test ? chapterById.get(test.chapter_id) ?? null : null;
		return {
			id: s.id,
			source: s.source,
			questionId: q.id,
			prompt: q.prompt,
			options: q.options ?? [],
			correctIndex: q.correct_index,
			explanation: q.explanation,
			topic: q.topic,
			selectedIndex: s.selected_index,
			resolvedAt: s.resolved_at,
			testId: q.test_id,
			testTitle: test?.title ?? null,
			chapterSlug: chapter?.slug ?? null,
			chapterTitle: chapter?.title ?? null,
			createdAt: s.created_at
		};
	}).filter((x) => x !== null);
	return {
		bookmarks,
		bank: questionItems.filter((q) => q.source === "manual"),
		mistakes: questionItems.filter((q) => q.source === "mistake")
	};
}
async function revisionCountsFor(userId) {
	const [b, s] = await Promise.all([supabaseAdmin.from("lesson_bookmarks").select("id", {
		count: "exact",
		head: true
	}).eq("user_id", userId), supabaseAdmin.from("question_saves").select("source").eq("user_id", userId)]);
	const rows = s.data ?? [];
	return {
		bookmarks: b.count ?? 0,
		bank: rows.filter((r) => r.source === "manual").length,
		mistakes: rows.filter((r) => r.source === "mistake").length
	};
}
//#endregion
export { syncMistakesFor as n, revision_server_exports as t };
