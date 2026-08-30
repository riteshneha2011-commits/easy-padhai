import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, class_level: DEFAULT_CLASS_LEVEL },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data?.session) {
      toast.success("Account created! Welcome to Easy Padhai.");
      navigate({ to: "/dashboard" });
    } else {
      toast.success("Account created. Check your email for confirmation or try signing in.");
    }
  }


  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
          <Button variant="outline" className="mb-4 w-full rounded-full" onClick={google}>
            Continue with Google
          </Button>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="signin" className="rounded-full">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">
                Sign up
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
