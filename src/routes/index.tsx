import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Headphones,
  FileText,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getCatalog } from "@/lib/content.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { CLASS_RANGE_LABEL } from "@/lib/classes";

const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title: "Easy Padhai — Class 9–12 Science, learned in 4 easy steps" },
      {
        name: "description",
        content:
          "Listen, watch, revise and test. Easy Padhai turns every Class 9 to 12 Science chapter into a short daily loop with streaks, XP and instant feedback. Class 9 is live now.",
      },
      { property: "og:title", content: "Easy Padhai — Class 9–12 Science, learned in 4 easy steps" },
      {
        property: "og:description",
        content: "Audio lectures, videos, summaries, PDF notes and instant objective tests.",
      },
    ],
  }),
  component: Home,
});

const steps = [
  { icon: Headphones, title: "Listen", body: "Short audio lectures you can play while commuting or revising." },
  { icon: PlayCircle, title: "Watch", body: "Curated video lessons that explain the tricky bits visually." },
  { icon: BookOpen, title: "Revise", body: "One-screen summaries built for the night before a test." },
  { icon: FileText, title: "Practice", body: "PDF notes plus objective tests with instant explanations." },
];

function Home() {
  const { data: subjects } = useSuspenseQuery(catalogQuery);
  const { user } = useAuth();
  const chapters = subjects.flatMap((s) => s.chapters);

  return (
    <div>
      <section className="grain-bg relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" /> {CLASS_RANGE_LABEL} · Science
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-foreground md:text-6xl">
              Learn a chapter
              <br />
              in four small steps.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Audio, video, summary, notes — then a quick test that tells you exactly what to revise.
              Build a streak and watch your XP climb.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full shadow-glow">
                <Link to={user ? "/dashboard" : "/auth"}>
                  {user ? "Continue learning" : "Start learning free"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/learn">Browse chapters</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Flame className="size-4 text-primary" /> Daily streaks
              </span>
              <span className="flex items-center gap-2">
                <Trophy className="size-4 text-primary" /> XP &amp; badges
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="size-4 text-primary" /> {chapters.length} chapters live
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, i) => (
              <Card
                key={step.title}
                className="card-hover shadow-card gap-3 rounded-3xl border-border/70 p-5"
                style={{ transform: i % 2 ? "translateY(14px)" : undefined }}
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <step.icon className="size-5" />
                </span>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Start with a chapter</h2>
            <p className="mt-1 text-muted-foreground">Every chapter takes about 30 focused minutes.</p>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/learn">
              See all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {chapters.slice(0, 6).map((chapter, index) => (
            <Link key={chapter.id} to="/learn/$slug" params={{ slug: chapter.slug }}>
              <Card className="card-hover shadow-card h-full gap-3 rounded-3xl border-border/70 p-6">
                <span className="font-display text-sm font-bold text-primary">
                  Chapter {index + 1}
                </span>
                <h3 className="font-display text-xl font-bold leading-snug">{chapter.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{chapter.description}</p>
                <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <span>{chapter.lessonCount} lessons</span>
                  {chapter.testId && <span className="text-accent">· Test included</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
