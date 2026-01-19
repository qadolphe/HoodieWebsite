'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Ruler, Loader2 } from 'lucide-react'

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
        <div className="flex flex-col items-center min-h-[90vh] pt-48 pb-32 px-6 text-center w-full max-w-5xl mx-auto">
            <div className="animate-in zoom-in duration-1000 mb-16">
                <div className="w-28 h-28 bg-green-500/5 rounded-full flex items-center justify-center mx-auto ring-1 ring-green-500/10 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                    <CheckCircle className="w-14 h-14 text-green-500" />
                </div>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-white uppercase italic leading-none">Order Confirmed</h1>
            <p className="mb-20 text-zinc-500 text-lg md:text-2xl leading-relaxed max-w-3xl mx-auto font-medium">
                Payment successful. We've sent a confirmation email for order <span className="text-white font-mono">{orderIdToDisplay ? `#${orderIdToDisplay}` : ''}</span>.
            </p>

            {hasKit && orderIdToDisplay ? (
                <div className="w-full text-left bg-zinc-950 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-12 duration-1000 group ring-1 ring-white/10 mx-auto">
                    <div className="p-10 md:p-16 relative overflow-hidden bg-zinc-900/40">
                        {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
                        
                        <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center relative z-10">
                            <div className="flex-shrink-0 w-24 h-24 bg-white text-black rounded-[2rem] flex items-center justify-center shadow-2xl transform transition-transform duration-700 group-hover:scale-105">
                                <Ruler className="w-12 h-12" />
                            </div>
                            
                            <div className="flex-1 space-y-6">
                                <h3 className="font-black text-4xl md:text-5xl text-white tracking-tight leading-none uppercase italic">Next Step: Measure</h3>
                                <p className="text-zinc-400 text-xl leading-relaxed max-w-lg">
                                    Your order includes a <span className="text-white font-bold">custom fit kit</span>. Complete your measurement scan now to finalize your size.
                                </p>
                            </div>

                            <div className="w-full lg:w-auto flex flex-col gap-6 pt-4 lg:pt-0">
                                <button 
                                    onClick={() => router.push(`/measure/${orderIdToDisplay}`)}
                                    className="w-full lg:w-auto flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl py-7 px-14 rounded-2xl transition-all active:scale-[0.96] shadow-[0_10px_40px_rgba(37,99,235,0.3)] uppercase italic"
                                >
                                    Start Tool <ArrowRight className="w-8 h-8 ml-2" />
                                </button>
                                <p className="text-center lg:text-left text-xs text-zinc-600 font-bold uppercase tracking-[0.4em] px-2 opacity-60">
                                    Finalizing Size • 2 Mins
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="pt-4">
                    <Link 
                        href="/products" 
                        className="inline-flex items-center justify-center px-12 py-5 bg-zinc-900 border border-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all shadow-2xl shadow-black uppercase italic group active:scale-[0.98]"
                    >
                        Continue Shopping <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            )}
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
