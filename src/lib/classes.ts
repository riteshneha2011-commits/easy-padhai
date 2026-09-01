/**
 * Single source of truth for class levels.
 *
 * The product is positioned for Class 9 to 12, but content rolls out class by
 * class. To open a new class later, just move it from `UPCOMING` into
 * `ACTIVE_CLASS_LEVELS` — every label, filter and AI prompt follows this file.
 */

export const ALL_CLASS_LEVELS = [9, 10, 11, 12] as const;
export type ClassLevel = (typeof ALL_CLASS_LEVELS)[number];

/** Classes that are active on the platform. */
export const ACTIVE_CLASS_LEVELS: readonly number[] = [9, 10, 11, 12];

/** Classes announced but not live yet (empty now that 9-12 are active). */
export const UPCOMING_CLASS_LEVELS: readonly number[] = ALL_CLASS_LEVELS.filter(
  (c) => !ACTIVE_CLASS_LEVELS.includes(c),
);

export const DEFAULT_CLASS_LEVEL = 9;

/** Brand-level range, e.g. "Class 9-12" — used in marketing copy and SEO. */
export const CLASS_RANGE_LABEL = `Class ${ALL_CLASS_LEVELS[0]}–${ALL_CLASS_LEVELS[ALL_CLASS_LEVELS.length - 1]}`;

/** What is live right now, e.g. "Class 9, 10, 11 & 12". */
export const ACTIVE_CLASS_LABEL = `Class 9, 10, 11 & 12`;

export const UPCOMING_CLASS_LABEL = "";

export function isClassActive(level: number | null | undefined): boolean {
  return level != null && ACTIVE_CLASS_LEVELS.includes(level);
}

export function classLabel(level: number | null | undefined): string {
  return level == null ? "—" : `Class ${level}`;
}

export function classOrdinalLabel(level: number | null | undefined): string {
  if (level == null) return "—";
  if (level === 9) return "Class 9th";
  if (level === 10) return "Class 10th";
  if (level === 11) return "Class 11th";
  if (level === 12) return "Class 12th";
  return `Class ${level}th`;
}

export function normalizeClassLevel(value: unknown): number {
  const n = Number(value);
  return ALL_CLASS_LEVELS.includes(n as ClassLevel) ? n : DEFAULT_CLASS_LEVEL;
}
