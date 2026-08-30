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
  const activeChapter = data.chapters.find((c) => c.id === effectiveQChapterId) ?? data.chapters[0] ?? null;
  const activeTest = activeChapter ? data.tests.find((t) => t.chapter_id === activeChapter.id) : null;




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
    if (drafts.length === 0) return toast.error("No questions to save");
    setBusy(true);
    try {
      let testId = activeTest?.id;
      if (!testId) {
        const newTest = await upsertTest({
          data: {
            chapter_id: activeChapter.id,
            title: `${activeChapter.title} — Test`,
            duration_minutes: Math.max(10, drafts.length * 2),
            published: true,
          },
        });
        testId = newTest?.id;
      }
      if (!testId) throw new Error("Could not create test record");

      await insertQuestions({ data: { testId, questions: drafts } });
      await refresh();
      soundFx.playCelebration();
      toast.success(`🎉 ${drafts.length} questions published to "${activeChapter.title}" quiz!`);
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
      <p className="mt-1 text-muted-foreground">Publish content and build tests for {ACTIVE_CLASS_LABEL}{UPCOMING_CLASS_LABEL ? ` (${UPCOMING_CLASS_LABEL} coming soon)` : ""}.</p>

      <Tabs defaultValue="content" className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="content" className="rounded-full">
            Content
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-full">
            Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Subjects</CardTitle>
              <CardDescription>Add, edit or delete subjects. Chapters live inside a subject.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
                          name: String(f.get("name")),
                          slug: String(f.get("slug")) || slugify(String(f.get("name"))),
                          class_level: Number(f.get("class_level") ?? ACTIVE_CLASS_LEVELS[0]),
                          description: String(f.get("description") ?? "") || null,
                          order_index: Number(f.get("order_index") ?? 0),
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
                  <Input
                    name="name"
                    required
                    placeholder="Science"
                    onBlur={(e) => {
                      const slug = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
                      if (slug && !slug.value) slug.value = slugify(e.currentTarget.value);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input name="slug" placeholder="science" />
                </div>
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <select
                    name="class_level"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {ACTIVE_CLASS_LEVELS.map((c) => (
                      <option key={c} value={c}>
                        {classLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input name="order_index" type="number" defaultValue={data.subjects.length + 1} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea name="description" rows={2} />
                </div>
                <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                  Add subject
                </Button>
              </form>

              {data.subjects.length === 0 && (
                <p className="text-sm text-muted-foreground">No subjects yet — add your first one above.</p>
              )}

              {data.subjects.map((s) => (
                <div key={s.id} className="rounded-2xl bg-secondary p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">
                      {s.name}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {classLabel(s.class_level)} · {s.published ? "published" : "hidden"}
                      </span>
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setEditSubject(editSubject === s.id ? null : s.id)}
                      >
                        {editSubject === s.id ? "Close" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void run(() => removeRow({ data: { table: "subjects", id: s.id } }), "Deleted")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {editSubject === s.id && (
                    <form
                      className="mt-3 grid gap-3 rounded-2xl bg-background p-4 sm:grid-cols-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget as HTMLFormElement);
                        void run(
                          () =>
                            upsertSubject({
                              data: {
                                id: s.id,
                                name: String(f.get("name")),
                                slug: String(f.get("slug")),
                                class_level: Number(f.get("class_level")),
                                description: String(f.get("description") ?? "") || null,
                                order_index: Number(f.get("order_index") ?? 0),
                                published: f.get("published") === "on",
                              },
                            }),
                          "Subject updated",
                        ).then(() => setEditSubject(null));
                      }}
                    >
                      <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input name="name" required defaultValue={s.name} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Slug</Label>
                        <Input name="slug" required defaultValue={s.slug} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Class</Label>
                        <select
                          name="class_level"
                          defaultValue={s.class_level}
                          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                        >
                          {ACTIVE_CLASS_LEVELS.map((c) => (
                            <option key={c} value={c}>
                              {classLabel(c)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Order</Label>
                        <Input name="order_index" type="number" defaultValue={s.order_index} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Description</Label>
                        <Textarea name="description" rows={2} defaultValue={s.description ?? ""} />
                      </div>
                      <label className="flex items-center gap-2 text-sm sm:col-span-2">
                        <input type="checkbox" name="published" defaultChecked={s.published} className="size-4" />
                        Published
                      </label>
                      <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                        Save changes
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">New chapter</CardTitle>
              <CardDescription>Add a chapter to a subject.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                key={newChapterKey}
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formEl = e.currentTarget as HTMLFormElement;
                  const f = new FormData(formEl);
                  void run(
                    () =>
                      upsertChapter({
                        data: {
                          subject_id: String(f.get("subject_id")),
                          title: String(f.get("title")),
                          slug: String(f.get("slug")),
                          description: String(f.get("description") ?? ""),
                          order_index: Number(f.get("order_index") ?? newChapterOrder),
                          published: true,
                        },
                      }),
                    "Chapter saved",
                  ).then(() => {
                    formEl.reset();
                    setNewChapterKey((k) => k + 1);
                    setNewChapterOrder((prev) => prev + 1);
                  });
                }}
              >
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <select
                    name="subject_id"
                    required
                    value={effectiveSubjectId}
                    onChange={(e) => {
                      setNewChapterSubjectId(e.target.value);
                      const subChapters = data.chapters.filter((c) => c.subject_id === e.target.value);
                      const nextOrder = subChapters.length > 0
                        ? Math.max(...subChapters.map((c) => c.order_index ?? 0)) + 1
                        : 1;
                      setNewChapterOrder(nextOrder);
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
                  <Label>Order</Label>
                  <Input
                    name="order_index"
                    type="number"
                    value={newChapterOrder}
                    onChange={(e) => setNewChapterOrder(Number(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    name="title"
                    required
                    onBlur={(e) => {
                      const form = e.currentTarget.form;
                      const slug = form?.elements.namedItem("slug") as HTMLInputElement | null;
                      if (slug && !slug.value) slug.value = slugify(e.currentTarget.value);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input name="slug" required placeholder="matter-around-us" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>Description</Label>
                    <AiAutofill mode="chapter" />
                  </div>
                  <Textarea name="description" rows={2} />
                </div>

                <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                  Save chapter
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">New lesson</CardTitle>
              <CardDescription>Select a subject and chapter, then add audio, video, summary or PDF notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                key={newLessonKey}
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formEl = e.currentTarget as HTMLFormElement;
                  const f = new FormData(formEl);
                  const selectedChapId = String(f.get("chapter_id") || effectiveChapterId);
                  if (!selectedChapId) {
                    toast.error("Please select a chapter first");
                    return;
                  }
                  void run(
                    () =>
                      upsertLesson({
                        data: {
                          chapter_id: selectedChapId,
                          title: String(f.get("title")),
                          kind: String(f.get("kind")),
                          audio_url: String(f.get("audio_url") ?? "") || null,
                          video_url: String(f.get("video_url") ?? "") || null,
                          pdf_url: String(f.get("pdf_url") ?? "") || null,
                          summary: String(f.get("summary") ?? "") || null,
                          duration_minutes: Number(f.get("duration_minutes") ?? 10),
                          order_index: Number(f.get("order_index") ?? newLessonOrder),
                          published: true,
                        },
                      }),
                    "Lesson saved",
                  ).then(() => {
                    formEl.reset();
                    setNewLessonKey((k) => k + 1);
                    setNewLessonOrder((prev) => prev + 1);
                  });
                }}
              >
                <div className="space-y-1.5">
                  <Label>1. Subject</Label>
                  <select
                    value={effectiveLessonSubjectId}
                    onChange={(e) => {
                      const subId = e.target.value;
                      setNewLessonSubjectId(subId);
                      const subChaps = data.chapters.filter((c) => c.subject_id === subId);
                      const firstChap = subChaps[0]?.id || "";
                      setNewLessonChapterId(firstChap);
                      const chapLessons = data.lessons.filter((l) => l.chapter_id === firstChap);
                      const nextOrder =
                        chapLessons.length > 0
                          ? Math.max(...chapLessons.map((l) => l.order_index ?? 0)) + 1
                          : 1;
                      setNewLessonOrder(nextOrder);
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    {data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>2. Chapter</Label>
                  <select
                    name="chapter_id"
                    required
                    value={effectiveChapterId}
                    onChange={(e) => {
                      setNewLessonChapterId(e.target.value);
                      const chapLessons = data.lessons.filter((l) => l.chapter_id === e.target.value);
                      const nextOrder =
                        chapLessons.length > 0
                          ? Math.max(...chapLessons.map((l) => l.order_index ?? 0)) + 1
                          : 1;
                      setNewLessonOrder(nextOrder);
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    {availableChaptersForNewLesson.length === 0 ? (
                      <option value="">No chapters in this subject yet</option>
                    ) : (
                      availableChaptersForNewLesson.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Kind</Label>
                  <select
                    name="kind"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="summary">Summary</option>
                    <option value="pdf">PDF notes</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Lesson Title</Label>
                  <Input name="title" required placeholder="e.g. Introduction to Coordinates" />
                </div>

                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input
                    name="order_index"
                    type="number"
                    value={newLessonOrder}
                    onChange={(e) => setNewLessonOrder(Number(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Duration (min)</Label>
                  <Input name="duration_minutes" type="number" defaultValue={10} />
                </div>

                <MediaInput name="audio_url" label="Audio (link or upload)" accept="audio/*" folder="audio" />
                <MediaInput name="video_url" label="Video (link or upload)" accept="video/*" folder="video" />
                <MediaInput name="pdf_url" label="PDF notes (link or upload)" accept="application/pdf" folder="pdf" />

                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>Summary</Label>
                    <AiAutofill mode="lesson" />
                  </div>
                  <Textarea name="summary" rows={4} placeholder="Lesson summary / notes content..." />
                </div>

                <Button
                  type="submit"
                  disabled={busy || !effectiveChapterId}
                  className="rounded-full sm:col-span-2 shadow-md"
                >
                  Save lesson
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Published content</CardTitle>
              <CardDescription>Structured hierarchy: Subject → Chapter → Lessons.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.subjects.map((s) => {
                const subChapters = data.chapters.filter((c) => c.subject_id === s.id);
                return (
                  <div
                    key={s.id}
                    className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base sm:text-lg font-bold text-foreground">
                          {s.name}
                        </span>
                        <Badge variant="secondary" className="rounded-full text-xs font-semibold">
                          {classLabel(s.class_level)}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({subChapters.length} {subChapters.length === 1 ? "Chapter" : "Chapters"})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs"
                          onClick={() => setEditSubject(editSubject === s.id ? null : s.id)}
                        >
                          {editSubject === s.id ? "Close" : "Edit Subject"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            void run(() => removeRow({ data: { table: "subjects", id: s.id } }), "Deleted")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {editSubject === s.id && (
                      <form
                        className="grid gap-3 rounded-2xl bg-secondary/50 p-4 sm:grid-cols-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget as HTMLFormElement);
                          void run(
                            () =>
                              upsertSubject({
                                data: {
                                  id: s.id,
                                  name: String(f.get("name")),
                                  slug: String(f.get("slug")),
                                  class_level: Number(f.get("class_level") ?? s.class_level),
                                  order_index: Number(f.get("order_index") ?? 0),
                                },
                              }),
                            "Subject updated",
                          ).then(() => setEditSubject(null));
                        }}
                      >
                        <div className="space-y-1.5">
                          <Label>Name</Label>
                          <Input name="name" required defaultValue={s.name} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Slug</Label>
                          <Input name="slug" required defaultValue={s.slug} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Class</Label>
                          <select
                            name="class_level"
                            defaultValue={s.class_level}
                            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                          >
                            <option value={9}>Class 9</option>
                            <option value={10}>Class 10</option>
                            <option value={11}>Class 11</option>
                            <option value={12}>Class 12</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Order</Label>
                          <Input name="order_index" type="number" defaultValue={s.order_index} />
                        </div>
                        <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                          Save Subject
                        </Button>
                      </form>
                    )}

                    {subChapters.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No chapters in this subject yet.
                      </p>
                    ) : (
                      <div className="space-y-3 pl-0 sm:pl-2">
                        {subChapters.map((c) => {
                          const chapLessons = data.lessons.filter((l) => l.chapter_id === c.id);
                          return (
                            <div
                              key={c.id}
                              className="rounded-2xl border border-border/60 bg-secondary/40 p-3.5 sm:p-4 space-y-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                    {c.order_index}
                                  </span>
                                  <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                                    {c.title}
                                  </p>
                                  <span className="text-[11px] text-muted-foreground font-medium">
                                    ({chapLessons.length} {chapLessons.length === 1 ? "lesson" : "lessons"})
                                  </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full text-xs h-7 px-3"
                                    onClick={() => setEditChapter(editChapter === c.id ? null : c.id)}
                                  >
                                    {editChapter === c.id ? "Close" : "Edit Chapter"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-full text-xs h-7 px-2.5 text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      void run(
                                        () => removeRow({ data: { table: "chapters", id: c.id } }),
                                        "Deleted",
                                      )
                                    }
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>

                              {editChapter === c.id && (
                                <form
                                  className="grid gap-3 rounded-2xl bg-background p-4 sm:grid-cols-2"
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const f = new FormData(e.currentTarget as HTMLFormElement);
                                    void run(
                                      () =>
                                        upsertChapter({
                                          data: {
                                            id: c.id,
                                            subject_id: String(f.get("subject_id")),
                                            title: String(f.get("title")),
                                            slug: String(f.get("slug")),
                                            description: String(f.get("description") ?? ""),
                                            order_index: Number(f.get("order_index") ?? 0),
                                            published: f.get("published") === "on",
                                          },
                                        }),
                                      "Chapter updated",
                                    ).then(() => setEditChapter(null));
                                  }}
                                >
                                  <div className="space-y-1.5">
                                    <Label>Subject</Label>
                                    <select
                                      name="subject_id"
                                      defaultValue={c.subject_id}
                                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                                    >
                                      {data.subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                          {sub.name} ({classLabel(sub.class_level)})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Order</Label>
                                    <Input name="order_index" type="number" defaultValue={c.order_index} />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Title</Label>
                                    <Input name="title" required defaultValue={c.title} />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Slug</Label>
                                    <Input name="slug" required defaultValue={c.slug} />
                                  </div>
                                  <div className="space-y-1.5 sm:col-span-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <Label>Description</Label>
                                      <AiAutofill mode="chapter" label="Auto-generate" />
                                    </div>
                                    <Textarea name="description" rows={2} defaultValue={c.description ?? ""} />
                                  </div>

                                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                    <input
                                      type="checkbox"
                                      name="published"
                                      defaultChecked={c.published}
                                      className="size-4"
                                    />
                                    Published
                                  </label>
                                  <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                                    Save Chapter Changes
                                  </Button>
                                </form>
                              )}

                              {chapLessons.length > 0 && (
                                <div className="space-y-1.5 pl-2 sm:pl-3 border-l-2 border-primary/20">
                                  {chapLessons.map((l) => (
                                    <div
                                      key={l.id}
                                      className="rounded-xl border border-border/40 bg-background/80 p-2.5 sm:p-3"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Badge
                                            variant="outline"
                                            className="rounded-md text-[11px] font-semibold uppercase shrink-0"
                                          >
                                            {l.kind}
                                          </Badge>
                                          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                                            {l.title}
                                          </span>
                                          {l.duration_minutes && (
                                            <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">
                                              ({l.duration_minutes}m)
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full h-6 px-2.5 text-[11px]"
                                            onClick={() => setEditLesson(editLesson === l.id ? null : l.id)}
                                          >
                                            {editLesson === l.id ? "Close" : "Edit"}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="rounded-full h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                                            onClick={() =>
                                              void run(
                                                () => removeRow({ data: { table: "lessons", id: l.id } }),
                                                "Deleted",
                                              )
                                            }
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </div>

                                      {editLesson === l.id && (
                                        <form
                                          className="mt-3 grid gap-3 rounded-2xl bg-secondary/40 p-3 sm:grid-cols-2"
                                          onSubmit={(e) => {
                                            e.preventDefault();
                                            const f = new FormData(e.currentTarget as HTMLFormElement);
                                            void run(
                                              () =>
                                                upsertLesson({
                                                  data: {
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
                                                    published: f.get("published") === "on",
                                                  },
                                                }),
                                              "Lesson updated",
                                            ).then(() => setEditLesson(null));
                                          }}
                                        >
                                          <div className="space-y-1.5">
                                            <Label>Chapter</Label>
                                            <select
                                              name="chapter_id"
                                              defaultValue={l.chapter_id}
                                              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                                            >
                                              {data.chapters.map((ch) => (
                                                <option key={ch.id} value={ch.id}>
                                                  {ch.title}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className="space-y-1.5">
                                            <Label>Kind</Label>
                                            <select
                                              name="kind"
                                              defaultValue={l.kind}
                                              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                                            >
                                              <option value="audio">Audio</option>
                                              <option value="video">Video</option>
                                              <option value="summary">Summary</option>
                                              <option value="pdf">PDF notes</option>
                                            </select>
                                          </div>
                                          <div className="space-y-1.5">
                                            <Label>Title</Label>
                                            <Input name="title" required defaultValue={l.title} />
                                          </div>
                                          <div className="space-y-1.5">
                                            <Label>Order</Label>
                                            <Input
                                              name="order_index"
                                              type="number"
                                              defaultValue={l.order_index}
                                            />
                                          </div>
                                          <MediaInput
                                            name="audio_url"
                                            label="Audio (link or upload)"
                                            accept="audio/*"
                                            folder="audio"
                                            defaultValue={l.audio_url ?? ""}
                                          />
                                          <MediaInput
                                            name="video_url"
                                            label="Video (link or upload)"
                                            accept="video/*"
                                            folder="video"
                                            defaultValue={l.video_url ?? ""}
                                          />
                                          <MediaInput
                                            name="pdf_url"
                                            label="PDF notes (link or upload)"
                                            accept="application/pdf"
                                            folder="pdf"
                                            defaultValue={l.pdf_url ?? ""}
                                          />
                                          <div className="space-y-1.5">
                                            <Label>Duration (min)</Label>
                                            <Input
                                              name="duration_minutes"
                                              type="number"
                                              defaultValue={l.duration_minutes ?? 10}
                                            />
                                          </div>
                                          <div className="space-y-1.5 sm:col-span-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                              <Label>Summary</Label>
                                              <AiAutofill mode="lesson" />
                                            </div>
                                            <Textarea name="summary" rows={3} defaultValue={l.summary ?? ""} />
                                          </div>

                                          <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                            <input
                                              type="checkbox"
                                              name="published"
                                              defaultChecked={l.published}
                                              className="size-4"
                                            />
                                            Published
                                          </label>
                                          <Button
                                            type="submit"
                                            disabled={busy}
                                            className="rounded-full sm:col-span-2"
                                          >
                                            Save Lesson Changes
                                          </Button>
                                        </form>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>


        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {/* Subject & Chapter Filter Card */}
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>1. Select Chapter for Quiz</span>
              </CardTitle>
              <CardDescription>
                Choose subject and chapter to generate or manage multiple-choice questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subject</Label>
                  <select
                    value={effectiveQSubjectId}
                    onChange={(e) => {
                      setQSubjectId(e.target.value);
                      const filtered = data.chapters.filter((c) => c.subject_id === e.target.value);
                      if (filtered[0]) setChapterId(filtered[0].id);
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    {data.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Chapter</Label>
                  <select
                    value={activeChapter?.id ?? ""}
                    onChange={(e) => setChapterId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    {availableChaptersForQuiz.length === 0 && (
                      <option value="">No chapters in this subject</option>
                    )}
                    {availableChaptersForQuiz.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.order_index}. {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeChapter && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-secondary/60 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      Chapter: {activeChapter.title}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {activeTest ? (
                      <span className="font-semibold text-emerald-600">
                        ✓ Published Quiz ({activeTest.questionCount} questions)
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        ⚡ Quiz will be automatically created on publish
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Quiz Builder & Input Modes */}
          <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Sparkles className="size-5 text-primary animate-pulse" />
                    <span>2. Build Questions</span>
                  </CardTitle>
                  <CardDescription>
                    Use Google Gemini AI to craft NCERT-aligned MCQs, or input manually.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs defaultValue="ai" className="w-full">
                <TabsList className="rounded-full bg-secondary/80 p-1 mb-4 flex-wrap h-auto">
                  <TabsTrigger value="ai" className="rounded-full gap-1.5 text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Sparkles className="size-3.5" />
                    <span>AI Quiz Builder ✨</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="rounded-full text-xs font-semibold">
                    Manual Form
                  </TabsTrigger>
                  <TabsTrigger value="json" className="rounded-full text-xs font-semibold">
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="markdown" className="rounded-full text-xs font-semibold">
                    Markdown
                  </TabsTrigger>
                </TabsList>

                {/* AI Quiz Builder Suite */}
                <TabsContent value="ai" className="space-y-5">
                  {/* Language Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Globe className="size-3.5 text-primary" />
                      <span>Language of Quiz</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAiLanguage("hindi")}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                          aiLanguage === "hindi"
                            ? "border-primary bg-primary/15 font-bold text-primary ring-2 ring-primary/30"
                            : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <span className="text-sm sm:text-base">🇮🇳 शुद्ध हिंदी</span>
                        <span className="text-[10px] sm:text-xs opacity-80 mt-0.5">NCERT Devanagari</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiLanguage("english")}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                          aiLanguage === "english"
                            ? "border-primary bg-primary/15 font-bold text-primary ring-2 ring-primary/30"
                            : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <span className="text-sm sm:text-base">🇬🇧 Pure English</span>
                        <span className="text-[10px] sm:text-xs opacity-80 mt-0.5">CBSE / Standard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiLanguage("hinglish")}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                          aiLanguage === "hinglish"
                            ? "border-primary bg-primary/15 font-bold text-primary ring-2 ring-primary/30"
                            : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <span className="text-sm sm:text-base">🗣️ Hinglish Mix</span>
                        <span className="text-[10px] sm:text-xs opacity-80 mt-0.5">Conversational</span>
                      </button>
                    </div>
                  </div>

                  {/* Sources Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" />
                      <span>Source Content for Questions</span>
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 cursor-pointer hover:border-primary/40 transition-colors">
                        <Switch checked={aiUseSummary} onCheckedChange={setAiUseSummary} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold">Chapter Summary & Concepts</p>
                          <p className="text-[11px] text-muted-foreground">Uses chapter overview & core definition</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 cursor-pointer hover:border-primary/40 transition-colors">
                        <Switch checked={aiUseLessons} onCheckedChange={setAiUseLessons} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold">Lesson Summaries & Notes</p>
                          <p className="text-[11px] text-muted-foreground">Extracts topics from published lessons</p>
                        </div>
                      </label>
                    </div>

                    <div className="pt-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Extra Custom Notes / Specific Topics (Optional):
                      </Label>
                      <Textarea
                        rows={3}
                        value={aiCustomNotes}
                        onChange={(e) => setAiCustomNotes(e.target.value)}
                        placeholder="Optional: Paste any specific topic points or PDF text you want questions from..."
                        className="text-xs rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* Count & Difficulty */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Question Count */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Number of Questions
                      </Label>
                      <div className="flex items-center gap-2">
                        {[5, 10, 15].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setAiCount(cnt)}
                            className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                              aiCount === cnt
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {cnt} Qs
                          </button>
                        ))}
                        <div className="w-20 shrink-0">
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            value={aiCount}
                            onChange={(e) => setAiCount(Math.max(1, Math.min(30, Number(e.target.value))))}
                            className="h-9 text-xs font-bold text-center rounded-xl"
                            title="Custom count"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Difficulty Target
                      </Label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                      >
                        <option value="mixed">🎯 Mixed (NCERT Board Pattern)</option>
                        <option value="easy">🟢 Easy (Basic Recall)</option>
                        <option value="medium">🟡 Medium (Conceptual Understanding)</option>
                        <option value="hard">🔴 Hard (HOTS / Analytical)</option>
                      </select>
                    </div>
                  </div>

                  {/* Generate Trigger */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      disabled={busy || aiGenerating || !activeChapter}
                      onClick={async () => {
                        if (!activeChapter) return toast.error("Please pick a chapter first");
                        setAiGenerating(true);
                        soundFx.playClick();
                        try {
                          const qs = await aiGenerate({
                            data: {
                              chapterId: activeChapter.id,
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
                          soundFx.playSuccess();
                          toast.success(`✨ ${qs.length} NCERT questions generated in ${aiLanguage.toUpperCase()}! Review below.`);
                        } catch (e) {
                          soundFx.playError();
                          toast.error(e instanceof Error ? e.message : "AI generation failed");
                        } finally {
                          setAiGenerating(false);
                        }
                      }}
                      className="w-full rounded-full py-6 text-sm sm:text-base font-bold shadow-md gap-2"
                    >
                      {aiGenerating ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          <span>Gemini AI is crafting NCERT MCQs in {aiLanguage.toUpperCase()}…</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4" />
                          <span>Generate {aiCount} Questions with AI ✨</span>
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                {/* Manual Form */}
                <TabsContent value="manual">
                  <ManualForm onAdd={(q) => {
                    setDrafts((d) => [...d, q]);
                    soundFx.playSuccess();
                    toast.success("Question added to draft review!");
                  }} />
                </TabsContent>

                {/* JSON Mode */}
                <TabsContent value="json" className="space-y-3">
                  <Textarea
                    rows={10}
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder={JSON_EXAMPLE}
                    className="font-mono text-xs"
                  />
                  <Button className="rounded-full" onClick={() => loadDrafts(parseJsonQuestions(raw))}>
                    Parse JSON
                  </Button>
                </TabsContent>

                {/* Markdown Mode */}
                <TabsContent value="markdown" className="space-y-3">
                  <Textarea
                    rows={10}
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder={MARKDOWN_EXAMPLE}
                    className="font-mono text-xs"
                  />
                  <Button className="rounded-full" onClick={() => loadDrafts(parseMarkdownQuestions(raw))}>
                    Parse Markdown
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Interactive Draft Review & In-Place Editor */}
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

