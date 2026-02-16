'use client'

import { useCart } from '@/hooks/useCart'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './CartDrawer.module.css'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AnimatedCounter from './AnimatedCounter'
import { swat } from '@/lib/swatbloc'
import { INSURANCE_VARIANT_IDS, PRODUCT_IDS } from '@/lib/constants'

export default function CartDrawer() {
    const { isOpen, closeCart, items, removeItem, updateQuantity, totalPrice, addItem } = useCart()
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleCheckout = async () => {
        try {
            setIsLoading(true)
            closeCart() // Close the drawer immediately to prevent it from covering success page on specific return flows

            // 1. Create cart via SDK with cart items
            const cartItems = items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                variantId: item.variantId,
                metadata: item.metadata
            }))
            
            const cart = await swat.cart.create(cartItems)

            // 2. Create checkout session via SDK
            // Use current window location as origin for redirects
            const origin = window.location.origin

            const successUrl = `${origin}/order/success?orderId=${cart.id}`
            const cancelUrl = `${origin}${pathname || '/products'}`

            const checkout = await swat.checkout.create(cart.id, {
                successUrl,
                cancelUrl
            })

            // 3. Redirect to checkout
            if (checkout.url) {
                window.location.href = checkout.url
            }
        } catch (error: any) {
            console.error('Error checking out:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const mailInServiceItem = items.find((item) => item.id === PRODUCT_IDS.MAIL_IN_SERVICE)
    const hasInsurance = items.some((item) => item.id === PRODUCT_IDS.MAIL_IN_INSURANCE)

    // Phase 3 requirement: tiering is based on physical cart value
    const physicalCartValueCents = items.reduce((sum, item) => {
        if (item.type !== 'kit') return sum
        return sum + item.price * item.quantity
    }, 0)

    const suggestedInsuranceVariantId = physicalCartValueCents > 5000
        ? INSURANCE_VARIANT_IDS.STANDARD
        : INSURANCE_VARIANT_IDS.BASIC

    const suggestedInsurancePriceCents = suggestedInsuranceVariantId === INSURANCE_VARIANT_IDS.STANDARD ? 800 : 400
    const suggestedInsuranceName = suggestedInsuranceVariantId === INSURANCE_VARIANT_IDS.STANDARD
        ? 'Mail-In Protection (Standard • Up to $100)'
        : 'Mail-In Protection (Basic • Up to $50)'

    const handleAddInsurance = async () => {
        if (!mailInServiceItem) return

        addItem({
            id: PRODUCT_IDS.MAIL_IN_INSURANCE,
            name: suggestedInsuranceName,
            price: suggestedInsurancePriceCents,
            quantity: 1,
            type: 'service',
            slug: 'mail-in-service-protection-plan',
            variantId: suggestedInsuranceVariantId,
            metadata: {
                covers_item_ref: mailInServiceItem.id,
                coverage_type: 'loss_and_damage'
            }
        })
    }

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className={styles.overlay}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={styles.drawer}
                    >
                        <div className={styles.header}>
                            <h2 className={styles.title}>Your Cart ({items.length})</h2>
                            <button onClick={closeCart} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className={styles.emptyState}>
                                <ShoppingBag size={48} />
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <div className={styles.itemsList}>
                                <AnimatePresence initial={false} mode="popLayout">
                                    {items.map((item) => (
                                        <motion.div
                                            key={`${item.id}-${item.variantId || item.size || 'default'}`}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            className={styles.item}
                                        >
                                            <Link
                                                href={item.type === 'service' ? `/services/${item.slug}` : `/products/${item.slug}`}
                                                className={styles.itemImage}
                                                onClick={closeCart}
                                            >
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                )}
                                            </Link>
                                            <div className={styles.itemDetails}>
                                                <div>
                                                    <Link
                                                        href={item.type === 'service' ? `/services/${item.slug}` : `/products/${item.slug}`}
                                                        className={styles.itemName}
                                                        onClick={closeCart}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    {item.size && (
                                                        <p className="text-sm text-zinc-500 mt-0.5">Size: {item.size}</p>
                                                    )}
                                                    <p className={styles.itemPrice}>
                                                        ${(item.price / 100).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className={styles.itemMeta}>
                                                    <div className={styles.quantityControls}>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.variantId)}
                                                            className={styles.qtyBtn}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className={styles.quantity}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.variantId)}
                                                            className={styles.qtyBtn}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id, item.size, item.variantId)}
                                                        className={styles.removeBtn}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className={styles.footer}>
                                {mailInServiceItem && !hasInsurance && (
                                    <div className={styles.upsellCard}>
                                        <div className={styles.upsellHeader}>
                                            <ShieldCheck size={16} />
                                            <span>Protect your mail-in order</span>
                                        </div>
                                        <p className={styles.upsellDescription}>
                                            {suggestedInsuranceVariantId === INSURANCE_VARIANT_IDS.STANDARD
                                                ? 'Standard Tier: Up to $100 coverage for hoodie loss/damage.'
                                                : 'Basic Tier: Up to $50 coverage or service-fee refund.'}
                                        </p>
                                        <button
                                            className={styles.upsellButton}
                                            onClick={handleAddInsurance}
                                        >
                                            Add Protection • ${(suggestedInsurancePriceCents / 100).toFixed(2)}
                                        </button>
                                    </div>
                                )}

                                <div className={styles.totalRow}>
                                    <span>Total</span>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>$</span>
                                        <AnimatedCounter value={totalPrice()} isCurrency />
                                    </div>
                                </div>
                                <button
                                    className={styles.checkoutBtn}
                                    onClick={handleCheckout}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Checkout'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
