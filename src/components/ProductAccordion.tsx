'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './ProductAccordion.module.css'

const PRODUCTS = [
    {
        id: 'kits',
        title: 'DIY Kits',
        description: 'Everything you need to sew it yourself.',
        image: '/images/essentials-kit.jpg',
        link: '/products/kits',
        buttonText: 'Shop Kits',
        features: ['Premium Satin Fabric', 'Color-Matched Thread', 'Step-by-Step Guide']
    },
    {
        id: 'mail-in',
        title: 'Mail-In Service',
        description: 'Send us your hoodie, we\'ll do the work.',
        image: '/images/mail-in-service.jpg',
        link: '/services/mail-in',
        buttonText: 'Start Service',
        features: ['Professional Sewing', '2-Way Shipping Included', 'Fast Turnaround']
    },
    {
        id: 'concierge',
        title: 'Concierge',
        description: 'We buy the hoodie and line it for you.',
        image: '/images/all-in-one-kit.jpg',
        link: '/services/concierge',
        buttonText: 'Join Waitlist',
        features: ['Brand New Hoodie', 'Custom Satin Lining', 'Delivered to Your Door']
    }
]

export default function ProductAccordion() {
    const [focusedCardId, setFocusedCardId] = useState<string | null>(null)
    const observerRefs = useRef<(HTMLDivElement | null)[]>([])

    // HOVER STATE (Desktop)
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)

    // MOTION STATE (Tracks if the CSS transition is currently running)
    const [isAnimating, setIsAnimating] = useState(false)
    const animationTimeout = useRef<NodeJS.Timeout | null>(null)

    // Trigger the animation timer
    const triggerAnimation = () => {
        setIsAnimating(true)
        if (animationTimeout.current) clearTimeout(animationTimeout.current)
        // Match this to your CSS transition duration (0.6s)
        animationTimeout.current = setTimeout(() => {
            setIsAnimating(false)
        }, 600)
    }

    const handleMouseEnter = (id: string) => {
        if (hoveredCardId === id) return
        setHoveredCardId(id)
        triggerAnimation()
    }

    const handleContainerLeave = () => {
        setHoveredCardId(null)
        triggerAnimation()
    }

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
    }, [])

    return (
        <div
            className={`${styles.cardContainer} ${isAnimating ? styles.animating : ''}`}
            onMouseLeave={handleContainerLeave}
        >
            {PRODUCTS.map((item, index) => (
                <div
                    key={item.id}
                    ref={(el) => { observerRefs.current[index] = el }}
                    data-id={item.id}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    className={`
                        ${styles.card} 
                        ${focusedCardId === item.id ? styles.focused : ''}
                    `}
                >
                    <div className={styles.backgroundImageContainer}>
                        <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className={styles.backgroundImage}
                            quality={90}
                        />
                        <div className={styles.gradientOverlay} />
                    </div>

                    <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                        <p className={styles.productDesc}>{item.description}</p>

                        <div className={styles.expandedContent}>
                            <ul className={styles.featureList}>
                                {item.features.map((feature, i) => (
                                    <li key={i} className={styles.featureItem}>
                                        <span className={styles.checkIcon}>✓</span> {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link href={item.link} className={styles.productLink}>
                                {item.buttonText}
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
