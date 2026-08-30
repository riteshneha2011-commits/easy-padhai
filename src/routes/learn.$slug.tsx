import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Circle,
  Coins,
  FileText,
  Headphones,
  Lock,
  PlayCircle,
  Sparkles,
  Unlock,
  ArrowDownToLine,
  Check,
  Download,
  Trash2,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { getChapter } from "@/lib/content.functions";
import { completeLesson, getChapterProgress } from "@/lib/learn.functions";
import { listLessonBookmarks, toggleLessonBookmark } from "@/lib/revision.functions";
import { getLessonAccess, getPublicLessonAccess, unlockLesson } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";
import { useStudyHeartbeat } from "@/hooks/use-study-heartbeat";
import { CREDIT_REWARDS } from "@/lib/credits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MediaPlayer } from "@/components/media-player";
import { downloadLessonForOffline, isLessonOffline, removeOfflineLesson, cacheChapterMeta } from "@/lib/offline-storage";

import { VictoryModal } from "@/components/victory-modal";
import { soundFx } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";
import { classLabel, DEFAULT_CLASS_LEVEL } from "@/lib/classes";



type Lesson = {
  id: string;
  chapter_id: string;
  title: string;
  kind: string;
  summary: string | null;
  duration_minutes: number | null;
  order_index: number;
  hasAudio: boolean;
  hasVideo: boolean;
  hasPdf: boolean;
  isFree: boolean;
  test?: { id: string; title: string; duration_minutes: number | null } | null;
};


export const Route = createFileRoute("/learn/$slug")({
  loader: async ({ params }) => {
    const data = await getChapter({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Chapter not found — Easy Padhai" }, { name: "robots", content: "noindex" }] };
    }
    const chapterClass = (loaderData.chapter as { subjects?: { class_level?: number } | null }).subjects
      ?.class_level;
    const title = `${loaderData.chapter.title} — Easy Padhai ${classLabel(chapterClass ?? DEFAULT_CLASS_LEVEL)}`;
    const description =
      loaderData.chapter.description ??
      `Audio, video, summary, notes and a test for ${loaderData.chapter.title}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ChapterPage,
});

const KIND_META: Record<string, { icon: typeof Headphones; label: string }> = {
  audio: { icon: Headphones, label: "Audio lecture" },
  video: { icon: PlayCircle, label: "Video lecture" },
  summary: { icon: BookOpen, label: "Quick summary" },
  pdf: { icon: FileText, label: "PDF notes" },
};

function ChapterPage() {

  const { chapter, lessons, test } = Route.useLoaderData();
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(lessons[0]?.id ?? null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [victoryXp, setVictoryXp] = useState(20);

  useEffect(() => {
    if (chapter && lessons.length > 0) {
      void cacheChapterMeta({
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        description: chapter.description ?? "",
        subject_id: chapter.subject_id,
        subject_name: chapter.subjects?.name ?? "",
        class_level: chapter.subjects?.class_level ?? 0,
        lessons: lessons.map((l) => ({
          id: l.id,
          chapter_id: l.chapter_id,
          title: l.title,
          kind: l.kind,
          summary: l.summary,
          duration_minutes: l.duration_minutes,
          order_index: l.order_index,
          isFree: l.isFree,
        })),
      });
    }
  }, [chapter, lessons]);

  const progressQuery = useQuery({
    queryKey: ["chapter-progress", chapter.id, user?.id],
    queryFn: () => getChapterProgress({ data: { chapterId: chapter.id } }),
    enabled: Boolean(user),
  });

  const done = new Set(progressQuery.data ?? []);
  const percent = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;

  const activeIndex = lessons.findIndex((l) => l.id === activeId);
  const nextLesson = activeIndex >= 0 && activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : null;

  const handleSelectLesson = (lessonId: string) => {
    setActiveId(lessonId);
    soundFx.playClick();
    const playerEl = document.getElementById("lesson-player");
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePlayNext = () => {
    setVictoryOpen(false);
    if (nextLesson) {
      handleSelectLesson(nextLesson.id);
    } else if (test) {
      void navigate({ to: "/test/$testId", params: { testId: test.id } });
    }
  };

  const complete = useMutation({
    mutationFn: (lessonId: string) => completeLesson({ data: { lessonId } }),
    onSuccess: (result) => {
      progressQuery.refetch();
      void refresh();
      if (result.alreadyDone) {
        toast("Already completed ✓");
      } else {
        soundFx.playSuccess();
        setVictoryXp(result.xp || 20);
        setVictoryOpen(true);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unlock = useMutation({
    mutationFn: (lessonId: string) => unlockLesson({ data: { lessonId } }),
    onSuccess: (access) => {
      void queryClient.invalidateQueries({ queryKey: ["lesson-access"] });
      void refresh();
      soundFx.playSuccess();
      toast.success(`Unlocked! −${access.cost} credits · yours forever`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const active = lessons.find((l) => l.id === activeId) ?? lessons[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 py-6 sm:py-10 min-w-0">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        ← All chapters
      </Link>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words leading-tight text-foreground">{chapter.title}</h1>
          {chapter.description && (
            <div className="mt-2 max-w-2xl">
              <p className={cn("text-xs sm:text-sm text-muted-foreground break-words transition-all", !showFullDesc && "line-clamp-2")}>
                {chapter.description}
              </p>
              {chapter.description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setShowFullDesc((prev) => !prev)}
                  className="mt-1 text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  {showFullDesc ? "Show less ▴" : "Show more ▾"}
                </button>
              )}
            </div>
          )}
        </div>
        {test && (
          <Button
            size="lg"
            className="w-full sm:w-auto rounded-full shadow-glow shrink-0 font-semibold"
            onClick={() =>
              user
                ? navigate({ to: "/test/$testId", params: { testId: test.id } })
                : navigate({ to: "/auth" })
            }
          >
            <Sparkles className="size-4" /> Take Chapter Test
          </Button>
        )}
      </div>

      {user && lessons.length > 0 && (
        <div className="mt-5 max-w-md">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Chapter progress</span>
            <span className="text-primary font-bold">{percent}%</span>
          </div>
          <Progress value={percent} className="mt-1.5 h-2" />
        </div>
      )}

      <div className="mt-6 sm:mt-8 grid gap-5 sm:gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] min-w-0 w-full">
        <div className="flex flex-col gap-2 min-w-0 w-full">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lectures ({lessons.length})</span>
          </div>
          {lessons.map((lesson, index) => {
            const meta = KIND_META[lesson.kind] ?? KIND_META.summary;
            const isDone = done.has(lesson.id);
            const isActive = active?.id === lesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleSelectLesson(lesson.id)}
                className={cn(
                  "flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-border/70 bg-card p-3 sm:p-4 text-left transition-all hover:border-primary/50 w-full min-w-0 overflow-hidden text-card-foreground shadow-sm",
                  isActive && "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-md",
                )}
              >
                <span className={cn(
                  "grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground transition-colors",
                  isActive && "bg-primary text-primary-foreground font-bold"
                )}>
                  <meta.icon className="size-4 sm:size-5" />
                </span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground truncate">
                    Step {index + 1} · {meta.label}
                  </span>
                  <span className="block truncate text-sm font-semibold text-foreground">{lesson.title}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-accent">
                      {lesson.isFree ? "Free" : "Costs credits"}
                    </span>
                    {lesson.test && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        <Sparkles className="size-2.5" /> Quiz
                      </span>
                    )}
                  </div>
                </span>
                {isDone ? (
                  <CheckCircle2 className="size-5 shrink-0 text-accent" />
                ) : (
                  <Circle className="size-5 shrink-0 text-muted-foreground/40" />
                )}
              </button>
            );
          })}
          {lessons.length === 0 && (
            <Card className="rounded-2xl p-6 text-sm text-muted-foreground">
              No lessons published for this chapter yet.
            </Card>
          )}
        </div>

        {active && (
          <Card id="lesson-player" className="shadow-card rounded-2xl sm:rounded-3xl border-border/70 p-4 sm:p-6 w-full min-w-0 overflow-hidden scroll-mt-20">
            <LessonPanel
              key={active.id}
              lesson={active}
              done={done.has(active.id)}
              pending={complete.isPending}
              signedIn={Boolean(user)}
              userId={user?.id ?? null}
              unlocking={unlock.isPending}
              onUnlock={() => unlock.mutate(active.id)}
              onComplete={() => complete.mutate(active.id)}
            />
          </Card>
        )}
      </div>

      <VictoryModal
        open={victoryOpen}
        xpEarned={victoryXp}
        title="Lesson Completed! 🎉"
        message={`Great job on completing "${active?.title ?? "this lesson"}". Keep up the daily learning streak!`}
        nextLabel={nextLesson ? `Next: ${nextLesson.title}` : (test ? "Start Chapter Quiz" : undefined)}
        onPlayNext={handlePlayNext}
        onDirectClose={() => setVictoryOpen(false)}
      />
    </div>
  );
}

type ResourceTab = {
  key: string;
  label: string;
  icon: typeof Headphones;
  hint: string;
  render: () => React.ReactNode;
};

function LessonPanel({
  lesson,
  done,
  pending,
  signedIn,
  userId,
  unlocking,
  onUnlock,
  onComplete,
}: {
  lesson: Lesson;
  done: boolean;
  pending: boolean;
  signedIn: boolean;
  userId: string | null;
  unlocking: boolean;
  onUnlock: () => void;
  onComplete: () => void;
}) {
  const [watching, setWatching] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const onActiveChange = useCallback((value: boolean) => setWatching(value), []);

  useEffect(() => {
    let alive = true;
    isLessonOffline(lesson.id).then((ready) => {
      if (alive) setIsOfflineReady(ready);
    });
    return () => {
      alive = false;
    };
  }, [lesson.id]);

  const handleDownloadOffline = async () => {
    soundFx.playClick();
    setIsDownloading(true);
    setDownloadProgress(15);
    try {
      await downloadLessonForOffline(
        lesson,
        media?.audio ?? null,
        media?.pdf ?? null,
        (pct) => setDownloadProgress(pct),
      );
      setIsOfflineReady(true);
      soundFx.playSuccess();
      toast.success("Lesson saved in-app for 100% offline access! 📥");
    } catch {
      toast.error("Could not download for offline.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveOffline = async () => {
    soundFx.playClick();
    await removeOfflineLesson(lesson.id);
    setIsOfflineReady(false);
    toast.info("Offline copy removed.");
  };

  const accessQuery = useQuery({
    queryKey: ["lesson-access", lesson.id, userId],
    queryFn: () =>
      userId
        ? getLessonAccess({ data: { lessonId: lesson.id } })
        : getPublicLessonAccess({ data: { lessonId: lesson.id } }),
  });

  const access = accessQuery.data ?? null;
  const media = access?.media ?? null;
  const locked = access ? access.locked : !lesson.isFree;

  useStudyHeartbeat(lesson.id, watching, Boolean(userId) && !locked);

  useEffect(() => {
    if (locked) setWatching(false);
  }, [locked]);

  const tabs: ResourceTab[] = [];

  const navigate = useNavigate();

  if (media?.audio || isOfflineReady) {
    tabs.push({
      key: "audio",
      label: "Audio",
      icon: Headphones,
      hint: "Listen to the lecture",
      render: () => (
        <MediaPlayer
          value={media?.audio || ""}
          title={lesson.title}
          kind="audio"
          lessonId={lesson.id}
          onActiveChange={onActiveChange}
        />
      ),
    });
  }
  if (media?.video) {
    tabs.push({
      key: "video",
      label: "Video",
      icon: PlayCircle,
      hint: "Watch the explanation",
      render: () => (
        <MediaPlayer
          value={media.video!}
          title={lesson.title}
          kind="video"
          lessonId={lesson.id}
          onActiveChange={onActiveChange}
        />
      ),
    });
  }
  if (lesson.summary) {
    tabs.push({
      key: "summary",
      label: "Summary",
      icon: BookOpen,
      hint: "Revise the key points — always free",
      render: () => (
        <div className="whitespace-pre-wrap rounded-2xl bg-secondary/50 p-5 text-[15px] leading-relaxed text-foreground/90">
          {lesson.summary}
        </div>
      ),
    });
  }
  if (Boolean(media?.pdf)) {
    tabs.push({
      key: "pdf",
      label: "Notes",
      icon: FileText,
      hint: "Open the PDF notes",
      render: () => (
        <MediaPlayer
          value={media?.pdf || ""}
          title={lesson.title}
          kind="pdf"
          lessonId={lesson.id}
        />
      ),
    });
  }
  if (lesson.test) {
    tabs.push({
      key: "quiz",
      label: "Quick Quiz",
      icon: Sparkles,
      hint: "Test this lecture's concepts with 3-5 MCQs",
      render: () => (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Sparkles className="size-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display text-lg sm:text-xl font-bold text-foreground">
              {lesson.test?.title || "Lesson Quick Quiz"}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Test your understanding of this lecture immediately with interactive MCQs.
            </p>
          </div>
          <Button
            size="lg"
            className="rounded-full shadow-glow font-bold gap-2 px-8"
            onClick={() =>
              userId
                ? navigate({ to: "/test/$testId", params: { testId: lesson.test!.id } })
                : navigate({ to: "/auth" })
            }
          >
            <Sparkles className="size-4" /> Start Lesson Quiz
          </Button>
        </div>
      ),
    });
  }

  const [tabKey, setTabKey] = useState("");
  const activeTab = tabs.find((t) => t.key === tabKey) ?? tabs[0] ?? null;

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 min-w-0">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-primary">
            {(KIND_META[lesson.kind] ?? KIND_META.summary).label}
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold break-words leading-tight mt-0.5">
            {lesson.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lesson.test && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                userId
                  ? navigate({ to: "/test/$testId", params: { testId: lesson.test!.id } })
                  : navigate({ to: "/auth" })
              }
              className="rounded-full text-xs font-bold h-8 gap-1.5 border-primary/50 text-primary hover:bg-primary/10"
            >
              <Sparkles className="size-3.5" />
              <span>Take Quiz</span>
            </Button>
          )}

          {isOfflineReady ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-emerald-600 text-xs font-bold">
              <Check className="size-3.5" />
              <span>Offline Ready</span>
              <button
                type="button"
                onClick={handleRemoveOffline}
                className="ml-1 text-muted-foreground hover:text-destructive"
                title="Remove offline copy"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadOffline}
              disabled={isDownloading}
              className="rounded-full text-xs font-semibold h-8 gap-1.5 border-primary/40 hover:bg-primary/10"
            >
              {isDownloading ? (
                <span>Downloading {downloadProgress}%</span>
              ) : (
                <>
                  <Download className="size-3.5 text-primary" />
                  <span>Download Offline</span>
                </>
              )}
            </Button>
          )}

          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
            ~{lesson.duration_minutes ?? 10} min
          </span>
        </div>
      </div>


      {tabs.length > 1 && (
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 rounded-2xl bg-secondary/60 p-1.5 w-full min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTabKey(tab.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all min-w-0",
                activeTab?.key === tab.key
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="size-3.5 sm:size-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      )}


      {locked && (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-4 sm:p-6 text-center min-w-0">
          <span className="mx-auto grid size-10 sm:size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Lock className="size-5 sm:size-6" />
          </span>
          <h3 className="mt-3 font-display text-base sm:text-lg font-bold">
            Unlock this lesson for {access?.cost ?? 0} credits
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">
            Unlock once, keep it forever. You earn {CREDIT_REWARDS.lessonComplete} credits for every lesson
            you finish, {CREDIT_REWARDS.dailyLogin} for visiting daily and {CREDIT_REWARDS.referral} for each
            friend you invite.
          </p>
          {signedIn ? (
            <div className="mt-4 flex flex-col items-center gap-2 w-full">
              <Button className="w-full sm:w-auto rounded-full" disabled={unlocking || accessQuery.isLoading} onClick={onUnlock}>
                <Unlock className="size-4" /> Unlock for {access?.cost ?? 0} credits
              </Button>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Coins className="size-3.5" /> Balance: {access?.balance ?? 0} credits ·{" "}
                <Link to="/wallet" className="text-primary underline-offset-4 hover:underline">
                  earn more
                </Link>
              </span>
            </div>
          ) : (
            <Button asChild className="mt-4 w-full sm:w-auto rounded-full">
              <Link to="/auth">Sign in — get {CREDIT_REWARDS.welcome} free credits</Link>
            </Button>
          )}
        </div>
      )}

      {activeTab ? (
        <div className="space-y-3 min-w-0 w-full">
          <p className="text-xs sm:text-sm text-muted-foreground">{activeTab.hint}</p>
          {activeTab.render()}
        </div>
      ) : (
        !locked && (
          <p className="rounded-2xl bg-secondary/50 p-4 sm:p-5 text-sm text-muted-foreground">
            No media has been added to this lesson yet.
          </p>
        )
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-border/70 pt-4 w-full">
        {signedIn ? (
          <Button className="w-full sm:w-auto rounded-full" disabled={pending || done} onClick={onComplete}>
            {done ? "Completed ✓" : `Mark complete · +10 XP · +${CREDIT_REWARDS.lessonComplete} credits`}
          </Button>
        ) : (
          <Button asChild className="w-full sm:w-auto rounded-full">
            <Link to="/auth">Sign in to track progress</Link>
          </Button>
        )}
        {signedIn && (
          <VisitAgainButton lessonId={lesson.id} resource={(activeTab?.key ?? "lesson") as string} />
        )}
        {watching && (
          <span className="text-xs font-semibold text-accent text-center sm:text-left">
            Counting study time · +{CREDIT_REWARDS.studyBlock} credits every 10 min
          </span>
        )}
      </div>
    </div>
  );
}

function VisitAgainButton({ lessonId, resource }: { lessonId: string; resource: string }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  const bookmarks = useQuery({
    queryKey: ["lesson-bookmarks", lessonId],
    queryFn: () => listLessonBookmarks({ data: { lessonIds: [lessonId] } }),
  });

  const marked = (bookmarks.data ?? []).includes(`${lessonId}:${resource}`);

  const toggle = useMutation({
    mutationFn: () => toggleLessonBookmark({ data: { lessonId, resource: resource as never, note } }),
    onSuccess: (res) => {
      setOpen(false);
      setNote("");
      void bookmarks.refetch();
      void queryClient.invalidateQueries({ queryKey: ["revision"] });
      toast.success(res.bookmarked ? "Added to Visit again" : "Removed from Visit again");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (marked) {
    return (
      <Button
        variant="secondary"
        className="rounded-full"
        disabled={toggle.isPending}
        onClick={() => toggle.mutate()}
      >
        <BookmarkCheck className="size-4" /> Saved to Visit again
      </Button>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" className="rounded-full" onClick={() => setOpen(true)}>
        <Bookmark className="size-4" /> Visit again
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What felt confusing? (optional)"
        className="min-w-[200px] flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
      />
      <Button className="rounded-full" disabled={toggle.isPending} onClick={() => toggle.mutate()}>
        Save
      </Button>
      <Button variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}
