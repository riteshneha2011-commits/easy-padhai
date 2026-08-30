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
  Calculator,
  Coins,
  Gift,
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
      { title: "Easy Padhai — Class 9–12 Science & Maths, learned in 4 easy steps" },
      {
        name: "description",
        content:
          "Audio-first Class 9 to 12 Science and Maths learning by Ritesh Sir (21+ yrs exp, Ex-Resonance Kota). Listen, watch, revise and test with instant feedback and daily streaks.",
      },
      { property: "og:title", content: "Easy Padhai — Class 9–12 Science & Maths, learned in 4 easy steps" },
      {
        property: "og:description",
        content: "Learn Class 9–12 Science and Maths with your ears — on your commute, while walking, or before bed. Audio lectures, summaries, and instant tests.",
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
  { subjectCategory: "Physics" | "Chemistry" | "Biology" | "Mathematics"; hook: string; outcome: string }
> = {
  // Science Chapters
  "exploration-entering-the-world-of-secondary-science": {
    subjectCategory: "Physics",
    hook: "Science isn't memorizing — it's a method.",
    outcome: "Learn how scientists build models, test predictions, and reason with approximations.",
  },
  "cell-the-building-block-of-life": {
    subjectCategory: "Biology",
    hook: "Every living thing starts with one cell.",
    outcome: "Understand cell structure, the fluid-mosaic membrane, and how osmosis and diffusion actually work.",
  },
  "tissues-in-action": {
    subjectCategory: "Biology",
    hook: "Cells team up to get specialized jobs done.",
    outcome: "Compare plant and animal tissues, from xylem and phloem to blood and bone.",
  },
  "describing-motion-around-us": {
    subjectCategory: "Physics",
    hook: "Speed, velocity, acceleration — not the same thing.",
    outcome: "Learn to describe motion precisely using scalars, vectors, and real Indian scientific history.",
  },
  "exploring-mixtures-and-their-separation": {
    subjectCategory: "Chemistry",
    hook: "Not all mixtures are created equal.",
    outcome: "Master solutions, solubility, and separation techniques like crystallization with real-world context.",
  },
  "how-forces-affect-motion": {
    subjectCategory: "Physics",
    hook: "Nothing moves without a reason.",
    outcome: "Understand force, inertia, and Newton's first law through tug-of-war and everyday examples.",
  },

  // Mathematics Chapters
  "the-world-of-numbers": {
    subjectCategory: "Mathematics",
    hook: "Numbers are the foundation of all science.",
    outcome: "Explore real numbers, irrational representations, and decimal expansions intuitively.",
  },
  "introduction-to-linear-polynomials": {
    subjectCategory: "Mathematics",
    hook: "Equations that shape the physical world.",
    outcome: "Master terms, coefficients, zeros of polynomials, and remainder theorem.",
  },
  "orienting-yourself-the-use-of-coordinates": {
    subjectCategory: "Mathematics",
    hook: "Bridge algebra and visual geometry.",
    outcome: "Locate points in 2D Cartesian planes and solve real spatial distance problems.",
  },
  "exploring-algebraic-identities": {
    subjectCategory: "Mathematics",
    hook: "Universal shortcuts for complex calculations.",
    outcome: "Visualize algebraic identities geometrically and factorize polynomials with speed.",
  },
  "measuring-space-perimeter-and-area": {
    subjectCategory: "Mathematics",
    hook: "From ancient Pi to modern geometry.",
    outcome: "Calculate arc lengths, sector areas, and polygon boundaries with practical formulas.",
  },
  "the-mathematics-of-maybe-introduction-to-probability": {
    subjectCategory: "Mathematics",
    hook: "Quantifying chance and decision making.",
    outcome: "Understand sample spaces, experimental vs theoretical probability, and real odds.",
  },
  "predicting-what-comes-next-exploring-sequences-and-progressi": {
    subjectCategory: "Mathematics",
    hook: "Discover the hidden patterns in nature.",
    outcome: "Identify arithmetic and geometric progressions and predict future terms effortlessly.",
  },
  "im-up-and-down-and-round-and-round": {
    subjectCategory: "Mathematics",
    hook: "Symmetry, curves, and circular motion.",
    outcome: "Understand angles, rotational symmetry, and geometric relationships in circles.",
  },
};

type FilterCategory = "All" | "Science" | "Physics" | "Chemistry" | "Biology" | "Mathematics";

function Home() {
  const { data: subjects } = useSuspenseQuery(catalogQuery);
  const { user } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("Science");

  // Flatten chapters and attach proper parent subject + sub-discipline metadata
  const allChapters = subjects.flatMap((sub) => {
    return sub.chapters.map((chap) => {
      const slugKey = chap.slug.toLowerCase().trim();
      const meta = CHAPTER_MARKETING[slugKey] ?? {
        subjectCategory: sub.name.toLowerCase().includes("math") ? "Mathematics" : "Physics",
        hook: "Concept clarity without rote memorization.",
        outcome: "Master core principles with real-life intuition and instant MCQ testing.",
      };
      return {
        ...chap,
        parentSubjectName: sub.name,
        subjectCategory: meta.subjectCategory,
        hook: meta.hook,
        outcome: meta.outcome,
      };
    });
  });

  const filteredChapters = allChapters.filter((c) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Science") {
      return (
        c.parentSubjectName.toLowerCase().includes("science") ||
        ["Physics", "Chemistry", "Biology"].includes(c.subjectCategory)
      );
    }
    if (selectedFilter === "Mathematics") {
      return (
        c.parentSubjectName.toLowerCase().includes("math") ||
        c.subjectCategory === "Mathematics"
      );
    }
    return c.subjectCategory === selectedFilter;
  });

  const counts = {
    All: allChapters.length,
    Science: allChapters.filter(
      (c) =>
        c.parentSubjectName.toLowerCase().includes("science") ||
        ["Physics", "Chemistry", "Biology"].includes(c.subjectCategory)
    ).length,
    Physics: allChapters.filter((c) => c.subjectCategory === "Physics").length,
    Chemistry: allChapters.filter((c) => c.subjectCategory === "Chemistry").length,
    Biology: allChapters.filter((c) => c.subjectCategory === "Biology").length,
    Mathematics: allChapters.filter(
      (c) =>
        c.parentSubjectName.toLowerCase().includes("math") ||
        c.subjectCategory === "Mathematics"
    ).length,
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="grain-bg relative overflow-hidden pt-8 pb-12 md:py-20 border-b border-border/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
              <Sparkles className="size-3.5" /> Class 9th Live Now · Class 10th, 11th &amp; 12th Coming Soon
            </span>

            <h1 className="text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl md:text-6xl tracking-tight">
              Learn Class 9–12 Science{" "}
              <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
                with your ears.
              </span>
            </h1>

            <p className="max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed">
              Learn Class 9–12 Science on your commute, while walking, or before bed. Audio lectures,
              videos, one-screen summaries, and instant-feedback tests, all in one daily loop. Build a
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
                <BookOpen className="size-4 text-primary" /> Class 9 Science &amp; Maths · Lectures added regularly
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

      {/* 2. FOUNDER CREDIBILITY STRIP (Academic Authority) */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border/90 bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Educator Photo & Verified Badge */}
            <div className="relative shrink-0">
              <div className="size-24 sm:size-28 rounded-full border-4 border-primary/50 p-0.5 bg-gradient-to-br from-primary to-amber-500 shadow-xl overflow-hidden">
                <img
                  src="/ritesh-sir.jpg"
                  alt="Ritesh Sir - Physics Educator & Founder"
                  className="size-full object-cover object-top rounded-full"
                />
              </div>
              <span
                className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-emerald-600 text-white shadow-md ring-4 ring-card"
                title="Verified Master Educator"
              >
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
                <p className="text-sm font-semibold text-primary">
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
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary/80 text-foreground">
                  🎓 21+ years teaching
                </Badge>
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary/80 text-foreground">
                  🏛️ Resonance Kota faculty alumnus
                </Badge>
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary/80 text-foreground">
                  ⚡ Mentor to thousands of CBSE, NEET, and JEE students
                </Badge>
                <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary/80 text-foreground">
                  🇮🇳 Founder, Physics by Ritesh
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5. DAILY CREDITS & FREE FOREVER PROMISE (Gamified Economy) */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Gift className="size-3.5" /> Keep Your Learning 100% Free Forever
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                Visit regularly, learn daily &amp; get credits to keep learning for ₹0!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                Easy Padhai rewards consistent students! Complete short daily audio lectures, maintain your study streak, and collect free credits every day to unlock full chapter libraries without spending a single rupee.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-emerald-500/30 shadow-sm text-center min-w-[110px]">
                <Coins className="size-5 text-amber-500 mb-1" />
                <span className="text-xs font-bold text-foreground">Daily Credits</span>
                <span className="text-[10px] text-muted-foreground">Every Session</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-emerald-500/30 shadow-sm text-center min-w-[110px]">
                <Flame className="size-5 text-orange-500 mb-1" />
                <span className="text-xs font-bold text-foreground">Streak Bonus</span>
                <span className="text-[10px] text-muted-foreground">+50 XP / Coins</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-emerald-500/30 shadow-sm text-center min-w-[110px]">
                <Sparkles className="size-5 text-primary mb-1" />
                <span className="text-xs font-bold text-foreground">Ch-1 Free</span>
                <span className="text-[10px] text-muted-foreground">Every Subject</span>
              </div>
            </div>
          </div>

          {/* Invite Friends Action Bar */}
          <div className="mt-5 pt-4 border-t border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground text-center sm:text-left">
              <span className="grid size-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                🎁
              </span>
              <span>
                Invite friends &amp; classmates: <strong>Both get +50 Bonus Credits</strong> upon joining!
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  "Hey! I am learning Class 9-12 Science with Ritesh Sir (21+ yrs Kota faculty) on Easy Padhai — audio lectures, notes & instant tests. Join with my link and we both get 50 bonus credits: https://ep.studytube.co.in/auth"
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-colors"
              >
                <span>📲 Share on WhatsApp</span>
              </a>
              <Button asChild size="sm" variant="outline" className="rounded-full text-xs font-semibold h-7 border-emerald-500/40">
                <Link to="/wallet">Open Wallet &amp; Referrals</Link>
              </Button>
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
              Curated Curriculum Library · Class 9th Live Now
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Start with a chapter
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Every chapter is broken into 10 to 25 minutes audio lectures, visual notes, and tests.
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
          {(
            [
              { key: "Science", label: "🔬 All Science", count: counts.Science },
              { key: "Physics", label: "⚛️ Physics", count: counts.Physics },
              { key: "Chemistry", label: "🧪 Chemistry", count: counts.Chemistry },
              { key: "Biology", label: "🧬 Biology", count: counts.Biology },
              { key: "Mathematics", label: "📐 Mathematics", count: counts.Mathematics },
              { key: "All", label: "📚 All Chapters", count: counts.All },
            ] as const
          ).map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] rounded-full px-1.5 py-0.2",
                    isSelected ? "bg-primary-foreground/20 text-white" : "bg-card text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Chapter Grid (Strict 2-Line Format) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChapters.map((chapter) => {
            const SubjectIcon =
              chapter.subjectCategory === "Physics"
                ? Atom
                : chapter.subjectCategory === "Chemistry"
                ? FlaskConical
                : chapter.subjectCategory === "Biology"
                ? Dna
                : Calculator;

            return (
              <Link key={chapter.id} to="/learn/$slug" params={{ slug: chapter.slug }} className="group block h-full">
                <Card className="card-hover shadow-card h-full rounded-3xl border-border/70 p-5 sm:p-6 bg-card flex flex-col justify-between space-y-4 group-hover:border-primary/50 transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                        <SubjectIcon className="size-3" />
                        <span>{chapter.subjectCategory}</span>
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

      {/* 4.5. WHATSAPP COMMUNITY & UPDATES CHANNEL */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-card to-teal-500/10 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm">
                <span>📱 Official WhatsApp Community</span>
              </span>

              <div className="space-y-1">
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Connect with Easy Padhai &amp; Ritesh Sir on WhatsApp
                </h3>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  For Class 9–12 Students &amp; Parents
                </p>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                Get instant notifications for new chapter uploads, daily NCERT concepts, formula revision sheets, and direct guidance from Ritesh Sir on your phone.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <a
                  href="https://chat.whatsapp.com/EoYLQlgFRTnAQila8ajGE7"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md inline-flex items-center gap-2 transition-colors"
                >
                  <span>📲 Tap to Join WhatsApp Community</span>
                </a>
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  or scan the QR code 👉
                </span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-emerald-500/30 shadow-lg">
              <img
                src="/whatsapp-channel-qr.png"
                alt="Easy Padhai WhatsApp Channel QR Code"
                className="size-36 sm:size-44 object-contain rounded-xl"
              />
              <span className="text-[11px] font-extrabold text-slate-900 tracking-wide text-center">
                Scan with WhatsApp
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-orange-500/10 to-amber-500/15 p-8 sm:p-12 text-center space-y-5 shadow-sm">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground max-w-xl mx-auto">
            Ready to make Class 9–12 Science &amp; Maths easy?
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

/** 2-Minute Sample Audio Player for No-Login Preview */
function SampleAudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const MAX_SAMPLE_DURATION = 120; // 2 minutes (120s)

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.playbackRate = speed;
      void audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch((err) => {
          console.warn("Audio play prevented:", err);
          setPlaying(false);
        });
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      if (cur >= MAX_SAMPLE_DURATION) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlaying(false);
        setCurrentTime(0);
      } else {
        setCurrentTime(cur);
      }
    }
  };

  const progressPercent = Math.min(100, (currentTime / MAX_SAMPLE_DURATION) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="rounded-3xl border-border/80 p-5 sm:p-6 bg-card/90 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Headphones className="size-3.5" /> Sample Audio Lecture
          </span>
          <Badge variant="outline" className="text-[10px] font-semibold">
            2 Min Preview
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
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>2:00 sample</span>
          </div>
        </div>

        <audio
          ref={audioRef}
          src="/sample-lecture.mp3"
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
          }}
        />
      </div>

      {/* Player Controls */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
        <Button
          size="sm"
          onClick={togglePlay}
          className="rounded-full text-xs font-bold gap-2 px-4 shadow-sm"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
          <span>{playing ? "Pause Audio" : "Play 2 Min Preview"}</span>
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
