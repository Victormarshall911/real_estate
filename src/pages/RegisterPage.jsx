import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { X, Mail, Lock, Eye, EyeOff, User, Building, Briefcase, Ruler, Home, Hammer, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const ROLES = [
  { value: 'buyer', label: 'Buy Land', icon: User, desc: 'Browse & invest' },
  { value: 'realtor', label: 'Realtor', icon: Building, desc: 'List properties' },
  { value: 'agent', label: 'Agent', icon: Briefcase, desc: 'Earn commission' },
  { value: 'architect', label: 'Architect', icon: Ruler, desc: 'Design & plan' },
  { value: 'landlord', label: 'Landlord', icon: Home, desc: 'Own & lease/sell' },
  { value: 'developer', label: 'Developer', icon: Hammer, desc: 'Off-plan estates' },
]

export default function RegisterPage() {
  const { role } = useParams()
  const { register, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'buyer',
  })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (role && ROLES.some(r => r.value === role)) {
      setForm((prev) => ({ ...prev, role }))
    }
  }, [role])

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.')
      return
    }

    const result = await register(form)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  const activeRoleInfo = ROLES.find(r => r.value === form.role)

  return (
    <div className="min-h-screen bg-surface-dim pt-20 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-surface rounded-3xl overflow-hidden shadow-elevated border border-border">
        
        {/* Left Side: Premium Brand/Feature Banner */}
        <div className="md:col-span-5 bg-navy p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          
          <div>
            <Link to="/" className="inline-block bg-white rounded-xl px-2.5 py-1 mb-12">
              <img src="/landmarket-logo.png" alt="LandMarket" className="h-8 w-auto object-contain" />
            </Link>
            
            <h2 className="text-3xl font-black tracking-tight leading-tight mb-4">
              Join Nigeria's Most Trusted Land Marketplace
            </h2>
            <p className="text-navy-100 text-sm leading-relaxed mb-6">
              Create an account to browse verified listings, hire certified experts, and secure transactions through escrow.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gold" />
              </div>
              <p className="text-xs text-navy-100 font-semibold">100% KYC Verified Professionals</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gold" />
              </div>
              <p className="text-xs text-navy-100 font-semibold">Bank-grade Escrow Wallets</p>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="md:col-span-7 p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-text-primary">
              Register as {activeRoleInfo?.label || 'Buyer'}
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Complete the form below to get started.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-danger animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Direct Role Select Buttons */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                Registration Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('role', value)}
                    className={`py-2 px-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                      form.role === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-border/80 text-text-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => update('first_name', e.target.value)}
                  required
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => update('last_name', e.target.value)}
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-primary"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-primary"
                />
              </div>
            </div>

            {/* Passwords */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password_confirm}
                  onChange={(e) => update('password_confirm', e.target.value)}
                  required
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
