import { Link } from 'react-router-dom'
import {
  Search, ShieldCheck, ArrowRight, Ruler,
  CheckCircle2, Star, Users, TrendingUp,
  MapPin, Wallet, Phone, ChevronRight
} from 'lucide-react'

const STATS = [
  { value: '2,400+', label: 'Verified Listings' },
  { value: '800+', label: 'Trusted Realtors' },
  { value: '₦4.2B+', label: 'Transactions Secured' },
  { value: '15,000+', label: 'Happy Buyers' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Free Account',
    desc: 'Sign up in under 2 minutes. Choose your role — buyer, realtor, agent, or architect — and verify your identity via KYC.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Browse & Discover Land',
    desc: 'Search thousands of verified land listings across Nigeria. Filter by state, LGA, price, and size. View detailed property info and gallery.',
    icon: Search,
  },
  {
    step: '03',
    title: 'Connect via WhatsApp',
    desc: 'Found the perfect plot? Connect directly with the verified realtor or agent on WhatsApp — zero middlemen, zero commission fees.',
    icon: Phone,
  },
  {
    step: '04',
    title: 'Pay Safely via Escrow',
    desc: 'Use our built-in virtual wallet to fund your transaction. Funds are held securely until both parties confirm the deal is done.',
    icon: Wallet,
  },
]

const FEATURES = [
  {
    image: '/feature-listings.png',
    title: 'Browse Verified Land Listings',
    desc: 'Thousands of plots across Lagos, Abuja, Port Harcourt, and beyond. Every listing is screened for documentation — C of O, surveys, and more.',
    badge: 'Most Popular',
    badgeColor: 'bg-emerald-500',
    link: '/properties',
    linkText: 'Browse Land',
  },
  {
    image: '/feature-escrow.png',
    title: 'Secure Escrow Wallet',
    desc: "Nigeria's first real estate escrow wallet. Fund your virtual wallet, initiate a deal, and your money stays protected until the transaction is 100% complete.",
    badge: 'Built-in Security',
    badgeColor: 'bg-primary',
    link: '/dashboard',
    linkText: 'Fund Your Wallet',
  },
  {
    image: '/feature-experts.png',
    title: 'Hire Verified Experts',
    desc: 'Connect with commission-based agents who know the terrain, or bring in a certified architect to plan your build. All professionals are rated and reviewed by real clients.',
    badge: 'Top-Rated Pros',
    badgeColor: 'bg-amber-500',
    link: '/agents',
    linkText: 'Find Experts',
  },
]

const TESTIMONIALS = [
  {
    name: 'Adaeze Okafor',
    role: 'Land Buyer, Lagos',
    avatar: 'A',
    rating: 5,
    text: 'I was skeptical about buying land online but LandMarket changed everything. The escrow wallet made me feel completely safe. Got my plot in Lekki Phase 2 within 3 weeks!',
  },
  {
    name: 'Emeka Nwosu',
    role: 'Verified Realtor, Abuja',
    avatar: 'E',
    rating: 5,
    text: "As a realtor, the platform is a game-changer. I've closed 14 deals in 2 months. Buyers come to me pre-verified and serious. Can't imagine going back to the old way.",
  },
  {
    name: 'Fatima Abubakar',
    role: 'Buyer, Port Harcourt',
    avatar: 'F',
    rating: 5,
    text: 'Found my architect right here on LandMarket. He designed my building plan within a week. Everything in one place — listing, agent, architect, and payment. Brilliant!',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/hero-bg.png"
            alt="Nigerian land aerial view"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Nigeria's #1 Land Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-black text-white tracking-tight leading-[1.05] mb-6">
              Buy & Sell{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-300">
                Nigerian Land
              </span>{' '}
              <br className="hidden sm:block" />
              Safely &amp; Smartly
            </h1>

            <p className="text-lg sm:text-xl text-white max-w-2xl leading-relaxed mb-10">
              Browse thousands of verified listings across Lagos, Abuja, and all 36 states.
              Connect with trusted realtors, hire certified architects, and close deals through
              our secure escrow wallet — no fraud, no middlemen, no regrets.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/properties"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-all hover:-translate-y-1 shadow-xl shadow-primary/40"
              >
                <Search className="w-5 h-5" />
                Browse Land Listings
              </Link>
              <Link
                to="/agents"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white border border-white/25 font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-1 backdrop-blur-sm"
              >
                Hire an Agent <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/architects"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white border border-white/25 font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-1 backdrop-blur-sm"
              >
                Find Architects <Ruler className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-5 text-white/80 text-sm font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> KYC Verified Platform</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bank-Grade Escrow</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free to Browse</span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-14 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label} className="group">
                <p className="text-3xl sm:text-4xl font-black text-gold mb-1 group-hover:scale-105 transition-transform">{value}</p>
                <p className="text-navy-200 text-sm font-medium uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary mb-4 tracking-tight">
              Everything You Need,<br />
              <span className="text-primary">In One Marketplace</span>
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              LandMarket is Nigeria's first fully integrated land marketplace — from discovery to deal completion, we've got you covered.
            </p>
          </div>

          <div className="space-y-20">
            {FEATURES.map(({ image, title, desc, badge, badgeColor, link, linkText }, i) => (
              <div
                key={title}
                className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center`}
              >
                {/* Image / Flyer */}
                <div className="w-full lg:w-1/2 shrink-0">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                    <img
                      src={image}
                      alt={title}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-bold ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div className="w-full lg:w-1/2">
                  <h3 className="text-2xl sm:text-3xl font-black text-text-primary mb-4 tracking-tight">{title}</h3>
                  <p className="text-text-muted text-lg leading-relaxed mb-6">{desc}</p>
                  <Link
                    to={link}
                    className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all text-base"
                  >
                    {linkText} <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION ─── */}
      <section className="py-24 bg-surface-dim border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary mb-4 tracking-tight">
              Close a Land Deal in{' '}
              <span className="text-primary">4 Simple Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative bg-surface border border-border rounded-3xl p-7 hover:shadow-elevated transition-all group hover:-translate-y-1">
                <div className="text-5xl font-black text-primary/10 absolute top-4 right-5 leading-none select-none group-hover:text-primary/20 transition-colors">{step}</div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all">
                  <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ─── */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-gold text-xs font-bold uppercase tracking-widest mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Trusted by Thousands of{' '}
              <span className="text-gold">Nigerians</span>
            </h2>
            <p className="text-navy-200 max-w-xl mx-auto">
              Real people, real deals. See what our community says about LandMarket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, avatar, rating, text }) => (
              <div key={name} className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-7 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{name}</p>
                    <p className="text-navy-300 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-28 bg-gradient-to-b from-surface-dim to-surface relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary mb-6 tracking-tight">
            Start Your Land Journey{' '}
            <span className="text-primary">Today</span>
          </h2>
          <p className="text-lg text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Join over 15,000 buyers and sellers who trust LandMarket to find, buy, and sell land safely across Nigeria. Registration is free — always.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 hover:-translate-y-1"
            >
              <Search className="w-5 h-5" />
              Search Properties
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-navy text-white font-bold text-lg hover:bg-navy-light transition-all hover:-translate-y-1 shadow-lg"
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-text-muted text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> 100% Free to Register</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Government-backed KYC</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Escrow-Protected Payments</span>
          </div>
        </div>
      </section>

    </div>
  )
}
