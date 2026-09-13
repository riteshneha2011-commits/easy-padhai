import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** The single owner account that always gets admin and teacher roles. */
export const OWNER_EMAIL = "ritesh.bhopal@gmail.com";

/**
 * Grants admin and teacher roles to the owner account, but only when the email on the
 * verified auth record matches. Safe to call on session start or authorization check.
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
    .eq("user_id", userId);

  const existingRoles = new Set((existing ?? []).map((r) => r.role));
  const inserts: { user_id: string; role: "admin" | "teacher" }[] = [];
  if (!existingRoles.has("admin")) {
    inserts.push({ user_id: userId, role: "admin" });
  }
  if (!existingRoles.has("teacher")) {
    inserts.push({ user_id: userId, role: "teacher" });
  }

  if (inserts.length > 0) {
    await supabaseAdmin.from("user_roles").insert(inserts);
  }

  return { granted: true };
}
