import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RealtorDashboard from '../components/realtor/RealtorDashboard'
import CompleteProfileModal from '../components/realtor/CompleteProfileModal'

export default function DashboardPage() {
  const { user, isAuthenticated, isRealtor } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!isRealtor) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Realtor Access Only</h2>
          <p className="text-sm text-text-muted">
            The dashboard is available for realtor accounts. If you&apos;re a property seller, register as a realtor to access your dashboard.
          </p>
        </div>
      </div>
    )
  }

  if (!user?.has_realtor_profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
        <CompleteProfileModal />
      </div>
    )
  }

  return <RealtorDashboard />
}
