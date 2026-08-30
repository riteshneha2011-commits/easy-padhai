import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Coins, Copy, Flame, Gift, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { getWallet } from "@/lib/credits.functions";
import { useAuth } from "@/hooks/use-auth";
import {
  CREDIT_COSTS,
  CREDIT_REWARDS,
  nextStreakMilestone,
  referralLink,
  whatsappShare,
} from "@/lib/credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Credits & referrals — Easy Padhai" },
      {
        name: "description",
        content:
          "See your Easy Padhai credit balance, how you earned it, and invite friends so you both get bonus credits.",
      },
      { property: "og:title", content: "Credits & referrals — Easy Padhai" },
      {
        property: "og:description",
        content: "Earn credits by studying daily, unlock lectures, and invite friends for bonus credits.",
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
    return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading your credits…</div>;
  }

  const link = data.referralCode && origin ? referralLink(origin, data.referralCode) : "";
  const milestone = nextStreakMilestone(data.streak);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied — now paste it to a friend 🎉");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Credits & referrals</h1>
      <p className="mt-1 text-muted-foreground">
        Credits open audio and video lectures and PDF notes. Summaries and tests are always free.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl bg-primary text-primary-foreground">
          <CardContent className="py-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
              <Coins className="size-4" /> Balance
            </p>
            <p className="font-display text-4xl font-bold">{data.credits}</p>
            <p className="mt-1 text-sm opacity-90">credits available</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="py-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="size-4" /> Friends joined
            </p>
            <p className="font-display text-4xl font-bold">{data.referrals.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.earnedFromReferrals} credits earned</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="py-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Flame className="size-4" /> Streak
            </p>
            <p className="font-display text-4xl font-bold">{data.streak}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {milestone ? `Day ${milestone.day} pays +${milestone.credits}` : "Every ladder bonus claimed 🎉"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-3xl border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Gift className="size-5 text-primary" /> Invite a friend, you both get {CREDIT_REWARDS.referral}{" "}
            credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Credits land as soon as your friend finishes their first lesson — so share it with someone who
            actually wants to study.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-full bg-card px-4 py-2 font-display text-base font-bold tracking-wide">
              {data.referralCode ?? "—"}
            </code>
            <Button variant="outline" className="rounded-full" onClick={() => copy(data.referralCode ?? "")}>
              <Copy className="size-4" /> Copy code
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => copy(link)} disabled={!link}>
              <Copy className="size-4" /> Copy link
            </Button>
            <Button asChild className="rounded-full" disabled={!link}>
              <a href={link ? whatsappShare(link) : "#"} target="_blank" rel="noreferrer">
                <Share2 className="size-4" /> Share on WhatsApp
              </a>
            </Button>
          </div>

          {data.referrals.length > 0 && (
            <div className="space-y-2 pt-2">
              {data.referrals.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 text-sm"
                >
                  <span className="font-medium">{r.name}</span>
                  <Badge variant={r.status === "qualified" ? "default" : "outline"} className="rounded-full">
                    {r.status === "qualified" ? `+${r.credits} credits` : "Waiting for first lesson"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">How to earn credits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Visit every day" value={`+${CREDIT_REWARDS.dailyLogin}`} />
            <Row label="Finish a lesson" value={`+${CREDIT_REWARDS.lessonComplete}`} />
            <Row label="Every 10 minutes of study" value={`+${CREDIT_REWARDS.studyBlock}`} />
            <Row
              label="Take a test (pass for more)"
              value={`+${CREDIT_REWARDS.testSubmitted}–${CREDIT_REWARDS.testSubmitted + CREDIT_REWARDS.testPassedBonus}`}
            />
            <Row label="Invite a friend" value={`+${CREDIT_REWARDS.referral}`} />
            <Row label="Streak bonuses (day 3/7/14/30)" value="+20 to +250" />
            <div className="mt-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
              Costs — audio {CREDIT_COSTS.audio}, video {CREDIT_COSTS.video}, notes {CREDIT_COSTS.pdf}.
              Summaries, tests and the first lesson of every chapter are free. {data.unlockedCount} lessons
              unlocked so far.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Credit history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.events.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing yet.{" "}
                <Link to="/learn" className="text-primary underline-offset-4 hover:underline">
                  Start a lesson
                </Link>
                .
              </p>
            )}
            {data.events.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.created_at as string).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={
                    e.delta >= 0 ? "font-display font-bold text-accent" : "font-display font-bold text-muted-foreground"
                  }
                >
                  {e.delta >= 0 ? `+${e.delta}` : e.delta}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-2.5">
      <span>{label}</span>
      <span className="font-display font-bold text-primary">{value}</span>
    </div>
  );
}
