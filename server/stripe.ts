import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SK;
    if (!key) {
      throw new Error("STRIPE_SK environment variable is not set");
    }
    _stripe = new Stripe(key, { apiVersion: "2025-04-30.basil" as any });
  }
  return _stripe;
}

/**
 * Create a PaymentIntent for a booking.
 * Returns the client secret needed by the frontend to confirm payment.
 */
export async function createPaymentIntent(params: {
  amount: number; // in cents
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency || "usd",
    description: params.description,
    metadata: params.metadata || {},
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Retrieve a PaymentIntent to check its status.
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Cancel a PaymentIntent (for booking cancellations).
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  const stripe = getStripe();
  try {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (error) {
    // Payment may already be captured or cancelled
    console.warn("[Stripe] Failed to cancel payment intent:", error);
    return null;
  }
}

/**
 * Create a refund for a completed payment.
 */
export async function createRefund(paymentIntentId: string, amount?: number) {
  const stripe = getStripe();
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount ? { amount } : {}),
  });
}
