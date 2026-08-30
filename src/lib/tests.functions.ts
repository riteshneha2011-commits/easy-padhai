import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getTestForAttempt, submitAttemptFor } from "./tests.server";

export const getTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { testId: string }) => data)
  .handler(async ({ data }) => getTestForAttempt(data.testId));

export const submitAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { testId: string; answers: Record<string, number> }) => data)
  .handler(async ({ data, context }) =>
    submitAttemptFor(context.userId, data.testId, data.answers),
  );
