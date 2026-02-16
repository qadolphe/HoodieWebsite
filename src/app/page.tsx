'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/ProductCard'
import { HOME_FEATURED_IDS, PRODUCT_IDS } from '@/lib/constants'

export default function Home() {
  const { products, loading } = useProducts(HOME_FEATURED_IDS)

  const [focusedCardId, setFocusedCardId] = useState<string | null>(null)
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])

  // OBSERVER
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
      {/* Hero Section... (Keep your existing Hero code) */}
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
          <h1 className={styles.heroTitle}>Protect Your Hair.<br />Elevate Your Style.</h1>
          <p className={styles.heroSubtitle}>The premium satin lining solution for your favorite hoodies.</p>
          <div className={styles.forkContainer}>
            <Link href="/products/kits" className={styles.primaryButton}>Shop DIY Kits</Link>
            <Link href="/services/standard-mail-in-service" className={styles.secondaryButton}>How Mail-In Works</Link>
          </div>
        </div>
      </section>

      {/* Benefits Section... (Keep your existing Benefits code) */}
      <section className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>Why Satin?</h2>
        <div className={styles.benefitsGrid}>
          {/* ... benefits cards ... */}
          <div className={`${styles.benefitCard} ${styles.largeCard}`}>
            <div className={styles.cardBackground}>
              <Image
                src="/images/coily-hair-hood-down.png"
                alt="Hair Health"
                fill
                className={styles.cardImage}
                quality={80}
              />
              <div className={styles.cardOverlay} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.benefitTitle}>Hair Health</h3>
              <p className={styles.benefitDescription}>Satin reduces friction by up to 90%.</p>
            </div>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.cardBackground}>
              <Image
                src="/images/curly-hair-hood-up.png"
                alt="Protection"
                fill
                className={styles.cardImage}
                quality={80}
              />
              <div className={styles.cardOverlay} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.benefitTitle}>Protection</h3>
              <p className={styles.benefitDescription}>Protect your curls from harsh textures.</p>
            </div>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.cardBackground}>
              <Image
                src="/images/hoodie-close-up.png"
                alt="Premium Feel"
                fill
                className={styles.cardImage}
                quality={80}
              />
              <div className={styles.cardOverlay} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.benefitTitle}>Premium Feel</h3>
              <p className={styles.benefitDescription}>Add a touch of luxury to everyday wear.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Intro Section */}
      <section className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>Choose Your Upgrade</h2>

        {loading ? (
          <div style={{ color: '#fff', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div className={`${styles.cardContainer} product-card-container`}>
            {products.map((item, index) => {
              // --- LOCAL OVERRIDE FOR LANDING PAGE ---
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
            })}
          </div>
        )}
      </section>
    </div>
  )
}