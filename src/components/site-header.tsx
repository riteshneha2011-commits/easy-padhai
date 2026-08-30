import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Coins, Flame, LogOut, Menu, X, BookOpen, LayoutDashboard, RotateCcw, Wallet as WalletIcon, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getWallet } from "@/lib/credits.functions";
import { cn } from "@/lib/utils";
import { soundFx } from "@/lib/sound-effects";
import brandMark from "@/assets/easy-padhai-mark.png";


const links = [
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/leaderboard", label: "Leaderboard" },
];

export function SiteHeader() {
  const { user, profile, isStaff, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fetchWallet = useServerFn(getWallet);
  const { data: wallet } = useQuery({
    queryKey: ["wallet-pill", user?.id],
    queryFn: () => fetchWallet(),
    enabled: Boolean(user),
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
  const credits = wallet?.credits ?? profile?.credits ?? 0;
  const xp = profile?.total_xp ?? 0;

  const navItems = [
    ...links,
    ...(user ? [{ to: "/dashboard", label: "My Progress", icon: LayoutDashboard }] : []),
    ...(user ? [{ to: "/revision", label: "Revision", icon: RotateCcw }] : []),
    ...(user ? [{ to: "/wallet", label: "Credits", icon: WalletIcon }] : []),
    ...(isStaff ? [{ to: "/teach", label: "Studio", icon: BookOpen }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/", replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2.5 transition-transform active:scale-95">
            <img
              src={brandMark}
              alt="Easy Padhai Logo"
              className="size-9 sm:size-10 rounded-xl object-contain shadow-xs"
            />
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Easy Padhai
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  pathname.startsWith(item.to) && "bg-secondary text-foreground font-semibold",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <>
                <Link
                  to="/wallet"
                  title="Credits"
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs sm:text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <Coins className="size-3.5 sm:size-4" />
                  <span>{credits}</span>
                  <span className="hidden sm:inline">credits</span>
                </Link>
                <span
                  title="XP (Experience Points)"
                  className="hidden items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs sm:text-sm font-semibold text-accent lg:flex"
                >
                  <Flame className="size-3.5 sm:size-4" />
                  {xp} XP
                </span>
                <ThemeToggle />

                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Button asChild size="sm" className="rounded-full h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm shadow-xs">
                  <Link to="/auth">Start free</Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-9 rounded-xl"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border/70 bg-background/95 backdrop-blur-xl px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => (
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
                <button
                  onClick={handleSignOut}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 text-left"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar for modern app-like experience */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/70 bg-background/95 backdrop-blur-xl px-2 py-1 md:hidden pb-safe shadow-lg">
        <Link
          to="/learn"
          onClick={() => soundFx.playClick()}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-medium transition-colors",
            pathname.startsWith("/learn") ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <BookOpen className="size-5" />
          <span>Learn</span>
        </Link>
        <Link
          to={user ? "/dashboard" : "/auth"}
          onClick={() => soundFx.playClick()}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-medium transition-colors",
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
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-medium transition-colors",
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
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-medium transition-colors",
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
              "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-[11px] font-medium transition-colors",
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
