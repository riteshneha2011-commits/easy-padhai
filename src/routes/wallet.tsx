import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  Coins,
  Copy,
  Flame,
  Gift,
  Share2,
  Users,
  Sparkles,
  Download,
  BookOpen,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { getWallet } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";
import {
  CREDIT_REWARDS,
  nextStreakMilestone,
  referralLink,
  whatsappShare,
} from "@/lib/credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Study Coins & Rewards — Easy Padhai" },
      {
        name: "description",
        content:
          "Track your Study Coins, daily streak rewards, and referral bonuses on Easy Padhai.",
      },
      { property: "og:title", content: "Study Coins & Rewards — Easy Padhai" },
      {
        property: "og:description",
        content: "Study 100% Free on Easy Padhai. Earn Study Coins automatically as you learn and redeem them for offline downloads and special test perks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchWallet = useServerFn(getWallet);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: () => fetchWallet(),
    enabled: Boolean(user),
  });

  if (!user || isLoading || !data) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground text-center">Loading your Study Coins…</div>;
  }

  const link = data.referralCode && origin ? referralLink(origin, data.referralCode) : "";
  const milestone = nextStreakMilestone(data.streak);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard! Share with your classmates 🎉");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-3.5 sm:px-6 py-6 sm:py-10 pb-28 sm:pb-12 min-w-0 overflow-x-hidden space-y-6 sm:space-y-8">
      {/* 1. Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <Coins className="size-3.5" /> Study Rewards
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Study Coins &amp; Achievements
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Online learning is <strong>100% Free</strong> on Easy Padhai. Study Coins are your academic reward for consistent practice, audio listening, and acing chapter quizzes.
        </p>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Coin Balance */}
        <Card className="rounded-3xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground shadow-sm">
          <CardContent className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-85">
                <Coins className="size-4" /> Study Coins
              </span>
              <Badge className="bg-white/20 text-white font-extrabold text-[10px] border-0">
                Reward Balance
              </Badge>
            </div>
            <p className="font-display text-4xl sm:text-5xl font-black">{data.credits}</p>
            <p className="text-xs opacity-90 font-medium">
              Earned through consistent learning &amp; tests
            </p>
          </CardContent>
        </Card>

        {/* Learning Streak */}
        <Card className="rounded-3xl border-border/70 bg-card shadow-xs">
          <CardContent className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Flame className="size-4 text-orange-500" /> Daily Streak
              </span>
              <Badge variant="secondary" className="font-bold text-[10px]">
                Consistency
              </Badge>
            </div>
            <p className="font-display text-4xl sm:text-5xl font-black text-foreground">
              {data.streak} <span className="text-xl font-bold text-muted-foreground">days</span>
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {milestone ? `Day ${milestone.day} ladder grants +${milestone.credits} coins` : "All streak milestone bonuses claimed! 🎉"}
            </p>
          </CardContent>
        </Card>

        {/* Study Circle / Referrals */}
        <Card className="rounded-3xl border-border/70 bg-card shadow-xs">
          <CardContent className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Users className="size-4 text-blue-500" /> Study Buddies
              </span>
              <Badge variant="secondary" className="font-bold text-[10px]">
                Referrals
              </Badge>
            </div>
            <p className="font-display text-4xl sm:text-5xl font-black text-foreground">
              {data.referrals.length} <span className="text-xl font-bold text-muted-foreground">friends</span>
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              +{data.earnedFromReferrals} bonus coins earned from invites
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Where to Use Coins (Utility Showcase) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> What can you do with Study Coins?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Study Coins give you special perks and offline superpowers without paying any real money.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Offline Downloads */}
          <Card className="rounded-3xl border-border/80 bg-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
                <Download className="size-5" />
              </div>
              <Badge variant="secondary" className="font-extrabold text-[10px] text-primary">
                10 Coins / Lecture
              </Badge>
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                Offline Audio Downloads
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Save audio lectures directly to your device storage. Listen on the bus or in areas without internet without consuming mobile data.
              </p>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Saved permanently</span>
              <Link to="/offline" className="text-primary font-bold hover:underline">
                View My Downloads ➔
              </Link>
            </div>
          </Card>

          {/* Grand Mock Tests */}
          <Card className="rounded-3xl border-border/80 bg-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                <Trophy className="size-5" />
              </div>
              <Badge variant="secondary" className="font-extrabold text-[10px] text-amber-600 dark:text-amber-400">
                15 Coins / Test
              </Badge>
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                Challenger Mock Tests &amp; Rank
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Full chapter master tests designed strictly according to the latest CBSE Board / Competitive exam patterns with rank scorecards.
              </p>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Detailed solutions</span>
              <Link to="/learn" search={{}} className="text-primary font-bold hover:underline">
                Explore Chapters ➔
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Referral & Invite Section */}
      <Card className="rounded-3xl border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gift className="size-5 text-primary" />
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
              Invite Classmates &amp; Earn +{CREDIT_REWARDS.referral} Coins
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Studying is more rewarding together. When a friend joins using your invite code and completes their first lesson, both of you get +{CREDIT_REWARDS.referral} bonus coins!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <code className="rounded-2xl bg-card border border-border/80 px-4 py-2 font-display text-base font-extrabold tracking-wider text-foreground">
            {data.referralCode ?? "—"}
          </code>
          <Button variant="outline" className="rounded-full text-xs font-bold gap-1.5" onClick={() => copy(data.referralCode ?? "")}>
            <Copy className="size-3.5" /> Copy Code
          </Button>
          <Button variant="outline" className="rounded-full text-xs font-bold gap-1.5" onClick={() => copy(link)} disabled={!link}>
            <Copy className="size-3.5" /> Copy Invite Link
          </Button>
          <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm" disabled={!link}>
            <a href={link ? whatsappShare(link) : "#"} target="_blank" rel="noreferrer">
              <Share2 className="size-3.5" /> Share on WhatsApp
            </a>
          </Button>
        </div>

        {data.referrals.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Your Joined Friends ({data.referrals.length})
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.referrals.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-2xl bg-card border border-border/60 px-3.5 py-2.5 text-xs"
                >
                  <span className="font-bold text-foreground truncate">{r.name}</span>
                  <Badge variant={r.status === "qualified" ? "default" : "outline"} className="rounded-full text-[10px] font-bold shrink-0">
                    {r.status === "qualified" ? `+${r.credits} coins` : "Waiting for 1st lesson"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 5. How to Earn Coins & History Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* How to Earn */}
        <Card className="rounded-3xl border-border/80 bg-card p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> How to Earn Study Coins
            </h3>
            <p className="text-xs text-muted-foreground">
              Every action that improves your academic understanding rewards you with coins.
            </p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <Row label="Daily Study Visit" value={`+${CREDIT_REWARDS.dailyLogin} Coins`} />
            <Row label="Completing an Audio Lecture" value={`+${CREDIT_REWARDS.lessonComplete} Coins + 10 XP`} />
            <Row label="Every 10 Mins of Active Study" value={`+${CREDIT_REWARDS.studyBlock} Coins`} />
            <Row
              label="Completing a Chapter Quiz"
              value={`+${CREDIT_REWARDS.testSubmitted} to +${CREDIT_REWARDS.testSubmitted + CREDIT_REWARDS.testPassedBonus} Coins`}
            />
            <Row label="Consecutive Day Streaks (3/7/14/30)" value="+20 to +250 Coins" />
            <Row label="Inviting a Classmate" value={`+${CREDIT_REWARDS.referral} Coins`} />
          </div>

          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <BookOpen className="size-4 text-primary shrink-0" />
            <span>All online lectures, videos, notes, and practice quizzes are <strong>100% Free</strong>. Coins are your reward for hard work!</span>
          </div>
        </Card>

        {/* Coin Transaction History */}
        <Card className="rounded-3xl border-border/80 bg-card p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-foreground">
              Coin Activity History
            </h3>
            <p className="text-xs text-muted-foreground">
              Recent coins earned and rewards claimed.
            </p>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {data.events.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
                No coin activity yet.{" "}
                <Link to="/learn" search={{}} className="text-primary font-bold hover:underline">
                  Start listening to a lecture ➔
                </Link>
              </div>
            )}
            {data.events.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 text-xs sm:text-sm p-2.5 rounded-2xl bg-secondary/40 border border-border/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{e.reason}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    {new Date(e.created_at as string).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={
                    e.delta >= 0
                      ? "font-display font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0"
                      : "font-display font-bold text-muted-foreground shrink-0"
                  }
                >
                  {e.delta >= 0 ? `+${e.delta} 🪙` : `${e.delta} 🪙`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-secondary/50 px-3.5 py-2.5">
      <span className="font-medium text-foreground">{label}</span>
      <span className="font-display font-bold text-primary">{value}</span>
    </div>
  );
}
