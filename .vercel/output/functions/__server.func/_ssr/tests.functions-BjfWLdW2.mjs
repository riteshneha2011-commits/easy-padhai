import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { n as CREDIT_REWARDS } from "./credits-CWoRelbL.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { n as supabaseAdmin } from "./client.server-BeJ_4qvM.mjs";
import { n as awardCredits } from "./credits.server-D5sh5igW.mjs";
import { n as grantBadge, r as touchStreak, t as awardXp } from "./gamify.server-RA3Qu8-O.mjs";
import { n as syncMistakesFor } from "./revision.server-B4DLuLG4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tests.functions-BjfWLdW2.js
async function getTestForAttempt(testId) {
	const { data: test } = await supabaseAdmin.from("tests").select("id, title, description, duration_minutes, chapter_id, published").eq("id", testId).maybeSingle();
	if (!test || !test.published) return null;
	const { data: chapter } = await supabaseAdmin.from("chapters").select("slug, title").eq("id", test.chapter_id).maybeSingle();
	const { data: questions } = await supabaseAdmin.from("questions").select("id, prompt, options, order_index").eq("test_id", testId).order("order_index");
	return {
		test: {
			...test,
			chapterSlug: chapter?.slug ?? null,
			chapterTitle: chapter?.title ?? null
		},
		questions: (questions ?? []).map((q) => ({
			id: q.id,
			prompt: q.prompt,
			options: q.options ?? []
		}))
	};
}
async function submitAttemptFor(userId, testId, answers) {
	const { data: questions } = await supabaseAdmin.from("questions").select("id, prompt, options, correct_index, explanation, topic, order_index").eq("test_id", testId).order("order_index");
	const list = questions ?? [];
	if (list.length === 0) throw new Error("This test has no questions yet");
	const details = list.map((q) => {
		const selected = answers[q.id];
		return {
			id: q.id,
			prompt: q.prompt,
			options: q.options ?? [],
			selected: typeof selected === "number" ? selected : null,
			correctIndex: q.correct_index,
			correct: selected === q.correct_index,
			explanation: q.explanation,
			topic: q.topic
		};
	});
	const score = details.filter((d) => d.correct).length;
	const total = list.length;
	const { data: attempt } = await supabaseAdmin.from("test_attempts").insert({
		user_id: userId,
		test_id: testId,
		score,
		total,
		details
	}).select("id").single();
	const xp = score * 5 + (score === total ? 20 : 0);
	await awardXp(userId, xp, "Test completed");
	await touchStreak(userId, 10);
	if (score === total) await grantBadge(userId, "perfect_test");
	await syncMistakesFor(userId, details.map((d) => ({
		id: d.id,
		correct: d.correct,
		selected: d.selected
	})));
	const passed = total > 0 && score / total >= .6;
	const credits = CREDIT_REWARDS.testSubmitted + (passed ? CREDIT_REWARDS.testPassedBonus : 0);
	await awardCredits(userId, credits, passed ? "Test passed" : "Test attempted", attempt?.id ?? null);
	return {
		attemptId: attempt?.id ?? null,
		score,
		total,
		xp,
		credits,
		details
	};
}
var getTest_createServerFn_handler = createServerRpc({
	id: "0b7e84fee78f4368f83c6a93dcf1c740b4d0d839875329bbfde6d6942d5f5cf4",
	name: "getTest",
	filename: "src/lib/tests.functions.ts"
}, (opts) => getTest.__executeServer(opts));
var getTest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(getTest_createServerFn_handler, async ({ data }) => getTestForAttempt(data.testId));
var submitAttempt_createServerFn_handler = createServerRpc({
	id: "3c3223badd98f2fb52c1457efe81e6d5d88dd1dc8b573486dc0f34494988fc28",
	name: "submitAttempt",
	filename: "src/lib/tests.functions.ts"
}, (opts) => submitAttempt.__executeServer(opts));
var submitAttempt = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(submitAttempt_createServerFn_handler, async ({ data, context }) => submitAttemptFor(context.userId, data.testId, data.answers));
//#endregion
export { getTest_createServerFn_handler, submitAttempt_createServerFn_handler };
