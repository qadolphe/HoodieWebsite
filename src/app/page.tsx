import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

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

          <div className={styles.socialProof}>
            <span className={styles.stars}>★★★★★</span>
            <span>Over 500 hoodies upgraded</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <h2 className={styles.sectionTitle}>Why Satin?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>✨</span>
            <h3 className={styles.benefitTitle}>Hair Health</h3>
            <p className={styles.benefitDescription}>
              Satin reduces friction, preventing breakage and split ends while keeping your hair moisturized.
            </p>
          </div>
          <div className={styles.benefitCard}>
            <span className={styles.benefitIcon}>🛡️</span>
            <h3 className={styles.benefitTitle}>Protection</h3>
            <p className={styles.benefitDescription}>
              Protect your curls, braids, and waves from the harsh cotton of standard hoodies.
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
        <div className={styles.productsGrid}>
          <div className={styles.productCard}>
            <h3 className={styles.productTitle}>DIY Kits</h3>
            <p className={styles.productDesc}>Everything you need to sew it yourself.</p>
            <Link href="/products/kits" className={styles.productLink}>Shop Kits →</Link>
          </div>
          <div className={styles.productCard}>
            <h3 className={styles.productTitle}>Mail-In Service</h3>
            <p className={styles.productDesc}>Send us your hoodie, we'll do the work.</p>
            <Link href="/services/mail-in" className={styles.productLink}>Start Service →</Link>
          </div>
          <div className={styles.productCard}>
            <h3 className={styles.productTitle}>Concierge</h3>
            <p className={styles.productDesc}>We buy the hoodie and line it for you.</p>
            <Link href="/services/concierge" className={styles.productLink}>Join Waitlist →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
