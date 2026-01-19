import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe features will not work.');
}

export const stripe = new Stripe(apiKey || '', {
  // @ts-ignore - version might be specific to user's implementation
  apiVersion: '2025-11-17.clover', 
  typescript: true,
});

export const isTestMode = apiKey?.startsWith('sk_test_');
