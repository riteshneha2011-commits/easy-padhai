import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { SiteHeader } from "@/components/site-header";
import { OnboardingGate } from "@/components/onboarding-gate";
import { Toaster } from "@/components/ui/sonner";
import { InstallPwaBanner } from "@/components/install-pwa-button";
import { REF_STORAGE_KEY } from "@/lib/credits";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  const isChunkError =
    typeof error?.message === "string" &&
    (error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Importing a module script failed") ||
      error.message.includes("dynamically imported"));

  useEffect(() => {
    if (isChunkError && typeof window !== "undefined") {
      const lastReload = sessionStorage.getItem("chunk_reload_ts");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("chunk_reload_ts", now.toString());
        window.location.reload();
        return;
      }
    }
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error, isChunkError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {isChunkError ? "New update available" : "This page didn't load"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isChunkError
            ? "A newer version of Easy Padhai has been deployed. Tap below to refresh and load the latest updates."
            : error.message}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              if (isChunkError && typeof window !== "undefined") {
                window.location.reload();
              } else {
                router.invalidate();
                reset();
              }
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isChunkError ? "Update now 🔄" : "Try again"}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Easy Padhai — Class 9–12 learning that actually sticks" },
      {
        name: "description",
        content:
          "Audio lectures, video lessons, quick summaries, PDF notes and instant objective tests for Class 9 to 12 students. Class 9 is live now.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#ea580c" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Capture referral code from URL search param if present (?ref=... or ?referral=...)
      try {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get("ref") || params.get("referral");
        if (refParam) {
          window.localStorage.setItem(REF_STORAGE_KEY, refParam.trim().toUpperCase());
        }
      } catch {
        /* storage disabled */
      }

      // 2. Register Service Worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            reg.update().catch(() => {});
          })
          .catch((err) => {
            console.warn("ServiceWorker registration failed:", err);
          });
      }
    }
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col w-full max-w-[100vw] overflow-x-hidden">
          <OnboardingGate />
          <SiteHeader />
          <InstallPwaBanner />
          <main className="flex-1 pb-20 md:pb-0 w-full max-w-full min-w-0 overflow-x-hidden">
            {/* Required: nested routes render here. */}
            <Outlet />
          </main>
          <footer className="border-t border-border/70 py-8 text-center text-sm text-muted-foreground pb-24 md:pb-8">
            Easy Padhai — built for Class 9–12 learners.
          </footer>
        </div>
        <Toaster position="top-center" richColors />
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>

  );
}
