import Link from 'next/link'
import styles from './page.module.css'
import { swat, mapSDKProduct } from '@/lib/swatbloc'
import { Product } from '@/types'
import AddToCartButton from '@/components/AddToCartButton'

async function getProduct(): Promise<Product | null> {
    try {
        const data: any = await swat.products.get('mail-in-service')
        return mapSDKProduct(data) as Product
    } catch (error) {
        console.error('Error fetching mail-in-service product:', error)
        return null
    }
}

export default async function MailInServicePage() {
    const product = await getProduct()

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
