'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import styles from './page.module.css'
import { Check } from 'lucide-react'

export default function KitsPage() {
    // 1. Fetch the 3 specific kits
    const { products, loading } = useProducts(['refill-kit', 'essentials-kit', 'all-in-one-kit'])

    // 2. Focus Observer
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

    if (loading) return <div className={styles.loadingState}>Loading...</div>

    return (
        <div className={styles.container}>

            {/* Header */}
            <section className={styles.headerSection}>
                <Link href="/products" className={styles.backLink}>
                    ← Back to Shop
                </Link>
                <h1 className={styles.pageTitle}>DIY Kits</h1>
                <p className={styles.description}>
                    Everything you need to upgrade your hoodie yourself.
                </p>
            </section>

            {/* Cards */}
            <section className={styles.productsSection}>
                <div className={styles.cardContainer}>
                    {products.map((item, index) => (
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
                                        priority={index === 0}
                                    />
                                )}
                                <div className={styles.gradientOverlay} />
                            </div>

                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{item.name}</h3>
                                <p className={styles.productDesc}>{item.description}</p>

                                <div className={styles.productPrice}>
                                    {/* Kits usually have fixed prices, but we keep the logic consistent */}
                                    ${item.base_price}
                                </div>

                                <div className={styles.expandedContent}>
                                    <ul className={styles.featureList}>
                                        {item.ui.features.map((feature: string, i: number) => (
                                            <li key={i} className={styles.featureItem}>
                                                <Check size={16} className={styles.checkIcon} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={`${item.ui.linkPrefix}/${item.slug}`}
                                        className={styles.productLink}
                                    >
                                        {item.ui.buttonText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}