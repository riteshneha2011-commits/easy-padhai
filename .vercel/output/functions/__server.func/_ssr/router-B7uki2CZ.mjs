import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as cn } from "./utils-wh7lFpBf.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { o as getWallet, t as AuthProvider, u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as QueryClientProvider, i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as easy_padhai_mark_png_asset_default } from "./easy-padhai-mark.png.asset-BhUhNQYZ.mjs";
import { T as Coins, d as Menu, f as LogOut, s as Sun, u as Moon, x as Flame } from "../_libs/lucide-react.mjs";
import { t as Route$11 } from "./learn._slug-BpsB8_F_.mjs";
import { t as catalogQuery } from "./learn.index-C3L-LwJN.mjs";
import { t as catalogQuery$1 } from "./routes-BXILTUbe.mjs";
import { t as Route$12 } from "./test._testId-slhETnHP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-B7uki2CZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DgfkAhrZ.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	console.error("[App Error]", error, context);
}
var STORAGE_KEY = "easy-padhai-theme";
var ThemeContext = (0, import_react.createContext)(null);
function ThemeProvider({ children }) {
	const [theme, setTheme] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const next = window.localStorage.getItem(STORAGE_KEY) ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		setTheme(next);
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		document.documentElement.style.colorScheme = theme;
	}, [theme]);
	const toggle = (0, import_react.useCallback)(() => {
		setTheme((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			window.localStorage.setItem(STORAGE_KEY, next);
			return next;
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			toggle
		},
		children
	});
}
function useTheme() {
	const context = (0, import_react.useContext)(ThemeContext);
	if (!context) throw new Error("useTheme must be used inside ThemeProvider");
	return context;
}
function ThemeToggle() {
	const { theme, toggle } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		onClick: toggle,
		className: "rounded-full",
		"aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
		title: theme === "dark" ? "Light mode" : "Dark mode",
		children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
	});
}
var links = [{
	to: "/learn",
	label: "Learn"
}, {
	to: "/leaderboard",
	label: "Leaderboard"
}];
function SiteHeader() {
	const { user, profile, isStaff, isAdmin, signOut } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const fetchWallet = useServerFn(getWallet);
	const { data: wallet } = useQuery({
		queryKey: ["wallet-pill", user?.id],
		queryFn: () => fetchWallet(),
		enabled: Boolean(user),
		refetchOnWindowFocus: true,
		staleTime: 1e4
	});
	const credits = wallet?.credits ?? profile?.credits ?? 0;
	const xp = profile?.total_xp ?? 0;
	const navItems = [
		...links,
		...user ? [{
			to: "/dashboard",
			label: "My progress"
		}] : [],
		...user ? [{
			to: "/revision",
			label: "Revision"
		}] : [],
		...user ? [{
			to: "/wallet",
			label: "Credits"
		}] : [],
		...isStaff ? [{
			to: "/teach",
			label: "Studio"
		}] : [],
		...isAdmin ? [{
			to: "/admin",
			label: "Admin"
		}] : []
	];
	async function handleSignOut() {
		await signOut();
		setOpen(false);
		navigate({
			to: "/",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: easy_padhai_mark_png_asset_default.url,
						alt: "Easy Padhai",
						className: "size-9 object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl font-bold tracking-tight",
						children: "Easy Padhai"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "ml-4 hidden items-center gap-1 md:flex",
					children: navItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: cn("rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", pathname.startsWith(item.to) && "bg-secondary text-foreground"),
						children: item.label
					}, item.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-2",
					children: [user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/wallet",
							title: "Credits — spend them to open audio, video and PDF lessons",
							className: "flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4" }),
								credits,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "credits"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							title: "XP (experience points) measure how much you have learned and set your level and leaderboard rank",
							className: "hidden items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent sm:flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-4" }),
								xp,
								" XP"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: handleSignOut,
							"aria-label": "Sign out",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							children: "Start free"
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "md:hidden",
						onClick: () => setOpen((v) => !v),
						"aria-label": "Menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					})]
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border/70 bg-background px-4 py-3 md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-1",
				children: navItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.to,
					onClick: () => setOpen(false),
					className: "rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary",
					children: item.label
				}, item.to))
			})
		})]
	});
}
var ALLOWED = ["/onboarding", "/auth"];
/**
* Sends freshly registered learners to the details form once, right after
* email/password or Google sign-up.
*/
function OnboardingGate() {
	const { user, profile, loading } = useAuth();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (loading || !user || !profile) return;
		if (profile.onboarding_completed) return;
		if (ALLOWED.some((p) => pathname.startsWith(p))) return;
		navigate({
			to: "/onboarding",
			replace: true
		});
	}, [
		loading,
		user,
		profile,
		pathname,
		navigate
	]);
	return null;
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: error.message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$10 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Easy Padhai — Class 9–12 learning that actually sticks" },
			{
				name: "description",
				content: "Audio lectures, video lessons, quick summaries, PDF notes and instant objective tests for Class 9 to 12 students. Class 9 is live now."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.png",
				type: "image/png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$10.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-screen flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingGate, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "border-t border-border/70 py-8 text-center text-sm text-muted-foreground",
					children: "Easy Padhai — built for Class 9–12 learners. Class 9 live now, more classes coming soon."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-center",
			richColors: true
		})] }) })
	});
}
var $$splitComponentImporter$9 = () => import("./routes-CjR0wUT2.mjs");
var Route$9 = createFileRoute("/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery$1),
	head: () => ({ meta: [
		{ title: "Easy Padhai — Class 9–12 Science, learned in 4 easy steps" },
		{
			name: "description",
			content: "Listen, watch, revise and test. Easy Padhai turns every Class 9 to 12 Science chapter into a short daily loop with streaks, XP and instant feedback. Class 9 is live now."
		},
		{
			property: "og:title",
			content: "Easy Padhai — Class 9–12 Science, learned in 4 easy steps"
		},
		{
			property: "og:description",
			content: "Audio lectures, videos, summaries, PDF notes and instant objective tests."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./admin-CZFCt7dS.mjs");
var Route$8 = createFileRoute("/admin")({
	head: () => ({ meta: [
		{ title: "Admin — Easy Padhai" },
		{
			name: "description",
			content: "Manage Easy Padhai learners, teachers and role assignments."
		},
		{
			property: "og:title",
			content: "Admin — Easy Padhai"
		},
		{
			property: "og:description",
			content: "User management and role assignment for Easy Padhai."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./auth-CsmcDSZH.mjs");
var Route$7 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in — Easy Padhai" },
		{
			name: "description",
			content: "Create your free Easy Padhai account to track streaks, XP and Class 9 to 12 test scores."
		},
		{
			property: "og:title",
			content: "Sign in — Easy Padhai"
		},
		{
			property: "og:description",
			content: "Free Class 9 to 12 learning with audio, video, notes and instant objective tests."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./dashboard-DtrRTZVM.mjs");
var Route$6 = createFileRoute("/dashboard")({
	head: () => ({ meta: [
		{ title: "My progress — Easy Padhai" },
		{
			name: "description",
			content: "Track your streak, XP, level, badges, chapter progress and test history on Easy Padhai."
		},
		{
			property: "og:title",
			content: "My progress — Easy Padhai"
		},
		{
			property: "og:description",
			content: "Streaks, XP, badges and weak topics for Class 9 to 12 Science, all in one place."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./leaderboard-Dkl2RTgW.mjs");
var Route$5 = createFileRoute("/leaderboard")({
	head: () => ({ meta: [
		{ title: "Leaderboard — Easy Padhai Class 9–12" },
		{
			name: "description",
			content: "See the top Class 9 to 12 learners on Easy Padhai ranked by XP earned from lessons and tests."
		},
		{
			property: "og:title",
			content: "Leaderboard — Easy Padhai Class 9–12"
		},
		{
			property: "og:description",
			content: "Top learners ranked by XP. Climb the board by studying a little every day."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./onboarding-BwPSm_vj.mjs");
var Route$4 = createFileRoute("/onboarding")({
	head: () => ({ meta: [
		{ title: "Complete your profile — Easy Padhai" },
		{
			name: "description",
			content: "Tell us your name, class and contact details so Easy Padhai can personalise your learning."
		},
		{
			property: "og:title",
			content: "Complete your profile — Easy Padhai"
		},
		{
			property: "og:description",
			content: "A one-minute form to personalise your Easy Padhai account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./revision-aW033iOQ.mjs");
var Route$3 = createFileRoute("/revision")({
	head: () => ({ meta: [
		{ title: "My revision — Easy Padhai" },
		{
			name: "description",
			content: "Your personal revision hub: lessons to visit again, a revision bank of saved questions and a mistake box of every question you got wrong."
		},
		{
			property: "og:title",
			content: "My revision — Easy Padhai"
		},
		{
			property: "og:description",
			content: "Visit again list, revision bank and mistake box — revise exactly what you need."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./teach-ZLS1BRUo.mjs");
var Route$2 = createFileRoute("/teach")({
	head: () => ({ meta: [
		{ title: "Studio — Easy Padhai" },
		{
			name: "description",
			content: "Teacher studio: publish chapters, lessons and objective tests, and build questions fast."
		},
		{
			property: "og:title",
			content: "Studio — Easy Padhai"
		},
		{
			property: "og:description",
			content: "Add chapters, lessons and MCQs by form, JSON, Markdown or AI generation."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./wallet-Do_rJR3R.mjs");
var Route$1 = createFileRoute("/wallet")({
	head: () => ({ meta: [
		{ title: "Credits & referrals — Easy Padhai" },
		{
			name: "description",
			content: "See your Easy Padhai credit balance, how you earned it, and invite friends so you both get bonus credits."
		},
		{
			property: "og:title",
			content: "Credits & referrals — Easy Padhai"
		},
		{
			property: "og:description",
			content: "Earn credits by studying daily, unlock lectures, and invite friends for bonus credits."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./learn.index-DBTjZSuJ.mjs");
var Route = createFileRoute("/learn/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
	head: () => ({ meta: [
		{ title: "All chapters — Easy Padhai Class 9–12" },
		{
			name: "description",
			content: "Browse every Class 9 to 12 chapter on Easy Padhai: audio, video, summaries, notes and tests. Class 9 is live now."
		},
		{
			property: "og:title",
			content: "All chapters — Easy Padhai Class 9–12"
		},
		{
			property: "og:description",
			content: "Browse every Class 9 to 12 chapter: audio, video, summaries, notes and tests."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$9.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$10
});
var AdminRoute = Route$8.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$10
});
var AuthRoute = Route$7.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$10
});
var DashboardRoute = Route$6.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => Route$10
});
var LeaderboardRoute = Route$5.update({
	id: "/leaderboard",
	path: "/leaderboard",
	getParentRoute: () => Route$10
});
var OnboardingRoute = Route$4.update({
	id: "/onboarding",
	path: "/onboarding",
	getParentRoute: () => Route$10
});
var RevisionRoute = Route$3.update({
	id: "/revision",
	path: "/revision",
	getParentRoute: () => Route$10
});
var TeachRoute = Route$2.update({
	id: "/teach",
	path: "/teach",
	getParentRoute: () => Route$10
});
var WalletRoute = Route$1.update({
	id: "/wallet",
	path: "/wallet",
	getParentRoute: () => Route$10
});
var LearnIndexRoute = Route.update({
	id: "/learn/",
	path: "/learn/",
	getParentRoute: () => Route$10
});
var rootRouteChildren = {
	IndexRoute,
	AdminRoute,
	AuthRoute,
	DashboardRoute,
	LeaderboardRoute,
	OnboardingRoute,
	RevisionRoute,
	TeachRoute,
	WalletRoute,
	LearnSlugRoute: Route$11.update({
		id: "/learn/$slug",
		path: "/learn/$slug",
		getParentRoute: () => Route$10
	}),
	TestTestIdRoute: Route$12.update({
		id: "/test/$testId",
		path: "/test/$testId",
		getParentRoute: () => Route$10
	}),
	LearnIndexRoute
};
var routeTree = Route$10._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
