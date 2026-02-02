import { swat, mapSDKProduct } from '@/lib/swatbloc'
import { Product } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import styles from './page.module.css'
import ProductForm from '@/components/ProductForm'

export const revalidate = 60

interface Props {
    params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
    try {
        const data: any = await swat.products.get(slug)
        return mapSDKProduct(data) as Product
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
                        <ProductForm product={product} />
                        <p className={styles.secureText}>
                            Secure checkout powered by SwatBloc
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
