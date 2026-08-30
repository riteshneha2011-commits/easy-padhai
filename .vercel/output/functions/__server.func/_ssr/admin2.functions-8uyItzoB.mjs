import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { n as createSsrRpc } from "./utils-wh7lFpBf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin2.functions-8uyItzoB.js
var getAdminCatalog = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b402815d5528f6f828490afc79d9a4b29f07297f763bf28c746365b90031cb3c"));
var saveSubject = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("d44c037899e59f9460cb666592dba96f01e054a20ada635e09f9c586ba2353d8"));
var saveChapter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("7a0bb9e21d54c22733c2d269969d62e4481e8c34a2ee4490c1f9ed6abe53c2ac"));
var saveLesson = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("c84cf7a8eea4de26ea4a7e199dcdbf049df30d87a20e4e84f76afbbb3e57cc23"));
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
}).handler(createSsrRpc("452ea26825bbe7107938786e73a57829fb14d03e3f22879e8684e0d2172360c8"));
var saveTest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("dfc964c21dfc35633d1ff323dff75077423847cf7031ea9600aa8ef1845e5d90"));
var addQuestions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("eb09b70552d4764bc67b277fc3a891cdba1917bd480e13c1a25e860919ff3d5f"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("eaeae7d9337a8e49d33fd1f3d6584a26a61ce08a269cca895c4e3fad70180962"));
var generateQuestions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("1a5ae22282c4f01f117d96d94d006ff9ed4fba3245c297e9a5bea07ea844aa78"));
var getPeople = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("5332d2bc49a0df8c5e749b75b49dded8d1cedf9372f3b3cc9827f1f02d46934f"));
var updateUserRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("03425c8b3be566d1d5640abcb1e3f1d7a33eb149a050904d9aae5bda333b76cd"));
var autofillChapterMeta = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("ca43b06837f542659f8c58064cd5461dd8838fd33eba6ddbe70ef73486ea3e3d"));
var autofillLessonMeta = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("9f3dce691e28a60f27bebcee1b56d6db4198054fb119863dfa61751822db0545"));
//#endregion
export { generateQuestions as a, saveChapter as c, saveTest as d, updateUserRole as f, deleteRow as i, saveLesson as l, autofillChapterMeta as n, getAdminCatalog as o, autofillLessonMeta as r, getPeople as s, addQuestions as t, saveSubject as u };
