import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Share2, 
  ArrowRight, 
  BookOpen, 
  Coins, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { getPublicChallengeFn, submitPublicAttemptFn } from "@/lib/challenges.functions";
import { generateStudentShareText } from "@/lib/viral-copy";
import { soundFx } from "@/lib/sound-effects";
import { MathText } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/c/$code")({
  head: () => ({
    meta: [
      { title: "2-Minute Brain Challenge — Easy Padhai" },
      {
        name: "description",
        content: "Test your speed and conceptual clarity in 120 seconds. Instant score, rank, and explanations.",
      },
      { property: "og:title", content: "2-Minute Brain Challenge — Easy Padhai" },
      {
        property: "og:description",
        content: "Take the 2-minute challenge and earn 50 free study credits on Easy Padhai!",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChallengeRunnerPage,
});

type AttemptResult = Awaited<ReturnType<typeof submitPublicAttemptFn>>;

function ChallengeRunnerPage() {
  const { code } = Route.useParams();
  const fetchChallenge = useServerFn(getPublicChallengeFn);
  const submitAttempt = useServerFn(submitPublicAttemptFn);

  // States: 'gate' (Name+Phone) -> 'quiz' (Running) -> 'result' (Completed)
  const [step, setStep] = useState<"gate" | "quiz" | "result">("gate");
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: challenge, isLoading, error } = useQuery({
    queryKey: ["public-challenge", code],
    queryFn: () => fetchChallenge({ data: { code } }),
  });

  // Start timer once in 'quiz' mode
  useEffect(() => {
    if (step === "quiz" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  function handleStart() {
    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
    if (!studentName.trim()) {
      toast.error("Please enter your name / अपना नाम भरें");
      return;
    }
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp number / 10 अंकों का व्हाट्सएप नंबर भरें");
      return;
    }
    soundFx.playClick();
    setTimeLeft(challenge?.durationSeconds || 120);
    setStep("quiz");
  }

  function handleSelectOption(questionId: string, optionIndex: number) {
    soundFx.playClick();
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleFinish(answersToSubmit = answers) {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalSeconds = challenge?.durationSeconds || 120;
    const timeTaken = Math.max(1, totalSeconds - timeLeft);

    try {
      const res = await submitAttempt({
        data: {
          code,
          studentName: studentName.trim(),
          phone: phone.trim(),
          answers: answersToSubmit,
          timeTakenSeconds: timeTaken,
        },
      });

      setResult(res);
      setStep("result");
      soundFx.playSuccess();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error submitting challenge");
    } finally {
      setSubmitting(false);
    }
  }

  function handleTimeUp() {
    toast.info("Time is up! Submitting your answers…");
    void handleFinish();
  }

  function handleWhatsAppShare() {
    if (!result) return;
    const text = generateStudentShareText({
      studentName: result.studentName,
      score: result.score,
      total: result.total,
      chapterTitle: result.chapterTitle,
      code,
    });
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Loading challenge…</p>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 font-display text-xl font-bold">Challenge Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This quiz link might be incorrect or expired. You can explore all chapters on Easy Padhai.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/learn">Go to Chapters</Link>
        </Button>
      </div>
    );
  }

  // ==========================================
  // STEP 1: GATE / REGISTRATION SCREEN
  // ==========================================
  if (step === "gate") {
    return (
      <div className="mx-auto flex min-h-[85vh] w-full max-w-lg flex-col justify-center px-4 py-8">
        <Card className="overflow-hidden rounded-3xl border-primary/20 shadow-xl">
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6 text-center">
            <Badge variant="secondary" className="mb-3 rounded-full px-3 py-1 font-semibold text-primary">
              ⚡ 2-Minute Brain Challenge
            </Badge>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {challenge.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Class {challenge.classLevel} · {challenge.subjectName} · {challenge.chapterTitle}
            </p>
          </div>

          <CardContent className="space-y-5 p-6">
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-secondary/60 p-3 text-center text-xs">
              <div>
                <p className="font-semibold text-foreground">{challenge.totalQuestions} MCQs</p>
                <p className="text-muted-foreground">Bite-sized</p>
              </div>
              <div className="border-x border-border/50">
                <p className="font-semibold text-foreground">{Math.round(challenge.durationSeconds / 60)} Mins</p>
                <p className="text-muted-foreground">Speed Test</p>
              </div>
              <div>
                <p className="font-semibold text-primary">+50 Credits</p>
                <p className="text-muted-foreground">Free Bonus</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Full Name / आपका नाम
                </label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="rounded-xl"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  WhatsApp Number / व्हाट्सएप नंबर
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 items-center rounded-xl bg-secondary px-3 text-sm font-medium text-muted-foreground">
                    +91
                  </div>
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="10 digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    className="rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  🔒 Results, Rank & 50 Bonus study credits will be linked to this number.
                </p>
              </div>

              <Button
                onClick={handleStart}
                className="w-full rounded-2xl py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
              >
                Start Challenge 🚀
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // STEP 2: QUIZ ARENA
  // ==========================================
  if (step === "quiz") {
    const currentQ = challenge.questions[currentIndex];
    const totalQ = challenge.questions.length;
    const progressPercent = Math.round(((currentIndex + 1) / totalQ) * 100);
    const isLastQuestion = currentIndex === totalQ - 1;
    const hasSelected = answers[currentQ.id] !== undefined;

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

    return (
      <div className="mx-auto flex min-h-[85vh] w-full max-w-xl flex-col justify-center px-4 py-8">
        {/* Header Bar */}
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            Question {currentIndex + 1} of {totalQ}
          </Badge>

          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors",
              timeLeft <= 20
                ? "bg-destructive/15 text-destructive animate-pulse"
                : "bg-secondary text-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{timeFormatted}</span>
          </div>
        </div>

        <Progress value={progressPercent} className="mb-6 h-2 rounded-full" />

        {/* Question Card */}
        <Card className="rounded-3xl border-border/80 shadow-md">
          <CardHeader className="pb-3">
            {currentQ.topic && (
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                {currentQ.topic}
              </span>
            )}
            <CardTitle className="text-lg font-medium leading-snug sm:text-xl">
              <MathText content={currentQ.prompt} />
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            {currentQ.options.map((option, optIdx) => {
              const isChosen = answers[currentQ.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-150 active:scale-[0.99]",
                    isChosen
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 bg-card hover:border-primary/40 hover:bg-secondary/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      isChosen
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1">
                    <MathText content={option} />
                  </span>
                </button>
              );
            })}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="rounded-full text-xs"
              >
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  disabled={!hasSelected || submitting}
                  onClick={() => handleFinish()}
                  className="rounded-full px-6 font-semibold shadow-md"
                >
                  {submitting ? "Scoring…" : "Submit Challenge 🏁"}
                </Button>
              ) : (
                <Button
                  disabled={!hasSelected}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="rounded-full px-6 font-semibold"
                >
                  Next Question <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // STEP 3: RESULT & CONVERSION SCREEN
  // ==========================================
  if (step === "result" && result) {
    const isPassing = result.percent >= 60;

    return (
      <div className="mx-auto w-full max-w-xl px-4 py-8 space-y-6">
        {/* Scorecard Hero */}
        <Card className="overflow-hidden rounded-3xl border-primary/20 text-center shadow-xl">
          <div className="bg-gradient-to-b from-primary/15 via-primary/5 to-background p-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Trophy className="h-7 w-7" />
            </div>

            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isPassing ? "शानदार प्रदर्शन!" : "अच्छा प्रयास!"} {result.studentName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.chapterTitle} · 2-Minute Challenge
            </p>

            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="rounded-2xl bg-card border p-4 shadow-sm min-w-[110px]">
                <p className="text-3xl font-extrabold text-primary">
                  {result.score} / {result.total}
                </p>
                <p className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">
                  Score ({result.percent}%)
                </p>
              </div>

              <div className="rounded-2xl bg-card border p-4 shadow-sm min-w-[110px]">
                <p className="text-3xl font-extrabold text-amber-500">
                  Top {100 - result.percentile}%
                </p>
                <p className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">
                  Leaderboard Rank
                </p>
              </div>
            </div>

            {/* Bonus Reward Badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Coins className="h-4 w-4" />
              <span>+{result.bonusCreditsAwarded} Study Credits & +{result.bonusXpAwarded} XP credited to your number!</span>
            </div>
          </div>

          <CardContent className="space-y-4 p-6 pt-2">
            {/* Action 1: Viral WhatsApp Share */}
            <Button
              onClick={handleWhatsAppShare}
              className="w-full rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white py-6 text-base font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Share2 className="h-5 w-5" />
              <span>Challenge Your Friends on WhatsApp 📲</span>
            </Button>

            {/* Action 2: Conversion CTA to Core App */}
            <Button
              asChild
              variant="outline"
              className="w-full rounded-2xl border-primary/40 py-6 text-base font-semibold hover:bg-primary/10 flex items-center justify-center gap-2"
            >
              <Link to="/learn/$slug" params={{ slug: result.chapterSlug }}>
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Listen to Full Audio & Notes on Easy Padhai 🎧</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Detailed Explanations Toggle */}
        <div className="rounded-3xl border bg-card p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowReview((prev) => !prev)}
            className="flex w-full items-center justify-between text-left font-medium"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">
                {showReview ? "Hide Answer Explanations" : "Review All Questions & Concept Explanations"}
              </span>
            </div>
            {showReview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showReview && (
            <div className="mt-5 space-y-4 divide-y divide-border/60">
              {result.review.map((item, idx) => (
                <div key={item.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      <span className="text-muted-foreground mr-1">Q{idx + 1}.</span>
                      <MathText content={item.prompt} />
                    </p>
                    {item.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                    )}
                  </div>

                  <div className="rounded-2xl bg-secondary/50 p-3 text-xs space-y-1.5">
                    <p>
                      <span className="font-semibold text-muted-foreground">Your Answer: </span>
                      <span className={item.isCorrect ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-bold text-destructive"}>
                        {item.selectedIndex >= 0 ? item.options[item.selectedIndex] : "Not Answered"}
                      </span>
                    </p>
                    {!item.isCorrect && (
                      <p>
                        <span className="font-semibold text-muted-foreground">Correct Answer: </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {item.options[item.correctIndex]}
                        </span>
                      </p>
                    )}
                    <div className="mt-2 border-t border-border/40 pt-2 text-muted-foreground">
                      <span className="font-semibold text-foreground">💡 Concept: </span>
                      <MathText content={item.explanation} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
