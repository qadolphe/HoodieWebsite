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
    const origin = new URL(req.url).origin

    // 1. Validate Items & Fetch Real Prices from DB
    const itemIds = items.map((item: any) => item.id)
    const { data: dbProducts, error: productError } = await supabase
      .from('products')
      .select('id, name, base_price')
      .in('id', itemIds)

    if (productError || !dbProducts) {
      throw new Error('Could not validate products')
    }

    // 2. Format items for Stripe using DB PRICES
    const lineItems = items.map((item: any) => {
      const dbProduct = dbProducts.find((p) => p.id === item.id)
      
      if (!dbProduct) {
        throw new Error(`Product ${item.name} not found in database`)
      }

      let imageUrl = item.image
      
      // Ensure we have a full URL
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${origin}${imageUrl}`
      }

      if (imageUrl && imageUrl.includes('localhost')) {
        imageUrl = null
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: dbProduct.name, // Use DB name to prevent spoofing too
            images: imageUrl ? [imageUrl] : [],
          },
          // SECURE: Use DB price * 100 for cents
          unit_amount: Math.round(dbProduct.base_price * 100), 
        },
        quantity: item.quantity,
      }
    })

    // 3. Create a "Pending" Order in Supabase BEFORE going to Stripe
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

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add more countries as needed
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnUrl || '/products'}`, // Redirect back to where they came from
      metadata: {
        orderId: order.id, // CRITICAL: Link Stripe to our DB Order
        uploadToken: uploadToken
      },
    })

    // 5. Return the URL so the frontend can redirect the user
    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
