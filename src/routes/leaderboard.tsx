import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Trophy,
  Crown,
  Flame,
  Sparkles,
  Lock,
  Check,
  Footprints,
  Zap,
  Award,
  BookOpen,
  GraduationCap,
  Gift,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { getLeaderboard } from "@/lib/content.functions";
import { useAuth } from "@/hooks/use-auth";
import { levelFromXp } from "@/lib/gamify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard & Badges — Easy Padhai Class 9–12" },
      {
        name: "description",
        content: "See the top Class 9 to 12 learners on Easy Padhai ranked by XP earned from lessons and tests.",
      },
      { property: "og:title", content: "Leaderboard & Badges — Easy Padhai Class 9–12" },
      {
        property: "og:description",
        content: "Top learners ranked by XP. Earn badges and climb the board by studying a little every day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

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

type Learner = {
  id: string;
  full_name: string | null;
  total_xp: number;
  class_level?: number | null;
};

function PodiumCard({
  place,
  learner,
  isCurrentUser,
}: {
  place: 1 | 2 | 3;
  learner?: Learner;
  isCurrentUser: boolean;
}) {
  const isFirst = place === 1;
  const isSecond = place === 2;
  const isThird = place === 3;

  const xp = learner?.total_xp ?? 0;
  const level = levelFromXp(xp);
  const name = learner?.full_name || (isFirst ? "1st Ranker" : isSecond ? "2nd Ranker" : "3rd Ranker");
  const classText = learner?.class_level ? `Class ${learner.class_level}` : "Class 9–12";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-between rounded-3xl p-5 sm:p-6 transition-all",
        isFirst
          ? "border-2 border-amber-500/70 bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-card shadow-xl shadow-amber-500/10 order-1 sm:order-2 sm:-translate-y-3 z-10"
          : isSecond
            ? "border border-slate-300/80 dark:border-slate-700 bg-gradient-to-b from-slate-200/25 dark:from-slate-800/40 via-card to-card shadow-md order-2 sm:order-1"
            : "border border-amber-800/40 dark:border-amber-800/60 bg-gradient-to-b from-amber-800/15 via-card to-card shadow-md order-3 sm:order-3",
        isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      {/* Top Floating Badge */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        {isFirst && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-xs font-black text-slate-950 shadow-md">
            <Crown className="size-3.5 fill-slate-950" /> 1st Place
          </span>
        )}
        {isSecond && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-0.5 text-xs font-extrabold text-slate-800 dark:text-slate-100 shadow-sm border border-slate-300 dark:border-slate-600">
            🥈 2nd Place
          </span>
        )}
        {isThird && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/40 border border-amber-700/50 px-3 py-0.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 shadow-sm">
            🥉 3rd Place
          </span>
        )}
      </div>

      {/* Avatar Container */}
      <div className="mt-3 flex flex-col items-center text-center">
        <div
          className={cn(
            "grid place-items-center rounded-full font-black select-none transition-transform hover:scale-105",
            isFirst
              ? "size-18 sm:size-20 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 text-2xl shadow-lg ring-4 ring-amber-500/40"
              : isSecond
                ? "size-14 sm:size-16 bg-gradient-to-tr from-slate-300 to-slate-100 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-100 text-xl shadow-md ring-3 ring-slate-300/60 dark:ring-slate-600"
                : "size-14 sm:size-16 bg-gradient-to-tr from-amber-800 to-amber-700 text-amber-100 text-xl shadow-md ring-3 ring-amber-700/40",
          )}
        >
          {name[0]?.toUpperCase() || "S"}
        </div>

        <h3 className="font-display font-bold text-base sm:text-lg text-foreground mt-3 max-w-[170px] truncate">
          {name}
          {isCurrentUser && <span className="text-xs text-primary font-bold ml-1">(You)</span>}
        </h3>

        <div className="mt-1 flex items-center gap-1.5 flex-wrap justify-center">
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {classText}
          </span>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            Level {level}
          </span>
        </div>
      </div>

      {/* XP Tag */}
      <div className="mt-4 w-full pt-3 border-t border-border/50 text-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs font-black text-orange-600 dark:text-orange-400">
          <Flame className="size-3.5 fill-orange-500" />
          <span>{xp.toLocaleString()} XP</span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardPage() {
  const { user } = useAuth();
  const fetchBoard = useServerFn(getLeaderboard);
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", user?.id],
    queryFn: () => fetchBoard({ data: { userId: user?.id ?? null } }),
  });

  const leaderboardList = data?.leaderboard ?? [];
  const top3 = leaderboardList.slice(0, 3);
  const badgesList = data?.badges ?? [];
  const userRank = data?.userRank ?? null;

  // For registered users, show full list beyond top 3.
  const restList = user ? leaderboardList.slice(3) : [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 sm:size-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-500 shadow-sm shrink-0">
            <Trophy className="size-7" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Leaderboard &amp; Badges
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-[10px] font-black text-primary uppercase">
                Hall of Fame
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Top learners across Class 9 to 12 ranked by study XP, streaks, and quiz mastery.
            </p>
          </div>
        </div>

        {!user ? (
          <Button asChild size="sm" className="rounded-full shadow-glow font-bold text-xs shrink-0 self-start sm:self-auto h-9 px-4">
            <Link to="/auth">
              <Gift className="size-3.5 mr-1.5" /> Sign in for 100 Free Credits
            </Link>
          </Button>
        ) : (
          userRank && (
            <div className="flex items-center gap-2 self-start sm:self-auto bg-primary/10 border border-primary/30 rounded-2xl px-3.5 py-1.5">
              <UserCheck className="size-4 text-primary" />
              <div className="text-xs">
                <span className="font-bold text-foreground">Your Rank: #{userRank.rank}</span>
                <span className="text-muted-foreground ml-1.5">({userRank.xp} XP)</span>
              </div>
            </div>
          )
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-3">
          <Trophy className="size-10 text-amber-500 animate-pulse" />
          <p className="text-sm font-semibold">Loading Champions &amp; Badges…</p>
        </div>
      ) : (
        <>
          {/* SECTION 1: TOP 3 CHAMPIONS PODIUM */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-500">
                Top 3 Champions
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                The Podium
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 pt-4">
              {/* 2nd Place (Left on desktop) */}
              <PodiumCard
                place={2}
                learner={top3[1]}
                isCurrentUser={Boolean(user && top3[1]?.id === user.id)}
              />

              {/* 1st Place (Center on desktop, elevated) */}
              <PodiumCard
                place={1}
                learner={top3[0]}
                isCurrentUser={Boolean(user && top3[0]?.id === user.id)}
              />

              {/* 3rd Place (Right on desktop) */}
              <PodiumCard
                place={3}
                learner={top3[2]}
                isCurrentUser={Boolean(user && top3[2]?.id === user.id)}
              />
            </div>
          </div>

          {/* SECTION 2: RANK #4 ONWARDS (Gated for Unregistered, Full for Logged In) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">
                Ranks #4 and Beyond
              </h3>
              {user && (
                <span className="text-xs text-muted-foreground">
                  Updated in real-time as students study
                </span>
              )}
            </div>

            {user ? (
              /* Signed-in User: Complete unblurred leaderboard */
              <Card className="rounded-3xl border border-border/80 shadow-xs overflow-hidden">
                <CardContent className="divide-y divide-border/60 p-0">
                  {restList.length > 0 ? (
                    restList.map((row, i) => {
                      const rankNumber = i + 4;
                      const isMe = row.id === user.id;

                      return (
                        <div
                          key={row.id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 sm:px-6 transition-colors",
                            isMe ? "bg-primary/10 font-semibold" : "hover:bg-secondary/40",
                          )}
                        >
                          <span className="w-8 text-center font-display font-black text-sm text-muted-foreground">
                            {rankNumber}
                          </span>
                          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground font-bold text-xs">
                            {row.full_name ? row.full_name[0].toUpperCase() : "S"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">
                              {row.full_name ?? "Learner"}
                              {isMe && <span className="ml-1.5 text-xs text-primary font-bold">(You)</span>}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {row.class_level ? `Class ${row.class_level}` : "Class 9–12"} · Level {levelFromXp(row.total_xp)}
                            </p>
                          </div>
                          <span className="font-display font-black text-primary text-sm shrink-0">
                            {row.total_xp.toLocaleString()} XP
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Only the top 3 champions are currently on the board. Finish a lecture or test to take Rank #4!
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Unregistered User: Blurred preview list with high-converting Unlock Gate */
              <div className="relative rounded-3xl overflow-hidden border border-border/70 bg-card p-2 sm:p-4">
                {/* Simulated Blurred Ranks 4 to 8 */}
                <div className="divide-y divide-border/60 filter blur-[6px] opacity-40 select-none pointer-events-none p-2">
                  {[
                    { rank: 4, name: "Rahul Sharma", xp: 480, class_level: 9 },
                    { rank: 5, name: "Priya Verma", xp: 420, class_level: 10 },
                    { rank: 6, name: "Aman Khan", xp: 370, class_level: 11 },
                    { rank: 7, name: "Sneha Mishra", xp: 310, class_level: 12 },
                    { rank: 8, name: "Deepak Patel", xp: 260, class_level: 9 },
                  ].map((row) => (
                    <div key={row.rank} className="flex items-center gap-3 py-3.5 px-2">
                      <span className="w-8 text-center font-display font-bold text-muted-foreground">{row.rank}</span>
                      <div className="size-8 rounded-full bg-secondary" />
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{row.name}</p>
                        <p className="text-xs text-muted-foreground">Class {row.class_level} · Level {levelFromXp(row.xp)}</p>
                      </div>
                      <span className="font-display font-bold text-primary">{row.xp} XP</span>
                    </div>
                  ))}
                </div>

                {/* High-Converting Unlock Gate Overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center p-3 sm:p-6 bg-background/30 backdrop-blur-xs">
                  <div className="w-full max-w-lg rounded-3xl border-2 border-primary/40 bg-card/95 backdrop-blur-2xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
                    <div className="mx-auto grid size-12 sm:size-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-primary text-white shadow-glow">
                      <Lock className="size-6 sm:size-7" />
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <Gift className="size-3.5" /> 100 Free Credits on Sign Up
                      </span>
                      <h3 className="font-display text-xl sm:text-2xl font-black text-foreground mt-2.5">
                        Want to see your name &amp; rank?
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-md mx-auto">
                        Sign up to view your rank, track daily study streaks, earn XP from concept lectures, and unlock exclusive achievement badges!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left bg-secondary/50 p-3 sm:p-3.5 rounded-2xl border border-border/70 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span className="font-medium text-foreground">100 Free Credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span className="font-medium text-foreground">Class 9–12 Ranking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span className="font-medium text-foreground">7 Study Badges</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span className="font-medium text-foreground">Daily Streaks</span>
                      </div>
                    </div>

                    <Button asChild size="lg" className="w-full rounded-full font-bold shadow-glow text-sm h-11">
                      <Link to="/auth">
                        <Sparkles className="size-4 mr-1.5" /> Sign Up Free to Claim Your Rank 🚀
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: STUDY BADGES & ACHIEVEMENTS SHOWCASE */}
          <div className="space-y-4 pt-6 border-t border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
                    <Award className="size-4.5" />
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Study Badges &amp; Achievements
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Earn official badges by keeping continuous study streaks, completing full chapters, and scoring 100% on tests.
                </p>
              </div>
              {user && (
                <span className="self-start sm:self-auto rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground border border-border">
                  {badgesList.filter((b) => b.earned).length} / {badgesList.length} Unlocked
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {badgesList.map((badge) => {
                const Icon = getBadgeIcon(badge.icon);
                const isUnlocked = Boolean(user && badge.earned);

                return (
                  <div
                    key={badge.code}
                    className={cn(
                      "relative flex flex-col justify-between rounded-2xl border p-4 transition-all",
                      isUnlocked
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs"
                        : "border-border/70 bg-card hover:border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-2xl transition-colors",
                          isUnlocked
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        <Icon className="size-5" />
                      </div>

                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="size-3 stroke-[3]" /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border/80 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          <Lock className="size-3" /> Locked
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <h4 className="font-display text-sm font-bold text-foreground">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {!user && (
              <div className="mt-4 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-amber-500/10 to-orange-500/10 p-5 sm:p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-display text-base font-bold text-foreground">
                    Ready to unlock your first badge? 🎖️
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Complete your very first lecture on Easy Padhai to immediately earn the <strong className="text-foreground">First Step</strong> badge and 10 bonus XP!
                  </p>
                </div>
                <Button asChild className="rounded-full shadow-glow font-bold text-xs shrink-0 px-5">
                  <Link to="/auth">Sign Up Free to Start 🚀</Link>
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

