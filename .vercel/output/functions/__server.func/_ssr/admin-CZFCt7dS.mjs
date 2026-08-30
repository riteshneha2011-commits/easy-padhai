import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { s as classLabel } from "./classes-DRcecDr1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as getUserDetail, u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { f as updateUserRole, s as getPeople } from "./admin2.functions-8uyItzoB.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-1mG_7G-8.mjs";
import { t as Badge } from "./badge-Pte9MQl5.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CZFCt7dS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	"student",
	"teacher",
	"admin"
];
function AdminPage() {
	const { user, isAdmin, loading } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const fetchPeople = useServerFn(getPeople);
	const setRole = useServerFn(updateUserRole);
	const [openId, setOpenId] = (0, import_react.useState)(null);
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
		queryKey: ["people"],
		queryFn: () => fetchPeople(),
		enabled: Boolean(user) && isAdmin
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: "Loading…" });
	if (user && !isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: "Admin access required." });
	async function change(userId, role) {
		try {
			await setRole({ data: {
				userId,
				role
			} });
			await qc.invalidateQueries({ queryKey: ["people"] });
			toast.success("Role updated");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not update role");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-4xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold tracking-tight",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-muted-foreground",
				children: [
					"Manage roles and view learner progress. Content lives in",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/teach",
						className: "text-primary underline-offset-4 hover:underline",
						children: "Studio"
					}),
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6 rounded-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-display text-lg",
						children: "People"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [data?.length ?? 0, " registered users"] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Loading…"
					}), (data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-secondary px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "text-left",
								onClick: () => setOpenId((prev) => prev === p.id ? null : p.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium underline-offset-4 hover:underline",
									children: p.full_name ?? "Learner"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										classLabel(p.class_level),
										" · ",
										p.total_xp ?? 0,
										" XP"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									p.roles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "rounded-full text-xs",
										children: r
									}, r)),
									ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "rounded-full text-xs",
										disabled: p.roles.includes(r),
										onClick: () => change(p.id, r),
										children: ["Make ", r]
									}, r)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "rounded-full text-xs",
										onClick: () => setOpenId((prev) => prev === p.id ? null : p.id),
										children: openId === p.id ? "Hide details" : "View details"
									})
								]
							})]
						}), openId === p.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserDetail, { userId: p.id })]
					}, p.id))]
				})]
			})
		]
	});
}
function UserDetail({ userId }) {
	const fetchDetail = useServerFn(getUserDetail);
	const { data, isLoading, error } = useQuery({
		queryKey: ["user-detail", userId],
		queryFn: () => fetchDetail({ data: { userId } })
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-muted-foreground",
		children: "Loading profile…"
	});
	if (error || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-destructive",
		children: "Could not load this user's details."
	});
	const p = data.profile;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 space-y-4 rounded-2xl bg-background p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Credits",
						value: p.credits ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "XP",
						value: p.total_xp ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Streak",
						value: `${data.streak?.current_streak ?? 0} d`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Lessons done",
						value: data.lessonsCompleted
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Email",
						value: data.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Mobile",
						value: p.phone ?? data.authPhone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Parent mobile",
						value: p.guardian_phone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Class",
						value: p.class_level ? classLabel(p.class_level) : null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Board",
						value: p.board
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "School",
						value: p.school_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "City / State",
						value: [p.city, p.state].filter(Boolean).join(", ") || null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Date of birth",
						value: p.date_of_birth
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Gender",
						value: p.gender
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Study language",
						value: p.preferred_language
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Goal",
						value: p.goal
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Referral code",
						value: p.referral_code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Friends joined",
						value: String(data.referralsQualified)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Credits spent",
						value: String(data.creditsSpent)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Signed up with",
						value: data.provider
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Joined",
						value: fmt(p.created_at)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Last sign-in",
						value: fmt(data.lastSignInAt)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Profile form",
						value: p.onboarding_completed ? "Completed" : "Pending"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "Recent lessons",
						empty: "No lessons completed yet",
						children: data.recentLessons.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: l.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-muted-foreground",
								children: fmt(l.completedAt)
							})]
						}, `${l.lessonId}-${l.completedAt}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "Test attempts",
						empty: "No tests attempted yet",
						children: data.attempts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: a.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 text-muted-foreground",
								children: [
									a.score,
									"/",
									a.total,
									" · ",
									fmt(a.createdAt)
								]
							})]
						}, a.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "Credit history",
						empty: "No credit activity yet",
						children: data.creditEvents.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: c.reason
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: c.delta >= 0 ? "shrink-0 text-success" : "shrink-0 text-destructive",
								children: [c.delta >= 0 ? "+" : "", c.delta]
							})]
						}, `${c.created_at}-${i}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListBlock, {
						title: "Badges",
						empty: "No badges yet",
						children: data.badges.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.badge_code }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: fmt(b.earned_at)
							})]
						}, b.badge_code))
					})
				]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-secondary px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl font-bold",
			children: value
		})]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3 border-b border-border/60 py-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-right font-medium",
			children: value || "—"
		})]
	});
}
function ListBlock({ title, empty, children }) {
	const isEmpty = (Array.isArray(children) ? children : [children]).flat().filter(Boolean).length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border/70 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
			children: title
		}), isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: empty
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-1 text-sm",
			children
		})]
	});
}
function fmt(value) {
	if (!value) return null;
	return new Date(value).toLocaleDateString(void 0, {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function Shell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-4xl px-4 py-16 text-muted-foreground",
		children
	});
}
//#endregion
export { AdminPage as component };
