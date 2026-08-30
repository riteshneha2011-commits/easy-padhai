import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-Bn-FzmdQ.js
var getAdminCatalog_createServerFn_handler = createServerRpc({
	id: "b402815d5528f6f828490afc79d9a4b29f07297f763bf28c746365b90031cb3c",
	name: "getAdminCatalog",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminCatalog.__executeServer(opts));
var getAdminCatalog = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAdminCatalog_createServerFn_handler, async ({ context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.fetchAdminCatalog();
});
var saveSubject_createServerFn_handler = createServerRpc({
	id: "d44c037899e59f9460cb666592dba96f01e054a20ada635e09f9c586ba2353d8",
	name: "saveSubject",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveSubject.__executeServer(opts));
var saveSubject = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(saveSubject_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.upsertSubject(data);
});
var saveChapter_createServerFn_handler = createServerRpc({
	id: "7a0bb9e21d54c22733c2d269969d62e4481e8c34a2ee4490c1f9ed6abe53c2ac",
	name: "saveChapter",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveChapter.__executeServer(opts));
var saveChapter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(saveChapter_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.upsertChapter(data);
});
var saveLesson_createServerFn_handler = createServerRpc({
	id: "c84cf7a8eea4de26ea4a7e199dcdbf049df30d87a20e4e84f76afbbb3e57cc23",
	name: "saveLesson",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveLesson.__executeServer(opts));
var saveLesson = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(saveLesson_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.upsertLesson(data);
});
var deleteRow_createServerFn_handler = createServerRpc({
	id: "452ea26825bbe7107938786e73a57829fb14d03e3f22879e8684e0d2172360c8",
	name: "deleteRow",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteRow.__executeServer(opts));
var deleteRow = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data || typeof data.table !== "string" || ![
		"lessons",
		"chapters",
		"tests",
		"questions",
		"subjects"
	].includes(data.table)) throw new Error("Invalid table");
	if (typeof data.id !== "string" || !/^[0-9a-f-]{36}$/i.test(data.id)) throw new Error("Invalid id");
	return {
		table: data.table,
		id: data.id
	};
}).handler(deleteRow_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.removeRow(data.table, data.id);
});
var saveTest_createServerFn_handler = createServerRpc({
	id: "dfc964c21dfc35633d1ff323dff75077423847cf7031ea9600aa8ef1845e5d90",
	name: "saveTest",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveTest.__executeServer(opts));
var saveTest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(saveTest_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.upsertTest(data);
});
var addQuestions_createServerFn_handler = createServerRpc({
	id: "eb09b70552d4764bc67b277fc3a891cdba1917bd480e13c1a25e860919ff3d5f",
	name: "addQuestions",
	filename: "src/lib/admin.functions.ts"
}, (opts) => addQuestions.__executeServer(opts));
var addQuestions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(addQuestions_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.insertQuestions(data.testId, data.questions);
});
var getTestQuestions_createServerFn_handler = createServerRpc({
	id: "eaeae7d9337a8e49d33fd1f3d6584a26a61ce08a269cca895c4e3fad70180962",
	name: "getTestQuestions",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getTestQuestions.__executeServer(opts));
var getTestQuestions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(getTestQuestions_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.listTestQuestions(data.testId);
});
var generateQuestions_createServerFn_handler = createServerRpc({
	id: "1a5ae22282c4f01f117d96d94d006ff9ed4fba3245c297e9a5bea07ea844aa78",
	name: "generateQuestions",
	filename: "src/lib/admin.functions.ts"
}, (opts) => generateQuestions.__executeServer(opts));
var generateQuestions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(generateQuestions_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	return admin.generateQuestionsWithAi({
		chapterId: data.chapterId,
		count: Math.min(Math.max(data.count, 1), 20),
		difficulty: data.difficulty,
		sourceText: data.sourceText
	});
});
var getPeople_createServerFn_handler = createServerRpc({
	id: "5332d2bc49a0df8c5e749b75b49dded8d1cedf9372f3b3cc9827f1f02d46934f",
	name: "getPeople",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getPeople.__executeServer(opts));
var getPeople = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getPeople_createServerFn_handler, async ({ context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	const { data: isAdmin } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (!isAdmin) throw new Error("Forbidden: admin access required");
	return admin.listPeople();
});
var updateUserRole_createServerFn_handler = createServerRpc({
	id: "03425c8b3be566d1d5640abcb1e3f1d7a33eb149a050904d9aae5bda333b76cd",
	name: "updateUserRole",
	filename: "src/lib/admin.functions.ts"
}, (opts) => updateUserRole.__executeServer(opts));
var updateUserRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(updateUserRole_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	const { data: isAdmin } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (!isAdmin) throw new Error("Forbidden: admin access required");
	return admin.setUserRole(data.userId, data.role);
});
var autofillChapterMeta_createServerFn_handler = createServerRpc({
	id: "ca43b06837f542659f8c58064cd5461dd8838fd33eba6ddbe70ef73486ea3e3d",
	name: "autofillChapterMeta",
	filename: "src/lib/admin.functions.ts"
}, (opts) => autofillChapterMeta.__executeServer(opts));
var autofillChapterMeta = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(autofillChapterMeta_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	if (!data.title?.trim()) throw new Error("Enter a title first");
	return admin.generateChapterMeta(data);
});
var autofillLessonMeta_createServerFn_handler = createServerRpc({
	id: "9f3dce691e28a60f27bebcee1b56d6db4198054fb119863dfa61751822db0545",
	name: "autofillLessonMeta",
	filename: "src/lib/admin.functions.ts"
}, (opts) => autofillLessonMeta.__executeServer(opts));
var autofillLessonMeta = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(autofillLessonMeta_createServerFn_handler, async ({ data, context }) => {
	const admin = await import("./admin.server-pHrEiKeT.mjs");
	await admin.assertStaff(context.supabase, context.userId);
	if (!data.title?.trim()) throw new Error("Enter a title first");
	return admin.generateLessonMeta(data);
});
//#endregion
export { addQuestions_createServerFn_handler, autofillChapterMeta_createServerFn_handler, autofillLessonMeta_createServerFn_handler, deleteRow_createServerFn_handler, generateQuestions_createServerFn_handler, getAdminCatalog_createServerFn_handler, getPeople_createServerFn_handler, getTestQuestions_createServerFn_handler, saveChapter_createServerFn_handler, saveLesson_createServerFn_handler, saveSubject_createServerFn_handler, saveTest_createServerFn_handler, updateUserRole_createServerFn_handler };
