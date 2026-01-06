'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import styles from './page.module.css'
import ProductCard from '@/components/ProductCard'
import SkeletonCard from '@/components/SkeletonCard'

export default function KitsPage() {
    // 1. Fetch the 3 specific kits
    const { products, loading } = useProducts(['the-refill-kit-satin-only', 'the-essentials-kit', 'the-all-in-one-kit'])

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

    return (
        <div className={styles.container}>

            {/* Header Section */}
            <section className={styles.headerSection}>
                <Link href="/products" className={styles.backLink}>
                    ← Back to Shop
                </Link>
                <h1 className={styles.pageTitle}>DIY Kits</h1>
                <p className={styles.description}>
                    Everything you need to upgrade your hoodie yourself.
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
                            return (
                                <ProductCard
                                    key={item.id}
                                    product={item}
                                    isActive={focusedCardId === item.id}
                                    innerRef={(el) => { observerRefs.current[index] = el }}
                                />
                            )
                        })
                    )}
                </div>
            </section>
        </div>
    )
}