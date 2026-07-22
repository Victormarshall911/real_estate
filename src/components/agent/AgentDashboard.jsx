import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { agentsAPI } from '../../api/client'
import { 
  Users, DollarSign, CheckCircle2, Star, Clock, 
  MessageSquare, Briefcase, MapPin, Loader2, ArrowRight 
} from 'lucide-react'
import WalletManager from '../wallet/WalletManager'
import ManageAgentLocations from './ManageAgentLocations'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-surface rounded-2xl border border-border-light p-6 shadow-card transition-all hover:-translate-y-0.5">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  )
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completingId, setCompletingId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [profileRes, connectionsRes] = await Promise.all([
        agentsAPI.myProfile().catch(() => ({ data: null })),
        agentsAPI.myConnections().catch(() => ({ data: [] }))
      ])
      setProfile(profileRes.data)
      setConnections(connectionsRes.data.results || connectionsRes.data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCompleteDeal = async (connId) => {
    setCompletingId(connId)
    try {
      await agentsAPI.completeDeal(connId)
      await fetchData() // Refresh to update statuses & balances
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete deal.')
    } finally {
      setCompletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center bg-surface-dim">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  // Calculate agent stats
  const activeConnections = connections.filter(c => c.status === 'active')
  const completedConnections = connections.filter(c => c.status === 'closed')
  
  // Commission earned = sum of closed connection fees
  const totalCommission = completedConnections.reduce((sum, c) => {
    return sum + parseFloat(c.location_pricing?.connection_fee || 0)
  }, 0)

  // Commission pending (held in escrow) = sum of active connection fees
  const pendingCommission = activeConnections.reduce((sum, c) => {
    return sum + parseFloat(c.location_pricing?.connection_fee || 0)
  }, 0)

  return (
    <div className="min-h-screen py-8 bg-surface-dim">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 bg-surface p-6 rounded-3xl border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/20">
              {profile?.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt={user?.first_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-2xl">{user?.first_name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text-primary">
                  {user?.first_name} {user?.last_name}
                </h1>
                {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-primary" />}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Agent
                </span>
              </div>
              <p className="text-sm text-text-muted mt-0.5">{profile?.company_name || 'Independent Agent'}</p>
              {profile?.average_rating > 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {profile.average_rating} ({profile.rating_count || 0} reviews)
                </div>
              )}
            </div>
          </div>
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-surface-muted text-sm font-semibold text-text-secondary transition-all"
          >
            My Public Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Briefcase} 
            label="Active Clients" 
            value={activeConnections.length} 
            color="bg-primary" 
          />
          <StatCard 
            icon={Users} 
            label="Completed Deals" 
            value={completedConnections.length} 
            color="bg-emerald-500" 
          />
          <StatCard 
            icon={DollarSign} 
            label="Escrow Balance (Pending)" 
            value={`₦${pendingCommission.toLocaleString()}`} 
            color="bg-amber-500" 
          />
          <StatCard 
            icon={DollarSign} 
            label="Total Earnings" 
            value={`₦${totalCommission.toLocaleString()}`} 
            color="bg-blue-500" 
          />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Main Column: Connections & Chats */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Connections */}
            <div className="bg-surface rounded-3xl border border-border p-6 shadow-card">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Active Clients & Connections
              </h2>

              {activeConnections.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border-light rounded-2xl bg-surface-dim">
                  <p className="text-sm text-text-secondary font-medium">No active connections</p>
                  <p className="text-xs text-text-muted mt-1">When buyers hire you for locations, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeConnections.map((conn) => (
                    <div key={conn.id} className="p-4 rounded-2xl border border-border bg-surface-dim hover:shadow-sm transition-all space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {conn.user?.first_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-text-primary">
                              {conn.user?.first_name} {conn.user?.last_name}
                            </p>
                            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-text-muted" />
                              {conn.location_pricing?.location}, {conn.location_pricing?.state} State
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/messages?session=${conn.chat_session?.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                          </Link>
                          
                          <button
                            onClick={() => handleCompleteDeal(conn.id)}
                            disabled={completingId === conn.id || conn.agent_completed}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              conn.agent_completed
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/10'
                            }`}
                          >
                            {completingId === conn.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            {conn.agent_completed ? 'Approved' : 'Complete Deal'}
                          </button>
                        </div>
                      </div>

                      {/* Escrow note */}
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-100">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Connection fee <strong>₦{parseFloat(conn.location_pricing?.connection_fee).toLocaleString()}</strong> is secured in escrow. Deal completion by both parties is required to release.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manage Agent Locations */}
            <ManageAgentLocations />
          </div>

          {/* Right Column: Wallet & History */}
          <div className="space-y-8">
            <WalletManager />
          </div>
        </div>

      </div>
    </div>
  )
}
