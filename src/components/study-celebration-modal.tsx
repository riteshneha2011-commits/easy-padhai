import { soundFx } from "@/lib/sound-effects";
import confetti from "canvas-confetti";
import { Coins, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type StudyCelebrationProps = {
  open: boolean;
  onClose: () => void;
  awardedCredits?: number;
  totalMinutesToday?: number;
};

export function StudyCelebrationModal({
  open,
  onClose,
  awardedCredits = 5,
  totalMinutesToday = 10,
}: StudyCelebrationProps) {
  const triggerCelebration = () => {
    soundFx.playCelebration();
    void confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6"],
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        } else {
          triggerCelebration();
        }
      }}
    >
      <DialogContent className="max-w-sm rounded-3xl bg-background p-6 text-center shadow-2xl border-amber-500/30">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 animate-bounce">
          <Coins className="size-8" />
        </div>

        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-foreground">
            शाबाश! शानदार पढ़ाई! 🎉
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed">
          आपने ध्यान से <span className="font-bold text-foreground">{totalMinutesToday} मिनट</span> की पढ़ाई पूरी कर ली है!
        </p>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1 my-1">
          <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xl">
            <Sparkles className="size-5 animate-spin" />
            <span>+{awardedCredits} Bonus Credits</span>
            <Coins className="size-5" />
          </div>
          <p className="text-xs text-muted-foreground">
            ये क्रेडिट्स आपके बैलेंस में जोड़ दिए गए हैं।
          </p>
        </div>

        <div className="rounded-xl bg-secondary/50 p-2.5 text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
          <span>अगले 10 मिनट सीखने पर फिर मिलेंगे +5 क्रेडिट्स!</span>
        </div>

        <div className="mt-2">
          <Button
            className="w-full rounded-full gap-2 py-5 text-sm font-semibold shadow-md bg-amber-500 hover:bg-amber-600 text-white"
            onClick={onClose}
          >
            <span>पढ़ाई जारी रखें</span>
            <ArrowRight className="size-4 animate-pulse" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
