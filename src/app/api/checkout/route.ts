import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover', // Use latest API version
})

// Initialize Supabase (Admin Context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { items, userId, returnUrl } = await req.json()

    // 1. Format items for Stripe
    const lineItems = items.map((item: any) => {
      let imageUrl = item.image
      
      // Ensure we have a full URL
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${process.env.NEXT_PUBLIC_URL}${imageUrl}`
      }

      // Stripe requires a publicly accessible URL. Localhost won't work.
      // If we are on localhost, we skip the image to prevent the error.
      if (imageUrl && imageUrl.includes('localhost')) {
        imageUrl = null
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: item.price, // Amount in cents
        },
        quantity: item.quantity,
      }
    })

    // 2. Create a "Pending" Order in Supabase BEFORE going to Stripe
    // We generate the secure Upload Token here
    const uploadToken = crypto.randomUUID()
    
    // (Optional: If you support guest checkout, userId might be null)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null, 
        status: 'pending',
        upload_token: uploadToken
      })
      .select('id')
      .single()

    if (orderError) throw new Error(`DB Error: ${orderError.message}`)

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}${returnUrl || '/products'}`, // Redirect back to where they came from
      metadata: {
        orderId: order.id, // CRITICAL: Link Stripe to our DB Order
        uploadToken: uploadToken
      },
    })

    // 4. Return the URL so the frontend can redirect the user
    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
