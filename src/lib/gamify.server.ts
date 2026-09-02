import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Returns current date string (YYYY-MM-DD) in Indian Standard Time (IST) */
export function getTodayDateIST(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    // Fallback +5:30 offset
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(Date.now() + istOffset);
    return istDate.toISOString().slice(0, 10);
  }
}

/** Calculate calendar day difference between two YYYY-MM-DD dates */
function getDaysDifference(currentDateStr: string, pastDateStr: string): number {
  try {
    const d1 = new Date(`${currentDateStr}T00:00:00Z`).getTime();
    const d2 = new Date(`${pastDateStr}T00:00:00Z`).getTime();
    return Math.round((d1 - d2) / 86400000);
  } catch {
    return 1;
  }
}

export async function awardXp(userId: string, amount: number, reason: string) {
  if (amount <= 0) return;
  await supabaseAdmin.from("xp_events").insert({ user_id: userId, amount, reason });
}

export async function grantBadge(userId: string, code: string) {
  await supabaseAdmin
    .from("user_badges")
    .upsert({ user_id: userId, badge_code: code }, { onConflict: "user_id,badge_code" });
}

export async function touchStreak(userId: string, minutes: number = 5) {
  const today = getTodayDateIST();
  const safeMinutes = Math.max(minutes, 1);

  const { data: streak } = await supabaseAdmin
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!streak) {
    const { data: inserted } = await supabaseAdmin
      .from("streaks")
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
        minutes_today: safeMinutes,
      })
      .select()
      .maybeSingle();
    return inserted ?? { current_streak: 1, longest_streak: 1, last_active_date: today };
  }

  const last = streak.last_active_date;
  let current = streak.current_streak ?? 1;
  let minutesToday = streak.minutes_today ?? 0;

  if (!last) {
    current = 1;
    minutesToday = safeMinutes;
  } else {
    const diff = getDaysDifference(today, last);
    if (diff <= 0) {
      // Same day activity: streak is kept, add minutes
      minutesToday += safeMinutes;
      current = Math.max(current, 1);
    } else if (diff === 1) {
      // Consecutive day: streak incremented!
      current = current + 1;
      minutesToday = safeMinutes;
    } else {
      // More than 1 day missed: reset to 1
      current = 1;
      minutesToday = safeMinutes;
    }
  }

  const longest = Math.max(current, streak.longest_streak ?? 1);

  const { data: updated } = await supabaseAdmin
    .from("streaks")
    .update({
      current_streak: current,
      longest_streak: longest,
      last_active_date: today,
      minutes_today: minutesToday,
    })
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (current >= 3) await grantBadge(userId, "streak_3");
  if (current >= 7) await grantBadge(userId, "streak_7");

  return updated ?? { current_streak: current, longest_streak: longest, last_active_date: today };
}
