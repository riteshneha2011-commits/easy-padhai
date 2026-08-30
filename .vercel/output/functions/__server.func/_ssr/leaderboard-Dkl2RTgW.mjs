import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as cn } from "./utils-wh7lFpBf.mjs";
import { u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { n as CardContent, t as Card } from "./card-1mG_7G-8.mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as levelFromXp } from "./gamify-Bb5_Yp3b.mjs";
import { r as Trophy } from "../_libs/lucide-react.mjs";
import { r as getLeaderboard } from "./content.functions-DdxEIDJE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leaderboard-Dkl2RTgW.js
var import_jsx_runtime = require_jsx_runtime();
function LeaderboardPage() {
	const { user } = useAuth();
	const fetchBoard = useServerFn(getLeaderboard);
	const { data, isLoading } = useQuery({
		queryKey: ["leaderboard"],
		queryFn: () => fetchBoard()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-3xl px-4 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-11 place-items-center rounded-2xl bg-accent/15 text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-6" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold tracking-tight",
				children: "Leaderboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Top learners by all-time XP."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mt-6 rounded-3xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "divide-y divide-border/70 py-2",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-6 text-sm text-muted-foreground",
						children: "Loading…"
					}),
					(data ?? []).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex items-center gap-3 py-3", row.id === user?.id && "rounded-2xl bg-primary/5 px-3"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-7 text-center font-display font-bold text-muted-foreground",
								children: i + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: row.full_name ?? "Learner"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: ["Level ", levelFromXp(row.total_xp ?? 0)]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-display font-bold text-primary",
								children: [row.total_xp ?? 0, " XP"]
							})
						]
					}, row.id)),
					!isLoading && (data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "py-6 text-sm text-muted-foreground",
						children: [
							"No learners yet.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								className: "text-primary underline-offset-4 hover:underline",
								children: "Be the first"
							}),
							"."
						]
					})
				]
			})
		})]
	});
}
//#endregion
export { LeaderboardPage as component };
