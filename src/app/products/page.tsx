'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/ProductCard'
import SkeletonCard from '@/components/SkeletonCard'
import { HOME_FEATURED_IDS, PRODUCT_IDS } from '@/lib/constants'

export default function ProductsPage() {
    const { products, loading } = useProducts(HOME_FEATURED_IDS)

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
                <span className={styles.subHeader}>Choose Your Upgrade</span>
                <h1 className={styles.pageTitle}>The Premium Collection</h1>
                <p className={styles.description}>
                    From DIY kits to full white-glove service.
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

                            if (item.id === PRODUCT_IDS.REFILL_KIT) {
                                overrideTitle = 'DIY Kits'
                                overrideDescription = 'Everything you need to sew it yourself. Kits include fabric, thread, and guides.'
                                overrideButtonText = 'Shop Kits'
                                overrideLink = '/products/kits'
                            } else if (item.id === PRODUCT_IDS.MAIL_IN_SERVICE) {
                                overrideTitle = 'Mail-In'
                                overrideDescription = 'Send us your favorite hoodie, and we\'ll professionally line it with premium satin.'
                                overrideButtonText = 'How it Works'
                                overrideLink = '/services/standard-mail-in-service'
                            } else if (item.id === PRODUCT_IDS.CONCIERGE_SERVICE) {
                                overrideTitle = 'Concierge'
                                overrideDescription = 'Don\'t have a hoodie? We\'ll buy one for you, line it, and ship the finished piece.'
                                overrideButtonText = 'Join Waitlist'
                                overrideLink = '/services/concierge-service'
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