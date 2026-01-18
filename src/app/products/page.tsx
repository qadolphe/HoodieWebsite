'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/ProductCard'
import SkeletonCard from '@/components/SkeletonCard'
import { KIT_SLUGS, SERVICE_SLUGS } from '@/lib/constants'

export default function ProductsPage() {
    const { products, loading } = useProducts([...KIT_SLUGS, ...SERVICE_SLUGS])

    const [focusedCardId, setFocusedCardId] = useState<string | null>(null)
    const observerRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        if (loading || products.length === 0) return

        const options = {
            root: null,
            rootMargin: '-45% 0px -45% 0px',
            threshold: 0
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setFocusedCardId(entry.target.getAttribute('data-id'))
                }
            })
        }, options)

        setTimeout(() => {
            observerRefs.current.forEach((ref) => {
                if (ref) observer.observe(ref)
            })
        }, 100)

        return () => observer.disconnect()
    }, [loading, products])

    return (
        <div className={styles.container}>

            {/* Header Section */}
            <section className={styles.headerSection}>
                <span className={styles.subHeader}>Full Catalog</span>
                <h1 className={styles.pageTitle}>Shop All Options</h1>
                <p className={styles.description}>
                    Choose the method that works best for your time and budget.
                </p>
            </section>

            {/* Products Grid Section */}
            <section className={styles.productsSection}>
                <div className={`${styles.cardContainer} product-card-container`}>
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        products.map((item, index) => {
                            // --- LOCAL OVERRIDE ---
                            let overrideTitle
                            let overrideDescription
                            let overrideButtonText
                            let overrideLink

                            if (item.slug === 'the-refill-kit-satin-only') {
                                overrideTitle = 'DIY Kits'
                                overrideDescription = 'Everything you need to sew it yourself. Kits include fabric, thread, and guides.'
                                overrideButtonText = 'Shop Kits'
                                overrideLink = '/products/kits'
                            }

                            return (
                                <ProductCard
                                    key={item.id}
                                    product={item}
                                    isActive={focusedCardId === item.id}
                                    innerRef={(el) => { observerRefs.current[index] = el }}
                                    overrideTitle={overrideTitle}
                                    overrideDescription={overrideDescription}
                                    overrideButtonText={overrideButtonText}
                                    overrideLink={overrideLink}
                                />
                            )
                        })
                    )}
                </div>
            </section>
        </div>
    )
}