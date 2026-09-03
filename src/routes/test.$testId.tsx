import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Bookmark, CheckCircle2, XCircle, Sparkles, Flame, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { getTest, submitAttempt } from "@/lib/tests.functions";
import { saveQuestion } from "@/lib/revision.functions";
import { useAuth } from "@/hooks/use-auth";
import { soundFx } from "@/lib/sound-effects";
import { VictoryModal } from "@/components/victory-modal";
import { MathText } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/test/$testId")({
  head: () => ({
    meta: [
      { title: "Chapter test — Easy Padhai" },
      {
        name: "description",
        content: "Take a Class 9 to 12 objective test on Easy Padhai and get instant scoring with explanations.",
      },
      { property: "og:title", content: "Chapter test — Easy Padhai" },
      {
        property: "og:description",
        content: "Objective MCQs with instant results, explanations and XP rewards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TestPage,
});

type Result = Awaited<ReturnType<typeof submitAttempt>>;

function TestPage() {
  const { testId } = Route.useParams();
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const fetchTest = useServerFn(getTest);
  const submit = useServerFn(submitAttempt);
  const saveToBank = useServerFn(saveQuestion);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [victoryOpen, setVictoryOpen] = useState(false);


  async function handleSave(questionId: string, selected: number | null) {
    try {
      soundFx.playClick();
      setSaved((s) => ({ ...s, [questionId]: true }));
      await saveToBank({ data: { questionId, source: "manual", selectedIndex: selected } });
      toast.success("Saved to your Revision Bank!");
    } catch (e) {
      setSaved((s) => ({ ...s, [questionId]: false }));
      toast.error(e instanceof Error ? e.message : "Could not save question");
    }
  }


  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["test", testId],
    queryFn: () => fetchTest({ data: { testId } }),
    enabled: Boolean(user),
  });

  if (!user || isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground">Loading test…</div>;
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-muted-foreground">This test isn't available.</p>
        <Button asChild className="mt-4 rounded-full">
          <Link to="/learn">Back to chapters</Link>
        </Button>
      </div>
    );
  }

  const questions = data.questions;

  if (result) {
    const percent = Math.round((result.score / Math.max(result.total, 1)) * 100);
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Card className="rounded-3xl text-center">
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">You scored</p>
            <p className="font-display text-6xl font-bold text-primary">
              {result.score}
              <span className="text-2xl text-muted-foreground">/{result.total}</span>
            </p>
            <p className="mt-2 font-semibold text-accent">+{result.xp} XP earned</p>
            <Progress value={percent} className="mx-auto mt-4 h-3 max-w-sm" />
          </CardContent>
        </Card>

        <h2 className="mt-8 font-display text-xl font-bold">Review</h2>
        <div className="mt-3 space-y-3">
          {result.details.map((d, i) => (
            <Card key={d.id} className="rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-2 text-base font-semibold">
                  {d.correct ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                  )}
                  <span>
                    {i + 1}. <MathText content={d.prompt} />
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {d.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={cn(
                      "rounded-xl px-3 py-2",
                      oi === d.correctIndex && "bg-accent/15 font-medium text-accent",
                      oi === d.selected && oi !== d.correctIndex && "bg-destructive/10 text-destructive",
                    )}
                  >
                    <MathText content={opt} />
                  </div>
                ))}
                {d.explanation && (
                  <div className="pt-1 text-muted-foreground text-sm flex items-start gap-1">
                    <span className="font-semibold text-foreground shrink-0">Why: </span>
                    <MathText content={d.explanation} />
                  </div>
                )}
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant={saved[d.id] ? "secondary" : "outline"}
                    className="rounded-full"
                    disabled={saved[d.id]}
                    onClick={() => handleSave(d.id, d.selected)}
                  >
                    <Bookmark className="size-4" />
                    {saved[d.id] ? "In revision bank" : "Save to revision bank"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            className="rounded-full"
            onClick={() => {
              setResult(null);
              setAnswers({});
              setIndex(0);
            }}
          >
            Retake test
          </Button>
          {result.details.some((d) => !d.correct) && (
            <Button asChild variant="default" className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Link to="/revision" search={{ tab: "mistakes" }}>
                <XCircle className="size-4 mr-1.5" />
                View Mistake Box ({result.details.filter((d) => !d.correct).length})
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/revision" search={{ tab: "bank" }}>
              <Bookmark className="size-4 mr-1.5" />
              Open Revision Bank
            </Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/dashboard">See my progress</Link>
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const answered = Object.keys(answers).length;

  async function finish() {
    setBusy(true);
    try {
      const res = await submit({ data: { testId, answers } });
      setResult(res);
      await refresh();
      window.scrollTo({ top: 0 });

      const pct = res.total > 0 ? (res.score / res.total) * 100 : 0;
      if (pct >= 50) {
        soundFx.playCelebration();
        void confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6"],
        });
      } else {
        soundFx.playSuccess();
      }
      setVictoryOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-sm text-muted-foreground">{data.test.chapterTitle}</p>
      <h1 className="font-display text-2xl font-bold tracking-tight">{data.test.title}</h1>

      <Progress value={((index + 1) / questions.length) * 100} className="mt-4 h-2" />
      <p className="mt-2 text-xs text-muted-foreground">
        Question {index + 1} of {questions.length} · {answered} answered
      </p>

      {q && (
        <Card className="mt-4 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg leading-snug">
              <MathText content={q.prompt} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setAnswers((a) => ({ ...a, [q.id]: oi }));
                }}
                className={cn(
                  "w-full rounded-2xl border border-border px-4 py-3 text-left text-sm transition-colors hover:bg-secondary",
                  answers[q.id] === oi && "border-primary bg-primary/10 font-medium text-primary ring-1 ring-primary/40",
                )}
              >
                <MathText content={opt} />
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-5 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          className="rounded-full"
          disabled={index === 0}
          onClick={() => {
            soundFx.playClick();
            setIndex((i) => i - 1);
          }}
        >
          Previous
        </Button>
        {index < questions.length - 1 ? (
          <Button
            className="rounded-full"
            onClick={() => {
              soundFx.playClick();
              setIndex((i) => i + 1);
            }}
          >
            Next
          </Button>
        ) : (
          <Button className="rounded-full shadow-glow" onClick={finish} disabled={busy}>
            {busy ? "Checking…" : "Submit test"}
          </Button>
        )}
      </div>

      <VictoryModal
        open={victoryOpen}
        isTest={true}
        xpEarned={result?.xp ?? 50}
        title={result && result.score / Math.max(result.total, 1) >= 0.8 ? "Mastery Achieved! 🏆" : "Test Completed! 🎯"}
        message={result ? `You scored ${result.score} out of ${result.total} questions correct.` : "Test submitted successfully!"}
        nextLabel="Explore More Chapters"
        onPlayNext={() => {
          setVictoryOpen(false);
          void navigate({ to: "/learn" });
        }}
        onDirectClose={() => setVictoryOpen(false)}
      />
    </div>
  );
}

