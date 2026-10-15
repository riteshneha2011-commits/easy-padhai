import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Globe,
  Check,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MathText } from "@/components/markdown-renderer";
import { soundFx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";
import {
  parseJsonQuestions,
  parseMarkdownQuestions,
  JSON_EXAMPLE,
  MARKDOWN_EXAMPLE,
  type DraftQuestion,
} from "@/lib/questions-parse";

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
        <Textarea
          rows={2}
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter question statement..."
          className="text-xs sm:text-sm rounded-xl"
        />
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
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic name"
            className="text-xs rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Explanation</Label>
          <Input
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explanation"
            className="text-xs rounded-xl"
          />
        </div>
      </div>
      <Button type="submit" className="rounded-full text-xs font-semibold">
        Add to Review List
      </Button>
    </form>
  );
}

export interface TeachQuizBuilderTabProps {
  data: any;
  availableClassLevels: number[];
  classOrdinalLabel: (level: number) => string;
  classLabel: (level: number) => string;
  upsertTest: (args: any) => Promise<any>;
  insertQuestions: (args: any) => Promise<any>;
  aiGenerate: (args: any) => Promise<any>;
  refresh: () => Promise<void>;
  busy?: boolean;
}

export function TeachQuizBuilderTab({
  data,
  availableClassLevels,
  classOrdinalLabel,
  classLabel,
  upsertTest,
  insertQuestions,
  aiGenerate,
  refresh,
  busy: externalBusy = false,
}: TeachQuizBuilderTabProps) {
  const [internalBusy, setInternalBusy] = useState(false);
  const busy = externalBusy || internalBusy;

  const [quizScope, setQuizScope] = useState<"chapter" | "lesson">("lesson");
  const [qClassLevel, setQClassLevel] = useState<number>(9);
  const [qSubjectId, setQSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
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

  const subjectsForQuiz = useMemo(() => {
    return data?.subjects?.filter((s: any) => s.class_level === qClassLevel) || [];
  }, [data?.subjects, qClassLevel]);

  const effectiveQSubjectId = qSubjectId && subjectsForQuiz.some((s: any) => s.id === qSubjectId)
    ? qSubjectId
    : (subjectsForQuiz[0]?.id || "");

  const availableChaptersForQuiz = data?.chapters?.filter((c: any) => c.subject_id === effectiveQSubjectId) || [];
  const effectiveQChapterId = chapterId && availableChaptersForQuiz.some((c: any) => c.id === chapterId)
    ? chapterId
    : (availableChaptersForQuiz[0]?.id || "");
  const activeChapter = data?.chapters?.find((c: any) => c.id === effectiveQChapterId) ?? null;

  const availableLessonsForQuiz = activeChapter
    ? (data?.lessons?.filter((l: any) => l.chapter_id === activeChapter.id) || [])
    : [];
  const effectiveQLessonId = qLessonId && availableLessonsForQuiz.some((l: any) => l.id === qLessonId)
    ? qLessonId
    : (availableLessonsForQuiz[0]?.id || "");
  const activeLesson = availableLessonsForQuiz.find((l: any) => l.id === effectiveQLessonId) ?? null;

  const activeTest = quizScope === "lesson" && activeLesson
    ? (data?.tests?.find((t: any) => t.lesson_id === activeLesson.id) ?? null)
    : (activeChapter ? (data?.tests?.find((t: any) => t.chapter_id === activeChapter.id && !t.lesson_id) ?? null) : null);

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
    setInternalBusy(true);
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
      setInternalBusy(false);
    }
  }

  return (
    <div className="space-y-6">
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
                {availableClassLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {classOrdinalLabel(lvl)}
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
                {subjectsForQuiz.map((s: any) => (
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
                {availableChaptersForQuiz.map((c: any) => (
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
                  {availableLessonsForQuiz.map((l: any) => {
                    const hasQuiz = data.tests?.some((t: any) => t.lesson_id === l.id);
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
                    ✓ Published Quiz ({activeTest.questionCount ?? 0} questions active)
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

      {/* Review Draft Questions Card */}
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
    </div>
  );
}
