'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

const UI_CONFIG: Record<string, any> = {
  'essentials-kit': {
    buttonText: 'Shop Kits',
    linkPrefix: '/products',
    features: ['Premium Satin Fabric', 'Color-Matched Thread', 'Step-by-Step Guide']
  },
  'mail-in-service': {
    buttonText: 'Start Service',
    linkPrefix: '/services',
    features: ['Professional Sewing', '2-Way Shipping Included', 'Fast Turnaround']
  },
  'all-in-one-kit': {
    buttonText: 'View Details',
    linkPrefix: '/products',
    features: ['Machine Included', 'Complete Beginner Set', 'Free Shipping']
  },
  'concierge': {
    buttonText: 'Join Waitlist',
    linkPrefix: '/services',
    features: ['Brand New Hoodie', 'Custom Satin Lining', 'Delivered to Your Door']
  },
  'default': {
    buttonText: 'View Details',
    linkPrefix: '/products',
    features: ['High Quality', 'Satisfaction Guaranteed']
  }
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null)
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])

  // 1. FETCH DATA FROM SUPABASE
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          // Filter for the specific products you want on the homepage
          .in('slug', ['essentials-kit', 'mail-in-service', 'concierge'])
          .order('base_price', { ascending: true })

        if (error) throw error
        if (data) setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // 2. SCROLL OBSERVER (Mobile Focus Logic)
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

    // Slight delay to ensure DOM is ready
    setTimeout(() => {
      observerRefs.current.forEach((ref) => {
        if (ref) observer.observe(ref)
      })
    }, 100)

    return () => observer.disconnect()
  }, [loading, products])

  // Helper to format price text
  const getPriceDisplay = (product: any) => {
    if (product.type === 'kit') {
      return `Starting from $${product.base_price}`
    }
    return `$${product.base_price}`
  }

  return (
    <div className={styles.container}>
      {/* Hero Section (Static) */}
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

      {/* Benefits Section (Static) */}
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

      {/* Product Intro Section (Dynamic from Supabase) */}
      <section className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>Choose Your Upgrade</h2>
        <div className={styles.cardContainer}>
          {products.map((item, index) => {
            const config = UI_CONFIG[item.slug] || UI_CONFIG['default']

            return (
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
                  <div className={styles.expandedContent}>
                    <ul className={styles.featureList}>
                      {config.features.map((feature: string, i: number) => (
                        <li key={i} className={styles.featureItem}>
                          <span className={styles.checkIcon}>✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    <div className={styles.productPrice}>
                      {getPriceDisplay(item)}
                    </div>
                    <Link
                      href={`${config.linkPrefix}/${item.slug}`}
                      className={styles.productLink}
                    >
                      {config.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}