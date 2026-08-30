import { i as __toESM } from "../__23tanstack-start-server-fn-resolver-CNPxipnW.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CREDIT_REWARDS } from "./credits-CWoRelbL.mjs";
import { t as cn } from "./utils-wh7lFpBf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as getPublicLessonAccess, l as unlockLesson, n as getLessonAccess, s as recordStudySeconds, u as useAuth } from "./use-auth-C4zefxXX.mjs";
import { t as Button } from "./button-DX7xRgfx.mjs";
import { t as Card } from "./card-1mG_7G-8.mjs";
import { i as useQuery, o as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as getChapterProgress, t as completeLesson } from "./learn.functions-Drja1DJ7.mjs";
import { n as listLessonBookmarks, s as toggleLessonBookmark } from "./revision.functions-CnvB7jO2.mjs";
import { t as Progress } from "./progress-CbDmaPRw.mjs";
import { A as Bookmark, C as ExternalLink, E as Circle, M as BookmarkCheck, N as BookOpen, O as CirclePlay, S as FileText, T as Coins, b as Gauge, c as Sparkles, h as LoaderCircle, k as CircleCheck, m as LockOpen, p as Lock, v as Headphones } from "../_libs/lucide-react.mjs";
import { t as Route } from "./learn._slug-BpsB8_F_.mjs";
import { n as resolveMediaUrl, t as isStorageRef } from "./storage-CweImSLh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn._slug-D-u_TG3J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Counts study seconds for a lesson and flushes them to the server every 60s.
* `active` should only be true while the student is actually watching/listening.
*/
function useStudyHeartbeat(lessonId, active, enabled) {
	const seconds = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!lessonId || !enabled) return;
		const flush = () => {
			const value = seconds.current;
			if (value < 20) return;
			seconds.current = 0;
			recordStudySeconds({ data: {
				lessonId,
				seconds: value
			} }).catch(() => {});
		};
		const tick = window.setInterval(() => {
			if (!active) return;
			if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
			seconds.current += 5;
			if (seconds.current >= 60) flush();
		}, 5e3);
		return () => {
			window.clearInterval(tick);
			flush();
		};
	}, [
		lessonId,
		active,
		enabled
	]);
}
var YT = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{6,})/;
var DRIVE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/;
var FILE_EXT = /\.(mp3|m4a|wav|ogg|oga|aac|flac|mp4|webm|mov|m4v|pdf)(\?|#|$)/i;
/**
* Figures out how a pasted link (or an uploaded storage file) should be played:
* an embedded iframe, a native <audio>/<video> element, or a plain outbound link.
*/
function classifyMedia(rawUrl, kind) {
	const url = rawUrl.trim();
	if (isStorageRef(rawUrl)) return kind === "pdf" ? {
		mode: "link",
		src: url
	} : {
		mode: "native",
		src: url
	};
	const yt = url.match(YT);
	if (yt) return {
		mode: "iframe",
		src: `https://www.youtube.com/embed/${yt[1]}?rel=0`,
		provider: "youtube"
	};
	if (url.includes("vimeo.com")) {
		const id = url.split("?")[0].split("/").filter(Boolean).pop();
		return {
			mode: "iframe",
			src: id ? `https://player.vimeo.com/video/${id}` : url,
			provider: "vimeo"
		};
	}
	const drive = url.match(DRIVE);
	if (drive) return {
		mode: "iframe",
		src: `https://drive.google.com/file/d/${drive[1]}/preview`,
		provider: "drive"
	};
	if (FILE_EXT.test(url)) return kind === "pdf" ? {
		mode: "link",
		src: url
	} : {
		mode: "native",
		src: url
	};
	return kind === "pdf" ? {
		mode: "link",
		src: url
	} : {
		mode: "native",
		src: url
	};
}
var PLAYBACK_RATES = [
	.75,
	1,
	1.25,
	1.5,
	1.75,
	2
];
function SpeedPicker({ rate, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mr-1 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-3.5" }), " Speed"]
		}), PLAYBACK_RATES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onChange(r),
			className: cn("rounded-full border border-border px-2.5 py-1 text-xs font-bold transition-colors", rate === r ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"),
			children: [r, "×"]
		}, r))]
	});
}
function ActiveReporter({ onActiveChange }) {
	(0, import_react.useEffect)(() => {
		onActiveChange?.(true);
		return () => onActiveChange?.(false);
	}, [onActiveChange]);
	return null;
}
/** Plays external links (YouTube/Vimeo/Drive/direct files) or uploaded storage files. */
function MediaPlayer({ value, title, kind, onActiveChange }) {
	const stored = isStorageRef(value);
	const [url, setUrl] = (0, import_react.useState)(stored ? null : value);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [rate, setRate] = (0, import_react.useState)(1);
	const mediaRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!stored) {
			setUrl(value);
			setFailed(false);
			return;
		}
		let alive = true;
		setUrl(null);
		setFailed(false);
		resolveMediaUrl(value).then((resolved) => {
			if (!alive) return;
			if (resolved) setUrl(resolved);
			else setFailed(true);
		});
		return () => {
			alive = false;
		};
	}, [value, stored]);
	(0, import_react.useEffect)(() => {
		if (mediaRef.current) mediaRef.current.playbackRate = rate;
	}, [rate, url]);
	if (failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Sign in to open this uploaded file."
	});
	if (!url) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "flex items-center gap-2 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Loading media…"]
	});
	const source = stored ? kind === "pdf" ? {
		mode: "link",
		src: url
	} : {
		mode: "native",
		src: url
	} : classifyMedia(url, kind);
	if (source.mode === "iframe") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			kind !== "pdf" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveReporter, { onActiveChange }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("w-full overflow-hidden rounded-2xl bg-secondary", kind === "pdf" ? "h-[70vh] min-h-80" : kind === "audio" ? "aspect-video sm:aspect-[16/7]" : "aspect-video"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					src: source.src,
					title,
					allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
					allowFullScreen: true,
					className: "size-full"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Use the player's own settings menu to change speed on",
					" ",
					source.provider === "youtube" ? "YouTube" : source.provider === "vimeo" ? "Vimeo" : "this",
					" content.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: url,
						target: "_blank",
						rel: "noreferrer",
						className: "font-semibold underline",
						children: "Open original"
					})
				]
			})
		]
	});
	if (source.mode === "link") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			className: "w-fit rounded-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: source.src,
				target: "_blank",
				rel: "noreferrer",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }),
					" Open ",
					kind === "pdf" ? "PDF notes" : "file"
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: source.src,
			target: "_blank",
			rel: "noreferrer",
			className: "inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" }), " New tab"]
		})]
	});
	if (kind === "audio") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
			ref: mediaRef,
			controls: true,
			src: source.src,
			className: "w-full",
			onPlay: () => onActiveChange?.(true),
			onPause: () => onActiveChange?.(false),
			onEnded: () => onActiveChange?.(false),
			onLoadedMetadata: (e) => {
				e.currentTarget.playbackRate = rate;
			},
			children: "Your browser does not support audio playback."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeedPicker, {
			rate,
			onChange: setRate
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "aspect-video w-full overflow-hidden rounded-2xl bg-secondary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: mediaRef,
				controls: true,
				playsInline: true,
				src: source.src,
				className: "size-full",
				onPlay: () => onActiveChange?.(true),
				onPause: () => onActiveChange?.(false),
				onEnded: () => onActiveChange?.(false),
				onLoadedMetadata: (e) => {
					e.currentTarget.playbackRate = rate;
				}
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeedPicker, {
			rate,
			onChange: setRate
		})]
	});
}
var KIND_META = {
	audio: {
		icon: Headphones,
		label: "Audio lecture"
	},
	video: {
		icon: CirclePlay,
		label: "Video lecture"
	},
	summary: {
		icon: BookOpen,
		label: "Quick summary"
	},
	pdf: {
		icon: FileText,
		label: "PDF notes"
	}
};
function ChapterPage() {
	const loaderData = Route.useLoaderData();
	const chapter = loaderData.chapter;
	const test = loaderData.test;
	const lessons = loaderData.lessons;
	const { user, refresh } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [activeId, setActiveId] = (0, import_react.useState)(lessons[0]?.id ?? null);
	const progressQuery = useQuery({
		queryKey: [
			"chapter-progress",
			chapter.id,
			user?.id
		],
		queryFn: () => getChapterProgress({ data: { chapterId: chapter.id } }),
		enabled: Boolean(user)
	});
	const done = new Set(progressQuery.data ?? []);
	const percent = lessons.length ? Math.round(done.size / lessons.length * 100) : 0;
	const complete = useMutation({
		mutationFn: (lessonId) => completeLesson({ data: { lessonId } }),
		onSuccess: (result) => {
			progressQuery.refetch();
			refresh();
			if (result.alreadyDone) toast("Already completed ✓");
			else toast.success(`Nice! +${result.xp} XP · +${result.credits} credits`);
		},
		onError: (error) => toast.error(error.message)
	});
	const unlock = useMutation({
		mutationFn: (lessonId) => unlockLesson({ data: { lessonId } }),
		onSuccess: (access) => {
			queryClient.invalidateQueries({ queryKey: ["lesson-access"] });
			refresh();
			toast.success(`Unlocked! −${access.cost} credits · yours forever`);
		},
		onError: (error) => toast.error(error.message)
	});
	const active = lessons.find((l) => l.id === activeId) ?? lessons[0] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-6xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/learn",
				className: "text-sm font-semibold text-muted-foreground hover:text-foreground",
				children: "← All chapters"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold md:text-4xl",
					children: chapter.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-muted-foreground",
					children: chapter.description
				})] }), test && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					className: "rounded-full shadow-glow",
					onClick: () => user ? navigate({
						to: "/test/$testId",
						params: { testId: test.id }
					}) : navigate({ to: "/auth" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " Take the test · free"]
				})]
			}),
			user && lessons.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Chapter progress" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-primary",
						children: [percent, "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: percent,
					className: "mt-2 h-2.5"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 lg:grid-cols-[320px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [lessons.map((lesson, index) => {
						const meta = KIND_META[lesson.kind] ?? KIND_META.summary;
						const isDone = done.has(lesson.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setActiveId(lesson.id),
							className: cn("flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-left transition-colors hover:border-primary/50", active?.id === lesson.id && "border-primary bg-primary/8"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-xs font-semibold uppercase tracking-wide text-muted-foreground",
											children: [
												"Step ",
												index + 1,
												" · ",
												meta.label
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate font-semibold",
											children: lesson.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block text-xs font-semibold text-accent",
											children: lesson.isFree ? "Free" : "Costs credits"
										})
									]
								}),
								isDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 shrink-0 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-5 shrink-0 text-muted-foreground/40" })
							]
						}, lesson.id);
					}), lessons.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "rounded-2xl p-6 text-sm text-muted-foreground",
						children: "No lessons published for this chapter yet."
					})]
				}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "shadow-card gap-5 rounded-3xl border-border/70 p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LessonPanel, {
						lesson: active,
						done: done.has(active.id),
						pending: complete.isPending,
						signedIn: Boolean(user),
						userId: user?.id ?? null,
						unlocking: unlock.isPending,
						onUnlock: () => unlock.mutate(active.id),
						onComplete: () => complete.mutate(active.id)
					}, active.id)
				})]
			})
		]
	});
}
function LessonPanel({ lesson, done, pending, signedIn, userId, unlocking, onUnlock, onComplete }) {
	const [watching, setWatching] = (0, import_react.useState)(false);
	const onActiveChange = (0, import_react.useCallback)((value) => setWatching(value), []);
	const accessQuery = useQuery({
		queryKey: [
			"lesson-access",
			lesson.id,
			userId
		],
		queryFn: () => userId ? getLessonAccess({ data: { lessonId: lesson.id } }) : getPublicLessonAccess({ data: { lessonId: lesson.id } })
	});
	const access = accessQuery.data ?? null;
	const media = access?.media ?? null;
	const locked = access ? access.locked : !lesson.isFree;
	useStudyHeartbeat(lesson.id, watching, Boolean(userId) && !locked);
	(0, import_react.useEffect)(() => {
		if (locked) setWatching(false);
	}, [locked]);
	const tabs = [];
	if (media?.audio) tabs.push({
		key: "audio",
		label: "Audio",
		icon: Headphones,
		hint: "Listen to the lecture",
		render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaPlayer, {
			value: media.audio,
			title: lesson.title,
			kind: "audio",
			onActiveChange
		})
	});
	if (media?.video) tabs.push({
		key: "video",
		label: "Video",
		icon: CirclePlay,
		hint: "Watch the explanation",
		render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaPlayer, {
			value: media.video,
			title: lesson.title,
			kind: "video",
			onActiveChange
		})
	});
	if (lesson.summary) tabs.push({
		key: "summary",
		label: "Summary",
		icon: BookOpen,
		hint: "Revise the key points — always free",
		render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "whitespace-pre-wrap rounded-2xl bg-secondary/50 p-5 text-[15px] leading-relaxed text-foreground/90",
			children: lesson.summary
		})
	});
	if (media?.pdf) tabs.push({
		key: "pdf",
		label: "Notes",
		icon: FileText,
		hint: "Open the PDF notes",
		render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaPlayer, {
			value: media.pdf,
			title: lesson.title,
			kind: "pdf"
		})
	});
	const [tabKey, setTabKey] = (0, import_react.useState)("");
	const activeTab = tabs.find((t) => t.key === tabKey) ?? tabs[0] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase tracking-wide text-primary",
						children: (KIND_META[lesson.kind] ?? KIND_META.summary).label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: lesson.title
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground",
					children: [
						"~",
						lesson.duration_minutes ?? 10,
						" min"
					]
				})]
			}),
			tabs.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 rounded-2xl bg-secondary/60 p-1.5",
				children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTabKey(tab.key),
					className: cn("flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all", activeTab?.key === tab.key ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tab.icon, { className: "size-4 shrink-0" }), tab.label]
				}, tab.key))
			}),
			locked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mt-3 font-display text-lg font-bold",
						children: [
							"Unlock this lesson for ",
							access?.cost ?? 0,
							" credits"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mx-auto mt-1 max-w-sm text-sm text-muted-foreground",
						children: [
							"Unlock once, keep it forever. You earn ",
							CREDIT_REWARDS.lessonComplete,
							" credits for every lesson you finish, ",
							CREDIT_REWARDS.dailyLogin,
							" for visiting daily and ",
							CREDIT_REWARDS.referral,
							" for each friend you invite."
						]
					}),
					signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "rounded-full",
							disabled: unlocking || accessQuery.isLoading,
							onClick: onUnlock,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-4" }),
								" Unlock for ",
								access?.cost ?? 0,
								" credits"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-3.5" }),
								" Balance: ",
								access?.balance ?? 0,
								" credits ·",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/wallet",
									className: "text-primary underline-offset-4 hover:underline",
									children: "earn more"
								})
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-4 rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/auth",
							children: [
								"Sign in — get ",
								CREDIT_REWARDS.welcome,
								" free credits"
							]
						})
					})
				]
			}),
			activeTab ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: activeTab.hint
				}), activeTab.render()]
			}) : !locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl bg-secondary/50 p-5 text-sm text-muted-foreground",
				children: "No media has been added to this lesson yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3 border-t border-border/70 pt-4",
				children: [
					signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "rounded-full",
						disabled: pending || done,
						onClick: onComplete,
						children: done ? "Completed ✓" : `Mark complete · +10 XP · +${CREDIT_REWARDS.lessonComplete} credits`
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							children: "Sign in to track progress"
						})
					}),
					signedIn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitAgainButton, {
						lessonId: lesson.id,
						resource: activeTab?.key ?? "lesson"
					}),
					watching && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-semibold text-accent",
						children: [
							"Counting study time · +",
							CREDIT_REWARDS.studyBlock,
							" credits every 10 min"
						]
					})
				]
			})
		]
	});
}
function VisitAgainButton({ lessonId, resource }) {
	const queryClient = useQueryClient();
	const [note, setNote] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const bookmarks = useQuery({
		queryKey: ["lesson-bookmarks", lessonId],
		queryFn: () => listLessonBookmarks({ data: { lessonIds: [lessonId] } })
	});
	const marked = (bookmarks.data ?? []).includes(`${lessonId}:${resource}`);
	const toggle = useMutation({
		mutationFn: () => toggleLessonBookmark({ data: {
			lessonId,
			resource,
			note
		} }),
		onSuccess: (res) => {
			setOpen(false);
			setNote("");
			bookmarks.refetch();
			queryClient.invalidateQueries({ queryKey: ["revision"] });
			toast.success(res.bookmarked ? "Added to Visit again" : "Removed from Visit again");
		},
		onError: (error) => toast.error(error.message)
	});
	if (marked) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "secondary",
		className: "rounded-full",
		disabled: toggle.isPending,
		onClick: () => toggle.mutate(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "size-4" }), " Saved to Visit again"]
	});
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		variant: "outline",
		className: "rounded-full",
		onClick: () => setOpen(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" }), " Visit again"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex w-full flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: note,
				onChange: (e) => setNote(e.target.value),
				placeholder: "What felt confusing? (optional)",
				className: "min-w-[200px] flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "rounded-full",
				disabled: toggle.isPending,
				onClick: () => toggle.mutate(),
				children: "Save"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "rounded-full",
				onClick: () => setOpen(false),
				children: "Cancel"
			})
		]
	});
}
//#endregion
export { ChapterPage as component };
