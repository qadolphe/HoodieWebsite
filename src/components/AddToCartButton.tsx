'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'

interface AddToCartButtonProps {
    product: Product
    className?: string
}

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
    const addItem = useCart((state) => state.addItem)
    const [isAdded, setIsAdded] = useState(false)

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: Math.round(product.base_price * 100), // Convert to cents
            quantity: 1,
            image: product.image_url || undefined,
            type: product.type,
            slug: product.slug
        })

        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    return (
        <button 
            onClick={handleAddToCart}
            className={className}
            disabled={isAdded}
        >
            {isAdded ? 'Added to Cart!' : 'Add to Cart'}
        </button>
    )
}
