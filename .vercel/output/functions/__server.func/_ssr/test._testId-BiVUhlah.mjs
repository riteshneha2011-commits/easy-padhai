import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { n as createSsrRpc, t as cn } from "./utils-wh7lFpBf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-1mG_7G-8.mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { o as saveQuestion } from "./revision.functions-CnvB7jO2.mjs";
import { t as Progress } from "./progress-CbDmaPRw.mjs";
import { A as Bookmark, D as CircleX, k as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as Route } from "./test._testId-slhETnHP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/test._testId-BiVUhlah.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getTest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("0b7e84fee78f4368f83c6a93dcf1c740b4d0d839875329bbfde6d6942d5f5cf4"));
var submitAttempt = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("3c3223badd98f2fb52c1457efe81e6d5d88dd1dc8b573486dc0f34494988fc28"));
function TestPage() {
	const { testId } = Route.useParams();
	const { user, loading, refresh } = useAuth();
	const navigate = useNavigate();
	const fetchTest = useServerFn(getTest);
	const submit = useServerFn(submitAttempt);
	const saveToBank = useServerFn(saveQuestion);
	const [answers, setAnswers] = (0, import_react.useState)({});
	const [index, setIndex] = (0, import_react.useState)(0);
	const [result, setResult] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)({});
	async function handleSave(questionId, selected) {
		try {
			await saveToBank({ data: {
				questionId,
				source: "manual",
				selectedIndex: selected
			} });
			setSaved((s) => ({
				...s,
				[questionId]: true
			}));
			toast.success("Saved to your revision bank");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not save");
		}
	}
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
	const { data, isLoading } = useQuery({
		queryKey: ["test", testId],
		queryFn: () => fetchTest({ data: { testId } }),
		enabled: Boolean(user)
	});
	if (!user || isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl px-4 py-16 text-muted-foreground",
		children: "Loading test…"
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "This test isn't available."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			className: "mt-4 rounded-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/learn",
				children: "Back to chapters"
			})
		})]
	});
	const questions = data.questions;
	if (result) {
		const percent = Math.round(result.score / Math.max(result.total, 1) * 100);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-3xl px-4 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "rounded-3xl text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "py-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "You scored"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-6xl font-bold text-primary",
								children: [result.score, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-2xl text-muted-foreground",
									children: ["/", result.total]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-semibold text-accent",
								children: [
									"+",
									result.xp,
									" XP earned"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: percent,
								className: "mx-auto mt-4 h-3 max-w-sm"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-8 font-display text-xl font-bold",
					children: "Review"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-3",
					children: result.details.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "rounded-3xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "flex items-start gap-2 text-base font-semibold",
								children: [d.correct ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-5 shrink-0 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mt-0.5 size-5 shrink-0 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									i + 1,
									". ",
									d.prompt
								] })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-1.5 text-sm",
							children: [
								d.options.map((opt, oi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("rounded-xl px-3 py-2", oi === d.correctIndex && "bg-accent/15 font-medium text-accent", oi === d.selected && oi !== d.correctIndex && "bg-destructive/10 text-destructive"),
									children: opt
								}, oi)),
								d.explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "pt-1 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: "Why: "
									}), d.explanation]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: saved[d.id] ? "secondary" : "outline",
										className: "rounded-full",
										disabled: saved[d.id],
										onClick: () => handleSave(d.id, d.selected),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" }), saved[d.id] ? "In revision bank" : "Save to revision bank"]
									})
								})
							]
						})]
					}, d.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "rounded-full",
						onClick: () => {
							setResult(null);
							setAnswers({});
							setIndex(0);
						},
						children: "Retake test"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							children: "See my progress"
						})
					})]
				})
			]
		});
	}
	const q = questions[index];
	const answered = Object.keys(answers).length;
	async function finish() {
		setBusy(true);
		try {
			const res = await submit({ data: {
				testId,
				answers
			} });
			setResult(res);
			await refresh();
			window.scrollTo({ top: 0 });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not submit");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-2xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: data.test.chapterTitle
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold tracking-tight",
				children: data.test.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: (index + 1) / questions.length * 100,
				className: "mt-4 h-2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					"Question ",
					index + 1,
					" of ",
					questions.length,
					" · ",
					answered,
					" answered"
				]
			}),
			q && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 rounded-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-lg leading-snug",
					children: q.prompt
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-2",
					children: q.options.map((opt, oi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setAnswers((a) => ({
							...a,
							[q.id]: oi
						})),
						className: cn("w-full rounded-2xl border border-border px-4 py-3 text-left text-sm transition-colors hover:bg-secondary", answers[q.id] === oi && "border-primary bg-primary/10 font-medium text-primary"),
						children: opt
					}, oi))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "rounded-full",
					disabled: index === 0,
					onClick: () => setIndex((i) => i - 1),
					children: "Previous"
				}), index < questions.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "rounded-full",
					onClick: () => setIndex((i) => i + 1),
					children: "Next"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "rounded-full",
					onClick: finish,
					disabled: busy,
					children: busy ? "Checking…" : "Submit test"
				})]
			})
		]
	});
}
//#endregion
export { TestPage as component };
