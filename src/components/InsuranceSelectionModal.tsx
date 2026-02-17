'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './InsuranceSelectionModal.module.css'

type CoverageTier = 'none' | 'basic' | 'standard'

interface InsuranceSelectionModalProps {
    isOpen: boolean
    quantity: number
    initialBasicCount: number
    initialStandardCount: number
    title?: string
    subtitle?: string
    confirmLabel?: string
    onClose: () => void
    onConfirm: (selection: { basicCount: number; standardCount: number }) => void
}

export default function InsuranceSelectionModal({
    isOpen,
    quantity,
    initialBasicCount,
    initialStandardCount,
    title = 'Add Shipping Protection',
    subtitle = 'Choose protection for each mail-in hoodie in your cart.',
    confirmLabel = 'Save Protection',
    onClose,
    onConfirm
}: InsuranceSelectionModalProps) {
    const [rows, setRows] = useState<CoverageTier[]>([])
    const [showTerms, setShowTerms] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        const nextRows: CoverageTier[] = []
        const safeQuantity = Math.max(0, quantity)

        for (let i = 0; i < safeQuantity; i++) {
            if (i < initialStandardCount) {
                nextRows.push('standard')
            } else if (i < initialStandardCount + initialBasicCount) {
                nextRows.push('basic')
            } else {
                nextRows.push('none')
            }
        }

        setRows(nextRows)
    }, [isOpen, quantity, initialBasicCount, initialStandardCount])

    useEffect(() => {
        if (!isOpen) return

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        window.addEventListener('keydown', onEsc)
        return () => window.removeEventListener('keydown', onEsc)
    }, [isOpen, onClose])

    const summary = useMemo(() => {
        const basicCount = rows.filter((v) => v === 'basic').length
        const standardCount = rows.filter((v) => v === 'standard').length
        const totalCents = basicCount * 400 + standardCount * 800
        return { basicCount, standardCount, totalCents }
    }, [rows])

    const primaryButtonLabel = summary.totalCents === 0
        ? 'Continue without protection'
        : confirmLabel

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
                        ×
                    </button>
                </div>

                <p className={styles.subtitle}>
                    {subtitle}
                </p>

                {rows.length === 0 ? (
                    <p className={styles.empty}>No mail-in items found.</p>
                ) : (
                    <div className={styles.rows}>
                        {rows.map((value, index) => (
                            <div key={index} className={styles.row}>
                                <span className={styles.rowLabel}>Item #{index + 1}</span>
                                <select
                                    value={value}
                                    className={styles.select}
                                    onChange={(e) => {
                                        const next = [...rows]
                                        next[index] = e.target.value as CoverageTier
                                        setRows(next)
                                    }}
                                >
                                    <option value="none">No protection</option>
                                    <option value="basic">Basic • Up to $50 • $4.00</option>
                                    <option value="standard">Standard • Up to $100 • $8.00</option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.summary}>
                    <span>{summary.basicCount} Basic, {summary.standardCount} Standard</span>
                    <strong>+ ${(summary.totalCents / 100).toFixed(2)}</strong>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.termsBtn}
                        onClick={() => setShowTerms((v) => !v)}
                    >
                        {showTerms ? 'Hide Terms' : 'View Terms'}
                    </button>
                    <button className={styles.confirmBtn} onClick={() => onConfirm(summary)}>
                        {primaryButtonLabel}
                    </button>
                </div>

                <div className={`${styles.termsPanel} ${showTerms ? styles.termsPanelOpen : ''}`}>
                    <div className={styles.termsContent}>
                        <h4>Protection Terms (Summary)</h4>
                        <ul>
                            <li>Basic: up to $50 coverage for eligible loss or damage.</li>
                            <li>Standard: up to $100 coverage for eligible loss or damage.</li>
                            <li>Coverage applies to the declared mail-in service item(s).</li>
                            <li>Claim outcomes may include reimbursement or service refund where applicable.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
