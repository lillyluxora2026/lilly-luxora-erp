'use client'

import { Suspense, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LayoutDashboard } from 'lucide-react'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [mode, setMode] = useState<'login' | 'forgot'>('login')
    const [resetSent, setResetSent] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams.get('return_to') || '/admin'

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(
                error.message === 'Invalid login credentials'
                    ? 'Wrong email or password. Check the spelling of your email address, or reset your password below.'
                    : error.message
            )
            setLoading(false)
        } else {
            router.push(returnTo)
            router.refresh()
        }
    }

    const handleSendReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setResetSent(true)
        }
        setLoading(false)
    }

    const switchMode = (nextMode: 'login' | 'forgot') => {
        setMode(nextMode)
        setError(null)
        setResetSent(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-gray-900">
                    <LayoutDashboard className="w-12 h-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {mode === 'login' ? 'Sign in to your account' : 'Reset your password'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={mode === 'login' ? handleLogin : handleSendReset}>
                        {mode === 'forgot' && (
                            <p className="text-sm text-gray-600">
                                Enter your account email and we will send you a link to set a new password.
                            </p>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    placeholder="Enter your email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                                />
                            </div>
                        </div>

                        {mode === 'login' && (
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => switchMode('forgot')}
                                        className="text-sm font-medium text-gray-600 underline hover:text-gray-900"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        placeholder="Enter your password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
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
                        )}

                        {resetSent && (
                            <div className="rounded-md bg-green-50 p-4 text-sm font-medium text-green-800">
                                If an account exists for {email.trim()}, a reset link is on its way. Open it in this same browser.
                            </div>
                        )}

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50"
                            >
                                {mode === 'login'
                                    ? loading ? 'Signing in...' : 'Sign in'
                                    : loading ? 'Sending...' : 'Send reset link'}
                            </button>
                        </div>

                        {mode === 'forgot' && (
                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className="w-full text-center text-sm font-medium text-gray-600 underline hover:text-gray-900"
                            >
                                Back to sign in
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <LoginForm />
        </Suspense>
    )
}
