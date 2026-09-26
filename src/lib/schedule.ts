/**
 * Schedule utilities for drip content / scheduled lecture releases.
 * Embeds and parses scheduled release timestamps in lesson summary metadata
 * seamlessly without requiring breaking schema migrations.
 * 
 * All user-facing times are anchored in Indian Standard Time (Asia/Kolkata, UTC+05:30)
 * to ensure that browser date-pickers and server environments (Vercel/Node in UTC)
 * agree 100% on the exact intended publication timestamp.
 */

const SCHEDULE_TAG_REGEX = /^<!--SCHEDULED:([^\n>]+)-->\r?\n?/;

export interface ParsedSchedule {
  scheduledAt: string | null;
  cleanSummary: string | null;
  isScheduled: boolean;
}

/**
 * Safely converts a user-inputted local datetime (e.g. "2026-09-18T18:00" from datetime-local)
 * into a standard UTC ISO 8601 string ("2026-09-18T12:30:00.000Z").
 * 
 * If no timezone offset is present on the input string, Indian Standard Time (+05:30) is explicitly
 * applied, guaranteeing that server timezones (e.g. UTC on cloud servers) never shift the user's selection.
 */
export function localDateTimeToIso(dateInput: string | Date | null | undefined): string | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return !isNaN(dateInput.getTime()) ? dateInput.toISOString() : null;
  }

  const str = String(dateInput).trim();
  if (!str) return null;

  // If already an ISO string with timezone (ends with Z or +/-offset)
  if (str.includes("Z") || /[+-]\d{2}(:?\d{2})?$/.test(str)) {
    const d = new Date(str);
    return !isNaN(d.getTime()) ? d.toISOString() : null;
  }

  // Raw local string like "2026-09-18T18:00" or "2026-09-18T18:00:00"
  // Append +05:30 (IST) explicitly to prevent server UTC offset distortion:
  const withTz = str.length === 16 ? `${str}:00+05:30` : `${str}+05:30`;
  const d = new Date(withTz);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }

  const fallback = new Date(str);
  return !isNaN(fallback.getTime()) ? fallback.toISOString() : null;
}

/**
 * Formats any stored UTC timestamp or Date into "YYYY-MM-DDTHH:mm" format for <input type="datetime-local" />
 * in Indian Standard Time (Asia/Kolkata).
 */
export function toLocalDateTimeInputString(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";

  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
  } catch {
    return "";
  }
}

/**
 * Calculates a default release time of tomorrow 10:00 AM IST formatted for <input type="datetime-local" />.
 */
export function getDefaultNextDayScheduleInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return toLocalDateTimeInputString(d);
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

  const cleanIso = localDateTimeToIso(scheduledAt);
  if (!cleanIso) {
    return baseSummary || null;
  }

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
 * Cleanly formats the release timestamp for UI display (e.g. "18 Sep, 05:00 PM") in IST.
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
    timeZone: "Asia/Kolkata",
  }).format(date);
}

/**
 * Extracts scheduled release timestamp from notification message metadata if embedded.
 */
export function parseNotificationSchedule(message: string | null | undefined): {
  scheduledAt: string | null;
  cleanMessage: string;
  isScheduled: boolean;
} {
  if (!message || typeof message !== "string") {
    return { scheduledAt: null, cleanMessage: message ?? "", isScheduled: false };
  }
  const match = message.match(SCHEDULE_TAG_REGEX);
  if (match && match[1]) {
    const scheduledAt = match[1].trim();
    const cleanMessage = message.replace(SCHEDULE_TAG_REGEX, "").trim();
    const isScheduled = isScheduleInFuture(scheduledAt);
    return { scheduledAt, cleanMessage, isScheduled };
  }
  return { scheduledAt: null, cleanMessage: message, isScheduled: false };
}

/**
 * Injects scheduled release timestamp into notification message.
 */
export function injectNotificationSchedule(
  message: string,
  publishAt: string | null | undefined,
): string {
  const baseMessage = message ? message.replace(SCHEDULE_TAG_REGEX, "").trim() : "";
  if (!publishAt || !publishAt.trim()) {
    return baseMessage;
  }
  const cleanIso = localDateTimeToIso(publishAt);
  if (!cleanIso) {
    return baseMessage;
  }
  return `<!--SCHEDULED:${cleanIso}-->\n${baseMessage}`;
}

