import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { propertiesAPI, architectsAPI } from '../../api/client'
import { 
  Plus, Eye, Home, TrendingUp, Star, Loader2, ArrowRight,
  ShieldCheck, LayoutDashboard 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import WalletManager from '../wallet/WalletManager'
import TransactionList from '../escrow/TransactionList'
import { CreateListingModal } from '../realtor/RealtorDashboard'

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

export default function ArchitectDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateListing, setShowCreateListing] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [profileRes, listingsRes] = await Promise.all([
        architectsAPI.myProfile().catch(() => ({ data: null })),
        propertiesAPI.myListings().catch(() => ({ data: [] }))
      ])
      setProfile(profileRes.data)
      setListings(listingsRes.data.results || listingsRes.data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0)

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
                  Architect
                </span>
              </div>
              <p className="text-sm text-text-muted mt-0.5">{profile?.company_name || 'Independent Architect'}</p>
              {profile?.average_rating > 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {profile.average_rating} ({profile.rating_count || 0} reviews)
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateListing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
            >
              <Plus className="w-4 h-4" /> Add Portfolio Listing
            </button>
            <Link
              to="/architects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-surface-muted text-sm font-semibold text-text-secondary transition-all"
            >
              My Public Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={Home} 
            label="Total Projects/Listings" 
            value={listings.length} 
            color="bg-primary" 
          />
          <StatCard 
            icon={Eye} 
            label="Total Project Views" 
            value={totalViews} 
            color="bg-emerald-500" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="Avg. Views Per Listing" 
            value={listings.length ? Math.round(totalViews / listings.length) : 0} 
            color="bg-blue-500" 
          />
        </div>

        {/* Portfolio Listing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface rounded-3xl border border-border p-6 shadow-card">
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" /> My Portfolio Listings
              </h2>

              {listings.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border-light rounded-2xl bg-surface-dim">
                  <p className="text-sm text-text-secondary font-medium">No projects listed yet</p>
                  <p className="text-xs text-text-muted mt-1">Add your estate blueprints or building design services to attract buyers.</p>
                  <button 
                    onClick={() => setShowCreateListing(true)}
                    className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all"
                  >
                    Add Your First Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map((item) => (
                    <div key={item.id} className="border border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-all flex flex-col bg-surface-dim">
                      <div className="h-40 bg-surface-muted relative overflow-hidden">
                        {item.primary_image_url ? (
                          <img src={item.primary_image_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface-muted">No Image</div>
                        )}
                        <span className="absolute top-3 left-3 bg-white px-2 py-0.5 rounded text-[10px] font-bold text-text-primary uppercase tracking-wider shadow">
                          {item.listing_type}
                        </span>
                      </div>
                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-text-primary line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-text-muted truncate mt-0.5">{item.location}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-border-light pt-2 mt-2">
                          <p className="font-extrabold text-sm text-primary">
                            ₦{parseFloat(item.price).toLocaleString()}
                          </p>
                          <span className="flex items-center gap-1 text-[11px] text-text-muted">
                            <Eye className="w-3.5 h-3.5" /> {item.view_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <WalletManager />
          </div>

        </div>

      </div>

      {showCreateListing && (
        <CreateListingModal 
          onClose={() => setShowCreateListing(false)} 
          onCreated={() => {
            setShowCreateListing(false)
            fetchData()
          }} 
        />
      )}
    </div>
  )
}

