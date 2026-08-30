export function levelFromXp(xp: number) {
  return Math.floor(Math.sqrt(Math.max(xp, 0) / 50)) + 1;
}

export function xpForLevel(level: number) {
  return Math.pow(level - 1, 2) * 50;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const percent = Math.min(100, Math.round(((xp - start) / Math.max(next - start, 1)) * 100));
  return { level, start, next, percent, toNext: Math.max(next - xp, 0) };
}

export function youtubeEmbed(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  if (url.includes("vimeo.com")) {
    const id = url.split("/").filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }
  return url;
}

export const LESSON_KIND_LABEL: Record<string, string> = {
  audio: "Audio lecture",
  video: "Video lecture",
  summary: "Quick summary",
  pdf: "PDF notes",
};
