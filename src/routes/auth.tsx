import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brandLogo from "@/assets/easy-padhai-logo.png";
import { DEFAULT_CLASS_LEVEL } from "@/lib/classes";
import { REF_STORAGE_KEY } from "@/lib/credits";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Easy Padhai" },
      {
        name: "description",
        content: "Create your free Easy Padhai account to track streaks, XP and Class 9 to 12 test scores.",
      },
      { property: "og:title", content: "Sign in — Easy Padhai" },
      {
        property: "og:description",
        content: "Free Class 9 to 12 learning with audio, video, notes and instant objective tests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/learn", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref") || params.get("referral");
      if (ref) {
        const code = ref.trim().toUpperCase();
        setReferralCode(code);
        window.localStorage.setItem(REF_STORAGE_KEY, code);
      } else {
        const cached = window.localStorage.getItem(REF_STORAGE_KEY);
        if (cached) setReferralCode(cached);
      }
    }
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/learn" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (referralCode.trim()) {
      window.localStorage.setItem(REF_STORAGE_KEY, referralCode.trim().toUpperCase());
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/learn`,
        data: { full_name: fullName, class_level: DEFAULT_CLASS_LEVEL },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data?.session) {
      toast.success("Account created! Welcome to Easy Padhai.");
      navigate({ to: "/learn" });
    } else {
      toast.success("Account created. Check your email for confirmation or try signing in.");
    }
  }

  async function google() {
    if (referralCode.trim()) {
      window.localStorage.setItem(REF_STORAGE_KEY, referralCode.trim().toUpperCase());
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/learn`,
      },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:py-14">
      <div className="flex flex-col items-center gap-3 text-center">
        <img src={brandLogo} alt="Easy Padhai" className="h-20 sm:h-24 w-auto object-contain drop-shadow-sm rounded-2xl" />
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Learn a little, every day
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
          Free to start for Class 9–12 students. Audio, video, notes and tests.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-xl">Your account</CardTitle>
          <CardDescription>Sign in or create a new one in seconds.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="mb-4 w-full rounded-2xl h-11 font-bold text-sm border-border/80 hover:bg-secondary/60 gap-2.5 shadow-xs"
            onClick={google}
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-card px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              or with email
            </span>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl h-10 p-1 bg-secondary/80">
              <TabsTrigger value="signin" className="rounded-xl text-xs font-bold">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl text-xs font-bold">
                Create Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form className="mt-4 space-y-3" onSubmit={signIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="mt-4 space-y-3" onSubmit={signUp}>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email2">Email</Label>
                  <Input
                    id="email2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password2">Password</Label>
                  <Input
                    id="password2"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="referralCode" className="text-xs text-muted-foreground flex items-center gap-1">
                      <Gift className="size-3 text-primary" /> Referral Code (optional)
                    </Label>
                    {referralCode && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        🎁 +50 credits upon 1st lesson
                      </span>
                    )}
                  </div>
                  <Input
                    id="referralCode"
                    placeholder="e.g. EP-9X42A"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="uppercase tracking-wider font-mono text-xs"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={busy}>
                  {busy ? "Creating…" : "Create free account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Just browsing?{" "}
        <Link to="/learn" className="font-semibold text-primary underline-offset-4 hover:underline">
          Explore chapters first
        </Link>
      </p>
    </div>
  );
}
