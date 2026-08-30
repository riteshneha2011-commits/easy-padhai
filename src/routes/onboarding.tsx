import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getMyProfile, saveMyProfile } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ALL_CLASS_LEVELS, DEFAULT_CLASS_LEVEL, isClassActive, normalizeClassLevel } from "@/lib/classes";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Complete your profile — Easy Padhai" },
      {
        name: "description",
        content: "Tell us your name, class and contact details so Easy Padhai can personalise your learning.",
      },
      { property: "og:title", content: "Complete your profile — Easy Padhai" },
      { property: "og:description", content: "A one-minute form to personalise your Easy Padhai account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

const BOARDS = ["CBSE", "ICSE", "State board", "Other"];
const LANGUAGES = ["English", "Hindi", "Hinglish"];
const GENDERS = ["Female", "Male", "Prefer not to say"];

type FormState = {
  full_name: string;
  phone: string;
  class_level: string;
  guardian_phone: string;
  school_name: string;
  city: string;
  state: string;
  board: string;
  gender: string;
  date_of_birth: string;
  preferred_language: string;
  goal: string;
};

const EMPTY: FormState = {
  full_name: "",
  phone: "",
  class_level: String(DEFAULT_CLASS_LEVEL),
  guardian_phone: "",
  school_name: "",
  city: "",
  state: "",
  board: "",
  gender: "",
  date_of_birth: "",
  preferred_language: "",
  goal: "",
};

function OnboardingPage() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const save = useServerFn(saveMyProfile);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => fetchProfile(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      class_level: String(normalizeClassLevel(profile.class_level)),
      guardian_phone: profile.guardian_phone ?? "",
      school_name: profile.school_name ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      board: profile.board ?? "",
      gender: profile.gender ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      preferred_language: profile.preferred_language ?? "",
      goal: profile.goal ?? "",
    });
  }, [profile]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.full_name.trim()) return toast.error("Please enter your name");
    if (!/^[0-9+\-\s()]{8,20}$/.test(form.phone.trim()))
      return toast.error("Please enter a valid mobile number");

    setSaving(true);
    try {
      await save({
        data: {
          full_name: form.full_name,
          phone: form.phone,
          class_level: normalizeClassLevel(form.class_level),
          guardian_phone: form.guardian_phone,
          school_name: form.school_name,
          city: form.city,
          state: form.state,
          board: form.board,
          gender: form.gender,
          date_of_birth: form.date_of_birth || null,
          preferred_language: form.preferred_language,
          goal: form.goal,
        },
      });
      await qc.invalidateQueries({ queryKey: ["my-profile"] });
      await refresh();
      toast.success("Profile saved — happy learning! 🎉");
      navigate({ to: "/learn" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">A few quick details</h1>
      <p className="mt-1 text-muted-foreground">
        Only your name and mobile number are required. Everything else helps us pick the right lessons for
        you.
      </p>

      <Card className="mt-6 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Your profile</CardTitle>
          <CardDescription>Takes about a minute. You can change it later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required className="sm:col-span-2">
              <Input
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Riya Sharma"
                maxLength={100}
                required
              />
            </Field>

            <Field label="Mobile number" required>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
                inputMode="tel"
                maxLength={20}
                required
              />
            </Field>

            <Field label="Class" hint="optional">
              <select
                value={form.class_level}
                onChange={(e) => set("class_level", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {ALL_CLASS_LEVELS.map((c) => (
                  <option key={c} value={c} disabled={!isClassActive(c)}>
                    Class {c}
                    {isClassActive(c) ? "" : " — coming soon"}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Parent / guardian mobile" hint="optional">
              <Input
                value={form.guardian_phone}
                onChange={(e) => set("guardian_phone", e.target.value)}
                placeholder="+91 90000 00000"
                inputMode="tel"
                maxLength={20}
              />
            </Field>

            <Field label="School" hint="optional">
              <Input
                value={form.school_name}
                onChange={(e) => set("school_name", e.target.value)}
                placeholder="Govt. Higher Secondary School"
                maxLength={120}
              />
            </Field>

            <Field label="Board" hint="optional">
              <select
                value={form.board}
                onChange={(e) => set("board", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select</option>
                {BOARDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Study language" hint="optional">
              <select
                value={form.preferred_language}
                onChange={(e) => set("preferred_language", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="City" hint="optional">
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} maxLength={80} />
            </Field>

            <Field label="State" hint="optional">
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={80} />
            </Field>

            <Field label="Date of birth" hint="optional">
              <Input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => set("date_of_birth", e.target.value)}
              />
            </Field>

            <Field label="Gender" hint="optional">
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="What is your goal this year?" hint="optional" className="sm:col-span-2">
              <Textarea
                value={form.goal}
                onChange={(e) => set("goal", e.target.value)}
                placeholder="Score above 90% in Science and build a daily study habit."
                maxLength={300}
                rows={3}
              />
            </Field>

            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={saving} className="rounded-full">
                {saving ? "Saving…" : "Save and start learning"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => navigate({ to: "/learn" })}
              >
                Later
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
        {hint ? <span className="font-normal normal-case tracking-normal">· {hint}</span> : null}
      </Label>
      {children}
    </div>
  );
}
