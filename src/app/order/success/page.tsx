'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Ruler, Loader2 } from 'lucide-react'

// Helper to keep state across renders
function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const urlOrderId = searchParams.get('orderId')
    
    // We access cart items directly to determine if we need to show the kit UI
    // This avoids needing to query the API (which was failing due to key mismatch)
    const { items, clearCart } = useCart()
    const router = useRouter()

    const [hasKit, setHasKit] = useState(false)
    const [processed, setProcessed] = useState(false)
    const [orderId, setOrderId] = useState<string | null>(null)

    useEffect(() => {
        if (processed) return;

        if (sessionId) {
            // 1. Check for Kits in the cart *before* clearing
            const kitFound = items.some(item => 
                item.type === 'kit' || 
                item.name.toLowerCase().includes('kit')
            );
            
            if (kitFound) {
                setHasKit(true);
            }

            // 2. Set Order ID from URL if available
            if (urlOrderId) {
                setOrderId(urlOrderId);
            }

            // 3. Clear the cart
            clearCart();
            setProcessed(true);
        }
    }, [sessionId, items, clearCart, processed, urlOrderId])

    // If we have an order ID but don't know if it's a kit yet (e.g. page refresh after clear),
    // we could fallback to API, but for now assuming the flow comes from CartDrawer
    // If refreshed, items is empty, so hasKit would be false. 
    // Ideally we persist "pending measurement" state or check API.
    // Given the key issues, we'll rely on the immediate redirect flow.

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center mt-24">
            <div className="animate-in zoom-in duration-500">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>
            <p className="mb-8 text-zinc-500 max-w-md mx-auto">
                Your payment was successful. We have received your order{orderId ? ` #${orderId}` : ''}.
            </p>

            {hasKit && orderId ? (
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl max-w-md w-full mb-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-blue-500" />
                        One Last Step!
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                        You purchased a custom fit kit. We need your measurements to ensure the perfect fit.
                    </p>
                    <button 
                        onClick={() => router.push(`/measure/${orderId}`)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
                    >
                        Start Measurement Tool <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-center mt-4 text-zinc-400">
                        You can also do this later from your order confirmation email.
                    </p>
                </div>
            ) : (
                <Link 
                    href="/products" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-black text-white hover:opacity-80 rounded-lg transition-opacity"
                >
                    Continue Shopping
                </Link>
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
