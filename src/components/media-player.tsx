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
