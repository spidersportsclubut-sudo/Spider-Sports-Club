import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

interface CheckoutRequest {
  registrationId?: string
  parentEmail?: string
  division?: string
}

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session (subscription mode) for SSC monthly dues.
 */
export async function POST(req: Request) {
  // TODO: replace with your own Stripe test secret key from https://dashboard.stripe.com/test/apikeys
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return Response.json(
      {
        error:
          'Stripe is not configured yet. Add STRIPE_SECRET_KEY to your environment to enable payments.',
      },
      { status: 400 }
    )
  }

  let body: CheckoutRequest
  try {
    body = (await req.json()) as CheckoutRequest
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { registrationId, parentEmail, division } = body
  if (!registrationId) {
    return Response.json({ error: 'registrationId is required.' }, { status: 400 })
  }

  const stripe = new Stripe(secretKey)

  const origin =
    req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const priceId = process.env.STRIPE_REGISTRATION_PRICE_ID
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          quantity: 1,
          price_data: {
            unit_amount: 15000, // $150/month SSC dues
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: { name: 'SSC Monthly Club Dues' },
          },
        },
      ]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: parentEmail || undefined,
    line_items: lineItems,
    success_url: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/register`,
    metadata: {
      registration_id: registrationId,
      division: division ?? '',
    },
  })

  // TODO: update the registrations row with stripe_session_id = session.id
  // using the Supabase service-role key (server-side only). Wire this up
  // once the service-role key is available in the environment.

  return Response.json({ url: session.url })
}
