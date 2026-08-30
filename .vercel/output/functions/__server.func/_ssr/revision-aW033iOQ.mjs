import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as cn } from "./utils-wh7lFpBf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { n as CardContent, t as Card } from "./card-1mG_7G-8.mjs";
import { t as Badge } from "./badge-Pte9MQl5.mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as removeQuestionSave, i as removeBookmark, r as listRevision } from "./revision.functions-CnvB7jO2.mjs";
import { A as Bookmark, D as CircleX, a as Trash2, g as ListChecks, j as BookmarkX, k as CircleCheck } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/revision-aW033iOQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RESOURCE_LABEL = {
	lesson: "Whole lesson",
	audio: "Audio",
	video: "Video",
	summary: "Summary",
	pdf: "PDF notes"
};
function RevisionPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const fetchRevision = useServerFn(listRevision);
	const dropBookmark = useServerFn(removeBookmark);
	const dropQuestion = useServerFn(removeQuestionSave);
	const [tab, setTab] = (0, import_react.useState)("again");
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({
			to: "/auth",
			replace: true
		});
	}, [
		loading,
		user,
		navigate
	]);
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["revision", user?.id],
		queryFn: () => fetchRevision(),
		enabled: Boolean(user)
	});
	if (!user || isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-4xl px-4 py-16 text-muted-foreground",
		children: "Loading your revision…"
	});
	const tabs = [
		{
			key: "again",
			label: "Visit again",
			count: data.bookmarks.length
		},
		{
			key: "bank",
			label: "Revision bank",
			count: data.bank.length
		},
		{
			key: "mistakes",
			label: "Mistake box",
			count: data.mistakes.length
		}
	];
	const totalPending = data.bookmarks.length + data.bank.length + data.mistakes.filter((m) => !m.resolvedAt).length;
	async function handleRemoveBookmark(id) {
		await dropBookmark({ data: { id } });
		toast.success("Removed from Visit again");
		refetch();
	}
	async function handleRemoveQuestion(id, from) {
		await dropQuestion({ data: { id } });
		toast.success(`Removed from ${from}`);
		refetch();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-4xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold tracking-tight",
				children: "My revision"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-muted-foreground",
				children: totalPending > 0 ? `${totalPending} item${totalPending === 1 ? "" : "s"} waiting for you. Clear them one by one.` : "Nothing pending — mark lessons or questions for revision as you study."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-2 rounded-2xl bg-secondary/60 p-1.5",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab(t.key),
					className: cn("flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all", tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
					children: [t.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary",
						children: t.count
					})]
				}, t.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-3",
				children: [
					tab === "again" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [data.bookmarks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-6" }),
						text: "No lessons saved yet. Tap “Visit again” on any lesson that felt confusing."
					}), data.bookmarks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-3xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex flex-wrap items-start justify-between gap-3 py-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
										children: [
											b.chapterTitle ?? "Chapter",
											" · ",
											RESOURCE_LABEL[b.resource] ?? b.resource
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-lg font-bold",
										children: b.lessonTitle
									}),
									b.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: [
											"“",
											b.note,
											"”"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex shrink-0 gap-2",
								children: [b.chapterSlug && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									className: "rounded-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/learn/$slug",
										params: { slug: b.chapterSlug },
										children: "Open lesson"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "rounded-full",
									onClick: () => handleRemoveBookmark(b.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkX, { className: "size-4" }), " Clear"]
								})]
							})]
						})
					}, b.id))] }),
					tab === "bank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [data.bank.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "size-6" }),
						text: "Your revision bank is empty. After a test, tap “Save to revision bank” on questions you want to revisit."
					}), data.bank.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionCard, {
						item: q,
						actionLabel: "I'm confident — remove",
						onRemove: () => handleRemoveQuestion(q.id, "revision bank")
					}, q.id))] }),
					tab === "mistakes" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [data.mistakes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-6" }),
						text: "No mistakes recorded. Every question you get wrong in a test lands here automatically."
					}), data.mistakes.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionCard, {
						item: q,
						actionLabel: "Mastered — remove",
						onRemove: () => handleRemoveQuestion(q.id, "mistake box")
					}, q.id))] })
				]
			})
		]
	});
}
function QuestionCard({ item, actionLabel, onRemove }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "rounded-3xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3 py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						item.chapterTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "rounded-full text-xs",
							children: item.chapterTitle
						}),
						item.topic && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "rounded-full text-xs",
							children: item.topic
						}),
						item.resolvedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 text-xs font-semibold text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), " Fixed since"]
						}) : item.selectedIndex !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 text-xs font-semibold text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5" }), " You picked the wrong option"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: item.prompt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5 text-sm",
					children: item.options.map((opt, oi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("rounded-xl px-3 py-2", oi === item.correctIndex && "bg-accent/15 font-medium text-accent", oi === item.selectedIndex && oi !== item.correctIndex && "bg-destructive/10 text-destructive"),
						children: opt
					}, oi))
				}),
				item.explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: "Why: "
					}), item.explanation]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 pt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "outline",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/test/$testId",
							params: { testId: item.testId },
							children: "Retake test"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						className: "rounded-full",
						onClick: onRemove,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }),
							" ",
							actionLabel
						]
					})]
				})
			]
		})
	});
}
function Empty({ icon, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "rounded-3xl border-dashed",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col items-center gap-3 py-10 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary",
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted-foreground",
				children: text
			})]
		})
	});
}
//#endregion
export { RevisionPage as component };
