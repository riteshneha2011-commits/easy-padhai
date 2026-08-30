import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as classLabel } from "./classes-DRcecDr1.mjs";
import { t as Card } from "./card-1mG_7G-8.mjs";
import { t as Badge } from "./badge-Pte9MQl5.mjs";
import { r as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { F as ArrowRight, N as BookOpen, O as CirclePlay, S as FileText, v as Headphones } from "../_libs/lucide-react.mjs";
import { t as catalogQuery } from "./learn.index-C3L-LwJN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn.index-DBTjZSuJ.js
var import_jsx_runtime = require_jsx_runtime();
function LearnIndex() {
	const { data: subjects } = useSuspenseQuery(catalogQuery);
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl px-4 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-bold",
				children: "Chapters"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: "Pick a chapter and move through listen → watch → revise → test."
			}),
			subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl font-bold",
							children: subject.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "rounded-full",
							children: classLabel(subject.class_level)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-4 md:grid-cols-2",
						children: subject.chapters.map((chapter, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							onClick: () => navigate({
								to: "/learn/$slug",
								params: { slug: chapter.slug }
							}),
							className: "card-hover shadow-card cursor-pointer gap-3 rounded-3xl border-border/70 p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-display text-sm font-bold text-primary",
										children: ["Chapter ", index + 1]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-xl font-bold leading-snug",
										children: chapter.title
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "mt-1 size-5 shrink-0 text-muted-foreground" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: chapter.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "size-3.5" }), " Audio"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlay, { className: "size-3.5" }), " Video"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-3.5" }), " Summary"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), " Notes"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"· ",
											chapter.lessonCount,
											" lessons"
										] })
									]
								})
							]
						}, chapter.id))
					}),
					subject.chapters.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: [
							"No chapters published yet.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/teach",
								className: "font-semibold text-primary",
								children: "Add one in Studio"
							}),
							"."
						]
					})
				]
			}, subject.id))
		]
	});
}
//#endregion
export { LearnIndex as component };
