import { useState } from "react";
import { toast } from "sonner";
import {
  FileQuestion,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit3,
  Eye,
  Save,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MathText } from "@/components/markdown-renderer";
import { soundFx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";

export interface TeachQuizBankTabProps {
  data: any;
  availableClassLevels: number[];
  classOrdinalLabel: (level: number) => string;
  classLabel: (level: number) => string;
  onOpenAddClass: () => void;
  refresh: () => Promise<void>;
  fetchTestQuestions: (args: { data: { testId: string } }) => Promise<any>;
  upsertQuestion: (args: { data: any }) => Promise<any>;
  removeRow: (args: { data: { table: "lessons" | "chapters" | "tests" | "questions" | "subjects"; id: string } }) => Promise<any>;
  run: (fn: () => Promise<unknown>, message: string) => Promise<void>;
}

export function TeachQuizBankTab({
  data,
  availableClassLevels,
  classOrdinalLabel,
  classLabel,
  onOpenAddClass,
  refresh,
  fetchTestQuestions,
  upsertQuestion,
  removeRow,
  run,
}: TeachQuizBankTabProps) {
  // Filter States
  const [manageClassFilter, setManageClassFilter] = useState<number | "all">("all");
  const [manageSubjectFilter, setManageSubjectFilter] = useState<string>("all");
  const [filterQuizType, setFilterQuizType] = useState<"all" | "lesson" | "chapter">("all");
  const [manageSearch, setManageSearch] = useState<string>("");

  // Inline Question Batch Editor State
  const [selectedManageTestId, setSelectedManageTestId] = useState<string | null>(null);
  const [manageQuestions, setManageQuestions] = useState<any[]>([]);
  const [loadingManageQuestions, setLoadingManageQuestions] = useState<boolean>(false);
  const [editingQuestionState, setEditingQuestionState] = useState<Record<string, any>>({});
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);

  // Dedicated Quiz Reader View Modal State
  const [viewQuizTest, setViewQuizTest] = useState<any | null>(null);
  const [viewQuizQuestions, setViewQuizQuestions] = useState<any[]>([]);
  const [loadingViewQuiz, setLoadingViewQuiz] = useState<boolean>(false);
  const [editingViewQuestionId, setEditingViewQuestionId] = useState<string | null>(null);

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

  const handleOpenViewQuiz = async (test: any) => {
    setViewQuizTest(test);
    setLoadingViewQuiz(true);
    setEditingViewQuestionId(null);
    try {
      const qs = await fetchTestQuestions({ data: { testId: test.id } });
      setViewQuizQuestions(qs || []);
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
      setEditingQuestionState((prev) => ({ ...prev, ...stateMap }));
    } catch (e: any) {
      toast.error(e.message || "Failed to load test questions");
    } finally {
      setLoadingViewQuiz(false);
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
          options: Array.isArray(created.options) ? [...created.options] : [],
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

  return (
    <>
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
              {availableClassLevels.map((lvl) => (
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
                  {classOrdinalLabel(lvl)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenAddClass();
                }}
                className="rounded-full px-3 py-1 text-xs font-bold transition-all border border-dashed border-primary/50 text-primary hover:bg-primary/10 flex items-center gap-1 cursor-pointer"
                title="Add another class level (e.g. Class 5th, 6th, 7th, 8th)"
              >
                <Plus className="size-3" /> Add Class
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={manageSearch}
                  onChange={(e) => setManageSearch(e.target.value)}
                  placeholder="Search quizzes by title, chapter, lecture..."
                  className="h-9 pl-9 pr-7 text-xs rounded-xl bg-card border-border/80"
                />
                {manageSearch && (
                  <button
                    type="button"
                    onClick={() => setManageSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
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
                          : data?.subjects?.filter((s: any) => s.class_level === manageClassFilter)
                        )?.length ?? 0
                      }
                      )
                    </option>
                    {(manageClassFilter === "all"
                      ? data?.subjects
                      : data?.subjects?.filter((s: any) => s.class_level === manageClassFilter)
                    )?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({classLabel(s.class_level)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {(() => {
            let filteredTests = data?.tests ?? [];
            if (manageClassFilter !== "all") {
              const classSubjects = new Set((data?.subjects ?? []).filter((s: any) => s.class_level === manageClassFilter).map((s: any) => s.id));
              const classChapters = new Set((data?.chapters ?? []).filter((c: any) => classSubjects.has(c.subject_id)).map((c: any) => c.id));
              filteredTests = filteredTests.filter((t: any) => classChapters.has(t.chapter_id));
            }
            if (filterQuizType === "lesson") {
              filteredTests = filteredTests.filter((t: any) => t.is_lesson_test);
            } else if (filterQuizType === "chapter") {
              filteredTests = filteredTests.filter((t: any) => !t.is_lesson_test);
            }
            if (manageSubjectFilter !== "all") {
              const subjectChapters = new Set((data?.chapters ?? []).filter((c: any) => c.subject_id === manageSubjectFilter).map((c: any) => c.id));
              filteredTests = filteredTests.filter((t: any) => subjectChapters.has(t.chapter_id));
            }
            if (manageSearch.trim()) {
              const q = manageSearch.toLowerCase().trim();
              filteredTests = filteredTests.filter((t: any) =>
                t.title?.toLowerCase().includes(q) ||
                t.chapter_title?.toLowerCase().includes(q) ||
                t.subject_name?.toLowerCase().includes(q) ||
                t.lesson_title?.toLowerCase().includes(q)
              );
            }

            if (filteredTests.length === 0) {
              return (
                <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">No quizzes match your filter or search query.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs font-semibold"
                    onClick={() => {
                      setManageClassFilter("all");
                      setFilterQuizType("all");
                      setManageSubjectFilter("all");
                      setManageSearch("");
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
                        variant="default"
                        onClick={() => handleOpenViewQuiz(t)}
                        className="rounded-full text-xs font-semibold gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                      >
                        <Eye className="size-3.5" />
                        <span>View Quiz ({t.questionCount})</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={isExpanded ? "secondary" : "outline"}
                        onClick={() => handleOpenTestQuestions(t.id)}
                        className="rounded-full text-xs font-semibold gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="size-3.5" />
                        <span>{isExpanded ? "Hide Inline Editor" : "Batch Edit"}</span>
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
                            }, "Quiz deleted successfully.");
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
                                        setEditingQuestionState((prev: any) => ({
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
                                      setEditingQuestionState((prev: any) => ({
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
                                                setEditingQuestionState((prev: any) => ({
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
                                                setEditingQuestionState((prev: any) => {
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
                                        setEditingQuestionState((prev: any) => ({
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
                                        setEditingQuestionState((prev: any) => ({
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

      {/* Dedicated Quiz Reader View Modal */}
      <Dialog open={Boolean(viewQuizTest)} onOpenChange={(open) => !open && setViewQuizTest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          {viewQuizTest && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {viewQuizTest.chapterTitle || "General Quiz"}
                  </Badge>
                  {viewQuizTest.lectureTitle && (
                    <Badge variant="secondary" className="text-xs">
                      Lesson: {viewQuizTest.lectureTitle}
                    </Badge>
                  )}
                  <Badge variant="default" className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {viewQuizQuestions.length} Questions
                  </Badge>
                </div>
                <DialogTitle className="font-display text-xl sm:text-2xl font-bold flex items-center justify-between gap-3">
                  <span>{viewQuizTest.title}</span>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Quiz Reader Mode · Review all questions, verified answers, explanations, and LaTeX formulas.
                </DialogDescription>
              </DialogHeader>

              {/* Questions List */}
              {loadingViewQuiz ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading quiz questions...
                </div>
              ) : viewQuizQuestions.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-2xl">
                  No questions found in this quiz yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {viewQuizQuestions.map((q: any, idx: number) => {
                    const isEditing = editingViewQuestionId === q.id;
                    const qState = editingQuestionState[q.id] || {
                      prompt: q.prompt,
                      options: [...q.options],
                      correct_index: q.correct_index,
                      explanation: q.explanation ?? "",
                      topic: q.topic ?? "",
                      difficulty: q.difficulty ?? "medium",
                    };
                    const isSaving = savingQuestionId === q.id;

                    if (isEditing) {
                      return (
                        <Card key={q.id} className="rounded-2xl border-primary/50 bg-primary/5 p-4 sm:p-5 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs uppercase text-primary">Editing Question {idx + 1}</span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                disabled={isSaving}
                                onClick={async () => {
                                  await handleSaveSingleQuestion(q.id, viewQuizTest.id);
                                  setEditingViewQuestionId(null);
                                  const updatedQs = await fetchTestQuestions({ data: { testId: viewQuizTest.id } });
                                  setViewQuizQuestions(updatedQs || []);
                                }}
                                className="h-7 rounded-full text-xs font-semibold gap-1 bg-primary text-primary-foreground"
                              >
                                <Save className="size-3" />
                                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingViewQuestionId(null)}
                                className="h-7 text-xs rounded-full"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Question Prompt</Label>
                            <Textarea
                              rows={2}
                              value={qState.prompt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingQuestionState((prev: any) => ({
                                  ...prev,
                                  [q.id]: { ...prev[q.id], prompt: val },
                                }));
                              }}
                              className="text-xs sm:text-sm rounded-xl bg-background"
                            />
                            {(qState.prompt.includes("$") || qState.prompt.includes("\\")) && (
                              <div className="rounded-lg bg-background/80 p-2 text-xs border border-border/60">
                                <MathText content={qState.prompt} />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Options (Select radio for correct answer)</Label>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {qState.options.map((opt: string, optIdx: number) => {
                                const isCorrect = qState.correct_index === optIdx;
                                return (
                                  <div
                                    key={optIdx}
                                    className={cn(
                                      "flex flex-col gap-1 rounded-xl border p-2 text-xs bg-background transition-all",
                                      isCorrect ? "border-emerald-500 bg-emerald-500/10" : "border-border/60"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct_clean_view_${q.id}`}
                                        checked={isCorrect}
                                        onChange={() => {
                                          setEditingQuestionState((prev: any) => ({
                                            ...prev,
                                            [q.id]: { ...prev[q.id], correct_index: optIdx },
                                          }));
                                        }}
                                        className="size-4 accent-emerald-600 shrink-0"
                                      />
                                      <span className="font-bold text-xs shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                                      <Input
                                        value={opt}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setEditingQuestionState((prev: any) => {
                                            const currentOpts = [...(prev[q.id]?.options || [])];
                                            currentOpts[optIdx] = val;
                                            return {
                                              ...prev,
                                              [q.id]: { ...prev[q.id], options: currentOpts },
                                            };
                                          });
                                        }}
                                        className="h-7 text-xs border-0 shadow-none focus-visible:ring-1"
                                      />
                                    </div>
                                    {(opt.includes("$") || opt.includes("\\")) && (
                                      <div className="text-xs bg-secondary/30 rounded px-2 py-1 ml-6 border border-border/40">
                                        <MathText content={opt} />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold">Explanation</Label>
                            <Input
                              value={qState.explanation}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingQuestionState((prev: any) => ({
                                  ...prev,
                                  [q.id]: { ...prev[q.id], explanation: val },
                                }));
                              }}
                              className="h-7 text-xs rounded-xl bg-background"
                            />
                            {(qState.explanation?.includes("$") || qState.explanation?.includes("\\")) && (
                              <div className="text-xs bg-background/80 rounded px-2 py-1 border border-border/40">
                                <MathText content={qState.explanation} />
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    }

                    return (
                      <Card key={q.id} className="rounded-2xl border-border/80 bg-card p-4 sm:p-5 space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {idx + 1}
                            </span>
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-foreground">
                                <MathText content={q.prompt} />
                              </div>
                              {q.topic && (
                                <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                                  {q.topic}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingViewQuestionId(q.id)}
                            className="h-7 px-2.5 text-xs rounded-full gap-1 text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <Edit3 className="size-3" />
                            <span>Quick Edit</span>
                          </Button>
                        </div>

                        {/* Options Grid */}
                        <div className="grid gap-2 sm:grid-cols-2 pt-1">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isCorrect = q.correct_index === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-xl border p-2.5 text-xs transition-colors",
                                  isCorrect
                                    ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-400"
                                    : "border-border/60 bg-secondary/30 text-foreground"
                                )}
                              >
                                <span className={cn(
                                  "grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                                  isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                                )}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <div className="min-w-0 flex-1 break-words">
                                  <MathText content={opt} />
                                </div>
                                {isCorrect && (
                                  <Badge className="ml-auto text-[10px] bg-emerald-600 text-white px-1.5 py-0">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-foreground/90 space-y-1">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider block">
                              Explanation:
                            </span>
                            <MathText content={q.explanation} />
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  Changes made here instantly update the quiz for all students taking chapter practice.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewQuizTest(null)}
                  className="rounded-full text-xs font-semibold px-5"
                >
                  Close Reader
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
