import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RealtorDashboard from '../components/realtor/RealtorDashboard'

export default function DashboardPage() {
  const { isAuthenticated, isRealtor } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!isRealtor) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
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

  return <RealtorDashboard />
}
