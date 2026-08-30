import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { a as DEFAULT_CLASS_LEVEL, c as isClassActive, l as normalizeClassLevel, r as ALL_CLASS_LEVELS } from "./classes-DRcecDr1.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as saveMyProfile, r as getMyProfile, u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-1mG_7G-8.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as Label, t as Input } from "./label-D_GobDJ5.mjs";
import { t as Textarea } from "./textarea-GN6iAuj5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-BwPSm_vj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BOARDS = [
	"CBSE",
	"ICSE",
	"State board",
	"Other"
];
var LANGUAGES = [
	"English",
	"Hindi",
	"Hinglish"
];
var GENDERS = [
	"Female",
	"Male",
	"Prefer not to say"
];
var EMPTY = {
	full_name: "",
	phone: "",
	class_level: String(DEFAULT_CLASS_LEVEL),
	guardian_phone: "",
	school_name: "",
	city: "",
	state: "",
	board: "",
	gender: "",
	date_of_birth: "",
	preferred_language: "",
	goal: ""
};
function OnboardingPage() {
	const { user, loading, refresh } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const fetchProfile = useServerFn(getMyProfile);
	const save = useServerFn(saveMyProfile);
	const [form, setForm] = (0, import_react.useState)(EMPTY);
	const [saving, setSaving] = (0, import_react.useState)(false);
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
	const { data: profile } = useQuery({
		queryKey: ["my-profile", user?.id],
		queryFn: () => fetchProfile(),
		enabled: Boolean(user)
	});
	(0, import_react.useEffect)(() => {
		if (!profile) return;
		setForm({
			full_name: profile.full_name ?? "",
			phone: profile.phone ?? "",
			class_level: String(normalizeClassLevel(profile.class_level)),
			guardian_phone: profile.guardian_phone ?? "",
			school_name: profile.school_name ?? "",
			city: profile.city ?? "",
			state: profile.state ?? "",
			board: profile.board ?? "",
			gender: profile.gender ?? "",
			date_of_birth: profile.date_of_birth ?? "",
			preferred_language: profile.preferred_language ?? "",
			goal: profile.goal ?? ""
		});
	}, [profile]);
	function set(key, value) {
		setForm((prev) => ({
			...prev,
			[key]: value
		}));
	}
	async function submit(event) {
		event.preventDefault();
		if (!form.full_name.trim()) return toast.error("Please enter your name");
		if (!/^[0-9+\-\s()]{8,20}$/.test(form.phone.trim())) return toast.error("Please enter a valid mobile number");
		setSaving(true);
		try {
			await save({ data: {
				full_name: form.full_name,
				phone: form.phone,
				class_level: normalizeClassLevel(form.class_level),
				guardian_phone: form.guardian_phone,
				school_name: form.school_name,
				city: form.city,
				state: form.state,
				board: form.board,
				gender: form.gender,
				date_of_birth: form.date_of_birth || null,
				preferred_language: form.preferred_language,
				goal: form.goal
			} });
			await qc.invalidateQueries({ queryKey: ["my-profile"] });
			await refresh();
			toast.success("Profile saved — happy learning! 🎉");
			navigate({ to: "/learn" });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not save your details");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-2xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold tracking-tight",
				children: "A few quick details"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-muted-foreground",
				children: "Only your name and mobile number are required. Everything else helps us pick the right lessons for you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6 rounded-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "font-display text-lg",
						children: "Your profile"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Takes about a minute. You can change it later." })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Full name",
							required: true,
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.full_name,
								onChange: (e) => set("full_name", e.target.value),
								placeholder: "Riya Sharma",
								maxLength: 100,
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Mobile number",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.phone,
								onChange: (e) => set("phone", e.target.value),
								placeholder: "+91 98765 43210",
								inputMode: "tel",
								maxLength: 20,
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Class",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: form.class_level,
								onChange: (e) => set("class_level", e.target.value),
								className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
								children: ALL_CLASS_LEVELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: c,
									disabled: !isClassActive(c),
									children: [
										"Class ",
										c,
										isClassActive(c) ? "" : " — coming soon"
									]
								}, c))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Parent / guardian mobile",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.guardian_phone,
								onChange: (e) => set("guardian_phone", e.target.value),
								placeholder: "+91 90000 00000",
								inputMode: "tel",
								maxLength: 20
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "School",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.school_name,
								onChange: (e) => set("school_name", e.target.value),
								placeholder: "Govt. Higher Secondary School",
								maxLength: 120
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Board",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: form.board,
								onChange: (e) => set("board", e.target.value),
								className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select"
								}), BOARDS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: b,
									children: b
								}, b))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Study language",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: form.preferred_language,
								onChange: (e) => set("preferred_language", e.target.value),
								className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select"
								}), LANGUAGES.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: l,
									children: l
								}, l))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "City",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.city,
								onChange: (e) => set("city", e.target.value),
								maxLength: 80
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "State",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.state,
								onChange: (e) => set("state", e.target.value),
								maxLength: 80
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date of birth",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: form.date_of_birth,
								onChange: (e) => set("date_of_birth", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Gender",
							hint: "optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: form.gender,
								onChange: (e) => set("gender", e.target.value),
								className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select"
								}), GENDERS.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: g,
									children: g
								}, g))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "What is your goal this year?",
							hint: "optional",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: form.goal,
								onChange: (e) => set("goal", e.target.value),
								placeholder: "Score above 90% in Science and build a daily study habit.",
								maxLength: 300,
								rows: 3
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2 flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: saving,
								className: "rounded-full",
								children: saving ? "Saving…" : "Save and start learning"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								className: "rounded-full",
								onClick: () => navigate({ to: "/learn" }),
								children: "Later"
							})]
						})
					]
				}) })]
			})
		]
	});
}
function Field({ label, required, hint, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
			className: "mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
			children: [
				label,
				required ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive",
					children: "*"
				}) : null,
				hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-normal normal-case tracking-normal",
					children: ["· ", hint]
				}) : null
			]
		}), children]
	});
}
//#endregion
export { OnboardingPage as component };
