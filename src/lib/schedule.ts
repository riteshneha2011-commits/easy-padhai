/**
 * Schedule utilities for drip content / scheduled lecture releases.
 * Embeds and parses scheduled release timestamps in lesson summary metadata
 * seamlessly without requiring breaking schema migrations.
 */

const SCHEDULE_TAG_REGEX = /^<!--SCHEDULED:([^\n>]+)-->\r?\n?/;

export interface ParsedSchedule {
  scheduledAt: string | null;
  cleanSummary: string | null;
  isScheduled: boolean;
}

/**
 * Extracts scheduled_at timestamp from summary metadata.
 */
export function parseLessonSchedule(summary: string | null | undefined): ParsedSchedule {
  if (!summary || typeof summary !== "string") {
    return { scheduledAt: null, cleanSummary: summary ?? null, isScheduled: false };
  }

  const match = summary.match(SCHEDULE_TAG_REGEX);
  if (match && match[1]) {
    const scheduledAt = match[1].trim();
    const cleanSummary = summary.replace(SCHEDULE_TAG_REGEX, "").trim();
    const isScheduled = isScheduleInFuture(scheduledAt);
    return { scheduledAt, cleanSummary: cleanSummary || null, isScheduled };
  }

  return { scheduledAt: null, cleanSummary: summary, isScheduled: false };
}

/**
 * Attaches or updates scheduled_at tag at the beginning of summary text.
 */
export function injectLessonSchedule(
  summary: string | null | undefined,
  scheduledAt: string | null | undefined,
): string | null {
  const baseSummary = summary ? summary.replace(SCHEDULE_TAG_REGEX, "").trim() : "";
  if (!scheduledAt || !scheduledAt.trim()) {
    return baseSummary || null;
  }

  const cleanIso = new Date(scheduledAt).toISOString();
  if (baseSummary) {
    return `<!--SCHEDULED:${cleanIso}-->\n${baseSummary}`;
  }
  return `<!--SCHEDULED:${cleanIso}-->`;
}

/**
 * Checks if the release timestamp is strictly in the future.
 */
export function isScheduleInFuture(scheduledAt: string | null | undefined): boolean {
  if (!scheduledAt) return false;
  const time = new Date(scheduledAt).getTime();
  if (isNaN(time)) return false;
  return time > Date.now();
}

/**
 * Cleanly formats the release timestamp for UI display (e.g. "18 Sep, 05:00 PM").
 */
export function formatScheduleDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
