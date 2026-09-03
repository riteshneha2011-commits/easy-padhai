import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  getAdminCatalog,
  saveChapter,
  saveSubject,
  saveLesson,
  saveTest,
  saveQuestion,
  addQuestions,
  getTestQuestions,
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
import { cn } from "@/lib/utils";
import { MathText } from "@/components/markdown-renderer";

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
  Edit3,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Eye,
  Save,
  Headphones,
  Video,
  FileText,
  Search,
  Filter,
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
  const upsertQuestion = useServerFn(saveQuestion);
  const fetchTestQuestions = useServerFn(getTestQuestions);
  const insertQuestions = useServerFn(addQuestions);
  const aiGenerate = useServerFn(generateQuestions);
  const removeRow = useServerFn(deleteRow);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { data, isLoading, refetch: refetchCatalog } = useQuery({
    queryKey: ["admin-catalog"],
    queryFn: () => fetchCatalog(),
    enabled: Boolean(user) && isStaff,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });

  const refresh = async () => {
    await refetchCatalog();
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-catalog"] }),
      qc.invalidateQueries({ queryKey: ["curriculum"] }),
      qc.invalidateQueries({ queryKey: ["chapters"] }),
      qc.invalidateQueries({ queryKey: ["content"] }),
      qc.invalidateQueries({ queryKey: ["learn"] }),
      qc.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  };

  const [chapterId, setChapterId] = useState("");
  const [quizScope, setQuizScope] = useState<"chapter" | "lesson">("lesson");
  const [qLessonId, setQLessonId] = useState("");
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [draftViewMode, setDraftViewMode] = useState<"visual" | "edit">("visual");
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(null);
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

  // Manage Quizzes Tab State
  const [selectedManageTestId, setSelectedManageTestId] = useState<string | null>(null);
  const [manageQuestions, setManageQuestions] = useState<any[]>([]);
  const [loadingManageQuestions, setLoadingManageQuestions] = useState(false);
  const [manageClassFilter, setManageClassFilter] = useState<number | "all">("all");
  const [filterQuizType, setFilterQuizType] = useState<"all" | "lesson" | "chapter">("all");
  const [manageSubjectFilter, setManageSubjectFilter] = useState<string>("all");
  const [editingQuestionState, setEditingQuestionState] = useState<Record<string, any>>({});
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);

  const handleOpenTestQuestions = async (testId: string) => {
    if (selectedManageTestId === testId) {
      setSelectedManageTestId(null);
      setManageQuestions([]);
      return;
    }
    setSelectedManageTestId(testId);
    setLoadingManageQuestions(true);
    try {
      const qs = await fetchTestQuestions({ data: { testId } });
      setManageQuestions(qs || []);
      const stateMap: Record<string, any> = {};
      (qs || []).forEach((q: any) => {
        stateMap[q.id] = {
          prompt: q.prompt,
          options: [...q.options],
          correct_index: q.correct_index,
          explanation: q.explanation ?? "",
          topic: q.topic ?? "",
          difficulty: q.difficulty ?? "medium",
        };
      });
      setEditingQuestionState(stateMap);
    } catch (e: any) {
      toast.error(e.message || "Failed to load questions");
    } finally {
      setLoadingManageQuestions(false);
    }
  };

  const handleSaveSingleQuestion = async (qId: string, testId: string) => {
    const qData = editingQuestionState[qId];
    if (!qData) return;
    setSavingQuestionId(qId);
    try {
      await upsertQuestion({
        data: {
          id: qId,
          test_id: testId,
          prompt: qData.prompt,
          options: qData.options,
          correct_index: qData.correct_index,
          explanation: qData.explanation || null,
          topic: qData.topic || null,
          difficulty: qData.difficulty || "medium",
        },
      });
      toast.success("Question updated successfully! ✅");
      await refresh();
    } catch (e: any) {
      toast.error(e.message || "Could not save question");
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleDeleteSingleQuestion = async (qId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await removeRow({ data: { table: "questions", id: qId } });
      toast.success("Question deleted.");
      setManageQuestions((prev) => prev.filter((q) => q.id !== qId));
      await refresh();
    } catch (e: any) {
      toast.error(e.message || "Could not delete question");
    }
  };

  const handleAddNewQuestionToExistingTest = async (testId: string) => {
    try {
      const created = await upsertQuestion({
        data: {
          test_id: testId,
          prompt: "New question prompt...",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct_index: 0,
          difficulty: "medium",
          explanation: "",
          topic: "",
        },
      });
      toast.success("New question added! You can now edit its content below.");
      const updatedQs = await fetchTestQuestions({ data: { testId } });
      setManageQuestions(updatedQs || []);
      setEditingQuestionState((prev) => ({
        ...prev,
        [created.id]: {
          prompt: created.prompt,
          options: [...created.options],
          correct_index: created.correct_index,
          explanation: created.explanation ?? "",
          topic: created.topic ?? "",
          difficulty: created.difficulty ?? "medium",
        },
      }));
      await refresh();
    } catch (e: any) {
      toast.error(e.message || "Could not add question");
    }
  };

  const [pubClassFilter, setPubClassFilter] = useState<number | "all">("all");
  const [pubSubjectFilter, setPubSubjectFilter] = useState<string>("");
  const [pubChapterFilter, setPubChapterFilter] = useState<string>("");
  const [pubSearch, setPubSearch] = useState<string>("");
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const [newLessonClass, setNewLessonClass] = useState<number>(9);
  const [newLessonSubjectId, setNewLessonSubjectId] = useState("");
  const [newLessonChapterId, setNewLessonChapterId] = useState("");
  const [newLessonOrder, setNewLessonOrder] = useState<number>(1);
  const [newLessonKey, setNewLessonKey] = useState(0);

  const [newChapterClass, setNewChapterClass] = useState<number>(9);
  const [newChapterSubjectId, setNewChapterSubjectId] = useState("");
  const [newChapterOrder, setNewChapterOrder] = useState<number>(1);
  const [newChapterKey, setNewChapterKey] = useState(0);

  const subjectsForNewChapter = useMemo(() => {
    return data?.subjects?.filter((s) => s.class_level === newChapterClass) || [];
  }, [data?.subjects, newChapterClass]);
  const effectiveSubjectId = newChapterSubjectId && subjectsForNewChapter.some((s) => s.id === newChapterSubjectId)
    ? newChapterSubjectId
    : (subjectsForNewChapter[0]?.id || data?.subjects?.[0]?.id || "");

  const subjectsForNewLesson = useMemo(() => {
    return data?.subjects?.filter((s) => s.class_level === newLessonClass) || [];
  }, [data?.subjects, newLessonClass]);
  const effectiveLessonSubjectId = newLessonSubjectId && subjectsForNewLesson.some((s) => s.id === newLessonSubjectId)
    ? newLessonSubjectId
    : (subjectsForNewLesson[0]?.id || data?.subjects?.[0]?.id || "");
  const availableChaptersForNewLesson = data?.chapters?.filter((c) => c.subject_id === effectiveLessonSubjectId) || [];
  const effectiveChapterId = newLessonChapterId && availableChaptersForNewLesson.some((c) => c.id === newLessonChapterId)
    ? newLessonChapterId
    : (availableChaptersForNewLesson[0]?.id || "");

  const [qClassLevel, setQClassLevel] = useState<number>(9);

  const subjectsForQuiz = useMemo(() => {
    return data?.subjects?.filter((s) => s.class_level === qClassLevel) || [];
  }, [data?.subjects, qClassLevel]);

  const effectiveQSubjectId = qSubjectId && subjectsForQuiz.some((s) => s.id === qSubjectId)
    ? qSubjectId
    : (subjectsForQuiz[0]?.id || "");

  const availableChaptersForQuiz = data?.chapters?.filter((c) => c.subject_id === effectiveQSubjectId) || [];
  const effectiveQChapterId = chapterId && availableChaptersForQuiz.some((c) => c.id === chapterId)
    ? chapterId
    : (availableChaptersForQuiz[0]?.id || "");
  const activeChapter = data?.chapters?.find((c) => c.id === effectiveQChapterId) ?? null;

  const availableLessonsForQuiz = activeChapter
    ? (data?.lessons?.filter((l) => l.chapter_id === activeChapter.id) || [])
    : [];
  const effectiveQLessonId = qLessonId && availableLessonsForQuiz.some((l) => l.id === qLessonId)
    ? qLessonId
    : (availableLessonsForQuiz[0]?.id || "");
  const activeLesson = availableLessonsForQuiz.find((l) => l.id === effectiveQLessonId) ?? null;

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
        <TabsList className="rounded-full flex-wrap h-auto gap-1 p-1 bg-secondary/80">
          <TabsTrigger value="content" className="rounded-full text-xs sm:text-sm font-semibold">
            1. Content Hierarchy
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-full text-xs sm:text-sm font-semibold">
            2. AI Quiz Builder ✨
          </TabsTrigger>
          <TabsTrigger value="manage_tests" className="rounded-full text-xs sm:text-sm font-semibold">
            3. All Quizzes & Tests ({data?.tests?.length ?? 0})
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
                  const slug = String(f.get("slug") ?? "").trim() || slugify(title);
                  const targetSubjectId = effectiveSubjectId;
                  const targetClass = newChapterClass;
                  void run(
                    () =>
                      upsertChapter({
                        data: {
                          subject_id: targetSubjectId,
                          title,
                          slug,
                          description: String(f.get("description") ?? "") || null,
                          order_index: newChapterOrder,
                          published: true,
                        },
                      }),
                    "Chapter created",
                  ).then(() => {
                    setPubClassFilter(targetClass);
                    setPubSubjectFilter(targetSubjectId);
                    setPubChapterFilter("");
                  });
                  form.reset();
                  setNewChapterKey((k) => k + 1);
                }}
              >
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <select
                    value={newChapterClass}
                    onChange={(e) => {
                      const cls = Number(e.target.value);
                      setNewChapterClass(cls);
                      setNewChapterSubjectId("");
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                  >
                    {ACTIVE_CLASS_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {classLabel(lvl)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <select
                    name="subject_id"
                    value={effectiveSubjectId}
                    onChange={(e) => setNewChapterSubjectId(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                  >
                    {subjectsForNewChapter.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                    {subjectsForNewChapter.length === 0 && (
                      <option value="">No subjects in {classLabel(newChapterClass)}</option>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
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
                  <div className="flex items-center justify-between">
                    <Label>Title</Label>
                    <AiAutofill mode="chapter" />
                  </div>
                  <Input name="title" required placeholder="e.g. Motion" />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug (URL key)</Label>
                  <Input name="slug" placeholder="e.g. motion (auto-generated if blank)" />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input name="description" placeholder="Short description or overview" />
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
                  const targetClass = newLessonClass;
                  const targetSubjectId = effectiveLessonSubjectId;
                  const targetChapterId = effectiveChapterId;
                  void run(
                    () =>
                      upsertLesson({
                        data: {
                          chapter_id: targetChapterId,
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
                  ).then(() => {
                    setPubClassFilter(targetClass);
                    setPubSubjectFilter(targetSubjectId);
                    setPubChapterFilter(targetChapterId);
                    setCollapsedChapters((prev) => ({ ...prev, [targetChapterId]: false }));
                  });
                  form.reset();
                  setNewLessonKey((k) => k + 1);
                }}
              >
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <select
                    value={newLessonClass}
                    onChange={(e) => {
                      const cls = Number(e.target.value);
                      setNewLessonClass(cls);
                      setNewLessonSubjectId("");
                      setNewLessonChapterId("");
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                  >
                    {ACTIVE_CLASS_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {classLabel(lvl)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <select
                    value={effectiveLessonSubjectId}
                    onChange={(e) => {
                      setNewLessonSubjectId(e.target.value);
                      setNewLessonChapterId("");
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                  >
                    {subjectsForNewLesson.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                    {subjectsForNewLesson.length === 0 && (
                      <option value="">No subjects in {classLabel(newLessonClass)}</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Chapter</Label>
                  <select
                    name="chapter_id"
                    value={effectiveChapterId}
                    onChange={(e) => setNewLessonChapterId(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                  >
                    {availableChaptersForNewLesson.length === 0 && (
                      <option value="">No chapters created yet in this subject</option>
                    )}
                    {availableChaptersForNewLesson.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.order_index} {c.title}
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
                  <div className="flex items-center justify-between">
                    <Label>Summary notes / formulas</Label>
                    <AiAutofill mode="lesson" />
                  </div>
                  <Textarea
                    name="summary"
                    placeholder="Bullet summary or key formula (Markdown supported, or use Auto-generate)"
                    rows={3}
                    className="rounded-xl text-sm"
                  />
                </div>
                <Button type="submit" disabled={busy} className="rounded-full sm:col-span-2">
                  Publish lesson
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-lg">Published content</CardTitle>
                  <CardDescription>
                    Filter by subject & chapter or collapse rows to navigate lectures effortlessly.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold rounded-full"
                    onClick={() => {
                      const allCollapsed = Object.values(collapsedChapters).filter(Boolean).length > 0;
                      if (allCollapsed) {
                        setCollapsedChapters({});
                      } else {
                        const next: Record<string, boolean> = {};
                        data.chapters.forEach((c) => {
                          next[c.id] = true;
                        });
                        setCollapsedChapters(next);
                      }
                    }}
                  >
                    {Object.values(collapsedChapters).filter(Boolean).length > 0 ? (
                      <>
                        <ChevronDown className="size-3.5 mr-1" /> Expand All
                      </>
                    ) : (
                      <>
                        <ChevronUp className="size-3.5 mr-1" /> Collapse All
                      </>
                    )}
                  </Button>
                  {(pubClassFilter !== "all" || pubSubjectFilter || pubChapterFilter || pubSearch) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-full"
                      onClick={() => {
                        setPubClassFilter("all");
                        setPubSubjectFilter("");
                        setPubChapterFilter("");
                        setPubSearch("");
                      }}
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              </div>

              {/* Class Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPubClassFilter("all");
                    setPubSubjectFilter("");
                    setPubChapterFilter("");
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold transition-all",
                    pubClassFilter === "all"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  All Classes
                </button>
                {ACTIVE_CLASS_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setPubClassFilter(lvl);
                      setPubSubjectFilter("");
                      setPubChapterFilter("");
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold transition-all",
                      pubClassFilter === lvl
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {classLabel(lvl)}
                  </button>
                ))}
              </div>

              {/* Subject & Chapter Filter Dropdowns */}
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Filter className="size-3" /> Filter by Subject
                  </Label>
                  <select
                    value={pubSubjectFilter}
                    onChange={(e) => {
                      setPubSubjectFilter(e.target.value);
                      setPubChapterFilter("");
                    }}
                    className="h-9 w-full rounded-xl border border-input bg-background px-2.5 text-xs font-medium focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      All Subjects (
                      {
                        (pubClassFilter === "all"
                          ? data.subjects
                          : data.subjects.filter((s) => s.class_level === pubClassFilter)
                        ).length
                      }
                      )
                    </option>
                    {(pubClassFilter === "all"
                      ? data.subjects
                      : data.subjects.filter((s) => s.class_level === pubClassFilter)
                    ).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <BookOpen className="size-3" /> Filter by Chapter
                  </Label>
                  <select
                    value={pubChapterFilter}
                    onChange={(e) => setPubChapterFilter(e.target.value)}
                    className="h-9 w-full rounded-xl border border-input bg-background px-2.5 text-xs font-medium focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      {pubSubjectFilter ? "All Chapters in this Subject" : "All Chapters"} (
                      {
                        (pubSubjectFilter
                          ? data.chapters.filter((c) => c.subject_id === pubSubjectFilter)
                          : pubClassFilter !== "all"
                          ? data.chapters.filter((c) => {
                              const s = data.subjects.find((sub) => sub.id === c.subject_id);
                              return s?.class_level === pubClassFilter;
                            })
                          : data.chapters
                        ).length
                      }
                      )
                    </option>
                    {(pubSubjectFilter
                      ? data.chapters.filter((c) => c.subject_id === pubSubjectFilter)
                      : pubClassFilter !== "all"
                      ? data.chapters.filter((c) => {
                          const s = data.subjects.find((sub) => sub.id === c.subject_id);
                          return s?.class_level === pubClassFilter;
                        })
                      : data.chapters
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.order_index} {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Search className="size-3" /> Quick Search
                  </Label>
                  <Input
                    value={pubSearch}
                    onChange={(e) => setPubSearch(e.target.value)}
                    placeholder="Search chapter or lesson..."
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              {data.subjects
                .filter((sub) => {
                  if (pubClassFilter !== "all" && sub.class_level !== pubClassFilter) return false;
                  if (pubSubjectFilter && sub.id !== pubSubjectFilter) return false;
                  return true;
                })
                .map((sub) => {
                  const subChapters = data.chapters
                    .filter((c) => c.subject_id === sub.id)
                    .filter((c) => {
                      if (pubChapterFilter && c.id !== pubChapterFilter) return false;
                      if (pubSearch.trim()) {
                        const q = pubSearch.toLowerCase().trim();
                        const matchChap =
                          c.title.toLowerCase().includes(q) ||
                          (c.slug && c.slug.toLowerCase().includes(q)) ||
                          (c.description && c.description.toLowerCase().includes(q));
                        const matchLesson = data.lessons.some(
                          (l) => l.chapter_id === c.id && l.title.toLowerCase().includes(q),
                        );
                        return matchChap || matchLesson;
                      }
                      return true;
                    });

                  if (subChapters.length === 0 && (pubSubjectFilter || pubChapterFilter || pubSearch)) {
                    return null;
                  }

                  return (
                    <div key={sub.id} className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
                            {classLabel(sub.class_level)}
                          </Badge>
                          <h3 className="font-display text-base font-bold text-foreground">
                            {sub.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            ({subChapters.length} {subChapters.length === 1 ? "Chapter" : "Chapters"})
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-primary"
                          onClick={() => {
                            setNewChapterSubjectId(sub.id);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                        >
                          <Plus className="size-3 mr-1" /> Add Chapter
                        </Button>
                      </div>

                      {subChapters.length === 0 ? (
                        <p className="text-xs italic text-muted-foreground py-2">
                          No chapters in this subject match your filter.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {subChapters.map((c) => {
                            const chapLessons = data.lessons.filter((l) => l.chapter_id === c.id);
                            const isCollapsed = Boolean(collapsedChapters[c.id]) && pubChapterFilter !== c.id;
                            const audioCount = chapLessons.filter((l) => Boolean(l.audio_url)).length;
                            const videoCount = chapLessons.filter((l) => Boolean(l.video_url)).length;
                            const pdfCount = chapLessons.filter((l) => Boolean(l.pdf_url)).length;
                            const summaryCount = chapLessons.filter((l) => Boolean(l.summary)).length;

                            return (
                              <div
                                key={c.id}
                                className="rounded-xl border border-border/60 bg-secondary/30 transition-all hover:border-border"
                              >
                                {/* Chapter Header / Toggle Row */}
                                <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCollapsedChapters((prev) => ({
                                        ...prev,
                                        [c.id]: !isCollapsed,
                                      }))
                                    }
                                    className="flex flex-1 min-w-[200px] items-center gap-2 text-left cursor-pointer group"
                                  >
                                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                      #{c.order_index}
                                    </span>
                                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                      {c.title}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                      {chapLessons.length} {chapLessons.length === 1 ? "lesson" : "lessons"}
                                    </Badge>

                                    {/* Media summary badges */}
                                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground ml-1">
                                      {audioCount > 0 && (
                                        <span className="inline-flex items-center gap-0.5 text-primary">
                                          <Headphones className="size-3" /> {audioCount}
                                        </span>
                                      )}
                                      {videoCount > 0 && (
                                        <span className="inline-flex items-center gap-0.5 text-blue-500">
                                          <Video className="size-3" /> {videoCount}
                                        </span>
                                      )}
                                      {pdfCount > 0 && (
                                        <span className="inline-flex items-center gap-0.5 text-orange-500">
                                          <FileText className="size-3" /> {pdfCount}
                                        </span>
                                      )}
                                      {summaryCount > 0 && (
                                        <span className="inline-flex items-center gap-0.5 text-emerald-500">
                                          <Sparkles className="size-3" /> {summaryCount}
                                        </span>
                                      )}
                                    </div>
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-[11px] font-medium"
                                      onClick={() => {
                                        setNewLessonSubjectId(sub.id);
                                        setNewLessonChapterId(c.id);
                                        window.scrollTo({ top: 600, behavior: "smooth" });
                                      }}
                                    >
                                      <Plus className="size-3 mr-1" /> Add Lesson
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => setEditChapter(editChapter === c.id ? null : c.id)}
                                    >
                                      {editChapter === c.id ? "Cancel" : "Edit"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                                      onClick={() =>
                                        run(
                                          () => removeRow({ data: { table: "chapters", id: c.id } }),
                                          "Chapter deleted",
                                        )
                                      }
                                    >
                                      Delete
                                    </Button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCollapsedChapters((prev) => ({
                                          ...prev,
                                          [c.id]: !isCollapsed,
                                        }))
                                      }
                                      className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
                                      title={isCollapsed ? "Expand Lessons" : "Collapse Lessons"}
                                    >
                                      {isCollapsed ? (
                                        <ChevronDown className="size-4" />
                                      ) : (
                                        <ChevronUp className="size-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Edit Chapter Form */}
                                {editChapter === c.id && (
                                  <form
                                    className="m-3 grid gap-3 rounded-xl border border-border/80 bg-background p-3 sm:grid-cols-2 text-xs"
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const f = new FormData(e.currentTarget);
                                      const title = String(f.get("title") ?? c.title);
                                      const slug = String(f.get("slug") ?? "").trim() || slugify(title);
                                      void run(
                                        () =>
                                          upsertChapter({
                                            data: {
                                              id: c.id,
                                              subject_id: String(f.get("subject_id") ?? c.subject_id),
                                              title,
                                              slug,
                                              description: String(f.get("description") ?? c.description ?? "") || null,
                                              order_index: Number(f.get("order_index") ?? c.order_index ?? 1),
                                              published: (f.get("published") as string) === "on",
                                            },
                                          }),
                                        "Chapter updated",
                                      );
                                      setEditChapter(null);
                                    }}
                                  >
                                    <div className="space-y-1 sm:col-span-2">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-xs">Title</Label>
                                        <AiAutofill mode="chapter" />
                                      </div>
                                      <Input name="title" defaultValue={c.title} required className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Subject</Label>
                                      <select
                                        name="subject_id"
                                        defaultValue={c.subject_id}
                                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                      >
                                        {data.subjects.map((s) => (
                                          <option key={s.id} value={s.id}>
                                            {s.name} ({classLabel(s.class_level)})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Slug (URL key)</Label>
                                      <Input name="slug" defaultValue={c.slug ?? ""} className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                      <Label className="text-xs">Description</Label>
                                      <Input name="description" defaultValue={c.description ?? ""} className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">Order</Label>
                                      <Input name="order_index" type="number" defaultValue={c.order_index ?? 1} className="h-8 text-xs" />
                                    </div>
                                    <label className="flex items-center gap-2 text-xs">
                                      <input type="checkbox" name="published" defaultChecked={c.published} />
                                      Published
                                    </label>
                                    <Button type="submit" disabled={busy} className="h-8 rounded-full sm:col-span-2 text-xs">
                                      Save Chapter Changes
                                    </Button>
                                  </form>
                                )}

                                {/* Lesson List (Collapsed/Expanded) */}
                                {!isCollapsed && (
                                  <div className="p-3 pt-0 space-y-2">
                                    {chapLessons.length === 0 ? (
                                      <p className="text-xs italic text-muted-foreground pl-3 py-1">
                                        No lessons in this chapter yet. Click "+ Add Lesson" to publish one.
                                      </p>
                                    ) : (
                                      <div className="space-y-1.5 pl-2 sm:pl-4 border-l-2 border-primary/20">
                                        {chapLessons.map((l) => (
                                          <div key={l.id} className="rounded-lg bg-background/90 p-2.5 text-xs shadow-xs">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold text-muted-foreground">
                                                  #{l.order_index}
                                                </span>
                                                <span className="font-medium text-foreground">{l.title}</span>
                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize">
                                                  {l.kind}
                                                </Badge>
                                                {l.audio_url && (
                                                  <span title="Audio available">
                                                    <Headphones className="size-3 text-primary" />
                                                  </span>
                                                )}
                                                {l.video_url && (
                                                  <span title="Video available">
                                                    <Video className="size-3 text-blue-500" />
                                                  </span>
                                                )}
                                                {l.pdf_url && (
                                                  <span title="PDF available">
                                                    <FileText className="size-3 text-orange-500" />
                                                  </span>
                                                )}
                                                {l.summary && (
                                                  <span title="Summary notes available">
                                                    <Sparkles className="size-3 text-emerald-500" />
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-6 px-2 text-[11px]"
                                                  onClick={() => setEditLesson(editLesson === l.id ? null : l.id)}
                                                >
                                                  {editLesson === l.id ? "Cancel" : "Edit"}
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                                                  onClick={() =>
                                                    run(() => removeRow({ data: { table: "lessons", id: l.id } }), "Lesson deleted")
                                                  }
                                                >
                                                  Delete
                                                </Button>
                                              </div>
                                            </div>

                                            {editLesson === l.id && (
                                              <form
                                                className="mt-3 grid gap-3 border-t border-border/40 pt-3 sm:grid-cols-2"
                                                onSubmit={(e) => {
                                                  e.preventDefault();
                                                  const f = new FormData(e.currentTarget);
                                                  void run(
                                                    () =>
                                                      upsertLesson({
                                                        data: {
                                                          id: l.id,
                                                          chapter_id: String(f.get("chapter_id") ?? l.chapter_id),
                                                          title: String(f.get("title") ?? l.title),
                                                          kind: String(f.get("kind") ?? l.kind),
                                                          audio_url: String(f.get("audio_url") ?? l.audio_url ?? "") || null,
                                                          video_url: String(f.get("video_url") ?? l.video_url ?? "") || null,
                                                          pdf_url: String(f.get("pdf_url") ?? l.pdf_url ?? "") || null,
                                                          summary: String(f.get("summary") ?? l.summary ?? "") || null,
                                                          duration_minutes: Number(f.get("duration_minutes") ?? l.duration_minutes),
                                                          order_index: Number(f.get("order_index") ?? l.order_index),
                                                          published: (f.get("published") as string) === "on",
                                                        },
                                                      }),
                                                    "Lesson updated",
                                                  );
                                                  setEditLesson(null);
                                                }}
                                              >
                                                <div className="space-y-1.5">
                                                  <Label>Title</Label>
                                                  <Input name="title" defaultValue={l.title} required />
                                                </div>
                                                <div className="space-y-1.5">
                                                  <Label>Kind</Label>
                                                  <select
                                                    name="kind"
                                                    defaultValue={l.kind}
                                                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                                                  >
                                                    <option value="audio">Audio lecture</option>
                                                    <option value="video">Video lecture</option>
                                                    <option value="summary">Summary</option>
                                                    <option value="pdf">PDF notes</option>
                                                  </select>
                                                </div>
                                                <div className="space-y-1.5 sm:col-span-2">
                                                  <MediaInput
                                                    name="audio_url"
                                                    label="Audio File"
                                                    type="audio"
                                                    defaultValue={l.audio_url ?? ""}
                                                  />
                                                </div>
                                                <div className="space-y-1.5 sm:col-span-2">
                                                  <MediaInput
                                                    name="video_url"
                                                    label="Video File"
                                                    type="video"
                                                    defaultValue={l.video_url ?? ""}
                                                  />
                                                </div>
                                                <div className="space-y-1.5 sm:col-span-2">
                                                  <MediaInput
                                                    name="pdf_url"
                                                    label="PDF Document"
                                                    type="pdf"
                                                    defaultValue={l.pdf_url ?? ""}
                                                  />
                                                </div>
                                                <div className="space-y-1.5 sm:col-span-2">
                                                  <div className="flex items-center justify-between">
                                                    <Label className="text-xs">Summary notes / formulas</Label>
                                                    <AiAutofill mode="lesson" />
                                                  </div>
                                                  <Textarea
                                                    name="summary"
                                                    defaultValue={l.summary ?? ""}
                                                    placeholder="Bullet summary or key formula"
                                                    rows={3}
                                                    className="rounded-xl text-xs"
                                                  />
                                                </div>
                                                <div className="space-y-1.5">
                                                  <Label>Duration (min)</Label>
                                                  <Input
                                                    name="duration_minutes"
                                                    type="number"
                                                    defaultValue={l.duration_minutes}
                                                  />
                                                </div>
                                                <div className="space-y-1.5">
                                                  <Label>Order</Label>
                                                  <Input
                                                    name="order_index"
                                                    type="number"
                                                    defaultValue={l.order_index}
                                                  />
                                                </div>
                                                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                                  <input
                                                    type="checkbox"
                                                    name="published"
                                                    defaultChecked={l.published}
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
          {/* Scope Selector: Lesson Quick Check vs Whole Chapter Test */}
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <span>1. Select Quiz Target & Scope</span>
              </CardTitle>
              <CardDescription>
                Generate a quick 3–5 question quiz for a specific lesson, or a comprehensive chapter-wide test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quiz Scope Toggle */}
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
                    <Sparkles className="size-4" />
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
                    <BookOpen className="size-4" />
                    <span>📖 Full Chapter Test</span>
                  </button>
                </div>
              </div>

              {/* Hierarchy Selectors: Class, Subject, Chapter, and Lesson */}
              <div className={`grid gap-3 ${quizScope === "lesson" ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Class</Label>
                  <select
                    value={qClassLevel}
                    onChange={(e) => {
                      const lvl = Number(e.target.value);
                      setQClassLevel(lvl);
                      setQSubjectId("");
                      setChapterId("");
                      setQLessonId("");
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                  >
                    {ACTIVE_CLASS_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {classLabel(lvl)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Subject</Label>
                  <select
                    value={effectiveQSubjectId}
                    onChange={(e) => {
                      setQSubjectId(e.target.value);
                      setChapterId("");
                      setQLessonId("");
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold"
                  >
                    {subjectsForQuiz.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                    {subjectsForQuiz.length === 0 && (
                      <option value="">No subjects in {classLabel(qClassLevel)}</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Chapter</Label>
                  <select
                    value={activeChapter?.id ?? ""}
                    onChange={(e) => {
                      setChapterId(e.target.value);
                      setQLessonId("");
                    }}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    {availableChaptersForQuiz.length === 0 && (
                      <option value="">No chapters in this subject</option>
                    )}
                    {availableChaptersForQuiz.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.order_index} {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {quizScope === "lesson" && (
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Specific Lesson</span>
                      {activeLesson && (
                        <span className="text-[10px] text-primary font-bold">
                          #{activeLesson.order_index}
                        </span>
                      )}
                    </Label>
                    <select
                      value={activeLesson?.id ?? ""}
                      onChange={(e) => setQLessonId(e.target.value)}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                    >
                      {availableLessonsForQuiz.length === 0 && (
                        <option value="">No lessons in this chapter</option>
                      )}
                      {availableLessonsForQuiz.map((l) => {
                        const hasQuiz = data.tests.some((t: any) => t.lesson_id === l.id);
                        return (
                          <option key={l.id} value={l.id}>
                            #{l.order_index} {l.title} {hasQuiz ? "✓ [Quiz live]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Status Banner */}
              {activeChapter && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-secondary/60 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      Target: {quizScope === "lesson" ? (activeLesson ? `Lesson "${activeLesson.title}"` : "Pick a lesson") : `Chapter "${activeChapter.title}"`}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {activeTest ? (
                      <span className="font-semibold text-emerald-600">
                        ✓ Published Quiz ({activeTest.questionCount} questions active)
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
                    {quizScope === "lesson"
                      ? `AI will focus specifically on "${activeLesson?.title ?? "selected lesson"}" to craft targeted micro-quiz questions.`
                      : `AI will craft comprehensive questions covering all topics of chapter "${activeChapter?.title ?? "selected chapter"}".`}
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

                    {quizScope === "lesson" ? (
                      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-1.5">
                        <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Check className="size-3.5" />
                          <span>Focused on Lesson: {activeLesson?.title ?? "Selected Lesson"}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {activeLesson?.summary ? `Summary: "${activeLesson.summary}"` : "AI will craft questions targeting the key concepts of this lesson."}
                        </p>
                      </div>
                    ) : (
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
                            <p className="text-xs font-semibold">All Lesson Summaries</p>
                            <p className="text-[11px] text-muted-foreground">Extracts topics from all chapter lessons</p>
                          </div>
                        </label>
                      </div>
                    )}

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
                        {[3, 5, 10, 15].map((cnt) => (
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
                      disabled={busy || aiGenerating || !activeChapter || (quizScope === "lesson" && !activeLesson)}
                      onClick={async () => {
                        if (!activeChapter) return toast.error("Please pick a chapter first");
                        if (quizScope === "lesson" && !activeLesson) return toast.error("Please pick a lesson first");
                        setAiGenerating(true);
                        soundFx.playClick();
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
                          soundFx.playSuccess();
                          const targetLabel = quizScope === "lesson" && activeLesson ? `Lesson "${activeLesson.title}"` : `Chapter "${activeChapter.title}"`;
                          toast.success(`✨ ${qs.length} NCERT questions generated for ${targetLabel} in ${aiLanguage.toUpperCase()}! Review below.`);
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
                          <span>Gemini AI is crafting questions in {aiLanguage.toUpperCase()}…</span>
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
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-xl bg-secondary/80 p-1 border border-border/60">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftViewMode("visual");
                        setEditingDraftIndex(null);
                        soundFx.playClick();
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all",
                        draftViewMode === "visual" && editingDraftIndex === null
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Eye className="size-3.5 text-primary" />
                      <span>Visual Form (Formulas & Equations)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftViewMode("edit");
                        soundFx.playClick();
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all",
                        draftViewMode === "edit"
                          ? "bg-card text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Edit3 className="size-3.5" />
                      <span>Edit Fields</span>
                    </button>
                  </div>
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
                      setEditingDraftIndex(drafts.length);
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
                {drafts.map((d, i) => {
                  const isVisual = draftViewMode === "visual" && editingDraftIndex !== i;
                  return (
                    <Card key={i} className="rounded-2xl border-border/80 bg-card p-4 sm:p-5 space-y-3.5 shadow-xs">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Question {i + 1}
                          </span>
                          {d.topic && (
                            <Badge variant="outline" className="text-[11px] font-semibold rounded-full px-2 py-0 border-primary/30 text-primary">
                              {d.topic}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {isVisual ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingDraftIndex(i);
                                soundFx.playClick();
                              }}
                              className="h-7 px-2.5 text-xs rounded-full gap-1 border-border/80 hover:bg-secondary"
                              title="Edit question text"
                            >
                              <Edit3 className="size-3" />
                              <span>Edit</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingDraftIndex(null);
                                soundFx.playClick();
                              }}
                              className="h-7 px-2.5 text-xs rounded-full gap-1 border-emerald-500/50 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold"
                              title="Switch to visual preview"
                            >
                              <Eye className="size-3" />
                              <span>Visual</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDrafts((prev) => prev.filter((_, x) => x !== i));
                              soundFx.playClick();
                            }}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive rounded-full"
                            title="Remove question"
                          >
                            <Trash2 className="size-3.5 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>

                      {isVisual ? (
                        /* Visual Form Mode: Equations & Symbols cleanly rendered */
                        <div className="space-y-3.5">
                          {/* Prompt */}
                          <div className="rounded-xl bg-secondary/30 p-3 sm:p-4 border border-border/50">
                            <MathText
                              content={d.prompt || "No question statement entered"}
                              className="text-sm sm:text-base font-semibold text-foreground leading-relaxed"
                            />
                          </div>

                          {/* 4 Options Grid */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-0.5">
                              <span>4 Options (Click any option to change correct answer)</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                ✓ Option {String.fromCharCode(65 + d.correctIndex)} is marked Correct
                              </span>
                            </div>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                              {d.options.map((opt, optIdx) => {
                                const isCorrect = d.correctIndex === optIdx;
                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => {
                                      setDrafts((prev) =>
                                        prev.map((item, idx) =>
                                          idx === i ? { ...item, correctIndex: optIdx } : item
                                        )
                                      );
                                      soundFx.playClick();
                                    }}
                                    className={cn(
                                      "flex items-start gap-2.5 rounded-xl border p-3 transition-all cursor-pointer select-none",
                                      isCorrect
                                        ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/40 shadow-xs"
                                        : "border-border/70 bg-card hover:border-border hover:bg-secondary/40 text-foreground"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "grid size-5.5 shrink-0 place-items-center rounded-full text-xs font-bold mt-0.5",
                                        isCorrect
                                          ? "bg-emerald-600 text-white shadow-xs"
                                          : "bg-secondary text-muted-foreground border border-border/80"
                                      )}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <div className="flex-1 min-w-0 text-xs sm:text-sm font-medium pt-0.5">
                                      <MathText content={opt || `(Option ${String.fromCharCode(65 + optIdx)} is empty)`} />
                                    </div>
                                    {isCorrect && (
                                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Explanation */}
                          {d.explanation && (
                            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs sm:text-sm flex items-start gap-1.5">
                              <span className="font-bold text-primary shrink-0">Explanation / Solution:</span>
                              <div className="min-w-0 flex-1">
                                <MathText content={d.explanation} />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Edit Form Mode: Inputs with live math previews */
                        <div className="space-y-3.5">
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
                              placeholder="Enter question statement (use $...$ for math)..."
                              className="text-xs sm:text-sm font-medium rounded-xl"
                            />
                            {(d.prompt.includes("$") || d.prompt.includes("\\")) && (
                              <div className="rounded-lg bg-secondary/40 p-2 text-xs border border-border/60">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Live Math Preview:</span>
                                <MathText content={d.prompt} />
                              </div>
                            )}
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
                                  className={`flex flex-col gap-1 rounded-xl border p-2.5 transition-all cursor-pointer ${
                                    d.correctIndex === optIdx
                                      ? "border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                                      : "border-border/70 bg-secondary/40"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
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
                                  {(opt.includes("$") || opt.includes("\\")) && (
                                    <div className="text-xs bg-background/80 rounded-md px-2 py-1 ml-6 border border-border/40">
                                      <MathText content={opt} />
                                    </div>
                                  )}
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
                              {(d.explanation?.includes("$") || d.explanation?.includes("\\")) && (
                                <div className="text-xs bg-secondary/40 rounded-md px-2 py-1 border border-border/40">
                                  <MathText content={d.explanation} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
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

        <TabsContent value="manage_tests" className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <FileQuestion className="size-5 text-primary" />
                    <span>All Quizzes & Tests Bank</span>
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    View, inspect, edit individual questions, add new questions, or delete any quiz.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold px-3 py-1 self-start sm:self-auto">
                  Total Quizzes: {data?.tests?.length ?? 0}
                </Badge>
              </div>

              {/* Filters */}
              <div className="space-y-3 pt-3 border-t border-border/40 mt-3">
                {/* Class Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setManageClassFilter("all");
                      setManageSubjectFilter("all");
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold transition-all",
                      manageClassFilter === "all"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    All Classes
                  </button>
                  {ACTIVE_CLASS_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setManageClassFilter(lvl);
                        setManageSubjectFilter("all");
                      }}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold transition-all",
                        manageClassFilter === lvl
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-secondary text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {classLabel(lvl)}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-secondary/70 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFilterQuizType("all")}
                      className={cn(
                        "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                        filterQuizType === "all" ? "bg-card shadow-sm text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterQuizType("lesson")}
                      className={cn(
                        "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                        filterQuizType === "lesson" ? "bg-card shadow-sm text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ⚡ Lesson Quizzes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterQuizType("chapter")}
                      className={cn(
                        "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                        filterQuizType === "chapter" ? "bg-card shadow-sm text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      📖 Chapter Tests
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={manageSubjectFilter}
                      onChange={(e) => setManageSubjectFilter(e.target.value)}
                      className="h-8 rounded-xl border border-input bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="all">
                        All Subjects (
                        {
                          (manageClassFilter === "all"
                            ? data?.subjects
                            : data?.subjects?.filter((s) => s.class_level === manageClassFilter)
                          )?.length ?? 0
                        }
                        )
                      </option>
                      {(manageClassFilter === "all"
                        ? data?.subjects
                        : data?.subjects?.filter((s) => s.class_level === manageClassFilter)
                      )?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({classLabel(s.class_level)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {(() => {
                let filteredTests = data?.tests ?? [];
                if (manageClassFilter !== "all") {
                  const classSubjects = new Set((data?.subjects ?? []).filter((s) => s.class_level === manageClassFilter).map((s) => s.id));
                  const classChapters = new Set((data?.chapters ?? []).filter((c) => classSubjects.has(c.subject_id)).map((c) => c.id));
                  filteredTests = filteredTests.filter((t: any) => classChapters.has(t.chapter_id));
                }
                if (filterQuizType === "lesson") {
                  filteredTests = filteredTests.filter((t: any) => t.is_lesson_test);
                } else if (filterQuizType === "chapter") {
                  filteredTests = filteredTests.filter((t: any) => !t.is_lesson_test);
                }
                if (manageSubjectFilter !== "all") {
                  const subjectChapters = new Set((data?.chapters ?? []).filter((c) => c.subject_id === manageSubjectFilter).map((c) => c.id));
                  filteredTests = filteredTests.filter((t: any) => subjectChapters.has(t.chapter_id));
                }

                if (filteredTests.length === 0) {
                  return (
                    <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">No quizzes match your filter.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs font-semibold"
                        onClick={() => {
                          setManageClassFilter("all");
                          setFilterQuizType("all");
                          setManageSubjectFilter("all");
                        }}
                      >
                        Reset filters
                      </Button>
                    </div>
                  );
                }

                return filteredTests.map((t: any) => {
                  const isExpanded = selectedManageTestId === t.id;
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "rounded-2xl border transition-all overflow-hidden",
                        isExpanded ? "border-primary/60 bg-card shadow-md" : "border-border/70 bg-card/60 hover:border-border"
                      )}
                    >
                      {/* Test Summary Row */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {t.is_lesson_test ? (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] font-bold">
                                ⚡ Lesson Quiz
                              </Badge>
                            ) : (
                              <Badge className="bg-primary/15 text-primary border-primary/30 text-[11px] font-bold">
                                📖 Chapter Test
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[11px]">
                              {t.subject_name}
                            </Badge>
                            <Badge variant="secondary" className="text-[11px] font-semibold">
                              {t.questionCount} Questions
                            </Badge>
                            <Badge variant="secondary" className="text-[11px]">
                              ~{t.duration_minutes ?? 10} min
                            </Badge>
                          </div>

                          <h3 className="font-display text-base font-bold text-foreground">
                            {t.title}
                          </h3>

                          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                            <span>Chapter: <strong>{t.chapter_title}</strong></span>
                            {t.lesson_title && (
                              <span>• Lecture: <strong>{t.lesson_title}</strong></span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant={isExpanded ? "default" : "outline"}
                            onClick={() => handleOpenTestQuestions(t.id)}
                            className="rounded-full text-xs font-semibold gap-1.5 h-8"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="size-3.5" />
                                <span>Hide Questions</span>
                              </>
                            ) : (
                              <>
                                <Eye className="size-3.5" />
                                <span>Inspect & Edit ({t.questionCount})</span>
                              </>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete entire quiz "${t.title}" and all its questions?`)) {
                                void run(async () => {
                                  await removeRow({ data: { table: "tests", id: t.id } });
                                  if (selectedManageTestId === t.id) {
                                    setSelectedManageTestId(null);
                                    setManageQuestions([]);
                                  }
                                  toast.success("Quiz deleted successfully.");
                                });
                              }
                            }}
                            className="rounded-full text-xs text-destructive hover:bg-destructive/10 h-8 px-2.5"
                            title="Delete Quiz"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Question Bank Editor */}
                      {isExpanded && (
                        <div className="border-t border-border/60 bg-secondary/20 p-4 sm:p-5 space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                            <div>
                              <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                                <Sparkles className="size-4 text-primary" />
                                <span>Questions in this Quiz ({manageQuestions.length})</span>
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Edit prompt, options, correct answers, and explanations.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddNewQuestionToExistingTest(t.id)}
                              className="rounded-full text-xs font-bold gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Plus className="size-3.5" />
                              <span>Add New Question</span>
                            </Button>
                          </div>

                          {loadingManageQuestions ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                              <RefreshCw className="size-4 animate-spin mx-auto mb-2 text-primary" />
                              Loading questions...
                            </div>
                          ) : manageQuestions.length === 0 ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                              No questions in this test yet. Click "Add New Question" above.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {manageQuestions.map((q, qIndex) => {
                                const qState = editingQuestionState[q.id] || {
                                  prompt: q.prompt,
                                  options: [...q.options],
                                  correct_index: q.correct_index,
                                  explanation: q.explanation ?? "",
                                  topic: q.topic ?? "",
                                  difficulty: q.difficulty ?? "medium",
                                };
                                const isSaving = savingQuestionId === q.id;

                                return (
                                  <Card key={q.id} className="rounded-2xl border-border/70 p-4 space-y-3 bg-card shadow-sm">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs font-bold">
                                          Q{qIndex + 1}
                                        </Badge>
                                        <select
                                          value={qState.difficulty}
                                          onChange={(e) => {
                                            const diff = e.target.value;
                                            setEditingQuestionState((prev) => ({
                                              ...prev,
                                              [q.id]: { ...prev[q.id], difficulty: diff },
                                            }));
                                          }}
                                          className="h-6 rounded-md border border-input bg-background px-2 text-[11px] font-semibold text-muted-foreground"
                                        >
                                          <option value="easy">Easy</option>
                                          <option value="medium">Medium</option>
                                          <option value="hard">Hard</option>
                                        </select>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <Button
                                          size="sm"
                                          disabled={isSaving}
                                          onClick={() => handleSaveSingleQuestion(q.id, t.id)}
                                          className="h-7 rounded-full text-xs font-semibold gap-1 bg-primary text-primary-foreground"
                                        >
                                          <Save className="size-3" />
                                          <span>{isSaving ? "Saving..." : "Save"}</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteSingleQuestion(q.id)}
                                          className="h-7 w-7 p-0 rounded-full text-destructive hover:bg-destructive/10"
                                          title="Delete Question"
                                        >
                                          <Trash2 className="size-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Prompt */}
                                    <div className="space-y-1">
                                      <Label className="text-xs font-semibold text-muted-foreground">Question Statement</Label>
                                      <Textarea
                                        rows={2}
                                        value={qState.prompt}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setEditingQuestionState((prev) => ({
                                            ...prev,
                                            [q.id]: { ...prev[q.id], prompt: val },
                                          }));
                                        }}
                                        className="text-xs sm:text-sm rounded-xl font-medium"
                                      />
                                      {(qState.prompt.includes("$") || qState.prompt.includes("\\")) && (
                                        <div className="rounded-lg bg-secondary/40 p-2 text-xs border border-border/60">
                                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Live Math Preview:</span>
                                          <MathText content={qState.prompt} />
                                        </div>
                                      )}
                                    </div>

                                    {/* 4 Options Grid */}
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-semibold text-muted-foreground">Options (Select radio for correct answer)</Label>
                                      <div className="grid gap-2 sm:grid-cols-2">
                                        {qState.options.map((opt: string, optIdx: number) => {
                                          const isCorrect = qState.correct_index === optIdx;
                                          return (
                                            <div
                                              key={optIdx}
                                              className={cn(
                                                "flex flex-col gap-1 rounded-xl border p-2 text-xs transition-all",
                                                isCorrect
                                                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30"
                                                  : "border-border/60 bg-secondary/30"
                                              )}
                                            >
                                              <div className="flex items-center gap-2">
                                                <input
                                                  type="radio"
                                                  name={`correct_manage_${q.id}`}
                                                  checked={isCorrect}
                                                  onChange={() => {
                                                    setEditingQuestionState((prev) => ({
                                                      ...prev,
                                                      [q.id]: { ...prev[q.id], correct_index: optIdx },
                                                    }));
                                                  }}
                                                  className="size-4 accent-emerald-600 shrink-0"
                                                />
                                                <span className="font-bold text-xs shrink-0 text-muted-foreground">
                                                  {String.fromCharCode(65 + optIdx)}.
                                                </span>
                                                <Input
                                                  value={opt}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEditingQuestionState((prev) => {
                                                      const currentOpts = [...(prev[q.id]?.options || [])];
                                                      currentOpts[optIdx] = val;
                                                      return {
                                                        ...prev,
                                                        [q.id]: { ...prev[q.id], options: currentOpts },
                                                      };
                                                    });
                                                  }}
                                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                  className="h-7 text-xs bg-background rounded-lg border-0 shadow-none focus-visible:ring-1"
                                                />
                                              </div>
                                              {(opt.includes("$") || opt.includes("\\")) && (
                                                <div className="text-xs bg-background/80 rounded-md px-2 py-1 ml-6 border border-border/40">
                                                  <MathText content={opt} />
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Topic & Explanation */}
                                    <div className="grid gap-2 sm:grid-cols-2 pt-1">
                                      <div className="space-y-1">
                                        <Label className="text-[11px] font-semibold text-muted-foreground">Topic Tag</Label>
                                        <Input
                                          value={qState.topic}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditingQuestionState((prev) => ({
                                              ...prev,
                                              [q.id]: { ...prev[q.id], topic: val },
                                            }));
                                          }}
                                          placeholder="Topic..."
                                          className="h-7 text-xs rounded-xl"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-[11px] font-semibold text-muted-foreground">Explanation</Label>
                                        <Input
                                          value={qState.explanation}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditingQuestionState((prev) => ({
                                              ...prev,
                                              [q.id]: { ...prev[q.id], explanation: val },
                                            }));
                                          }}
                                          placeholder="Explanation..."
                                          className="h-7 text-xs rounded-xl"
                                        />
                                        {(qState.explanation?.includes("$") || qState.explanation?.includes("\\")) && (
                                          <div className="text-xs bg-secondary/40 rounded-md px-2 py-1 border border-border/40">
                                            <MathText content={qState.explanation} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>
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

