import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/revision.functions-DTpV1wAb.js
var listRevision_createServerFn_handler = createServerRpc({
	id: "b905c4d162bfa5c076aa523cbcf64738b4f7519cbb6e0ec677f446847c46a741",
	name: "listRevision",
	filename: "src/lib/revision.functions.ts"
}, (opts) => listRevision.__executeServer(opts));
var listRevision = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listRevision_createServerFn_handler, async ({ context }) => {
	const { listRevisionFor } = await import("./revision.server-B4DLuLG4.mjs").then((n) => n.t);
	return listRevisionFor(context.userId);
});
var getRevisionCounts_createServerFn_handler = createServerRpc({
	id: "25e4f4fa7e5146e722638af11c5fb64b927ead1b7785c643aee5ef1a4162cb8e",
	name: "getRevisionCounts",
	filename: "src/lib/revision.functions.ts"
}, (opts) => getRevisionCounts.__executeServer(opts));
var getRevisionCounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getRevisionCounts_createServerFn_handler, async ({ context }) => {
	const { revisionCountsFor } = await import("./revision.server-B4DLuLG4.mjs").then((n) => n.t);
	return revisionCountsFor(context.userId);
});
var toggleLessonBookmark_createServerFn_handler = createServerRpc({
	id: "102463e909f6920c1318979b749594d710a97fadcf12f72ccf88fc82f767e171",
	name: "toggleLessonBookmark",
	filename: "src/lib/revision.functions.ts"
}, (opts) => toggleLessonBookmark.__executeServer(opts));
var toggleLessonBookmark = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(toggleLessonBookmark_createServerFn_handler, async ({ data, context }) => {
	const { toggleBookmarkFor } = await import("./revision.server-B4DLuLG4.mjs").then((n) => n.t);
	return toggleBookmarkFor(context.userId, data.lessonId, data.resource, data.note ?? null);
});
var listLessonBookmarks_createServerFn_handler = createServerRpc({
	id: "983d91ad56b574c12d1dbc026780900c96d85bdc45a7852488974952f061c7e9",
	name: "listLessonBookmarks",
	filename: "src/lib/revision.functions.ts"
}, (opts) => listLessonBookmarks.__executeServer(opts));
var listLessonBookmarks = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(listLessonBookmarks_createServerFn_handler, async ({ data, context }) => {
	const { listBookmarkedLessonsFor } = await import("./revision.server-B4DLuLG4.mjs").then((n) => n.t);
	return listBookmarkedLessonsFor(context.userId, data.lessonIds);
});
var removeBookmark_createServerFn_handler = createServerRpc({
	id: "78a1d9f5955259f954ec587c2b2e2313f04f3525ee664ac78b6bb77b741f0aa4",
	name: "removeBookmark",
	filename: "src/lib/revision.functions.ts"
}, (opts) => removeBookmark.__executeServer(opts));
var removeBookmark = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(removeBookmark_createServerFn_handler, async ({ data, context }) => {
	const { removeBookmarkFor } = await import("./revision.server-B4DLuLG4.mjs").then((n) => n.t);
	return removeBookmarkFor(context.userId, data.id);
});
var saveQuestion_createServerFn_handler = createServerRpc({
	id: "0d974a8d17fa051cfa43c4d6ddf20d0b583298a9651bfcd8f744fad6aa111c9e",
	name: "saveQuestion",
	filename: "src/lib/revision.functions.ts"
}, (opts) => saveQuestion.__executeServer(opts));
var saveQuestion = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(saveQuestion_createServerFn_handler, async ({ data, context }) => {
	const { saveQuestionFor } = await import("./revision.server-B4DLuLG4.mjs").then((n) => n.t);
	return saveQuestionFor(context.userId, data.questionId, data.source ?? "manual", data.selectedIndex ?? null);
});
var removeQuestionSave_createServerFn_handler = createServerRpc({
	id: "3f56aa05b8d0383184c485aaa9f87fcf18da1e0d1a98227c1d7e3d8fc6dc2e2e",
	name: "removeQuestionSave",
	filename: "src/lib/revision.functions.ts"
}, (opts) => removeQuestionSave.__executeServer(opts));
var removeQuestionSave = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(removeQuestionSave_createServerFn_handler, async ({ data, context }) => {
	const { removeQuestionSaveFor } = await import("./revision.server-B4DLuLG4.mjs").then((n) => n.t);
	return removeQuestionSaveFor(context.userId, data.id);
});
//#endregion
export { getRevisionCounts_createServerFn_handler, listLessonBookmarks_createServerFn_handler, listRevision_createServerFn_handler, removeBookmark_createServerFn_handler, removeQuestionSave_createServerFn_handler, saveQuestion_createServerFn_handler, toggleLessonBookmark_createServerFn_handler };
