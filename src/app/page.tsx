import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import ProductAccordion from '@/components/ProductAccordion'
import Footer from '@/components/Footer'

export default function Home() {
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
        <div className={styles.productsGrid}>
          <ProductAccordion />
        </div>
      </section>

      {/* Footer inside the container */}
      <div className={styles.footerSnapWrapper}>
        <Footer />
      </div>
    </div>
  )
}
