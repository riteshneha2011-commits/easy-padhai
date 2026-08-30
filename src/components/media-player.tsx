import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, Gauge, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStorageRef, resolveMediaUrl } from "@/lib/storage";
import { classifyMedia, PLAYBACK_RATES } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  title: string;
  kind: "audio" | "video" | "pdf";
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
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <Gauge className="size-3.5" /> Speed
      </span>
      {PLAYBACK_RATES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "rounded-full border border-border px-2.5 py-1 text-xs font-bold transition-colors",
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

/** Plays external links (YouTube/Vimeo/Drive/direct files) or uploaded storage files. */
export function MediaPlayer({ value, title, kind, onActiveChange }: Props) {
  const stored = isStorageRef(value);
  const [url, setUrl] = useState<string | null>(stored ? null : value);
  const [failed, setFailed] = useState(false);
  const [rate, setRate] = useState(1);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!stored) {
      setUrl(value);
      setFailed(false);
      return;
    }
    let alive = true;
    setUrl(null);
    setFailed(false);
    resolveMediaUrl(value).then((resolved) => {
      if (!alive) return;
      if (resolved) setUrl(resolved);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, [value, stored]);

  useEffect(() => {
    if (mediaRef.current) mediaRef.current.playbackRate = rate;
  }, [rate, url]);

  if (failed) {
    return <p className="text-sm text-muted-foreground">Sign in to open this uploaded file.</p>;
  }

  if (!url) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading media…
      </p>
    );
  }

  const source = stored
    ? kind === "pdf"
      ? ({ mode: "link", src: url } as const)
      : ({ mode: "native", src: url } as const)
    : classifyMedia(url, kind);

  if (source.mode === "iframe") {
    const isAudioEmbed = kind === "audio";
    return (
      <div className="space-y-2">
        {kind !== "pdf" && <ActiveReporter onActiveChange={onActiveChange} />}
        <div
          className={cn(
            "w-full overflow-hidden rounded-2xl bg-secondary",
            kind === "pdf" ? "h-[70vh] min-h-80" : isAudioEmbed ? "aspect-video sm:aspect-[16/7]" : "aspect-video",
          )}
        >
          <iframe
            src={source.src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Use the player&apos;s own settings menu to change speed on{" "}
          {source.provider === "youtube" ? "YouTube" : source.provider === "vimeo" ? "Vimeo" : "this"} content.{" "}
          <a href={url} target="_blank" rel="noreferrer" className="font-semibold underline">
            Open original
          </a>
        </p>
      </div>
    );
  }

  if (source.mode === "link") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="w-fit rounded-full">
          <a href={source.src} target="_blank" rel="noreferrer">
            <FileText className="size-4" /> Open {kind === "pdf" ? "PDF notes" : "file"}
          </a>
        </Button>
        <a
          href={source.src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="size-3" /> New tab
        </a>
      </div>
    );
  }

  if (kind === "audio") {
    return (
      <div className="space-y-3">
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          controls
          src={source.src}
          className="w-full"
          onPlay={() => onActiveChange?.(true)}
          onPause={() => onActiveChange?.(false)}
          onEnded={() => onActiveChange?.(false)}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = rate;
          }}
        >
          Your browser does not support audio playback.
        </audio>
        <SpeedPicker rate={rate} onChange={setRate} />
      </div>
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
