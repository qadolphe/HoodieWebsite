'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
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
        description: 'I don\'t have a hoodie. Buy one for me and line it.',
        price: 'Cost of Hoodie + $50',
        image: '/images/all-in-one-kit.jpg',
        link: '/services/concierge',
        buttonText: 'Order Custom'
    }
]

export default function ProductsPage() {
    const [activeCardId, setActiveCardId] = useState<string | null>(null)
    const observerRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '-40% 0px -40% 0px', // Focus on the center 20% of the screen
            threshold: 0
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveCardId(entry.target.getAttribute('data-id'))
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
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <span className={styles.subHeader}>Choose Your Path</span>
                    <h1 className={styles.title}>Shop Satin</h1>
                    <p className={styles.description}>
                        Whether you want to DIY or have it done for you, we've got you covered.
                    </p>
                </div>

                <div className={styles.cardContainer}>
                    {MAIN_OFFERINGS.map((item, index) => (
                        <div
                            key={item.id}
                            ref={(el) => { observerRefs.current[index] = el }}
                            data-id={item.id}
                            className={`${styles.card} ${activeCardId === item.id ? styles.active : ''}`}
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
                                <h2 className={styles.cardTitle}>{item.title}</h2>
                                <p className={styles.cardDescription}>{item.description}</p>

                                <div className={styles.cardFooter}>
                                    <div>
                                        <span className={styles.priceLabel}>Starting at</span>
                                        <span className={styles.price}>{item.price}</span>
                                    </div>
                                    <Link href={item.link} className={styles.button}>
                                        {item.buttonText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
