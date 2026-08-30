import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Award, Bookmark, Flame, Target, TrendingUp, ArrowRight } from "lucide-react";
import { getDashboard } from "@/lib/learn.functions";
import { getRevisionCounts } from "@/lib/revision.functions";
import { useAuth } from "@/hooks/use-auth";
import { levelProgress } from "@/lib/gamify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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

  if (!user || isLoading || !data) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground text-center">Loading your progress…</div>;
  }

  const xp = data.profile?.total_xp ?? 0;
  const lvl = levelProgress(xp);

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
        {/* Chapter Progress */}
        <Card className="rounded-3xl border-border/80 shadow-sm min-w-0 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Chapter progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 min-w-0">
            {data.chapterProgress.map((c) => (
              <div key={c.id} className="min-w-0">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm min-w-0">
                  <Link to="/learn/$slug" params={{ slug: c.slug }} className="font-medium hover:underline truncate min-w-0 flex-1 text-xs sm:text-sm">
                    {c.title}
                  </Link>
                  <span className="text-muted-foreground shrink-0 font-semibold text-xs">
                    {c.completed}/{c.total}
                  </span>
                </div>
                <Progress value={c.percent} className="h-2" />
              </div>
            ))}
            {data.chapterProgress.length === 0 && (
              <p className="text-sm text-muted-foreground">No chapters published yet.</p>
            )}
          </CardContent>
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
