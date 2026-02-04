'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { Product } from '@/types'
import { Ruler, Check, ShieldCheck } from 'lucide-react'
import { swat } from '@/lib/swatbloc'

// Simple sizes for hoodies - we can make this dynamic later if needed
const SIZES = ['S', 'M', 'L', 'XL', '2XL']

export default function ProductForm({ product }: { product: Product }) {
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>()
    const [variants, setVariants] = useState<any[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoadingVariants, setIsLoadingVariants] = useState(false)

    const [showSizeGuide, setShowSizeGuide] = useState(false)
    const [isAdded, setIsAdded] = useState(false)
    const addItem = useCart((state) => state.addItem)

    useEffect(() => {
        let mounted = true;
        const fetchVariants = async () => {
            setIsLoadingVariants(true);
            try {
                const data = await swat.variants.list(product.id);
                if (mounted && data && data.length > 0) {
                    setVariants(data.sort((a, b) => {
                        // Sort S, M, L... if we can. (Crude sort)
                        const order = { S: 1, M: 2, L: 3, XL: 4, '2XL': 5 };
                        const sA = a.options?.Size || '';
                        const sB = b.options?.Size || '';
                        return (order[sA as keyof typeof order] || 99) - (order[sB as keyof typeof order] || 99);
                    }));
                }
            } catch (e) {
                console.error("Failed to load variants", e);
            } finally {
                if (mounted) setIsLoadingVariants(false);
            }
        };
        fetchVariants();
        return () => { mounted = false; };
    }, [product.id]);

    const handleAddToCart = () => {
        if (!selectedSize) return

        // Find variant if we are using them
        let variantId = selectedVariantId;
        if (!variantId && variants.length > 0) {
            const v = variants.find(v => v.options?.Size === selectedSize);
            if (v) variantId = v.id;
        }

        addItem({
            id: product.id,
            name: product.name,
            price: Math.round(product.base_price * 100),
            quantity: 1,
            image: product.image_url || undefined,
            type: product.type,
            slug: product.slug,
            size: selectedSize,
            variantId: variantId
        })

        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const availableSizes = variants.length > 0
        ? variants.map(v => v.options?.Size || v.title).filter(Boolean)
        : SIZES;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            {/* Size Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Header Row */}
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Select Size</h3>
                    <button
                        onClick={() => setShowSizeGuide(!showSizeGuide)}
                        className="text-sm text-zinc-400 flex items-center gap-2 hover:text-white transition-colors"
                    >
                        <Ruler className="w-4 h-4" />
                        {showSizeGuide ? 'Hide Guide' : 'Size Guide'}
                    </button>
                </div>

                {/* Size Guide (collapsible) */}
                {showSizeGuide && (
                    <div className="bg-zinc-800/40 rounded-xl p-5">
                        <div className="grid grid-cols-5 gap-4 text-center">
                            {[
                                { size: 'S', chest: '34-36"' },
                                { size: 'M', chest: '38-40"' },
                                { size: 'L', chest: '42-44"' },
                                { size: 'XL', chest: '46-48"' },
                                { size: '2XL', chest: '50-52"' }
                            ].map((item) => (
                                <div key={item.size} className="space-y-1">
                                    <div className="text-sm font-semibold text-white">{item.size}</div>
                                    <div className="text-xs text-zinc-500">{item.chest}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                    {availableSizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => {
                                setSelectedSize(size);
                                if (variants.length > 0) {
                                    const v = variants.find(v => (v.options?.Size === size || v.title === size));
                                    if (v) setSelectedVariantId(v.id);
                                }
                            }}
                            className={`
                                py-10 text-xl font-bold rounded-2xl
                                transition-all duration-300 ease-out relative overflow-hidden group
                                flex items-center justify-center
                                border
                                ${selectedSize === size
                                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white hover:bg-zinc-800 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                }
                            `}
                        >
                            <span className="relative z-10">{size}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Add to Cart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize || isAdded}
                    className={`
                        w-full py-10 rounded-2xl font-bold text-xl uppercase tracking-wide
                        transition-all duration-300 ease-out relative overflow-hidden
                        border
                        ${isAdded
                            ? 'bg-emerald-500 text-white border-emerald-400 cursor-default'
                            : !selectedSize
                                ? 'bg-zinc-900/30 text-zinc-600 border-zinc-800/50 cursor-not-allowed'
                                : 'bg-white text-black border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.01]'
                        }
                    `}
                >
                    {isAdded ? (
                        <span className="flex items-center justify-center gap-3">
                            <Check className="w-6 h-6" strokeWidth={3} /> Added to Cart
                        </span>
                    ) : (
                        selectedSize ? 'Add to Cart' : 'Select a Size'
                    )}
                </button>

                {/* Secure Checkout Badge */}
                <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Secure checkout powered by SwatBloc</span>
                </div>
            </div>
        </div>
    )
}
