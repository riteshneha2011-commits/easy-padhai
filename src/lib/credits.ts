/** Single place to retune the whole credit economy. */

export const CREDIT_COSTS = {
  lesson: 10,
  audio: 10,
  video: 10,
  pdf: 10,
  summary: 0,
} as const;

export const CREDIT_REWARDS = {
  welcome: 100,
  dailyLogin: 10,
  studyBlock: 5, // per 10 minutes of lesson time
  lessonComplete: 10,
  testSubmitted: 10,
  testPassedBonus: 5, // total 15 when >= 60%
  referral: 50, // each side
} as const;

export const STUDY_BLOCK_SECONDS = 600;
export const TEST_PASS_RATIO = 0.6;

export const STREAK_LADDER = [
  { day: 3, credits: 20 },
  { day: 7, credits: 50 },
  { day: 14, credits: 100 },
  { day: 30, credits: 250 },
] as const;

/** Credits needed to open a whole lesson (all of its resources: audio, video, notes, summary, quiz). */
export function lessonCost(_lesson?: {
  audio_url?: string | null;
  video_url?: string | null;
  pdf_url?: string | null;
  hasAudio?: boolean;
  hasVideo?: boolean;
  hasPdf?: boolean;
}): number {
  return CREDIT_COSTS.lesson; // Flat 10 credits per lecture unlock
}

export function nextStreakMilestone(current: number) {
  return STREAK_LADDER.find((s) => s.day > current) ?? null;
}

export function referralLink(origin: string, code: string) {
  return `${origin}/auth?ref=${encodeURIComponent(code)}`;
}

export function whatsappShare(link: string) {
  const text = `I'm learning on Easy Padhai (Class 9–12) — audio + video lectures, notes and instant tests, all free. Join with my link and we both get 50 bonus credits: ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export const REF_STORAGE_KEY = "easy-padhai-ref";
