export interface Product {
    id: string
    name: string
    description: string | null
    base_price: number
    type: 'kit' | 'service'
    image_url: string | null
    slug: string
    created_at: string
    ui?: {
        buttonText: string
        linkPrefix: string
        features: string[]
    }
}

export interface ProductVariant {
    id: string
    product_id: string
    name: string
    price_adjustment: number
    sku: string | null
    stock_quantity: number
    created_at: string
}
