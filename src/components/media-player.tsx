import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, Gauge, Headphones, Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStorageRef, resolveMediaUrl } from "@/lib/storage";
import { classifyMedia, PLAYBACK_RATES } from "@/lib/media";
import { getOfflineMediaUrl } from "@/lib/offline-storage";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  title: string;
  kind: "audio" | "video" | "pdf";
  lessonId?: string;
  /** Reports whether the student is actively watching/listening (drives study credits). */
  onActiveChange?: (active: boolean) => void;
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
  rate,
  onRateChange,
  onActiveChange,
}: {
  src: string;
  title: string;
  rate: number;
  onRateChange: (r: number) => void;
  onActiveChange?: (active: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const storageKey = `easypadhai_audio_pos_${encodeURIComponent(src)}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
  }, [rate]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const pos = parseFloat(saved);
        if (pos > 0 && pos < (audio.duration || 100) - 5) {
          audio.currentTime = pos;
          setCurrentTime(pos);
        }
      }
    } catch {}
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    if (Math.floor(audio.currentTime) % 5 === 0) {
      try {
        localStorage.setItem(storageKey, audio.currentTime.toString());
      } catch {}
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = parseFloat(e.target.value);
    audio.currentTime = target;
    setCurrentTime(target);
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-linear-to-b from-card to-secondary/30 p-4 sm:p-6 shadow-sm space-y-4 min-w-0 w-full overflow-hidden">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          setIsPlaying(true);
          onActiveChange?.(true);
        }}
        onPause={() => {
          setIsPlaying(false);
          onActiveChange?.(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          onActiveChange?.(false);
          try {
            localStorage.removeItem(storageKey);
          } catch {}
        }}
      />

      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Headphones className="size-5 sm:size-6" />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-primary truncate">Audio Lecture · M4A / AAC</p>
          <h4 className="truncate text-sm sm:text-base font-bold text-foreground">{title || "Audio Lesson"}</h4>
        </div>
      </div>

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

      {/* Playback Controls & Speed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1 w-full">
        <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4">
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
            className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="size-6 ml-0.5 fill-current" />}
          </button>

          <button
            type="button"
            onClick={() => skip(10)}
            title="Forward 10 seconds"
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary active:scale-95 text-xs font-bold shrink-0"
          >
            +10s
          </button>
        </div>

        <div className="flex justify-center sm:justify-end">
          <SpeedPicker rate={rate} onChange={onRateChange} />
        </div>
      </div>
    </div>
  );
}

/** Plays external links (YouTube/Vimeo/Drive/direct files) or uploaded storage files, with offline IndexedDB sandbox support. */
export function MediaPlayer({ value, title, kind, lessonId, onActiveChange }: Props) {
  const stored = isStorageRef(value);
  const [url, setUrl] = useState<string | null>(stored ? null : value);
  const [failed, setFailed] = useState(false);
  const [isOfflineSource, setIsOfflineSource] = useState(false);
  const [rate, setRate] = useState(1);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;

    const checkOfflineFirst = async () => {
      if (lessonId && (kind === "audio" || kind === "pdf")) {
        const offlineUrl = await getOfflineMediaUrl(lessonId, kind);
        if (offlineUrl && alive) {
          setUrl(offlineUrl);
          setIsOfflineSource(true);
          setFailed(false);
          return true;
        }
      }
      return false;
    };

    void checkOfflineFirst().then((hasOffline) => {
      if (hasOffline || !alive) return;

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
    const embedUrl =
      pdfSrc.startsWith("http") &&
      !pdfSrc.includes("drive.google.com") &&
      !pdfSrc.includes("docs.google.com")
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfSrc)}&embedded=true`
        : pdfSrc;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <FileText className="size-4 text-primary" />
            <span className="truncate max-w-[240px] sm:max-w-md">{title || "PDF Notes"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
              <a href={directSrc} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" /> Open full page
              </a>
            </Button>
          </div>
        </div>

        <div className="w-full h-[72vh] min-h-[500px] overflow-hidden rounded-2xl border bg-background shadow-sm relative">
          <iframe
            src={embedUrl}
            title={title || "PDF Document"}
            className="size-full border-0"
            allow="fullscreen"
          />
        </div>
      </div>
    );
  }

  if (source.mode === "iframe") {
    const isAudioEmbed = kind === "audio";
    return (
      <div className="space-y-2">
        {kind !== "pdf" && <ActiveReporter onActiveChange={onActiveChange} />}
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
        rate={rate}
        onRateChange={setRate}
        onActiveChange={onActiveChange}
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
          onEnded={() => onActiveChange?.(false)}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = rate;
          }}
        />
      </div>
      <SpeedPicker rate={rate} onChange={setRate} />
    </div>
  );
}
