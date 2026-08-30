import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/content.functions-Q0Fyhoej.js
/** Anon-key client for public, read-only content during SSR. RLS applies as `anon`. */
function createPublicClient() {
	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_PUBLISHABLE_KEY;
	return createClient(url, key, {
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		},
		global: { fetch: (input, init) => {
			const headers = new Headers(init?.headers);
			if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
			headers.set("apikey", key);
			return fetch(input, {
				...init,
				headers
			});
		} }
	});
}
async function fetchCatalog() {
	const supabase = createPublicClient();
	const [{ data: subjects }, { data: chapters }, { data: lessons }, { data: tests }] = await Promise.all([
		supabase.from("subjects").select("*").eq("published", true).order("order_index"),
		supabase.from("chapters").select("*").eq("published", true).order("order_index"),
		supabase.from("lessons").select("id, chapter_id").eq("published", true),
		supabase.from("tests").select("id, chapter_id").eq("published", true)
	]);
	return (subjects ?? []).map((subject) => ({
		id: subject.id,
		slug: subject.slug,
		name: subject.name,
		class_level: subject.class_level,
		description: subject.description,
		chapters: (chapters ?? []).filter((chapter) => chapter.subject_id === subject.id).map((chapter) => ({
			id: chapter.id,
			slug: chapter.slug,
			title: chapter.title,
			description: chapter.description,
			order_index: chapter.order_index,
			lessonCount: (lessons ?? []).filter((l) => l.chapter_id === chapter.id).length,
			testId: (tests ?? []).find((t) => t.chapter_id === chapter.id)?.id ?? null
		}))
	}));
}
async function fetchChapterBySlug(slug) {
	const supabase = createPublicClient();
	const { data: chapter } = await supabase.from("chapters").select("*, subjects(name, slug, class_level)").eq("slug", slug).eq("published", true).maybeSingle();
	if (!chapter) return null;
	const [{ data: lessons }, { data: test }] = await Promise.all([supabase.from("lessons").select("*").eq("chapter_id", chapter.id).eq("published", true).order("order_index"), supabase.from("tests").select("id, title, description, duration_minutes").eq("chapter_id", chapter.id).eq("published", true).maybeSingle()]);
	const list = lessons ?? [];
	const firstId = list[0]?.id ?? null;
	return {
		chapter,
		lessons: list.map(({ audio_url, video_url, pdf_url, ...rest }) => ({
			...rest,
			hasAudio: Boolean(audio_url),
			hasVideo: Boolean(video_url),
			hasPdf: Boolean(pdf_url),
			isFree: rest.id === firstId || !audio_url && !video_url && !pdf_url
		})),
		test: test ?? null
	};
}
async function fetchLeaderboard() {
	const { supabaseAdmin } = await import("./client.server-BeJ_4qvM.mjs").then((n) => n.t);
	const { data } = await supabaseAdmin.from("profiles").select("id, full_name, total_xp, class_level").order("total_xp", { ascending: false }).limit(25);
	return (data ?? []).map((p) => ({
		id: p.id,
		full_name: p.full_name,
		total_xp: p.total_xp,
		class_level: p.class_level
	}));
}
var getCatalog_createServerFn_handler = createServerRpc({
	id: "46aac1f11d35abcb50ed01044fe086e3f41abf4ae09328c04cd9ce4b3e8917bb",
	name: "getCatalog",
	filename: "src/lib/content.functions.ts"
}, (opts) => getCatalog.__executeServer(opts));
var getCatalog = createServerFn({ method: "GET" }).handler(getCatalog_createServerFn_handler, async () => fetchCatalog());
var getChapter_createServerFn_handler = createServerRpc({
	id: "c4ed8a3962a2517773763a28fcd4229778116573910aa43e6d1bffbde1aed780",
	name: "getChapter",
	filename: "src/lib/content.functions.ts"
}, (opts) => getChapter.__executeServer(opts));
var getChapter = createServerFn({ method: "GET" }).inputValidator((data) => data).handler(getChapter_createServerFn_handler, async ({ data }) => fetchChapterBySlug(data.slug));
var getLeaderboard_createServerFn_handler = createServerRpc({
	id: "693c6fc4cb66ad25679ca077ca0fcc5f067866b2606c0a66d2f0666a50710c3e",
	name: "getLeaderboard",
	filename: "src/lib/content.functions.ts"
}, (opts) => getLeaderboard.__executeServer(opts));
var getLeaderboard = createServerFn({ method: "GET" }).handler(getLeaderboard_createServerFn_handler, async () => fetchLeaderboard());
//#endregion
export { getCatalog_createServerFn_handler, getChapter_createServerFn_handler, getLeaderboard_createServerFn_handler };
