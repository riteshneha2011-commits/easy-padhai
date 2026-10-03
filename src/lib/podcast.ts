export const PODCAST_STORAGE_KEY = "easypadhai_podcast_mode";
export const PODCAST_DISMISSED_KEY = "easypadhai_podcast_prompt_dismissed";

export function getPodcastMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PODCAST_STORAGE_KEY) === "true";
}

export function setPodcastModeStorage(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PODCAST_STORAGE_KEY, enabled ? "true" : "false");
}

export function isPodcastPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PODCAST_DISMISSED_KEY) === "true";
}

export function setPodcastPromptDismissed(dismissed: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PODCAST_DISMISSED_KEY, dismissed ? "true" : "false");
}
