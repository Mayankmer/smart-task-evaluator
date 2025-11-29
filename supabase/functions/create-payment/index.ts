
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Import Stripe from a CDN that bundles it for Deno
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse Request
    const { taskId, returnUrl } = await req.json()
    
    if (!taskId || !returnUrl) {
        throw new Error("Missing taskId or returnUrl");
    }

    // 3. Initialize Stripe
    // Make sure you ran: npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16', // Use a stable API version
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 4. Create Checkout Session
    console.log(`Creating payment session for task: ${taskId}`);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Code Analysis Unlock',
              description: 'Unlock detailed bug reports, security analysis, and refactored code.',
            },
            unit_amount: 500, // $5.00 USD
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Pass the success flag back to your app
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
          taskId: taskId // Store ID in Stripe for tracking (optional)
      }
    })

    // 5. Return the URL to the frontend
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Payment Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})


