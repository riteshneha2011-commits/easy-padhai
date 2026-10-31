/**
 * Helper to manage the 1-2 free shared lectures given to guest learners
 * before requiring them to sign in.
 */

const STORAGE_KEY = "easypadhai_guest_shared_lessons";
const MAX_FREE_SHARED_LESSONS = 2;

export function getGuestSharedLessons(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function canGuestPlaySharedLesson(lessonId: string): boolean {
  if (typeof window === "undefined") return true;
  const list = getGuestSharedLessons();
  if (list.includes(lessonId)) return true;
  return list.length < MAX_FREE_SHARED_LESSONS;
}

export function recordGuestSharedLesson(lessonId: string): {
  allowed: boolean;
  count: number;
  remaining: number;
  isNew: boolean;
} {
  if (typeof window === "undefined") {
    return { allowed: true, count: 1, remaining: 1, isNew: false };
  }
  try {
    const list = getGuestSharedLessons();
    if (list.includes(lessonId)) {
      return {
        allowed: true,
        count: list.length,
        remaining: Math.max(0, MAX_FREE_SHARED_LESSONS - list.length),
        isNew: false,
      };
    }
    if (list.length < MAX_FREE_SHARED_LESSONS) {
      const next = [...list, lessonId];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return {
        allowed: true,
        count: next.length,
        remaining: Math.max(0, MAX_FREE_SHARED_LESSONS - next.length),
        isNew: true,
      };
    }
    return {
      allowed: false,
      count: list.length,
      remaining: 0,
      isNew: false,
    };
  } catch {
    return { allowed: true, count: 1, remaining: 1, isNew: false };
  }
}

export function getGuestSharedQuota(): {
  used: number;
  total: number;
  remaining: number;
} {
  const list = getGuestSharedLessons();
  return {
    used: list.length,
    total: MAX_FREE_SHARED_LESSONS,
    remaining: Math.max(0, MAX_FREE_SHARED_LESSONS - list.length),
  };
}
