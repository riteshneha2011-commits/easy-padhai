import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ProfileDetailsInput } from "./profile.server";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getProfileFor } = await import("./profile.server");
    return getProfileFor(context.userId);
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ProfileDetailsInput) => data)
  .handler(async ({ data, context }) => {
    const { saveProfileDetailsFor } = await import("./profile.server");
    return saveProfileDetailsFor(context.userId, data);
  });

/** Admin-only deep view of a single learner. */
export const getUserDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("Forbidden: admin access required");
    const { getUserDetailFor } = await import("./profile.server");
    return getUserDetailFor(data.userId);
  });
