import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  Headphones,
  PlayCircle,
  Search,
  Sparkles,
  Zap,
  Atom,
  Calculator,
  Globe,
} from "lucide-react";
import { getCatalog } from "@/lib/content.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog() });

export const Route = createFileRoute("/learn/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title: "Browse Curriculum — Easy Padhai Class 9–12" },
      {
        name: "description",
        content:
          "Browse Class 9 to 12 Science, Maths & Social Science chapters: audio lectures, video explanations, revision summaries and tests.",
      },
      { property: "og:title", content: "Browse Curriculum — Easy Padhai" },
      {
        property: "og:description",
        content:
          "Hierarchical curriculum browser: Subject ➔ Chapter ➔ Lesson. Audio, video, notes and instant objective tests.",
      },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const { data: subjects } = useSuspenseQuery(catalogQuery);
  const navigate = useNavigate();

  // Navigation & filter state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id ?? "");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"stepper" | "grid">("stepper");

  // Active subject object
  const activeSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0] ?? null;
  }, [subjects, selectedSubjectId]);

  // Chapters under active subject
  const subjectChapters = useMemo(() => {
    if (!activeSubject) return [];
    return activeSubject.chapters ?? [];
  }, [activeSubject]);

  // Active chapter object
  const activeChapter = useMemo(() => {
    if (selectedChapterId) {
      const found = subjectChapters.find((c) => c.id === selectedChapterId);
      if (found) return found;
    }
    return subjectChapters[0] ?? null;
  }, [subjectChapters, selectedChapterId]);

  // Filtered chapters for grid / search
  const filteredGridChapters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return subjects.flatMap((sub) =>
      sub.chapters
        .filter((chap) => {
          if (selectedSubjectId && selectedSubjectId !== "all" && sub.id !== selectedSubjectId) {
            return false;
          }
          if (!query) return true;
          return (
            chap.title.toLowerCase().includes(query) ||
            chap.slug.toLowerCase().includes(query) ||
            sub.name.toLowerCase().includes(query) ||
            (chap.lessons ?? []).some((l) => l.title.toLowerCase().includes(query))
          );
        })
        .map((chap) => ({
          ...chap,
          subjectName: sub.name,
          classLevel: sub.class_level,
        })),
    );
  }, [subjects, selectedSubjectId, searchQuery]);

  // Helper icon for subjects
  function getSubjectIcon(name: string) {
    const n = (name ?? "").toLowerCase();
    if (n.includes("math")) return Calculator;
    if (n.includes("social") || n.includes("history") || n.includes("geography")) return Globe;
    return Atom;
  }

  const ActiveSubjectIcon = activeSubject ? getSubjectIcon(activeSubject.name) : BookOpen;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <GraduationCap className="size-3.5" /> Class 9 Curriculum · Step-by-Step Learning
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Curriculum Explorer
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Choose your subject, select a chapter, and dive into 10–25 minute audio lectures, video lessons, and instant tests.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex items-center rounded-full bg-secondary/80 p-1 self-start md:self-auto border border-border/50">
          <button
            type="button"
            onClick={() => setViewMode("stepper")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
              viewMode === "stepper"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            🎯 Subject ➔ Chapter ➔ Lessons
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            📚 All Chapters Grid
          </button>
        </div>
      </div>

      {/* 2. MODE A: SEQUENTIAL DROPDOWN NAVIGATION (Subject ➔ Chapter ➔ Lesson) */}
      {viewMode === "stepper" && (
        <div className="space-y-6">
          {/* Cascading Filter Bar */}
          <Card className="rounded-3xl border-border/70 shadow-sm bg-card p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 items-center">
              {/* Step 1: Subject Dropdown */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                    1
                  </span>
                  Select Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedChapterId(""); // Reset chapter on subject change
                  }}
                  className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.chapters.length} Chapters)
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Chapter Dropdown */}
              <div className="lg:col-span-5 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                    2
                  </span>
                  Select Chapter
                </label>
                <select
                  value={activeChapter?.id ?? ""}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                >
                  {subjectChapters.map((chap, idx) => (
                    <option key={chap.id} value={chap.id}>
                      Ch {idx + 1}: {chap.title} ({chap.lessonCount} lessons)
                    </option>
                  ))}
                  {subjectChapters.length === 0 && (
                    <option value="">No chapters in this subject</option>
                  )}
                </select>
              </div>

              {/* Action Button */}
              <div className="lg:col-span-3 pt-2 sm:pt-6">
                {activeChapter ? (
                  <Button
                    asChild
                    className="w-full rounded-full bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 h-10 text-xs sm:text-sm gap-1.5"
                  >
                    <Link to="/learn/$slug" params={{ slug: activeChapter.slug }}>
                      Open Chapter <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full rounded-full h-10 text-xs">
                    Select a chapter
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Step 3: Interactive Lesson Explorer */}
          {activeChapter ? (
            <div className="space-y-4">
              {/* Active Chapter Header Card */}
              <Card className="rounded-3xl border-primary/30 bg-primary/5 p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                    <ActiveSubjectIcon className="size-3.5 text-primary" />
                    <span>{activeSubject?.name}</span>
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {(activeChapter.lessons ?? []).length} {(activeChapter.lessons ?? []).length === 1 ? "Lesson" : "Lessons"} published
                  </span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                    {activeChapter.title}
                  </h2>
                  {activeChapter.description && (
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {activeChapter.description}
                    </p>
                  )}
                </div>
              </Card>

              {/* Lesson Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                      3
                    </span>
                    Lesson Breakdown & Audio Lectures
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    Tap any lesson to start
                  </span>
                </div>

                <div className="grid gap-3">
                  {(activeChapter.lessons ?? []).map((lesson, idx) => (
                    <Link
                      key={lesson.id}
                      to="/learn/$slug"
                      params={{ slug: activeChapter.slug }}
                      className="group block"
                    >
                      <Card className="rounded-2xl border-border/70 p-4 sm:p-5 transition-all hover:border-primary/50 hover:shadow-md bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                              {lesson.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-medium">
                              {lesson.hasAudio && (
                                <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                                  <Headphones className="size-3" /> Audio Lecture
                                </span>
                              )}
                              {lesson.hasVideo && (
                                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-semibold">
                                  <PlayCircle className="size-3" /> Video
                                </span>
                              )}
                              {lesson.hasPdf && (
                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold">
                                  <FileText className="size-3" /> Notes
                                </span>
                              )}
                              {lesson.hasSummary && (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                                  <Zap className="size-3" /> Quick Summary
                                </span>
                              )}
                              {lesson.duration_minutes && (
                                <span>· {lesson.duration_minutes} mins</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:justify-center shrink-0">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform bg-secondary/80 rounded-full px-3 py-1.5">
                            Start Lesson <ChevronRight className="size-3.5" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}

                  {(activeChapter.lessons ?? []).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground space-y-2">
                      <BookOpen className="size-8 mx-auto text-muted-foreground/60" />
                      <p className="text-sm font-semibold">No lessons published in this chapter yet.</p>
                    </div>
                  )}

                  {/* Chapter Test Card */}
                  {activeChapter.testId && (
                    <Link
                      to="/learn/$slug"
                      params={{ slug: activeChapter.slug }}
                      className="group block"
                    >
                      <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 transition-all hover:border-emerald-500/60 hover:shadow-md flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            <Sparkles className="size-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">
                              Chapter MCQ Quiz & Instant Assessment
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Instant test with explanations, XP points, and streak score.
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-card rounded-full px-3 py-1.5 shrink-0 border border-emerald-500/20">
                          Take Quiz <ArrowRight className="size-3.5" />
                        </span>
                      </Card>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center text-muted-foreground">
              <p className="text-sm font-medium">Please select a subject and chapter above.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. MODE B: ALL CHAPTERS GRID VIEW (Visual Overview & Search) */}
      {viewMode === "grid" && (
        <div className="space-y-6">
          {/* Quick Search & Subject Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedSubjectId("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold transition-all",
                  selectedSubjectId === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                All Subjects
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold transition-all",
                    selectedSubjectId === sub.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {sub.name} ({sub.chapters.length})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search chapters or topics…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full pl-9 text-xs h-9"
              />
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGridChapters.map((chapter) => {
              const SubIcon = getSubjectIcon(chapter.subjectName);
              return (
                <Card
                  key={chapter.id}
                  onClick={() => navigate({ to: "/learn/$slug", params: { slug: chapter.slug } })}
                  className="card-hover shadow-card cursor-pointer gap-2.5 rounded-3xl border-border/70 p-5 transition-all hover:border-primary/50 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                        <SubIcon className="size-3" />
                        <span>{chapter.subjectName}</span>
                      </span>
                      <Badge variant="secondary" className="rounded-full text-[10px] px-2">
                        Ch {chapter.order_index}
                      </Badge>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-foreground line-clamp-2">
                      {chapter.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3 text-[11px] font-medium text-muted-foreground">
                    <span className="rounded-full bg-muted/60 px-2 py-0.5 font-semibold text-foreground">
                      {chapter.lessonCount} {chapter.lessonCount === 1 ? "Lesson" : "Lessons"}
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <Headphones className="size-3" /> Audio
                    </span>
                    <span className="flex items-center gap-1 text-blue-500">
                      <PlayCircle className="size-3" /> Video
                    </span>
                    {chapter.testId && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <Sparkles className="size-3" /> Quiz
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredGridChapters.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center text-muted-foreground">
              <p className="text-sm font-semibold">No matching chapters found.</p>
              <p className="text-xs mt-1">Try searching for a different topic or resetting filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

