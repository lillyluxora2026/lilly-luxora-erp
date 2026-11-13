'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Mail, MessageCircle } from 'lucide-react'
import { sendCheckoutRecovery } from '@/lib/actions/abandoned-checkout-actions'

type RecoveryActionsProps = {
    sessionId: string
    recoveryUrl: string
    customerName: string
    hasEmail: boolean
    phone: string | null
    emailsSent: number
}

const buttonClass =
    'inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'

function getWhatsAppNumber(phone: string | null) {
    const digits = (phone || '').replace(/\D/g, '')
    if (digits.length === 10) return `91${digits}`
    if (digits.length === 12 && digits.startsWith('91')) return digits
    return null
}

export default function RecoveryActions({ sessionId, recoveryUrl, customerName, hasEmail, phone, emailsSent }: RecoveryActionsProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)
    const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

    const whatsAppNumber = getWhatsAppNumber(phone)
    const whatsAppText = `Hi ${customerName || 'there'}, this is Lily Luxora. You left a few pieces in your cart — you can complete your order here: ${recoveryUrl}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(recoveryUrl)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            setMessage({ tone: 'error', text: 'Could not copy the link.' })
        }
    }

    const handleSendEmail = () => {
        setMessage(null)
        startTransition(async () => {
            const result = await sendCheckoutRecovery(sessionId)
            if ('error' in result) {
                setMessage({ tone: 'error', text: result.error || 'Could not send the email.' })
                return
            }
            setMessage({ tone: 'success', text: 'Recovery email sent.' })
            router.refresh()
        })
    }

    return (
        <div className="flex flex-col items-end gap-1.5">
            <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={handleSendEmail} disabled={!hasEmail || isPending} className={buttonClass} title={hasEmail ? undefined : 'No email address on this checkout'}>
                    <Mail className="h-3.5 w-3.5" />
                    {isPending ? 'Sending...' : emailsSent > 0 ? 'Resend email' : 'Send email'}
                </button>
                {whatsAppNumber && (
                    <a
                        href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsAppText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClass}
                    >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                    </a>
                )}
                <button type="button" onClick={handleCopy} className={buttonClass}>
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy link'}
                </button>
            </div>
            {message && (
                <p className={`text-xs ${message.tone === 'error' ? 'text-red-600' : 'text-green-700'}`}>{message.text}</p>
            )}
        </div>
    )
}
