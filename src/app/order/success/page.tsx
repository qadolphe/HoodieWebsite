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
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-24">
            <div className="w-full max-w-lg mx-auto text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <Check className="w-12 h-12 text-green-500" strokeWidth={3} />
                    </div>
                </div>
                
                {/* Heading */}
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white tracking-tight">
                    Order Confirmed
                </h1>
                
                {/* Subtext */}
                <p className="text-zinc-400 text-xl font-medium mb-2">
                    Payment successful. We've sent a confirmation email.
                </p>
                {orderIdToDisplay && (
                    <p className="text-zinc-600 font-mono text-sm mb-16">
                        Order #{orderIdToDisplay}
                    </p>
                )}

                <Link 
                    href="/products" 
                    className="inline-flex items-center gap-3 bg-white text-black font-bold px-12 py-5 rounded-2xl hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                >
                    Continue Shopping
                    <ArrowRight className="w-5 h-5" />
                </Link>
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
