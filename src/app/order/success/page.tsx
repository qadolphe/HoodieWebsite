'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { Check, ArrowRight, Ruler, Loader2 } from 'lucide-react'

function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const urlOrderId = searchParams.get('orderId')
    
    const { items, clearCart, _hasHydrated } = useCart()
    const router = useRouter()

    const [hasKit, setHasKit] = useState(false)
    const [processed, setProcessed] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        // Only run on client, once hydrated, once we have a session, and not already processed
        if (!mounted || !_hasHydrated || processed) return;
        
        // If we don't have a session ID, we might be revisiting. Logic handled below.
        if (!sessionId && !urlOrderId) {
            setProcessed(true);
            return;
        }
        
        // 1. Check for Kits in the cart *before* clearing
        const kitFoundInCart = items.some(item => 
            item.type === 'kit' || 
            item.name.toLowerCase().includes('kit') ||
            item.slug?.toLowerCase().includes('kit')
        );
        
        if (kitFoundInCart) {
            setHasKit(true);
            setResolvedOrderId(urlOrderId);
            clearCart();
            setProcessed(true);
        } else {
            // Fallback: If cart is empty (refresh), or to ensure we have the right Order ID
            const queryParam = sessionId ? `sessionId=${sessionId}` : `orderId=${urlOrderId}`;
            
            fetch(`/api/measure/status?${queryParam}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        if (data.hasKit) setHasKit(true);
                        if (data.orderId) setResolvedOrderId(data.orderId);
                    }
                    // Always mark processed to avoid loops
                    setProcessed(true);
                    clearCart();
                })
                .catch(err => {
                    setProcessed(true);
                });
        }

    }, [mounted, _hasHydrated, sessionId, items, clearCart, processed, urlOrderId])

    if (!mounted || !_hasHydrated || (!processed && (sessionId || urlOrderId))) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-zinc-300" />
            </div>
        )
    }

    const orderIdToDisplay = resolvedOrderId || urlOrderId || '';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
            <div className="w-full max-w-lg mx-auto text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
                    </div>
                </div>
                
                {/* Heading */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                    Order Confirmed
                </h1>
                
                {/* Subtext */}
                <p className="text-zinc-400 text-lg mb-2">
                    Payment successful. We've sent a confirmation email.
                </p>
                {orderIdToDisplay && (
                    <p className="text-zinc-500 font-mono text-sm mb-12">
                        Order #{orderIdToDisplay}
                    </p>
                )}

                {/* Next Step Card */}
                {hasKit && orderIdToDisplay ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                                <Ruler className="w-7 h-7 text-blue-400" />
                            </div>
                        </div>
                        
                        <h2 className="text-xl font-bold text-white mb-2">
                            Complete Your Measurements
                        </h2>
                        <p className="text-zinc-400 text-sm mb-6">
                            Your kit includes custom sizing. Take 2 minutes to finalize your fit.
                        </p>
                        
                        <button 
                            onClick={() => router.push(`/measure/${orderIdToDisplay}`)}
                            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            Start Measurement
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <Link 
                        href="/products" 
                        className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                        Continue Shopping
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <SuccessContent />
        </Suspense>
    )
}
