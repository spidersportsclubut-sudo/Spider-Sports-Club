import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/stripe
 * Stripe webhook receiver (stub). Verifies the Stripe signature and routes
 * events. Full persistence wiring is still TODO — see inline comments.
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  // TODO: add the real webhook signing secret from the Stripe dashboard
  // (Developers → Webhooks → your endpoint → Signing secret) as STRIPE_WEBHOOK_SECRET.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    return Response.json({ error: 'Stripe webhook is not configured.' }, { status: 400 })
  }

  const stripe = new Stripe(secretKey)
  const signature = req.headers.get('stripe-signature')
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? '', webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return Response.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const registrationId = session.metadata?.registration_id ?? null

      // TODO: update registrations.status to 'paid' where id = registrationId
      // (use the Supabase service-role key server-side).
      // TODO: insert into payments:
      //   { registration_id: registrationId, amount_cents: session.amount_total ?? 15000,
      //     currency: session.currency ?? 'usd', status: 'succeeded',
      //     stripe_payment_intent_id: <payment intent id from the session/invoice> }
      void registrationId
      break
    }
    default:
      break
  }

  return Response.json({ received: true })
}
