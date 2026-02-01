import Link from 'next/link'
import styles from './page.module.css'
import { swat, mapSDKProduct } from '@/lib/swatbloc'
import { Product } from '@/types'
import AddToCartButton from '@/components/AddToCartButton'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
    try {
        const data: any = await swat.products.get(slug)
        return mapSDKProduct(data) as Product
    } catch (error) {
        console.error(`Error fetching service product (${slug}):`, error)
        return null
    }
}

export default async function ServiceDetailPage({ params }: Props) {
    const { slug } = await params
    
    // Normalize slug for view selection
    const isConcierge = slug.includes('concierge')
    const isMailIn = slug.includes('mail-in')
    
    const product = await getProduct(slug)

    if (!product && !isConcierge) {
        // Concierge might not be in DB yet or we show waitlist anyway
        // But for others, if not in DB, 404
        if (!isMailIn) notFound()
    }

    if (isConcierge) {
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

    // Default to Mail-In view for mail-in slugs
    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <Link href="/products" className={styles.backLink}>
                        ← Back to Shop
                    </Link>
                    <span className={styles.subHeader}>The Premium Experience</span>
                    <h1 className={styles.title}>{product?.name ?? 'Mail-in Service'}</h1>
                    <p className={styles.description}>
                        {product?.description ?? "Don't have the time or tools? Send us your hoodie, and we'll professionally line it with our premium satin."}
                    </p>
                </div>

                <div className={styles.stepsContainer}>
                    <div className={styles.stepCard}>
                        <span className={styles.stepNumber}>1</span>
                        <h3 className={styles.stepTitle}>We Send a Box</h3>
                        <p className={styles.stepDescription}>You receive a premium, flat-packed custom box with a pre-paid return label.</p>
                    </div>
                    <div className={styles.stepCard}>
                        <span className={styles.stepNumber}>2</span>
                        <h3 className={styles.stepTitle}>You Pack It</h3>
                        <p className={styles.stepDescription}>Pack your hoodie and drop it off. We handle the shipping logistics.</p>
                    </div>
                    <div className={styles.stepCard}>
                        <span className={styles.stepNumber}>3</span>
                        <h3 className={styles.stepTitle}>We Upgrade It</h3>
                        <p className={styles.stepDescription}>Our experts line your hood with your chosen satin and ship it back to you.</p>
                    </div>
                </div>

                <div className={styles.ctaSection}>
                    <h2 className={styles.ctaTitle}>Ready to Upgrade?</h2>
                    <div className={styles.price}>
                        ${product?.base_price ?? '45.00'} <span className={styles.priceNote}>(Includes 2-way shipping)</span>
                    </div>
                    {product ? (
                        <AddToCartButton
                            product={product}
                            className={styles.button}
                        />
                    ) : (
                        <button className={styles.button} disabled>
                            Unavailable
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
