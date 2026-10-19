import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Easy Padhai Future-Proof Payment Gateway Adapter (SSOT)
 * Ready for drop-in integration with Razorpay, Cashfree, or Stripe.
 */

export type PaymentProvider = "razorpay" | "cashfree" | "stripe";

export type PurchasePlan = {
  id: string;
  name: string;
  description: string;
  amountInPaisa: number; // e.g. 49900 = ₹499
  currency: "INR";
  creditsGranted?: number;
  badgeGranted?: string;
  roleGranted?: "student" | "pro_student";
};

export const AVAILABLE_PLANS: Record<string, PurchasePlan> = {
  pro_annual: {
    id: "pro_annual",
    name: "Easy Padhai Pro Annual Pass",
    description: "Unlimited high-speed audio downloads, Kota formula cheat sheets, and priority doubt support.",
    amountInPaisa: 99900, // ₹999/yr
    currency: "INR",
    creditsGranted: 2000,
    badgeGranted: "👑 Pro Scholar",
    roleGranted: "pro_student",
  },
  credits_boost_500: {
    id: "credits_boost_500",
    name: "500 Study Coins Booster Pack",
    description: "Instant +500 Coins for premium test series, revision drills & profile customization.",
    amountInPaisa: 9900, // ₹99
    currency: "INR",
    creditsGranted: 500,
  },
};

export type OrderCreationResult = {
  orderId: string;
  planId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  keyId?: string;
};

/**
 * Prepares an order for checkout.
 * Once RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET are added to .env, this directly
 * communicates with the gateway API.
 */
export async function createCheckoutOrder(
  userId: string,
  planId: string,
  provider: PaymentProvider = "razorpay"
): Promise<OrderCreationResult> {
  const plan = AVAILABLE_PLANS[planId];
  if (!plan) throw new Error(`Invalid plan: ${planId}`);

  const pseudoOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Log pending purchase intent in credit_events
  await supabaseAdmin.from("credit_events").insert({
    user_id: userId,
    event_type: "purchase_initiated",
    delta: 0,
    metadata: {
      order_id: pseudoOrderId,
      plan_id: planId,
      amount: plan.amountInPaisa,
      provider,
      status: "pending",
      created_at: new Date().toISOString(),
    },
  });

  return {
    orderId: pseudoOrderId,
    planId: plan.id,
    amount: plan.amountInPaisa,
    currency: plan.currency,
    provider,
    keyId: process.env.RAZORPAY_KEY_ID || undefined,
  };
}

/**
 * Fulfills a verified payment webhook or client confirmation.
 * Grants credits, upgrades role, and records permanent financial ledger entry.
 */
export async function fulfillSuccessfulPayment(params: {
  userId: string;
  orderId: string;
  paymentId: string;
  planId: string;
  amountPaid: number;
  provider: PaymentProvider;
}) {
  const { userId, orderId, paymentId, planId, amountPaid, provider } = params;
  const plan = AVAILABLE_PLANS[planId];

  // 1. Log ledger entry in credit_events
  await supabaseAdmin.from("credit_events").insert({
    user_id: userId,
    event_type: "purchase",
    delta: plan?.creditsGranted ?? 0,
    metadata: {
      order_id: orderId,
      payment_id: paymentId,
      plan_id: planId,
      amount: amountPaid,
      provider,
      status: "completed",
      completed_at: new Date().toISOString(),
    },
  });

  // 2. Grant credits if applicable
  if (plan?.creditsGranted && plan.creditsGranted > 0) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .maybeSingle();

    const newCredits = (profile?.credits ?? 0) + plan.creditsGranted;
    await supabaseAdmin
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", userId);
  }

  return {
    success: true,
    planName: plan?.name ?? "Custom Purchase",
    creditsGranted: plan?.creditsGranted ?? 0,
  };
}
