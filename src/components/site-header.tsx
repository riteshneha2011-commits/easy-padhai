import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Coins, Flame, LogOut, Menu, X, BookOpen, LayoutDashboard, RotateCcw, Wallet as WalletIcon, ShieldCheck, Download, WifiOff, Gift, Users, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ClassSwitcher } from "@/components/class-switcher";
import { getWallet } from "@/lib/credits.functions";
import { cn } from "@/lib/utils";
import { soundFx } from "@/lib/sound-effects";
import brandMark from "@/assets/easy-padhai-mark.png";

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src={brandMark}
                alt="Easy Padhai"
                className="size-8 rounded-xl object-contain shadow-sm shrink-0"
              />
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                Easy Padhai
              </span>
            </Link>

            <ClassSwitcher className="hidden sm:inline-flex" />

            <nav className="hidden md:flex items-center gap-1">
              {links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    pathname.startsWith(item.to)
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      pathname.startsWith("/dashboard")
                        ? "bg-primary/15 text-primary"
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
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    Revision
                  </Link>
                  <Link
                    to="/wallet"
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      pathname.startsWith("/wallet")
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    Credits
                  </Link>
                </>
              )}
              {isStaff && (
                <Link
                  to="/teach"
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    pathname.startsWith("/teach")
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  Studio
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    pathname.startsWith("/admin")
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop right section */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/wallet"
                  className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 sm:px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-sm transition-colors hover:bg-amber-500/25"
                  title="My Credits Balance"
                >
                  <Coins className="size-3.5 text-amber-500" />
                  <span>{wallet?.balance ?? profile?.credits ?? 0} Credits</span>
                </Link>

                <div
                  className="hidden xs:flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/15 px-2.5 py-1 text-xs font-bold text-orange-700 dark:text-orange-300 shadow-sm"
                  title="My XP Progress"
                >
                  <Flame className="size-3.5 text-orange-500 fill-orange-500" />
                  <span>{wallet?.totalXp ?? profile?.total_xp ?? 0} XP</span>
                </div>

                <ThemeToggle />

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/wallet"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-sm hover:bg-emerald-500/25 transition-colors"
                  title="Claim 100 free credits on sign up"
                >
                  <Gift className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>100 Free Credits</span>
                </Link>
                <ThemeToggle />
                <Button asChild size="sm" className="rounded-full shadow-glow font-bold">
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
            )}

            {/* Mobile Class Switcher (compact) */}
            <ClassSwitcher className="sm:hidden" />

            {/* Mobile Hamburger Menu Button (Guaranteed Visible) */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation menu"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border/80 bg-secondary/60 text-foreground hover:bg-secondary transition-colors md:hidden shadow-xs"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {open && (
          <div className="border-t border-border/70 bg-background/98 backdrop-blur-2xl px-4 py-4 md:hidden shadow-2xl space-y-4 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
            {/* Student Info Card (if logged in) */}
            {user ? (
              <div className="rounded-2xl border border-border/70 bg-card p-3.5 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {profile?.full_name ? profile.full_name[0].toUpperCase() : "S"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {profile?.full_name || "Student"}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">{profile?.phone || user.email}</p>
                    </div>
                  </div>
                  <ClassSwitcher />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                  <Link
                    to="/wallet"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 p-2 text-xs font-bold text-amber-700 dark:text-amber-300"
                  >
                    <Coins className="size-3.5 text-amber-500" />
                    <span>{wallet?.balance ?? profile?.credits ?? 0} Credits</span>
                  </Link>

                  <div className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 p-2 text-xs font-bold text-orange-700 dark:text-orange-300">
                    <Flame className="size-3.5 text-orange-500 fill-orange-500" />
                    <span>{wallet?.totalXp ?? profile?.total_xp ?? 0} XP</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2">
                  <Gift className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    100 Free Credits on Sign up
                  </span>
                </div>
                <Button asChild size="sm" className="rounded-full shadow-glow font-bold h-7 text-xs">
                  <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
              </div>
            )}

            {/* Navigation links */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pt-1">
                Navigation
              </span>

              {links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                    pathname.startsWith(item.to) ? "bg-secondary text-primary font-semibold" : "text-foreground",
                  )}
                >
                  {item.icon && <item.icon className="size-4 text-muted-foreground" />}
                  {item.label}
                </Link>
              ))}

              {user && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                      pathname.startsWith("/dashboard") ? "bg-secondary text-primary font-semibold" : "text-foreground",
                    )}
                  >
                    <LayoutDashboard className="size-4 text-muted-foreground" />
                    My Progress & Streaks
                  </Link>

                  <Link
                    to="/revision"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                      pathname.startsWith("/revision") ? "bg-secondary text-primary font-semibold" : "text-foreground",
                    )}
                  >
                    <RotateCcw className="size-4 text-muted-foreground" />
                    Revision Center
                  </Link>

                  <Link
                    to="/wallet"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                      pathname.startsWith("/wallet") ? "bg-secondary text-primary font-semibold" : "text-foreground",
                    )}
                  >
                    <Coins className="size-4 text-muted-foreground" />
                    Credits & Referrals
                  </Link>
                </>
              )}

              {isStaff && (
                <Link
                  to="/teach"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                    pathname.startsWith("/teach") ? "bg-secondary text-primary font-semibold" : "text-foreground",
                  )}
                >
                  <Sparkles className="size-4 text-muted-foreground" />
                  Studio (Manage Curriculum)
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                    pathname.startsWith("/admin") ? "bg-secondary text-primary font-semibold" : "text-foreground",
                  )}
                >
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Bottom Actions: Theme Toggle & Sign Out */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Theme:</span>
                <ThemeToggle />
              </div>

              {user ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              ) : (
                <Button asChild size="sm" className="rounded-full shadow-glow font-bold">
                  <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

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
