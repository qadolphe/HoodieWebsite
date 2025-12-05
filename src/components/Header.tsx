'use client'

import Link from 'next/link';
import styles from './Header.module.css';
import { useCart } from '@/hooks/useCart';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
    const openCart = useCart((state) => state.openCart);
    const items = useCart((state) => state.items);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className={styles.header}>
            <div className="container">
                <div className={styles.inner}>
                    <Link href="/" className={styles.logo}>
                        Satin Kits
                    </Link>

                    <nav className={styles.nav}>
                        <Link href="/products" className={styles.link}>Shop</Link>
                        <Link href="/tutorials" className={styles.link}>Tutorials</Link>
                        <Link href="/about" className={styles.link}>About</Link>
                    </nav>

                    <div className={styles.actions}>
                        <button 
                            className={styles.cartBtn} 
                            aria-label="Cart"
                            onClick={openCart}
                        >
                            <ShoppingBag size={24} />
                            {mounted && itemCount > 0 && (
                                <span className={styles.badge}>{itemCount}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
