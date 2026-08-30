import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Award, Bookmark, Flame, Target, TrendingUp } from "lucide-react";
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
    return <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground">Loading your progress…</div>;
  }

  const xp = data.profile?.total_xp ?? 0;
  const lvl = levelProgress(xp);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Hi {data.profile?.full_name?.split(" ")[0] ?? "there"} 👋
      </h1>
      <p className="mt-1 text-muted-foreground">Here's how your learning is going.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Flame className="size-5" />} label="Current streak" value={`${data.streak?.current_streak ?? 0} days`} />
        <StatCard icon={<TrendingUp className="size-5" />} label="Total XP" value={`${xp} XP`} />
        <StatCard icon={<Target className="size-5" />} label="Lessons done" value={`${data.lessonsCompleted}`} />
        <StatCard icon={<Award className="size-5" />} label="Badges" value={`${data.badges.length}`} />
      </div>

      <Card className="mt-6 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Level {lvl.level}</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={lvl.percent} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">{lvl.toNext} XP to level {lvl.level + 1}</p>
          {data.nextChapter && (
            <Button asChild className="mt-4 rounded-full">
              <Link to="/learn/$slug" params={{ slug: data.nextChapter.slug }}>
                Continue: {data.nextChapter.title}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Chapter progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.chapterProgress.map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <Link to="/learn/$slug" params={{ slug: c.slug }} className="font-medium hover:underline">
                    {c.title}
                  </Link>
                  <span className="text-muted-foreground">
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

        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Recent tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.attempts.length === 0 && (
              <p className="text-sm text-muted-foreground">No test attempts yet — try one!</p>
            )}
            {data.attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  {new Date(a.created_at as string).toLocaleDateString()}
                </span>
                <span className="font-semibold">
                  {a.score}/{a.total}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Bookmark className="size-5 text-primary" /> My revision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs">
              Visit again · {revision.data?.bookmarks ?? 0}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs">
              Revision bank · {revision.data?.bank ?? 0}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs">
              Mistake box · {revision.data?.mistakes ?? 0}
            </Badge>
          </div>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/revision">Open revision hub</Link>
          </Button>
        </CardContent>
      </Card>


      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.allBadges.map((b) => {
              const earned = data.badges.some((x) => x.badge_code === b.code);
              return (
                <Badge
                  key={b.code}
                  variant={earned ? "default" : "outline"}
                  className="rounded-full px-3 py-1.5 text-xs"
                >
                  {b.icon ?? "🏅"} {b.name ?? b.code}
                </Badge>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Revise these topics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.weakTopics.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing weak so far. Keep it up!</p>
            )}
            {data.weakTopics.map((t) => (
              <Badge key={t.topic} variant="secondary" className="rounded-full px-3 py-1.5 text-xs">
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
    <Card className="rounded-3xl">
      <CardContent className="flex items-center gap-3 py-5">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
