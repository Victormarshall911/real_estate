import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RealtorDashboard from '../components/realtor/RealtorDashboard'
import CompleteProfileModal from '../components/realtor/CompleteProfileModal'
import { authAPI } from '../api/client'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, isAuthenticated, isRealtor, isKycVerified, refreshUser } = useAuth()
  const [upgrading, setUpgrading] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // 1. Enforce KYC Verification first
  if (!isKycVerified) {
    return <Navigate to="/verify-identity" replace />
  }

  // 2. Enforce Realtor Profile Completion
  if (isRealtor && !user?.has_realtor_profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
        <CompleteProfileModal />
      </div>
    )
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      await authAPI.upgradeToRealtor()
      await refreshUser()
    } catch (err) {
      alert(err.response?.data?.error || 'Upgrade failed. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  if (!isRealtor) {
    return (
      <div className="min-h-screen py-16 flex flex-col items-center justify-center bg-surface-dim">
        <div className="text-center max-w-md mx-auto px-4 bg-surface p-8 rounded-2xl shadow-card border border-border">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to your Dashboard</h2>
          <p className="text-sm text-text-muted mb-6">
            You are currently registered as a property buyer. Looking for expert help to find the perfect land?
          </p>
          <a
            href="/agents"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Hire a Verified Agent
          </a>
          <div className="mt-6 pt-6 border-t border-border-light">
            <p className="text-xs text-text-muted mb-3">Want to list your own properties?</p>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all disabled:opacity-60"
            >
              {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {upgrading ? 'Upgrading...' : 'Upgrade to Realtor Account — Free'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <RealtorDashboard />
}
