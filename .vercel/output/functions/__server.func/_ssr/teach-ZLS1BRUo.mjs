import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { n as ACTIVE_CLASS_LEVELS, o as UPCOMING_CLASS_LABEL, s as classLabel, t as ACTIVE_CLASS_LABEL } from "./classes-DRcecDr1.mjs";
import { t as cn } from "./utils-wh7lFpBf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { a as generateQuestions, c as saveChapter, d as saveTest, i as deleteRow, l as saveLesson, n as autofillChapterMeta, o as getAdminCatalog, r as autofillLessonMeta, t as addQuestions, u as saveSubject } from "./admin2.functions-8uyItzoB.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-1mG_7G-8.mjs";
import { t as Badge } from "./badge-Pte9MQl5.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { n as Label, t as Input } from "./label-D_GobDJ5.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-DX04k_12.mjs";
import { _ as Link2, c as Sparkles, h as LoaderCircle, n as Upload } from "../_libs/lucide-react.mjs";
import { i as uploadLessonFile, r as storagePath, t as isStorageRef } from "./storage-CweImSLh.mjs";
import { t as Textarea } from "./textarea-GN6iAuj5.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teach-ZLS1BRUo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function validate(q, index, errors) {
	const label = `Question ${index + 1}`;
	if (!q.prompt?.trim()) errors.push(`${label}: missing question text`);
	if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${label}: needs at least 2 options`);
	if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex >= (q.options?.length ?? 0)) errors.push(`${label}: no valid correct answer marked`);
}
function parseJsonQuestions(input) {
	const errors = [];
	let raw;
	try {
		raw = JSON.parse(input);
	} catch (error) {
		return {
			questions: [],
			errors: [`Invalid JSON: ${error.message}`]
		};
	}
	const list = Array.isArray(raw) ? raw : raw?.questions;
	if (!Array.isArray(list)) return {
		questions: [],
		errors: ["Expected an array of questions."]
	};
	const questions = list.map((item) => {
		const record = item;
		const options = record.options ?? [];
		let correctIndex = Number(record.correctIndex ?? record.correct_index ?? -1);
		if (typeof record.answer === "string") {
			const found = options.findIndex((o) => String(o).trim().toLowerCase() === String(record.answer).trim().toLowerCase());
			if (found >= 0) correctIndex = found;
		}
		return {
			prompt: String(record.prompt ?? record.question ?? "").trim(),
			options: options.map((o) => String(o).trim()),
			correctIndex,
			explanation: record.explanation ? String(record.explanation) : null,
			topic: record.topic ? String(record.topic) : null,
			difficulty: record.difficulty ? String(record.difficulty) : "medium"
		};
	});
	questions.forEach((q, i) => validate(q, i, errors));
	return {
		questions,
		errors
	};
}
/**
* Markdown convention:
*   Q: Which state of matter is compressible?
*   - Solid
*   * Gas          <- the asterisk marks the correct option
*   > Gases have large inter-particle spaces.
*   ~ States of Matter
*/
function parseMarkdownQuestions(input) {
	const errors = [];
	const questions = [];
	let current = null;
	const push = () => {
		if (current) questions.push(current);
		current = null;
	};
	for (const rawLine of input.split("\n")) {
		const line = rawLine.trim();
		if (!line) continue;
		if (/^q\s*[:.)]/i.test(line) || /^\d+[.)]\s/.test(line)) {
			push();
			current = {
				prompt: line.replace(/^q\s*[:.)]\s*/i, "").replace(/^\d+[.)]\s*/, ""),
				options: [],
				correctIndex: -1,
				explanation: null,
				topic: null,
				difficulty: "medium"
			};
			continue;
		}
		if (!current) continue;
		if (line.startsWith(">")) current.explanation = line.slice(1).trim();
		else if (line.startsWith("~")) current.topic = line.slice(1).trim();
		else if (line.startsWith("*")) {
			current.correctIndex = current.options.length;
			current.options.push(line.slice(1).trim());
		} else if (line.startsWith("-") || line.startsWith("+")) current.options.push(line.slice(1).trim());
	}
	push();
	if (questions.length === 0) errors.push("No questions found. Each question must start with 'Q:'.");
	questions.forEach((q, i) => validate(q, i, errors));
	return {
		questions,
		errors
	};
}
var JSON_EXAMPLE = `[
  {
    "prompt": "Which state of matter has the highest compressibility?",
    "options": ["Solid", "Liquid", "Gas", "All equal"],
    "correctIndex": 2,
    "explanation": "Gases have the largest inter-particle spaces.",
    "topic": "States of Matter",
    "difficulty": "easy"
  }
]`;
var MARKDOWN_EXAMPLE = `Q: Which state of matter has the highest compressibility?
- Solid
- Liquid
* Gas
- All equal
> Gases have the largest inter-particle spaces.
~ States of Matter

Q: Dry ice is solid...
- Water
* Carbon dioxide
- Nitrogen
> Dry ice sublimes at room temperature.`;
/** URL field with an optional direct file upload into Easy Padhai storage. */
function MediaInput({ name, label, accept, defaultValue = "", folder }) {
	const [value, setValue] = (0, import_react.useState)(defaultValue);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name,
					value,
					onChange: (e) => setValue(e.target.value),
					placeholder: "Paste a YouTube / Drive / any link"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					className: "shrink-0 rounded-xl",
					disabled: busy,
					onClick: () => fileRef.current?.click(),
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "Upload"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept,
				hidden: true,
				onChange: async (e) => {
					const file = e.target.files?.[0];
					if (!file) return;
					setBusy(true);
					try {
						const ref = await uploadLessonFile(file, folder);
						setValue(ref);
						toast.success("File uploaded");
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Upload failed");
					} finally {
						setBusy(false);
						if (fileRef.current) fileRef.current.value = "";
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: isStorageRef(value) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Uploaded file: ", storagePath(value)] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3" }), " External link or upload a file (max 50MB)"]
				})
			})
		]
	});
}
function slugify(text) {
	return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/^-|-$/g, "");
}
function setField(form, name, value) {
	const el = form.elements.namedItem(name);
	if (!el || !value) return;
	el.value = value;
	el.dispatchEvent(new Event("input", { bubbles: true }));
}
/**
* Small "Auto-generate" helper for the Studio forms.
* Reads the title (and context) from the surrounding form and fills
* slug + description (chapter) or summary (lesson) with AI output.
*/
function AiAutofill({ mode, label }) {
	const chapterMeta = useServerFn(autofillChapterMeta);
	const lessonMeta = useServerFn(autofillLessonMeta);
	const [loading, setLoading] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "secondary",
		size: "sm",
		disabled: loading,
		className: "rounded-full",
		onClick: async (e) => {
			const form = e.currentTarget.form;
			if (!form) return;
			const value = (name) => String(form.elements.namedItem(name)?.value ?? "").trim();
			const title = value("title");
			if (!title) return toast.error("Enter a title first");
			setLoading(true);
			try {
				if (mode === "chapter") {
					setField(form, "slug", slugify(title));
					const res = await chapterMeta({ data: {
						title,
						subjectId: value("subject_id")
					} });
					setField(form, "slug", res.slug);
					setField(form, "description", res.description);
					toast.success("Slug and description generated — review before saving");
				} else {
					setField(form, "summary", (await lessonMeta({ data: {
						title,
						chapterId: value("chapter_id"),
						kind: value("kind")
					} })).summary);
					toast.success("Summary generated — review before saving");
				}
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Could not generate");
			} finally {
				setLoading(false);
			}
		},
		children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), label ?? (mode === "chapter" ? "Auto-generate slug & description" : "Auto-generate summary")]
	});
}
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function TeachPage() {
	const { user, isStaff, loading } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const fetchCatalog = useServerFn(getAdminCatalog);
	const upsertChapter = useServerFn(saveChapter);
	const upsertSubject = useServerFn(saveSubject);
	const upsertLesson = useServerFn(saveLesson);
	const upsertTest = useServerFn(saveTest);
	const insertQuestions = useServerFn(addQuestions);
	const aiGenerate = useServerFn(generateQuestions);
	const removeRow = useServerFn(deleteRow);
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
		queryKey: ["admin-catalog"],
		queryFn: () => fetchCatalog(),
		enabled: Boolean(user) && isStaff
	});
	const [chapterId, setChapterId] = (0, import_react.useState)("");
	const [drafts, setDrafts] = (0, import_react.useState)([]);
	const [raw, setRaw] = (0, import_react.useState)("");
	const [aiCount, setAiCount] = (0, import_react.useState)(5);
	const [aiDifficulty, setAiDifficulty] = (0, import_react.useState)("medium");
	const [aiSource, setAiSource] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [editChapter, setEditChapter] = (0, import_react.useState)(null);
	const [editLesson, setEditLesson] = (0, import_react.useState)(null);
	const [editSubject, setEditSubject] = (0, import_react.useState)(null);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: "Loading…" });
	if (user && !isStaff) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: "You need a teacher or admin role to open Studio." });
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: "Loading studio…" });
	const chapters = data.chapters;
	const activeChapter = chapters.find((c) => c.id === chapterId) ?? chapters[0] ?? null;
	const activeTest = activeChapter ? data.tests.find((t) => t.chapter_id === activeChapter.id) : null;
	const refresh = () => qc.invalidateQueries({ queryKey: ["admin-catalog"] });
	async function run(fn, message) {
		setBusy(true);
		try {
			await fn();
			await refresh();
			toast.success(message);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Something went wrong");
		} finally {
			setBusy(false);
		}
	}
	function loadDrafts(result) {
		if (result.errors.length) {
			toast.error(result.errors.slice(0, 3).join(" · "));
			return;
		}
		setDrafts(result.questions);
		toast.success(`${result.questions.length} questions ready to review`);
	}
	async function saveDrafts() {
		if (!activeTest) return toast.error("Create a test for this chapter first");
		await run(() => insertQuestions({ data: {
			testId: activeTest.id,
			questions: drafts
		} }), `${drafts.length} questions added`);
		setDrafts([]);
		setRaw("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-5xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold tracking-tight",
				children: "Studio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-muted-foreground",
				children: [
					"Publish content and build tests for ",
					ACTIVE_CLASS_LABEL,
					UPCOMING_CLASS_LABEL ? ` (${UPCOMING_CLASS_LABEL} coming soon)` : "",
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "content",
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "rounded-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "content",
							className: "rounded-full",
							children: "Content"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "questions",
							className: "rounded-full",
							children: "Questions"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "content",
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "rounded-3xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "font-display text-lg",
										children: "Subjects"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Add, edit or delete subjects. Chapters live inside a subject." })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
											className: "grid gap-3 sm:grid-cols-2",
											onSubmit: (e) => {
												e.preventDefault();
												const form = e.currentTarget;
												const f = new FormData(form);
												run(() => upsertSubject({ data: {
													name: String(f.get("name")),
													slug: String(f.get("slug")) || slugify(String(f.get("name"))),
													class_level: Number(f.get("class_level") ?? ACTIVE_CLASS_LEVELS[0]),
													description: String(f.get("description") ?? "") || null,
													order_index: Number(f.get("order_index") ?? 0),
													published: true
												} }), "Subject saved");
												form.reset();
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														name: "name",
														required: true,
														placeholder: "Science",
														onBlur: (e) => {
															const slug = e.currentTarget.form?.elements.namedItem("slug");
															if (slug && !slug.value) slug.value = slugify(e.currentTarget.value);
														}
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Slug" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														name: "slug",
														placeholder: "science"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Class" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
														name: "class_level",
														className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
														children: ACTIVE_CLASS_LEVELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: c,
															children: classLabel(c)
														}, c))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														name: "order_index",
														type: "number",
														defaultValue: data.subjects.length + 1
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5 sm:col-span-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
														name: "description",
														rows: 2
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "submit",
													disabled: busy,
													className: "rounded-full sm:col-span-2",
													children: "Add subject"
												})
											]
										}),
										data.subjects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "No subjects yet — add your first one above."
										}),
										data.subjects.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-2xl bg-secondary p-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-semibold",
													children: [s.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "ml-2 text-xs font-normal text-muted-foreground",
														children: [
															classLabel(s.class_level),
															" · ",
															s.published ? "published" : "hidden"
														]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex shrink-0 items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														className: "rounded-full",
														onClick: () => setEditSubject(editSubject === s.id ? null : s.id),
														children: editSubject === s.id ? "Close" : "Edit"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "ghost",
														onClick: () => void run(() => removeRow({ data: {
															table: "subjects",
															id: s.id
														} }), "Deleted"),
														children: "Delete"
													})]
												})]
											}), editSubject === s.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
												className: "mt-3 grid gap-3 rounded-2xl bg-background p-4 sm:grid-cols-2",
												onSubmit: (e) => {
													e.preventDefault();
													const f = new FormData(e.currentTarget);
													run(() => upsertSubject({ data: {
														id: s.id,
														name: String(f.get("name")),
														slug: String(f.get("slug")),
														class_level: Number(f.get("class_level")),
														description: String(f.get("description") ?? "") || null,
														order_index: Number(f.get("order_index") ?? 0),
														published: f.get("published") === "on"
													} }), "Subject updated").then(() => setEditSubject(null));
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															name: "name",
															required: true,
															defaultValue: s.name
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Slug" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															name: "slug",
															required: true,
															defaultValue: s.slug
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Class" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
															name: "class_level",
															defaultValue: s.class_level,
															className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
															children: ACTIVE_CLASS_LEVELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																value: c,
																children: classLabel(c)
															}, c))
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															name: "order_index",
															type: "number",
															defaultValue: s.order_index
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5 sm:col-span-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
															name: "description",
															rows: 2,
															defaultValue: s.description ?? ""
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														className: "flex items-center gap-2 text-sm sm:col-span-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															name: "published",
															defaultChecked: s.published,
															className: "size-4"
														}), "Published"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "submit",
														disabled: busy,
														className: "rounded-full sm:col-span-2",
														children: "Save changes"
													})
												]
											})]
										}, s.id))
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "rounded-3xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "font-display text-lg",
										children: "New chapter"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Add a chapter to a subject." })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "grid gap-3 sm:grid-cols-2",
									onSubmit: (e) => {
										e.preventDefault();
										const f = new FormData(e.currentTarget);
										run(() => upsertChapter({ data: {
											subject_id: String(f.get("subject_id")),
											title: String(f.get("title")),
											slug: String(f.get("slug")),
											description: String(f.get("description") ?? ""),
											order_index: Number(f.get("order_index") ?? 0),
											published: true
										} }), "Chapter saved");
										e.target.reset();
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Subject" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												name: "subject_id",
												required: true,
												className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
												children: data.subjects.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: s.id,
													children: s.name
												}, s.id))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "order_index",
												type: "number",
												defaultValue: chapters.length + 1
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "title",
												required: true,
												onBlur: (e) => {
													const slug = e.currentTarget.form?.elements.namedItem("slug");
													if (slug && !slug.value) slug.value = slugify(e.currentTarget.value);
												}
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Slug" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "slug",
												required: true,
												placeholder: "matter-around-us"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5 sm:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiAutofill, { mode: "chapter" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												name: "description",
												rows: 2
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											disabled: busy,
											className: "rounded-full sm:col-span-2",
											children: "Save chapter"
										})
									]
								}) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "rounded-3xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "font-display text-lg",
										children: "New lesson"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Audio, video, summary or PDF notes." })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "grid gap-3 sm:grid-cols-2",
									onSubmit: (e) => {
										e.preventDefault();
										const f = new FormData(e.currentTarget);
										run(() => upsertLesson({ data: {
											chapter_id: String(f.get("chapter_id")),
											title: String(f.get("title")),
											kind: String(f.get("kind")),
											audio_url: String(f.get("audio_url") ?? "") || null,
											video_url: String(f.get("video_url") ?? "") || null,
											pdf_url: String(f.get("pdf_url") ?? "") || null,
											summary: String(f.get("summary") ?? "") || null,
											duration_minutes: Number(f.get("duration_minutes") ?? 10),
											order_index: Number(f.get("order_index") ?? 1),
											published: true
										} }), "Lesson saved");
										e.target.reset();
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Chapter" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												name: "chapter_id",
												required: true,
												className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
												children: chapters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: c.id,
													children: c.title
												}, c.id))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Kind" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												name: "kind",
												className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "audio",
														children: "Audio"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "video",
														children: "Video"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "summary",
														children: "Summary"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "pdf",
														children: "PDF notes"
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "title",
												required: true
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "order_index",
												type: "number",
												defaultValue: 1
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaInput, {
											name: "audio_url",
											label: "Audio (link or upload)",
											accept: "audio/*",
											folder: "audio"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaInput, {
											name: "video_url",
											label: "Video (link or upload)",
											accept: "video/*",
											folder: "video"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaInput, {
											name: "pdf_url",
											label: "PDF notes (link or upload)",
											accept: "application/pdf",
											folder: "pdf"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Duration (min)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												name: "duration_minutes",
												type: "number",
												defaultValue: 10
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5 sm:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Summary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiAutofill, { mode: "lesson" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												name: "summary",
												rows: 4
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											disabled: busy,
											className: "rounded-full sm:col-span-2",
											children: "Save lesson"
										})
									]
								}) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "rounded-3xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "font-display text-lg",
										children: "Published content"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Edit or delete chapters and lessons." })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "space-y-3",
									children: chapters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-2xl bg-secondary p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold",
													children: c.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex shrink-0 items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														className: "rounded-full",
														onClick: () => setEditChapter(editChapter === c.id ? null : c.id),
														children: editChapter === c.id ? "Close" : "Edit"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "ghost",
														onClick: () => void run(() => removeRow({ data: {
															table: "chapters",
															id: c.id
														} }), "Deleted"),
														children: "Delete"
													})]
												})]
											}),
											editChapter === c.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
												className: "mt-3 grid gap-3 rounded-2xl bg-background p-4 sm:grid-cols-2",
												onSubmit: (e) => {
													e.preventDefault();
													const f = new FormData(e.currentTarget);
													run(() => upsertChapter({ data: {
														id: c.id,
														subject_id: String(f.get("subject_id")),
														title: String(f.get("title")),
														slug: String(f.get("slug")),
														description: String(f.get("description") ?? ""),
														order_index: Number(f.get("order_index") ?? 0),
														published: f.get("published") === "on"
													} }), "Chapter updated").then(() => setEditChapter(null));
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Subject" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
															name: "subject_id",
															defaultValue: c.subject_id,
															className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
															children: data.subjects.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																value: s.id,
																children: s.name
															}, s.id))
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															name: "order_index",
															type: "number",
															defaultValue: c.order_index
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															name: "title",
															required: true,
															defaultValue: c.title
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Slug" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															name: "slug",
															required: true,
															defaultValue: c.slug
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5 sm:col-span-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex flex-wrap items-center justify-between gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiAutofill, {
																mode: "chapter",
																label: "Auto-generate"
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
															name: "description",
															rows: 2,
															defaultValue: c.description ?? ""
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														className: "flex items-center gap-2 text-sm sm:col-span-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															name: "published",
															defaultChecked: c.published,
															className: "size-4"
														}), "Published"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "submit",
														disabled: busy,
														className: "rounded-full sm:col-span-2",
														children: "Save changes"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-3 space-y-2",
												children: data.lessons.filter((l) => l.chapter_id === c.id).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-2xl bg-background/70 p-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "text-sm",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																variant: "outline",
																className: "mr-2 rounded-full text-xs",
																children: l.kind
															}), l.title]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex shrink-0 items-center gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																size: "sm",
																variant: "outline",
																className: "rounded-full",
																onClick: () => setEditLesson(editLesson === l.id ? null : l.id),
																children: editLesson === l.id ? "Close" : "Edit"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																size: "sm",
																variant: "ghost",
																onClick: () => void run(() => removeRow({ data: {
																	table: "lessons",
																	id: l.id
																} }), "Deleted"),
																children: "Delete"
															})]
														})]
													}), editLesson === l.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
														className: "mt-3 grid gap-3 sm:grid-cols-2",
														onSubmit: (e) => {
															e.preventDefault();
															const f = new FormData(e.currentTarget);
															run(() => upsertLesson({ data: {
																id: l.id,
																chapter_id: String(f.get("chapter_id")),
																title: String(f.get("title")),
																kind: String(f.get("kind")),
																audio_url: String(f.get("audio_url") ?? "") || null,
																video_url: String(f.get("video_url") ?? "") || null,
																pdf_url: String(f.get("pdf_url") ?? "") || null,
																summary: String(f.get("summary") ?? "") || null,
																duration_minutes: Number(f.get("duration_minutes") ?? 10),
																order_index: Number(f.get("order_index") ?? 1),
																published: f.get("published") === "on"
															} }), "Lesson updated").then(() => setEditLesson(null));
														},
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1.5",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Chapter" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
																	name: "chapter_id",
																	defaultValue: l.chapter_id,
																	className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
																	children: chapters.map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																		value: ch.id,
																		children: ch.title
																	}, ch.id))
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1.5",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Kind" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
																	name: "kind",
																	defaultValue: l.kind,
																	className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
																	children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																			value: "audio",
																			children: "Audio"
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																			value: "video",
																			children: "Video"
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																			value: "summary",
																			children: "Summary"
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																			value: "pdf",
																			children: "PDF notes"
																		})
																	]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1.5",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	name: "title",
																	required: true,
																	defaultValue: l.title
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1.5",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	name: "order_index",
																	type: "number",
																	defaultValue: l.order_index
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaInput, {
																name: "audio_url",
																label: "Audio (link or upload)",
																accept: "audio/*",
																folder: "audio",
																defaultValue: l.audio_url ?? ""
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaInput, {
																name: "video_url",
																label: "Video (link or upload)",
																accept: "video/*",
																folder: "video",
																defaultValue: l.video_url ?? ""
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaInput, {
																name: "pdf_url",
																label: "PDF notes (link or upload)",
																accept: "application/pdf",
																folder: "pdf",
																defaultValue: l.pdf_url ?? ""
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1.5",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Duration (min)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	name: "duration_minutes",
																	type: "number",
																	defaultValue: l.duration_minutes
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1.5 sm:col-span-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex flex-wrap items-center justify-between gap-2",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Summary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiAutofill, {
																		mode: "lesson",
																		label: "Auto-generate"
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
																	name: "summary",
																	rows: 4,
																	defaultValue: l.summary ?? ""
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																className: "flex items-center gap-2 text-sm sm:col-span-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																	type: "checkbox",
																	name: "published",
																	defaultChecked: l.published,
																	className: "size-4"
																}), "Published"]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																type: "submit",
																disabled: busy,
																className: "rounded-full sm:col-span-2",
																children: "Save changes"
															})
														]
													})]
												}, l.id))
											})
										]
									}, c.id))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "questions",
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "rounded-3xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
									className: "pb-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "font-display text-lg",
										children: "Pick a chapter test"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: activeChapter?.id ?? "",
										onChange: (e) => setChapterId(e.target.value),
										className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
										children: chapters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c.id,
											children: c.title
										}, c.id))
									}), activeTest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted-foreground",
										children: [
											"Test: ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-foreground",
												children: activeTest.title
											}),
											" ·",
											" ",
											activeTest.questionCount,
											" questions"
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "No test yet for this chapter."
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											className: "rounded-full",
											disabled: !activeChapter || busy,
											onClick: () => activeChapter && void run(() => upsertTest({ data: {
												chapter_id: activeChapter.id,
												title: `${activeChapter.title} — Test`,
												duration_minutes: 15,
												published: true
											} }), "Test created"),
											children: "Create test"
										})]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "rounded-3xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "font-display text-lg",
										children: "Add questions"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Form, JSON, Markdown or AI — review before saving." })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
									defaultValue: "manual",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
											className: "rounded-full",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
													value: "manual",
													className: "rounded-full",
													children: "Manual"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
													value: "json",
													className: "rounded-full",
													children: "JSON"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
													value: "markdown",
													className: "rounded-full",
													children: "Markdown"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
													value: "ai",
													className: "rounded-full",
													children: "AI"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
											value: "manual",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualForm, { onAdd: (q) => setDrafts((d) => [...d, q]) })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
											value: "json",
											className: "space-y-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												rows: 10,
												value: raw,
												onChange: (e) => setRaw(e.target.value),
												placeholder: JSON_EXAMPLE,
												className: "font-mono text-xs"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "rounded-full",
												onClick: () => loadDrafts(parseJsonQuestions(raw)),
												children: "Parse JSON"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
											value: "markdown",
											className: "space-y-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												rows: 10,
												value: raw,
												onChange: (e) => setRaw(e.target.value),
												placeholder: MARKDOWN_EXAMPLE,
												className: "font-mono text-xs"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "rounded-full",
												onClick: () => loadDrafts(parseMarkdownQuestions(raw)),
												children: "Parse Markdown"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
											value: "ai",
											className: "space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid gap-3 sm:grid-cols-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "How many" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: 1,
															max: 20,
															value: aiCount,
															onChange: (e) => setAiCount(Number(e.target.value))
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Difficulty" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
															value: aiDifficulty,
															onChange: (e) => setAiDifficulty(e.target.value),
															className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																	value: "easy",
																	children: "Easy"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																	value: "medium",
																	children: "Medium"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																	value: "hard",
																	children: "Hard"
																})
															]
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													rows: 5,
													value: aiSource,
													onChange: (e) => setAiSource(e.target.value),
													placeholder: "Optional: paste source text. Leave empty to use chapter summaries."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													className: "rounded-full",
													disabled: busy || !activeChapter,
													onClick: async () => {
														if (!activeChapter) return;
														setBusy(true);
														try {
															const qs = await aiGenerate({ data: {
																chapterId: activeChapter.id,
																count: aiCount,
																difficulty: aiDifficulty,
																sourceText: aiSource
															} });
															setDrafts(qs);
															toast.success(`${qs.length} questions drafted — review below`);
														} catch (e) {
															toast.error(e instanceof Error ? e.message : "AI failed");
														} finally {
															setBusy(false);
														}
													},
													children: busy ? "Generating…" : "Generate with AI"
												})
											]
										})
									]
								}) })]
							}),
							drafts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "rounded-3xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
									className: "pb-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
										className: "font-display text-lg",
										children: [
											"Review ",
											drafts.length,
											" questions"
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "space-y-3",
									children: [drafts.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-2xl bg-secondary p-4 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-medium",
													children: [
														i + 1,
														". ",
														d.prompt
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => setDrafts((prev) => prev.filter((_, x) => x !== i)),
													children: "Remove"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "mt-2 space-y-1",
												children: d.options.map((o, oi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: oi === d.correctIndex ? "font-semibold text-accent" : "text-muted-foreground",
													children: [oi === d.correctIndex ? "✓ " : "• ", o]
												}, oi))
											}),
											d.explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-muted-foreground",
												children: d.explanation
											})
										]
									}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "rounded-full",
										onClick: saveDrafts,
										disabled: busy || !activeTest,
										children: "Save all to test"
									})]
								})]
							})
						]
					})
				]
			})
		]
	});
}
function ManualForm({ onAdd }) {
	const [options, setOptions] = (0, import_react.useState)([
		"",
		"",
		"",
		""
	]);
	const [correct, setCorrect] = (0, import_react.useState)(0);
	const [prompt, setPrompt] = (0, import_react.useState)("");
	const [explanation, setExplanation] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 space-y-3",
		onSubmit: (e) => {
			e.preventDefault();
			onAdd({
				prompt,
				options,
				correctIndex: correct,
				explanation,
				topic
			});
			setPrompt("");
			setOptions([
				"",
				"",
				"",
				""
			]);
			setExplanation("");
			setCorrect(0);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Question" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 2,
					required: true,
					value: prompt,
					onChange: (e) => setPrompt(e.target.value)
				})]
			}),
			options.map((opt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					required: true,
					value: opt,
					placeholder: `Option ${i + 1}`,
					onChange: (e) => setOptions((o) => o.map((v, x) => x === i ? e.target.value : v))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: correct === i,
						onCheckedChange: () => setCorrect(i)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Correct"
					})]
				})]
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Topic" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: topic,
						onChange: (e) => setTopic(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Explanation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: explanation,
						onChange: (e) => setExplanation(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "rounded-full",
				children: "Add to review list"
			})
		]
	});
}
function Shell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-5xl px-4 py-16 text-muted-foreground",
		children
	});
}
//#endregion
export { TeachPage as component };
