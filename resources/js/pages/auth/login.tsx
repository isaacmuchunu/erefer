
import React, { useMemo, useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import { LoaderCircle, Eye, EyeOff, Building2, KeyRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

type LoginForm = {
    email: string
    password: string
    remember: boolean
    two_factor_code?: string
}

interface LoginProps {
    status?: string
    canResetPassword: boolean
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
        two_factor_code: '',
    })

    const [showPass, setShowPass] = useState(false)
    const [showOTP, setShowOTP] = useState<boolean>(() => (status ?? '').toLowerCase().includes('two'))

    const onSubmit: React.FormEventHandler = (e) => {
        e.preventDefault()
        post(route('login'), {
            onFinish: () => reset('password'),
        })
    }

    const twoFaHint = useMemo(() => {
        if (!status) return ''
        if (status.toLowerCase().includes('two')) return 'Two‑factor authentication is required. Enter your code below.'
        return status
    }, [status])

    return (
        <>
            <Head title="Log in — eRefer Kenya" />

            <div
                className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-page"
                style={{
                    backgroundColor: '#CDDFED',
                    backgroundImage: 'url(/images/login-register-bg.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="max-w-md w-full">
                    <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
                        {/* Brand + title */}
                        <div className="mb-6 text-center">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-gray-900">eRefer Kenya</span>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">Official</span>
                                    </div>
                                    <p className="text-xs text-gray-600">National Healthcare e‑Referral System</p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                Sign In
                            </h2>
                            <p className="text-sm text-gray-500">
                                Welcome back! Enter your credentials to access your account.
                            </p>
                        </div>

                        {twoFaHint && (
                            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                                {twoFaHint}
                            </div>
                        )}

                        {status && !twoFaHint && (
                            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                                {status}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email address"
                                    disabled={processing}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-sm text-blue-600 hover:text-blue-500">
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        autoComplete="current-password"
                                        className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        disabled={processing}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((s) => !s)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        aria-label={showPass ? 'Hide password' : 'Show password'}
                                    >
                                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Two Factor Code */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label htmlFor="two_factor_code" className="block text-sm font-medium text-gray-700">
                                        Two‑factor code (if prompted)
                                    </Label>
                                    <button
                                        type="button"
                                        className="text-xs text-blue-600 hover:underline"
                                        onClick={() => setShowOTP((v) => !v)}
                                    >
                                        {showOTP ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {showOTP && (
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="two_factor_code"
                                            name="two_factor_code"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            value={data.two_factor_code}
                                            onChange={(e) => setData('two_factor_code', e.target.value)}
                                            placeholder="6‑digit code"
                                            disabled={processing}
                                        />
                                    </div>
                                )}
                                {errors.two_factor_code && (
                                    <p className="mt-1 text-xs text-red-600">{errors.two_factor_code}</p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                    disabled={processing}
                                />
                                <Label htmlFor="remember" className="ml-2 text-sm text-gray-900">
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full flex justify-center items-center gap-2 rounded-lg"
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>

                            {/* Sign up link */}
                            <div className="text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link href={route('register')} className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign up
                                </Link>
                            </div>
                        </form>

                        {status && !twoFaHint && (
                            <div className="mt-4 text-center text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
