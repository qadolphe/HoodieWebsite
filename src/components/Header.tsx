import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
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
                        <button className={styles.cartBtn} aria-label="Cart">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
