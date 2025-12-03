import Link from 'next/link'
import styles from './page.module.css'

export default function ConciergePage() {
    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <Link href="/products" className={styles.backLink}>
                        ← Back to Shop
                    </Link>
                    <h1 className={styles.title}>The Concierge Service</h1>
                    <p className={styles.description}>
                        Don't have a hoodie? We'll buy one for you, line it with premium satin, and ship the finished masterpiece to your door.
                    </p>
                </div>

                <div className={styles.waitlistCard}>
                    <h2 className={styles.cardTitle}>Coming Soon</h2>
                    <p className={styles.cardDescription}>
                        We are currently finalizing our partnerships with major hoodie brands. Join the waitlist to be the first to know when this service launches.
                    </p>
                    <div className={styles.form}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className={styles.input}
                        />
                        <button className={styles.button}>
                            Join Waitlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
