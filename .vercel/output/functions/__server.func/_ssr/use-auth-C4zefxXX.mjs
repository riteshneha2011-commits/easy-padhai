import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { r as REF_STORAGE_KEY } from "./credits-CWoRelbL.mjs";
import { t as supabase } from "./client-Bt-p7qWF.mjs";
import { n as createSsrRpc } from "./utils-wh7lFpBf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-auth-C4zefxXX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getWallet = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("6f9a3e7aecf1977f7dca578559d58cfd8a9c85aba7fa43381f3dbf1da4de29d7"));
/** Called once per session: pays the daily visit bonus and attaches a pending referral code. */
var startSession = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("d2edd8c15cdf82531b853c8ab38548bebe27da586e96c23fbde5f6de9a963eed"));
var getLessonAccess = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("f7316031d2d087ada2ac7868d767df1c241301f03cfc34508e128e2562ee6a7d"));
/** Public: only ever returns media for a free lesson. */
var getPublicLessonAccess = createServerFn({ method: "POST" }).inputValidator((data) => data).handler(createSsrRpc("6ca9ea088a5da814f1e68ad28ca93dc398cf8ae234933785976ed2e8525a4091"));
var unlockLesson = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("effa7ee9ed9771e43de58a5334554f051e3e6d0f10075c2d587ec0c4ae28bd22"));
var recordStudySeconds = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("89304f84c62875c868eeb00884996b122cfb36214231b614fe6b944c9df7f870"));
createServerFn({ method: "GET" }).handler(createSsrRpc("5179922633adbcba04b733285d714dcc6f89100a48ac7995bf7377520f06079e"));
var getMyProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("5dbf46616266e7bfe81c82694a91090a42de6200b3efc1b9d156faf41ac3a479"));
var saveMyProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("413f65bd03c6dcec054aeb5a4b210e4e4645413c5bbf87af7f75e92bd832981c"));
/** Admin-only deep view of a single learner. */
var getUserDetail = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("cac405468a1cac27eb7c8716ee59a71b2bf03eff29eac185f8112c27414bcfe4"));
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [roles, setRoles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const bootstrapped = (0, import_react.useRef)(null);
	const load = (0, import_react.useCallback)(async (userId) => {
		if (!userId) {
			setProfile(null);
			setRoles([]);
			return;
		}
		const [profileRow, { data: roleRows }] = await Promise.all([getMyProfile().catch(() => null), supabase.from("user_roles").select("role").eq("user_id", userId)]);
		setProfile(profileRow ?? null);
		setRoles((roleRows ?? []).map((r) => r.role));
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
			if (!active) return;
			setSession(nextSession);
			load(nextSession?.user?.id);
		});
		supabase.auth.getSession().then(({ data }) => {
			if (!active) return;
			setSession(data.session);
			load(data.session?.user?.id).finally(() => setLoading(false));
		});
		return () => {
			active = false;
			subscription.subscription.unsubscribe();
		};
	}, [load]);
	(0, import_react.useEffect)(() => {
		const userId = session?.user?.id;
		if (!userId || bootstrapped.current === userId) return;
		bootstrapped.current = userId;
		const refCode = typeof window === "undefined" ? null : window.localStorage.getItem(REF_STORAGE_KEY);
		startSession({ data: { refCode } }).then((result) => {
			if (refCode) window.localStorage.removeItem(REF_STORAGE_KEY);
			if (result?.referral?.attached) toast.success("Referral applied — bonus credits land when you finish your first lesson 🎁");
			if (result?.awarded) toast.success(`Daily visit bonus · +${result.awarded} credits`);
			load(userId);
		}).catch(() => {});
	}, [session?.user?.id, load]);
	const value = (0, import_react.useMemo)(() => ({
		loading,
		session,
		user: session?.user ?? null,
		profile,
		credits: profile?.credits ?? 0,
		roles,
		isStaff: roles.includes("admin") || roles.includes("teacher"),
		isAdmin: roles.includes("admin"),
		refresh: () => load(session?.user?.id),
		signOut: async () => {
			bootstrapped.current = null;
			await supabase.auth.signOut();
		}
	}), [
		loading,
		session,
		profile,
		roles,
		load
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const context = (0, import_react.useContext)(AuthContext);
	if (!context) throw new Error("useAuth must be used inside AuthProvider");
	return context;
}
//#endregion
export { getUserDetail as a, saveMyProfile as c, getPublicLessonAccess as i, unlockLesson as l, getLessonAccess as n, getWallet as o, getMyProfile as r, recordStudySeconds as s, AuthProvider as t, useAuth as u };
