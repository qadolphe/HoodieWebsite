'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'
import { Check } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'

export default function ProductsPage() {
    // 2. Use the hook (Pass the slugs you want, or leave empty for all)
    const { products, loading } = useProducts(['refill-kit', 'mail-in-service', 'concierge'])

    // Observer Logic (Visual Only)
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

    useEffect(() => {
        if (loading || products.length === 0) return

        const options = {
            root: null,
            rootMargin: '-45% 0px -45% 0px', // Center line focus
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

    // Helper: Price Display
    const getPriceDisplay = (product: any) => {
        if (product.type === 'kit') return `Starting from $${product.base_price}`
        return `$${product.base_price}`
    }

    if (loading) return <div className={styles.loadingState}>Loading...</div>

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
                <div className={styles.cardContainer}>
                    {products.map((item, index) => {
                        const config = item.ui

                        // --- LOCAL OVERRIDE ---
                        let displayTitle = item.name
                        let displayDesc = item.description
                        let displayButton = config.buttonText
                        let displayLink = `${config.linkPrefix}/${item.slug}`

                        if (item.slug === 'refill-kit') {
                            displayTitle = 'DIY Kits'
                            displayDesc = 'Everything you need to sew it yourself. Kits include fabric, thread, and guides.'
                            displayButton = 'Shop Kits'
                            displayLink = '/products/kits'
                        }

                        return (
                            <div
                                key={item.id}
                                ref={(el) => { observerRefs.current[index] = el }}
                                data-id={item.id}
                                className={`
                                    ${styles.card} 
                                    ${focusedCardId === item.id ? styles.focused : ''}
                                `}
                            >
                                <div className={styles.backgroundImageContainer}>
                                    {item.image_url && (
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            className={styles.backgroundImage}
                                            quality={90}
                                        />
                                    )}
                                    <div className={styles.gradientOverlay} />
                                </div>

                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{displayTitle}</h3>
                                    <p className={styles.productDesc}>{displayDesc}</p>

                                    {/* Price - Always Visible */}
                                    <div className={styles.productPrice}>
                                        {getPriceDisplay(item)}
                                    </div>

                                    <div className={styles.expandedContent}>
                                        <ul className={styles.featureList}>
                                            {config.features.map((feature: string, i: number) => (
                                                <li key={i} className={styles.featureItem}>
                                                    <Check size={16} className={styles.checkIcon} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={displayLink}
                                            className={styles.productLink}
                                        >
                                            {displayButton}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}