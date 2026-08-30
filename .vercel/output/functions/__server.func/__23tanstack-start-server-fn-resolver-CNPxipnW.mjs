import { createRequire } from "node:module";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CNPxipnW.js
var manifest = {
	"03425c8b3be566d1d5640abcb1e3f1d7a33eb149a050904d9aae5bda333b76cd": {
		functionName: "updateUserRole_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"0b7e84fee78f4368f83c6a93dcf1c740b4d0d839875329bbfde6d6942d5f5cf4": {
		functionName: "getTest_createServerFn_handler",
		importer: () => import("./_ssr/tests.functions-BjfWLdW2.mjs")
	},
	"0d974a8d17fa051cfa43c4d6ddf20d0b583298a9651bfcd8f744fad6aa111c9e": {
		functionName: "saveQuestion_createServerFn_handler",
		importer: () => import("./_ssr/revision.functions-DTpV1wAb.mjs")
	},
	"102463e909f6920c1318979b749594d710a97fadcf12f72ccf88fc82f767e171": {
		functionName: "toggleLessonBookmark_createServerFn_handler",
		importer: () => import("./_ssr/revision.functions-DTpV1wAb.mjs")
	},
	"1a5ae22282c4f01f117d96d94d006ff9ed4fba3245c297e9a5bea07ea844aa78": {
		functionName: "generateQuestions_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"25e4f4fa7e5146e722638af11c5fb64b927ead1b7785c643aee5ef1a4162cb8e": {
		functionName: "getRevisionCounts_createServerFn_handler",
		importer: () => import("./_ssr/revision.functions-DTpV1wAb.mjs")
	},
	"3c3223badd98f2fb52c1457efe81e6d5d88dd1dc8b573486dc0f34494988fc28": {
		functionName: "submitAttempt_createServerFn_handler",
		importer: () => import("./_ssr/tests.functions-BjfWLdW2.mjs")
	},
	"3f56aa05b8d0383184c485aaa9f87fcf18da1e0d1a98227c1d7e3d8fc6dc2e2e": {
		functionName: "removeQuestionSave_createServerFn_handler",
		importer: () => import("./_ssr/revision.functions-DTpV1wAb.mjs")
	},
	"413f65bd03c6dcec054aeb5a4b210e4e4645413c5bbf87af7f75e92bd832981c": {
		functionName: "saveMyProfile_createServerFn_handler",
		importer: () => import("./_ssr/profile.functions-ifTqWGiN.mjs")
	},
	"452ea26825bbe7107938786e73a57829fb14d03e3f22879e8684e0d2172360c8": {
		functionName: "deleteRow_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"46aac1f11d35abcb50ed01044fe086e3f41abf4ae09328c04cd9ce4b3e8917bb": {
		functionName: "getCatalog_createServerFn_handler",
		importer: () => import("./_ssr/content.functions-Q0Fyhoej.mjs")
	},
	"5179922633adbcba04b733285d714dcc6f89100a48ac7995bf7377520f06079e": {
		functionName: "getReferralLeaderboard_createServerFn_handler",
		importer: () => import("./_ssr/credits.functions-DCRYs3ZK.mjs")
	},
	"5332d2bc49a0df8c5e749b75b49dded8d1cedf9372f3b3cc9827f1f02d46934f": {
		functionName: "getPeople_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"5dbf46616266e7bfe81c82694a91090a42de6200b3efc1b9d156faf41ac3a479": {
		functionName: "getMyProfile_createServerFn_handler",
		importer: () => import("./_ssr/profile.functions-ifTqWGiN.mjs")
	},
	"693c6fc4cb66ad25679ca077ca0fcc5f067866b2606c0a66d2f0666a50710c3e": {
		functionName: "getLeaderboard_createServerFn_handler",
		importer: () => import("./_ssr/content.functions-Q0Fyhoej.mjs")
	},
	"6ca9ea088a5da814f1e68ad28ca93dc398cf8ae234933785976ed2e8525a4091": {
		functionName: "getPublicLessonAccess_createServerFn_handler",
		importer: () => import("./_ssr/credits.functions-DCRYs3ZK.mjs")
	},
	"6f9a3e7aecf1977f7dca578559d58cfd8a9c85aba7fa43381f3dbf1da4de29d7": {
		functionName: "getWallet_createServerFn_handler",
		importer: () => import("./_ssr/credits.functions-DCRYs3ZK.mjs")
	},
	"78a1d9f5955259f954ec587c2b2e2313f04f3525ee664ac78b6bb77b741f0aa4": {
		functionName: "removeBookmark_createServerFn_handler",
		importer: () => import("./_ssr/revision.functions-DTpV1wAb.mjs")
	},
	"7a0bb9e21d54c22733c2d269969d62e4481e8c34a2ee4490c1f9ed6abe53c2ac": {
		functionName: "saveChapter_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"89304f84c62875c868eeb00884996b122cfb36214231b614fe6b944c9df7f870": {
		functionName: "recordStudySeconds_createServerFn_handler",
		importer: () => import("./_ssr/credits.functions-DCRYs3ZK.mjs")
	},
	"983d91ad56b574c12d1dbc026780900c96d85bdc45a7852488974952f061c7e9": {
		functionName: "listLessonBookmarks_createServerFn_handler",
		importer: () => import("./_ssr/revision.functions-DTpV1wAb.mjs")
	},
	"9cb9ae5ce92ce50a73bc48e0456eb4b9fef03e04843d484d2e0976264e403e4e": {
		functionName: "getDashboard_createServerFn_handler",
		importer: () => import("./_ssr/learn.functions-pUUIFurv.mjs")
	},
	"9f3dce691e28a60f27bebcee1b56d6db4198054fb119863dfa61751822db0545": {
		functionName: "autofillLessonMeta_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"9fd1a302390aef9879bc23178265ece6d4b578795aa07b37a2a29461fabd08da": {
		functionName: "getChapterProgress_createServerFn_handler",
		importer: () => import("./_ssr/learn.functions-pUUIFurv.mjs")
	},
	"b402815d5528f6f828490afc79d9a4b29f07297f763bf28c746365b90031cb3c": {
		functionName: "getAdminCatalog_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"b80c5efbae4df90eeece43e59af969207aa81c3e08078356ad83e3fdf8a8f692": {
		functionName: "completeLesson_createServerFn_handler",
		importer: () => import("./_ssr/learn.functions-pUUIFurv.mjs")
	},
	"b905c4d162bfa5c076aa523cbcf64738b4f7519cbb6e0ec677f446847c46a741": {
		functionName: "listRevision_createServerFn_handler",
		importer: () => import("./_ssr/revision.functions-DTpV1wAb.mjs")
	},
	"c4ed8a3962a2517773763a28fcd4229778116573910aa43e6d1bffbde1aed780": {
		functionName: "getChapter_createServerFn_handler",
		importer: () => import("./_ssr/content.functions-Q0Fyhoej.mjs")
	},
	"c84cf7a8eea4de26ea4a7e199dcdbf049df30d87a20e4e84f76afbbb3e57cc23": {
		functionName: "saveLesson_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"ca43b06837f542659f8c58064cd5461dd8838fd33eba6ddbe70ef73486ea3e3d": {
		functionName: "autofillChapterMeta_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"cac405468a1cac27eb7c8716ee59a71b2bf03eff29eac185f8112c27414bcfe4": {
		functionName: "getUserDetail_createServerFn_handler",
		importer: () => import("./_ssr/profile.functions-ifTqWGiN.mjs")
	},
	"d2edd8c15cdf82531b853c8ab38548bebe27da586e96c23fbde5f6de9a963eed": {
		functionName: "startSession_createServerFn_handler",
		importer: () => import("./_ssr/credits.functions-DCRYs3ZK.mjs")
	},
	"d44c037899e59f9460cb666592dba96f01e054a20ada635e09f9c586ba2353d8": {
		functionName: "saveSubject_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"dfc964c21dfc35633d1ff323dff75077423847cf7031ea9600aa8ef1845e5d90": {
		functionName: "saveTest_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"eaeae7d9337a8e49d33fd1f3d6584a26a61ce08a269cca895c4e3fad70180962": {
		functionName: "getTestQuestions_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"eb09b70552d4764bc67b277fc3a891cdba1917bd480e13c1a25e860919ff3d5f": {
		functionName: "addQuestions_createServerFn_handler",
		importer: () => import("./_ssr/admin.functions-Bn-FzmdQ.mjs")
	},
	"effa7ee9ed9771e43de58a5334554f051e3e6d0f10075c2d587ec0c4ae28bd22": {
		functionName: "unlockLesson_createServerFn_handler",
		importer: () => import("./_ssr/credits.functions-DCRYs3ZK.mjs")
	},
	"f7316031d2d087ada2ac7868d767df1c241301f03cfc34508e128e2562ee6a7d": {
		functionName: "getLessonAccess_createServerFn_handler",
		importer: () => import("./_ssr/credits.functions-DCRYs3ZK.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { __toESM as i, __commonJSMin as n, __require as r, getServerFnById as t };
