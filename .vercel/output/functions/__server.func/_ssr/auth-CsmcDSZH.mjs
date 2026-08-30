import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DEFAULT_CLASS_LEVEL } from "./classes-DRcecDr1.mjs";
import { t as supabase } from "./client-Bt-p7qWF.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-1mG_7G-8.mjs";
import { t as easy_padhai_mark_png_asset_default } from "./easy-padhai-mark.png.asset-BhUhNQYZ.mjs";
import { n as Label, t as Input } from "./label-D_GobDJ5.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-DX04k_12.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-CsmcDSZH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!loading && user) navigate({
			to: "/dashboard",
			replace: true
		});
	}, [
		loading,
		user,
		navigate
	]);
	async function signIn(e) {
		e.preventDefault();
		setBusy(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		setBusy(false);
		if (error) return toast.error(error.message);
		toast.success("Welcome back!");
		navigate({ to: "/dashboard" });
	}
	async function signUp(e) {
		e.preventDefault();
		setBusy(true);
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${window.location.origin}/dashboard`,
				data: {
					full_name: fullName,
					class_level: DEFAULT_CLASS_LEVEL
				}
			}
		});
		setBusy(false);
		if (error) return toast.error(error.message);
		toast.success("Account created. Check your inbox if confirmation is required.");
	}
	async function google() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${window.location.origin}/dashboard` }
		});
		if (error) toast.error(error.message);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-3 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: easy_padhai_mark_png_asset_default.url,
						alt: "Easy Padhai",
						className: "size-14 object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-bold tracking-tight",
						children: "Learn a little, every day"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Free to start for Class 9–12 students. Streaks, XP and instant test feedback."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-display text-xl",
						children: "Your account"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Sign in or create a new one in seconds." })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "mb-4 w-full rounded-full",
					onClick: google,
					children: "Continue with Google"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "signin",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "grid w-full grid-cols-2 rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signin",
								className: "rounded-full",
								children: "Sign in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signup",
								className: "rounded-full",
								children: "Sign up"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 space-y-3",
								onSubmit: signIn,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "email",
											children: "Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "email",
											type: "email",
											required: true,
											value: email,
											onChange: (e) => setEmail(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "password",
											children: "Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "password",
											type: "password",
											required: true,
											value: password,
											onChange: (e) => setPassword(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full rounded-full",
										disabled: busy,
										children: busy ? "Signing in…" : "Sign in"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signup",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 space-y-3",
								onSubmit: signUp,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "name",
											children: "Full name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "name",
											required: true,
											value: fullName,
											onChange: (e) => setFullName(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "email2",
											children: "Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "email2",
											type: "email",
											required: true,
											value: email,
											onChange: (e) => setEmail(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "password2",
											children: "Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "password2",
											type: "password",
											required: true,
											minLength: 6,
											value: password,
											onChange: (e) => setPassword(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										className: "w-full rounded-full",
										disabled: busy,
										children: busy ? "Creating…" : "Create free account"
									})
								]
							})
						})
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-xs text-muted-foreground",
				children: [
					"Just browsing?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/learn",
						className: "font-semibold text-primary underline-offset-4 hover:underline",
						children: "Explore chapters first"
					})
				]
			})
		]
	});
}
//#endregion
export { AuthPage as component };
