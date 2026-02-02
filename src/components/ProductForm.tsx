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
                         const order = { S:1, M:2, L:3, XL:4, '2XL':5 };
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
        <div className="flex flex-col gap-6 mt-8">
            {/* Size Selector Card */}
            <div className="bg-gradient-to-b from-zinc-900/60 to-zinc-900/30 backdrop-blur-sm border border-zinc-800/60 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800/50">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-medium">Select Size</span>
                        <h3 className="text-base font-semibold text-white mt-0.5">Choose Your Fit</h3>
                    </div>
                    <button
                        onClick={() => setShowSizeGuide(!showSizeGuide)}
                        className="text-xs text-zinc-400 flex items-center gap-1.5 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-800"
                    >
                        <Ruler className="w-3.5 h-3.5" />
                        {showSizeGuide ? 'Hide' : 'Size Guide'}
                    </button>
                </div>

                {/* Size Guide Dropdown */}
                {showSizeGuide && (
                    <div className="px-5 py-4 bg-zinc-800/20 border-b border-zinc-800/50">
                        <div className="grid grid-cols-5 gap-2 text-center text-xs">
                            {[
                                { size: 'S', chest: '34-36"' },
                                { size: 'M', chest: '38-40"' },
                                { size: 'L', chest: '42-44"' },
                                { size: 'XL', chest: '46-48"' },
                                { size: '2XL', chest: '50-52"' }
                            ].map((item) => (
                                <div key={item.size} className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-white">{item.size}</span>
                                    <span className="text-zinc-500 text-[10px]">{item.chest}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size Buttons */}
                <div className="p-4">
                    <div className="flex gap-2 flex-wrap">
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
                                    flex-1 min-w-[60px] py-3 text-sm font-semibold rounded-xl border-2
                                    transition-all duration-200 ease-out
                                    ${selectedSize === size
                                        ? 'border-white bg-white text-black scale-[1.02] shadow-lg shadow-white/10'
                                        : 'border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50'
                                    }
                                `}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add to Cart Section */}
            <div className="flex flex-col gap-3">
                <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize || isAdded}
                    className={`
                        w-full py-4 px-6 rounded-xl font-bold text-lg 
                        transition-all duration-200 ease-out
                        ${isAdded
                            ? 'bg-emerald-500 text-white cursor-default'
                            : !selectedSize
                                ? 'bg-zinc-800/60 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                                : 'bg-white text-black hover:bg-zinc-100 hover:shadow-xl hover:shadow-white/10 active:scale-[0.98]'
                        }
                    `}
                >
                    {isAdded ? (
                        <span className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" strokeWidth={2.5} /> Added to Cart
                        </span>
                    ) : (
                        selectedSize ? 'Add to Cart' : 'Select a Size'
                    )}
                </button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-zinc-500 text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Secure checkout powered by SwatBloc</span>
                </div>
            </div>
        </div>
    )
}
