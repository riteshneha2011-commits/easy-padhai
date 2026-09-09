import { soundFx } from "@/lib/sound-effects";
import confetti from "canvas-confetti";
import { Trophy, Flame, Sparkles, ArrowRight, Share2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type VictoryProps = {
  open: boolean;
  onPlayNext?: () => void;
  onDirectClose: () => void;
  title?: string;
  message?: string;
  xpEarned?: number;
  creditsEarned?: number;
  nextLabel?: string;
  isTest?: boolean;
};

export function VictoryModal({
  open,
  onPlayNext,
  onDirectClose,
  title = "Landmark Achieved!",
  message = "You just completed this lesson. Keep the momentum going!",
  xpEarned = 20,
  creditsEarned = 10,
  nextLabel,
  isTest = false,
}: VictoryProps) {
  const triggerCelebration = () => {
    soundFx.playCelebration();
    void confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6"],
    });
  };

  const handleWhatsAppShare = () => {
    soundFx.playClick();
    const shareText = isTest
      ? `🎉 मैंने Easy Padhai पर ऑनलाइन टेस्ट पास किया और +${xpEarned} XP कमाए! 🏆\n\nक्या आप मुझसे बेहतर स्कोर कर सकते हैं? अभी फ्री में प्रैक्टिस करें:\n👉 https://ep.studytube.co.in/learn`
      : `🔥 मैंने Easy Padhai पर नया लेक्चर पूरा किया और +${xpEarned} XP व +${creditsEarned} Credits कमाए! 🚀\n\nक्लास 9 से 12 की ऑडियो व वीडियो पढ़ाई फ्री में शुरू करें:\n👉 https://ep.studytube.co.in/learn`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(s) => {
        if (!s) {
          onDirectClose();
        } else {
          triggerCelebration();
        }
      }}
    >

      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-3xl bg-background p-4 sm:p-6 text-center shadow-2xl overflow-hidden box-border">
        <div className="mx-auto flex size-14 sm:size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 animate-bounce">
          <Trophy className="size-7 sm:size-8" />
        </div>

        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold break-words">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">{message}</p>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-1.5 w-full min-w-0">
          <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-2xl bg-primary/10 p-2 sm:p-2.5 text-primary min-w-0">
            <Sparkles className="size-3.5 sm:size-4 animate-spin shrink-0" />
            <span className="font-display text-[11px] sm:text-xs md:text-sm font-bold truncate max-w-full">+{xpEarned} XP</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-2 sm:p-2.5 text-amber-700 dark:text-amber-300 min-w-0">
            <Coins className="size-3.5 sm:size-4 text-amber-500 shrink-0" />
            <span className="font-display text-[11px] sm:text-xs md:text-sm font-bold truncate max-w-full">+{creditsEarned} Credits</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-2xl bg-orange-500/10 p-2 sm:p-2.5 text-orange-600 min-w-0">
            <Flame className="size-3.5 sm:size-4 fill-orange-500 shrink-0" />
            <span className="font-display text-[11px] sm:text-xs md:text-sm font-bold truncate max-w-full">Streak Kept!</span>
          </div>
        </div>

        <div className="mt-2 space-y-2 w-full min-w-0">
          {onPlayNext ? (
            <Button
              className="w-full rounded-full gap-2 py-5 sm:py-6 text-sm sm:text-base font-semibold shadow-md min-w-0 overflow-hidden"
              onClick={onPlayNext}
            >
              <span className="truncate min-w-0 flex-1 text-center">
                {nextLabel ?? (isTest ? "Explore More Chapters" : "Start Next Lesson")}
              </span>
              <ArrowRight className="size-4 shrink-0 animate-pulse" />
            </Button>
          ) : (
            <Button
              className="w-full rounded-full min-w-0"
              onClick={onDirectClose}
            >
              Continue
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full gap-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-semibold text-xs h-10 min-w-0 overflow-hidden"
            onClick={handleWhatsAppShare}
          >
            <Share2 className="size-3.5 shrink-0" />
            <span className="truncate">Share on WhatsApp 📲</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full rounded-full text-xs text-muted-foreground"
            onClick={onDirectClose}
          >
            {isTest ? "Review Answers" : "Stay on this page"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
