import { supabaseAdmin } from "@/integrations/supabase/client.server";

function today() {
  return new Date().toISOString().slice(0, 10);
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

export async function touchStreak(userId: string, minutes: number) {
  const { data: streak } = await supabaseAdmin
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const day = today();
  if (!streak) {
    await supabaseAdmin.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: day,
      minutes_today: minutes,
    });
    return;
  }

  const last = streak.last_active_date;
  let current = streak.current_streak;
  let minutesToday = streak.minutes_today;

  if (last === day) {
    minutesToday += minutes;
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    current = last === yesterday ? current + 1 : 1;
    minutesToday = minutes;
  }

  await supabaseAdmin
    .from("streaks")
    .update({
      current_streak: current,
      longest_streak: Math.max(current, streak.longest_streak),
      last_active_date: day,
      minutes_today: minutesToday,
    })
    .eq("user_id", userId);

  if (current >= 3) await grantBadge(userId, "streak_3");
  if (current >= 7) await grantBadge(userId, "streak_7");
}
