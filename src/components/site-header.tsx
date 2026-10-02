import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Coins, Flame, LogOut, Menu, X, BookOpen, LayoutDashboard, RotateCcw, Wallet as WalletIcon, ShieldCheck, Download, WifiOff, Gift, Users, Sparkles, Trophy, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ClassSwitcher } from "@/components/class-switcher";
import { getWallet } from "@/lib/credits.functions";
import { cn } from "@/lib/utils";
import { soundFx } from "@/lib/sound-effects";
import brandMark from "@/assets/easy-padhai-mark.png";
import { NotificationBell } from "@/components/notification-bell";

const links = [
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/offline", label: "Downloads", icon: Download },
  { to: "/wallet", label: "🎁 Invite Friends", icon: Gift },
  { to: "/leaderboard", label: "Leaderboard" },
];

export function SiteHeader() {
  const { user, profile, isStaff, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fetchWallet = useServerFn(getWallet);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const { data: wallet } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: () => fetchWallet(),
    enabled: Boolean(user),
    refetchOnWindowFocus: true,
  });

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/" });
  };

  return (
    <>
      {isOffline && (
        <div className="w-full bg-amber-600 text-white px-3 py-1.5 text-center text-xs font-semibold flex flex-wrap items-center justify-center gap-1.5 shadow-md min-w-0 max-w-full overflow-hidden">
          <WifiOff className="size-3.5 shrink-0 animate-pulse" />
          <span>Offline Mode ·</span>
          <Link
            to="/offline"
            className="underline font-bold bg-black/20 px-2 py-0.5 rounded-full hover:bg-black/30 transition-colors inline-flex items-center gap-1 shrink-0"
          >
            <Download className="size-3" />
            <span>Open Downloads</span>
          </Link>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2.5 sm:px-6 gap-2 sm:gap-3">
          {/* Left: Hamburger Drawer Button, Brand Logo & Class Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open Navigation Sidebar"
              className="grid size-8 sm:size-9 place-items-center rounded-xl border border-border/80 bg-secondary/60 text-foreground hover:bg-secondary hover:text-primary transition-all shadow-xs shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="size-4 sm:size-5" />
            </button>

            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <img
                src={brandMark}
                alt="Easy Padhai"
                className="size-7 sm:size-8 rounded-xl object-contain shadow-sm shrink-0"
              />
              {/* Stacked on mobile (< sm), Single line on desktop (sm+) */}
              <div className="flex flex-col sm:hidden leading-none select-none text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                  Easy
                </span>
                <span className="text-xs font-black tracking-tight text-primary">
                  Padhai
                </span>
              </div>
              <span className="hidden sm:inline font-display text-lg font-bold tracking-tight text-foreground">
                Easy Padhai
              </span>
            </Link>

            <ClassSwitcher className="hidden sm:inline-flex" />
          </div>

          {/* Center (Desktop Quick Links - Only Core Tabs to prevent ANY overlap!) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              to="/learn"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                pathname.startsWith("/learn")
                  ? "bg-primary/15 text-primary font-bold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              Curriculum
            </Link>
            <Link
              to="/about"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                pathname.startsWith("/about")
                  ? "bg-primary/15 text-primary font-bold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              About Ritesh Sir
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    pathname.startsWith("/dashboard")
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  My Progress
                </Link>
                <Link
                  to="/revision"
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    pathname.startsWith("/revision")
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  Revision
                </Link>
              </>
            )}
            <Link
              to="/wallet"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                pathname.startsWith("/wallet")
                  ? "bg-primary/15 text-primary font-bold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              🎁 Invite &amp; Earn
            </Link>
            <Link
              to="/leaderboard"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5",
                pathname.startsWith("/leaderboard")
                  ? "bg-primary/15 text-primary font-bold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Trophy className="size-3.5 text-amber-500" />
              <span>Leaderboard</span>
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Class Switcher */}
            <ClassSwitcher className="sm:hidden" />

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/wallet"
                  className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 sm:px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-sm transition-colors hover:bg-amber-500/25 shrink-0"
                  title="My Credits Balance"
                >
                  <Coins className="size-3.5 text-amber-500" />
                  <span>{wallet?.credits ?? profile?.credits ?? 0}</span>
                  <span className="hidden sm:inline">Credits</span>
                </Link>

                <div className="hidden xl:flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/15 px-2.5 py-1 text-xs font-bold text-orange-700 dark:text-orange-300 shadow-sm shrink-0"
                  title="My XP Progress"
                >
                  <Flame className="size-3.5 text-orange-500 fill-orange-500" />
                  <span>{wallet?.totalXp ?? profile?.total_xp ?? 0} XP</span>
                </div>

                {/* Notification Bell */}
                <NotificationBell />

                <div className="hidden sm:inline-flex">
                  <ThemeToggle />
                </div>

                {/* Profile Drawer Trigger Avatar */}
                <button
                  onClick={() => setOpen(true)}
                  className="hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-secondary/60 hover:bg-secondary p-1 pr-2.5 transition-all shadow-xs shrink-0"
                  title="Open Navigation &amp; Profile"
                >
                  <div className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : "S"}
                  </div>
                  <span className="text-xs font-bold text-foreground max-w-[85px] truncate">
                    {profile?.full_name?.split(" ")[0] || "Menu"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/wallet"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-sm hover:bg-emerald-500/25 transition-colors shrink-0"
                  title="Claim 100 free credits on sign up"
                >
                  <Gift className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>100 Free Credits</span>
                </Link>

                {/* Notification Bell */}
                <NotificationBell />

                <div className="hidden sm:inline-flex">
                  <ThemeToggle />
                </div>
                <Button asChild size="sm" className="rounded-full shadow-glow font-bold h-7.5 px-3 text-xs">
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Sidebar Overlay & Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-start">
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Sliding Panel: ~50-60% screen width on mobile so right half of screen stays visible */}
          <aside className="relative z-50 flex h-full w-[60vw] max-w-[275px] sm:w-[50vw] sm:max-w-[340px] flex-col bg-background/98 backdrop-blur-2xl border-r border-border/80 shadow-2xl p-3.5 sm:p-5 overflow-y-auto animate-in slide-in-from-left duration-300 space-y-3.5 sm:space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
              <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 min-w-0">
                <img
                  src={brandMark}
                  alt="Easy Padhai"
                  className="size-7 rounded-lg object-contain shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground truncate">
                    Easy Padhai
                  </h3>
                  <p className="text-[9px] font-medium text-muted-foreground truncate">Class 9–12 Learning</p>
                </div>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="grid size-7 place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Profile / Student Card */}
            {user ? (
              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : "S"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {profile?.full_name || "Student"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate">{profile?.phone || user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-border/40">
                  <Link
                    to="/wallet"
                    onClick={() => setOpen(false)}
                    className="flex flex-col rounded-lg bg-amber-500/10 p-1.5 text-center transition-colors hover:bg-amber-500/20"
                  >
                    <span className="text-[9px] font-semibold text-muted-foreground flex items-center justify-center gap-1">
                      <Coins className="size-2.5 text-amber-500" /> Balance
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 truncate">
                      {wallet?.credits ?? profile?.credits ?? 0} Cr
                    </span>
                  </Link>

                  <div className="flex flex-col rounded-lg bg-orange-500/10 p-1.5 text-center">
                    <span className="text-[9px] font-semibold text-muted-foreground flex items-center justify-center gap-1">
                      <Flame className="size-2.5 text-orange-500" /> XP
                    </span>
                    <span className="text-[11px] font-extrabold text-orange-700 dark:text-orange-300 truncate">
                      {wallet?.totalXp ?? profile?.total_xp ?? 0}
                    </span>
                  </div>
                </div>

                <Link
                  to="/wallet"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/15 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <Gift className="size-3" /> Refer (+50)
                  </span>
                  <span>→</span>
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Gift className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h4 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    100 Free Credits
                  </h4>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Sign up free for daily streaks, tests, and audio lessons.
                </p>
                <Button asChild size="sm" className="w-full rounded-lg shadow-glow font-bold text-[11px] h-7">
                  <Link to="/auth" onClick={() => setOpen(false)}>Sign in / Join Free</Link>
                </Button>
              </div>
            )}

            {/* Categorized Navigation */}
            <div className="space-y-3 flex-1">
              {/* Academics */}
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Curriculum &amp; Study
                </span>
                <Link
                  to="/learn"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary",
                    pathname.startsWith("/learn") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                  )}
                >
                  <BookOpen className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">Curriculum &amp; Chapters</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary",
                    pathname.startsWith("/dashboard") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                  )}
                >
                  <LayoutDashboard className="size-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">My Progress &amp; Streaks</span>
                </Link>
                <Link
                  to="/revision"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary",
                    pathname.startsWith("/revision") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                  )}
                >
                  <RotateCcw className="size-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Revision Center</span>
                </Link>
                <Link
                  to="/offline"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary",
                    pathname.startsWith("/offline") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                  )}
                >
                  <Download className="size-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">Offline Downloads</span>
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary",
                    pathname.startsWith("/leaderboard") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                  )}
                >
                  <Trophy className="size-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Leaderboard &amp; Badges</span>
                </Link>
                <Link
                  to="/about"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary",
                    pathname.startsWith("/about") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                  )}
                >
                  <GraduationCap className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">About Ritesh Sir</span>
                </Link>
              </div>

              {/* Rewards */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Rewards &amp; Referral
                </span>
                <Link
                  to="/wallet"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors hover:bg-secondary",
                    pathname.startsWith("/wallet") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                  )}
                >
                  <Coins className="size-4 text-amber-500" />
                  Credits Wallet &amp; Daily Bonus
                </Link>
              </div>

              {/* Faculty & Admin (Protected) */}
              {(isStaff || isAdmin) && (
                <div className="space-y-1 pt-1 border-t border-border/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                    Management
                  </span>
                  {isStaff && (
                    <Link
                      to="/teach"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors hover:bg-secondary",
                        pathname.startsWith("/teach") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                      )}
                    >
                      <Sparkles className="size-4 text-primary" />
                      Teacher Studio (Curriculum &amp; AI Quiz)
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors hover:bg-secondary",
                        pathname.startsWith("/admin") ? "bg-primary/15 text-primary font-bold" : "text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="size-4 text-emerald-500" />
                        Admin &amp; Growth Hub
                      </div>
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        ⚡ Quizzes &amp; Leads
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Appearance:</span>
                <ThemeToggle />
              </div>

              {user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              ) : (
                <Button asChild size="sm" className="rounded-full shadow-glow font-bold text-xs">
                  <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/70 bg-background/95 backdrop-blur-xl px-2 py-1 md:hidden pb-safe shadow-lg">
        <Link
          to="/learn"
          onClick={() => soundFx.playClick()}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
            pathname.startsWith("/learn") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <BookOpen className="size-5" />
          <span>Learn</span>
        </Link>
        <Link
          to="/offline"
          onClick={() => soundFx.playClick()}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
            pathname.startsWith("/offline") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Download className="size-5" />
          <span>Offline</span>
        </Link>
        <Link
          to={user ? "/dashboard" : "/auth"}
          onClick={() => soundFx.playClick()}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
            pathname.startsWith("/dashboard") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <LayoutDashboard className="size-5" />
          <span>Progress</span>
        </Link>
        <Link
          to={user ? "/revision" : "/auth"}
          onClick={() => soundFx.playClick()}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
            pathname.startsWith("/revision") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <RotateCcw className="size-5" />
          <span>Revision</span>
        </Link>
        <Link
          to={user ? "/wallet" : "/auth"}
          onClick={() => soundFx.playClick()}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
            pathname.startsWith("/wallet") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <WalletIcon className="size-5" />
          <span>Credits</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            onClick={() => soundFx.playClick()}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors",
              pathname.startsWith("/admin") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ShieldCheck className="size-5" />
            <span>Admin</span>
          </Link>
        )}
      </nav>
    </>
  );
}
