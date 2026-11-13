'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LayoutDashboard } from 'lucide-react'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
    const router = useRouter()
    const [supabase] = useState(() =>
        createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    )

    // 'checking' until we know whether the reset link signed the user in.
    const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')
    const [linkError, setLinkError] = useState<string | null>(null)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function checkSession() {
            const url = new URL(window.location.href)
            const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
            const errorDescription = url.searchParams.get('error_description') || hashParams.get('error_description')

            // getSession waits for the client to finish exchanging the code in the reset link.
            const { data } = await supabase.auth.getSession()
            if (cancelled) return

            if (data.session) {
                setStatus('ready')
            } else {
                setLinkError(errorDescription)
                setStatus('invalid')
            }
        }

        void checkSession()

        return () => {
            cancelled = true
        }
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
            return
        }
        if (password !== confirmPassword) {
            setError('The two passwords do not match.')
            return
        }

        setLoading(true)
        const { error: updateError } = await supabase.auth.updateUser({ password })

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
            return
        }

        router.push('/admin')
        router.refresh()
    }

    const inputClass =
        'appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm'

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-gray-900">
                    <LayoutDashboard className="w-12 h-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Set a new password</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {status === 'checking' && <p className="text-sm text-gray-600">Checking your reset link...</p>}

                    {status === 'invalid' && (
                        <div className="space-y-4">
                            <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-800">
                                {linkError || 'This reset link is invalid or has expired.'} Request a new link and open it in the same browser you requested it from.
                            </div>
                            <Link href="/login" className="block text-center text-sm font-medium text-gray-900 underline">
                                Back to sign in
                            </Link>
                        </div>
                    )}

                    {status === 'ready' && (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                    New password
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                                        className={inputClass}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-900"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                    Confirm new password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Type it again"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {error && <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-800">{error}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save new password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
