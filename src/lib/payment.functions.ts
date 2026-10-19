import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPaymentPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { AVAILABLE_PLANS } = await import("./payment.server");
  return Object.values(AVAILABLE_PLANS);
});

export const initiatePlanCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { planId: string }) => data)
  .handler(async ({ data, context }) => {
    const { createCheckoutOrder, AVAILABLE_PLANS } = await import("./payment.server");
    const plan = AVAILABLE_PLANS[data.planId];
    if (!plan) throw new Error("Plan not found");

    const isGatewayLive = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    const order = await createCheckoutOrder(context.userId, data.planId, "razorpay");

    return {
      order,
      plan,
      isGatewayLive,
    };
  });
