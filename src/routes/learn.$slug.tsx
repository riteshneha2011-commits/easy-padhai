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
  const loaderData = Route.useLoaderData();
  const chapter = loaderData.chapter;
  const test = loaderData.test;
  const lessons = loaderData.lessons as unknown as Lesson[];
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(lessons[0]?.id ?? null);

  const progressQuery = useQuery({
    queryKey: ["chapter-progress", chapter.id, user?.id],
    queryFn: () => getChapterProgress({ data: { chapterId: chapter.id } }),
    enabled: Boolean(user),
  });

  const done = new Set(progressQuery.data ?? []);
  const percent = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;

  const complete = useMutation({
    mutationFn: (lessonId: string) => completeLesson({ data: { lessonId } }),
    onSuccess: (result) => {
      progressQuery.refetch();
      void refresh();
      if (result.alreadyDone) toast("Already completed ✓");
      else toast.success(`Nice! +${result.xp} XP · +${result.credits} credits`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const unlock = useMutation({
    mutationFn: (lessonId: string) => unlockLesson({ data: { lessonId } }),
    onSuccess: (access) => {
      void queryClient.invalidateQueries({ queryKey: ["lesson-access"] });
      void refresh();
      toast.success(`Unlocked! −${access.cost} credits · yours forever`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const active = lessons.find((l) => l.id === activeId) ?? lessons[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Link to="/learn" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
        ← All chapters
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{chapter.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{chapter.description}</p>
        </div>
        {test && (
          <Button
            size="lg"
            className="rounded-full shadow-glow"
            onClick={() =>
              user
                ? navigate({ to: "/test/$testId", params: { testId: test.id } })
                : navigate({ to: "/auth" })
            }
          >
            <Sparkles className="size-4" /> Take the test · free
          </Button>
        )}
      </div>

      {user && lessons.length > 0 && (
        <div className="mt-6 max-w-md">
          <div className="flex justify-between text-sm font-semibold">
            <span>Chapter progress</span>
            <span className="text-primary">{percent}%</span>
          </div>
          <Progress value={percent} className="mt-2 h-2.5" />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-2">
          {lessons.map((lesson, index) => {
            const meta = KIND_META[lesson.kind] ?? KIND_META.summary;
            const isDone = done.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveId(lesson.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-left transition-colors hover:border-primary/50",
                  active?.id === lesson.id && "border-primary bg-primary/8",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <meta.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Step {index + 1} · {meta.label}
                  </span>
                  <span className="block truncate font-semibold">{lesson.title}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-accent">
                    {lesson.isFree ? "Free" : "Costs credits"}
                  </span>
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
          <Card className="shadow-card gap-5 rounded-3xl border-border/70 p-6">
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
  const onActiveChange = useCallback((value: boolean) => setWatching(value), []);

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

  if (media?.audio) {
    tabs.push({
      key: "audio",
      label: "Audio",
      icon: Headphones,
      hint: "Listen to the lecture",
      render: () => (
        <MediaPlayer value={media.audio!} title={lesson.title} kind="audio" onActiveChange={onActiveChange} />
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
        <MediaPlayer value={media.video!} title={lesson.title} kind="video" onActiveChange={onActiveChange} />
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
  if (media?.pdf) {
    tabs.push({
      key: "pdf",
      label: "Notes",
      icon: FileText,
      hint: "Open the PDF notes",
      render: () => <MediaPlayer value={media.pdf!} title={lesson.title} kind="pdf" />,
    });
  }

  const [tabKey, setTabKey] = useState("");
  const activeTab = tabs.find((t) => t.key === tabKey) ?? tabs[0] ?? null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {(KIND_META[lesson.kind] ?? KIND_META.summary).label}
          </span>
          <h2 className="font-display text-2xl font-bold">{lesson.title}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
          ~{lesson.duration_minutes ?? 10} min
        </span>
      </div>

      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-secondary/60 p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTabKey(tab.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
                activeTab?.key === tab.key
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="size-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {locked && (
        <div className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Lock className="size-6" />
          </span>
          <h3 className="mt-3 font-display text-lg font-bold">
            Unlock this lesson for {access?.cost ?? 0} credits
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Unlock once, keep it forever. You earn {CREDIT_REWARDS.lessonComplete} credits for every lesson
            you finish, {CREDIT_REWARDS.dailyLogin} for visiting daily and {CREDIT_REWARDS.referral} for each
            friend you invite.
          </p>
          {signedIn ? (
            <div className="mt-4 flex flex-col items-center gap-2">
              <Button className="rounded-full" disabled={unlocking || accessQuery.isLoading} onClick={onUnlock}>
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
            <Button asChild className="mt-4 rounded-full">
              <Link to="/auth">Sign in — get {CREDIT_REWARDS.welcome} free credits</Link>
            </Button>
          )}
        </div>
      )}

      {activeTab ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{activeTab.hint}</p>
          {activeTab.render()}
        </div>
      ) : (
        !locked && (
          <p className="rounded-2xl bg-secondary/50 p-5 text-sm text-muted-foreground">
            No media has been added to this lesson yet.
          </p>
        )
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
        {signedIn ? (
          <Button className="rounded-full" disabled={pending || done} onClick={onComplete}>
            {done ? "Completed ✓" : `Mark complete · +10 XP · +${CREDIT_REWARDS.lessonComplete} credits`}
          </Button>
        ) : (
          <Button asChild className="rounded-full">
            <Link to="/auth">Sign in to track progress</Link>
          </Button>
        )}
        {signedIn && (
          <VisitAgainButton lessonId={lesson.id} resource={(activeTab?.key ?? "lesson") as string} />
        )}
        {watching && (
          <span className="text-xs font-semibold text-accent">
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
