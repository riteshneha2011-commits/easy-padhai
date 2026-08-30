import { useState, useEffect } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundFx } from "@/lib/sound-effects";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already installed & running standalone
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(Boolean(isRunningStandalone));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    soundFx.playClick();
    if (!deferredPrompt) {
      // If iOS or unsupported browser, give quick instructions
      alert("To install on iOS: Tap the Share button in Safari, then tap 'Add to Home Screen' 📲");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        soundFx.playCelebration();
      }
    } catch (err) {
      console.error("Install prompt error:", err);
    }
  };

  if (isStandalone || isDismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 py-2">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-orange-500/10 to-amber-500/15 p-3 sm:px-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md animate-pulse">
            <Smartphone className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
              Install Easy Padhai Mobile App
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              Works 100% offline & fast access on your phone
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="rounded-full h-8 px-3.5 text-xs font-semibold shadow-md gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Install</span>
          </Button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Close install banner"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
