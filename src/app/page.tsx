'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import { Check } from 'lucide-react'
// 1. Import the shared hook
import { useProducts } from '@/hooks/useProducts'

export default function Home() {
  // 2. Use the hook to get data + UI config + formatted prices
  const { products, loading } = useProducts(['refill-kit', 'mail-in-service', 'concierge'])

  const [focusedCardId, setFocusedCardId] = useState<string | null>(null)
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])

  // 3. Scroll Observer (Visual Focus Logic)
  useEffect(() => {
    if (loading || products.length === 0) return

    const options = {
      root: null,
      rootMargin: '-45% 0px -45% 0px', // Center line trigger
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
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/essentials-kit.jpg"
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
          <div className={`${styles.benefitCard} ${styles.largeCard}`}>
            <span className={styles.benefitIcon}>✨</span>
            <h3 className={styles.benefitTitle}>Hair Health</h3>
            <p className={styles.benefitDescription}>
              Satin reduces friction by up to 90% compared to cotton, preventing breakage, split ends, and frizz.
            </p>
          </div>
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>🛡️</span>
            <h3 className={styles.benefitTitle}>Protection</h3>
            <p className={styles.benefitDescription}>
              Protect your curls, braids, and waves from the harsh texture of standard hoodies.
            </p>
          </div>
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

        {loading ? (
          <div style={{ color: '#fff', textAlign: 'center' }}>Loading...</div>
        ) : (
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
                    />
                  )}
                  <div className={styles.gradientOverlay} />
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{item.name}</h3>
                  <p className={styles.productDesc}>{item.description}</p>

                  {/* Price Display (Pre-formatted by hook) */}
                  <div className={styles.productPrice}>
                    {item.displayPrice}
                  </div>

                  <div className={styles.expandedContent}>
                    <ul className={styles.featureList}>
                      {/* Features (Configured in hook) */}
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
        )}
      </section>
    </div>
  )
}