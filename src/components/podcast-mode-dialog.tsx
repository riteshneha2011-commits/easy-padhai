import { useState } from "react";
import { Headphones, Sparkles, Moon, Coins, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2, Languages } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PodcastModeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMode: (mode: "podcast" | "normal", remember: boolean) => void;
  userCredits?: number;
};

export function PodcastModeDialog({
  open,
  onOpenChange,
  onSelectMode,
  userCredits = 0,
}: PodcastModeDialogProps) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [showDetails, setShowDetails] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);

  const handleChoose = (mode: "podcast" | "normal") => {
    onSelectMode(mode, rememberChoice);
    onOpenChange(false);
  };

  const isHindi = lang === "hi";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-3xl bg-background p-5 sm:p-7 text-left shadow-2xl border-primary/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary w-fit">
              <Headphones className="size-3.5" />
              <span>{isHindi ? "स्क्रीन-फ्री ऑडियो मोड" : "Screen-Free Audio Mode"}</span>
            </div>

            {/* Optional Language Switcher */}
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === "en" ? "hi" : "en"))}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-secondary/80 px-2.5 py-1 rounded-full border border-border/60 transition-colors"
              title={isHindi ? "Switch to English" : "हिन्दी में देखें"}
            >
              <Languages className="size-3 text-primary" />
              <span>{isHindi ? "English" : "हिन्दी में देखें"}</span>
            </button>
          </div>

          <DialogTitle className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {isHindi
              ? "क्या आप पॉडकास्ट मोड में सुनना चाहते हैं?"
              : "Enable Continuous Podcast Mode?"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {isHindi
              ? "पॉडकास्ट मोड में स्क्रीन लॉक होने पर भी लेक्चर्स बैक-टू-बैक लगातार चलते रहते हैं।"
              : "Listen to lectures back-to-back with your screen locked — seamless audio designed for revision, bedtime, and commutes."}
          </DialogDescription>
        </DialogHeader>

        {/* Feature Highlights Grid */}
        <div className="space-y-2.5 my-3">
          <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-2xs">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-bold text-foreground">
                {isHindi ? "नॉन-स्टॉप ऑटो प्ले (Continuous Audio)" : "Non-Stop Auto-Play (Continuous Audio)"}
              </p>
              <p className="text-muted-foreground mt-0.5">
                {isHindi
                  ? "एक लेक्चर समाप्त होते ही अगला लेक्चर और अगला चैप्टर अपने आप शुरू होगा।"
                  : "When a lecture finishes, the next lecture and chapter start automatically without touching your phone."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 shadow-2xs">
            <div className="size-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Coins className="size-4" />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-bold text-foreground">
                {isHindi ? "स्मूथ ऑटो-अनलॉक (10 Credits Auto-Deduct)" : "Seamless Auto-Unlock (10 Credits Deduction)"}
              </p>
              <p className="text-muted-foreground mt-0.5">
                {isHindi
                  ? "चैप्टर का पहला लेक्चर फ्री है। आगे के लॉक लेक्चर्स आपके बैलेंस से 10 क्रेडिट्स कटकर बिना रुकावट बजते रहेंगे।"
                  : "The first lecture of every chapter is 100% free. Subsequent locked lectures auto-unlock from your credit balance without interrupting your study flow."}
              </p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                {isHindi ? `वर्तमान बैलेंस: ${userCredits} Credits` : `Current Balance: ${userCredits} Credits`}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-2xs">
            <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Moon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-bold text-foreground">
                {isHindi ? "बेडटाइम स्लीप टाइमर (Sleep Timer)" : "Bedtime Sleep Timer"}
              </p>
              <p className="text-muted-foreground mt-0.5">
                {isHindi
                  ? "सोते समय 15, 30, 45 मिनट या चैप्टर खत्म होने पर ऑडियो अपने आप बंद हो जाएगा।"
                  : "Set a timer to automatically pause playback after 15, 30, 45 minutes or at the end of the lecture while sleeping."}
              </p>
            </div>
          </div>
        </div>

        {/* "To Know More / और जानें" Collapsible Section */}
        <div className="rounded-2xl border border-border/70 bg-secondary/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="w-full flex items-center justify-between p-3 text-xs font-bold text-foreground hover:bg-secondary/60 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-primary">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isHindi
                  ? "पॉडकास्ट मोड कैसे काम करता है? (To know more, click here)"
                  : "How does Podcast Mode work? (To know more, click here)"}
              </span>
            </span>
            {showDetails ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {showDetails && (
            <div className="p-3 pt-0 text-xs text-muted-foreground space-y-2 border-t border-border/40 mt-1 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isHindi ? "स्क्रीन लॉक सपोर्ट:" : "Lock-Screen & Earbud Controls:"}</strong>{" "}
                  {isHindi
                    ? "लॉक-स्क्रीन पर प्लेयर कंट्रोल्स और ब्लूटूथ इयरबड्स से 10s आगे/पीछे और नेक्स्ट ट्रैक बदल सकते हैं।"
                    : "Use lock-screen notification media controls and Bluetooth earbuds to pause, rewind/forward 10s, and skip lectures effortlessly."}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isHindi ? "क्रेडिट सुरक्षा (Balance Guard):" : "Balance Guard Guarantee:"}</strong>{" "}
                  {isHindi
                    ? "यदि क्रेडिट्स खत्म हो जाते हैं (< 10), तो ऑडियो रुक जाता है। आपका कोई भी अतिरिक्त चार्ज नहीं कटता।"
                    : "If your credits fall below 10, playback safely pauses without overdrawing your balance or charging extra fees."}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isHindi ? "कभी भी टॉगल करें:" : "Toggle Anytime:"}</strong>{" "}
                  {isHindi
                    ? "प्लेयर पर दिए गए Podcast: ON/OFF बटन से आप कभी भी इसे चालू या बंद कर सकते हैं।"
                    : "You can easily switch Podcast Mode ON or OFF at any time using the toggle button in the player."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Remember choice checkbox */}
        <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            className="size-4 rounded-md border-input text-primary focus:ring-primary/40"
          />
          <span className="text-xs text-muted-foreground font-medium">
            {isHindi
              ? "Remember my choice (मेरी पसंद याद रखें, दोबारा न पूछें)"
              : "Remember my choice (do not ask again)"}
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-border/60">
          <Button
            type="button"
            onClick={() => handleChoose("podcast")}
            className="w-full sm:flex-1 rounded-2xl h-11 font-bold shadow-glow gap-2 text-xs sm:text-sm"
          >
            <Sparkles className="size-4" />
            <span>{isHindi ? "हाँ, पॉडकास्ट मोड शुरू करें" : "Yes, Enable Podcast Mode"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleChoose("normal")}
            className="w-full sm:w-auto rounded-2xl h-11 font-semibold text-xs sm:text-sm px-4"
          >
            {isHindi ? "केवल यह लेक्चर सुनें" : "Listen to This Lecture Only"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
