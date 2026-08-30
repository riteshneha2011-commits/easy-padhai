import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile.functions-ifTqWGiN.js
var getMyProfile_createServerFn_handler = createServerRpc({
	id: "5dbf46616266e7bfe81c82694a91090a42de6200b3efc1b9d156faf41ac3a479",
	name: "getMyProfile",
	filename: "src/lib/profile.functions.ts"
}, (opts) => getMyProfile.__executeServer(opts));
var getMyProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyProfile_createServerFn_handler, async ({ context }) => {
	const { getProfileFor } = await import("./profile.server-CBSyRa1R.mjs");
	return getProfileFor(context.userId);
});
var saveMyProfile_createServerFn_handler = createServerRpc({
	id: "413f65bd03c6dcec054aeb5a4b210e4e4645413c5bbf87af7f75e92bd832981c",
	name: "saveMyProfile",
	filename: "src/lib/profile.functions.ts"
}, (opts) => saveMyProfile.__executeServer(opts));
var saveMyProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(saveMyProfile_createServerFn_handler, async ({ data, context }) => {
	const { saveProfileDetailsFor } = await import("./profile.server-CBSyRa1R.mjs");
	return saveProfileDetailsFor(context.userId, data);
});
var getUserDetail_createServerFn_handler = createServerRpc({
	id: "cac405468a1cac27eb7c8716ee59a71b2bf03eff29eac185f8112c27414bcfe4",
	name: "getUserDetail",
	filename: "src/lib/profile.functions.ts"
}, (opts) => getUserDetail.__executeServer(opts));
var getUserDetail = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(getUserDetail_createServerFn_handler, async ({ data, context }) => {
	const { data: isAdmin } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (isAdmin !== true) throw new Error("Forbidden: admin access required");
	const { getUserDetailFor } = await import("./profile.server-CBSyRa1R.mjs");
	return getUserDetailFor(data.userId);
});
//#endregion
export { getMyProfile_createServerFn_handler, getUserDetail_createServerFn_handler, saveMyProfile_createServerFn_handler };
