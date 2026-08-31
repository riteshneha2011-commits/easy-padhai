import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useMemo } from "react";
import { Award, Bookmark, Flame, Target, TrendingUp, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { getDashboard } from "@/lib/learn.functions";
import { getRevisionCounts } from "@/lib/revision.functions";
import { useAuth } from "@/hooks/use-auth";
import { levelProgress } from "@/lib/gamify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchDashboard = useServerFn(getDashboard);
  const fetchRevisionCounts = useServerFn(getRevisionCounts);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

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

  const xp = data.profile?.total_xp ?? 0;
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
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight break-words">
          Hi {data.profile?.full_name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Here's how your learning is going.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 min-w-0 w-full">
        <StatCard icon={<Flame className="size-4 sm:size-5" />} label="Current streak" value={`${data.streak?.current_streak ?? 0} days`} />
        <StatCard icon={<TrendingUp className="size-4 sm:size-5" />} label="Total XP" value={`${xp} XP`} />
        <StatCard icon={<Target className="size-4 sm:size-5" />} label="Lessons done" value={`${data.lessonsCompleted}`} />
        <StatCard icon={<Award className="size-4 sm:size-5" />} label="Badges" value={`${data.badges.length}`} />
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
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              Visit again · {revision.data?.bookmarks ?? 0}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              Revision bank · {revision.data?.bank ?? 0}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              Mistake box · {revision.data?.mistakes ?? 0}
            </Badge>
          </div>
          <Button asChild className="rounded-full text-xs font-semibold">
            <Link to="/revision">Open revision hub</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 min-w-0">
        {/* Badges */}
        <Card className="rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 min-w-0">
            {data.allBadges.map((b) => {
              const earned = data.badges.some((x) => x.badge_code === b.code);
              return (
                <Badge
                  key={b.code}
                  variant={earned ? "default" : "outline"}
                  className="rounded-full px-3 py-1 text-xs break-words"
                >
                  {b.icon ?? "🏅"} {b.name ?? b.code}
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
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden">
      <CardContent className="flex items-center gap-2.5 sm:gap-3 p-3.5 sm:p-5 min-w-0">
        <span className="grid size-8 sm:size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{label}</p>
          <p className="font-display text-base sm:text-lg font-bold truncate text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
