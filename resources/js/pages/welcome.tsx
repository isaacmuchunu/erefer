import React, { useEffect, useMemo, useState } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import { Building2, Stethoscope, Users, ArrowRight, Shield, Clock, CheckCircle, Phone, Mail, MapPin, Menu, X, ShieldCheck, HeartPulse, FileCheck, BarChart3, Globe2, Lock, CalendarCheck, Activity, ChevronRight, HelpCircle, BadgeCheck, AlertTriangle, Sparkles, Star, Play } from 'lucide-react'

/**
 * eRefer Kenya — National Healthcare e‑Referral System
 * ProHealth-themed Inertia React page with modern healthcare design,
 * professional color system (#274760 primary, #307BC4 accent),
 * and ProHealth-inspired layout patterns for healthcare referral system.
 */

export default function Welcome() {
  const { auth } = usePage().props as unknown as { auth: AuthProps };
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const year = new Date().getFullYear()

  return (
    <>
      {/* Head meta */}
      <Head title="eRefer Kenya — National Healthcare e‑Referral System | Ministry of Health" />

      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 px-3 py-2 rounded-md bg-[#274760] text-white shadow"
      >
        Skip to main content
      </a>

      <div className="min-h-screen flex flex-col bg-white text-gray-900 cs_secondary_font">
        {/* Government Top Bar */}
        <TopGovBar />

        {/* Kenya Flag Accent */}
        <FlagStripe />

        {/* ProHealth Header with mobile nav */}
        <Header
          authed={!!auth?.user}
          mobileOpen={mobileOpen}
          onToggleMobile={() => setMobileOpen((v) => !v)}
        />

        {/* Mobile Nav Drawer */}
        {mobileOpen ? <MobileNav authed={!!auth?.user} onClose={() => setMobileOpen(false)} /> : null}

        <main id="main" className="flex-1">
          {/* Hero Section */}
          <Hero authed={!!auth?.user} />

          {/* Trust & Stats Strip */}
          <TrustStatsStrip />

          {/* About Section */}
          <About />

          {/* How It Works */}
          <HowItWorks />

          {/* Feature Grid */}
          <Features />

          {/* Security & Compliance */}
          <SecurityCompliance />

          {/* Analytics Snapshot */}
          <AnalyticsSnapshot />



          {/* Case Studies / Testimonials */}
          <CaseStudies />

          {/* Partners */}
          <Partners />

          {/* FAQ */}
          <FAQ />

          {/* Call To Action */}
          <CTA authed={!!auth?.user} />

          {/* Contact */}
          <Contact />
        </main>

        {/* Footer */}
        <Footer year={year} />

        {/* Back To Top */}
        {showBackToTop && <BackToTop />}
      </div>
    </>
  )
}

/* -------------------------------------------
   Top Government Bar
-------------------------------------------- */
function TopGovBar() {
  return (
    <div className="bg-[#274760] text-white text-sm cs_secondary_font">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
        <span className="font-medium cs_heading_color text-white">Ministry of Health — Republic of Kenya</span>
        <div className="flex items-center gap-4">
          <span className="opacity-90">Emergency: 999</span>
          <span aria-hidden="true" className="opacity-40">|</span>
          <span className="opacity-90">Support: 0800‑REFER (0800‑733‑37)</span>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------
   Kenya Flag Stripe
-------------------------------------------- */
function FlagStripe() {
  return (
    <div className="w-full h-1.5" aria-hidden="true">
      <div className="grid grid-cols-5 h-full">
        <div className="bg-black" />
        <div className="bg-white" />
        <div className="bg-red-600" />
        <div className="bg-white" />
        <div className="bg-green-600" />
      </div>
    </div>
  )
}

/* -------------------------------------------
   Header + Mobile Nav
-------------------------------------------- */
interface AuthProps {
  user: any; // Replace with a more specific type if available
}

interface HeaderProps {
  authed: boolean;
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

interface MobileNavProps {
  authed: boolean;
  onClose: () => void;
}

interface HeroProps {
  authed: boolean;
}

interface HeroBadgeProps {
  icon: React.ReactNode;
  label: string;
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  bullets: string[];
}

interface KPIProps {
  value: string;
  label: string;
  trend: string;
}

interface CTAProps {
  authed: boolean;
}

interface ContactCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  detail: string;
}

interface FooterProps {
  year: number;
}

function Header({ authed, mobileOpen, onToggleMobile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur cs_shadow_1 border-b border-[#307BC4]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 cs_radius_15 bg-gradient-to-br from-[#307BC4] to-[#274760] flex items-center justify-center cs_shadow_1">
            <Building2 className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-xl cs_primary_font cs_bold tracking-tight cs_heading_color">eRefer Kenya</span>
              <span className="text-[10px] cs_semibold px-2 py-1 cs_radius_15 bg-[#307BC4]/10 cs_accent_color border border-[#307BC4]/20">
                Official
              </span>
            </div>
            <p className="text-xs cs_body_color cs_secondary_font">National Healthcare e‑Referral System</p>
          </div>
        </Link>

        {/* Search Input */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search facilities, doctors, or services..."
              className="cs_form_field w-full text-sm py-3 px-4 pr-10"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-4 w-4 cs_body_color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
          {authed ? (
            <Link
              href={route('dashboard')}
              className="cs_btn cs_style_1 cs_primary_font"
            >
              <span>Access Dashboard</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href={route('login')}
              className="cs_btn cs_style_1 cs_primary_font"
            >
              <span>Register/Login</span>
              <Shield className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={onToggleMobile}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          className="md:hidden inline-flex items-center justify-center w-12 h-12 cs_radius_10 border border-[#307BC4]/20 cs_heading_color hover:bg-[#307BC4]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#307BC4]/50 transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>
    </header>
  )
}

function NavLinks() {
  const links = [
    { href: '#about', label: 'About' },
    { href: '#how', label: 'How it Works' },
    { href: '#features', label: 'Features' },
    { href: '#security', label: 'Security' },
    { href: '#contact', label: 'Contact' },
  ]
  return (
    <>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm cs_medium cs_body_color hover:cs_accent_color transition-colors cs_primary_font relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#307BC4] after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
        >
          {l.label}
        </Link>
      ))}
    </>
  )
}

function MobileNav({ authed, onClose }: MobileNavProps) {
  return (
    <div
      id="mobile-nav"
      className="md:hidden border-b border-[#307BC4]/10 cs_white_bg cs_shadow_1"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Mobile Search */}
        <div className="relative">
          <input
            type="search"
            placeholder="Search facilities, doctors..."
            className="cs_form_field w-full text-sm py-3 px-4 pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 cs_body_color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="space-y-2">
          <Link href="#about" onClick={onClose} className="block py-2 cs_body_color hover:cs_accent_color cs_secondary_font">About</Link>
          <Link href="#how" onClick={onClose} className="block py-2 cs_body_color hover:cs_accent_color cs_secondary_font">How it Works</Link>
          <Link href="#features" onClick={onClose} className="block py-2 cs_body_color hover:cs_accent_color cs_secondary_font">Features</Link>
          <Link href="#security" onClick={onClose} className="block py-2 cs_body_color hover:cs_accent_color cs_secondary_font">Security</Link>
          <Link href="#contact" onClick={onClose} className="block py-2 cs_body_color hover:cs_accent_color cs_secondary_font">Contact</Link>
        </div>

        <div className="pt-2 border-t border-[#307BC4]/10">
          {authed ? (
            <Link
              href={route('dashboard')}
              onClick={onClose}
              className="cs_btn cs_style_1 cs_primary_font w-full justify-center"
            >
              <span>Access Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={route('login')}
              onClick={onClose}
              className="cs_btn cs_style_1 cs_primary_font w-full justify-center"
            >
              <span>Register/Login</span>
              <Shield className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------
   Hero
-------------------------------------------- */
function Hero({ authed }: HeroProps) {
  return (
    <section className="relative overflow-hidden cs_shape_wrap">
      {/* ProHealth gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#274760] via-[#307BC4] to-[#274760]" />

      {/* ProHealth decorative shapes */}
      <div className="cs_shape_1 cs_position_1" aria-hidden="true" />
      <div className="cs_shape_1 cs_position_2" aria-hidden="true" />

      {/* Subtle medical pattern overlay */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="medical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="white" opacity="0.3" />
              <path d="M 20 10 L 20 30 M 10 20 L 30 20" stroke="white" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-grid)" />
        </svg>
      </div>

      {/* ProHealth decorative corner elements */}
      <div className="pointer-events-none absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-white/5 to-[#86BBF1]/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-[#86BBF1]/5 to-white/5 blur-2xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <span className="inline-flex items-center gap-2 text-white bg-white/10 ring-1 ring-white/20 px-4 py-2 cs_radius_25 text-sm cs_medium cs_primary_font backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Government‑backed platform
          </span>

          <h1 className="mt-8 cs_fs_72 cs_primary_font cs_bold tracking-tight text-white leading-tight">
            Kenya National Healthcare<br />
            <span className="text-[#86BBF1]">e‑Referral System</span>
          </h1>
          <p className="mt-6 cs_fs_20 text-white/90 leading-relaxed cs_secondary_font max-w-3xl mx-auto">
            The official digital platform for managing patient referrals across Kenya’s healthcare network.
            Connecting patients, providers, and facilities for efficient, coordinated care delivery nationwide.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            {authed ? (
              <Link
                href={route('dashboard')}
                className="cs_btn cs_style_1 bg-white text-[#274760] hover:bg-white/90 cs_primary_font px-8 py-4"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  href={route('register')}
                  className="cs_btn cs_style_1 bg-white text-[#274760] hover:bg-white/90 cs_primary_font px-8 py-4"
                >
                  <span>Secure Registration</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="#about"
                  className="cs_btn border-2 border-white/60 text-white px-8 py-4 hover:bg-white/10 transition-colors cs_primary_font cs_radius_25"
                >
                  <span>Learn More</span>
                  <Play className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          {/* ProHealth Hero Trust Badges */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <HeroBadge icon={<Shield className="h-6 w-6 text-white" />} label="Government Approved" />
            <HeroBadge icon={<Lock className="h-6 w-6 text-white" />} label="Data Protection (DPA 2019)" />
            <HeroBadge icon={<Clock className="h-6 w-6 text-white" />} label="24/7 Availability" />
            <HeroBadge icon={<Globe2 className="h-6 w-6 text-white" />} label="47 Counties Connected" />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroBadge({ icon, label }: HeroBadgeProps) {
  return (
    <div className="flex items-center justify-center gap-4 bg-white/10 cs_radius_20 py-4 px-6 ring-1 ring-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 cs_shadow_1">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <span className="text-white text-sm cs_medium cs_primary_font text-center">{label}</span>
    </div>
  )
}

/* -------------------------------------------
   Trust & Stats Strip
-------------------------------------------- */
function TrustStatsStrip() {
  const items = [
    { icon: <Activity className="h-6 w-6 text-[#307BC4]" />, label: 'Active Facilities', value: '2,847' },
    { icon: <BadgeCheck className="h-6 w-6 text-[#307BC4]" />, label: 'Providers Verified', value: '15,643' },
    { icon: <FileCheck className="h-6 w-6 text-[#307BC4]" />, label: 'Referrals Processed', value: '89,234' },
    { icon: <CalendarCheck className="h-6 w-6 text-[#307BC4]" />, label: 'Avg. Routing Time', value: '< 2 min' },
  ]
  return (
    <section className="cs_gray_bg_1 border-y border-[#307BC4]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center gap-4 p-6 cs_radius_20 cs_white_bg cs_shadow_1 hover:cs_shadow_2 transition-all duration-300">
              <div className="w-12 h-12 cs_radius_15 bg-[#307BC4]/10 flex items-center justify-center flex-shrink-0">{it.icon}</div>
              <div>
                <p className="text-sm cs_body_color cs_secondary_font">{it.label}</p>
                <p className="cs_fs_24 cs_bold cs_accent_color cs_primary_font">{it.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   About
-------------------------------------------- */
function About() {
  return (
    <section id="about" className="py-20 sm:py-24 cs_white_bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About eRefer Kenya"
          title="Transforming Healthcare Access"
          subtitle="Developed with the Ministry of Health to streamline patient care coordination across all levels of care."
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <p className="cs_fs_18 cs_body_color leading-relaxed cs_secondary_font">
              eRefer is Kenya’s official healthcare referral management system. Our platform ensures timely, appropriate
              healthcare by connecting community health units, dispensaries, hospitals, and specialized facilities in a
              unified digital network—delivering safer, faster, and more coordinated care.
            </p>

            <div className="mt-8 space-y-6">
              <AboutPoint
                title="Real‑time Referral Tracking"
                description="Monitor patient referrals from initiation to completion, minimizing delays and reducing duplication."
              />
              <AboutPoint
                title="Resource Optimization"
                description="Allocate beds, equipment, and personnel efficiently across facilities to match capacity and demand."
              />
              <AboutPoint
                title="Data‑Driven Insights"
                description="Plan smarter with robust analytics on volumes, routing patterns, turnaround, and outcomes."
              />
            </div>
          </div>

          <div className="cs_white_bg cs_radius_25 cs_shadow_1 p-10 hover:cs_shadow_2 transition-all duration-300">
            <h3 className="cs_fs_24 cs_primary_font cs_bold cs_heading_color mb-8">System Statistics</h3>
            <div className="grid grid-cols-2 gap-8">
              <Stat value="2,847" label="Healthcare Facilities" />
              <Stat value="15,643" label="Registered Providers" />
              <Stat value="89,234" label="Referrals Processed" />
              <Stat value="47" label="Counties Connected" />
            </div>
            <p className="mt-8 text-sm cs_body_color cs_secondary_font">
              Figures are illustrative placeholders. Connect to your live data source to display real metrics.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

interface AboutPointProps {
  title: string;
  description: string;
}

function AboutPoint({ title, description }: AboutPointProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 cs_radius_10 bg-[#307BC4]/10 flex items-center justify-center mt-1">
        <CheckCircle className="h-5 w-5 cs_accent_color" aria-hidden="true" />
      </div>
      <div>
        <h3 className="cs_fs_18 cs_semibold cs_heading_color cs_primary_font mb-2">{title}</h3>
        <p className="cs_body_color cs_secondary_font leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

interface StatProps {
  value: string;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="text-center">
      <div className="cs_fs_48 cs_bold cs_accent_color tabular-nums cs_primary_font">{value}</div>
      <div className="text-sm cs_body_color cs_secondary_font mt-2">{label}</div>
    </div>
  )
}

/* -------------------------------------------
   How It Works
-------------------------------------------- */
function HowItWorks() {
  const steps = [
    {
      title: 'Initiate Referral',
      description: 'A provider completes a digital referral with clinical details and urgency level.',
      icon: <Stethoscope className="h-6 w-6 cs_accent_color" />,
      number: '01',
    },
    {
      title: 'Smart Routing',
      description: 'System suggests facilities based on capacity, distance, capability, and priority.',
      icon: <Globe2 className="h-6 w-6 cs_accent_color" />,
      number: '02',
    },
    {
      title: 'Facility Acceptance',
      description: 'Receiving facility confirms availability and prepares for patient arrival.',
      icon: <FileCheck className="h-6 w-6 cs_accent_color" />,
      number: '03',
    },
    {
      title: 'Track & Close',
      description: 'Status updates, notifications, and handover notes finalize the referral.',
      icon: <CheckCircle className="h-6 w-6 cs_accent_color" />,
      number: '04',
    },
  ]
  return (
    <section id="how" className="py-20 sm:py-24 cs_white_bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How it Works"
          title="Coordinated referrals in four simple steps"
          subtitle="Designed for speed, safety, and accountability at every stage."
          center
        />

        {/* Process Flow Timeline */}
        <div className="mt-16 relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-[#307BC4] via-[#307BC4] to-[#307BC4] opacity-20"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="relative">
                {/* Step Card */}
                <div className="cs_white_bg cs_radius_25 cs_shadow_1 p-8 text-center hover:cs_shadow_2 transition-all duration-300 group relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 cs_radius_10 bg-gradient-to-br from-[#307BC4] to-[#274760] text-white cs_fs_14 cs_bold cs_primary_font flex items-center justify-center">
                      {s.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 cs_radius_20 bg-[#307BC4]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    {s.icon}
                  </div>

                  {/* Content */}
                  <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color mb-3">{s.title}</h3>
                  <p className="cs_body_color cs_secondary_font leading-relaxed">{s.description}</p>
                </div>

                {/* Connecting Arrow */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-20 -right-4 z-20 items-center justify-center">
                    <div className="w-8 h-8 cs_radius_10 cs_white_bg cs_shadow_1 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 cs_accent_color" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   Features
-------------------------------------------- */
function Features() {
  return (
    <section id="features" className="py-20 sm:py-24 cs_gray_bg_1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Core System Features"
          title="Built for providers, optimized for patients"
          subtitle="Comprehensive tools supporting healthcare delivery across Kenya."
          center
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Building2 className="h-8 w-8 cs_accent_color" aria-hidden="true" />}
            iconBg="bg-[#307BC4]/10"
            title="Facility Management"
            description="Manage capacity, equipment, and resources across the national network."
            bullets={[
              'Real‑time bed availability',
              'Equipment tracking',
              'Capacity planning',
            ]}
          />
          <FeatureCard
            icon={<Stethoscope className="h-8 w-8 text-teal-700" aria-hidden="true" />}
            iconBg="bg-teal-100"
            title="Provider Directory"
            description="Find specialists by location, specialty, qualifications, and availability."
            bullets={[
              'Specialist lookup',
              'Availability scheduling',
              'Credential verification',
            ]}
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 cs_accent_color" aria-hidden="true" />}
            iconBg="bg-[#307BC4]/10"
            title="Referral Management"
            description="Streamlined workflows with digital forms, routing, tracking, and coordination."
            bullets={[
              'Digital referral forms',
              'Automated routing',
              'Status notifications',
            ]}
          />
          <FeatureCard
            icon={<HeartPulse className="h-8 w-8 text-red-700" aria-hidden="true" />}
            iconBg="bg-red-100"
            title="Emergency Prioritization"
            description="Triage support and escalation paths for time‑critical referrals."
            bullets={[
              'Urgency flags',
              'Escalation routing',
              'EMS coordination',
            ]}
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8 cs_accent_color" aria-hidden="true" />}
            iconBg="bg-[#307BC4]/10"
            title="Analytics & Insights"
            description="Dashboards for volumes, turnaround time, capacity, and outcomes."
            bullets={[
              'County and facility views',
              'KPI tracking',
              'Export & API access',
            ]}
          />
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 cs_accent_color" aria-hidden="true" />}
            iconBg="bg-[#307BC4]/10"
            title="Access Control"
            description="Role‑based access with audit trails to protect patient privacy."
            bullets={[
              'Role & scope controls',
              'Audit logs',
              'Granular permissions',
            ]}
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, iconBg, title, description, bullets }: FeatureCardProps) {
  return (
    <div className="group cs_white_bg cs_radius_25 border border-[#307BC4]/10 p-8 cs_shadow_1 hover:cs_shadow_2 transition-all duration-300">
      <div className={`w-16 h-16 ${iconBg} cs_radius_20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color">{title}</h3>
      <p className="mt-3 cs_body_color cs_secondary_font leading-relaxed">{description}</p>
      <ul className="mt-6 text-sm cs_body_color cs_secondary_font space-y-3">
        {bullets.map((b: string, i: number) => (
          <li key={i} className="flex items-center">
            <div className="w-5 h-5 cs_radius_10 bg-[#307BC4]/10 flex items-center justify-center mr-3 flex-shrink-0">
              <CheckCircle className="h-3 w-3 cs_accent_color" aria-hidden="true" />
            </div>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------
   Security & Compliance
-------------------------------------------- */
function SecurityCompliance() {
  const items = [
    {
      icon: <Lock className="h-6 w-6 cs_accent_color" />,
      title: 'Encryption In Transit & At Rest',
      desc: 'Modern TLS and encrypted storage safeguard sensitive health information with bank-level security.',
      badge: 'AES-256',
    },
    {
      icon: <Shield className="h-6 w-6 cs_accent_color" />,
      title: 'Kenya DPA 2019 Alignment',
      desc: 'Aligned with the Data Protection Act (2019) and local regulatory standards.',
      badge: 'DPA 2019',
    },
    {
      icon: <FileCheck className="h-6 w-6 cs_accent_color" />,
      title: 'Audit Trails',
      desc: 'Comprehensive logs for access, changes, and referral lifecycle events.',
      badge: 'RBAC',
    },
    {
      icon: <AlertTriangle className="h-6 w-6 cs_accent_color" />,
      title: 'Incident Response',
      desc: 'Documented processes for timely detection, escalation, and resolution.',
      badge: '24/7',
    },
  ]
  return (
    <section id="security" className="py-20 sm:py-24 cs_white_bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Security & Compliance"
          title="Built with trust and transparency"
          subtitle="Comprehensive security measures protecting patient data and ensuring regulatory compliance."
          center
        />

        {/* Trust Indicators */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-8 p-6 cs_white_bg cs_radius_25 cs_shadow_1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 cs_radius_10 bg-green-500"></div>
              <span className="text-sm cs_semibold cs_primary_font">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 cs_radius_10 bg-green-500"></div>
              <span className="text-sm cs_semibold cs_primary_font">ISO 27001</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 cs_radius_10 bg-green-500"></div>
              <span className="text-sm cs_semibold cs_primary_font">HIPAA Ready</span>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((it, idx) => (
            <div key={idx} className="cs_white_bg cs_radius_25 cs_shadow_1 p-8 hover:cs_shadow_2 transition-all duration-300 group">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 cs_radius_20 bg-[#307BC4]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {it.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="cs_fs_20 cs_primary_font cs_semibold cs_heading_color">{it.title}</h3>
                    <span className="px-3 py-1 cs_radius_15 bg-[#307BC4]/10 cs_accent_color text-xs cs_semibold cs_primary_font">
                      {it.badge}
                    </span>
                  </div>
                  <p className="cs_body_color cs_secondary_font leading-relaxed">{it.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 cs_white_bg cs_radius_25 cs_shadow_1">
            <div className="cs_fs_48 cs_bold cs_accent_color cs_primary_font">99.9%</div>
            <div className="text-sm cs_body_color cs_secondary_font mt-2">Security Uptime</div>
          </div>
          <div className="text-center p-6 cs_white_bg cs_radius_25 cs_shadow_1">
            <div className="cs_fs_48 cs_bold cs_accent_color cs_primary_font">0</div>
            <div className="text-sm cs_body_color cs_secondary_font mt-2">Data Breaches</div>
          </div>
          <div className="text-center p-6 cs_white_bg cs_radius_25 cs_shadow_1">
            <div className="cs_fs_48 cs_bold cs_accent_color cs_primary_font">&lt;1s</div>
            <div className="text-sm cs_body_color cs_secondary_font mt-2">Threat Response</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   Analytics Snapshot (illustrative)
-------------------------------------------- */
function AnalyticsSnapshot() {
  return (
    <section className="py-20 sm:py-24 cs_gray_bg_1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Analytics Snapshot"
          title="Data‑driven healthcare insights"
          subtitle="Real‑time visibility into referral patterns, capacity utilization, and system performance."
          center
        />
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Card */}
          <div className="lg:col-span-2 cs_white_bg cs_radius_25 cs_shadow_1 p-8 hover:cs_shadow_2 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="cs_fs_24 cs_primary_font cs_bold cs_heading_color">Weekly Referral Volume</h3>
              <div className="flex items-center gap-2 text-sm cs_body_color cs_secondary_font">
                <div className="w-3 h-3 cs_radius_10 bg-[#307BC4]"></div>
                <span>This Week</span>
                <div className="w-3 h-3 cs_radius_10 bg-[#86BBF1]"></div>
                <span>Last Week</span>
              </div>
            </div>

            {/* Enhanced Chart Visualization */}
            <div className="h-64 bg-gradient-to-br from-[#307BC4]/5 to-[#86BBF1]/10 cs_radius_20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-8 pb-8">
                {[65, 78, 52, 89, 95, 73, 84].map((height, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 bg-gradient-to-t from-[#307BC4] to-[#86BBF1] cs_radius_5 transition-all duration-1000 hover:scale-110"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs cs_body_color cs_secondary_font">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </span>
                  </div>
                ))}
              </div>
              <BarChart3 className="h-16 w-16 cs_accent_color opacity-20" aria-hidden="true" />
            </div>
          </div>

          {/* Side Cards */}
          <div className="space-y-8">
            <div className="cs_white_bg cs_radius_25 cs_shadow_1 p-6 hover:cs_shadow_2 transition-all duration-300">
              <h3 className="cs_fs_18 cs_primary_font cs_semibold cs_heading_color flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 cs_accent_color" /> Turnaround Time
              </h3>
              <p className="text-sm cs_body_color cs_secondary_font mb-4">Median routing time</p>
              <div className="text-center">
                <div className="cs_fs_32 cs_bold cs_accent_color cs_primary_font">1m 47s</div>
                <div className="text-sm cs_body_color cs_secondary_font">Median</div>
                <div className="text-xs cs_accent_color/80 mt-1">+12s vs last week</div>
              </div>
            </div>

            <div className="cs_white_bg cs_radius_25 cs_shadow_1 p-6 hover:cs_shadow_2 transition-all duration-300">
              <h3 className="cs_fs_18 cs_primary_font cs_semibold cs_heading_color flex items-center gap-2 mb-4">
                <HeartPulse className="h-5 w-5 text-red-600" /> Emergency Share
              </h3>
              <p className="text-sm cs_body_color cs_secondary_font mb-4">Week to date</p>
              <div className="text-center">
                <div className="cs_fs_32 cs_bold text-red-600 cs_primary_font">18.4%</div>
                <div className="text-sm cs_body_color cs_secondary_font">Emergency</div>
                <div className="text-xs text-red-600/80 mt-1">-0.9% vs last week</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MiniChart() {
  // Simple decorative bars
  const bars = [18, 24, 22, 26, 30, 28, 34]
  return (
    <div className="mt-6 h-32 flex items-end gap-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-[#307BC4]/30 to-[#307BC4] cs_radius_5"
          style={{ height: `${h * 3}px` }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function KPI({ value, label, trend }: KPIProps) {
  return (
    <div className="mt-6">
      <div className="cs_fs_32 cs_bold cs_accent_color cs_primary_font">{value}</div>
      <div className="text-sm cs_body_color cs_secondary_font">{label}</div>
      <div className="text-xs cs_accent_color/80 mt-1 cs_secondary_font">{trend}</div>
    </div>
  )
}



/* -------------------------------------------
   Case Studies / Testimonials
-------------------------------------------- */
function CaseStudies() {
  const cases = [
    {
      title: 'County General Hospital',
      quote:
        'With eRefer, our emergency transfers decreased average coordination time by over 30%, improving patient outcomes.',
      person: 'Head of Emergency Services',
    },
    {
      title: 'Regional Referral Centre',
      quote:
        'Digital routing allowed us to pre‑allocate beds and equipment, reducing bottlenecks during peak hours.',
      person: 'Facility Administrator',
    },
    {
      title: 'Community Health Unit',
      quote:
        'We streamlined referrals to specialized clinics and improved follow‑ups through status notifications.',
      person: 'CHU Coordinator',
    },
  ]
  return (
    <section className="py-20 sm:py-24 cs_gray_bg_1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Case Studies"
          title="Real improvements in coordination and outcomes"
          subtitle="Stories from facilities and teams adopting the system."
        />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((c, idx) => (
            <blockquote key={idx} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
                <Sparkles className="h-4 w-4" /> {c.title}
              </div>
              <p className="text-gray-700">{'“'}{c.quote}{'”'}</p>
              <footer className="mt-3 text-sm text-gray-500">— {c.person}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   Partners
-------------------------------------------- */
function Partners() {
  const partners = [
    { name: 'Ministry of Health', icon: <Building2 className="h-6 w-6 cs_accent_color" /> },
    { name: 'Public Hospitals', icon: <Stethoscope className="h-6 w-6 cs_accent_color" /> },
    { name: 'County Health Depts', icon: <Users className="h-6 w-6 cs_accent_color" /> },
    { name: 'Training Institutes', icon: <FileCheck className="h-6 w-6 cs_accent_color" /> },
    { name: 'Regulatory Bodies', icon: <ShieldCheck className="h-6 w-6 cs_accent_color" /> },
    { name: 'Emergency Services', icon: <HeartPulse className="h-6 w-6 cs_accent_color" /> },
  ]
  return (
    <section className="py-20 sm:py-24 cs_white_bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Partners & Stakeholders"
          title="Working together for better care"
          subtitle="Aligned with public facilities, regulators, and emergency responders nationwide."
          center
        />
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className="cs_white_bg cs_radius_20 cs_shadow_1 p-8 hover:cs_shadow_2 transition-all duration-300 text-center group"
            >
              <div className="w-16 h-16 cs_radius_20 bg-[#307BC4]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {p.icon}
              </div>
              <h3 className="cs_fs_18 cs_primary_font cs_semibold cs_heading_color">{p.name}</h3>
            </div>
          ))}
        </div>

        {/* Partnership Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="cs_fs_48 cs_bold cs_accent_color cs_primary_font">47</div>
            <div className="text-sm cs_body_color cs_secondary_font mt-2">Counties Connected</div>
          </div>
          <div className="text-center">
            <div className="cs_fs_48 cs_bold cs_accent_color cs_primary_font">2,847</div>
            <div className="text-sm cs_body_color cs_secondary_font mt-2">Healthcare Facilities</div>
          </div>
          <div className="text-center">
            <div className="cs_fs_48 cs_bold cs_accent_color cs_primary_font">15,643</div>
            <div className="text-sm cs_body_color cs_secondary_font mt-2">Registered Providers</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   FAQ
-------------------------------------------- */
function FAQ() {
    const faqs = [
        {
            q: 'Who can register for eRefer and what are the specific requirements for healthcare providers and authorized facility administrators?',
            a: 'Licensed healthcare providers including doctors, nurses, clinical officers, and medical specialists can register for eRefer. Authorized facility administrators from hospitals, clinics, and health centers are also eligible. Registration requires valid professional licenses, facility accreditation documents, and verification through relevant regulatory bodies.',
        },
        {
            q: 'Is patient data protected and what specific security measures are implemented to comply with Kenya\'s Data Protection Act (2019)?',
            a: 'Yes. The platform applies modern end-to-end encryption, role-based access controls, and comprehensive audit logging, fully aligned with Kenya\'s Data Protection Act (2019). All data is stored securely with regular security audits and breach prevention measures to ensure maximum patient privacy protection.',
        },
        {
            q: 'Does it work on mobile devices and what are the technical requirements for optimal performance across different platforms?',
            a: 'Yes. eRefer is fully responsive and accessible on modern browsers across desktop and mobile devices including iOS, Android, and web platforms. The system requires a stable internet connection and works optimally with Chrome, Firefox, Safari, and Edge browsers.',
        },
        {
            q: 'How do I get training and what comprehensive support resources are available for healthcare facilities implementing eRefer?',
            a: 'Training resources include online tutorials, interactive webinars, on-site facility training, and peer mentorship programs. Regional support centers provide 24/7 technical assistance, while county health departments offer local coordination. Contact support or your county health department for personalized training schedules.',
        },
    ];

    return (
        <section className="py-20 sm:py-24 bg-[e9ecef]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    eyebrow="FAQ"
                    title="Frequently asked questions"
                    subtitle="If you need additional help, contact our support team."
                    center
                />
                <div className="mt-16 space-y-6">
                    {faqs.map((f, idx) => (
                        <details key={idx} className="group cs_white_bg cs_radius_20 cs_shadow_1 p-6 open:cs_shadow_2 hover:cs_shadow_2 transition-all duration-300">
                            <summary className="flex cursor-pointer items-center justify-between gap-4 text-left">
                                <div className="flex items-center gap-3 cs_fs_18 cs_semibold cs_heading_color cs_primary_font">
                                    <div className="w-8 h-8 cs_radius_10 bg-[#307BC4]/10 flex items-center justify-center flex-shrink-0">
                                        <HelpCircle className="h-4 w-4 cs_accent_color" />
                                    </div>
                                    {f.q}
                                </div>
                                <ChevronRight className="h-5 w-5 cs_body_color group-open:rotate-90 transition-transform duration-300 flex-shrink-0" />
                            </summary>
                            <div className="mt-4 pl-11 cs_body_color cs_secondary_font leading-relaxed">
                                {f.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------
   CTA
-------------------------------------------- */
function CTA({ authed }: CTAProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ready to streamline referrals across your facility?
            </h2>
            <p className="text-emerald-50/90 mt-2">
              Join the national healthcare e‑referral network and improve coordination today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {authed ? (
              <Link
                href={route('dashboard')}
                className="inline-flex items-center gap-2 bg-white text-emerald-900 px-5 py-3 rounded-md font-semibold shadow-sm hover:bg-emerald-50 transition"
              >
                Open Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href={route('register')}
                  className="inline-flex items-center gap-2 bg-white text-emerald-900 px-5 py-3 rounded-md font-semibold shadow-sm hover:bg-emerald-50 transition"
                >
                  Register Now <Shield className="h-5 w-5" />
                </Link>
                <Link
                  href={route('login')}
                  className="inline-flex items-center gap-2 border border-white/70 text-white px-5 py-3 rounded-md font-semibold hover:bg-white/10 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------
   Contact
-------------------------------------------- */
function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-emerald-100 p-8 sm:p-10">
          <div className="text-center max-w-2xl mx-auto">
            <SectionHeader
              eyebrow="Support"
              title="Need assistance?"
              subtitle="Our support team helps providers navigate the system and access training."
              center
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <ContactCard
              icon={<Phone className="h-6 w-6 text-emerald-700" aria-hidden="true" />}
              iconBg="bg-emerald-100"
              title="Call Support"
              subtitle="24/7 Technical Support"
              detail="0800‑REFER (733‑37)"
            />
            <ContactCard
              icon={<Mail className="h-6 w-6 text-teal-700" aria-hidden="true" />}
              iconBg="bg-teal-100"
              title="Email Support"
              subtitle="Response within 24 hours"
              detail="support@erefer.health.go.ke"
            />
            <ContactCard
              icon={<MapPin className="h-6 w-6 text-emerald-700" aria-hidden="true" />}
              iconBg="bg-emerald-100"
              title="Training Centers"
              subtitle="Regional support offices"
              detail="Find nearest center"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactCard({ icon, iconBg, title, subtitle, detail }: ContactCardProps) {
  return (
    <div className="text-center rounded-xl border border-emerald-100 p-6 bg-white">
      <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center mx-auto mb-4 ring-1 ring-black/5`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
      <p className="text-emerald-700 font-medium mt-2">{detail}</p>
    </div>
  )
}

/* -------------------------------------------
   Footer
-------------------------------------------- */
function Footer({ year }: FooterProps) {
  return (
    <footer className="bg-[#274760] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-6 w-6 text-[#307BC4]" aria-hidden="true" />
              <span className="text-lg cs_primary_font cs_bold">eRefer Kenya</span>
            </div>
            <p className="text-white/80 text-sm cs_secondary_font">
              Official healthcare e‑referral system of the Republic of Kenya, Ministry of Health.
            </p>
          </div>

          <div>
            <h4 className="cs_primary_font cs_semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80 cs_secondary_font">
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">User Guide</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">System Status</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Training Resources</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Technical Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="cs_primary_font cs_semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-white/80 cs_secondary_font">
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Data Protection</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Accessibility</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="cs_primary_font cs_semibold mb-3">Ministry of Health</h4>
            <ul className="space-y-2 text-sm text-white/80 cs_secondary_font">
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Official Website</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Health Policies</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">National Guidelines</Link></li>
              <li><Link href="#" className="hover:text-[#307BC4] transition-colors">Contact Ministry</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#307BC4]/20 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/70 cs_secondary_font">
            © {year} Ministry of Health, Republic of Kenya. All rights reserved.
          </p>
          <p className="text-sm text-white/70 cs_secondary_font">
            System Version 2.1.3 · Last Updated: March 2025
          </p>
        </div>
      </div>
    </footer>
  )
}

/* -------------------------------------------
   Utilities
-------------------------------------------- */
function SectionHeader({ eyebrow, title, subtitle, center }: SectionHeaderProps) {
  return (
    <div className={`cs_section_heading ${center ? 'text-center' : ''}`}>
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 cs_accent_color bg-[#307BC4]/10 ring-1 ring-[#307BC4]/20 px-4 py-2 cs_radius_25 text-sm cs_medium cs_primary_font">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className={`cs_section_title mt-6 cs_fs_48 cs_primary_font cs_bold tracking-tight cs_heading_color ${center ? '' : ''}`}>{title}</h2>
      {subtitle ? <p className={`mt-4 cs_fs_18 cs_body_color cs_secondary_font leading-relaxed ${center ? 'mx-auto max-w-3xl' : ''}`}>{subtitle}</p> : null}
    </div>
  )
}

function BackToTop() {
  const onClick = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-700 text-white shadow-lg hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      aria-label="Back to top"
    >
      Top
      <ArrowRight className="rotate-270 h-4 w-4" aria-hidden="true" />
    </button>
  )
}

/* Note: rotate-270 utility not default; using inline style for rotation */
const rotate270 = `
  .rotate-270 { transform: rotate(270deg); }
`
if (typeof document !== 'undefined' && !document.getElementById('rotate-270-style')) {
  const style = document.createElement('style')
  style.id = 'rotate-270-style'
  style.innerHTML = rotate270
  document.head.appendChild(style)
}
