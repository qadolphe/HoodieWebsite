import styles from './page.module.css'

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.title}>Our Story</h1>
                
                <div className={styles.section}>
                    <p className={styles.text}>
                        We love the feeling and benefits of a satin-lined hoodie. But we realized something important: 
                        we didn't want to buy a whole new wardrobe just to get that protection. We wanted the hoodies 
                        we already owned, loved, and lived in to have that same premium satin lining.
                    </p>
                    <p className={styles.text}>
                        That's why we created Satin Kits. We believe you shouldn't have to choose between your 
                        favorite vintage hoodie and your hair health. Whether you want to DIY it or have us do it 
                        for you, we're here to help you upgrade the gear you already love.
                    </p>
                </div>

                <div className={styles.imagePlaceholder}>
                    [Brand Image Placeholder]
                </div>

                <div className={styles.section}>
                    <h2 className={styles.heading}>Our Mission</h2>
                    <p className={styles.text}>
                        We believe that style and self-care should go hand in hand. Our mission is to empower 
                        you to customize your wardrobe in a way that serves you. Whether you're a DIY enthusiast 
                        or prefer a done-for-you service, we provide the tools and expertise to upgrade your gear.
                    </p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.heading}>Quality First</h2>
                    <p className={styles.text}>
                        We source only the highest quality satin that provides the perfect slip for your hair. 
                        Our kits are designed to be easy to use, ensuring that anyone can achieve a professional 
                        finish at home.
                    </p>
                </div>
            </div>
        </div>
    )
}
