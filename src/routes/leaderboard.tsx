import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy } from "lucide-react";
import { getLeaderboard } from "@/lib/content.functions";
import { useAuth } from "@/hooks/use-auth";
import { levelFromXp } from "@/lib/gamify";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Easy Padhai Class 9–12" },
      {
        name: "description",
        content: "See the top Class 9 to 12 learners on Easy Padhai ranked by XP earned from lessons and tests.",
      },
      { property: "og:title", content: "Leaderboard — Easy Padhai Class 9–12" },
      {
        property: "og:description",
        content: "Top learners ranked by XP. Climb the board by studying a little every day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { user } = useAuth();
  const fetchBoard = useServerFn(getLeaderboard);
  const { data, isLoading } = useQuery({ queryKey: ["leaderboard"], queryFn: () => fetchBoard() });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-accent/15 text-accent">
          <Trophy className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top learners by all-time XP.</p>
        </div>
      </div>

      <Card className="mt-6 rounded-3xl">
        <CardContent className="divide-y divide-border/70 py-2">
          {isLoading && <p className="py-6 text-sm text-muted-foreground">Loading…</p>}
          {(data ?? []).map((row, i) => (
            <div
              key={row.id}
              className={cn(
                "flex items-center gap-3 py-3",
                row.id === user?.id && "rounded-2xl bg-primary/5 px-3",
              )}
            >
              <span className="w-7 text-center font-display font-bold text-muted-foreground">{i + 1}</span>
              <div className="flex-1">
                <p className="font-medium">{row.full_name ?? "Learner"}</p>
                <p className="text-xs text-muted-foreground">Level {levelFromXp(row.total_xp ?? 0)}</p>
              </div>
              <span className="font-display font-bold text-primary">{row.total_xp ?? 0} XP</span>
            </div>
          ))}
          {!isLoading && (data ?? []).length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">
              No learners yet.{" "}
              <Link to="/auth" className="text-primary underline-offset-4 hover:underline">
                Be the first
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
