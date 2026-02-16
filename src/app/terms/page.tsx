import Link from 'next/link'

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <Link href="/" style={{ color: '#c084fc', textDecoration: 'none' }}>← Back</Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '1rem', marginBottom: '1rem' }}>
                    Protection Plan Terms
                </h1>
                <p style={{ color: '#d4d4d8', marginBottom: '1rem' }}>
                    These terms govern the optional Mail-In Service Protection Plan.
                </p>

                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '1.5rem' }}>Coverage Tiers</h2>
                <ul style={{ color: '#d4d4d8', lineHeight: 1.8 }}>
                    <li>Basic: Up to $50 reimbursement, $4.00 fee.</li>
                    <li>Standard: Up to $100 reimbursement, $8.00 fee.</li>
                </ul>

                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '1.5rem' }}>What is Covered</h2>
                <p style={{ color: '#d4d4d8', lineHeight: 1.8 }}>
                    Loss or damage to the declared mail-in hoodie while in our care and processing workflow,
                    subject to proof of original item value.
                </p>

                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '1.5rem' }}>Claim Resolution</h2>
                <p style={{ color: '#d4d4d8', lineHeight: 1.8 }}>
                    Approved claims may be resolved by reimbursement up to tier limit or service refund where applicable.
                </p>
            </div>
        </div>
    )
}
