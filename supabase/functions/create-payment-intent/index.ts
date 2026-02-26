// Supabase Edge Function — Stripe PaymentIntent
// Deploy: supabase functions deploy create-payment-intent --no-verify-jwt
// Secret:  supabase secrets set STRIPE_SECRET_KEY=sk_live_...
// --no-verify-jwt : accessible sans session (invités inclus)

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'eur', metadata = {} } = await req.json();

    // amount must be in cents and ≥ 50 (Stripe minimum)
    if (!Number.isInteger(amount) || amount < 50) {
      return new Response(
        JSON.stringify({ error: 'Montant invalide (minimum 0,50 €).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,          // in cents, e.g. 12999 → 129,99 €
      currency,
      metadata,
      // automatic_payment_methods active CB, Apple Pay, Google Pay, PayPal, etc.
      // selon les méthodes activées dans le Dashboard Stripe.
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
