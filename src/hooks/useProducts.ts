import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// CONFIG: Map slugs to marketing assets
const UI_CONFIG: Record<string, any> = {
    // KITS
    'refill-kit': {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['Satin Fabric Sheet', 'Pattern Guide', 'Best for Experts']
    },
    'essentials-kit': {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['Premium Satin Fabric', 'Color-Matched Thread', 'Step-by-Step Guide']
    },
    'all-in-one-kit': {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['Handheld Sewing Machine', 'Essentials Kit Included', 'Complete Beginner Set']
    },

    // SERVICES
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

    // FALLBACK
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

                if (slugs && slugs.length > 0) {
                    query = query.in('slug', slugs)
                }

                const { data, error } = await query
                if (error) throw error

                if (data) {
                    const enhancedData = data.map(product => {
                        const config = UI_CONFIG[product.slug] || UI_CONFIG['default']

                        return {
                            ...product,
                            ui: config,
                            // Default to DB data (unless manually overridden in component)
                            name: product.name,
                            description: product.description,
                            slug: product.slug,

                            // Format Price
                            displayPrice: product.type === 'kit'
                                ? `Starting from $${product.base_price}`
                                : `$${product.base_price}`
                        }
                    })
                    setProducts(enhancedData)
                }
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [JSON.stringify(slugs)])

    return { products, loading }
}