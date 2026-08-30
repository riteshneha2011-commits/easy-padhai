import { isStorageRef } from "@/lib/storage";

export type MediaSource =
  | { mode: "iframe"; src: string; provider: "youtube" | "vimeo" | "drive" | "other" }
  | { mode: "native"; src: string }
  | { mode: "link"; src: string };

const YT = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{6,})/;
const DRIVE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/;
const FILE_EXT = /\.(mp3|m4a|wav|ogg|oga|aac|flac|mp4|webm|mov|m4v|pdf)(\?|#|$)/i;

/**
 * Figures out how a pasted link (or an uploaded storage file) should be played:
 * an embedded iframe, a native <audio>/<video> element, or a plain outbound link.
 */
export function classifyMedia(rawUrl: string, kind: "audio" | "video" | "pdf"): MediaSource {
  const url = rawUrl.trim();

  // Uploaded files always resolve to signed direct URLs.
  if (isStorageRef(rawUrl)) return kind === "pdf" ? { mode: "link", src: url } : { mode: "native", src: url };

  const yt = url.match(YT);
  if (yt) {
    return { mode: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?rel=0`, provider: "youtube" };
  }

  if (url.includes("vimeo.com")) {
    const id = url.split("?")[0].split("/").filter(Boolean).pop();
    return { mode: "iframe", src: id ? `https://player.vimeo.com/video/${id}` : url, provider: "vimeo" };
  }

  const drive = url.match(DRIVE);
  if (drive) {
    return { mode: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview`, provider: "drive" };
  }

  if (FILE_EXT.test(url)) {
    return kind === "pdf" ? { mode: "link", src: url } : { mode: "native", src: url };
  }

  // Unknown host: PDFs/notes open in a new tab, media gets a best-effort native try.
  return kind === "pdf" ? { mode: "link", src: url } : { mode: "native", src: url };
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
