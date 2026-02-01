import styles from './page.module.css'

export default function FAQPage() {
    const faqs = [
        {
            question: "How do I choose the right kit?",
            answer: "If you have a sewing machine and are comfortable with basic projects, the Essentials Kit is perfect. For those who want the easiest experience, the All-in-One Kit includes a handheld sewing machine."
        },
        {
            question: "How long does the mail-in service take?",
            answer: "Once we receive your hoodie, our turnaround time is typically 3-5 business days before we ship it back to you."
        },
        {
            question: "Is the satin machine washable?",
            answer: "Yes! Our high-quality satin is machine washable. We recommend washing on a gentle cycle and air drying to maintain the best slip and shine."
        }
    ]

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.title}>Frequently Asked Questions</h1>
                
                <div className={styles.faqList}>
                    {faqs.map((faq, index) => (
                        <div key={index} className={styles.section}>
                            <h2 className={styles.heading}>{faq.question}</h2>
                            <p className={styles.text}>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
