'use server'

import { revalidatePath } from 'next/cache'
import { requireActionPermission } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendCheckoutRecoveryEmail } from '@/lib/server/customer-email'
import { getPagination } from '@/lib/server/pagination'

const PAGE_SIZE = 20
// A checkout counts as abandoned once the shopper has been idle this long.
const ABANDONED_AFTER_MINUTES = 30
const MAX_RECOVERY_EMAILS = 3
const DEFAULT_STOREFRONT_URL = 'https://www.lilyluxora.com'

export type CheckoutView = 'abandoned' | 'active' | 'recovered'

export type CheckoutSessionItem = {
    id: string
    name: string
    variantLabel?: string | null
    quantity: number
    price: number
    image?: string | null
}

export type CheckoutSessionRecord = {
    id: string
    status: 'open' | 'completed'
    email: string | null
    phone: string | null
    full_name: string | null
    shipping_address: { city?: string; state?: string; pincode?: string } | null
    items: CheckoutSessionItem[]
    item_count: number
    subtotal: number
    coupon_code: string | null
    order_id: string | null
    recovery_emails_sent: number
    last_recovery_email_at: string | null
    recovered_at: string | null
    completed_at: string | null
    created_at: string
    updated_at: string
    recovery_url: string
}

export type CheckoutRecoveryStats = {
    abandonedCount: number
    abandonedValue: number
    recoveredCount: number
    recoveredValue: number
}

const SESSION_COLUMNS =
    'id, token, status, email, phone, full_name, shipping_address, items, item_count, subtotal, coupon_code, order_id, recovery_emails_sent, last_recovery_email_at, recovered_at, completed_at, created_at, updated_at'

function getStorefrontSiteUrl() {
    const siteUrl =
        process.env.ECOMMERCE_SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        DEFAULT_STOREFRONT_URL

    const normalized = siteUrl.replace(/\/$/, '')
    return normalized.startsWith('http') ? normalized : `https://${normalized}`
}

function buildRecoveryUrl(token: string) {
    return `${getStorefrontSiteUrl()}/checkout?recover=${token}`
}

function toRecord(row: Record<string, unknown>): CheckoutSessionRecord {
    const { token, ...rest } = row as { token: string } & Record<string, unknown>

    return {
        ...(rest as Omit<CheckoutSessionRecord, 'recovery_url' | 'items' | 'subtotal'>),
        items: Array.isArray(rest.items) ? (rest.items as CheckoutSessionItem[]) : [],
        subtotal: Number(rest.subtotal || 0),
        recovery_url: buildRecoveryUrl(token),
    }
}

export async function getCheckoutSessions(view: CheckoutView = 'abandoned', page: number | string = 1) {
    await requireActionPermission('manage_orders')

    const supabase = createAdminClient()
    const { page: safePage, from, to } = getPagination({ page, limit: PAGE_SIZE })
    const idleCutoff = new Date(Date.now() - ABANDONED_AFTER_MINUTES * 60 * 1000).toISOString()

    let query = supabase
        .from('checkout_sessions')
        .select(SESSION_COLUMNS, { count: 'exact' })
        .or('email.not.is.null,phone.not.is.null')
        .order('updated_at', { ascending: false })
        .range(from, to)

    if (view === 'recovered') {
        query = query.eq('status', 'completed').not('recovered_at', 'is', null)
    } else if (view === 'active') {
        query = query.eq('status', 'open').gte('updated_at', idleCutoff)
    } else {
        query = query.eq('status', 'open').lt('updated_at', idleCutoff)
    }

    const [{ data, error, count }, statsResult] = await Promise.all([
        query,
        supabase.rpc('get_checkout_recovery_stats', { p_days: 30, p_idle_minutes: ABANDONED_AFTER_MINUTES }),
    ])

    if (error) {
        console.error('Error fetching checkout sessions', error)
        const missingTable = error.code === '42P01' || error.code === 'PGRST205'
        return {
            data: [] as CheckoutSessionRecord[],
            count: 0,
            page: safePage,
            pageSize: PAGE_SIZE,
            stats: null,
            error: missingTable
                ? 'The checkout_sessions table does not exist yet. Run supabase/migrations/20261113_checkout_sessions.sql in the Supabase SQL editor.'
                : error.message,
        }
    }

    const statsRow = (Array.isArray(statsResult.data) ? statsResult.data[0] : statsResult.data) as
        | { abandoned_count: number; abandoned_value: number; recovered_count: number; recovered_value: number }
        | null
        | undefined

    const stats: CheckoutRecoveryStats | null = statsRow
        ? {
              abandonedCount: Number(statsRow.abandoned_count || 0),
              abandonedValue: Number(statsRow.abandoned_value || 0),
              recoveredCount: Number(statsRow.recovered_count || 0),
              recoveredValue: Number(statsRow.recovered_value || 0),
          }
        : null

    return {
        data: ((data || []) as unknown as Array<Record<string, unknown>>).map(toRecord),
        count: count || 0,
        page: safePage,
        pageSize: PAGE_SIZE,
        stats,
        error: null as string | null,
    }
}

export async function sendCheckoutRecovery(sessionId: string) {
    const access = await requireActionPermission('manage_orders')
    const supabase = createAdminClient()

    const { data: session, error } = await supabase
        .from('checkout_sessions')
        .select('id, token, status, email, full_name, items, subtotal, recovery_emails_sent')
        .eq('id', sessionId)
        .maybeSingle()

    if (error || !session) {
        return { error: error?.message || 'Checkout not found.' }
    }
    if (session.status !== 'open') {
        return { error: 'This checkout has already been completed.' }
    }
    if (!session.email) {
        return { error: 'This shopper did not leave an email address. Use the WhatsApp or copy-link option instead.' }
    }
    if ((session.recovery_emails_sent || 0) >= MAX_RECOVERY_EMAILS) {
        return { error: `This shopper has already received ${MAX_RECOVERY_EMAILS} recovery emails.` }
    }

    const { data: settings } = await supabase
        .from('app_settings')
        .select('store_name, store_email')
        .limit(1)
        .maybeSingle()

    try {
        const result = await sendCheckoutRecoveryEmail({
            to: session.email,
            customerName: (session.full_name || '').split(' ')[0] || 'there',
            recoveryUrl: buildRecoveryUrl(session.token),
            subtotal: Number(session.subtotal || 0),
            items: Array.isArray(session.items) ? (session.items as CheckoutSessionItem[]) : [],
            storeName: settings?.store_name || 'Lily Luxora',
            replyTo: settings?.store_email || null,
        })

        if (!result.sent) {
            return { error: 'Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.' }
        }
    } catch (sendError) {
        return { error: sendError instanceof Error ? sendError.message : 'Could not send the recovery email.' }
    }

    const sentCount = (session.recovery_emails_sent || 0) + 1
    await supabase
        .from('checkout_sessions')
        .update({ recovery_emails_sent: sentCount, last_recovery_email_at: new Date().toISOString() })
        .eq('id', sessionId)

    await logAudit({
        actorId: access.user?.id,
        action: 'checkout.recovery_email_sent',
        entityType: 'checkout_session',
        entityId: sessionId,
        after: { to: session.email, recovery_emails_sent: sentCount },
    })

    revalidatePath('/admin/abandoned-checkouts')
    return { success: true as const }
}
