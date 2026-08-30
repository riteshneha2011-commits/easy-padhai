import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAdminCatalog,
  saveChapter,
  saveSubject,
  saveLesson,
  saveTest,
  addQuestions,
  generateQuestions,
  deleteRow,
} from "@/lib/admin.functions";
import {
  parseJsonQuestions,
  parseMarkdownQuestions,
  JSON_EXAMPLE,
  MARKDOWN_EXAMPLE,
  type DraftQuestion,
} from "@/lib/questions-parse";
import { useAuth } from "@/hooks/use-auth";
import { MediaInput } from "@/components/media-input";
import { AiAutofill } from "@/components/ai-autofill";
import { slugify } from "@/lib/slug";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { Switch } from "@/components/ui/switch";
import { ACTIVE_CLASS_LABEL, ACTIVE_CLASS_LEVELS, UPCOMING_CLASS_LABEL, classLabel } from "@/lib/classes";
import { soundFx } from "@/lib/sound-effects";
import {
  Sparkles,
  Wand2,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  BookOpen,
  Brain,
  Globe,
  Check,
  RefreshCw,
  HelpCircle,
} from "lucide-react";


export const Route = createFileRoute("/teach")({
  head: () => ({
    meta: [
      { title: "Studio — Easy Padhai" },
      {
        name: "description",
        content: "Teacher studio: publish chapters, lessons and objective tests, and build questions fast.",
      },
      { property: "og:title", content: "Studio — Easy Padhai" },
      {
        property: "og:description",
        content: "Add chapters, lessons and MCQs by form, JSON, Markdown or AI generation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeachPage,
});

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

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-catalog"],
    queryFn: () => fetchCatalog(),
    enabled: Boolean(user) && isStaff,
  });

  const [chapterId, setChapterId] = useState("");
  const [quizScope, setQuizScope] = useState<"chapter" | "lesson">("lesson");
  const [qLessonId, setQLessonId] = useState("");
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [raw, setRaw] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState("mixed");
  const [aiLanguage, setAiLanguage] = useState<"hindi" | "english" | "hinglish">("hindi");
  const [aiUseSummary, setAiUseSummary] = useState(true);
  const [aiUseLessons, setAiUseLessons] = useState(true);
  const [aiCustomNotes, setAiCustomNotes] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [qSubjectId, setQSubjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [editChapter, setEditChapter] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState<string | null>(null);

  const [newLessonSubjectId, setNewLessonSubjectId] = useState("");
  const [newLessonChapterId, setNewLessonChapterId] = useState("");
  const [newLessonOrder, setNewLessonOrder] = useState<number>(1);
  const [newLessonKey, setNewLessonKey] = useState(0);

  const [newChapterSubjectId, setNewChapterSubjectId] = useState("");
  const [newChapterOrder, setNewChapterOrder] = useState<number>(1);
  const [newChapterKey, setNewChapterKey] = useState(0);

  const effectiveLessonSubjectId = newLessonSubjectId || data?.subjects?.[0]?.id || "";
  const availableChaptersForNewLesson = data?.chapters?.filter((c) => c.subject_id === effectiveLessonSubjectId) || [];
  const effectiveChapterId = newLessonChapterId && availableChaptersForNewLesson.some((c) => c.id === newLessonChapterId)
    ? newLessonChapterId
    : (availableChaptersForNewLesson[0]?.id || "");
  const effectiveSubjectId = newChapterSubjectId || data?.subjects?.[0]?.id || "";

  const effectiveQSubjectId = qSubjectId || data?.subjects?.[0]?.id || "";
  const availableChaptersForQuiz = data?.chapters?.filter((c) => c.subject_id === effectiveQSubjectId) || [];
  const effectiveQChapterId = chapterId && availableChaptersForQuiz.some((c) => c.id === chapterId)
    ? chapterId
    : (availableChaptersForQuiz[0]?.id || "");
  const activeChapter = data?.chapters?.find((c) => c.id === effectiveQChapterId) ?? data?.chapters?.[0] ?? null;

  const availableLessonsForQuiz = data?.lessons?.filter((l) => l.chapter_id === activeChapter?.id) || [];
  const effectiveQLessonId = qLessonId && availableLessonsForQuiz.some((l) => l.id === qLessonId)
    ? qLessonId
    : (availableLessonsForQuiz[0]?.id || "");
  const activeLesson = availableLessonsForQuiz.find((l) => l.id === effectiveQLessonId) ?? availableLessonsForQuiz[0] ?? null;

  const activeTest = quizScope === "lesson" && activeLesson
    ? (data?.tests?.find((t: any) => t.lesson_id === activeLesson.id) ?? null)
    : (activeChapter ? (data?.tests?.find((t: any) => t.chapter_id === activeChapter.id && !t.lesson_id) ?? null) : null);

  useEffect(() => {
    if (data?.lessons && effectiveChapterId) {
      const chapLessons = data.lessons.filter((l) => l.chapter_id === effectiveChapterId);
      const nextOrder = chapLessons.length > 0
        ? Math.max(...chapLessons.map((l) => l.order_index ?? 0)) + 1
        : 1;
      setNewLessonOrder(nextOrder);
    }
  }, [data?.lessons, effectiveChapterId]);

  useEffect(() => {
    if (data?.chapters && effectiveSubjectId) {
      const subChapters = data.chapters.filter((c) => c.subject_id === effectiveSubjectId);
      const nextOrder = subChapters.length > 0
        ? Math.max(...subChapters.map((c) => c.order_index ?? 0)) + 1
        : 1;
      setNewChapterOrder(nextOrder);
    }
  }, [data?.chapters, effectiveSubjectId]);

  if (loading) return <Shell>Loading…</Shell>;
  if (user && !isStaff) return <Shell>You need a teacher or admin role to open Studio.</Shell>;
  if (isLoading || !data) return <Shell>Loading studio…</Shell>;

  const chapters = data.chapters;

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-catalog"] });

  async function run(fn: () => Promise<unknown>, message: string) {
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

  function loadDrafts(result: { questions: DraftQuestion[]; errors: string[] }) {
    if (result.errors.length) {
      toast.error(result.errors.slice(0, 3).join(" · "));
      return;
    }
    setDrafts(result.questions);
    soundFx.playSuccess();
    toast.success(`${result.questions.length} questions ready to review`);
  }

  async function saveDrafts() {
    if (!activeChapter) return toast.error("Select a chapter first");
    if (quizScope === "lesson" && !activeLesson) return toast.error("Select a lesson first");
    if (drafts.length === 0) return toast.error("No questions to save");
    setBusy(true);
    try {
      let testId = activeTest?.id;
      if (!testId) {
        const title = quizScope === "lesson" && activeLesson
          ? `${activeLesson.title} — Quick Quiz`
          : `${activeChapter.title} — Test`;
        const newTest = await upsertTest({
          data: {
            chapter_id: activeChapter.id,
            lesson_id: quizScope === "lesson" && activeLesson ? activeLesson.id : null,
            title,
            duration_minutes: Math.max(5, drafts.length * 2),
            published: true,
          },
        });
        testId = newTest?.id;
      }
      if (!testId) throw new Error("Could not create test record");

      await insertQuestions({ data: { testId, questions: drafts } });
      await refresh();
      soundFx.playCelebration();
      const targetName = quizScope === "lesson" && activeLesson ? `Lesson "${activeLesson.title}"` : `Chapter "${activeChapter.title}"`;
      toast.success(`🎉 ${drafts.length} questions published for ${targetName}!`);
      setDrafts([]);
      setRaw("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save questions");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Studio</h1>
      <p className="mt-1 text-muted-foreground">Publish content and build tests for {ACTIVE_CLASS_LABEL}.</p>

      <Tabs defaultValue="content" className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="content" className="rounded-full">
            Content
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-full">
            Questions & Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const f = new FormData(form);
                  void run(
                    () =>
                      upsertSubject({
                        data: {
                          name: String(f.get("name") ?? ""),
                          slug: slugify(String(f.get("name") ?? "")),
                          class_level: Number(f.get("class_level") ?? 10),
                          description: String(f.get("description") ?? "") || null,
                          order_index: Number(f.get("order_index") ?? 1),
                          published: true,
                        },
                      }),
                    "Subject saved",
                  );
                  form.reset();
                }}
              >
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input name="name" required placeholder="e.g. Science" />
                </div>
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <select
                    name="class_level"
                    defaultValue={10}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {ACTIVE_CLASS_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {classLabel(lvl)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Short description" />
                </div>
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input name="order_index" type="number" defaultValue={data.subjects.length + 1} />
                </div>
                <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                  Add subject
                </Button>
              </form>

              <div className="mt-4 divide-y">
                {data.subjects.map((s) => (
                  <div key={s.id} className="py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{s.name}</span>{" "}
                        <Badge variant="secondary">{classLabel(s.class_level)}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditSubject(editSubject === s.id ? null : s.id)}
                        >
                          {editSubject === s.id ? "Cancel" : "Edit"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => run(() => removeRow({ data: { table: "subjects", id: s.id } }), "Subject deleted")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    {editSubject === s.id && (
                      <form
                        className="mt-3 grid gap-3 sm:grid-cols-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          void run(
                            () =>
                              upsertSubject({
                                data: {
                                  id: s.id,
                                  name: String(f.get("name") ?? s.name),
                                  slug: slugify(String(f.get("name") ?? s.name)),
                                  class_level: Number(f.get("class_level") ?? s.class_level),
                                  description: String(f.get("description") ?? s.description ?? "") || null,
                                  order_index: Number(f.get("order_index") ?? s.order_index ?? 1),
                                  published: (f.get("published") as string) === "on",
                                },
                              }),
                            "Subject updated",
                          );
                          setEditSubject(null);
                        }}
                      >
                        <div className="space-y-1.5">
                          <Label>Name</Label>
                          <Input name="name" defaultValue={s.name} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Class</Label>
                          <select
                            name="class_level"
                            defaultValue={s.class_level}
                            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                          >
                            {ACTIVE_CLASS_LEVELS.map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {classLabel(lvl)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label>Description</Label>
                          <Input name="description" defaultValue={s.description ?? ""} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Order</Label>
                          <Input name="order_index" type="number" defaultValue={s.order_index ?? 1} />
                        </div>
                        <label className="flex items-center gap-2 text-sm sm:col-span-2">
                          <input type="checkbox" name="published" defaultChecked={s.published} />
                          Published
                        </label>
                        <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                          Save Subject Changes
                        </Button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">New chapter</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                key={`new-chap-${newChapterKey}`}
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const f = new FormData(form);
                  const title = String(f.get("title") ?? "");
                  void run(
                    () =>
                      upsertChapter({
                        data: {
                          subject_id: effectiveSubjectId,
                          title,
                          slug: slugify(title),
                          description: String(f.get("description") ?? "") || null,
                          order_index: newChapterOrder,
                          published: true,
                        },
                      }),
                    "Chapter created",
                  );
                  form.reset();
                  setNewChapterKey((k) => k + 1);
                }}
              >
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <select
                    name="subject_id"
                    value={effectiveSubjectId}
                    onChange={(e) => setNewChapterSubjectId(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input
                    name="order_index"
                    type="number"
                    value={newChapterOrder}
                    onChange={(e) => setNewChapterOrder(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Title</Label>
                  <Input name="title" required placeholder="e.g. Motion" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Short description" />
                </div>
                <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                  Publish chapter
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">New lesson / lecture</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                key={`new-lesson-${newLessonKey}`}
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const f = new FormData(form);
                  void run(
                    () =>
                      upsertLesson({
                        data: {
                          chapter_id: effectiveChapterId,
                          title: String(f.get("title") ?? ""),
                          kind: String(f.get("kind") ?? "audio"),
                          audio_url: String(f.get("audio_url") ?? "") || null,
                          video_url: String(f.get("video_url") ?? "") || null,
                          pdf_url: String(f.get("pdf_url") ?? "") || null,
                          summary: String(f.get("summary") ?? "") || null,
                          duration_minutes: Number(f.get("duration_minutes") ?? 10),
                          order_index: newLessonOrder,
                          published: true,
                        },
                      }),
                    "Lesson published",
                  );
                  form.reset();
                  setNewLessonKey((k) => k + 1);
                }}
              >
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <select
                    value={effectiveLessonSubjectId}
                    onChange={(e) => {
                      setNewLessonSubjectId(e.target.value);
                      const filtered = data.chapters.filter((c) => c.subject_id === e.target.value);
                      if (filtered[0]) setNewLessonChapterId(filtered[0].id);
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Chapter</Label>
                  <select
                    name="chapter_id"
                    value={effectiveChapterId}
                    onChange={(e) => setNewLessonChapterId(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {availableChaptersForNewLesson.length === 0 && (
                      <option value="">No chapters in this subject</option>
                    )}
                    {availableChaptersForNewLesson.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Lesson title</Label>
                  <Input name="title" required placeholder="e.g. Speed vs Velocity" />
                </div>
                <div className="space-y-1.5">
                  <Label>Kind</Label>
                  <select
                    name="kind"
                    defaultValue="audio"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="audio">Audio lecture</option>
                    <option value="video">Video lecture</option>
                    <option value="summary">Summary</option>
                    <option value="pdf">PDF notes</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Duration (min)</Label>
                    <Input name="duration_minutes" type="number" defaultValue={10} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Order</Label>
                    <Input
                      name="order_index"
                      type="number"
                      value={newLessonOrder}
                      onChange={(e) => setNewLessonOrder(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <MediaInput name="audio_url" label="Audio File" type="audio" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <MediaInput name="video_url" label="Video File" type="video" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <MediaInput name="pdf_url" label="PDF Document" type="pdf" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Summary notes</Label>
                  <Input name="summary" placeholder="Bullet summary or key formula" />
                </div>
                <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                  Publish lesson
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {/* Scope Selector: Lesson Quick Check vs Whole Chapter Test */}
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>1. Select Quiz Target & Scope</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quiz Level (Scope)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizScope("lesson");
                      setAiCount(5);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs sm:text-sm font-bold transition-all ${
                      quizScope === "lesson"
                        ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/30"
                        : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>⚡ Lesson Quick Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizScope("chapter");
                      setAiCount(10);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs sm:text-sm font-bold transition-all ${
                      quizScope === "chapter"
                        ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/30"
                        : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>📖 Full Chapter Test</span>
                  </button>
                </div>
              </div>

              <div className={`grid gap-3 ${quizScope === "lesson" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subject</Label>
                  <select
                    value={effectiveQSubjectId}
                    onChange={(e) => {
                      setQSubjectId(e.target.value);
                      const filtered = data.chapters.filter((c) => c.subject_id === e.target.value);
                      if (filtered[0]) setChapterId(filtered[0].id);
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Chapter</Label>
                  <select
                    value={activeChapter?.id ?? ""}
                    onChange={(e) => setChapterId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {availableChaptersForQuiz.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                {quizScope === "lesson" && (
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label className="text-xs font-semibold">Lesson</Label>
                    <select
                      value={activeLesson?.id ?? ""}
                      onChange={(e) => setQLessonId(e.target.value)}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      {availableLessonsForQuiz.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Sparkles className="size-5 text-primary animate-pulse" />
                <span>2. Build Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Button
                type="button"
                disabled={busy || aiGenerating || !activeChapter || (quizScope === "lesson" && !activeLesson)}
                onClick={async () => {
                  if (!activeChapter) return toast.error("Please pick a chapter first");
                  if (quizScope === "lesson" && !activeLesson) return toast.error("Please pick a lesson first");
                  setAiGenerating(true);
                  try {
                    const qs = await aiGenerate({
                      data: {
                        chapterId: activeChapter.id,
                        lessonId: quizScope === "lesson" && activeLesson ? activeLesson.id : null,
                        count: aiCount,
                        difficulty: aiDifficulty,
                        language: aiLanguage,
                        sources: {
                          useSummary: aiUseSummary,
                          useLessons: aiUseLessons,
                          customNotes: aiCustomNotes,
                        },
                      },
                    });
                    setDrafts((prev) => [...prev, ...qs]);
                    toast.success(`✨ ${qs.length} questions generated!`);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "AI generation failed");
                  } finally {
                    setAiGenerating(false);
                  }
                }}
                className="w-full rounded-full"
              >
                {aiGenerating ? "Generating..." : `Generate ${aiCount} Questions with AI ✨`}
              </Button>
            </CardContent>
          </Card>

          {drafts.length > 0 && (
            <Card className="rounded-3xl border-primary/40 bg-gradient-to-b from-primary/5 to-transparent p-5 sm:p-6 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="rounded-full text-xs font-bold text-primary mb-1">
                    Ready to Review & Publish
                  </Badge>
                  <CardTitle className="font-display text-xl sm:text-2xl font-bold">
                    Draft Questions ({drafts.length})
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    You can edit any question, modify options, change the correct answer, or remove questions before publishing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDrafts((prev) => [
                        ...prev,
                        {
                          prompt: "",
                          options: ["", "", "", ""],
                          correctIndex: 0,
                          explanation: "",
                          topic: "",
                          difficulty: "medium",
                        },
                      ]);
                      soundFx.playClick();
                    }}
                    className="rounded-full text-xs gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Blank Question</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all draft questions?")) {
                        setDrafts([]);
                      }
                    }}
                    className="rounded-full text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Question List Cards */}
              <div className="space-y-4">
                {drafts.map((d, i) => (
                  <Card key={i} className="rounded-2xl border-border/80 bg-card p-4 sm:p-5 space-y-3.5 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Question {i + 1}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDrafts((prev) => prev.filter((_, x) => x !== i));
                          soundFx.playClick();
                        }}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                        title="Remove question"
                      >
                        <Trash2 className="size-3.5 mr-1" /> Remove
                      </Button>
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Question Statement</Label>
                      <Textarea
                        rows={2}
                        value={d.prompt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDrafts((prev) =>
                            prev.map((item, idx) => (idx === i ? { ...item, prompt: val } : item))
                          );
                        }}
                        placeholder="Enter question statement..."
                        className="text-xs sm:text-sm font-medium rounded-xl"
                      />
                    </div>

                    {/* 4 Options Grid */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold flex items-center justify-between">
                        <span>4 Options (Click radio button to mark correct answer)</span>
                        <span className="text-[11px] text-primary font-bold">
                          Option {String.fromCharCode(65 + d.correctIndex)} is marked Correct
                        </span>
                      </Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {d.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            onClick={() => {
                              setDrafts((prev) =>
                                prev.map((item, idx) =>
                                  idx === i ? { ...item, correctIndex: optIdx } : item
                                )
                              );
                            }}
                            className={`flex items-center gap-2 rounded-xl border p-2.5 transition-all cursor-pointer ${
                              d.correctIndex === optIdx
                                ? "border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                                : "border-border/70 bg-secondary/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${i}`}
                              checked={d.correctIndex === optIdx}
                              onChange={() => {
                                setDrafts((prev) =>
                                  prev.map((item, idx) =>
                                    idx === i ? { ...item, correctIndex: optIdx } : item
                                  )
                                );
                              }}
                              className="size-4 accent-emerald-600 shrink-0"
                            />
                            <span className="font-bold text-xs shrink-0 text-muted-foreground">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <Input
                              value={opt}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDrafts((prev) =>
                                  prev.map((item, idx) =>
                                    idx === i
                                      ? {
                                          ...item,
                                          options: item.options.map((o, oI) =>
                                            oI === optIdx ? val : o
                                          ),
                                        }
                                      : item
                                  )
                                );
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="h-8 text-xs bg-background rounded-lg border-0 shadow-none focus-visible:ring-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Topic & Explanation */}
                    <div className="grid gap-3 sm:grid-cols-2 pt-1">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Topic Tag</Label>
                        <Input
                          value={d.topic ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDrafts((prev) =>
                              prev.map((item, idx) => (idx === i ? { ...item, topic: val } : item))
                            );
                          }}
                          placeholder="e.g. Photosynthesis / गति के नियम"
                          className="h-8 text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Explanation / Solution</Label>
                        <Input
                          value={d.explanation ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDrafts((prev) =>
                              prev.map((item, idx) => (idx === i ? { ...item, explanation: val } : item))
                            );
                          }}
                          placeholder="Short explanation for student review..."
                          className="h-8 text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Save & Publish Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  Clicking publish will save all {drafts.length} questions to <strong>"{activeChapter?.title}"</strong> quiz.
                </p>
                <Button
                  className="rounded-full w-full sm:w-auto px-8 py-6 text-sm sm:text-base font-bold shadow-lg gap-2"
                  disabled={busy}
                  onClick={saveDrafts}
                >
                  <Sparkles className="size-4" />
                  <span>Save & Publish All {drafts.length} Questions 🚀</span>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ManualForm({ onAdd }: { onAdd: (q: DraftQuestion) => void }) {
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [topic, setTopic] = useState("");

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd({ prompt, options, correctIndex: correct, explanation, topic, difficulty: "medium" });
        setPrompt("");
        setOptions(["", "", "", ""]);
        setExplanation("");
        setCorrect(0);
      }}
    >
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Question</Label>
        <Textarea rows={2} required value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter question statement..." className="text-xs sm:text-sm rounded-xl" />
      </div>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-3">
          <Input
            required
            value={opt}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => setOptions((o) => o.map((v, x) => (x === i ? e.target.value : v)))}
            className="text-xs rounded-xl"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <Switch checked={correct === i} onCheckedChange={() => setCorrect(i)} />
            <span className="text-xs text-muted-foreground">Correct</span>
          </div>
        </div>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Topic</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic name" className="text-xs rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Explanation</Label>
          <Input value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation" className="text-xs rounded-xl" />
        </div>
      </div>
      <Button type="submit" className="rounded-full text-xs font-semibold">
        Add to Review List
      </Button>
    </form>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground">{children}</div>;
}

