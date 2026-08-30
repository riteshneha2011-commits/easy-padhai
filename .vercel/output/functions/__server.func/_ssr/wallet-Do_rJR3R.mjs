import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { c as whatsappShare, n as CREDIT_REWARDS, o as nextStreakMilestone, s as referralLink, t as CREDIT_COSTS } from "./credits-CWoRelbL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as getWallet, u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-1mG_7G-8.mjs";
import { t as Badge } from "./badge-Pte9MQl5.mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { T as Coins, l as Share2, t as Users, w as Copy, x as Flame, y as Gift } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-Do_rJR3R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WalletPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const fetchWallet = useServerFn(getWallet);
	const [origin, setOrigin] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
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
		queryKey: ["wallet", user?.id],
		queryFn: () => fetchWallet(),
		enabled: Boolean(user)
	});
	if (!user || isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-4xl px-4 py-16 text-muted-foreground",
		children: "Loading your credits…"
	});
	const link = data.referralCode && origin ? referralLink(origin, data.referralCode) : "";
	const milestone = nextStreakMilestone(data.streak);
	async function copy(text) {
		await navigator.clipboard.writeText(text);
		toast.success("Copied — now paste it to a friend 🎉");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-4xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold tracking-tight",
				children: "Credits & referrals"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-muted-foreground",
				children: "Credits open audio and video lectures and PDF notes. Summaries and tests are always free."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-3xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "py-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4" }), " Balance"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-4xl font-bold",
									children: data.credits
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm opacity-90",
									children: "credits available"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-3xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "py-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), " Friends joined"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-4xl font-bold",
									children: data.referrals.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [data.earnedFromReferrals, " credits earned"]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-3xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "py-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-4" }), " Streak"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-4xl font-bold",
									children: data.streak
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: milestone ? `Day ${milestone.day} pays +${milestone.credits}` : "Every ladder bonus claimed 🎉"
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6 rounded-3xl border-primary/30 bg-primary/5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2 font-display text-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-5 text-primary" }),
							" Invite a friend, you both get ",
							CREDIT_REWARDS.referral,
							" ",
							"credits"
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Credits land as soon as your friend finishes their first lesson — so share it with someone who actually wants to study."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "rounded-full bg-card px-4 py-2 font-display text-base font-bold tracking-wide",
									children: data.referralCode ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: "rounded-full",
									onClick: () => copy(data.referralCode ?? ""),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), " Copy code"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									className: "rounded-full",
									onClick: () => copy(link),
									disabled: !link,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), " Copy link"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "rounded-full",
									disabled: !link,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: link ? whatsappShare(link) : "#",
										target: "_blank",
										rel: "noreferrer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), " Share on WhatsApp"]
									})
								})
							]
						}),
						data.referrals.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2 pt-2",
							children: data.referrals.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-2xl bg-card px-4 py-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: r.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: r.status === "qualified" ? "default" : "outline",
									className: "rounded-full",
									children: r.status === "qualified" ? `+${r.credits} credits` : "Waiting for first lesson"
								})]
							}, r.id))
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "font-display text-lg",
							children: "How to earn credits"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Visit every day",
								value: `+${CREDIT_REWARDS.dailyLogin}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Finish a lesson",
								value: `+${CREDIT_REWARDS.lessonComplete}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Every 10 minutes of study",
								value: `+${CREDIT_REWARDS.studyBlock}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Take a test (pass for more)",
								value: `+${CREDIT_REWARDS.testSubmitted}–${CREDIT_REWARDS.testSubmitted + CREDIT_REWARDS.testPassedBonus}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Invite a friend",
								value: `+${CREDIT_REWARDS.referral}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Streak bonuses (day 3/7/14/30)",
								value: "+20 to +250"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 border-t border-border/70 pt-3 text-xs text-muted-foreground",
								children: [
									"Costs — audio ",
									CREDIT_COSTS.audio,
									", video ",
									CREDIT_COSTS.video,
									", notes ",
									CREDIT_COSTS.pdf,
									". Summaries, tests and the first lesson of every chapter are free. ",
									data.unlockedCount,
									" lessons unlocked so far."
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "font-display text-lg",
							children: "Credit history"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-2",
						children: [data.events.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Nothing yet.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/learn",
									className: "text-primary underline-offset-4 hover:underline",
									children: "Start a lesson"
								}),
								"."
							]
						}), data.events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: e.reason
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: new Date(e.created_at).toLocaleDateString()
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: e.delta >= 0 ? "font-display font-bold text-accent" : "font-display font-bold text-muted-foreground",
								children: e.delta >= 0 ? `+${e.delta}` : e.delta
							})]
						}, e.id))]
					})]
				})]
			})
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display font-bold text-primary",
			children: value
		})]
	});
}
//#endregion
export { WalletPage as component };
