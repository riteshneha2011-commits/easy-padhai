import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** The single owner account that always gets the admin role. */
export const OWNER_EMAIL = "ritesh.bhopal@gmail.com";

/**
 * Grants the admin role to the owner account, but only when the email on the
 * verified auth record matches. Safe to call on every session start.
 */
export async function ensureOwnerAdmin(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data?.user) return { granted: false };

  const user = data.user;
  const email = (user.email ?? "").toLowerCase();
  const verified = Boolean(user.email_confirmed_at);
  if (!verified || email !== OWNER_EMAIL) return { granted: false };

  const { data: existing } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (existing) return { granted: true };

  await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
  return { granted: true };
}
