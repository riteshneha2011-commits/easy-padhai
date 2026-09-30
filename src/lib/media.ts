import { isStorageRef } from "@/lib/storage";

export type MediaSource =
  | { mode: "iframe"; src: string; provider: "youtube" | "vimeo" | "drive" | "pdf-viewer" | "other" }
  | { mode: "native"; src: string }
  | { mode: "pdf-embed"; src: string; directUrl: string };

const YT = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{6,})/;
const DRIVE = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)|docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/)([\w-]{10,})/;
const FILE_EXT = /\.(mp3|m4a|wav|ogg|oga|aac|flac|mp4|webm|mov|m4v|pdf)(\?|#|$)/i;

export function normalizeDropboxUrl(url: string): string {
  if (url.includes("dropbox.com")) {
    if (url.includes("raw=1")) return url;
    if (url.includes("dl=0")) return url.replace("dl=0", "raw=1");
    if (url.includes("dl=1")) return url.replace("dl=1", "raw=1");
    return url.includes("?") ? `${url}&raw=1` : `${url}?raw=1`;
  }
  return url;
}

/**
 * Figures out how a pasted link (or an uploaded storage file) should be played:
 * an embedded iframe, a native <audio>/<video> element, or an in-app interactive PDF viewer.
 */
export function classifyMedia(rawUrl: string, kind: "audio" | "video" | "pdf"): MediaSource {
  const url = rawUrl.trim();

  // Uploaded files always resolve to signed direct URLs.
  if (isStorageRef(rawUrl)) {
    return kind === "pdf"
      ? { mode: "pdf-embed", src: url, directUrl: url }
      : { mode: "native", src: url };
  }

  // YouTube videos, shorts, and livestreams
  const yt = url.match(YT);
  if (yt) {
    return { mode: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?rel=0`, provider: "youtube" };
  }

  // Vimeo
  if (url.includes("vimeo.com")) {
    const id = url.split("?")[0].split("/").filter(Boolean).pop();
    return { mode: "iframe", src: id ? `https://player.vimeo.com/video/${id}` : url, provider: "vimeo" };
  }

  // Google Drive & Google Docs / Slides
  const drive = url.match(DRIVE);
  if (drive) {
    if (url.includes("docs.google.com/document")) {
      return { mode: "iframe", src: `https://docs.google.com/document/d/${drive[1]}/preview`, provider: "drive" };
    }
    if (url.includes("docs.google.com/presentation")) {
      return { mode: "iframe", src: `https://docs.google.com/presentation/d/${drive[1]}/preview`, provider: "drive" };
    }
    return { mode: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview`, provider: "drive" };
  }

  // Dropbox links (PDF, Audio, Video)
  if (url.includes("dropbox.com")) {
    const directDropbox = normalizeDropboxUrl(url);
    if (kind === "pdf") {
      return {
        mode: "pdf-embed",
        src: directDropbox,
        directUrl: directDropbox,
      };
    }
    return { mode: "native", src: directDropbox };
  }

  // PDF files (direct URL or CDN)
  if (kind === "pdf" || url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf?")) {
    return {
      mode: "pdf-embed",
      src: url,
      directUrl: url,
    };
  }

  if (FILE_EXT.test(url)) {
    return { mode: "native", src: url };
  }

  return kind === "pdf"
    ? { mode: "pdf-embed", src: url, directUrl: url }
    : { mode: "native", src: url };
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export type VideoKind = "explainer" | "cinematic" | "practice" | "revision" | "other";

export type LessonVideo = {
  id: string;
  title: string;
  url: string;
  kind?: VideoKind;
  duration?: string;
};

export const VIDEO_KINDS: { id: VideoKind; label: string; icon: string; description: string }[] = [
  { id: "explainer", label: "Concept Explainer", icon: "👨‍🏫", description: "In-depth concept lecture with theory and whiteboard explanations" },
  { id: "cinematic", label: "Cinematic / 3D Visual", icon: "🎬", description: "3D animations, simulations, or cinematic demonstrations" },
  { id: "practice", label: "Solved Examples / PYQ", icon: "📝", description: "Problem solving walkthroughs and exam question practice" },
  { id: "revision", label: "Quick Revision", icon: "⚡", description: "Fast 2-5 min high-yield summary video" },
  { id: "other", label: "Additional Video", icon: "🎥", description: "Supplemental video, experiment, or case study" },
];

export function parseLessonVideos(raw: string | null | undefined): LessonVideo[] {
  if (!raw || !raw.trim()) return [];
  const text = raw.trim();
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((v) => v && (typeof v === "string" || typeof v.url === "string"))
          .map((v, i) => {
            if (typeof v === "string") {
              return {
                id: `v-${i}`,
                title: i === 0 ? "Main Explainer" : `Video ${i + 1}`,
                url: v,
                kind: i === 0 ? "explainer" : "other",
              };
            }
            return {
              id: v.id || `v-${i}`,
              title: v.title || (v.kind === "cinematic" ? "Cinematic Video" : `Video ${i + 1}`),
              url: v.url || "",
              kind: v.kind || "explainer",
              duration: v.duration,
            };
          })
          .filter((v) => Boolean(v.url));
      }
    } catch {
      // Fallback to single URL parse
    }
  }

  return [
    {
      id: "v-0",
      title: "Video Lecture",
      url: text,
      kind: "explainer",
    },
  ];
}

export function serializeLessonVideos(videos: LessonVideo[]): string | null {
  const valid = videos
    .map((v, i) => ({
      id: v.id || `v-${i}`,
      title: v.title?.trim() || `Video ${i + 1}`,
      url: v.url?.trim() || "",
      kind: v.kind || "explainer",
      duration: v.duration?.trim() || undefined,
    }))
    .filter((v) => Boolean(v.url));

  if (valid.length === 0) return null;

  // If only 1 video with standard name & default kind, keep it as plain URL string for maximum backward compatibility
  if (
    valid.length === 1 &&
    (!valid[0].kind || valid[0].kind === "explainer") &&
    (!valid[0].title || valid[0].title === "Video Lecture" || valid[0].title === "Main Video") &&
    !valid[0].duration
  ) {
    return valid[0].url;
  }

  return JSON.stringify(valid);
}


