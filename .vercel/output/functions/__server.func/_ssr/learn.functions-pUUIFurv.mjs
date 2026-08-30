import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { n as CREDIT_REWARDS } from "./credits-CWoRelbL.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { n as supabaseAdmin } from "./client.server-BeJ_4qvM.mjs";
import { i as qualifyReferralFor, n as awardCredits, t as applyStreakLadderFor } from "./credits.server-D5sh5igW.mjs";
import { n as grantBadge, r as touchStreak, t as awardXp } from "./gamify.server-RA3Qu8-O.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn.functions-pUUIFurv.js
async function completeLessonFor(userId, lessonId) {
	const { data: existing } = await supabaseAdmin.from("lesson_progress").select("id").eq("user_id", userId).eq("lesson_id", lessonId).maybeSingle();
	if (existing) return {
		alreadyDone: true,
		xp: 0,
		credits: 0
	};
	const { data: lesson } = await supabaseAdmin.from("lessons").select("id, chapter_id, duration_minutes").eq("id", lessonId).maybeSingle();
	if (!lesson) throw new Error("Lesson not found");
	await supabaseAdmin.from("lesson_progress").insert({
		user_id: userId,
		lesson_id: lessonId
	});
	await awardXp(userId, 10, "Lesson completed");
	await touchStreak(userId, lesson.duration_minutes ?? 10);
	let credits = CREDIT_REWARDS.lessonComplete;
	await awardCredits(userId, CREDIT_REWARDS.lessonComplete, "Lesson completed", `lesson-${lessonId}`);
	credits += await applyStreakLadderFor(userId);
	const referral = await qualifyReferralFor(userId);
	credits += referral.awarded;
	const { count: totalDone } = await supabaseAdmin.from("lesson_progress").select("id", {
		count: "exact",
		head: true
	}).eq("user_id", userId);
	if ((totalDone ?? 0) <= 1) await grantBadge(userId, "first_lesson");
	const [{ data: chapterLessons }, { data: doneRows }] = await Promise.all([supabaseAdmin.from("lessons").select("id").eq("chapter_id", lesson.chapter_id).eq("published", true), supabaseAdmin.from("lesson_progress").select("lesson_id").eq("user_id", userId)]);
	const doneSet = new Set((doneRows ?? []).map((r) => r.lesson_id));
	if ((chapterLessons ?? []).length > 0 && (chapterLessons ?? []).every((l) => doneSet.has(l.id))) {
		await grantBadge(userId, "chapter_master");
		await awardXp(userId, 25, "Chapter completed");
	}
	return {
		alreadyDone: false,
		xp: 10,
		credits
	};
}
async function getDashboardFor(userId) {
	const [profileRes, streakRes, progressRes, attemptsRes, badgesRes, lessonsRes, chaptersRes] = await Promise.all([
		supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
		supabaseAdmin.from("streaks").select("*").eq("user_id", userId).maybeSingle(),
		supabaseAdmin.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", userId),
		supabaseAdmin.from("test_attempts").select("id, test_id, score, total, details, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
		supabaseAdmin.from("user_badges").select("badge_code, earned_at").eq("user_id", userId),
		supabaseAdmin.from("lessons").select("id, title, chapter_id, kind").eq("published", true),
		supabaseAdmin.from("chapters").select("id, slug, title, order_index").eq("published", true).order("order_index")
	]);
	const done = new Set((progressRes.data ?? []).map((p) => p.lesson_id));
	const lessons = lessonsRes.data ?? [];
	const chapterProgress = (chaptersRes.data ?? []).map((chapter) => {
		const own = lessons.filter((l) => l.chapter_id === chapter.id);
		const completed = own.filter((l) => done.has(l.id)).length;
		return {
			id: chapter.id,
			slug: chapter.slug,
			title: chapter.title,
			total: own.length,
			completed,
			percent: own.length ? Math.round(completed / own.length * 100) : 0
		};
	});
	const nextChapter = chapterProgress.find((c) => c.percent < 100 && c.total > 0) ?? chapterProgress[0] ?? null;
	const weakTopics = {};
	for (const attempt of attemptsRes.data ?? []) {
		const details = attempt.details ?? [];
		for (const item of details) if (item && item.correct === false && item.topic) weakTopics[item.topic] = (weakTopics[item.topic] ?? 0) + 1;
	}
	const { data: allBadges } = await supabaseAdmin.from("badges").select("*");
	return {
		profile: profileRes.data,
		streak: streakRes.data,
		lessonsCompleted: done.size,
		attempts: attemptsRes.data ?? [],
		badges: (badgesRes.data ?? []).map((b) => ({
			...b,
			meta: (allBadges ?? []).find((x) => x.code === b.badge_code) ?? null
		})),
		allBadges: allBadges ?? [],
		chapterProgress,
		nextChapter,
		weakTopics: Object.entries(weakTopics).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([topic, misses]) => ({
			topic,
			misses
		}))
	};
}
async function getChapterProgressFor(userId, chapterId) {
	const { data: lessons } = await supabaseAdmin.from("lessons").select("id").eq("chapter_id", chapterId).eq("published", true);
	const ids = (lessons ?? []).map((l) => l.id);
	if (ids.length === 0) return [];
	const { data } = await supabaseAdmin.from("lesson_progress").select("lesson_id").eq("user_id", userId).in("lesson_id", ids);
	return (data ?? []).map((d) => d.lesson_id);
}
var getDashboard_createServerFn_handler = createServerRpc({
	id: "9cb9ae5ce92ce50a73bc48e0456eb4b9fef03e04843d484d2e0976264e403e4e",
	name: "getDashboard",
	filename: "src/lib/learn.functions.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getDashboard_createServerFn_handler, async ({ context }) => getDashboardFor(context.userId));
var completeLesson_createServerFn_handler = createServerRpc({
	id: "b80c5efbae4df90eeece43e59af969207aa81c3e08078356ad83e3fdf8a8f692",
	name: "completeLesson",
	filename: "src/lib/learn.functions.ts"
}, (opts) => completeLesson.__executeServer(opts));
var completeLesson = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(completeLesson_createServerFn_handler, async ({ data, context }) => completeLessonFor(context.userId, data.lessonId));
var getChapterProgress_createServerFn_handler = createServerRpc({
	id: "9fd1a302390aef9879bc23178265ece6d4b578795aa07b37a2a29461fabd08da",
	name: "getChapterProgress",
	filename: "src/lib/learn.functions.ts"
}, (opts) => getChapterProgress.__executeServer(opts));
var getChapterProgress = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(getChapterProgress_createServerFn_handler, async ({ data, context }) => getChapterProgressFor(context.userId, data.chapterId));
//#endregion
export { completeLesson_createServerFn_handler, getChapterProgress_createServerFn_handler, getDashboard_createServerFn_handler };
