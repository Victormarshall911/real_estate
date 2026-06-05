import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RealtorDashboard from '../components/realtor/RealtorDashboard'
import CompleteProfileModal from '../components/realtor/CompleteProfileModal'

export default function DashboardPage() {
  const { user, isAuthenticated, isRealtor, isKycVerified } = useAuth()

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
            <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
              Upgrade to Realtor Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <RealtorDashboard />
}
