'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import Footer from '@/components/Footer'

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

export default function Home() {
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null)
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])

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
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/essentials-kit.jpg" // Using an existing image as placeholder
            alt="Satin Lined Hoodie"
            fill
            className={styles.heroImage}
            quality={90}
            priority
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Protect Your Hair.<br />Elevate Your Style.
          </h1>
          <p className={styles.heroSubtitle}>
            The premium satin lining solution for your favorite hoodies.
            Prevent breakage, retain moisture, and look good doing it.
          </p>

          <div className={styles.forkContainer}>
            <Link href="/products/kits" className={styles.primaryButton}>
              Shop DIY Kits
            </Link>
            <Link href="/services/mail-in" className={styles.secondaryButton}>
              How Mail-In Works
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>Why Satin?</h2>
        <div className={styles.benefitsGrid}>
          {/* Main Benefit - Large Card */}
          <div className={`${styles.benefitCard} ${styles.largeCard}`}>
            <span className={styles.benefitIcon}>✨</span>
            <h3 className={styles.benefitTitle}>Hair Health</h3>
            <p className={styles.benefitDescription}>
              Satin reduces friction by up to 90% compared to cotton, preventing breakage, split ends, and frizz while retaining your hair's natural moisture.
            </p>
          </div>

          {/* Secondary Benefit */}
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>🛡️</span>
            <h3 className={styles.benefitTitle}>Protection</h3>
            <p className={styles.benefitDescription}>
              Protect your curls, braids, and waves from the harsh texture of standard hoodies.
            </p>
          </div>

          {/* Tertiary Benefit */}
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>💎</span>
            <h3 className={styles.benefitTitle}>Premium Feel</h3>
            <p className={styles.benefitDescription}>
              Add a touch of luxury to your everyday wear with our high-quality, silky smooth satin.
            </p>
          </div>
        </div>
      </section>

      {/* Product Intro Section */}
      <section className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>Choose Your Upgrade</h2>
        <div className={styles.cardContainer}>
          {PRODUCTS.map((item, index) => (
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
      </section>

      {/* Footer inside the container */}
      <div className={styles.footerSnapWrapper}>
        <Footer />
      </div>
    </div>
  )
}
