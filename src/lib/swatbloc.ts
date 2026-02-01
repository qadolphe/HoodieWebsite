import { SwatBloc } from '@swatbloc/sdk'
import { Product } from '@/types'

// Initialize with public API key from environment
const apiKey = process.env.NEXT_PUBLIC_SWATBLOC_KEY
const privateKey = process.env.NEXT_PRIVATE_SWATBLOC_KEY

if (!apiKey) {
    console.warn('NEXT_PUBLIC_SWATBLOC_KEY is not set. SDK features will not work.')
}

if (!privateKey) {
    console.warn('NEXT_PRIVATE_SWATBLOC_KEY is not set. Admin operations like order updates will fail.')
}

export const swat = new SwatBloc(apiKey || '')

// Server-side instance with private key capability - REQUIRED for order access
export const swatAdmin = new SwatBloc(privateKey || '')

/**
 * Maps SDK product data to local Product structure
 */
export function mapSDKProduct(data: any): Product | null {
    if (!data) return null

    // Price is in cents in SDK, convert to dollars
    const rawPrice = data.price ?? data.base_price ?? 0
    const basePrice = parseFloat((rawPrice / 100).toFixed(2))

    return {
        id: data.id,
        name: data.title || data.name || 'Untitled Product', 
        description: data.description || '',
        base_price: basePrice,
        type: data.type || (data.category === 'service' ? 'service' : 'kit'),
        image_url: data.images?.[0] || data.image_url || null,
        slug: data.slug || '',
        created_at: data.created_at || new Date().toISOString()
    }
}
