import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RealtorDashboard from '../components/realtor/RealtorDashboard'
import CompleteProfileModal from '../components/realtor/CompleteProfileModal'
import CompleteAgentProfileModal from '../components/agent/CompleteAgentProfileModal'
import ManageAgentLocations from '../components/agent/ManageAgentLocations'
import { authAPI } from '../api/client'
import { Loader2, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user, isAuthenticated, isRealtor, isAgent, isKycVerified, refreshUser } = useAuth()
  const [upgrading, setUpgrading] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // 1. Enforce KYC Verification — only for realtors and buyers, not agents
  if (!isKycVerified && !isAgent) {
    return <Navigate to="/verify-identity" replace />
  }

  // 2. Realtor needs to complete profile
  if (isRealtor && !user?.has_realtor_profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
        <CompleteProfileModal />
      </div>
    )
  }

  // 3. Agent needs to complete their agent profile
  if (isAgent && !user?.has_agent_profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
        <CompleteAgentProfileModal />
      </div>
    )
  }

  // 4. Agent dashboard
  if (isAgent) {
    return (
      <div className="min-h-screen py-12 bg-surface-dim">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Agent Dashboard</h1>
          <p className="text-text-muted mb-8">Manage your connections and chat with clients.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link to="/chat" className="bg-surface border border-border rounded-2xl p-6 hover:shadow-card-hover transition-all group">
              <MessageSquare className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-text-primary mb-1">Messages</h3>
              <p className="text-sm text-text-muted">Chat with clients who have connected with you.</p>
            </Link>
            <Link to="/agents" className="bg-surface border border-border rounded-2xl p-6 hover:shadow-card-hover transition-all group">
              <MapPin className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-text-primary mb-1">My Public Profile</h3>
              <p className="text-sm text-text-muted">See how you appear to buyers searching for agents.</p>
            </Link>
          </div>
          
          <ManageAgentLocations />
        </div>
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

  // 5. Buyer dashboard
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
