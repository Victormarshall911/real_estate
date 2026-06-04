import { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (result.success) {
      onClose()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-md rounded-2xl shadow-elevated p-8 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Welcome back</h2>
            <p className="text-sm text-text-muted mt-1">Sign in to your account</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-muted transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                id="login-email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                id="login-password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            id="login-submit-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-primary font-medium hover:underline">
            Create one
          </button>
        </p>
      </div>
    </div>
  )
}
