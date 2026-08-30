import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Coins, Flame, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getWallet } from "@/lib/credits.functions";
import { cn } from "@/lib/utils";
import brandMark from "@/assets/easy-padhai-mark.png.asset.json";


const links = [
  { to: "/learn", label: "Learn" },
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
    ...(user ? [{ to: "/dashboard", label: "My progress" }] : []),
    ...(user ? [{ to: "/revision", label: "Revision" }] : []),
    ...(user ? [{ to: "/wallet", label: "Credits" }] : []),
    ...(isStaff ? [{ to: "/teach", label: "Studio" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={brandMark.url} alt="Easy Padhai" className="size-9 object-contain" />
          <span className="font-display text-xl font-bold tracking-tight">Easy Padhai</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname.startsWith(item.to) && "bg-secondary text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/wallet"
                title="Credits — spend them to open audio, video and PDF lessons"
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <Coins className="size-4" />
                {credits}
                <span className="hidden sm:inline">credits</span>
              </Link>
              <span
                title="XP (experience points) measure how much you have learned and set your level and leaderboard rank"
                className="hidden items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent sm:flex"
              >
                <Flame className="size-4" />
                {xp} XP
              </span>
              <ThemeToggle />

              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">Start free</Link>
              </Button>
            </>

          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
