/**
 * Stripe Integration Module for RV Nomad
 * 
 * This module handles payment processing via Stripe Connect.
 * The platform fee ($2.00/night) is automatically split:
 *   - Campground receives their nightly rate
 *   - RV Nomad receives the $2.00/night booking fee
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Get your publishable key and secret key from the Stripe Dashboard
 * 3. Set STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY in environment
 * 4. For production, enable Stripe Connect to handle campground payouts
 * 
 * STRIPE CONNECT FLOW:
 * - User books campsite → Payment Intent created
 * - Stripe splits: campground amount → campground's connected account
 * - Platform fee ($2/night × nights) → your Stripe account
 * - Stripe takes ~2.9% + $0.30 from the total transaction
 */

// Platform booking fee per night (in dollars)
export const PLATFORM_FEE_PER_NIGHT = 2.00;

// Annual subscription price (in dollars)
export const ANNUAL_SUBSCRIPTION_PRICE = 49.99;

// Subscription plan details
export const SUBSCRIPTION_PLAN = {
  name: "RV Nomad Pro",
  price: ANNUAL_SUBSCRIPTION_PRICE,
  period: "year" as const,
  features: [
    "Access to 2,300+ campgrounds & RV parks",
    "State-by-state RV laws & boondocking rules",
    "RV size limits for every campsite",
    "Reviews from fellow RVers",
    "Save & organize favorite sites",
    "RV fuel stations, propane, repair shops & more",
    "Roadside attractions & scenic viewpoints",
    "Trip planning tools",
    "Discount program info (Good Sam, Passport America, Military)",
  ],
};

// Tax rate applied to campsite charges (not to platform fee)
export const TAX_RATE = 0.06;

export interface PaymentBreakdown {
  campsiteSubtotal: number;   // pricePerNight × nights × sites
  platformFee: number;        // $2.00 × nights
  taxes: number;              // 6% of campsite subtotal
  total: number;              // everything combined
  stripeFeeEstimate: number;  // ~2.9% + $0.30 (for your reference)
  netPlatformRevenue: number; // what you actually keep after Stripe fees on the platform fee
}

/**
 * Calculate full payment breakdown for a booking.
 */
export function calculatePayment(params: {
  pricePerNight: number;
  nights: number;
  sites: number;
}): PaymentBreakdown {
  const { pricePerNight, nights, sites } = params;

  const campsiteSubtotal = pricePerNight * nights * sites;
  const platformFee = PLATFORM_FEE_PER_NIGHT * nights;
  const taxes = Math.round(campsiteSubtotal * TAX_RATE * 100) / 100;
  const total = Math.round((campsiteSubtotal + platformFee + taxes) * 100) / 100;

  // Stripe fee estimate (2.9% + $0.30 of total transaction)
  const stripeFeeEstimate = Math.round((total * 0.029 + 0.30) * 100) / 100;
  const netPlatformRevenue = Math.round((platformFee - (platformFee * 0.029 + 0.10)) * 100) / 100;

  return {
    campsiteSubtotal,
    platformFee,
    taxes,
    total,
    stripeFeeEstimate,
    netPlatformRevenue,
  };
}

/**
 * Stripe Payment Intent creation (placeholder).
 * Replace with actual Stripe SDK call when account is connected.
 * 
 * In production, this would:
 * 1. Call your backend server
 * 2. Server creates a PaymentIntent via Stripe API
 * 3. Returns client_secret to the app
 * 4. App confirms payment with Stripe SDK
 */
export async function createPaymentIntent(params: {
  amountCents: number;
  currency?: string;
  campgroundConnectedAccountId?: string;
  platformFeeCents: number;
  metadata?: Record<string, string>;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // TODO: Replace with actual Stripe API call via your backend
  // 
  // Example backend endpoint:
  // POST /api/payments/create-intent
  // Body: {
  //   amount: params.amountCents,
  //   currency: params.currency || 'usd',
  //   application_fee_amount: params.platformFeeCents,
  //   transfer_data: {
  //     destination: params.campgroundConnectedAccountId
  //   },
  //   metadata: params.metadata
  // }
  //
  // The application_fee_amount is your $2/night fee.
  // Stripe automatically routes the rest to the campground's connected account.

  console.log("[Stripe] Payment intent would be created:", {
    amount: params.amountCents,
    platformFee: params.platformFeeCents,
    currency: params.currency || "usd",
  });

  // Simulated response for development
  return {
    clientSecret: `pi_simulated_${Date.now()}_secret`,
    paymentIntentId: `pi_simulated_${Date.now()}`,
  };
}

/**
 * Confirm payment (placeholder).
 * In production, uses Stripe SDK's confirmPayment.
 */
export async function confirmPayment(clientSecret: string): Promise<{
  success: boolean;
  error?: string;
}> {
  // TODO: Replace with actual Stripe SDK confirmPayment
  //
  // import { confirmPayment } from '@stripe/stripe-react-native';
  // const { error, paymentIntent } = await confirmPayment(clientSecret, {
  //   paymentMethodType: 'Card',
  //   paymentMethodData: { ... }
  // });

  console.log("[Stripe] Payment would be confirmed:", clientSecret);

  // Simulated success for development
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true };
}

/**
 * Process a refund (placeholder).
 * Call when user cancels a booking within the cancellation window.
 */
export async function processRefund(paymentIntentId: string): Promise<{
  success: boolean;
  refundId?: string;
  error?: string;
}> {
  // TODO: Replace with actual Stripe refund API call via backend
  //
  // POST /api/payments/refund
  // Body: { paymentIntentId }

  console.log("[Stripe] Refund would be processed:", paymentIntentId);

  return {
    success: true,
    refundId: `re_simulated_${Date.now()}`,
  };
}

/**
 * Configuration check — returns whether Stripe is properly configured.
 * Use this to show/hide payment features in the UI.
 */
export function isStripeConfigured(): boolean {
  // TODO: Check for actual Stripe keys in environment
  // return !!process.env.STRIPE_PUBLISHABLE_KEY;
  return false; // Will return true once Stripe keys are set
}
