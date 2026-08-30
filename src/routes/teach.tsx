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
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiSource, setAiSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [editChapter, setEditChapter] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState<string | null>(null);

  const [newLessonChapterId, setNewLessonChapterId] = useState("");
  const [newLessonOrder, setNewLessonOrder] = useState<number>(1);
  const [newLessonKey, setNewLessonKey] = useState(0);

  const [newChapterSubjectId, setNewChapterSubjectId] = useState("");
  const [newChapterOrder, setNewChapterOrder] = useState<number>(1);
  const [newChapterKey, setNewChapterKey] = useState(0);

  const effectiveChapterId = newLessonChapterId || data?.chapters?.[0]?.id || "";
  const effectiveSubjectId = newChapterSubjectId || data?.subjects?.[0]?.id || "";

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
  const activeChapter = chapters.find((c) => c.id === chapterId) ?? chapters[0] ?? null;
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
    toast.success(`${result.questions.length} questions ready to review`);
  }

  async function saveDrafts() {
    if (!activeTest) return toast.error("Create a test for this chapter first");
    await run(
      () => insertQuestions({ data: { testId: activeTest.id, questions: drafts } }),
      `${drafts.length} questions added`,
    );
    setDrafts([]);
    setRaw("");
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
              <CardDescription>Audio, video, summary or PDF notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                key={newLessonKey}
                className="grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formEl = e.currentTarget as HTMLFormElement;
                  const f = new FormData(formEl);
                  void run(
                    () =>
                      upsertLesson({
                        data: {
                          chapter_id: String(f.get("chapter_id")),
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
                  <Label>Chapter</Label>
                  <select
                    name="chapter_id"
                    required
                    value={effectiveChapterId}
                    onChange={(e) => {
                      setNewLessonChapterId(e.target.value);
                      const chapLessons = data.lessons.filter((l) => l.chapter_id === e.target.value);
                      const nextOrder = chapLessons.length > 0
                        ? Math.max(...chapLessons.map((l) => l.order_index ?? 0)) + 1
                        : 1;
                      setNewLessonOrder(nextOrder);
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
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
                  <Label>Title</Label>
                  <Input name="title" required />
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
                <MediaInput name="audio_url" label="Audio (link or upload)" accept="audio/*" folder="audio" />
                <MediaInput name="video_url" label="Video (link or upload)" accept="video/*" folder="video" />
                <MediaInput name="pdf_url" label="PDF notes (link or upload)" accept="application/pdf" folder="pdf" />


                <div className="space-y-1.5">
                  <Label>Duration (min)</Label>
                  <Input name="duration_minutes" type="number" defaultValue={10} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>Summary</Label>
                    <AiAutofill mode="lesson" />
                  </div>
                  <Textarea name="summary" rows={4} />
                </div>

                <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                  Save lesson
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Published content</CardTitle>
              <CardDescription>Edit or delete chapters and lessons.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {chapters.map((c) => (
                <div key={c.id} className="rounded-2xl bg-secondary p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{c.title}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setEditChapter(editChapter === c.id ? null : c.id)}
                      >
                        {editChapter === c.id ? "Close" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void run(() => removeRow({ data: { table: "chapters", id: c.id } }), "Deleted")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {editChapter === c.id && (
                    <form
                      className="mt-3 grid gap-3 rounded-2xl bg-background p-4 sm:grid-cols-2"
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
                          {data.subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
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
                        <input type="checkbox" name="published" defaultChecked={c.published} className="size-4" />
                        Published
                      </label>
                      <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                        Save changes
                      </Button>
                    </form>
                  )}

                  <div className="mt-3 space-y-2">
                    {data.lessons
                      .filter((l) => l.chapter_id === c.id)
                      .map((l) => (
                        <div key={l.id} className="rounded-2xl bg-background/70 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm">
                              <Badge variant="outline" className="mr-2 rounded-full text-xs">
                                {l.kind}
                              </Badge>
                              {l.title}
                            </p>
                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => setEditLesson(editLesson === l.id ? null : l.id)}
                              >
                                {editLesson === l.id ? "Close" : "Edit"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  void run(() => removeRow({ data: { table: "lessons", id: l.id } }), "Deleted")
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          {editLesson === l.id && (
                            <form
                              className="mt-3 grid gap-3 sm:grid-cols-2"
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
                                  {chapters.map((ch) => (
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
                                <Input name="order_index" type="number" defaultValue={l.order_index} />
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
                                <Input name="duration_minutes" type="number" defaultValue={l.duration_minutes} />
                              </div>
                              <div className="space-y-1.5 sm:col-span-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <Label>Summary</Label>
                                  <AiAutofill mode="lesson" label="Auto-generate" />
                                </div>
                                <Textarea name="summary" rows={4} defaultValue={l.summary ?? ""} />
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
                              <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                                Save changes
                              </Button>
                            </form>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Pick a chapter test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                value={activeChapter?.id ?? ""}
                onChange={(e) => setChapterId(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              {activeTest ? (
                <p className="text-sm text-muted-foreground">
                  Test: <span className="font-medium text-foreground">{activeTest.title}</span> ·{" "}
                  {activeTest.questionCount} questions
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">No test yet for this chapter.</p>
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={!activeChapter || busy}
                    onClick={() =>
                      activeChapter &&
                      void run(
                        () =>
                          upsertTest({
                            data: {
                              chapter_id: activeChapter.id,
                              title: `${activeChapter.title} — Test`,
                              duration_minutes: 15,
                              published: true,
                            },
                          }),
                        "Test created",
                      )
                    }
                  >
                    Create test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Add questions</CardTitle>
              <CardDescription>Form, JSON, Markdown or AI — review before saving.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual">
                <TabsList className="rounded-full">
                  <TabsTrigger value="manual" className="rounded-full">
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="json" className="rounded-full">
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="markdown" className="rounded-full">
                    Markdown
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="rounded-full">
                    AI
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual">
                  <ManualForm onAdd={(q) => setDrafts((d) => [...d, q])} />
                </TabsContent>

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

                <TabsContent value="ai" className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>How many</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={aiCount}
                        onChange={(e) => setAiCount(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Difficulty</Label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <Textarea
                    rows={5}
                    value={aiSource}
                    onChange={(e) => setAiSource(e.target.value)}
                    placeholder="Optional: paste source text. Leave empty to use chapter summaries."
                  />
                  <Button
                    className="rounded-full"
                    disabled={busy || !activeChapter}
                    onClick={async () => {
                      if (!activeChapter) return;
                      setBusy(true);
                      try {
                        const qs = await aiGenerate({
                          data: {
                            chapterId: activeChapter.id,
                            count: aiCount,
                            difficulty: aiDifficulty,
                            sourceText: aiSource,
                          },
                        });
                        setDrafts(qs);
                        toast.success(`${qs.length} questions drafted — review below`);
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "AI failed");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {busy ? "Generating…" : "Generate with AI"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {drafts.length > 0 && (
            <Card className="rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Review {drafts.length} questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {drafts.map((d, i) => (
                  <div key={i} className="rounded-2xl bg-secondary p-4 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">
                        {i + 1}. {d.prompt}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDrafts((prev) => prev.filter((_, x) => x !== i))}
                      >
                        Remove
                      </Button>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {d.options.map((o, oi) => (
                        <li
                          key={oi}
                          className={oi === d.correctIndex ? "font-semibold text-accent" : "text-muted-foreground"}
                        >
                          {oi === d.correctIndex ? "✓ " : "• "}
                          {o}
                        </li>
                      ))}
                    </ul>
                    {d.explanation && <p className="mt-2 text-muted-foreground">{d.explanation}</p>}
                  </div>
                ))}
                <Button className="rounded-full" onClick={saveDrafts} disabled={busy || !activeTest}>
                  Save all to test
                </Button>
              </CardContent>
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
        onAdd({ prompt, options, correctIndex: correct, explanation, topic });
        setPrompt("");
        setOptions(["", "", "", ""]);
        setExplanation("");
        setCorrect(0);
      }}
    >
      <div className="space-y-1.5">
        <Label>Question</Label>
        <Textarea rows={2} required value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </div>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-3">
          <Input
            required
            value={opt}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => setOptions((o) => o.map((v, x) => (x === i ? e.target.value : v)))}
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <Switch checked={correct === i} onCheckedChange={() => setCorrect(i)} />
            <span className="text-xs text-muted-foreground">Correct</span>
          </div>
        </div>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Topic</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Explanation</Label>
          <Input value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        </div>
      </div>
      <Button type="submit" className="rounded-full">
        Add to review list
      </Button>
    </form>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground">{children}</div>;
}
