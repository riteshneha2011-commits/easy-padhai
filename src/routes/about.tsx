import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Headphones,
  PlayCircle,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Flame,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Ritesh Sir & Easy Padhai — 21+ Years Kota Teaching Experience" },
      {
        name: "description",
        content:
          "Learn about Ritesh Sir (IIT-Trained, Ex-Resonance Kota, 21+ years experience) and the mission of Easy Padhai: high-quality, audio-first Science and Maths education for Class 5 to 12.",
      },
      { property: "og:title", content: "About Ritesh Sir & Easy Padhai" },
      {
        property: "og:description",
        content:
          "Audio-first concept learning for Class 5–12 crafted under the guidance of Ritesh Sir, one of Central India's premier physics faculty.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-16 space-y-12 sm:space-y-16">
      {/* 1. HERO SECTION */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary border-primary/40">
          <Sparkles className="size-3.5 mr-1.5" /> Our Mission &amp; Academic Heritage
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Making Science &amp; Maths intuitive, accessible and{" "}
          <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
            stress-free.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Easy Padhai was founded to solve a simple problem: students spend hours staring at screens and rote-memorizing formulas. We believe deep conceptual clarity happens when concepts are experienced through stories, audio intuition, and instant feedback.
        </p>
      </div>

      {/* 2. FOUNDER PROFILE CARD */}
      <section className="relative overflow-hidden rounded-3xl border border-border/90 bg-card p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-10">
          {/* Educator Photo */}
          <div className="relative shrink-0 text-center">
            <div className="size-32 sm:size-40 rounded-full border-4 border-primary/50 p-1 bg-gradient-to-br from-primary to-amber-500 shadow-2xl overflow-hidden mx-auto">
              <img
                src="/ritesh-sir.jpg"
                alt="Ritesh Sir - Physics Educator & Founder"
                className="size-full object-cover object-top rounded-full"
              />
            </div>
            <span
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 grid size-9 place-items-center rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-card"
              title="Verified Master Educator"
            >
              <ShieldCheck className="size-5" />
            </span>
          </div>

          {/* Educator Bio */}
          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <GraduationCap className="size-4" /> Academic Director &amp; Lead Mentor
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Ritesh Sir
              </h2>
              <p className="text-sm sm:text-base font-semibold text-primary">
                Physics Educator · IIT-Trained · Former Senior Faculty at Resonance Kota
              </p>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              With <strong>over 21 years of dedicated teaching experience</strong>, Ritesh Sir has mentored thousands of CBSE, ICSE, JEE, and NEET students across India. Known widely as the founder of <em>Physics by Ritesh</em>, his teaching philosophy centres on stripping away confusing jargon and replacing it with physical intuition.
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              At Easy Padhai, every curriculum roadmap, audio lesson script, summary cheat-sheet, and test question is structured under Ritesh Sir's pedagogical direction — ensuring classroom-provenKota coaching methodology is available to every child, completely free.
            </p>

            {/* Credibility Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary text-foreground">
                🎓 21+ Years Teaching Experience
              </Badge>
              <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary text-foreground">
                🏛️ Ex-Resonance Kota Faculty
              </Badge>
              <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary text-foreground">
                ⚡ 10,000+ Students Mentored
              </Badge>
              <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-secondary text-foreground">
                🇮🇳 Founder, Physics by Ritesh
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 4 PILLARS OF EASY PADHAI */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary border-primary/40">
            Our Learning Philosophy
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            The 4-Step Mastery Cycle
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Why traditional video watching fails and how our audio-first approach builds permanent retention:
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl border-border/80 p-5 bg-card space-y-3 shadow-xs">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Headphones className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">1. Listen (Audio-First)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Listen on your commute, morning walk, or before sleep. Screen-free audio activates mental visualization, locking concepts into long-term memory.
            </p>
          </Card>

          <Card className="rounded-3xl border-border/80 p-5 bg-card space-y-3 shadow-xs">
            <div className="size-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <PlayCircle className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">2. Watch (Visual clarity)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Concise video lessons break down diagrams, vector math, and chemical equations when visual reinforcement is required.
            </p>
          </Card>

          <Card className="rounded-3xl border-border/80 p-5 bg-card space-y-3 shadow-xs">
            <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <FileText className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">3. Revise (Bullet Notes)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              One-screen crisp summary notes and formula sheets crafted for rapid recall right before your school and board exams.
            </p>
          </Card>

          <Card className="rounded-3xl border-border/80 p-5 bg-card space-y-3 shadow-xs">
            <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">4. Practice (Instant Quiz)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              3 to 5 conceptual MCQs with immediate step-by-step solutions to identify and fix conceptual blindspots within seconds.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. WHATSAPP COMMUNITY SECTION */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-card to-teal-500/10 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm">
              <span>📱 Official Community &amp; Direct Support</span>
            </span>

            <div className="space-y-1">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Join Ritesh Sir's WhatsApp Study Circle
              </h3>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                For Students and Parents of Class 5–12
              </p>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Receive updates on new chapter releases, exam tips, formula revision sheets, and connect directly with Ritesh Sir.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a
                href="https://chat.whatsapp.com/EoYLQlgFRTnAQila8ajGE7"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md inline-flex items-center gap-2 transition-colors"
              >
                <span>📲 Join WhatsApp Community</span>
              </a>
              <a
                href="https://wa.me/917000588028?text=Hi%20Ritesh%20Sir,%20I%20have%20a%20question%20about%20Easy%20Padhai"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border/80 bg-background hover:bg-secondary px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground inline-flex items-center gap-2 transition-colors"
              >
                <span>💬 Message Ritesh Sir Directly</span>
              </a>
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
              Scan with Google Lens / Camera
            </span>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC TRANSPARENCY NOTICE */}
      <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5 text-center space-y-2 max-w-2xl mx-auto">
        <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" /> Commitment to Quality &amp; Continuous Improvement
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Lectures and curriculum blueprints are prepared using modern AI synthesis under the active review and supervision of Ritesh Sir. If you spot any typo, inaccuracy, or have feedback, please reach out to us at <strong>+91 70005 88028</strong> on WhatsApp.
        </p>
      </div>

      {/* 6. BOTTOM CTA */}
      <div className="text-center pt-4">
        <Button asChild size="lg" className="rounded-full shadow-glow font-bold px-8 h-12 text-sm sm:text-base">
          <Link to="/learn">
            Start Learning Free Now <ArrowRight className="size-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
