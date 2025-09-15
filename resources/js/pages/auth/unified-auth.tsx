import React, { useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import { LoaderCircle, Eye, EyeOff, Mail, Lock, User, Phone, Building2, Shield, ArrowLeft } from 'lucide-react'
import { ProHealthForm, ProHealthInput, ProHealthButton, ProHealthFormActions } from '@/components/prohealth'

type AuthForm = {
  name?: string
  email: string
  password: string
  password_confirmation?: string
  phone?: string
  facility_id?: string
  role?: string
  remember?: boolean
  terms?: boolean
}

interface UnifiedAuthProps {
  canResetPassword?: boolean
  facilities?: Array<{ id: string; name: string }>
  roles?: Array<{ value: string; label: string }>
}

export default function UnifiedAuth({ canResetPassword = true, facilities = [], roles = [] }: UnifiedAuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { data, setData, post, processing, errors, reset } = useForm<AuthForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    facility_id: '',
    role: '',
    remember: false,
    terms: false,
  })

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    
    if (isLogin) {
      post(route('login'), {
        onFinish: () => reset('password'),
      })
    } else {
      post(route('register'), {
        onFinish: () => reset('password', 'password_confirmation'),
      })
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    reset()
  }

  return (
    <>
      <Head title={`${isLogin ? 'Login' : 'Register'} — eRefer Kenya`} />
      
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#274760] to-[#307BC4] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="white" opacity="0.3" />
                  <path d="M 20 10 L 20 30 M 10 20 L 30 20" stroke="white" strokeWidth="0.5" opacity="0.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#auth-grid)" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 py-12">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 cs_radius_15 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl cs_primary_font cs_bold text-white">eRefer Kenya</h1>
                  <p className="text-white/80 text-sm cs_secondary_font">National Healthcare e‑Referral System</p>
                </div>
              </div>
              
              <h2 className="cs_fs_48 cs_primary_font cs_bold text-white mb-6">
                {isLogin ? 'Welcome Back' : 'Join the Network'}
              </h2>
              
              <p className="text-white/90 cs_fs_18 cs_secondary_font leading-relaxed mb-8">
                {isLogin 
                  ? 'Access your dashboard to manage referrals, track patients, and coordinate care across Kenya\'s healthcare network.'
                  : 'Create your account to join Kenya\'s national healthcare referral system and improve patient care coordination.'
                }
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white/80">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm cs_secondary_font">Government-backed platform</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Lock className="h-5 w-5" />
                  <span className="text-sm cs_secondary_font">Bank-level security & encryption</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm cs_secondary_font">2,847+ healthcare facilities connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {/* Back to Home Link */}
            <Link href="/" className="inline-flex items-center gap-2 text-sm cs_body_color hover:cs_accent_color transition-colors mb-8 cs_secondary_font">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="cs_fs_32 cs_primary_font cs_bold cs_heading_color">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="mt-2 text-sm cs_body_color cs_secondary_font">
                {isLogin 
                  ? 'Enter your credentials to access your account'
                  : 'Fill in your details to create a new account'
                }
              </p>
            </div>

            {/* Auth Form */}
            <ProHealthForm variant="default" onSubmit={onSubmit}>
              <div className="space-y-6">
                {!isLogin && (
                  <ProHealthInput
                    label="Full Name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    icon={User}
                    required
                    placeholder="Enter your full name"
                  />
                )}

                <ProHealthInput
                  label="Email Address"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  error={errors.email}
                  icon={Mail}
                  required
                  placeholder="Enter your email address"
                />

                <div className="relative">
                  <ProHealthInput
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                    placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {!isLogin && (
                  <>
                    <div className="relative">
                      <ProHealthInput
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={errors.password_confirmation}
                        required
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <ProHealthInput
                      label="Phone Number"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      error={errors.phone}
                      icon={Phone}
                      placeholder="+254 700 000 000"
                    />
                  </>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="cs_radius_5 border-gray-300 text-[#307BC4] focus:ring-[#307BC4]"
                      />
                      <span className="ml-2 text-sm cs_body_color cs_secondary_font">Remember me</span>
                    </label>
                    
                    {canResetPassword && (
                      <Link href={route('password.request')} className="text-sm cs_accent_color hover:cs_heading_color cs_secondary_font">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                )}

                {!isLogin && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.terms}
                      onChange={(e) => setData('terms', e.target.checked)}
                      className="cs_radius_5 border-gray-300 text-[#307BC4] focus:ring-[#307BC4]"
                      required
                    />
                    <span className="ml-2 text-sm cs_body_color cs_secondary_font">
                      I agree to the{' '}
                      <Link href="#" className="cs_accent_color hover:cs_heading_color">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="#" className="cs_accent_color hover:cs_heading_color">Privacy Policy</Link>
                    </span>
                  </div>
                )}
              </div>

              <ProHealthFormActions align="center" className="mt-8">
                <ProHealthButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  )}
                </ProHealthButton>
              </ProHealthFormActions>
            </ProHealthForm>

            {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <p className="text-sm cs_body_color cs_secondary_font">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  onClick={toggleMode}
                  className="cs_accent_color hover:cs_heading_color cs_semibold cs_primary_font"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
