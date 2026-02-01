'use client'

import { useState, useEffect } from 'react'
import { swat, mapSDKProduct } from '@/lib/swatbloc'
import { PRODUCT_IDS } from '@/lib/constants'

const UI_CONFIG: Record<string, any> = {
    // KITS
    [PRODUCT_IDS.REFILL_KIT]: {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['Satin Fabric Sheet', 'Pattern Guide', 'Best for Experts']
    },
    [PRODUCT_IDS.ESSENTIALS_KIT]: {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['Premium Satin Fabric', 'Color-Matched Thread', 'Step-by-Step Guide']
    },
    [PRODUCT_IDS.ALL_IN_ONE_KIT]: {
        buttonText: 'View Details',
        linkPrefix: '/products',
        features: ['Handheld Sewing Machine', 'Essentials Kit Included', 'Complete Beginner Set']
    },

    // SERVICES
    [PRODUCT_IDS.MAIL_IN_SERVICE]: {
        buttonText: 'Start Service',
        linkPrefix: '/services',
        features: ['Professional Sewing', '2-Way Shipping Included', 'Fast Turnaround']
    },
    [PRODUCT_IDS.CONCIERGE_SERVICE]: {
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

export function useProducts(ids?: string[]) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProducts() {
            try {
                // Fetch products from SwatBloc SDK
                const data: any[] = await swat.products.list()

                if (data) {
                    // Filter by IDs if provided
                    let filteredData = ids && ids.length > 0
                        ? data.filter((p: any) => ids.includes(p.id))
                        : data

                    // ENHANCE the data with UI config
                    let processedData = filteredData
                        .map((product: any) => {
                            const mapped = mapSDKProduct(product)
                            if (!mapped) return null
                            
                            const config = UI_CONFIG[product.id] || UI_CONFIG['default']

                            return {
                                ...mapped,
                                ui: config,
                                displayPrice: mapped.type === 'kit'
                                    ? `Starting from $${mapped.base_price}`
                                    : `$${mapped.base_price}`
                            }
                        })
                        .filter((p): p is NonNullable<typeof p> => p !== null)

                    // De-duplicate by ID (just in case)
                    processedData = Array.from(new Map(processedData.map(p => [p.id, p])).values())

                    // Sort by original ID order if provided
                    if (ids && ids.length > 0) {
                        processedData = processedData.sort((a: any, b: any) => {
                            return ids.indexOf(a.id) - ids.indexOf(b.id)
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
    }, [JSON.stringify(ids)])

    return { products, loading }
}