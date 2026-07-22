import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RealtorDashboard from '../components/realtor/RealtorDashboard'
import CompleteProfileModal from '../components/realtor/CompleteProfileModal'
import CompleteAgentProfileModal from '../components/agent/CompleteAgentProfileModal'
import CompleteArchitectProfileModal from '../components/architect/CompleteArchitectProfileModal'
import CompleteLandlordProfileModal from '../components/landlord/CompleteLandlordProfileModal'
import CompleteDeveloperProfileModal from '../components/developer/CompleteDeveloperProfileModal'
import ManageAgentLocations from '../components/agent/ManageAgentLocations'
import WalletManager from '../components/wallet/WalletManager'
import { authAPI } from '../api/client'
import { Loader2, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import TransactionList from '../components/escrow/TransactionList'
import AgentDashboard from '../components/agent/AgentDashboard'
import ArchitectDashboard from '../components/architect/ArchitectDashboard'

export default function DashboardPage() {
  const { user, isAuthenticated, isRealtor, isAgent, isArchitect, isLandlord, isDeveloper, isKycVerified, refreshUser } = useAuth()
  const [upgrading, setUpgrading] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // 1. Enforce KYC Verification — only for sellers (realtors, landlords, developers)
  const needsKyc = isRealtor || isLandlord || isDeveloper
  if (needsKyc && !isKycVerified) {
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

  // 3. Landlord needs to complete profile
  if (isLandlord && !user?.has_landlord_profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
        <CompleteLandlordProfileModal onClose={() => {}} />
      </div>
    )
  }

  // 4. Developer needs to complete profile
  if (isDeveloper && !user?.has_developer_profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
        <CompleteDeveloperProfileModal onClose={() => {}} />
      </div>
    )
  }

  // 5. Agent needs to complete their agent profile
  if (isAgent && !user?.has_agent_profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
        <CompleteAgentProfileModal />
      </div>
    )
  }

  // 4. Architect needs to complete their profile
  if (isArchitect && !user?.is_profile_complete) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
        <CompleteArchitectProfileModal onClose={() => {}} />
      </div>
    )
  }

  // 4. Agent dashboard
  if (isAgent) {
    return <AgentDashboard />
  }

  // 5. Architect dashboard
  if (isArchitect) {
    return <ArchitectDashboard />
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

  // 6. Seller dashboard (Realtor, Landlord, Developer)
  if (isRealtor || isLandlord || isDeveloper) {
    return <RealtorDashboard />
  }

  // 7. Buyer dashboard
  return (
    <div className="min-h-screen py-16 flex flex-col items-center justify-center bg-surface-dim">
      <div className="text-center max-w-md mx-auto px-4 bg-surface p-8 rounded-2xl shadow-card border border-border">
        <div className="text-5xl mb-4">👋</div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-text-primary">Welcome to your Dashboard</h2>
        </div>
        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            Role: Buyer
          </span>
        </div>
        <p className="text-sm text-text-muted mb-6">
          You are currently registered as a property buyer. Looking for expert help to find the perfect land?
        </p>
        <Link
          to="/agents"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          Hire a Verified Agent
        </Link>
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
      
      <div className="w-full max-w-2xl mx-auto px-4 mt-8 space-y-8">
        <WalletManager />
        <div className="border-t border-border/60 pt-6">
          <TransactionList />
        </div>
      </div>
    </div>
  )
}
