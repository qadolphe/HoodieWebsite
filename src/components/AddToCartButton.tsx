'use client'

import { useState } from 'react'
import { useCart, CartItem } from '@/hooks/useCart'
import { Product } from '@/types'
import { INSURANCE_VARIANT_IDS, PRODUCT_IDS } from '@/lib/constants'
import InsuranceSelectionModal from './InsuranceSelectionModal'

interface AddToCartButtonProps {
    product: Product
    className?: string
}

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
    const addItem = useCart((state) => state.addItem)
    const openCart = useCart((state) => state.openCart)
    const [isAdded, setIsAdded] = useState(false)
    const [showInsuranceModal, setShowInsuranceModal] = useState(false)
    const [selectedQuantity, setSelectedQuantity] = useState(1)

    const isMailInService = product.id === PRODUCT_IDS.MAIL_IN_SERVICE

    const addInsuranceTier = (variantId: string, quantity: number, priceCents: number, title: string) => {
        if (quantity <= 0) return

        const metadata: CartItem['metadata'] = {
            covers_item_ref: PRODUCT_IDS.MAIL_IN_SERVICE,
            covers_row_key: `${PRODUCT_IDS.MAIL_IN_SERVICE}-default`,
            coverage_type: 'loss_and_damage'
        }

        addItem({
            id: PRODUCT_IDS.MAIL_IN_INSURANCE,
            name: title,
            price: priceCents,
            quantity,
            type: 'service',
            slug: 'mail-in-service-protection-plan',
            variantId,
            metadata
        }, { openCart: false })
    }

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: Math.round(product.base_price * 100), // Convert to cents
            quantity: selectedQuantity,
            image: product.image_url || undefined,
            type: product.type,
            slug: product.slug
        }, { openCart: !isMailInService })

        if (isMailInService) {
            setShowInsuranceModal(true)
        }

        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const handleInsuranceConfirm = ({ basicCount, standardCount }: { basicCount: number; standardCount: number }) => {
        addInsuranceTier(
            INSURANCE_VARIANT_IDS.BASIC,
            basicCount,
            400,
            'Mail-In Protection (Basic • Up to $50)'
        )

        addInsuranceTier(
            INSURANCE_VARIANT_IDS.STANDARD,
            standardCount,
            800,
            'Mail-In Protection (Standard • Up to $100)'
        )

        setShowInsuranceModal(false)
        openCart()
    }

    return (
        <>
            {isMailInService && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <span style={{ color: '#d1d5db', fontSize: '0.95rem' }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.06)', borderRadius: 9999, padding: '0.2rem 0.55rem' }}>
                        <button
                            type="button"
                            onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                            style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            -
                        </button>
                        <span style={{ color: '#fff', minWidth: 20, textAlign: 'center' }}>{selectedQuantity}</span>
                        <button
                            type="button"
                            onClick={() => setSelectedQuantity((q) => q + 1)}
                            style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={handleAddToCart}
                className={className}
                disabled={isAdded}
            >
                {isAdded ? 'Added to Cart!' : 'Add to Cart'}
            </button>

            {isMailInService && (
                <InsuranceSelectionModal
                    isOpen={showInsuranceModal}
                    quantity={selectedQuantity}
                    initialBasicCount={0}
                    initialStandardCount={0}
                    title="Protect Your New Mail-In Item(s)"
                    subtitle="This prompt applies only to the service quantity you just added."
                    confirmLabel="Add Selected Protection"
                    onClose={() => {
                        setShowInsuranceModal(false)
                        openCart()
                    }}
                    onConfirm={handleInsuranceConfirm}
                />
            )}
        </>
    )
}
