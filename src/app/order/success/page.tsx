'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'


function SuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const { clearCart } = useCart()

    useEffect(() => {
        if (sessionId) {
            clearCart()
        }
    }, [sessionId, clearCart])

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '60vh',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '100px'
        }}>
            <CheckCircle size={64} color="#4CAF50" style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Thank you for your order!</h1>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                Your payment was successful. We have received your order.
            </p>
            <Link 
                href="/products" 
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#000',
                    color: '#fff',
                    borderRadius: '4px',
                    textDecoration: 'none'
                }}
            >
                Continue Shopping
            </Link>
        </div>
    )
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
