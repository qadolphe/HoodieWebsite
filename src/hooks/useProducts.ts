'use client'

import { useState, useEffect } from 'react'
import { swat, mapSDKProduct } from '@/lib/swatbloc'

const UI_CONFIG: Record<string, any> = {
    // KITS
    'the-refill-kit-satin-only': {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['Satin Fabric Sheet', 'Pattern Guide', 'Best for Experts']
    },
    'the-essentials-kit': {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['Premium Satin Fabric', 'Color-Matched Thread', 'Step-by-Step Guide']
    },
    'the-all-in-one-kit': {
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
                // Fetch products from SwatBloc SDK
                const data: any[] = await swat.products.list()

                if (data) {
                    // Filter by slugs if provided
                    let filteredData = slugs && slugs.length > 0
                        ? data.filter((p: any) => slugs.includes(p.slug))
                        : data

                    // ENHANCE the data with UI config
                    let processedData = filteredData.map((product: any) => {
                        const mapped = mapSDKProduct(product)
                        const config = UI_CONFIG[product.slug] || UI_CONFIG['default']

                        return {
                            ...mapped,
                            ui: config,
                            displayPrice: mapped?.type === 'kit'
                                ? `Starting from $${mapped.base_price}`
                                : `$${mapped.base_price}`
                        }
                    })

                    // Sort by slug order if slugs provided
                    if (slugs && slugs.length > 0) {
                        processedData = processedData.sort((a: any, b: any) => {
                            return slugs.indexOf(a.slug) - slugs.indexOf(b.slug)
                        })
                    }

                    setProducts(processedData)
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