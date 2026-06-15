import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { propertiesAPI, subscriptionsAPI } from '../../api/client'
import { Plus, Eye, Home, TrendingUp, Trash2, Upload, X, ImageIcon, Star, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-surface rounded-2xl border border-border-light p-6 shadow-card">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  )
}

function formatPrice(price) {
  const num = parseFloat(price)
  if (num >= 1e9) return `₦${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `₦${(num / 1e6).toFixed(1)}M`
  return `₦${num.toLocaleString()}`
}

// ── Mock dashboard listings ──────────────────
const MOCK_LISTINGS = [
  {
    id: '1', title: 'Premium Waterfront Estate Plot in Banana Island',
    price: '450000000.00', location: 'Banana Island, Ikoyi, Lagos',
    status: 'available', view_count: 342,
    primary_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=150&fit=crop',
  },
  {
    id: '2', title: 'Serviced Residential Plot — Lekki Phase 1',
    price: '85000000.00', location: 'Lekki Phase 1, Lagos',
    status: 'available', view_count: 187,
    primary_image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=150&fit=crop',
  },
]

export default function RealtorDashboard() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [listingsRes, subRes] = await Promise.all([
        propertiesAPI.myListings().catch(() => ({ data: MOCK_LISTINGS })),
        subscriptionsAPI.mySubscription().catch(() => ({ data: null }))
      ])
      setListings(listingsRes.data.results || listingsRes.data)
      setSubscription(subRes.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const totalViews = listings.reduce((s, l) => s + (l.view_count || 0), 0)
  const activeCount = listings.filter((l) => l.status === 'available').length

  return (
    <div className="min-h-screen py-8 bg-surface-dim">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome back, {user?.first_name}
            </h1>
            <p className="text-sm text-text-muted mt-1">Manage your property listings</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
            id="dashboard-add-listing-btn"
          >
            <Plus className="w-4 h-4" /> New Listing
          </button>
        </div>

        {/* Subscription Plan Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-elevated relative overflow-hidden border border-navy-medium">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Star className={`w-7 h-7 ${subscription?.is_valid && subscription.plan.name !== 'Free' ? 'text-gold fill-gold' : 'text-white'}`} />
              </div>
              <div>
                <p className="text-navy-100 text-sm font-medium mb-1">Current Plan</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {subscription?.is_valid ? subscription.plan.name : 'Free (No Plan)'}
                  </h3>
                  {subscription?.is_valid && (
                    <span className="px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-semibold border border-success/30">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="relative z-10 w-full sm:w-auto">
              <Link 
                to="/pricing"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-navy font-bold text-sm hover:bg-surface-dim transition-all active:scale-[0.98]"
              >
                Upgrade Plan <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard icon={Home} label="Active Listings" value={activeCount} color="bg-primary" />
          <StatCard icon={Eye} label="Total Views" value={totalViews.toLocaleString()} color="bg-blue-500" />
          <StatCard icon={TrendingUp} label="Total Leads" value={Math.floor(totalViews * 0.12)} color="bg-gold" />
        </div>

        {/* Listings Table */}
        <div className="bg-surface rounded-2xl border border-border-light shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light">
            <h3 className="font-semibold text-text-primary">Your Listings</h3>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-20 h-14 skeleton rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center">
              <Home className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h4 className="font-medium text-text-primary mb-1">No listings yet</h4>
              <p className="text-sm text-text-muted mb-4">Create your first property listing to start receiving leads.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {listings.map((listing) => (
                <div key={listing.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-dim transition-colors">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-surface-muted flex-shrink-0">
                    {listing.primary_image_url ? (
                      <img src={listing.primary_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-text-primary truncate">{listing.title}</h4>
                    <p className="text-xs text-text-muted">{listing.location}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-primary">{formatPrice(listing.price)}</p>
                    <p className="text-xs text-text-muted flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3" /> {listing.view_count} views
                    </p>
                  </div>
                  <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    listing.status === 'available'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {listing.status === 'available' ? 'Active' : 'Sold'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <CreateListingModal onClose={() => setShowCreateForm(false)} onCreated={() => { setShowCreateForm(false); fetchData() }} />
        )}
      </div>
    </div>
  )
}

function CreateListingModal({ onClose, onCreated }) {
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const [form, setForm] = useState({
    title: '', description: '', price: '', land_size: '',
    location: '', state: '', latitude: '', longitude: '', status: 'available',
    listing_type: 'regular'
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [video, setVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages((prev) => [...prev, ...files])
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const handleVideo = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('Video file is too large (max 50MB).')
        return
      }
      setVideo(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  const removeVideo = () => {
    setVideo(null)
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoPreview(null)
    if (videoRef.current) videoRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = { ...form, uploaded_images: images }
      if (video) payload.video = video
      await propertiesAPI.create(payload)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create listing. Make sure your realtor profile is set up.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-fade-in" onClick={onClose}>
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-elevated max-h-[90vh] overflow-y-auto animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-surface rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-text-primary">Create New Listing</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-muted"><X className="w-5 h-5 text-text-muted" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-danger">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title</label>
            <input type="text" required value={form.title} onChange={(e) => update('title', e.target.value)}
              placeholder="e.g., Prime Plot in Lekki Phase 1" className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description (Markdown supported)</label>
            <textarea required rows={4} value={form.description} onChange={(e) => update('description', e.target.value)}
              placeholder="Detailed description of the property..." className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Price (₦)</label>
              <input type="number" required value={form.price} onChange={(e) => update('price', e.target.value)}
                placeholder="50000000" className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Land Size (sqm)</label>
              <input type="number" required value={form.land_size} onChange={(e) => update('land_size', e.target.value)}
                placeholder="648" className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Listing Type</label>
              <select value={form.listing_type} onChange={(e) => update('listing_type', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
                <option value="regular">Regular</option>
                <option value="upcoming">Upcoming Estate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Location</label>
              <input type="text" required value={form.location} onChange={(e) => update('location', e.target.value)}
                placeholder="Lekki Phase 1, Lagos" className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">State</label>
              <input type="text" value={form.state} onChange={(e) => update('state', e.target.value)}
                placeholder="Lagos" className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Property Images</label>
            <div className="flex flex-wrap gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-24 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary transition-colors">
                <Upload className="w-5 h-5" />
                <span className="text-[10px]">Add</span>
              </button>
            </div>
            <input type="file" hidden ref={fileRef} multiple accept="image/*" onChange={handleImages} />
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Property Video (Optional)</label>
            <div className="flex flex-wrap gap-3">
              {videoPreview ? (
                <div className="relative w-40 h-24 rounded-lg overflow-hidden group border border-border">
                  <video src={videoPreview} className="w-full h-full object-cover" muted />
                  <button type="button" onClick={removeVideo}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => videoRef.current?.click()}
                  className="w-40 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary transition-colors">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Add Video (Max 50MB)</span>
                </button>
              )}
            </div>
            <input type="file" hidden ref={videoRef} accept="video/mp4,video/webm,video/quicktime" onChange={handleVideo} />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-[0.98]">
            {submitting ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
