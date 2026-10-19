import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Crown,
  Zap,
  Check,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { getWallet } from "@/lib/credits.functions";
import { getPaymentPlans, initiatePlanCheckout } from "@/lib/payment.functions";
import { useAuth } from "@/hooks/use-auth";
import {
  CREDIT_REWARDS,
  nextStreakMilestone,
  referralLink,
  whatsappShare,
} from "@/lib/credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Study Coins & Pro Pass — Easy Padhai" },
      {
        name: "description",
        content:
          "Track your Study Coins, daily streak rewards, referral bonuses, and upgrade to Easy Padhai Pro for Kota notes and priority mentor support.",
      },
      { property: "og:title", content: "Study Coins & Pro Pass — Easy Padhai" },
      {
        property: "og:description",
        content: "Earn coins by studying daily, taking quizzes, and building streaks. Redeem for offline access, special perks, and pro privileges.",
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
  const fetchPlans = useServerFn(getPaymentPlans);
  const triggerCheckout = useServerFn(initiatePlanCheckout);

  const [origin, setOrigin] = useState("");
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<any | null>(null);

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

  const { data: plans } = useQuery({
    queryKey: ["payment-plans"],
    queryFn: () => fetchPlans(),
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => triggerCheckout({ data: { planId } }),
    onSuccess: (res) => {
      if (res.isGatewayLive && res.order) {
        toast.info("Opening secure checkout...");
        // If razorpay keys are configured, frontend opens Razorpay SDK
      } else {
        // Fallback to early-bird VIP modal
        setSelectedPlanForModal(res.plan);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to initiate checkout");
    },
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
          <Coins className="size-3.5" /> Rewards &amp; Pro Pass
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Study Coins &amp; Rewards
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          At Easy Padhai, every minute of focus is rewarded. Earn Study Coins automatically as you listen to audio lectures, ace quizzes, and maintain daily streaks.
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
                Active Balance
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

      {/* 3. Easy Padhai Pro & Upgrades Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Crown className="size-5 text-amber-500" /> Easy Padhai Pro &amp; Boosters
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Level up your preparation with Kota-standard study notes, priority mentorship &amp; offline packs.
            </p>
          </div>
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold hidden sm:inline-flex">
            ⭐ Early Bird Access
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Pro Annual Pass */}
          <Card className="rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-amber-500/5 p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge className="rounded-full bg-primary text-primary-foreground font-extrabold text-[10px] px-3 py-1">
                  👑 MOST POPULAR
                </Badge>
                <span className="text-xs font-bold text-muted-foreground line-through">₹2,499</span>
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                  Pro Annual Pass
                </h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-foreground">₹999</span>
                  <span className="text-xs text-muted-foreground font-semibold">/ full academic year</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 font-medium pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Unlimited High-Speed Offline Audio Downloads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Kota Formula Cheat-Sheets &amp; NCERT Handbooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Priority WhatsApp Doubt Support with Ritesh Sir</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Instant <strong>+2,000 Bonus Study Coins</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>👑 Pro Scholar Verified Badge on Leaderboard</span>
                </li>
              </ul>
            </div>

            <Button
              size="lg"
              onClick={() => checkoutMutation.mutate("pro_annual")}
              disabled={checkoutMutation.isPending}
              className="w-full rounded-full font-bold shadow-glow text-xs sm:text-sm h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
            >
              <span>Get Pro Annual Pass</span>
              <ArrowRight className="size-4" />
            </Button>
          </Card>

          {/* Study Coins Booster */}
          <Card className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="rounded-full font-extrabold text-[10px] px-3 py-1 text-primary">
                  ⚡ QUICK RECHARGE
                </Badge>
                <span className="text-xs font-bold text-muted-foreground line-through">₹199</span>
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                  500 Coins Booster Pack
                </h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-foreground">₹99</span>
                  <span className="text-xs text-muted-foreground font-semibold">one-time top up</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 font-medium pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Instant <strong>+500 Study Coins</strong> credited to wallet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Unlock unlimited practice test attempts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Redeem for offline audio download slots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Never expires · Yours forever</span>
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={() => checkoutMutation.mutate("credits_boost_500")}
              disabled={checkoutMutation.isPending}
              className="w-full rounded-full font-bold border-border/80 hover:bg-secondary text-xs sm:text-sm h-11 gap-2 mt-2"
            >
              <span>Get 500 Coins Pack</span>
              <Coins className="size-4 text-amber-500" />
            </Button>
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
            Studying is more fun with friends. When a friend joins using your referral code and listens to their first lesson, both of you receive +{CREDIT_REWARDS.referral} bonus coins!
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
              Every action that helps you score better marks in exams awards you coins.
            </p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <Row label="Daily Study Visit" value={`+${CREDIT_REWARDS.dailyLogin} Coins`} />
            <Row label="Completing an Audio Lecture" value={`+${CREDIT_REWARDS.lessonComplete} Coins + 10 XP`} />
            <Row label="Every 10 Mins of Active Listening" value={`+${CREDIT_REWARDS.studyBlock} Coins`} />
            <Row
              label="Completing a Chapter Quiz"
              value={`+${CREDIT_REWARDS.testSubmitted} to +${CREDIT_REWARDS.testSubmitted + CREDIT_REWARDS.testPassedBonus} Coins`}
            />
            <Row label="Consecutive Day Streaks (3/7/14/30)" value="+20 to +250 Coins" />
            <Row label="Inviting a Classmate" value={`+${CREDIT_REWARDS.referral} Coins`} />
          </div>

          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <BookOpen className="size-4 text-primary shrink-0" />
            <span>All curriculum lectures are <strong>100% Free</strong> to listen for enrolled students. Coins are purely your reward for hard work!</span>
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
                <Link to="/learn" className="text-primary font-bold hover:underline">
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

      {/* 6. Early-Bird VIP Dialog (When user selects Pro Pass or Booster) */}
      <Dialog open={Boolean(selectedPlanForModal)} onOpenChange={() => setSelectedPlanForModal(null)}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader className="space-y-2 text-center">
            <div className="mx-auto size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Crown className="size-6 text-amber-500" />
            </div>
            <DialogTitle className="font-display text-xl sm:text-2xl font-extrabold">
              {selectedPlanForModal?.name ?? "Easy Padhai Pro"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm leading-relaxed">
              We are enrolling the first batch of <strong>Pro Scholars</strong> under the direct mentorship of <strong>Ritesh Sir</strong> (21+ years of teaching excellence).
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl bg-secondary/60 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Plan Fee:</span>
              <span className="font-extrabold text-foreground text-sm">
                ₹{((selectedPlanForModal?.amountInPaisa ?? 99900) / 100).toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Coins Credited:</span>
              <span className="font-extrabold text-primary">
                +{selectedPlanForModal?.creditsGranted ?? 500} Study Coins
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Mentorship:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Direct WhatsApp with Ritesh Sir
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              asChild
              className="w-full rounded-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11 text-xs sm:text-sm shadow-md"
            >
              <a
                href={`https://wa.me/917000588028?text=Hi%20Ritesh%20Sir,%20I%20want%20to%20enroll%20in%20${encodeURIComponent(selectedPlanForModal?.name || "Easy Padhai Pro")}%20(Early%20Bird)!`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" /> Connect with Ritesh Sir on WhatsApp
              </a>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedPlanForModal(null)}
              className="rounded-full text-xs font-semibold text-muted-foreground"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
