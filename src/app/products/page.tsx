'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import Footer from '@/components/Footer'
import styles from './page.module.css'

const MAIN_OFFERINGS = [
    {
        id: 'kits',
        title: 'DIY Kits',
        description: 'I have a hoodie, I just need the materials.',
        price: 'From $24.99',
        image: '/images/essentials-kit.jpg',
        link: '/products/kits',
        buttonText: 'Shop Kits'
    },
    {
        id: 'mail-in',
        title: 'Mail-In Service',
        description: 'I have a hoodie, but I want you to sew it.',
        price: '$45.00',
        image: '/images/mail-in-service.jpg',
        link: '/services/mail-in',
        buttonText: 'Start Service'
    },
    {
        id: 'concierge',
        title: 'Buy Hoodie + Service',
        description: "I don't have a hoodie. Buy one for me and line it.",
        price: 'Cost of Hoodie + $50',
        image: '/images/all-in-one-kit.jpg',
        link: '/services/concierge',
        buttonText: 'Order Custom'
    }
]

export default function ProductsPage() {
    // SCROLL STATE (Mobile)
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

    // JITTER FIX: SCROLL OBSERVER
    useEffect(() => {
        const options = {
            root: null,
            threshold: 0.4
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
        <div className={styles.container}>

            <div className={styles.headerSlide}>
                <div className={styles.headerContent}>
                    <span className={styles.subHeader}>Choose Your Path</span>
                    <h1 className={styles.title}>Shop Satin</h1>
                    <p className={styles.description}>
                        Whether you want DIY or have it done for you, we've got you covered.
                    </p>
                </div>
            </div>

            <div
                // Apply 'animating' class to container while transition is active
                className={`${styles.cardContainer} ${isAnimating ? styles.animating : ''}`}
                onMouseLeave={handleContainerLeave}
            >
                {MAIN_OFFERINGS.map((item, index) => (
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
                                priority={index === 0}
                            />
                            <div className={styles.gradientOverlay} />
                        </div>

                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>{item.title}</h2>
                            <p className={styles.cardDescription}>{item.description}</p>

                            <div className={styles.expandedContent}>
                                <span className={styles.price}>{item.price}</span>
                                <Link href={item.link} className={styles.button}>
                                    {item.buttonText}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.footerSlide}>
                <Footer />
            </div>
        </div>
    )
}
