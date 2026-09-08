import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  Bookmark,
  Flame,
  Target,
  TrendingUp,
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
  Pencil,
  Sparkles,
  Trophy,
  Zap,
  Footprints,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDashboard } from "@/lib/learn.functions";
import { getRevisionCounts } from "@/lib/revision.functions";
import { updateMyGoal } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";
import { levelProgress } from "@/lib/gamify";
import { useActiveClass } from "@/hooks/use-active-class";
import { ClassSwitcher } from "@/components/class-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My progress — Easy Padhai" },
      {
        name: "description",
        content: "Track your streak, XP, level, badges, chapter progress and test history on Easy Padhai.",
      },
      { property: "og:title", content: "My progress — Easy Padhai" },
      {
        property: "og:description",
        content: "Streaks, XP, badges and weak topics for Class 9 to 12 Science, all in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchDashboard = useServerFn(getDashboard);
  const fetchRevisionCounts = useServerFn(getRevisionCounts);
  const updateGoalFn = useServerFn(updateMyGoal);

  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [badgesModalOpen, setBadgesModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboard(),
    enabled: Boolean(user),
  });

  const revision = useQuery({
    queryKey: ["revision-counts", user?.id],
    queryFn: () => fetchRevisionCounts(),
    enabled: Boolean(user),
  });

  async function handleSaveGoal(val: string) {
    const cleanGoal = val.trim();
    setSavingGoal(true);
    try {
      await updateGoalFn({ data: { goal: cleanGoal || null } });
      toast.success(cleanGoal ? "Study goal saved! Aim high and stay consistent! 🎯" : "Goal cleared.");
      setGoalModalOpen(false);
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
      void qc.invalidateQueries({ queryKey: ["my-profile"] });
    } catch {
      toast.error("Could not update goal");
    } finally {
      setSavingGoal(false);
    }
  }

  const filteredProgress = useMemo(() => {
    const list = data?.chapterProgress ?? [];
    if (subjectFilter === "all") return list;
    if (subjectFilter === "in-progress") return list.filter((c) => c.percent > 0 && c.percent < 100);
    if (subjectFilter === "completed") return list.filter((c) => c.percent === 100);
    if (subjectFilter === "science") {
      return list.filter(
        (c) =>
          c.subjectCategory === "Physics" ||
          c.subjectCategory === "Chemistry" ||
          c.subjectCategory === "Biology" ||
          c.subjectName?.toLowerCase().includes("science"),
      );
    }
    if (subjectFilter === "math") {
      return list.filter(
        (c) =>
          c.subjectCategory === "Mathematics" || c.subjectName?.toLowerCase().includes("math"),
      );
    }
    if (subjectFilter === "social") {
      return list.filter(
        (c) =>
          c.subjectCategory === "Social Science" ||
          c.subjectName?.toLowerCase().includes("social"),
      );
    }
    return list;
  }, [data?.chapterProgress, subjectFilter]);

  if (!user || isLoading || !data) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground text-center">Loading your progress…</div>;
  }

  const xp = profile?.total_xp ?? data.profile?.total_xp ?? 0;
  const currentGoal = profile?.goal ?? data.profile?.goal ?? null;
  const lvl = levelProgress(xp);

  const filterCounts = {
    all: data.chapterProgress.length,
    inProgress: data.chapterProgress.filter((c) => c.percent > 0 && c.percent < 100).length,
    science: data.chapterProgress.filter(
      (c) =>
        c.subjectCategory === "Physics" ||
        c.subjectCategory === "Chemistry" ||
        c.subjectCategory === "Biology" ||
        c.subjectName?.toLowerCase().includes("science"),
    ).length,
    math: data.chapterProgress.filter(
      (c) =>
        c.subjectCategory === "Mathematics" || c.subjectName?.toLowerCase().includes("math"),
    ).length,
    social: data.chapterProgress.filter(
      (c) =>
        c.subjectCategory === "Social Science" ||
        c.subjectName?.toLowerCase().includes("social"),
    ).length,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10 space-y-6 min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight break-words">
            Hi {data.profile?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Here's how your learning is going.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground font-semibold">Active Class:</span>
          <ClassSwitcher size="sm" />
        </div>
      </div>

      {/* Target Goal Motivational Banner */}
      <Card className="rounded-3xl border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-sm">
            <Target className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Academic Goal</span>
              {currentGoal && (
                <Badge variant="outline" className="text-[10px] font-semibold border-primary/30 text-primary py-0">
                  Target Set
                </Badge>
              )}
            </div>
            <p className="font-display text-base sm:text-lg font-bold truncate text-foreground mt-0.5">
              {currentGoal || "No study goal set yet"}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {currentGoal
                ? "Every audio lecture and test completed moves you closer to your goal."
                : "Set a clear target for Board exams, JEE/NEET, or daily study habits."}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={currentGoal ? "outline" : "default"}
          className="rounded-full shrink-0 font-semibold gap-1.5 self-end sm:self-auto"
          onClick={() => {
            setGoalInput(currentGoal ?? "");
            setGoalModalOpen(true);
          }}
        >
          {currentGoal ? (
            <>
              <Pencil className="size-3.5" /> Edit Goal
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" /> Set Study Goal
            </>
          )}
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 min-w-0 w-full">
        <StatCard icon={<Flame className="size-4 sm:size-5" />} label="Current streak" value={`${data.streak?.current_streak ?? 0} days`} />
        <StatCard icon={<TrendingUp className="size-4 sm:size-5" />} label="Total XP" value={`${xp} XP`} />
        <StatCard icon={<Target className="size-4 sm:size-5" />} label="Lessons done" value={`${data.lessonsCompleted}`} />
        <StatCard
          icon={<Award className="size-4 sm:size-5" />}
          label="Badges"
          value={`${data.badges.length}/${data.allBadges.length || 7}`}
          subtext="Tap to view showcase"
          onClick={() => setBadgesModalOpen(true)}
        />
      </div>

      {/* Level Card */}
      <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Level {lvl.level}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={lvl.percent} className="h-3" />
          <p className="text-xs sm:text-sm text-muted-foreground">{lvl.toNext} XP to level {lvl.level + 1}</p>
          {data.nextChapter && (
            <div className="pt-2">
              <Button asChild className="rounded-full w-full sm:w-auto h-auto py-2.5 px-4 text-xs sm:text-sm font-semibold whitespace-normal text-left">
                <Link to="/learn/$slug" params={{ slug: data.nextChapter.slug }} className="flex items-center gap-1.5">
                  <span className="break-words line-clamp-1">Continue: {data.nextChapter.title}</span>
                  <ArrowRight className="size-3.5 shrink-0" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 min-w-0">
        {/* Chapter Progress with Subject & In-Progress Filters */}
        <Card className="rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="font-display text-lg">Chapter progress</CardTitle>
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { key: "all", label: "All", count: filterCounts.all },
                  { key: "in-progress", label: "🔥 In Progress", count: filterCounts.inProgress },
                  { key: "science", label: "🔬 Science", count: filterCounts.science },
                  { key: "math", label: "📐 Math", count: filterCounts.math },
                  { key: "social", label: "🌍 SST", count: filterCounts.social },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSubjectFilter(tab.key)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold transition-all flex items-center gap-1",
                      subjectFilter === tab.key
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        "text-[9px] px-1 rounded-full",
                        subjectFilter === tab.key ? "bg-white/20 text-white" : "bg-card text-muted-foreground",
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 min-w-0 max-h-[380px] overflow-y-auto pr-2 mt-2">
              {filteredProgress.map((c) => (
                <div key={c.id} className="min-w-0 rounded-2xl border border-border/50 p-3 bg-card/60 hover:bg-card transition-all">
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {c.percent === 100 ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : c.percent > 0 ? (
                        <span className="flex size-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                      ) : null}
                      <Link
                        to="/learn/$slug"
                        params={{ slug: c.slug }}
                        className="font-medium hover:underline truncate min-w-0 text-xs sm:text-sm text-foreground hover:text-primary"
                      >
                        {c.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-muted-foreground font-semibold text-xs">
                        {c.completed}/{c.total}
                      </span>
                      <Badge
                        variant={c.percent === 100 ? "default" : c.percent > 0 ? "secondary" : "outline"}
                        className="text-[10px] px-1.5 py-0 rounded-md font-mono"
                      >
                        {c.percent}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={c.percent} className="h-1.5" />
                </div>
              ))}
              {filteredProgress.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No chapters found in this filter.
                </p>
              )}
            </CardContent>
          </div>
          <div className="p-3 bg-secondary/30 border-t border-border/50 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium">
              Want to start a new topic?
            </span>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-bold gap-1 h-7 text-primary hover:text-primary">
              <Link to="/learn">
                Browse all chapters <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Recent Tests */}
        <Card className="rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Recent tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 min-w-0">
            {data.attempts.length === 0 && (
              <p className="text-sm text-muted-foreground">No test attempts yet — try one!</p>
            )}
            {data.attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl bg-secondary px-3.5 py-2.5 text-xs sm:text-sm min-w-0">
                <span className="text-muted-foreground truncate">
                  {new Date(a.created_at as string).toLocaleDateString()}
                </span>
                <span className="font-semibold shrink-0">
                  {a.score}/{a.total}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revision Hub Card */}
      <Card className="rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Bookmark className="size-5 text-primary" /> My revision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 min-w-0">
          <div className="flex flex-wrap gap-2 min-w-0">
            <Link to="/revision" search={{ tab: "again" }}>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs cursor-pointer hover:bg-secondary/80 transition-colors">
                📌 Visit again · {revision.data?.bookmarks ?? 0}
              </Badge>
            </Link>
            <Link to="/revision" search={{ tab: "bank" }}>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs cursor-pointer hover:bg-secondary/80 transition-colors">
                💡 Revision bank · {revision.data?.bank ?? 0}
              </Badge>
            </Link>
            <Link to="/revision" search={{ tab: "mistakes" }}>
              <Badge
                variant={Number(revision.data?.mistakes ?? 0) > 0 ? "destructive" : "secondary"}
                className="rounded-full px-3 py-1 text-xs cursor-pointer transition-colors"
              >
                ⚠️ Mistake box · {revision.data?.mistakes ?? 0}
              </Badge>
            </Link>
          </div>
          <Button asChild className="rounded-full text-xs font-semibold">
            <Link to="/revision" search={{ tab: "mistakes" }}>Open revision hub</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 min-w-0">
        {/* Badges Card with Quick Trigger */}
        <Card className="rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Award className="size-5 text-amber-500" />
              Badges ({data.badges.length}/{data.allBadges.length || 7})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-primary rounded-full hover:bg-primary/10 h-7 px-2.5"
              onClick={() => setBadgesModalOpen(true)}
            >
              View criteria →
            </Button>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 min-w-0">
            {data.allBadges.map((b) => {
              const earned = data.badges.some((x) => x.badge_code === b.code);
              return (
                <Badge
                  key={b.code}
                  variant={earned ? "default" : "outline"}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs break-words cursor-pointer transition-all gap-1.5",
                    earned
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25 font-bold"
                      : "opacity-60 hover:opacity-100",
                  )}
                  onClick={() => setBadgesModalOpen(true)}
                >
                  {earned ? "✓ " : <Lock className="size-3 inline-block" />} {b.name ?? b.code}
                </Badge>
              );
            })}
          </CardContent>
        </Card>

        {/* Weak Topics */}
        <Card className="rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Revise these topics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 min-w-0">
            {data.weakTopics.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing weak so far. Keep it up!</p>
            )}
            {data.weakTopics.map((t) => (
              <Badge key={t.topic} variant="secondary" className="rounded-full px-3 py-1 text-xs break-words">
                {t.topic} · {t.misses} misses
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Badges Showcase Modal */}
      <Dialog open={badgesModalOpen} onOpenChange={setBadgesModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Trophy className="size-5 text-amber-500" />
              Badges & Achievements
            </DialogTitle>
            <DialogDescription>
              Earn badges by maintaining daily study streaks, finishing full chapters, and excelling in tests.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-2">
            {data.allBadges.map((badge) => {
              const earned = data.badges.find((b) => b.badge_code === badge.code);
              const IconComp = getBadgeIcon(badge.icon);
              return (
                <div
                  key={badge.code}
                  className={cn(
                    "flex items-start gap-3.5 rounded-2xl border p-3.5 sm:p-4 transition-all",
                    earned
                      ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm"
                      : "border-border/60 bg-muted/20 opacity-75",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-2xl font-bold",
                      earned
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <IconComp className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                        {badge.name}
                        {earned && (
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        )}
                      </h4>
                      {earned ? (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 rounded-full px-2 py-0.5 shrink-0">
                          Unlocked ✓
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground shrink-0">
                          <Lock className="size-3" /> Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{badge.description}</p>
                    {earned?.earned_at && (
                      <p className="text-[10px] text-muted-foreground/80 mt-1.5 font-medium">
                        Unlocked on {new Date(earned.earned_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Target Goal Modal */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Target className="size-5 text-primary" />
              Set Your Study Goal
            </DialogTitle>
            <DialogDescription>
              Pick a target or enter your custom academic goal for this session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Popular Targets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_GOALS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGoalInput(preset)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold border transition-all cursor-pointer",
                      goalInput === preset
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/70 hover:border-primary/50 text-foreground bg-card",
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Custom Target Goal
              </label>
              <input
                type="text"
                maxLength={120}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Score 90%+ in Science & build daily habit"
                className="w-full rounded-2xl border border-border/80 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => setGoalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-full font-semibold"
                disabled={savingGoal}
                onClick={() => handleSaveGoal(goalInput)}
              >
                {savingGoal ? "Saving…" : "Save Goal 🎯"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const PRESET_GOALS = [
  "Class 10 Board 95%+",
  "Class 12 Board 95%+",
  "NEET 2027",
  "JEE Main 2027",
  "Daily 1-Hour Study Habit",
  "Top School Ranker",
];

function getBadgeIcon(icon?: string) {
  switch (icon) {
    case "footprints":
      return Footprints;
    case "flame":
      return Flame;
    case "zap":
      return Zap;
    case "trophy":
      return Trophy;
    case "book-open":
      return BookOpen;
    case "graduation-cap":
      return GraduationCap;
    default:
      return Award;
  }
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden transition-all",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.99]",
      )}
    >
      <CardContent className="flex items-center gap-2.5 sm:gap-3 p-3.5 sm:p-5 min-w-0">
        <span className="grid size-8 sm:size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{label}</p>
          <p className="font-display text-base sm:text-lg font-bold truncate text-foreground">{value}</p>
          {subtext && <p className="text-[10px] text-primary/80 font-semibold truncate mt-0.5">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
