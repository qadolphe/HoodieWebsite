// hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Centralize your UI Config here
const UI_CONFIG: Record<string, any> = {
    'essentials-kit': {
        buttonText: 'Shop Kits',
        linkPrefix: '/products',
        features: ['Premium Satin Fabric', 'Color-Matched Thread', 'Step-by-Step Guide']
    },
    'mail-in-service': {
        buttonText: 'Start Service',
        linkPrefix: '/services',
        features: ['Professional Sewing', '2-Way Shipping Included', 'Fast Turnaround']
    },
    'concierge': {
        buttonText: 'Join Waitlist',
        linkPrefix: '/services',
        features: ['Brand New Hoodie', 'Custom Satin Lining', 'Delivered to Your Door']
    },
    'default': {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['High Quality', 'Satisfaction Guaranteed']
    }
}

export function useProducts(slugs?: string[]) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProducts() {
            try {
                let query = supabase
                    .from('products')
                    .select('*')
                    .order('base_price', { ascending: true })

                // If slugs are provided, filter by them
                if (slugs && slugs.length > 0) {
                    query = query.in('slug', slugs)
                }

                const { data, error } = await query

                if (error) throw error

                // Map the UI Config directly into the product object
                // This makes the data easier to use in your components
                if (data) {
                    const enhancedData = data.map(product => ({
                        ...product,
                        ui: UI_CONFIG[product.slug] || UI_CONFIG['default'],
                        displayPrice: product.type === 'kit'
                            ? `Starting from $${product.base_price}`
                            : `$${product.base_price}`
                    }))
                    setProducts(enhancedData)
                }
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [JSON.stringify(slugs)]) // Re-run if slugs array changes

    return { products, loading }
}