import { soundFx } from "@/lib/sound-effects";
import confetti from "canvas-confetti";
import { Trophy, Flame, Sparkles, ArrowRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type VictoryProps = {
  open: boolean;
  onPlayNext?: () => void;
  onDirectClose: () => void;
  title?: string;
  message?: string;
  xpEarned?: number;
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
      ? `🎉 मैंने Easy Padhai पर क्लास 9 का ऑनलाइन टेस्ट पास किया! 🏆\n\nक्या आप मुझसे बेहतर स्कोर कर सकते हैं? अभी फ्री में प्रैक्टिस करें:\n👉 https://ep.studytube.co.in/learn`
      : `🔥 मैंने Easy Padhai पर नया लेक्चर पूरा किया और +${xpEarned} XP कमाए! 🚀\n\nक्लास 9 से 12 की ऑडियो व वीडियो पढ़ाई फ्री में शुरू करें:\n👉 https://ep.studytube.co.in/learn`;
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

      <DialogContent className="max-w-sm rounded-3xl bg-background p-6 text-center shadow-2xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 animate-bounce">
          <Trophy className="size-8" />
        </div>

        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{message}</p>

        <div className="grid grid-cols-2 gap-2.5 py-1.5">
          <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary/10 px-3 py-2 text-primary">
            <Sparkles className="size-4 animate-spin" />
            <span className="font-display text-sm font-bold">+{xpEarned} XP</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-orange-500/10 px-3 py-2 text-orange-600">
            <Flame className="size-4" />
            <span className="font-display text-sm font-bold">Streak Kept!</span>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          {onPlayNext ? (
            <Button
              className="w-full rounded-full gap-2 py-6 text-base font-semibold shadow-md"
              onClick={onPlayNext}
            >
              <span>{nextLabel ?? (isTest ? "Explore More Chapters" : "Start Next Lesson")}</span>
              <ArrowRight className="size-4 animate-pulse" />
            </Button>
          ) : (
            <Button
              className="w-full rounded-full"
              onClick={onDirectClose}
            >
              Continue
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full gap-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-semibold text-xs h-10"
            onClick={handleWhatsAppShare}
          >
            <Share2 className="size-3.5" />
            <span>Share on WhatsApp 📲</span>
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
