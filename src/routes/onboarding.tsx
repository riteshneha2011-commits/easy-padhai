import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Languages,
  User,
  Phone,
  School,
  MapPin,
  Target,
} from "lucide-react";
import { getMyProfile, saveMyProfile } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";
import { useActiveClass } from "@/hooks/use-active-class";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_CLASS_LEVEL, normalizeClassLevel, classOrdinalLabel } from "@/lib/classes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to Easy Padhai — Quick Setup" },
      {
        name: "description",
        content: "Set your class and study preference in 5 seconds to get personalised Science & Maths lessons.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OnboardingPage,
});

const CLASS_OPTIONS = [
  { level: 9, label: "Class 9th", subtitle: "Full Science & Maths Live 🔥", active: true },
  { level: 10, label: "Class 10th", subtitle: "Board Syllabus In Production 🚀", active: false },
  { level: 11, label: "Class 11th", subtitle: "Concept Library Launching Soon ✨", active: false },
  { level: 12, label: "Class 12th", subtitle: "Board + JEE/NEET Foundations 🎓", active: false },
];

const LANGUAGE_OPTIONS = [
  { code: "Hinglish", label: "Hinglish", hint: "Best for Kota-style clarity (Hindi + English)" },
  { code: "Hindi", label: "Hindi (हिंदी)", hint: "Pure Hindi terminology" },
  { code: "English", label: "English", hint: "Standard English audio" },
];

const BOARDS = ["CBSE", "ICSE", "State board", "Other"];

export function OnboardingPage() {
  const { user, loading, refresh } = useAuth();
  const { activeClass, switchClass } = useActiveClass();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const save = useServerFn(saveMyProfile);

  const [selectedClass, setSelectedClass] = useState<number>(activeClass || DEFAULT_CLASS_LEVEL);
  const [fullName, setFullName] = useState("");
  const [preferredLang, setPreferredLang] = useState("Hinglish");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [board, setBoard] = useState("CBSE");
  const [city, setCity] = useState("");
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => fetchProfile(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!profile) return;
    if (profile.full_name && profile.full_name !== "Student") {
      setFullName(profile.full_name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
    if (profile.class_level) {
      setSelectedClass(normalizeClassLevel(profile.class_level));
    }
    if (profile.preferred_language) {
      setPreferredLang(profile.preferred_language);
    }
    if (profile.phone) setPhone(profile.phone);
    if (profile.school_name) setSchoolName(profile.school_name);
    if (profile.board) setBoard(profile.board);
    if (profile.city) setCity(profile.city);
    if (profile.goal) setGoal(profile.goal);
  }, [profile, user]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("easypadhai_onboarding_dismissed", "true");
        localStorage.setItem("easypadhai_onboarding_dismissed", "true");
      } catch {}
    }
    void navigate({ to: "/learn" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await save({
        data: {
          full_name: fullName.trim() || "Student",
          class_level: selectedClass,
          preferred_language: preferredLang,
          phone: phone.trim() || null,
          school_name: schoolName.trim() || null,
          board: board.trim() || null,
          city: city.trim() || null,
          goal: goal.trim() || null,
        },
      });

      // Update local storage and dispatch event
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("easypadhai_onboarding_dismissed", "true");
          localStorage.setItem("easypadhai_onboarding_dismissed", "true");
          localStorage.setItem("easy-padhai-active-class", String(selectedClass));
          window.dispatchEvent(new Event("easy-padhai-class-changed"));
        } catch {}
      }

      await switchClass(selectedClass);
      await qc.invalidateQueries({ queryKey: ["my-profile"] });
      await qc.invalidateQueries({ queryKey: ["catalog"] });
      await refresh();

      toast.success("Welcome aboard! Let's start learning 🎉");
      void navigate({ to: "/learn" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-14 bg-gradient-to-b from-background via-card/20 to-background">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-bold text-primary border-primary/40 bg-primary/10">
            <Sparkles className="size-3.5 mr-1" /> 5-Second Setup
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome to Easy Padhai 👋
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Choose your class and tell Ritesh Sir your name so we can tailor your audio lectures.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* STEP 1: CLASS SELECTION */}
          <Card className="rounded-3xl border-border/70 bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                1
              </span>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Which class are you studying in?
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {CLASS_OPTIONS.map((cls) => {
                const isSelected = selectedClass === cls.level;
                return (
                  <button
                    key={cls.level}
                    type="button"
                    onClick={() => setSelectedClass(cls.level)}
                    className={cn(
                      "flex flex-col text-left p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/60 bg-background hover:border-border hover:bg-secondary/40"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={cn("font-bold text-sm sm:text-base", isSelected ? "text-primary" : "text-foreground")}>
                        {cls.label}
                      </span>
                      {isSelected && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                      {cls.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* STEP 2: NAME & LANGUAGE */}
          <Card className="rounded-3xl border-border/70 bg-card p-5 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  2
                </span>
                <Label htmlFor="fullname" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Name
                </Label>
              </div>
              <div className="relative">
                <User className="size-4 text-muted-foreground absolute left-3.5 top-3" />
                <Input
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Riya Sharma"
                  className="pl-10 h-10 rounded-2xl text-sm font-semibold"
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Languages className="size-3.5 text-primary" /> Audio Explanation Preference
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = preferredLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setPreferredLang(lang.code)}
                      className={cn(
                        "py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : "border-border/60 bg-background text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* STEP 3: OPTIONAL DETAILS ACCORDION */}
          <Card className="rounded-3xl border-border/70 bg-card overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span>Add School &amp; Goal (Optional)</span>
              </span>
              {showAdvanced ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
            </button>

            {showAdvanced && (
              <CardContent className="pt-0 pb-5 px-5 space-y-3.5 border-t border-border/40 animate-in fade-in duration-200">
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground" /> Mobile Number
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <School className="size-3 text-muted-foreground" /> School Name
                    </Label>
                    <Input
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. DPS, KV, Govt. School"
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Board</Label>
                    <select
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background h-9 px-3 text-xs font-medium"
                    >
                      {BOARDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground" /> City
                    </Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Kota, Delhi, Bhopal"
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Target className="size-3 text-primary" /> Target for this Academic Year
                  </Label>
                  <Textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master Class 9 Science concepts, score 95%+ and build daily study habit."
                    rows={2}
                    className="rounded-xl text-xs resize-none"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 rounded-full font-bold h-12 shadow-glow text-sm gap-2"
            >
              <span>{saving ? "Setting up..." : "Start Learning Now"}</span>
              <ArrowRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDismiss}
              className="w-full sm:w-auto rounded-full font-semibold text-xs text-muted-foreground hover:text-foreground h-10 px-5"
            >
              Explore first &amp; set up later
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
