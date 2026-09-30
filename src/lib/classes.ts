/**
 * Source of truth for class levels.
 *
 * Supports base classes (Class 9 to 12) and dynamically added classes
 * by admins (e.g. Class 5, 6, 7, 8, etc.).
 */

export const BASE_CLASS_LEVELS = [9, 10, 11, 12] as const;
export const ALL_CLASS_LEVELS = [9, 10, 11, 12] as const;
export type ClassLevel = number;

/** Classes that are active by default on the platform. */
export const ACTIVE_CLASS_LEVELS: readonly number[] = [9, 10, 11, 12];

export const UPCOMING_CLASS_LEVELS: readonly number[] = [];

export const DEFAULT_CLASS_LEVEL = 9;

export const CUSTOM_CLASSES_KEY = "easypadhai_custom_classes";

/** Read any custom admin-added classes from localStorage */
export function getCustomClasses(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_CLASSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(Number).filter((n) => !isNaN(n) && n > 0 && Number.isInteger(n));
    }
  } catch {
    // ignore
  }
  return [];
}

/** Save a new class level (e.g. Class 5, 7, 8) */
export function saveCustomClass(level: number): number[] {
  const norm = Math.round(Number(level));
  if (isNaN(norm) || norm <= 0) return getCustomClasses();
  const current = getCustomClasses();
  if (!current.includes(norm) && !BASE_CLASS_LEVELS.includes(norm as any)) {
    const updated = [...current, norm].sort((a, b) => a - b);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CUSTOM_CLASSES_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("easypadhai-classes-updated"));
      } catch {
        // ignore
      }
    }
    return updated;
  }
  return current;
}

/** Returns all active classes: base classes + custom stored + extra from DB subjects */
export function getAllActiveClasses(extraFromDb?: (number | null | undefined)[]): number[] {
  const custom = getCustomClasses();
  const db = (extraFromDb ?? [])
    .filter((n): n is number => typeof n === "number" && !isNaN(n) && n > 0);
  const set = new Set<number>([...BASE_CLASS_LEVELS, ...custom, ...db]);
  return Array.from(set).sort((a, b) => a - b);
}

/** Brand-level range copy */
export const CLASS_RANGE_LABEL = `Class 9–12 & Beyond`;

/** Label for active classes */
export const ACTIVE_CLASS_LABEL = `Class 9, 10, 11, 12 & More`;

export const UPCOMING_CLASS_LABEL = "";

export function isClassActive(level: number | null | undefined): boolean {
  return level != null && level > 0;
}

export function classLabel(level: number | null | undefined): string {
  return level == null ? "—" : `Class ${level}`;
}

export function classOrdinalLabel(level: number | null | undefined): string {
  if (level == null) return "—";
  if (level === 1) return "Class 1st";
  if (level === 2) return "Class 2nd";
  if (level === 3) return "Class 3rd";
  if (level === 9) return "Class 9th";
  if (level === 10) return "Class 10th";
  if (level === 11) return "Class 11th";
  if (level === 12) return "Class 12th";
  return `Class ${level}th`;
}

export function normalizeClassLevel(value: unknown): number {
  const n = Number(value);
  return !isNaN(n) && n > 0 && Number.isInteger(n) ? n : DEFAULT_CLASS_LEVEL;
}

