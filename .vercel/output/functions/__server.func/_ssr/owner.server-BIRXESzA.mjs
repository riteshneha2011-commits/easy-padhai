import { n as supabaseAdmin } from "./client.server-BeJ_4qvM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/owner.server-BIRXESzA.js
/**
* Grants the admin role to the owner account, but only when the email on the
* verified auth record matches. Safe to call on every session start.
*/
async function ensureOwnerAdmin(userId) {
	const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
	if (error || !data?.user) return { granted: false };
	const user = data.user;
	const email = (user.email ?? "").toLowerCase();
	if (!Boolean(user.email_confirmed_at) || email !== "ritesh.bhopal@gmail.com") return { granted: false };
	const { data: existing } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
	if (existing) return { granted: true };
	await supabaseAdmin.from("user_roles").insert({
		user_id: userId,
		role: "admin"
	});
	return { granted: true };
}
//#endregion
export { ensureOwnerAdmin };
