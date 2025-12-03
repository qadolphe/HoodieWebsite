import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import styles from './page.module.css'

export const revalidate = 60

interface Props {
    params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error || !data) {
        return null
    }

    return data as Product
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
                    <Link href="/products/kits" className={styles.backLink}>
                        ← Back to Kits
                    </Link>

                    <h1 className={styles.title}>{product.name}</h1>
                    <p className={styles.price}>${product.base_price}</p>

                    <div className={styles.description}>
                        <p>{product.description}</p>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.addToCartButton}>
                            Add to Cart
                        </button>
                        <p className={styles.secureText}>
                            Secure checkout powered by Stripe
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
