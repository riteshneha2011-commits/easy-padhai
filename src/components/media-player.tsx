import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  FileText,
  Gauge,
  Headphones,
  Loader2,
  Pause,
  Play,
  Download,
  BookOpen,
  Layers,
  Sparkles,
  Moon,
  Timer,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isStorageRef, resolveMediaUrl } from "@/lib/storage";
import { classifyMedia, PLAYBACK_RATES, parseLessonVideos, type LessonVideo, VIDEO_KINDS } from "@/lib/media";
import { getOfflineMediaUrl } from "@/lib/offline-storage";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { PodcastModeDialog } from "@/components/podcast-mode-dialog";
import {
  getPodcastMode,
  setPodcastModeStorage,
  isPodcastPromptDismissed,
  setPodcastPromptDismissed,
} from "@/lib/podcast";

type Props = {
  value?: string;
  title: string;
  kind?: "audio" | "video" | "pdf";
  lessonId?: string;
  audioUrl?: string | null;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  videos?: LessonVideo[];
  /** Reports whether the student is actively watching/listening (drives study credits). */
  onActiveChange?: (active: boolean) => void;
  /** Reports when the student has listened/watched enough to verify learning (>=70% or completion). */
  onVerified?: () => void;
  /** Screen-Free Podcast Mode metadata and navigation */
  chapterTitle?: string;
  subjectName?: string;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  hasNextTrack?: boolean;
  hasPrevTrack?: boolean;
  autoPlay?: boolean;
  /** Screen-Free Podcast continuous mode toggle & credits */
  isPodcastMode?: boolean;
  onTogglePodcastMode?: (enabled: boolean) => void;
  userCredits?: number;
};


function SpeedPicker({
  rate,
  onChange,
}: {
  rate: number;
  onChange: (r: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-1.5 min-w-0">
      <span className="mr-0.5 inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-muted-foreground">
        <Gauge className="size-3 sm:size-3.5" /> Speed
      </span>
      {PLAYBACK_RATES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "rounded-full border border-border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-bold transition-colors",
            rate === r
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          {r}×
        </button>
      ))}
    </div>
  );
}

function ActiveReporter({ onActiveChange }: { onActiveChange?: (active: boolean) => void }) {
  useEffect(() => {
    onActiveChange?.(true);
    return () => onActiveChange?.(false);
  }, [onActiveChange]);
  return null;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function CustomAudioPlayer({
  src,
  title,
  lessonId,
  rate,
  onRateChange,
  onActiveChange,
  onVerified,
  chapterTitle,
  subjectName,
  onNextTrack,
  onPrevTrack,
  hasNextTrack,
  hasPrevTrack,
  autoPlay,
  isPodcastMode,
  onTogglePodcastMode,
  userCredits = 0,
}: {
  src: string;
  title: string;
  lessonId?: string;
  rate: number;
  onRateChange: (r: number) => void;
  onActiveChange?: (active: boolean) => void;
  onVerified?: () => void;
  chapterTitle?: string;
  subjectName?: string;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  hasNextTrack?: boolean;
  hasPrevTrack?: boolean;
  autoPlay?: boolean;
  isPodcastMode?: boolean;
  onTogglePodcastMode?: (enabled: boolean) => void;
  userCredits?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Podcast Mode state (screen-free continuous listening)
  const [localPodcastMode, setLocalPodcastMode] = useState<boolean>(() => isPodcastMode ?? getPodcastMode());
  const effectivePodcastMode = isPodcastMode !== undefined ? isPodcastMode : localPodcastMode;
  const [showPodcastDialog, setShowPodcastDialog] = useState(false);

  useEffect(() => {
    if (isPodcastMode !== undefined) {
      setLocalPodcastMode(isPodcastMode);
    }
  }, [isPodcastMode]);

  // Sleep Timer state: "off" | "15" | "30" | "45" | "end"
  const [sleepTimer, setSleepTimer] = useState<"off" | "15" | "30" | "45" | "end">("off");
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);

  const currentTimeRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Clean URL without query tokens so Supabase/R2 signature renewals don't reset playback
  const cleanSrc = src.split("?")[0];
  const lastCleanSrcRef = useRef(cleanSrc);

  const storageKey = lessonId
    ? `easypadhai_audio_pos_${lessonId}`
    : `easypadhai_audio_pos_${encodeURIComponent(cleanSrc)}`;

  const updateMediaSessionPosition = useCallback(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    const audio = audioRef.current;
    if (!audio) return;
    const dur = audio.duration || duration;
    if (dur > 0 && "setPositionState" in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(dur, 1),
          playbackRate: audio.playbackRate || rate || 1,
          position: Math.max(0, Math.min(audio.currentTime, dur)),
        });
      } catch {}
    }
  }, [duration, rate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
  }, [rate]);

  // Sleep Timer countdown interval
  useEffect(() => {
    if (sleepTimer === "off" || sleepTimer === "end" || sleepSecondsLeft === null) return;
    if (sleepSecondsLeft <= 0) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
        isPlayingRef.current = false;
        onActiveChange?.(false);
      }
      setSleepTimer("off");
      setSleepSecondsLeft(null);
      haptics.medium();
      toast.info("🌙 Sleep Timer: Finished! Pausing audio. Goodnight!");
      return;
    }

    const timer = setInterval(() => {
      setSleepSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimer, sleepSecondsLeft, onActiveChange]);

  const cycleSleepTimer = () => {
    haptics.light();
    setSleepTimer((prev) => {
      if (prev === "off") {
        setSleepSecondsLeft(15 * 60);
        toast.success("🌙 Sleep Timer: Set for 15 minutes");
        return "15";
      }
      if (prev === "15") {
        setSleepSecondsLeft(30 * 60);
        toast.success("🌙 Sleep Timer: Set for 30 minutes");
        return "30";
      }
      if (prev === "30") {
        setSleepSecondsLeft(45 * 60);
        toast.success("🌙 Sleep Timer: Set for 45 minutes");
        return "45";
      }
      if (prev === "45") {
        setSleepSecondsLeft(null);
        toast.success("🌙 Sleep Timer: Will pause at end of lecture");
        return "end";
      }
      setSleepSecondsLeft(null);
      toast.info("🌙 Sleep Timer: Turned OFF");
      return "off";
    });
  };

  // Auto-play trigger for seamless podcast chapter-to-chapter transition
  useEffect(() => {
    if (!autoPlay) return;
    const audio = audioRef.current;
    if (!audio) return;
    const timer = setTimeout(() => {
      audio.play().then(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        onActiveChange?.(true);
        if ("mediaSession" in navigator) {
          navigator.mediaSession.playbackState = "playing";
        }
      }).catch((err) => {
        console.warn("Autoplay was prevented by browser policy:", err);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [autoPlay, cleanSrc, onActiveChange]);

  // Screen-Free Podcast Mode: Native MediaSession API for lock-screen & earbud controls
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      const origin = window.location.origin;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || "Audio Lecture",
        artist: "Ritesh Sir — Easy Padhai",
        album: chapterTitle || subjectName || "Easy Padhai",
        artwork: [
          { src: `${origin}/easy-padhai-mark.png`, sizes: "96x96", type: "image/png" },
          { src: `${origin}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
          { src: `${origin}/favicon.png`, sizes: "192x192", type: "image/png" },
          { src: `${origin}/easy-padhai-mark.png`, sizes: "512x512", type: "image/png" },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        void audioRef.current?.play();
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      });
      navigator.mediaSession.setActionHandler("stop", () => {
        audioRef.current?.pause();
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      });
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        skip(-(details.seekOffset || 10));
        updateMediaSessionPosition();
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        skip(details.seekOffset || 10);
        updateMediaSessionPosition();
      });
      try {
        navigator.mediaSession.setActionHandler("seekto", (details) => {
          if (details.seekTime != null && audioRef.current) {
            audioRef.current.currentTime = details.seekTime;
            setCurrentTime(details.seekTime);
            currentTimeRef.current = details.seekTime;
            updateMediaSessionPosition();
          }
        });
      } catch {}

      if (onPrevTrack) {
        navigator.mediaSession.setActionHandler("previoustrack", () => {
          onPrevTrack();
        });
      } else {
        try { navigator.mediaSession.setActionHandler("previoustrack", null); } catch {}
      }

      if (onNextTrack) {
        navigator.mediaSession.setActionHandler("nexttrack", () => {
          onNextTrack();
        });
      } else {
        try { navigator.mediaSession.setActionHandler("nexttrack", null); } catch {}
      }
    } catch (e) {
      console.warn("MediaSession setup warning:", e);
    }

    return () => {
      if (typeof window !== "undefined" && "mediaSession" in navigator) {
        try {
          navigator.mediaSession.setActionHandler("play", null);
          navigator.mediaSession.setActionHandler("pause", null);
          navigator.mediaSession.setActionHandler("stop", null);
          navigator.mediaSession.setActionHandler("seekbackward", null);
          navigator.mediaSession.setActionHandler("seekforward", null);
          navigator.mediaSession.setActionHandler("seekto", null);
          navigator.mediaSession.setActionHandler("previoustrack", null);
          navigator.mediaSession.setActionHandler("nexttrack", null);
        } catch {}
      }
    };
  }, [title, chapterTitle, subjectName, onNextTrack, onPrevTrack, updateMediaSessionPosition]);

  // Sync playbackState and position with MediaSession without flooding the IPC bridge
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    updateMediaSessionPosition();
  }, [isPlaying, updateMediaSessionPosition]);

  // Protect against URL query token refreshes resetting current audio playback
  useEffect(() => {
    if (lastCleanSrcRef.current === cleanSrc) {
      return;
    }
    // Genuinely a different audio file/lesson
    lastCleanSrcRef.current = cleanSrc;
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(0);
      currentTimeRef.current = 0;
      setIsPlaying(false);
      isPlayingRef.current = false;
      setErrorMsg(null);
    }
  }, [cleanSrc]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (rate) {
      audio.playbackRate = rate;
    }
    setDuration(audio.duration || 0);
    setIsBuffering(false);
    setErrorMsg(null);

    // If resuming from a stream reconnect:
    if (currentTimeRef.current > 0 && Math.abs(audio.currentTime - currentTimeRef.current) > 1) {
      audio.currentTime = currentTimeRef.current;
      setCurrentTime(currentTimeRef.current);
      if (isPlayingRef.current) {
        audio.play().catch(() => {});
      }
      return;
    }

    // Otherwise restore saved progress from localStorage:
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const pos = parseFloat(saved);
        if (pos > 0 && pos < (audio.duration || 100) - 5) {
          audio.currentTime = pos;
          setCurrentTime(pos);
          currentTimeRef.current = pos;
        }
      }
    } catch {}
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = audio.currentTime;
    setCurrentTime(time);
    currentTimeRef.current = time;
    if (duration > 0 && time / duration >= 0.7) {
      onVerified?.();
    }
    if (Math.floor(time) % 5 === 0) {
      try {
        localStorage.setItem(storageKey, time.toString());
      } catch {}
    }
  };

  const recoverStream = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const pos = currentTimeRef.current;
    setIsBuffering(true);
    setErrorMsg("Reconnecting audio…");

    try {
      audio.load();
      if (pos > 0) {
        audio.currentTime = pos;
      }
      if (isPlayingRef.current) {
        audio.play().then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
          setErrorMsg(null);
        }).catch(() => {
          setIsBuffering(false);
          setErrorMsg("Tap Play to resume");
        });
      } else {
        setIsBuffering(false);
        setErrorMsg(null);
      }
    } catch {
      setIsBuffering(false);
      setErrorMsg("Connection issue. Tap Retry.");
    }
  }, []);

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.warn("Audio element error event:", e);
    const audio = audioRef.current;
    setIsBuffering(false);
    const pos = currentTimeRef.current;

    // Automatic stream recovery if playback was in progress
    if (pos > 0 && audio) {
      setErrorMsg("Connection hiccup. Reconnecting…");
      setTimeout(() => {
        recoverStream();
      }, 1000);
    } else {
      setErrorMsg("Audio stream interrupted. Tap to retry.");
    }
  };

  const handleEnded = () => {
    const audio = audioRef.current;
    // Guard against premature ended event (e.g. dropped network connection mid-stream)
    if (audio && duration > 10 && audio.currentTime < duration - 4) {
      console.warn(`Stream closed prematurely at ${audio.currentTime}s of ${duration}s. Auto-recovering...`);
      recoverStream();
      return;
    }

    setIsPlaying(false);
    isPlayingRef.current = false;
    onActiveChange?.(false);
    onVerified?.();
    try {
      localStorage.removeItem(storageKey);
    } catch {}

    // 1. Sleep Timer reached end of lecture: stop playback
    if (sleepTimer === "end") {
      setSleepTimer("off");
      setSleepSecondsLeft(null);
      haptics.medium();
      toast.info("🌙 Sleep Timer: Reached end of lecture. Pausing playback. Goodnight!");
      return;
    }

    // 2. Auto-Next continuous playback for Bedtime / Commute mode
    if (onNextTrack) {
      if (effectivePodcastMode) {
        // In Podcast Mode: immediate silent transition without distracting toasts or autoplay-blocking delays
        haptics.light();
        setTimeout(() => {
          onNextTrack();
        }, 150);
      } else {
        toast.info("🎉 Lesson ended! Tap 'Next' to play the next lecture.", {
          duration: 3500,
        });
      }
    }
  };

  const startPlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setErrorMsg(null);
    setIsBuffering(true);

    try {
      if (audio.error || !audio.src) {
        audio.load();
        if (currentTimeRef.current > 0) {
          audio.currentTime = currentTimeRef.current;
        }
      }
      await audio.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
      onActiveChange?.(true);
    } catch (err) {
      console.warn("Play error, attempting stream reload:", err);
      try {
        audio.load();
        if (currentTimeRef.current > 0) {
          audio.currentTime = currentTimeRef.current;
        }
        await audio.play();
        setIsPlaying(true);
        isPlayingRef.current = true;
        onActiveChange?.(true);
      } catch (finalErr) {
        console.error("Audio playback recovery failed:", finalErr);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setErrorMsg("Playback issue. Tap to retry.");
      }
    } finally {
      setIsBuffering(false);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      onActiveChange?.(false);
    } else {
      // First time playing: check if user hasn't seen the podcast prompt
      if (!isPodcastPromptDismissed()) {
        setShowPodcastDialog(true);
        return;
      }
      await startPlayback();
    }
  };

  const handleSelectPodcastMode = (mode: "podcast" | "normal", remember: boolean) => {
    const enabled = mode === "podcast";
    setLocalPodcastMode(enabled);
    setPodcastModeStorage(enabled);
    onTogglePodcastMode?.(enabled);
    if (remember) {
      setPodcastPromptDismissed(true);
    }
    void startPlayback();
  };

  const togglePodcastMode = () => {
    haptics.light();
    const next = !effectivePodcastMode;
    setLocalPodcastMode(next);
    setPodcastModeStorage(next);
    onTogglePodcastMode?.(next);
    if (next) {
      toast.success("🎙️ Podcast Mode ON: Continuous playback enabled!");
    } else {
      toast.info("🎙️ Podcast Mode OFF: Standard playback mode active");
    }
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
    audio.currentTime = target;
    setCurrentTime(target);
    currentTimeRef.current = target;
    updateMediaSessionPosition();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = parseFloat(e.target.value);
    audio.currentTime = target;
    setCurrentTime(target);
    currentTimeRef.current = target;
    updateMediaSessionPosition();
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-linear-to-b from-card to-secondary/30 p-4 sm:p-6 shadow-sm space-y-4 min-w-0 w-full overflow-hidden">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={handleAudioError}
        onEnded={handleEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
          isPlayingRef.current = true;
          setErrorMsg(null);
          if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
        }}
        onCanPlay={() => setIsBuffering(false)}
        onPlay={() => {
          if (audioRef.current && rate) {
            audioRef.current.playbackRate = rate;
          }
          setIsPlaying(true);
          isPlayingRef.current = true;
          onActiveChange?.(true);
          if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
          updateMediaSessionPosition();
        }}
        onPause={() => {
          setIsPlaying(false);
          isPlayingRef.current = false;
          onActiveChange?.(false);
          if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
          updateMediaSessionPosition();
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Headphones className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-primary truncate">
                Audio Lecture · CDN Edge Stream
              </p>
              {isBuffering && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground animate-pulse">
                  <Loader2 className="size-2.5 animate-spin" /> Buffering
                </span>
              )}
            </div>
            <h4 className="truncate text-sm sm:text-base font-bold text-foreground">{title || "Audio Lesson"}</h4>
          </div>
        </div>

        {/* Podcast Mode Pill Toggle & Info Trigger */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={togglePodcastMode}
            title={effectivePodcastMode ? "Podcast Mode is ON (Continuous playback)" : "Podcast Mode is OFF (Single lesson playback)"}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs select-none active:scale-95 border",
              effectivePodcastMode
                ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                : "bg-secondary text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            <Sparkles className="size-3.5" />
            <span>Podcast: {effectivePodcastMode ? "ON" : "OFF"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPodcastDialog(true)}
            title="Podcast Mode details and settings (Click to know more)"
            className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary text-xs font-bold border border-border transition-colors"
          >
            ℹ️
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
          <span className="truncate">{errorMsg}</span>
          <button
            type="button"
            onClick={recoverStream}
            className="font-bold underline shrink-0 hover:text-foreground"
          >
            Retry
          </button>
        </div>
      )}

      {/* Scrubber Progress Bar */}
      <div className="space-y-1.5 w-full">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
        />
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Playback Controls & Speed & Sleep Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1 w-full">
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
          {hasPrevTrack && onPrevTrack && (
            <button
              type="button"
              onClick={() => {
                haptics.light();
                onPrevTrack();
              }}
              title="Previous lecture"
              className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary active:scale-95 text-xs font-bold shrink-0"
            >
              <SkipBack className="size-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => skip(-10)}
            title="Rewind 10 seconds"
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary active:scale-95 text-xs font-bold shrink-0"
          >
            -10s
          </button>

          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
            disabled={isBuffering}
            className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-80"
          >
            {isBuffering ? (
              <Loader2 className="size-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="size-6 fill-current" />
            ) : (
              <Play className="size-6 ml-0.5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skip(10)}
            title="Forward 10 seconds"
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary active:scale-95 text-xs font-bold shrink-0"
          >
            +10s
          </button>

          {hasNextTrack && onNextTrack && (
            <button
              type="button"
              onClick={() => {
                haptics.light();
                onNextTrack();
              }}
              title="Next lecture"
              className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary active:scale-95 text-xs font-bold shrink-0"
            >
              <SkipForward className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          {/* Sleep Timer Button */}
          <button
            type="button"
            onClick={cycleSleepTimer}
            title="Bedtime Sleep Timer (Tap to cycle: 15m, 30m, 45m, End of Lecture, Off)"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all shadow-2xs select-none active:scale-95",
              sleepTimer !== "off"
                ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            <Moon className={cn("size-3.5", sleepTimer !== "off" && "text-indigo-500 fill-indigo-500/30")} />
            <span>
              {sleepTimer === "off"
                ? "Sleep Timer"
                : sleepTimer === "end"
                ? "🌙 End"
                : sleepSecondsLeft !== null
                ? `🌙 ${Math.floor(sleepSecondsLeft / 60)}:${(sleepSecondsLeft % 60).toString().padStart(2, "0")}`
                : `🌙 ${sleepTimer}m`}
            </span>
          </button>

          <SpeedPicker rate={rate} onChange={onRateChange} />
        </div>
      </div>

      <PodcastModeDialog
        open={showPodcastDialog}
        onOpenChange={setShowPodcastDialog}
        onSelectMode={handleSelectPodcastMode}
        userCredits={userCredits}
      />
    </div>
  );
}

/** Plays external links (YouTube/Vimeo/Drive/direct files) or uploaded storage files, with offline IndexedDB sandbox support. */
function SingleMediaPlayer({
  value,
  title,
  kind,
  lessonId,
  onActiveChange,
  onVerified,
  chapterTitle,
  subjectName,
  onNextTrack,
  onPrevTrack,
  hasNextTrack,
  hasPrevTrack,
  autoPlay,
  isPodcastMode,
  onTogglePodcastMode,
  userCredits,
}: {
  value: string;
  title: string;
  kind: "audio" | "video" | "pdf";
  lessonId?: string;
  onActiveChange?: (active: boolean) => void;
  onVerified?: () => void;
  chapterTitle?: string;
  subjectName?: string;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  hasNextTrack?: boolean;
  hasPrevTrack?: boolean;
  autoPlay?: boolean;
  isPodcastMode?: boolean;
  onTogglePodcastMode?: (enabled: boolean) => void;
  userCredits?: number;
}) {
  const stored = isStorageRef(value);
  const [url, setUrl] = useState<string | null>(stored ? null : value);
  const [failed, setFailed] = useState(false);
  const [rate, setRateState] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const saved = localStorage.getItem("easypadhai_playback_rate");
      if (saved) {
        const parsed = parseFloat(saved);
        if (PLAYBACK_RATES.includes(parsed)) return parsed;
      }
    } catch {}
    return 1;
  });

  const setRate = useCallback((newRate: number) => {
    setRateState(newRate);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("easypadhai_playback_rate", newRate.toString());
      } catch {}
    }
  }, []);
  const [isCheckingOffline, setIsCheckingOffline] = useState(() =>
    Boolean(lessonId && !value && (kind === "audio" || kind === "pdf")),
  );
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  // Active reading timer for PDF notes (25s active viewing verifies learning)
  useEffect(() => {
    if (kind !== "pdf" || !onVerified) return;
    let readingSeconds = 0;
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        readingSeconds += 1;
        if (readingSeconds >= 25) {
          onVerified();
          clearInterval(interval);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [kind, onVerified]);

  useEffect(() => {
    let alive = true;

    // Direct external URL available immediately
    if (!stored && value) {
      setUrl(value);
      setIsOfflineSource(false);
      setFailed(false);
      setIsCheckingOffline(false);
      return;
    }

    const checkOfflineFirst = async () => {
      if (lessonId && (kind === "audio" || kind === "pdf")) {
        try {
          const offlineUrl = await getOfflineMediaUrl(lessonId, kind);
          if (offlineUrl && alive) {
            setUrl(offlineUrl);
            setIsOfflineSource(true);
            setFailed(false);
            setIsCheckingOffline(false);
            return true;
          }
        } catch {
          // offline lookup failed or not available
        }
      }
      if (alive) {
        setIsCheckingOffline(false);
      }
      return false;
    };

    void checkOfflineFirst().then((hasOffline) => {
      if (hasOffline || !alive) return;

      if (!value) {
        setUrl(null);
        return;
      }

      if (!stored) {
        setUrl(value);
        setIsOfflineSource(false);
        setFailed(false);
        return;
      }

      setUrl(null);
      setFailed(false);
      resolveMediaUrl(value).then(async (resolved) => {
        if (!alive) return;
        if (resolved) {
          setUrl(resolved);
          setIsOfflineSource(false);
        } else {
          // If network failed, attempt to find offline blob
          if (lessonId) {
            const fallbackOffline = await getOfflineMediaUrl(lessonId, kind === "pdf" ? "pdf" : "audio");
            if (fallbackOffline && alive) {
              setUrl(fallbackOffline);
              setIsOfflineSource(true);
              return;
            }
          }
          setFailed(true);
        }
      });
    });

    return () => {
      alive = false;
    };
  }, [value, stored, lessonId, kind]);

  useEffect(() => {
    if (mediaRef.current) mediaRef.current.playbackRate = rate;
  }, [rate, url]);

  if (!value && !url) {
    if (isCheckingOffline) {
      return (
        <p className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="size-4 animate-spin" /> Loading offline media…
        </p>
      );
    }
    return (
      <div className="rounded-2xl border border-border/80 bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
        {kind === "video"
          ? "No video lecture attached to this lesson."
          : kind === "audio"
            ? "No audio lecture attached to this lesson."
            : "No document or notes file attached to this lesson."}
      </div>
    );
  }

  if (failed) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-center">
        <p className="text-sm font-semibold text-destructive">Could not load media</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign in or download this lesson when connected to internet for offline playback.
        </p>
      </div>
    );
  }

  if (!url) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading media…
      </p>
    );
  }

  const source = isOfflineSource
    ? kind === "pdf"
      ? ({ mode: "pdf-embed", src: url, directUrl: url } as const)
      : ({ mode: "native", src: url } as const)
    : stored
      ? kind === "pdf"
        ? ({ mode: "pdf-embed", src: url, directUrl: url } as const)
        : ({ mode: "native", src: url } as const)
      : classifyMedia(url, kind);


  if (source.mode === "pdf-embed" || kind === "pdf") {
    const pdfSrc = source.mode === "pdf-embed" ? source.src : url;
    const directSrc = source.mode === "pdf-embed" ? source.directUrl : url;
    const isBlobUrl = Boolean(directSrc?.startsWith("blob:"));
    const embedUrl =
      pdfSrc &&
      pdfSrc.startsWith("http") &&
      !pdfSrc.includes("drive.google.com") &&
      !pdfSrc.includes("docs.google.com")
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfSrc)}&embedded=true`
        : pdfSrc;

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <FileText className="size-4 text-primary" />
            <span className="truncate max-w-[200px] sm:max-w-md font-semibold text-foreground">
              {title || "PDF Notes"}
            </span>
            {isOfflineSource && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                100% Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {directSrc && (
              <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5 rounded-xl font-semibold" onClick={() => onVerified?.()}>
                <a href={directSrc} download={`${title || "Lesson-Notes"}.pdf`}>
                  <Download className="size-3.5" /> Save to Device
                </a>
              </Button>
            )}
            {directSrc && (
              <Button asChild size="sm" variant="ghost" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => onVerified?.()}>
                <a href={directSrc} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" /> Fullscreen
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="w-full h-[72vh] min-h-[460px] overflow-hidden rounded-2xl border bg-background shadow-sm relative flex flex-col items-center justify-center">
          {isBlobUrl ? (
            <>
              {/* Desktop native PDF reader embed */}
              <object
                data={directSrc}
                type="application/pdf"
                className="size-full hidden sm:block"
              >
                <iframe
                  src={embedUrl}
                  title={title || "PDF Document"}
                  className="size-full border-0"
                  allow="fullscreen"
                />
              </object>

              {/* Mobile friendly offline card (mobile browsers block blob iframes) */}
              <div className="sm:hidden flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-sm">
                <div className="size-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                  <FileText className="size-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-base text-foreground leading-snug">
                    {title || "PDF Notes"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your offline PDF notes are ready. Tap below to read comfortably in fullscreen or open in your device's PDF reader.
                  </p>
                </div>
                <div className="flex flex-col w-full gap-2.5 pt-1">
                  <Button asChild size="lg" className="rounded-full shadow-glow font-bold gap-2 w-full" onClick={() => onVerified?.()}>
                    <a href={directSrc} target="_blank" rel="noreferrer">
                      <BookOpen className="size-4" /> Open Fullscreen Reader
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full font-semibold gap-1.5 w-full" onClick={() => onVerified?.()}>
                    <a href={directSrc} download={`${title || "Lesson-Notes"}.pdf`}>
                      <Download className="size-3.5" /> Save PDF File
                    </a>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <iframe
              src={embedUrl}
              title={title || "PDF Document"}
              className="size-full border-0"
              allow="fullscreen"
            />
          )}
        </div>
      </div>
    );
  }

  if (source.mode === "iframe") {
    const isAudioEmbed = kind === "audio";
    return (
      <div className="space-y-2">
        {kind !== "pdf" && (
          <ActiveReporter
            onActiveChange={(active) => {
              onActiveChange?.(active);
              if (active) {
                const timer = setTimeout(() => {
                  onVerified?.();
                }, 45000);
                return () => clearTimeout(timer);
              }
            }}
          />
        )}
        <div
          className={cn(
            "w-full overflow-hidden rounded-2xl bg-secondary",
            kind === "pdf" ? "h-[72vh] min-h-[500px]" : isAudioEmbed ? "aspect-video sm:aspect-[16/7]" : "aspect-video",
          )}
        >
          <iframe
            src={source.src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
          />
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-between">
          <span>
            Playing via {source.provider === "youtube" ? "YouTube" : source.provider === "drive" ? "Google Drive" : source.provider === "vimeo" ? "Vimeo" : "Player"}.
          </span>
          <a href={url} target="_blank" rel="noreferrer" className="font-semibold underline ml-2">
            Open in new tab
          </a>
        </p>
      </div>
    );
  }

  if (kind === "audio") {
    return (
      <CustomAudioPlayer
        src={source.src}
        title={title}
        lessonId={lessonId}
        rate={rate}
        onRateChange={setRate}
        onActiveChange={onActiveChange}
        onVerified={onVerified}
        chapterTitle={chapterTitle}
        subjectName={subjectName}
        onNextTrack={onNextTrack}
        onPrevTrack={onPrevTrack}
        hasNextTrack={hasNextTrack}
        hasPrevTrack={hasPrevTrack}
        autoPlay={autoPlay}
        isPodcastMode={isPodcastMode}
        onTogglePodcastMode={onTogglePodcastMode}
        userCredits={userCredits}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-secondary">
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          controls
          playsInline
          src={source.src}
          className="size-full"
          onPlay={() => onActiveChange?.(true)}
          onPause={() => onActiveChange?.(false)}
          onTimeUpdate={(e) => {
            const vid = e.currentTarget;
            if (vid.duration > 0 && vid.currentTime / vid.duration >= 0.7) {
              onVerified?.();
            }
          }}
          onEnded={() => {
            onActiveChange?.(false);
            onVerified?.();
          }}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = rate;
          }}
        />
      </div>
      <SpeedPicker rate={rate} onChange={setRate} />
    </div>
  );
}

/**
 * Universal media player with support for:
 * - Single or Multi-Video playlists (Cinematic 3D, Detailed Explainer, Solved PYQs)
 * - Interactive video module switcher pills
 * - Audio speech players and PDF interactive readers
 */
export function MediaPlayer({
  value: rawValue,
  title,
  kind: rawKind,
  lessonId,
  audioUrl,
  videoUrl,
  pdfUrl,
  videos,
  onActiveChange,
  onVerified,
  chapterTitle,
  subjectName,
  onNextTrack,
  onPrevTrack,
  hasNextTrack,
  hasPrevTrack,
  autoPlay,
  isPodcastMode,
  onTogglePodcastMode,
  userCredits,
}: Props) {
  const effectiveKind: "audio" | "video" | "pdf" =
    rawKind || (videoUrl ? "video" : audioUrl ? "audio" : pdfUrl ? "pdf" : "video");

  const effectiveValue =
    rawValue !== undefined
      ? rawValue
      : effectiveKind === "video"
      ? (videoUrl ?? "")
      : effectiveKind === "audio"
      ? (audioUrl ?? "")
      : (pdfUrl ?? "");

  const videoList: LessonVideo[] = useMemo(() => {
    if (effectiveKind !== "video") return [];
    if (videos && videos.length > 0) return videos;
    return parseLessonVideos(effectiveValue);
  }, [effectiveKind, videos, effectiveValue]);

  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  // Multi-video view: render playlist selector pills on top of player
  if (effectiveKind === "video" && videoList.length > 1) {
    const safeIdx = Math.min(activeVideoIdx, videoList.length - 1);
    const currentVid = videoList[safeIdx] || videoList[0];
    const currentMeta = VIDEO_KINDS.find((k) => k.id === currentVid.kind) || VIDEO_KINDS[0];

    return (
      <div className="space-y-3.5">
        {/* Multi-Video Selector Bar */}
        <div className="rounded-2xl border border-border/80 bg-secondary/30 p-2.5 sm:p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Layers className="size-3.5 text-primary" />
              <span>Available Video Modules ({videoList.length})</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              Select module to watch:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {videoList.map((vid, idx) => {
              const isSelected = idx === safeIdx;
              const meta = VIDEO_KINDS.find((k) => k.id === vid.kind) || VIDEO_KINDS[0];
              return (
                <button
                  key={vid.id || idx}
                  type="button"
                  onClick={() => setActiveVideoIdx(idx)}
                  className={cn(
                    "group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold ring-2 ring-primary/20 scale-[1.01]"
                      : "bg-background hover:bg-card text-foreground border border-border/70 hover:border-primary/50"
                  )}
                >
                  <span>{meta.icon}</span>
                  <span>{vid.title || `Video ${idx + 1}`}</span>
                  {vid.duration && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-normal",
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {vid.duration}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Module Title Header */}
        <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <span>{currentMeta.icon}</span>
            <span>{currentVid.title || "Video Lecture"}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">
              ({currentMeta.label})
            </span>
          </div>
          <span className="text-[11px] bg-secondary/80 px-2 py-0.5 rounded-md font-medium">
            Part {safeIdx + 1} of {videoList.length}
          </span>
        </div>

        {/* Player Instance */}
        <SingleMediaPlayer
          key={`multivid-${safeIdx}-${currentVid.url}`}
          value={currentVid.url}
          title={`${title} · ${currentVid.title}`}
          kind="video"
          lessonId={lessonId}
          onActiveChange={onActiveChange}
          onVerified={onVerified}
        />
      </div>
    );
  }

  // Single video or audio or pdf:
  const singleValue =
    effectiveKind === "video" && videoList.length === 1 ? videoList[0].url : effectiveValue;

  return (
    <SingleMediaPlayer
      value={singleValue}
      title={title}
      kind={effectiveKind}
      lessonId={lessonId}
      onActiveChange={onActiveChange}
      onVerified={onVerified}
      chapterTitle={chapterTitle}
      subjectName={subjectName}
      onNextTrack={onNextTrack}
      onPrevTrack={onPrevTrack}
      hasNextTrack={hasNextTrack}
      hasPrevTrack={hasPrevTrack}
      autoPlay={autoPlay}
      isPodcastMode={isPodcastMode}
      onTogglePodcastMode={onTogglePodcastMode}
      userCredits={userCredits}
    />
  );
}
