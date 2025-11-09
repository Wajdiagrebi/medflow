import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET;
if (!secret) console.warn('STRIPE_SECRET not set — Stripe operations will fail if called');

// Delay creating the Stripe client until we have a key. Creating with an
// empty string throws during module evaluation which breaks pages that
// import this module but don't actually call Stripe operations.
let stripe: Stripe | null = null;
if (secret) {
  // create Stripe client with the provided secret; avoid passing apiVersion here
  // to keep strict typing compatible with the installed Stripe types
  stripe = new Stripe(secret);
}

export async function createCheckoutSession(opts: {
  amount: number;
  invoiceId: string;
  successUrl?: string;
  cancelUrl?: string;
  currency?: string;
}) {
  const { amount, invoiceId, successUrl = 'http://localhost:3000', cancelUrl = 'http://localhost:3000', currency = 'usd' } = opts;

  if (!stripe) throw new Error('Stripe not configured. Set STRIPE_SECRET to enable payments.');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: `Invoice ${invoiceId}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { invoiceId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export { stripe };
