import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { soundFx } from "@/lib/sound-effects";
import { haptics } from "@/lib/haptics";
import {
  Share2,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  Send,
  Gift,
  Headphones,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShareLectureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonTitle: string;
  chapterTitle: string;
  subjectName?: string;
  shareUrl: string;
  referralCode?: string | null;
}

interface ShareTone {
  id: string;
  label: string;
  emoji: string;
  badge: string;
  template: (data: {
    lessonTitle: string;
    chapterTitle: string;
    subjectName?: string;
    url: string;
  }) => string;
}

export const SHARE_TONES: ShareTone[] = [
  {
    id: "exam-hack",
    label: "Topper Secret",
    emoji: "🎯",
    badge: "Exam Hack",
    template: ({ lessonTitle, chapterTitle, url }) =>
      `🔥 भाई ${chapterTitle} का ये टॉपिक एग्ज़ाम में बार-बार आता है! सिर्फ 10 मिनट में पूरा कॉन्सेप्ट मक्खन हो जाएगा। अभी सुन लो: ${url}`,
  },
  {
    id: "mind-blown",
    label: "Mind-Blowing",
    emoji: "🤯",
    badge: "Concept Magic",
    template: ({ lessonTitle, chapterTitle, url }) =>
      `🤯 मुझे अब तक लगता था कि "${lessonTitle}" बहुत कठिन है, पर इस ऑडियो लेक्चर को सुनने के बाद सब क्लियर हो गया! एक बार ज़रूर सुनो: ${url}`,
  },
  {
    id: "last-minute",
    label: "Last Minute",
    emoji: "⚡",
    badge: "Super Revision",
    template: ({ chapterTitle, url }) =>
      `⚡ एग्ज़ाम से पहले टाइम कम है? ${chapterTitle} का ये 10-मिनट का क्विक ऑडियो सुन लो, पूरा चैप्टर रिवाइज़ हो जाएगा: ${url}`,
  },
  {
    id: "study-group",
    label: "Study Group",
    emoji: "🤝",
    badge: "Dost Special",
    template: ({ lessonTitle, chapterTitle, url }) =>
      `🤝 ग्रुप वालों! ${chapterTitle} का टॉपिक "${lessonTitle}" इस ऑडियो में सबसे सिंपल तरीके से समझाया है, बिल्कुल मिस मत करना: ${url}`,
  },
  {
    id: "challenge",
    label: "Challenge",
    emoji: "🏆",
    badge: "Test Yourself",
    template: ({ lessonTitle, url }) =>
      `🏆 क्या तुम्हें "${lessonTitle}" का ये कॉन्सेप्ट सच में आता है? ये ऑडियो सुनो और बताओ क्या इसका जवाब दे सकते हो: ${url}`,
  },
  {
    id: "chill",
    label: "Chill Study",
    emoji: "🎧",
    badge: "Earphones On",
    template: ({ lessonTitle, url }) =>
      `🎧 किताबें खोलकर थक गए हो? बस इयरफ़ोन लगाओ और पॉडकास्ट की तरह ये लेक्चर सुनो: "${lessonTitle}" — ${url}`,
  },
  {
    id: "backbencher",
    label: "Backbencher",
    emoji: "🔥",
    badge: "Seedhi Baat",
    template: ({ lessonTitle, url }) =>
      `🔥 बैकबेंचर्स के लिए जीवनदान! बिना किसी फालतू बकवास के सीधा काम की बात समझाई है "${lessonTitle}" में: ${url}`,
  },
  {
    id: "official",
    label: "Clean & Simple",
    emoji: "📚",
    badge: "NCERT Official",
    template: ({ lessonTitle, chapterTitle, subjectName, url }) =>
      `📚 Easy Padhai पर ${subjectName || "Physics"} का महत्वपूर्ण ऑडियो लेक्चर: "${lessonTitle}" (${chapterTitle}) ज़रूर सुनें: ${url}`,
  },
];

export function ShareLectureDialog({
  open,
  onOpenChange,
  lessonTitle,
  chapterTitle,
  subjectName,
  shareUrl,
  referralCode,
}: ShareLectureDialogProps) {
  const [selectedToneId, setSelectedToneId] = useState<string>("exam-hack");
  const [editedMessage, setEditedMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Compute final shareable URL with ref code and shared flag
  const finalShareUrl = useMemo(() => {
    try {
      const url = new URL(shareUrl);
      url.searchParams.set("shared", "1");
      if (referralCode) {
        url.searchParams.set("ref", referralCode.trim().toUpperCase());
      }
      return url.toString();
    } catch {
      return shareUrl;
    }
  }, [shareUrl, referralCode]);

  // Update text when tone, title or url changes
  useEffect(() => {
    const tone = SHARE_TONES.find((t) => t.id === selectedToneId) || SHARE_TONES[0];
    const generated = tone.template({
      lessonTitle,
      chapterTitle,
      subjectName,
      url: finalShareUrl,
    });
    setEditedMessage(generated);
  }, [selectedToneId, lessonTitle, chapterTitle, subjectName, finalShareUrl]);

  const handleSelectTone = (toneId: string) => {
    setSelectedToneId(toneId);
    soundFx.playClick();
    haptics.light();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedMessage);
      setCopied(true);
      soundFx.playSuccess();
      haptics.medium();
      toast.success("Message & link copied to clipboard! Ready to paste.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy. Please select and copy manually.");
    }
  };

  const handleWhatsAppShare = () => {
    haptics.medium();
    soundFx.playClick();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(editedMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleTelegramShare = () => {
    haptics.medium();
    soundFx.playClick();
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(finalShareUrl)}&text=${encodeURIComponent(
      editedMessage.replace(finalShareUrl, "").trim()
    )}`;
    window.open(tgUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        haptics.medium();
        await navigator.share({
          title: `${lessonTitle} — Easy Padhai`,
          text: editedMessage,
          url: finalShareUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-lg max-h-[90dvh] flex flex-col p-0 rounded-3xl border-border bg-card shadow-2xl overflow-hidden box-border">
        {/* Fixed Header */}
        <div className="shrink-0 relative p-4 sm:p-5 pr-12 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b border-border/70">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 shrink-0">
                <Share2 className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-lg font-bold font-display text-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>Share Audio Lecture</span>
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                    Free Guest Play
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate max-w-[260px] sm:max-w-sm mt-0.5">
                  {lessonTitle} · {chapterTitle}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Guest Trust Benefit Callout */}
          <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-background/80 backdrop-blur-xs border border-border/80 px-2.5 py-1.5 text-[11px] sm:text-xs text-foreground/90">
            <Sparkles className="size-3.5 text-amber-500 shrink-0" />
            <span className="leading-snug">
              आपके दोस्त को यह पूरा लेक्चर <strong>बिना किसी साइन-अप के</strong> सीधे 1-क्लिक में सुनने को मिलेगा!
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3.5">
          {/* Tone Selector Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-foreground">
                Select Tone / वाइब चुनें:
              </label>
              <span className="text-[10px] text-muted-foreground">8 Presets</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SHARE_TONES.map((tone) => {
                const isSelected = tone.id === selectedToneId;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => handleSelectTone(tone.id)}
                    className={cn(
                      "min-w-0 w-full flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border text-left transition-all relative overflow-hidden select-none active:scale-95",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                        : "bg-secondary/60 text-foreground border-border hover:border-primary/40 hover:bg-secondary"
                    )}
                  >
                    <span className="text-base shrink-0">{tone.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate leading-tight">{tone.label}</div>
                      <div
                        className={cn(
                          "text-[9px] truncate font-medium mt-0.5",
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {tone.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Edit3 className="size-3 text-primary shrink-0" />
                <span>Message Preview (You can edit before sharing):</span>
              </label>
            </div>
            <div className="relative rounded-2xl border border-border/80 bg-background/90 p-2.5 sm:p-3 shadow-inner">
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                rows={3}
                className="w-full bg-transparent text-xs sm:text-sm leading-relaxed text-foreground resize-none border-none outline-none focus:ring-0"
                placeholder="Write your custom share message..."
              />
            </div>
          </div>

          {/* Secondary Share Channels (Telegram & More Apps) */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleTelegramShare}
              className="w-full rounded-xl h-9 font-semibold text-xs gap-1.5 border border-border/60 hover:border-[#0088cc]/50 active:scale-95"
            >
              <Send className="size-3.5 text-[#0088cc] shrink-0" />
              <span className="truncate">Telegram</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleNativeShare}
              className="w-full rounded-xl h-9 font-semibold text-xs gap-1.5 border border-border/60 hover:border-primary/50 active:scale-95"
            >
              <Share2 className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{hasNativeShare ? "Status / More" : "Share Link"}</span>
            </Button>
          </div>

          {/* Incentive / Referral Footnote */}
          {referralCode && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 flex items-center gap-2">
              <Gift className="size-4 text-amber-500 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                जब आपका दोस्त इस लिंक से जुड़ेगा, तो आप दोनों को <strong>50 Easy Padhai बोनस क्रेडिट्स</strong> मिलेंगे!
              </p>
            </div>
          )}
        </div>

        {/* Sticky Primary Action Footer - Always 100% visible on every device! */}
        <div className="shrink-0 border-t border-border/80 bg-card/95 backdrop-blur-xs p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* WhatsApp Share Button */}
            <Button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full rounded-2xl h-11 sm:h-12 font-bold text-xs sm:text-sm gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-md shadow-[#25D366]/25 transition-all active:scale-95"
            >
              <MessageCircle className="size-4.5 shrink-0" />
              <span>Share on WhatsApp</span>
            </Button>

            {/* Copy Message Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="w-full rounded-2xl h-11 sm:h-12 font-bold text-xs sm:text-sm gap-2 border-border hover:bg-secondary active:scale-95 transition-all"
            >
              {copied ? <Check className="size-4 text-emerald-500 shrink-0" /> : <Copy className="size-4 shrink-0" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Text & Link"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
