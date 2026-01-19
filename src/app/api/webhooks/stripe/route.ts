import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import { swatAdmin } from '@/lib/swatbloc'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (orderId) {
      try {
        // Update the order in SwatBloc instead of Supabase
        await (swatAdmin as any).collection('orders').update(orderId, { 
          status: 'paid', 
          payment_intent_id: session.payment_intent as string,
          total_amount: session.amount_total,
          metafields: {
            customer_email: session.customer_details?.email,
            payment_status: 'confirmed',
            // Preserve/add existing metadata
            measurement_status: 'pending' 
          }
        });
      } catch (error) {
        console.error('Error updating SwatBloc order:', error)
        return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
