import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/credits.functions-DCRYs3ZK.js
var getWallet_createServerFn_handler = createServerRpc({
	id: "6f9a3e7aecf1977f7dca578559d58cfd8a9c85aba7fa43381f3dbf1da4de29d7",
	name: "getWallet",
	filename: "src/lib/credits.functions.ts"
}, (opts) => getWallet.__executeServer(opts));
var getWallet = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getWallet_createServerFn_handler, async ({ context }) => {
	const { getWalletFor } = await import("./credits.server-D5sh5igW.mjs").then((n) => n.r);
	return getWalletFor(context.userId);
});
var startSession_createServerFn_handler = createServerRpc({
	id: "d2edd8c15cdf82531b853c8ab38548bebe27da586e96c23fbde5f6de9a963eed",
	name: "startSession",
	filename: "src/lib/credits.functions.ts"
}, (opts) => startSession.__executeServer(opts));
var startSession = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(startSession_createServerFn_handler, async ({ data, context }) => {
	const { claimDailyLoginFor, attachReferralFor } = await import("./credits.server-D5sh5igW.mjs").then((n) => n.r);
	const { ensureOwnerAdmin } = await import("./owner.server-BIRXESzA.mjs");
	await ensureOwnerAdmin(context.userId).catch(() => null);
	const referral = data.refCode ? await attachReferralFor(context.userId, data.refCode) : null;
	return {
		...await claimDailyLoginFor(context.userId),
		referral
	};
});
var getLessonAccess_createServerFn_handler = createServerRpc({
	id: "f7316031d2d087ada2ac7868d767df1c241301f03cfc34508e128e2562ee6a7d",
	name: "getLessonAccess",
	filename: "src/lib/credits.functions.ts"
}, (opts) => getLessonAccess.__executeServer(opts));
var getLessonAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(getLessonAccess_createServerFn_handler, async ({ data, context }) => {
	const { getLessonAccessFor } = await import("./credits.server-D5sh5igW.mjs").then((n) => n.r);
	return getLessonAccessFor(context.userId, data.lessonId);
});
var getPublicLessonAccess_createServerFn_handler = createServerRpc({
	id: "6ca9ea088a5da814f1e68ad28ca93dc398cf8ae234933785976ed2e8525a4091",
	name: "getPublicLessonAccess",
	filename: "src/lib/credits.functions.ts"
}, (opts) => getPublicLessonAccess.__executeServer(opts));
var getPublicLessonAccess = createServerFn({ method: "POST" }).inputValidator((data) => data).handler(getPublicLessonAccess_createServerFn_handler, async ({ data }) => {
	const { getLessonAccessFor } = await import("./credits.server-D5sh5igW.mjs").then((n) => n.r);
	return getLessonAccessFor(null, data.lessonId);
});
var unlockLesson_createServerFn_handler = createServerRpc({
	id: "effa7ee9ed9771e43de58a5334554f051e3e6d0f10075c2d587ec0c4ae28bd22",
	name: "unlockLesson",
	filename: "src/lib/credits.functions.ts"
}, (opts) => unlockLesson.__executeServer(opts));
var unlockLesson = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(unlockLesson_createServerFn_handler, async ({ data, context }) => {
	const { unlockLessonFor } = await import("./credits.server-D5sh5igW.mjs").then((n) => n.r);
	return unlockLessonFor(context.userId, data.lessonId);
});
var recordStudySeconds_createServerFn_handler = createServerRpc({
	id: "89304f84c62875c868eeb00884996b122cfb36214231b614fe6b944c9df7f870",
	name: "recordStudySeconds",
	filename: "src/lib/credits.functions.ts"
}, (opts) => recordStudySeconds.__executeServer(opts));
var recordStudySeconds = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(recordStudySeconds_createServerFn_handler, async ({ data, context }) => {
	const { recordStudySecondsFor } = await import("./credits.server-D5sh5igW.mjs").then((n) => n.r);
	return recordStudySecondsFor(context.userId, data.lessonId, data.seconds);
});
var getReferralLeaderboard_createServerFn_handler = createServerRpc({
	id: "5179922633adbcba04b733285d714dcc6f89100a48ac7995bf7377520f06079e",
	name: "getReferralLeaderboard",
	filename: "src/lib/credits.functions.ts"
}, (opts) => getReferralLeaderboard.__executeServer(opts));
var getReferralLeaderboard = createServerFn({ method: "GET" }).handler(getReferralLeaderboard_createServerFn_handler, async () => {
	const { getReferralBoard } = await import("./credits.server-D5sh5igW.mjs").then((n) => n.r);
	return getReferralBoard();
});
//#endregion
export { getLessonAccess_createServerFn_handler, getPublicLessonAccess_createServerFn_handler, getReferralLeaderboard_createServerFn_handler, getWallet_createServerFn_handler, recordStudySeconds_createServerFn_handler, startSession_createServerFn_handler, unlockLesson_createServerFn_handler };
