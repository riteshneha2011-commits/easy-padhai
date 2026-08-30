import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as CLASS_RANGE_LABEL } from "./classes-DRcecDr1.mjs";
import { u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { t as Card } from "./card-1mG_7G-8.mjs";
import { r as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { F as ArrowRight, N as BookOpen, O as CirclePlay, S as FileText, c as Sparkles, r as Trophy, v as Headphones, x as Flame } from "../_libs/lucide-react.mjs";
import { t as catalogQuery } from "./routes-BXILTUbe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CjR0wUT2.js
var import_jsx_runtime = require_jsx_runtime();
var steps = [
	{
		icon: Headphones,
		title: "Listen",
		body: "Short audio lectures you can play while commuting or revising."
	},
	{
		icon: CirclePlay,
		title: "Watch",
		body: "Curated video lessons that explain the tricky bits visually."
	},
	{
		icon: BookOpen,
		title: "Revise",
		body: "One-screen summaries built for the night before a test."
	},
	{
		icon: FileText,
		title: "Practice",
		body: "PDF notes plus objective tests with instant explanations."
	}
];
function Home() {
	const { data: subjects } = useSuspenseQuery(catalogQuery);
	const { user } = useAuth();
	const chapters = subjects.flatMap((s) => s.chapters);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "grain-bg relative overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }),
						" ",
						CLASS_RANGE_LABEL,
						" · Science"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-5 text-4xl font-extrabold leading-[1.05] text-foreground md:text-6xl",
					children: [
						"Learn a chapter",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"in four small steps."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 max-w-lg text-lg text-muted-foreground",
					children: "Audio, video, summary, notes — then a quick test that tells you exactly what to revise. Build a streak and watch your XP climb."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						className: "rounded-full shadow-glow",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: user ? "/dashboard" : "/auth",
							children: [user ? "Continue learning" : "Start learning free", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						variant: "outline",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/learn",
							children: "Browse chapters"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-4 text-primary" }), " Daily streaks"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4 text-primary" }), " XP & badges"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4 text-primary" }),
								" ",
								chapters.length,
								" chapters live"
							]
						})
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "card-hover shadow-card gap-3 rounded-3xl border-border/70 p-5",
					style: { transform: i % 2 ? "translateY(14px)" : void 0 },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(step.icon, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-lg font-bold",
							children: step.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: step.body
						})
					]
				}, step.title))
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto w-full max-w-6xl px-4 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-3xl font-bold",
				children: "Start with a chapter"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-muted-foreground",
				children: "Every chapter takes about 30 focused minutes."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				className: "rounded-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/learn",
					children: ["See all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-4 md:grid-cols-3",
			children: chapters.slice(0, 6).map((chapter, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/learn/$slug",
				params: { slug: chapter.slug },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "card-hover shadow-card h-full gap-3 rounded-3xl border-border/70 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-sm font-bold text-primary",
							children: ["Chapter ", index + 1]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-bold leading-snug",
							children: chapter.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "line-clamp-2 text-sm text-muted-foreground",
							children: chapter.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center gap-3 text-xs font-semibold text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [chapter.lessonCount, " lessons"] }), chapter.testId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-accent",
								children: "· Test included"
							})]
						})
					]
				})
			}, chapter.id))
		})]
	})] });
}
//#endregion
export { Home as component };
