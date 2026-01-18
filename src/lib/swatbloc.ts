import { SwatBloc } from '@swatbloc/sdk'

// Initialize with public API key from environment
const apiKey = process.env.NEXT_PUBLIC_SWATBLOC_KEY

if (!apiKey) {
    console.warn('NEXT_PUBLIC_SWATBLOC_KEY is not set. SDK features will not work.')
}

export const swat = new SwatBloc(apiKey || '')

/**
 * Maps SDK product data to local Product structure
 */
export function mapSDKProduct(data: any) {
    if (!data) return null

    // Price is in cents in SDK, convert to dollars
    const rawPrice = data.price ?? data.base_price ?? 0
    const basePrice = parseFloat((rawPrice / 100).toFixed(2))

    return {
        id: data.id,
        name: data.title, // SDK uses title
        description: data.description,
        base_price: basePrice,
        type: data.category === 'service' ? 'service' : 'kit',
        image_url: data.images?.[0] ?? data.image_url ?? null,
        slug: data.slug,
        created_at: data.created_at
    }
}
