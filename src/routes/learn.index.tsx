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
  Layers,
  X,
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
  validateSearch: (search: Record<string, unknown>) => ({
    class: search.class ? Number(search.class) : undefined,
    subject: (search.subject as string) || undefined,
    chapter: (search.chapter as string) || undefined,
  }),
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
          "Audio-first curriculum browser: Subject ➔ Chapter ➔ Lesson. Audio, video, notes and instant objective tests.",
      },
    ],
  }),
  component: LearnIndex,
});

export default function LearnIndex() {
  const { data: allSubjects } = useSuspenseQuery(catalogQuery);
  const { activeClass, switchClass, classLabel } = useActiveClass();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { class?: number; subject?: string; chapter?: string };

  // Find requested subject from URL across the entire catalog (regardless of current active class)
  const targetSubjectFromUrl = useMemo(() => {
    if (!searchParams?.subject) return null;
    return allSubjects.find((s) => s.id === searchParams.subject || s.slug === searchParams.subject) ?? null;
  }, [allSubjects, searchParams?.subject]);

  // Determine the effective class level
  const effectiveClass = useMemo(() => {
    if (targetSubjectFromUrl) return targetSubjectFromUrl.class_level;
    if (searchParams?.class) return Number(searchParams.class);
    return activeClass;
  }, [targetSubjectFromUrl, searchParams?.class, activeClass]);

  // Synchronize global activeClass if effectiveClass differs
  useEffect(() => {
    if (effectiveClass && effectiveClass !== activeClass) {
      void switchClass(effectiveClass);
    }
  }, [effectiveClass, activeClass, switchClass]);

  // Filter subjects for effective class, prioritizing subjects with available content
  const classSubjects = useMemo(() => {
    const subjects = allSubjects.filter((s) => s.class_level === effectiveClass);
    return [...subjects].sort((a, b) => {
      const aLessons = a.chapters?.reduce((acc, c) => acc + (c.lessonCount ?? c.lessons?.length ?? 0), 0) ?? 0;
      const bLessons = b.chapters?.reduce((acc, c) => acc + (c.lessonCount ?? c.lessons?.length ?? 0), 0) ?? 0;
      const aHas = (a.chapters?.length ?? 0) > 0 && aLessons > 0 ? 1 : 0;
      const bHas = (b.chapters?.length ?? 0) > 0 && bLessons > 0 ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas; // subjects with active content first
      return (a.order_index ?? 0) - (b.order_index ?? 0);
    });
  }, [allSubjects, effectiveClass]);

  // Check if any chapters exist for this class
  const totalChaptersInClass = useMemo(() => {
    return classSubjects.reduce((acc, s) => acc + (s.chapters?.length ?? 0), 0);
  }, [classSubjects]);

  const isClassComingSoon = totalChaptersInClass === 0;

  // Selected subject: "all" or specific subject ID
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (targetSubjectFromUrl) return targetSubjectFromUrl.id;
    return classSubjects[0]?.id ?? "all";
  });

  const [searchQuery, setSearchQuery] = useState<string>("");

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
        const matchesClass = parsed?.classLevel ? parsed.classLevel === activeClass : true;
        const existsInClass = classSubjects.some((s) =>
          s.chapters?.some((c) => c.slug === parsed?.slug || c.id === parsed?.chapterId),
        );
        if (
          matchesClass &&
          existsInClass &&
          parsed?.slug &&
          parsed?.lessonId &&
          Date.now() - (parsed.updatedAt || 0) < 30 * 86400 * 1000
        ) {
          setLastStudy(parsed);

          // If launched in PWA standalone mode
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
        } else {
          setLastStudy(null);
        }
      } else {
        setLastStudy(null);
      }
    } catch (e) {
      console.warn("[LearnIndex] Could not parse last study record:", e);
      setLastStudy(null);
    }
  }, [navigate, activeClass, classSubjects]);

  // Sync selectedSubjectId if URL changes or active class changes
  useEffect(() => {
    if (targetSubjectFromUrl) {
      setSelectedSubjectId(targetSubjectFromUrl.id);
    } else if (selectedSubjectId !== "all" && !classSubjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(classSubjects[0]?.id ?? "all");
    }
  }, [targetSubjectFromUrl, classSubjects, selectedSubjectId]);

  const handleSubjectSelect = (subId: string) => {
    setSelectedSubjectId(subId);
    void navigate({
      to: "/learn",
      search: {
        class: effectiveClass,
        subject: subId === "all" ? undefined : subId,
      } as any,
      replace: true,
    });
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

  // Helper icon for subjects
  function getSubjectIcon(name: string) {
    const n = (name ?? "").toLowerCase();
    if (n.includes("math")) return Calculator;
    if (n.includes("social") || n.includes("history") || n.includes("geography") || n.includes("civics")) return Globe;
    return Atom;
  }

  // Filtered chapters for visual grid
  const filteredChapters = useMemo(() => {
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
          subjectId: sub.id,
          subjectName: sub.name,
          classLevel: sub.class_level,
        })),
    );
  }, [classSubjects, selectedSubjectId, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 py-4 sm:py-10 space-y-5 sm:space-y-8 min-w-0 max-w-full pb-28 sm:pb-12 overflow-x-hidden">
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
              : `Tap any subject or chapter to dive directly into audio lectures, video explanations, revision notes, and quizzes.`}
          </p>
        </div>
      </div>

      {/* 2. Resume Active Learning Banner */}
      {lastStudy && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/35 bg-gradient-to-r from-primary/15 via-primary/5 to-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm w-full">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 w-full">
            <div className="size-10 sm:size-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md mt-0.5 sm:mt-0">
              <PlayCircle className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/15 px-2.5 py-0.5 rounded-full shrink-0">
                  Pick Up Where You Left Off
                </span>
                {lastStudy.subjectName && (
                  <span className="text-xs text-muted-foreground font-semibold truncate hidden xs:inline">
                    {lastStudy.subjectName}
                  </span>
                )}
              </div>
              {(() => {
                const rawLesson = lastStudy.lessonTitle?.trim();
                const rawChapter = lastStudy.chapterTitle?.trim();
                const isDuplicate =
                  rawLesson &&
                  rawChapter &&
                  (rawLesson.toLowerCase() === rawChapter.toLowerCase() ||
                    rawLesson.toLowerCase().startsWith(rawChapter.toLowerCase() + " ") ||
                    rawLesson.toLowerCase().startsWith(rawChapter.toLowerCase() + ":") ||
                    rawLesson.toLowerCase().startsWith(rawChapter.toLowerCase() + " -") ||
                    rawLesson.toLowerCase().startsWith(rawChapter.toLowerCase() + " ·"));
                const displayLesson = isDuplicate
                  ? rawLesson.slice(rawChapter.length).replace(/^[:\s\-–—·]+/, "").trim() || null
                  : rawLesson || null;

                return (
                  <p
                    className="text-sm sm:text-base font-bold text-foreground truncate max-w-full"
                    title={`${lastStudy.chapterTitle}${displayLesson ? ` · ${displayLesson}` : ""}`}
                  >
                    <span>{lastStudy.chapterTitle}</span>
                    {displayLesson && (
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground"> · {displayLesson}</span>
                    )}
                  </p>
                );
              })()}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground font-medium pt-0.5">
                <span className="inline-flex items-center gap-1 text-primary shrink-0">
                  <Headphones className="size-3" /> Audio
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Zap className="size-3" /> Summary
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 shrink-0">
                  <FileText className="size-3" /> Notes
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold shrink-0">
                  <Sparkles className="size-3" /> Quiz
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

      {/* 3. 60-Second Memory Boost */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm w-full">
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 w-full">
          <div className="size-10 sm:size-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md mt-0.5 sm:mt-0">
            <Sparkles className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full shrink-0">
                ⚡ 60-Sec Memory Boost
              </span>
              <span className="text-xs text-muted-foreground font-semibold truncate hidden xs:inline">
                Spaced Repetition & Weak Spot Drill
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              Review saved bookmarks, key concepts & your mistake box
            </p>
            <p className="text-xs text-muted-foreground">
              Scientifically proven to lock 80%+ concepts in long-term memory with 1-minute daily recall.
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl font-bold gap-1.5 border-amber-500/40 hover:bg-amber-500/15 text-foreground shrink-0 w-full sm:w-auto h-10 px-4"
        >
          <Link to="/revision">
            <span>Quick Revision</span>
            <ArrowRight className="size-4 text-amber-600 dark:text-amber-400" />
          </Link>
        </Button>
      </div>

      {/* 4. If Class has no chapters yet: Launching Soon Card */}
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

          {/* Planned Subjects Grid */}
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

      {/* 5. Modern Unified Curriculum Hub (When Chapters Exist) */}
      {!isClassComingSoon && (
        <div className="space-y-6">
          {/* Visual Subject Selection Carousel / Pills */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" /> Select Subject
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {totalChaptersInClass} Chapters Available
              </span>
            </div>

            <div className="flex flex-wrap gap-2 w-full">
              <button
                type="button"
                onClick={() => handleSubjectSelect("all")}
                className={cn(
                  "flex-1 min-w-[130px] sm:flex-initial sm:min-w-0 inline-flex items-center justify-between sm:justify-start gap-2 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all border shadow-xs",
                  selectedSubjectId === "all"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="size-4 shrink-0" />
                  <span className="truncate">All Subjects</span>
                </div>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-extrabold shrink-0",
                  selectedSubjectId === "all" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {totalChaptersInClass}
                </span>
              </button>

              {classSubjects.map((sub) => {
                const SubIcon = getSubjectIcon(sub.name);
                const isSelected = selectedSubjectId === sub.id;
                const chapCount = sub.chapters?.length ?? 0;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSubjectSelect(sub.id)}
                    className={cn(
                      "flex-1 min-w-[130px] sm:flex-initial sm:min-w-0 inline-flex items-center justify-between sm:justify-start gap-2 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all border shadow-xs",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <SubIcon className="size-4 shrink-0" />
                      <span className="truncate">{sub.name}</span>
                    </div>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-extrabold shrink-0",
                      isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {chapCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Topic Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/70 shadow-xs w-full min-w-0">
            <div className="relative w-full sm:w-80 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search chapters, concepts, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full pl-10 pr-9 text-xs sm:text-sm h-10 border-input bg-background w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto text-xs font-semibold text-muted-foreground px-1">
              <span>
                Showing <strong className="text-foreground">{filteredChapters.length}</strong> {filteredChapters.length === 1 ? "chapter" : "chapters"}
              </span>
            </div>
          </div>

          {/* Chapters Grid / Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
            {filteredChapters.map((chapter) => {
              const SubIcon = getSubjectIcon(chapter.subjectName);
              const chapLessons = chapter.lessons ?? [];
              const doneCount = chapLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
              const isFullyDone = chapLessons.length > 0 && doneCount === chapLessons.length;
              const hasStarted = doneCount > 0;

              return (
                <Card
                  key={chapter.id}
                  className="rounded-3xl border-border/80 bg-card p-4 sm:p-5 transition-all hover:border-primary/50 hover:shadow-md flex flex-col justify-between gap-4 group w-full min-w-0 max-w-full overflow-hidden"
                >
                  <div className="space-y-3 w-full min-w-0">
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 w-full min-w-0">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary truncate min-w-0">
                        <SubIcon className="size-3.5 shrink-0" />
                        <span className="truncate">{chapter.subjectName}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {user && isFullyDone && (
                          <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 px-2 py-0.5 gap-1 shrink-0">
                            <Check className="size-2.5 stroke-[3]" /> Done
                          </Badge>
                        )}
                        {user && hasStarted && !isFullyDone && (
                          <Badge className="bg-primary/15 text-primary text-[10px] font-bold border border-primary/20 px-2 py-0.5 shrink-0">
                            {doneCount}/{chapLessons.length} Done
                          </Badge>
                        )}
                        <Badge variant="secondary" className="rounded-full text-[10px] font-bold px-2 py-0.5 shrink-0">
                          Ch {chapter.order_index}
                        </Badge>
                      </div>
                    </div>

                    {/* Chapter Title */}
                    <Link
                      to="/learn/$slug"
                      params={{ slug: chapter.slug }}
                      className="block group-hover:text-primary transition-colors min-w-0 w-full"
                    >
                      <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-foreground break-words line-clamp-2">
                        {chapter.title}
                      </h3>
                    </Link>

                    {chapter.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
                        {chapter.description}
                      </p>
                    )}

                    {/* Quick Lesson Preview (up to 2 items) */}
                    {chapLessons.length > 0 && (
                      <div className="space-y-1.5 pt-1 w-full min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          Lectures preview
                        </div>
                        <div className="space-y-1 w-full min-w-0">
                          {chapLessons.slice(0, 2).map((lesson: any, idx: number) => {
                            const isDone = completedLessonIds.has(lesson.id);
                            return (
                              <Link
                                key={lesson.id}
                                to="/learn/$slug"
                                params={{ slug: chapter.slug }}
                                search={{ lesson: lesson.id } as any}
                                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-foreground group/item w-full min-w-0 gap-2 overflow-hidden"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                                  <span className="text-[10px] font-bold text-muted-foreground shrink-0">#{idx + 1}</span>
                                  <span className="truncate block font-medium group-hover/item:text-primary transition-colors min-w-0 flex-1">
                                    {lesson.title}
                                  </span>
                                </div>
                                {isDone ? (
                                  <Check className="size-3 text-emerald-600 shrink-0" />
                                ) : (
                                  <PlayCircle className="size-3 text-muted-foreground shrink-0 group-hover/item:text-primary" />
                                )}
                              </Link>
                            );
                          })}
                          {chapLessons.length > 2 && (
                            <Link
                              to="/learn/$slug"
                              params={{ slug: chapter.slug }}
                              className="text-[11px] font-semibold text-primary hover:underline inline-block px-1"
                            >
                              +{chapLessons.length - 2} more lectures inside ➔
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer & CTA */}
                  <div className="space-y-3 pt-3 border-t border-border/50 w-full min-w-0">
                    {/* Media Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] font-semibold text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                        <Headphones className="size-3" /> Audio
                      </span>
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
                        <PlayCircle className="size-3" /> Video
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                        <FileText className="size-3" /> Notes
                      </span>
                      {chapter.testId && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                          <Sparkles className="size-3" /> Quiz
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 w-full">
                      <Button
                        asChild
                        className="w-full rounded-full font-bold shadow-sm h-9 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 flex-1 min-w-0"
                      >
                        <Link to="/learn/$slug" params={{ slug: chapter.slug }} className="w-full justify-center">
                          <span className="truncate">{hasStarted ? "Continue Chapter" : "Start Chapter"}</span>
                          <ArrowRight className="size-3.5 shrink-0" />
                        </Link>
                      </Button>
                      {chapter.testId && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs font-semibold h-9 px-3 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 shrink-0"
                          title="Take Chapter Quiz"
                        >
                          <Link to="/test/$testId" params={{ testId: chapter.testId }}>
                            <Sparkles className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredChapters.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center text-muted-foreground space-y-3">
              <BookOpen className="size-10 mx-auto text-muted-foreground/50" />
              <p className="text-base font-bold text-foreground">No matching chapters found</p>
              <p className="text-xs max-w-sm mx-auto">
                No chapters matched "{searchQuery}". Try searching for another topic or clear the filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSubjectId("all");
                }}
                className="rounded-full text-xs font-bold mt-2"
              >
                Show All Chapters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
