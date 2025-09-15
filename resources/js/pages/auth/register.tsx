import React, { useMemo, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { LoaderCircle, Eye, EyeOff, Lock, User, Mail, Building2, Phone } from 'lucide-react'
import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import toast, { Toaster } from 'react-hot-toast';

type RegisterForm = {
    first_name: string
    last_name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
    two_factor_enabled: boolean
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        two_factor_enabled: false,
    })

    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const passwordScore = useMemo(() => scorePassword(data.password), [data.password])

    const onSubmit: React.FormEventHandler = (e) => {
        e.preventDefault()

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                toast.success('Registration successful! Redirecting to login...', {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#10b981',
                        color: 'white',
                        fontWeight: '500',
                    },
                })
            },
            onError: (errors) => {
                const errorMessages = []
                if (errors.email) errorMessages.push(`Email: ${errors.email}`)
                if (errors.password) errorMessages.push(`Password: ${errors.password}`)
                if (errors.first_name) errorMessages.push(`First Name: ${errors.first_name}`)
                if (errors.last_name) errorMessages.push(`Last Name: ${errors.last_name}`)
                if (errors.phone) errorMessages.push(`Phone: ${errors.phone}`)

                if (errorMessages.length > 0) {
                    toast.error(`Validation Errors: ${errorMessages.join(', ')}`, {
                        duration: 6000,
                        position: 'top-center',
                        style: {
                            background: '#ef4444',
                            color: 'white',
                            fontWeight: '500',
                        },
                    })
                } else {
                    toast.error('Registration failed. Please check your information and try again.', {
                        duration: 4000,
                        position: 'top-center',
                        style: {
                            background: '#ef4444',
                            color: 'white',
                            fontWeight: '500',
                        },
                    })
                }
            }
        })
    }

    return (
        <>
            <Head title="Register — eRefer Kenya">
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <Toaster />

            {/* Page background: ProHealth blue theme matching login */}
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
                <div className="max-w-2xl w-full">
                    <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-100 font-poppins">
                        {/* Brand + title */}
                        <div className="mb-8 text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-gray-900">eRefer Kenya</span>
                                        <span className="text-sm font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">Official</span>
                                    </div>
                                    <p className="text-sm text-gray-600">National Healthcare e‑Referral System</p>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Create Account
                            </h2>
                            <p className="text-base text-gray-500">
                                Register as a patient to access healthcare referral services.
                            </p>
                        </div>

                        {/* SR error region */}
                        <div className="sr-only" aria-live="assertive">
                            {Object.values(errors).filter(Boolean).join(' ')}
                        </div>

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div>
                                    <Label htmlFor="first_name" className="block text-base font-medium text-gray-700 mb-2">
                                        First Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            type="text"
                                            required
                                            autoComplete="given-name"
                                            className="pl-10 text-base text-black placeholder:text-gray-400 rounded-md"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <InputError message={errors.first_name} className="mt-2 text-sm" />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <Label htmlFor="last_name" className="block text-base font-medium text-gray-700 mb-2">
                                        Last Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            type="text"
                                            required
                                            autoComplete="family-name"
                                            className="pl-10 text-base text-black placeholder:text-gray-400 rounded-md"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    <InputError message={errors.last_name} className="mt-2 text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div>
                                    <Label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            className="pl-10 text-base text-black placeholder:text-gray-400 rounded-md"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={processing}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-2 text-sm" />
                                </div>

                                {/* Phone */}
                                <div>
                                    <Label htmlFor="phone" className="block text-base font-medium text-gray-700 mb-2">
                                        Phone (optional)
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            className="pl-10 text-base text-black placeholder:text-gray-400 rounded-md"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            disabled={processing}
                                            placeholder="+254 7xx xxx xxx"
                                        />
                                    </div>
                                    <InputError message={errors.phone} className="mt-2 text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password */}
                                <div>
                                    <Label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPass ? 'text' : 'password'}
                                            required
                                            autoComplete="new-password"
                                            className="pl-10 pr-10 text-base text-black placeholder:text-gray-400 rounded-md"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            disabled={processing}
                                            placeholder="Strong password"
                                            aria-describedby="password-hint"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass((s) => !s)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-blue-800 rounded"
                                            aria-label={showPass ? 'Hide password' : 'Show password'}
                                            tabIndex={-1}
                                        >
                                            {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-2 text-sm" />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <Label htmlFor="password_confirmation" className="block text-base font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirm ? 'text' : 'password'}
                                            required
                                            autoComplete="new-password"
                                            className="pl-10 pr-10 text-base text-black placeholder:text-gray-400 rounded-md"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            disabled={processing}
                                            placeholder="Re-enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((s) => !s)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-blue-800 rounded"
                                            aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
                                            tabIndex={-1}
                                        >
                                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-2 text-sm" />
                                </div>
                            </div>

                            {/* Password hint + strength */}
                            <div>
                                <div id="password-hint" className="text-sm text-gray-600">
                                    At least 8 characters with letters, numbers, and symbols.
                                </div>
                                <PasswordStrength score={passwordScore as 0 | 1 | 2 | 3 | 4} />
                            </div>

                            {/* 2FA Toggle */}
                            <div>
                                <Label htmlFor="two_factor_enabled" className="block text-base font-medium text-gray-700 mb-2">
                                    Two‑Factor Authentication
                                </Label>
                                <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
                                    <div>
                                        <p className="text-base font-medium text-blue-600">Enable 2FA (optional)</p>
                                        <p className="text-sm text-blue-900/80">Add an extra layer of security.</p>
                                    </div>
                                    <Switch
                                        id="two_factor_enabled"
                                        checked={data.two_factor_enabled}
                                        onCheckedChange={(v) => setData('two_factor_enabled', v)}
                                        disabled={processing}
                                    />
                                </div>
                                <InputError message={(errors as any).two_factor_enabled} className="mt-2 text-sm" />
                            </div>

                            {/* Submit button */}
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 rounded-md text-base"
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                                <span className="ml-2 text-white">Create account</span>
                            </Button>

                            <p className="mt-4 text-center text-base text-gray-600">
                                Already have an account?{' '}
                                <TextLink href={route('login')} className="text-blue-900">
                                    Log in
                                </TextLink>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

function PasswordStrength({ score }: { score: 0 | 1 | 2 | 3 | 4 }) {
    const colors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-500', 'bg-blue-600']
    const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
    return (
        <div className="mt-2">
            <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`h-2 w-1/4 rounded ${i < score ? colors[score] : 'bg-gray-200'}`}
                    />
                ))}
            </div>
            <div className="mt-1 text-sm text-gray-600">{labels[score]}</div>
        </div>
    )
}

function scorePassword(pw: string): 0 | 1 | 2 | 3 | 4 {
    let score: 0 | 1 | 2 | 3 | 4 = 0
    if (!pw) return 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
}
