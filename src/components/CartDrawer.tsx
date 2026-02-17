'use client'

import { useCart } from '@/hooks/useCart'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './CartDrawer.module.css'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AnimatedCounter from './AnimatedCounter'
import { swat } from '@/lib/swatbloc'
import { INSURANCE_VARIANT_IDS, PRODUCT_IDS } from '@/lib/constants'
import InsuranceSelectionModal from './InsuranceSelectionModal'

export default function CartDrawer() {
    const { isOpen, closeCart, items, removeItem, updateQuantity, totalPrice, addItem } = useCart()
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [activeInsuranceRowKey, setActiveInsuranceRowKey] = useState<string | null>(null)
    const pathname = usePathname()

    const rowKeyFor = (item: { id: string; variantId?: string; size?: string }) => `${item.id}-${item.variantId || item.size || 'default'}`

    const insuranceItems = items.filter((item) => item.id === PRODUCT_IDS.MAIL_IN_INSURANCE)
    const visibleItems = items.filter((item) => item.id !== PRODUCT_IDS.MAIL_IN_INSURANCE)

    const insuranceCountsForRow = (rowKey: string, productId: string) => {
        const basic = insuranceItems
            .filter((ins) => {
                if (ins.variantId !== INSURANCE_VARIANT_IDS.BASIC) return false
                const metadata = ins.metadata as Record<string, unknown> | undefined
                const linkedRow = metadata?.covers_row_key as string | undefined
                const linkedProduct = metadata?.covers_item_ref as string | undefined
                if (linkedRow) return linkedRow === rowKey
                return linkedProduct === productId
            })
            .reduce((sum, ins) => sum + ins.quantity, 0)

        const standard = insuranceItems
            .filter((ins) => {
                if (ins.variantId !== INSURANCE_VARIANT_IDS.STANDARD) return false
                const metadata = ins.metadata as Record<string, unknown> | undefined
                const linkedRow = metadata?.covers_row_key as string | undefined
                const linkedProduct = metadata?.covers_item_ref as string | undefined
                if (linkedRow) return linkedRow === rowKey
                return linkedProduct === productId
            })
            .reduce((sum, ins) => sum + ins.quantity, 0)

        return { basic, standard }
    }

    const applyInsuranceForRow = (
        rowKey: string,
        desiredBasicCount: number,
        desiredStandardCount: number,
        existingBasicCount: number,
        existingStandardCount: number
    ) => {
        const syncTier = (
            variantId: string,
            desiredQuantity: number,
            existingQuantity: number,
            priceCents: number,
            title: string
        ) => {
            if (desiredQuantity > existingQuantity) {
                addItem({
                    id: PRODUCT_IDS.MAIL_IN_INSURANCE,
                    name: title,
                    price: priceCents,
                    quantity: desiredQuantity - existingQuantity,
                    type: 'service',
                    slug: 'mail-in-service-protection-plan',
                    variantId,
                    metadata: {
                        covers_item_ref: PRODUCT_IDS.MAIL_IN_SERVICE,
                        covers_row_key: rowKey,
                        coverage_type: 'loss_and_damage'
                    }
                })
                return
            }

            if (desiredQuantity < existingQuantity) {
                updateQuantity(PRODUCT_IDS.MAIL_IN_INSURANCE, desiredQuantity, undefined, variantId)
            }
        }

        syncTier(
            INSURANCE_VARIANT_IDS.BASIC,
            desiredBasicCount,
            existingBasicCount,
            400,
            'Mail-In Protection (Basic • Up to $50)'
        )

        syncTier(
            INSURANCE_VARIANT_IDS.STANDARD,
            desiredStandardCount,
            existingStandardCount,
            800,
            'Mail-In Protection (Standard • Up to $100)'
        )
    }

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
                            <h2 className={styles.title}>Your Cart ({visibleItems.length})</h2>
                            <button onClick={closeCart} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        {visibleItems.length === 0 ? (
                            <div className={styles.emptyState}>
                                <ShoppingBag size={48} />
                                <p>Your cart is empty</p>
                            </div>
                        ) : (
                            <div className={styles.itemsList}>
                                <AnimatePresence initial={false} mode="popLayout">
                                    {visibleItems.map((item) => {
                                        const rowKey = rowKeyFor(item)
                                        const { basic: linkedBasicCount, standard: linkedStandardCount } = insuranceCountsForRow(rowKey, item.id)
                                        const hasLinkedInsurance = linkedBasicCount + linkedStandardCount > 0
                                        const linkedInsuranceCents = linkedBasicCount * 400 + linkedStandardCount * 800

                                        return (
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

                                                    {item.id === PRODUCT_IDS.MAIL_IN_SERVICE && linkedInsuranceCents > 0 && (
                                                        <p className={styles.insuranceMeta}>
                                                            Insurance: +${(linkedInsuranceCents / 100).toFixed(2)}
                                                        </p>
                                                    )}

                                                    {item.id === PRODUCT_IDS.MAIL_IN_SERVICE && (
                                                        <button
                                                            className={`${styles.insuranceBtn} ${hasLinkedInsurance ? styles.insuranceBtnActive : ''}`}
                                                            onClick={() => setActiveInsuranceRowKey(rowKey)}
                                                        >
                                                            {hasLinkedInsurance ? 'Edit Insurance' : 'Add Insurance'}
                                                        </button>
                                                    )}
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
                                    )})}
                                </AnimatePresence>
                            </div>
                        )}

                        {visibleItems.length > 0 && (
                            <div className={styles.footer}>
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

                        {activeInsuranceRowKey && (() => {
                            const serviceRow = visibleItems.find((item) => rowKeyFor(item) === activeInsuranceRowKey)
                            if (!serviceRow || serviceRow.id !== PRODUCT_IDS.MAIL_IN_SERVICE) return null

                            const { basic, standard } = insuranceCountsForRow(activeInsuranceRowKey, serviceRow.id)

                            return (
                                <InsuranceSelectionModal
                                    isOpen
                                    quantity={serviceRow.quantity}
                                    initialBasicCount={basic}
                                    initialStandardCount={standard}
                                    title="Mail-In Insurance"
                                    subtitle="Select coverage for each item in this service row."
                                    confirmLabel="Save Changes"
                                    onClose={() => setActiveInsuranceRowKey(null)}
                                    onConfirm={({ basicCount, standardCount }) => {
                                        applyInsuranceForRow(
                                            activeInsuranceRowKey,
                                            basicCount,
                                            standardCount,
                                            basic,
                                            standard
                                        )
                                        setActiveInsuranceRowKey(null)
                                    }}
                                />
                            )
                        })()}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
