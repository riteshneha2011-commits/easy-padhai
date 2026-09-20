import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Check,
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
  Clock,
  MessageCircle,
  BellRing,
} from "lucide-react";
import { getCatalog } from "@/lib/content.functions";
import { getUserCompletedLessons } from "@/lib/learn.functions";
import { useAuth } from "@/hooks/use-auth";
import { useActiveClass } from "@/hooks/use-active-class";
import { ClassSwitcher } from "@/components/class-switcher";
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
          "Browse Class 9 to 12 Science, Maths, Physics, Chemistry, Biology & Social Science chapters: audio lectures, video explanations, revision summaries and tests.",
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
  const { data: allSubjects } = useSuspenseQuery(catalogQuery);
  const { activeClass, switchClass, classLabel } = useActiveClass();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { subject?: string; chapter?: string };

  // Filter subjects for active class, prioritizing subjects with available content
  const classSubjects = useMemo(() => {
    const subjects = allSubjects.filter((s) => s.class_level === activeClass);
    return [...subjects].sort((a, b) => {
      const aLessons = a.chapters?.reduce((acc, c) => acc + (c.lessonCount ?? c.lessons?.length ?? 0), 0) ?? 0;
      const bLessons = b.chapters?.reduce((acc, c) => acc + (c.lessonCount ?? c.lessons?.length ?? 0), 0) ?? 0;
      const aHas = (a.chapters?.length ?? 0) > 0 && aLessons > 0 ? 1 : 0;
      const bHas = (b.chapters?.length ?? 0) > 0 && bLessons > 0 ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas; // subjects with active content first
      return (a.order_index ?? 0) - (b.order_index ?? 0);
    });
  }, [allSubjects, activeClass]);

  // Check if any chapters exist for this class
  const totalChaptersInClass = useMemo(() => {
    return classSubjects.reduce((acc, s) => acc + (s.chapters?.length ?? 0), 0);
  }, [classSubjects]);

  const isClassComingSoon = totalChaptersInClass === 0;

  // Navigation & filter state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSub = urlParams.get("subject");
      if (urlSub) return urlSub;
      const saved = localStorage.getItem(`easypadhai_active_subject_${activeClass}`);
      if (saved) return saved;
    }
    return "";
  });
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlChap = urlParams.get("chapter");
      if (urlChap) return urlChap;
      const sub = localStorage.getItem(`easypadhai_active_subject_${activeClass}`);
      if (sub) {
        const savedChap = localStorage.getItem(`easypadhai_active_chapter_${sub}`);
        if (savedChap) return savedChap;
      }
    }
    return "";
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"stepper" | "grid">("stepper");

  // Effective subject (declared BEFORE any useEffect or handlers that use it)
  const activeSubject = useMemo(() => {
    if (selectedSubjectId) {
      const found = classSubjects.find((s) => s.id === selectedSubjectId);
      if (found) return found;
    }
    return classSubjects[0] ?? null;
  }, [classSubjects, selectedSubjectId]);

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

  // Persistent last study session & PWA auto-resume
  const [lastStudy, setLastStudy] = useState<{
    slug: string;
    chapterId: string;
    chapterTitle: string;
    subjectName?: string;
    lessonId: string;
    lessonTitle?: string;
    updatedAt: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("easypadhai_last_study");
      if (raw) {
        const parsed = JSON.parse(raw);
        // Valid if within last 30 days and has slug & lessonId
        if (parsed?.slug && parsed?.lessonId && Date.now() - (parsed.updatedAt || 0) < 30 * 86400 * 1000) {
          setLastStudy(parsed);

          // If launched in PWA standalone mode (app icon on phone screen)
          const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;

          const hasRedirectedThisSession = sessionStorage.getItem("easypadhai_pwa_auto_resumed");
          if (isStandalone && !hasRedirectedThisSession) {
            sessionStorage.setItem("easypadhai_pwa_auto_resumed", "true");
            void navigate({
              to: "/learn/$slug",
              params: { slug: parsed.slug },
              search: { lesson: parsed.lessonId } as any,
            });
          }
        }
      }
    } catch (e) {
      console.warn("[LearnIndex] Could not parse last study record:", e);
    }
  }, [navigate]);

  // When active class changes, load the saved subject for that class
  useEffect(() => {
    if (classSubjects.length === 0) return;
    const savedSub = localStorage.getItem(`easypadhai_active_subject_${activeClass}`);
    const validSub =
      savedSub && classSubjects.some((s) => s.id === savedSub) ? savedSub : classSubjects[0]?.id ?? "";
    setSelectedSubjectId(validSub);
    const targetSub = classSubjects.find((s) => s.id === validSub);
    const savedChap = targetSub ? localStorage.getItem(`easypadhai_active_chapter_${validSub}`) : null;
    const validChap =
      savedChap && targetSub?.chapters.some((c) => c.id === savedChap)
        ? savedChap
        : targetSub?.chapters[0]?.id ?? "";
    setSelectedChapterId(validChap);
  }, [activeClass]);

  // Sync from URL if changed via external browser navigation (e.g. back/forward)
  useEffect(() => {
    if (
      searchParams?.subject &&
      searchParams.subject !== selectedSubjectId &&
      classSubjects.some((s) => s.id === searchParams.subject)
    ) {
      setSelectedSubjectId(searchParams.subject);
    }
  }, [searchParams?.subject]);

  useEffect(() => {
    if (searchParams?.chapter && searchParams.chapter !== selectedChapterId) {
      setSelectedChapterId(searchParams.chapter);
    }
  }, [searchParams?.chapter]);

  const handleSubjectChange = (newSubjectId: string) => {
    setSelectedSubjectId(newSubjectId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`easypadhai_active_subject_${activeClass}`, newSubjectId);
        const savedChap = localStorage.getItem(`easypadhai_active_chapter_${newSubjectId}`);
        const targetSub = classSubjects.find((s) => s.id === newSubjectId);
        const nextChapId =
          savedChap && targetSub?.chapters.some((c) => c.id === savedChap)
            ? savedChap
            : targetSub?.chapters[0]?.id ?? "";
        setSelectedChapterId(nextChapId);

        void navigate({
          to: "/learn",
          search: { subject: newSubjectId, chapter: nextChapId || undefined } as any,
          replace: true,
        });
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleChapterChange = (newChapterId: string) => {
    setSelectedChapterId(newChapterId);
    if (typeof window !== "undefined" && activeSubject) {
      try {
        localStorage.setItem(`easypadhai_active_chapter_${activeSubject.id}`, newChapterId);
        void navigate({
          to: "/learn",
          search: { subject: activeSubject.id, chapter: newChapterId } as any,
          replace: true,
        });
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // User progress tracking across lessons
  const { user } = useAuth();
  const completedQuery = useQuery({
    queryKey: ["user-completed-lessons", user?.id],
    queryFn: () => getUserCompletedLessons(),
    enabled: Boolean(user),
  });
  const completedLessonIds = useMemo(
    () => new Set(completedQuery.data ?? []),
    [completedQuery.data]
  );

  const activeChapterLessons = activeChapter?.lessons ?? [];
  const completedCountInActiveChapter = useMemo(
    () => activeChapterLessons.filter((l) => completedLessonIds.has(l.id)).length,
    [activeChapterLessons, completedLessonIds]
  );
  const activeChapterProgressPercent = activeChapterLessons.length
    ? Math.round((completedCountInActiveChapter / activeChapterLessons.length) * 100)
    : 0;

  // Filtered chapters for grid / search
  const filteredGridChapters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return classSubjects.flatMap((sub) =>
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
  }, [classSubjects, selectedSubjectId, searchQuery]);

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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <GraduationCap className="size-3.5" /> {classLabel(activeClass)} Curriculum
            </div>
            <ClassSwitcher size="sm" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Curriculum Explorer
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            {isClassComingSoon
              ? `Browse planned subjects for ${classLabel(activeClass)} and get instant alerts when lectures go live.`
              : `Choose your subject, select a chapter, and dive into 10–25 minute audio lectures, video lessons, and instant tests.`}
          </p>
        </div>

        {/* View Mode Switcher (only if class has chapters) */}
        {!isClassComingSoon && (
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
        )}
      </div>

      {/* Resume Active Learning Banner */}
      {lastStudy && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/35 bg-gradient-to-r from-primary/15 via-primary/5 to-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
              <PlayCircle className="size-6" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/15 px-2.5 py-0.5 rounded-full">
                  Pick Up Where You Left Off
                </span>
                {lastStudy.subjectName && (
                  <span className="text-xs text-muted-foreground font-semibold hidden xs:inline">
                    {lastStudy.subjectName}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-foreground truncate">
                {lastStudy.chapterTitle}
                {lastStudy.lessonTitle ? ` · ${lastStudy.lessonTitle}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-medium pt-0.5">
                <span className="inline-flex items-center gap-1 text-primary">
                  <Headphones className="size-3" /> Audio
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Zap className="size-3" /> Summary
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <FileText className="size-3" /> Notes
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                  <Sparkles className="size-3" /> Quiz Included
                </span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() =>
              navigate({
                to: "/learn/$slug",
                params: { slug: lastStudy.slug },
                search: { lesson: lastStudy.lessonId } as any,
              })
            }
            className="rounded-xl font-bold gap-1.5 shadow-glow shrink-0 w-full sm:w-auto h-10 px-5"
          >
            <span>Continue Learning</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {/* If Class has no chapters yet: High-Impact Launching Soon Screen */}
      {isClassComingSoon && (
        <div className="space-y-8 py-2">
          <Card className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 sm:p-10 shadow-sm">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3.5 py-1 text-xs font-bold text-primary">
                <Clock className="size-3.5 animate-spin" /> Recording in Progress
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                🚀 {classLabel(activeClass)} Audio Library is Launching Soon!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Story-driven audio lectures, formula cheat-sheets, NCERT solutions and instant chapter quizzes for <strong className="text-foreground">{classLabel(activeClass)}</strong> are being prepared under the expert guidance of <strong>Ritesh Sir</strong> (21+ years of teaching experience).
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md">
                  <a href="https://chat.whatsapp.com/EoYLQlgFRTnAQila8ajGE7" target="_blank" rel="noreferrer">
                    <BellRing className="size-4" /> Join WhatsApp VIP Alerts
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-border/80 font-bold gap-2">
                  <a href={`https://wa.me/917000588028?text=Hi%20Ritesh%20Sir,%20I%20am%20excited%20for%20${encodeURIComponent(classLabel(activeClass))}%20lectures!`} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4 text-emerald-600" /> Chat with Ritesh Sir
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => switchClass(9)}
                  className="rounded-full text-xs font-semibold text-primary hover:underline"
                >
                  Explore Class 9th Live Syllabus →
                </Button>
              </div>
            </div>
          </Card>

          {/* Planned Subjects Grid for this Class */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-primary" /> Planned Subjects for {classLabel(activeClass)}
              </h3>
              <span className="text-xs text-muted-foreground font-semibold">
                {classSubjects.length} {classSubjects.length === 1 ? "Subject" : "Subjects"} in Curriculum
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classSubjects.map((sub) => {
                const SubIcon = getSubjectIcon(sub.name);
                return (
                  <Card key={sub.id} className="rounded-3xl border-border/70 p-5 bg-card space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
                        <SubIcon className="size-5" />
                      </div>
                      <Badge variant="secondary" className="rounded-full text-[10px] font-bold">
                        🎙️ In Production
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-foreground">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sub.description || `Comprehensive concepts, audio stories & revision notes for ${classLabel(activeClass)} ${sub.name}.`}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/40 text-[11px] font-semibold text-primary flex items-center gap-1">
                      <Sparkles className="size-3" /> Audio + Notes + MCQs
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODE A: SEQUENTIAL DROPDOWN NAVIGATION (Subject ➔ Chapter ➔ Lesson) */}
      {!isClassComingSoon && viewMode === "stepper" && (
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
                  value={activeSubject?.id ?? ""}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                >
                  {classSubjects.map((sub) => (
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
                  onChange={(e) => handleChapterChange(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                >
                  {subjectChapters.map((chap, idx) => {
                    const chapLessons = chap.lessons ?? [];
                    const chapDone = chapLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
                    const isFullyDone = chapLessons.length > 0 && chapDone === chapLessons.length;
                    const suffix = isFullyDone
                      ? "✓ (Completed)"
                      : chapDone > 0
                      ? `(${chapDone}/${chap.lessonCount ?? chapLessons.length} Done)`
                      : `(${chap.lessonCount ?? chapLessons.length} lessons)`;

                    return (
                      <option key={chap.id} value={chap.id}>
                        Ch {idx + 1}: {chap.title} · {suffix}
                      </option>
                    );
                  })}
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
              <Card className="rounded-3xl border-primary/30 bg-primary/5 p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                    <ActiveSubjectIcon className="size-3.5 text-primary" />
                    <span>{activeSubject?.name}</span>
                  </Badge>
                  <div className="flex items-center gap-2">
                    {user && activeChapterLessons.length > 0 && completedCountInActiveChapter > 0 && (
                      <Badge
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-bold border flex items-center gap-1",
                          activeChapterProgressPercent === 100
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                            : "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        <Check className="size-3 stroke-[3]" />
                        {activeChapterProgressPercent === 100
                          ? "Chapter Completed 🎉"
                          : `${completedCountInActiveChapter}/${activeChapterLessons.length} Completed`}
                      </Badge>
                    )}
                    <span className="text-xs font-semibold text-muted-foreground">
                      {activeChapterLessons.length} {activeChapterLessons.length === 1 ? "Lesson" : "Lessons"} published
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                      {activeChapter.title}
                    </h2>
                    {activeChapter.description && (
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {activeChapter.description}
                      </p>
                    )}
                  </div>

                  {(() => {
                    const currentIdx = subjectChapters.findIndex((c) => c.id === activeChapter.id);
                    const nextChap =
                      currentIdx >= 0 && currentIdx < subjectChapters.length - 1
                        ? subjectChapters[currentIdx + 1]
                        : null;

                    if (activeChapterProgressPercent === 100 && nextChap) {
                      return (
                        <Button
                          asChild
                          size="sm"
                          className="rounded-full font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs sm:text-sm gap-1.5 h-10 px-4"
                        >
                          <Link to="/learn/$slug" params={{ slug: nextChap.slug }}>
                            <span>Next Chapter: {nextChap.title}</span>
                            <ArrowRight className="size-4 shrink-0" />
                          </Link>
                        </Button>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Progress bar if logged in */}
                {user && activeChapterLessons.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>Chapter Completion</span>
                      <span className="text-foreground font-bold">{activeChapterProgressPercent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/15">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${activeChapterProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
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
                    Tap any lesson to open directly
                  </span>
                </div>

                <div className="grid gap-3">
                  {activeChapterLessons.map((lesson, idx) => {
                    const isDone = completedLessonIds.has(lesson.id);

                    return (
                      <Link
                        key={lesson.id}
                        to="/learn/$slug"
                        params={{ slug: activeChapter.slug }}
                        search={{ lesson: lesson.id } as any}
                        className="group block"
                      >
                        <Card
                          className={cn(
                            "rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                            isDone
                              ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/70"
                              : "border-border/70 hover:border-primary/50 bg-card"
                          )}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {isDone ? (
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs mt-0.5 shadow-xs">
                                <Check className="size-4 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mt-0.5">
                                {idx + 1}
                              </div>
                            )}

                            <div className="min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={cn(
                                    "text-sm sm:text-base font-bold transition-colors leading-snug",
                                    isDone
                                      ? "text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                                      : "text-foreground group-hover:text-primary"
                                  )}
                                >
                                  {lesson.title}
                                </h4>
                                {isDone && (
                                  <Badge className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border-0 px-2 py-0.5 gap-1">
                                    <Check className="size-3 stroke-[3]" /> Completed
                                  </Badge>
                                )}
                              </div>

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
                                  <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full font-semibold">
                                    <Zap className="size-3" /> Quick Summary
                                  </span>
                                )}
                                {lesson.hasQuiz && (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                                    <Sparkles className="size-3" /> Quick Quiz
                                  </span>
                                )}
                                {lesson.duration_minutes && (
                                  <span>· {lesson.duration_minutes} mins</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end sm:justify-center shrink-0">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full px-3.5 py-1.5 transition-colors">
                                Review Lecture <ChevronRight className="size-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform bg-secondary/80 rounded-full px-3.5 py-1.5">
                                Start Lesson <ChevronRight className="size-3.5" />
                              </span>
                            )}
                          </div>
                        </Card>
                      </Link>
                    );
                  })}

                  {activeChapterLessons.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground space-y-2">
                      <BookOpen className="size-8 mx-auto text-muted-foreground/60" />
                      <p className="text-sm font-semibold">No lessons published in this chapter yet.</p>
                    </div>
                  )}

                  {/* Chapter Test Card */}
                  {activeChapter.testId && (
                    <Link
                      to="/test/$testId"
                      params={{ testId: activeChapter.testId }}
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
      {!isClassComingSoon && viewMode === "grid" && (
        <div className="space-y-6">
          {/* Quick Search & Subject Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubjectId("all");
                  void navigate({ to: "/learn", search: { subject: "all" } as any, replace: true });
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold transition-all",
                  selectedSubjectId === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                All Subjects
              </button>
              {classSubjects.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubjectId(sub.id);
                    void navigate({ to: "/learn", search: { subject: sub.id } as any, replace: true });
                  }}
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
                      <div className="flex items-center gap-1.5">
                        {user && (() => {
                          const chapLessons = chapter.lessons ?? [];
                          const doneCount = chapLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
                          const isFullyDone = chapLessons.length > 0 && doneCount === chapLessons.length;
                          if (isFullyDone) {
                            return (
                              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30 px-2 py-0">
                                ✓ Done
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                        <Badge variant="secondary" className="rounded-full text-[10px] px-2">
                          Ch {chapter.order_index}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-foreground line-clamp-2">
                      {chapter.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3 text-[11px] font-medium text-muted-foreground">
                    <span className="rounded-full bg-muted/60 px-2 py-0.5 font-semibold text-foreground">
                      {chapter.lessonCount} {chapter.lessonCount === 1 ? "Lesson" : "Lessons"}
                    </span>
                    {user && (
                      (() => {
                        const chapLessons = chapter.lessons ?? [];
                        const doneCount = chapLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
                        if (doneCount === 0) return null;
                        const isFullyDone = chapLessons.length > 0 && doneCount === chapLessons.length;
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold",
                              isFullyDone
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                : "bg-primary/15 text-primary"
                            )}
                          >
                            <Check className="size-3 stroke-[3]" />
                            {isFullyDone ? "✓ Completed 🎉" : `${doneCount}/${chapter.lessonCount} Done`}
                          </span>
                        );
                      })()
                    )}
                    <span className="flex items-center gap-1 text-primary">
                      <Headphones className="size-3" /> Audio
                    </span>
                    <span className="flex items-center gap-1 text-blue-500">
                      <PlayCircle className="size-3" /> Video
                    </span>
                    {(chapter.lessons ?? []).some((l: any) => l.hasPdf) && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <FileText className="size-3" /> Notes
                      </span>
                    )}
                    {(chapter.lessons ?? []).some((l: any) => l.hasSummary) && (
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <Zap className="size-3" /> Summary
                      </span>
                    )}
                    {(chapter.testId || (chapter.lessons ?? []).some((l: any) => l.hasQuiz)) && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
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

