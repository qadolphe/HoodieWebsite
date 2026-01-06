import { swat } from '@/lib/swatbloc'
import { Product } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import styles from './page.module.css'
import AddToCartButton from '@/components/AddToCartButton'

export const revalidate = 60

interface Props {
    params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
    try {
        // SDK returns its own Product type, we map to our local type
        const data: any = await swat.products.get(slug)
        if (!data) return null

        // Map SDK fields to local Product type
        // SDK uses: price, images[], created_at, updated_at
        // Local uses: base_price, image_url, type, created_at
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            base_price: data.price ?? data.base_price,
            type: data.category === 'service' ? 'service' : 'kit',
            image_url: data.images?.[0] ?? data.image_url ?? null,
            slug: data.slug,
            created_at: data.created_at
        }
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) {
        notFound()
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                {/* Mobile Back Link */}
                <div className={styles.mobileBackLink}>
                    <Link href="/products/kits" className={styles.backLink}>
                        ← Back to Kits
                    </Link>
                </div>

                {/* Image Section */}
                <div className={styles.imageContainer}>
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className={styles.productImage}
                            quality={90}
                        />
                    ) : (
                        <div className={styles.noImage}>
                            No Image
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className={styles.detailsContainer}>
                    <div className={styles.desktopBackLink}>
                        <Link href="/products/kits" className={styles.backLink}>
                            ← Back to Kits
                        </Link>
                    </div>

                    <h1 className={styles.title}>{product.name}</h1>
                    <p className={styles.price}>${product.base_price}</p>

                    <div className={styles.description}>
                        <p>{product.description}</p>
                    </div>

                    <div className={styles.actions}>
                        <AddToCartButton
                            product={product}
                            className={styles.addToCartButton}
                        />
                        <p className={styles.secureText}>
                            Secure checkout powered by Stripe
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
