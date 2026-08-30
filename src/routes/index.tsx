import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Headphones,
  FileText,
  PlayCircle,
  Sparkles,
  Trophy,
  CheckCircle2,
  Play,
  Pause,
  GraduationCap,
  ShieldCheck,
  Zap,
  Atom,
  FlaskConical,
  Dna,
  Layers,
} from "lucide-react";
import { getCatalog } from "@/lib/content.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { CLASS_RANGE_LABEL } from "@/lib/classes";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/storage";

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
          "Audio-first Class 9 to 12 Science learning by Ritesh Sir (21+ yrs exp, Ex-Resonance Kota). Listen, watch, revise and test with instant feedback and daily streaks.",
      },
      { property: "og:title", content: "Easy Padhai — Class 9–12 Science, learned in 4 easy steps" },
      {
        property: "og:description",
        content: "Learn Class 9–12 Science with your ears — on your commute, while walking, or before bed. Audio lectures, summaries, and instant tests.",
      },
    ],
  }),
  component: Home,
});

const steps = [
  { icon: Headphones, title: "Listen", body: "Crisp audio lectures designed for your commute, walk, or bedtime revision." },
  { icon: PlayCircle, title: "Watch", body: "Visual video explanations to make complex equations and diagrams intuitive." },
  { icon: BookOpen, title: "Revise", body: "One-screen summary bullet notes crafted for rapid pre-exam recall." },
  { icon: FileText, title: "Practice", body: "Chapter & lecture-wise quick tests with instant, step-by-step solutions." },
];

const CHAPTER_MARKETING: Record<
  string,
  { subject: "Physics" | "Chemistry" | "Biology"; hook: string; outcome: string }
> = {
  "exploration-entering-the-world-of-secondary-science": {
    subject: "Physics",
    hook: "Science isn't memorizing — it's a method.",
    outcome: "Learn how scientists build models, test predictions, and reason with approximations.",
  },
  "cell-the-building-block-of-life": {
    subject: "Biology",
    hook: "Every living thing starts with one cell.",
    outcome: "Understand cell structure, the fluid-mosaic membrane, and how osmosis and diffusion actually work.",
  },
  "tissues-in-action": {
    subject: "Biology",
    hook: "Cells team up to get specialized jobs done.",
    outcome: "Compare plant and animal tissues, from xylem and phloem to blood and bone.",
  },
  "describing-motion-around-us": {
    subject: "Physics",
    hook: "Speed, velocity, acceleration — not the same thing.",
    outcome: "Learn to describe motion precisely using scalars, vectors, and real Indian scientific history.",
  },
  "exploring-mixtures-and-their-separation": {
    subject: "Chemistry",
    hook: "Not all mixtures are created equal.",
    outcome: "Master solutions, solubility, and separation techniques like crystallization with real-world context.",
  },
  "how-forces-affect-motion": {
    subject: "Physics",
    hook: "Nothing moves without a reason.",
    outcome: "Understand force, inertia, and Newton's first law through tug-of-war and everyday examples.",
  },
};

function Home() {
  const { data: subjects } = useSuspenseQuery(catalogQuery);
  const { user } = useAuth();
  const rawChapters = subjects.flatMap((s) => s.chapters);

  const [selectedSubject, setSelectedSubject] = useState<"All" | "Physics" | "Chemistry" | "Biology">("All");

  // Enrich chapters with discipline and 2-line format
  const chapters = rawChapters.map((chap, index) => {
    const slugKey = chap.slug.toLowerCase().trim();
    const meta = CHAPTER_MARKETING[slugKey] ?? {
      subject: (index % 3 === 0 ? "Physics" : index % 3 === 1 ? "Chemistry" : "Biology") as "Physics" | "Chemistry" | "Biology",
      hook: "Concept clarity without rote memorization.",
      outcome: "Master core principles with real-life intuition and instant MCQ testing.",
    };
    return {
      ...chap,
      subject: meta.subject,
      hook: meta.hook,
      outcome: meta.outcome,
    };
  });

  const filteredChapters =
    selectedSubject === "All"
      ? chapters
      : chapters.filter((c) => c.subject === selectedSubject);

  const counts = {
    All: chapters.length,
    Physics: chapters.filter((c) => c.subject === "Physics").length,
    Chemistry: chapters.filter((c) => c.subject === "Chemistry").length,
    Biology: chapters.filter((c) => c.subject === "Biology").length,
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="grain-bg relative overflow-hidden pt-8 pb-12 md:py-20 border-b border-border/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
              <Sparkles className="size-3.5" /> {CLASS_RANGE_LABEL} · NCERT Science
            </span>

            <h1 className="text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl md:text-6xl tracking-tight">
              Learn Class 9–12 Science{" "}
              <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
                with your ears.
              </span>
            </h1>

            <p className="max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed">
              Learn Class 9–12 Science with your ears — on your commute, while walking, or before bed. Audio
              lectures, videos, one-screen summaries, and instant-feedback tests, all in one daily loop. Build a
              streak and watch your XP climb.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-full shadow-glow font-bold text-sm sm:text-base px-8 h-12">
                <Link to={user ? "/dashboard" : "/auth"}>
                  {user ? "Continue learning" : "Start learning free"}
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full font-semibold h-12">
                <Link to="/learn">Browse chapters</Link>
              </Button>
            </div>

            {/* Pricing Clarity Strip */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Chapter 1 of every subject is 100% free, forever. No credit card required.</span>
            </div>

            {/* Confidence Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Flame className="size-4 text-orange-500" /> Daily streaks
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="size-4 text-amber-500" /> XP &amp; badges
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4 text-primary" /> Class 9 Science — Physics, Chemistry &amp; Biology added weekly
              </span>
            </div>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {steps.map((step, i) => (
              <Card
                key={step.title}
                className="card-hover shadow-card gap-3 rounded-3xl border-border/70 p-5 bg-card/90"
                style={{ transform: i % 2 ? "translateY(12px)" : undefined }}
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <step.icon className="size-5" />
                </span>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-normal">{step.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FOUNDER CREDIBILITY STRIP */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-orange-500/5 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Educator Photo & Verified Badge */}
            <div className="relative shrink-0">
              <div className="size-24 sm:size-28 rounded-full border-4 border-primary/40 p-0.5 bg-gradient-to-br from-primary to-orange-500 shadow-xl overflow-hidden">
                <img
                  src="/ritesh-sir.jpg"
                  alt="Ritesh Sir - Physics Educator & Founder"
                  className="size-full object-cover object-top rounded-full"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-emerald-600 text-white shadow-md ring-4 ring-card" title="Verified Master Educator">
                <ShieldCheck className="size-4" />
              </span>
            </div>

            {/* Educator Credentials */}
            <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <GraduationCap className="size-4" /> Taught by someone who's done this for 21 years
              </span>

              <div className="space-y-1">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Ritesh Sir
                </h2>
                <p className="text-sm font-semibold text-primary/90">
                  Physics Educator · IIT-Trained · Former Faculty at Resonance Kota
                </p>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Creator of <strong>Physics by Ritesh</strong>, mentor to thousands of CBSE, JEE, and NEET
                students across India. Easy Padhai is built directly on 21+ years of classroom teaching
                intuition — breaking dense science topics into clear, audio-first stories that stick forever.
              </p>

              {/* Credibility Chips */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary/80">
                  🎓 21+ years teaching
                </Badge>
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary/80">
                  🏛️ Resonance Kota faculty alumnus
                </Badge>
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary/80">
                  ⚡ 50,000+ students mentored
                </Badge>
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary/80">
                  🇮🇳 CBSE, JEE &amp; NEET Specialist
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EMBEDDED PREVIEW (NO LOGIN REQUIRED) */}
      <section className="mx-auto w-full max-w-6xl px-4 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary border-primary/40">
            <Sparkles className="size-3 mr-1" /> See it before you sign up
          </Badge>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Real audio, real tests — no sign-up needed to preview.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Experience how easy learning feels when concepts are explained in crisp, audio-first modules.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Sample Audio Lecture Player */}
          <SampleAudioPlayer />

          {/* Card 2: Interactive Test Mockup */}
          <Card className="rounded-3xl border-border/80 p-5 sm:p-6 bg-card/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Zap className="size-3.5" /> Instant Test Feedback
                </span>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  +15 XP
                </Badge>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                Q: Which law explains why a passenger falls backward when a vehicle suddenly accelerates forward?
              </p>

              {/* Options */}
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-xl border border-border/60 bg-secondary/30 text-muted-foreground">
                  A. Newton's Third Law
                </div>
                <div className="p-2 rounded-xl border border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-semibold flex items-center justify-between">
                  <span>B. Newton's First Law (Law of Inertia)</span>
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                </div>
                <div className="p-2 rounded-xl border border-border/60 bg-secondary/30 text-muted-foreground">
                  C. Newton's Second Law (F = ma)
                </div>
              </div>

              {/* Explanation Box */}
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                <strong>Solution:</strong> The body has inertia of rest and resists the sudden forward motion of the vehicle.
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              ⚡ Every MCQ provides instant explanations to fill conceptual gaps.
            </p>
          </Card>

          {/* Card 3: Daily Streaks & Leaderboard Showcase */}
          <Card className="rounded-3xl border-border/80 p-5 sm:p-6 bg-card/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <Trophy className="size-3.5" /> Gamified Progress
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-orange-500">
                  <Flame className="size-3.5 fill-orange-500" /> 14 Days Streak
                </span>
              </div>

              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Weekly Goal (5/5 Days)</span>
                  <span className="font-bold text-primary">100%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-full" />
                </div>
              </div>

              {/* Mini Leaderboard preview */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-primary/10 font-semibold text-primary">
                  <span className="flex items-center gap-2">
                    <span className="font-bold">🥇 1</span>
                    <span>Aarav Sharma</span>
                  </span>
                  <span>1,840 XP</span>
                </div>
                <div className="flex items-center justify-between p-1.5 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="font-bold">🥈 2</span>
                    <span>Priya Verma</span>
                  </span>
                  <span>1,620 XP</span>
                </div>
                <div className="flex items-center justify-between p-1.5 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="font-bold">🥉 3</span>
                    <span>Rohan Gupta</span>
                  </span>
                  <span>1,450 XP</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              🔥 Earn XP from every audio, summary, and quiz you complete.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. CHAPTERS WITH SUBJECT FILTERING & 2-LINE FORMAT */}
      <section className="mx-auto w-full max-w-6xl px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Class 9 Science Library
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Start with a chapter
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Every chapter is broken into 10-minute audio lectures, visual notes, and quick tests.
            </p>
          </div>
          <Button asChild variant="ghost" className="rounded-full self-start sm:self-auto text-xs font-semibold gap-1">
            <Link to="/learn">
              See all chapters <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-3">
          {(["All", "Physics", "Chemistry", "Biology"] as const).map((sub) => {
            const count = counts[sub];
            const isSelected = selectedSubject === sub;
            const Icon = sub === "Physics" ? Atom : sub === "Chemistry" ? FlaskConical : sub === "Biology" ? Dna : Layers;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{sub}</span>
                <span className={cn("text-[10px] rounded-full px-1.5 py-0.2", isSelected ? "bg-primary-foreground/20 text-white" : "bg-card text-muted-foreground")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Chapter Grid (Strict 2-Line Format) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChapters.map((chapter) => {
            const SubjectIcon = chapter.subject === "Physics" ? Atom : chapter.subject === "Chemistry" ? FlaskConical : Dna;
            return (
              <Link key={chapter.id} to="/learn/$slug" params={{ slug: chapter.slug }} className="group block h-full">
                <Card className="card-hover shadow-card h-full rounded-3xl border-border/70 p-5 sm:p-6 bg-card flex flex-col justify-between space-y-4 group-hover:border-primary/50 transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                        <SubjectIcon className="size-3" />
                        <span>{chapter.subject}</span>
                      </span>
                      <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {chapter.lessonCount} lectures
                      </span>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                      {chapter.title}
                    </h3>

                    {/* Strict 2-Line Copywriting Format */}
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-foreground/90 leading-normal">
                        {chapter.hook}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {chapter.outcome}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1 text-primary">
                      <Headphones className="size-3" /> Audio + Notes
                    </span>
                    <span className="text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Explore <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-orange-500/10 to-amber-500/15 p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground max-w-xl mx-auto">
            Ready to make Class 9–12 Science easy?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Join students learning everyday with Ritesh Sir's audio lectures and instant feedback tests.
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-full shadow-glow font-bold px-8 h-12">
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Go to My Dashboard" : "Start Learning Free Now"}
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/** 30-Second Sample Audio Player for No-Login Preview */
function SampleAudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt to load signed sample audio from Chapter 1
    resolveMediaUrl("storage://audio/1788082638083-nt69pq.mp3").then((url) => {
      if (url) setResolvedAudioUrl(url);
    });
  }, []);

  const togglePlay = () => {
    if (!audioRef.current && !resolvedAudioUrl) {
      // Synthesized simulated playback if no audio file is available
      setPlaying((prev) => !prev);
      return;
    }
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.playbackRate = speed;
        void audioRef.current.play().then(() => setPlaying(true)).catch(() => {
          setPlaying(true);
        });
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Synthetic progress interval when playing mock
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (playing && !resolvedAudioUrl) {
      timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 300);
    }
    return () => clearInterval(timer);
  }, [playing, resolvedAudioUrl]);

  return (
    <Card className="rounded-3xl border-border/80 p-5 sm:p-6 bg-card/90 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Headphones className="size-3.5" /> Sample Audio Lecture
          </span>
          <Badge variant="outline" className="text-[10px] font-semibold">
            Free Preview
          </Badge>
        </div>

        <div>
          <h4 className="font-display text-base font-bold text-foreground">
            Exploration: Entering Science
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Voice of Ritesh Sir · 21+ Yrs Kota Experience
          </p>
        </div>

        {/* Audio Waveform Animation */}
        <div className="flex items-center justify-center gap-1 h-12 bg-secondary/40 rounded-2xl p-2 px-3 overflow-hidden">
          {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 85, 50, 70, 90, 40, 65, 85].map((h, i) => (
            <span
              key={i}
              className={cn(
                "w-1 rounded-full bg-primary transition-all duration-300",
                playing ? "animate-pulse" : "opacity-40"
              )}
              style={{
                height: playing ? `${Math.max(20, (h * ((i % 3) + 1)) % 100)}%` : `${h * 0.4}%`,
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>

        {/* Audio Progress Bar */}
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
            <span>0:{Math.floor((progress * 0.45)).toString().padStart(2, "0")}</span>
            <span>0:45 sample</span>
          </div>
        </div>

        {resolvedAudioUrl && (
          <audio
            ref={audioRef}
            src={resolvedAudioUrl}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.duration) {
                setProgress((el.currentTime / el.duration) * 100);
              }
            }}
            onEnded={() => {
              setPlaying(false);
              setProgress(0);
            }}
          />
        )}
      </div>

      {/* Player Controls */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
        <Button
          size="sm"
          onClick={togglePlay}
          className="rounded-full text-xs font-bold gap-2 px-4 shadow-sm"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
          <span>{playing ? "Pause Audio" : "Play 45s Clip"}</span>
        </Button>

        <div className="flex items-center gap-1 bg-secondary/80 rounded-full p-0.5">
          {[1, 1.25, 1.5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold transition-all",
                speed === s ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
