import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover', // Updated to match your checkout route version
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      // Update the order with status, payment ID, total amount, and shipping details
      const sessionData = session as any
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'paid', 
          payment_intent_id: session.payment_intent as string,
          total_amount: session.amount_total,
          shipping_details: sessionData.shipping_details || sessionData.shipping,
          customer_email: session.customer_details?.email
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
        return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
