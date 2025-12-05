'use client'

import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import Footer from '@/components/Footer'
import styles from './page.module.css'


async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'kit')
        .order('base_price', { ascending: true })

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data as Product[]
}

export default function KitsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [focusedCardId, setFocusedCardId] = useState<string | null>(null)
    const observerRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        getProducts().then(setProducts)
    }, [])

    useEffect(() => {
        const options = {
            root: null,
            threshold: 0.4 // Focus when 40% visible
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setFocusedCardId(entry.target.getAttribute('data-id'))
                }
            })
        }, options)

        observerRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })

        return () => observer.disconnect()
    }, [products])

    return (
        <div className={styles.container}>

            {/* Header Section */}
            <div className={styles.headerSlide}>
                <div className={styles.headerContent}>
                    <Link href="/products" className={styles.backLink}>
                        ← Back to Shop
                    </Link>
                    <h1 className={styles.title}>DIY Kits</h1>
                    <p className={styles.description}>
                        Everything you need to upgrade your hoodie.
                    </p>
                </div>
            </div>

            {/* Cards Section */}
            <div className={styles.cardContainer}>
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        ref={(el) => { observerRefs.current[index] = el }}
                        data-id={product.id}
                        className={`
                            ${styles.card} 
                            ${focusedCardId === product.id ? styles.focused : ''}
                        `}
                    >
                        <div className={styles.backgroundImageContainer}>
                            {product.image_url && (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className={styles.backgroundImage}
                                    quality={90}
                                />
                            )}
                            <div className={styles.gradientOverlay} />
                        </div>

                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>{product.name}</h2>
                            <p className={styles.cardDescription}>{product.description}</p>

                            <div className={styles.expandedContent}>
                                <span className={styles.price}>${product.base_price}</span>
                                <Link href={`/products/${product.slug}`} className={styles.button}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Section */}
            <div className={styles.footerSlide}>
                <Footer />
            </div>
        </div>
    )
}
