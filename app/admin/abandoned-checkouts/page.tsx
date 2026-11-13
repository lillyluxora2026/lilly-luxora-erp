import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import RecoveryActions from '@/components/admin/checkouts/RecoveryActions'
import { requirePagePermission } from '@/lib/auth'
import { getCheckoutSessions, type CheckoutView } from '@/lib/actions/abandoned-checkout-actions'

const VIEWS: Array<{ key: CheckoutView; label: string; empty: string }> = [
    { key: 'abandoned', label: 'Abandoned', empty: 'No abandoned checkouts. Shoppers who leave checkout after entering their email or phone will appear here.' },
    { key: 'active', label: 'In progress', empty: 'Nobody is checking out right now.' },
    { key: 'recovered', label: 'Recovered', empty: 'No recovered checkouts yet. Orders placed through a recovery link will appear here.' },
]

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

function timeAgo(value: string | null) {
    if (!value) return '-'
    return formatDistanceToNow(new Date(value), { addSuffix: true })
}

export default async function AbandonedCheckoutsPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string; page?: string }>
}) {
    await requirePagePermission('manage_orders')

    const params = await searchParams
    const view = VIEWS.find((item) => item.key === params.view) || VIEWS[0]
    const { data: sessions, count, page, pageSize, stats, error } = await getCheckoutSessions(view.key, params.page || 1)
    const totalPages = Math.max(1, Math.ceil(count / pageSize))

    const statCards = [
        { label: 'Abandoned checkouts', value: stats ? String(stats.abandonedCount) : '-' },
        { label: 'Value waiting to be recovered', value: stats ? currency.format(stats.abandonedValue) : '-' },
        { label: 'Recovered orders', value: stats ? String(stats.recoveredCount) : '-' },
        { label: 'Recovered revenue', value: stats ? currency.format(stats.recoveredValue) : '-' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Abandoned Checkouts</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Shoppers who started checkout on the storefront but have not paid. Send them a link that restores their cart and details.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statCards.map((card) => (
                    <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
                        <p className="mt-1 text-xs text-gray-400">Last 30 days</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                {VIEWS.map((item) => (
                    <Link
                        key={item.key}
                        href={`/admin/abandoned-checkouts?view=${item.key}`}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${view.key === item.key ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {error && (
                    <div className="border-b border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700">{error}</div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cart</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Value</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Last activity</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Recovery</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sessions.map((session) => {
                                const location = [session.shipping_address?.city, session.shipping_address?.state].filter(Boolean).join(', ')

                                return (
                                    <tr key={session.id} className="align-top hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">
                                            <p className="font-medium text-gray-900">{session.full_name || 'Guest'}</p>
                                            {session.email && <p className="text-gray-600">{session.email}</p>}
                                            {session.phone && <p className="text-gray-600">{session.phone}</p>}
                                            {location && <p className="text-xs text-gray-400">{location}</p>}
                                        </td>
                                        <td className="max-w-xs px-6 py-4 text-sm text-gray-700">
                                            {session.items.slice(0, 3).map((item, index) => (
                                                <p key={`${item.id}-${index}`} className="truncate">
                                                    {item.quantity} × {item.name}
                                                    {item.variantLabel ? <span className="text-gray-400"> ({item.variantLabel})</span> : null}
                                                </p>
                                            ))}
                                            {session.items.length > 3 && (
                                                <p className="text-xs text-gray-400">+{session.items.length - 3} more</p>
                                            )}
                                            {session.coupon_code && (
                                                <p className="mt-1 text-xs text-gray-500">Coupon: {session.coupon_code}</p>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                            {currency.format(session.subtotal)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                            {timeAgo(session.status === 'completed' ? session.completed_at : session.updated_at)}
                                            {session.order_id && session.status === 'open' && (
                                                <p className="text-xs text-amber-600">Reached payment</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {session.status === 'completed' ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Order placed</span>
                                            ) : session.recovery_emails_sent > 0 ? (
                                                <>
                                                    <p>{session.recovery_emails_sent} email{session.recovery_emails_sent === 1 ? '' : 's'} sent</p>
                                                    <p className="text-xs text-gray-400">{timeAgo(session.last_recovery_email_at)}</p>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">Not contacted</span>
                                            )}
                                            {session.recovered_at && session.status === 'open' && (
                                                <p className="text-xs text-blue-600">Link opened {timeAgo(session.recovered_at)}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {session.status === 'completed' ? (
                                                session.order_id ? (
                                                    <Link href={`/admin/orders/${session.order_id}`} className="text-sm font-medium text-gray-900 underline">
                                                        View order
                                                    </Link>
                                                ) : null
                                            ) : (
                                                <RecoveryActions
                                                    sessionId={session.id}
                                                    recoveryUrl={session.recovery_url}
                                                    customerName={(session.full_name || '').split(' ')[0]}
                                                    hasEmail={Boolean(session.email)}
                                                    phone={session.phone}
                                                    emailsSent={session.recovery_emails_sent}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {sessions.length === 0 && !error && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">{view.empty}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {count > pageSize && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm text-gray-500">
                        <span>Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <Link href={`/admin/abandoned-checkouts?view=${view.key}&page=${page - 1}`} className="rounded-md border border-gray-300 px-3 py-1 font-medium text-gray-700 hover:bg-gray-50">
                                    Previous
                                </Link>
                            )}
                            {page < totalPages && (
                                <Link href={`/admin/abandoned-checkouts?view=${view.key}&page=${page + 1}`} className="rounded-md border border-gray-300 px-3 py-1 font-medium text-gray-700 hover:bg-gray-50">
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
