import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { propertiesAPI, realtorsAPI } from '../api/client'
import ImageGallery from '../components/property/ImageGallery'
import RealtorCard from '../components/realtor/RealtorCard'
import ReviewSection from '../components/shared/ReviewSection'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, MapPin, Maximize2, Eye, Calendar, BadgeCheck, Share2 } from 'lucide-react'

function formatPrice(price) {
  return `₦${parseFloat(price).toLocaleString()}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Mock detail for demo
const MOCK_DETAIL = {
  id: '1',
  title: 'Premium Waterfront Estate Plot in Banana Island',
  description: `## Property Overview\n\nThis exclusive waterfront plot is situated in the most prestigious neighbourhood in Lagos — **Banana Island, Ikoyi**. The plot offers unobstructed views of the Lagos lagoon.\n\n### Key Features\n\n- **C of O** title document available\n- Fully fenced with perimeter security\n- Underground drainage system in place\n- 24/7 estate security with CCTV surveillance\n- Close proximity to major shopping malls and schools\n\n### Investment Value\n\nBanana Island properties have appreciated by an average of 15% annually over the past decade, making this an excellent long-term investment.\n\n### Location Highlights\n\n- 5 mins to Falomo Shopping Centre\n- 10 mins to Victoria Island business district\n- 15 mins to Murtala Muhammed International Airport`,
  price: '450000000.00',
  land_size: '1200.00',
  land_size_plots: 1.85,
  location: 'Banana Island, Ikoyi, Lagos',
  state: 'Lagos',
  latitude: '6.4590',
  longitude: '3.4240',
  status: 'available',
  view_count: 342,
  created_at: '2026-05-15T10:00:00Z',
  updated_at: '2026-05-28T14:30:00Z',
  images: [
    { id: '1', image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop', caption: 'Aerial view', is_primary: true },
    { id: '2', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop', caption: 'Landscape view', is_primary: false },
    { id: '3', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop', caption: 'Surrounding area', is_primary: false },
    { id: '4', image_url: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1200&h=800&fit=crop', caption: 'Street view', is_primary: false },
  ],
  realtor: {
    id: 'r1',
    user: { id: 'u1', first_name: 'Adebayo', last_name: 'Ogunlesi', email: 'adebayo@landmarket.ng' },
    company_name: 'Adebayo Properties Ltd',
    phone_number: '+2348012345678',
    formatted_whatsapp_url: 'https://wa.me/2348012345678',
    is_verified: true,
    bio: 'Premium real estate consultant with 12 years of experience in Lagos property market. Specializing in Ikoyi, VI, and Lekki corridor.',
    listing_count: 8,
  },
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated, isRealtor } = useAuth()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProperty = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await propertiesAPI.detail(id)
      setProperty(data)
    } catch {
      setProperty(MOCK_DETAIL)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  const handleReviewSubmit = async (targetId, reviewData) => {
    await realtorsAPI.rate(targetId, reviewData)
    // Refresh the property to get the updated realtor rating
    await fetchProperty()
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/10] skeleton rounded-2xl" />
            <div className="h-8 skeleton w-3/4" />
            <div className="h-4 skeleton w-1/2" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-4 skeleton" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) return null

  // Simple markdown to HTML (basic)
  const renderDescription = (md) => {
    return md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-text-primary mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-text-primary mt-8 mb-3">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="text-sm text-text-secondary ml-4 mb-1">• $1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <main className="min-h-screen py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Gallery & Details */}
          <div className="lg:col-span-2 space-y-8">
            <ImageGallery images={property.images} />

            {/* Title & Meta */}
            <div>
              <div className="flex items-start gap-3 mb-3">
                {property.realtor?.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0 mt-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 mt-1 ${
                  property.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {property.status === 'available' ? 'Available' : 'Sold'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight mb-4">
                {property.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary/70" /> {property.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-primary/70" />
                  {parseFloat(property.land_size).toLocaleString()} sqm ({property.land_size_plots} plots)
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> {property.view_count} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Listed {formatDate(property.created_at)}
                </span>
              </div>
            </div>

            {/* Price Bar */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-primary-50 border border-primary-100">
              <div>
                <p className="text-xs text-primary-dark font-medium uppercase tracking-wider">Price</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-dark tracking-tight">
                  {formatPrice(property.price)}
                </p>
              </div>
              <button className="p-3 rounded-xl bg-white border border-border hover:bg-surface-muted transition-colors" title="Share">
                <Share2 className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Description */}
            <div className="bg-surface rounded-2xl border border-border-light p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">About This Property</h2>
              <div
                className="text-sm text-text-secondary leading-relaxed prose-sm"
                dangerouslySetInnerHTML={{ __html: renderDescription(property.description) }}
              />
            </div>
          </div>

          {/* Right Column — Sticky Realtor Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-[80px] space-y-6">
              <RealtorCard realtor={property.realtor} propertyTitle={property.title} />

              {property.realtor && (
                <ReviewSection 
                  targetId={property.realtor.id}
                  targetType="seller"
                  onSubmit={handleReviewSubmit}
                  averageRating={property.realtor.average_rating}
                  totalReviews={property.realtor.total_reviews}
                />
              )}

              {/* Owner actions */}
              {isAuthenticated && isRealtor && user?.id === property.realtor?.user?.id && (
                <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 mt-4">
                  <h4 className="font-semibold text-text-primary text-sm mb-2">Need help selling?</h4>
                  <p className="text-xs text-text-muted mb-4">Hire a verified external agent to help you close this deal faster.</p>
                  <Link 
                    to="/agents"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200"
                  >
                    Contact External Agent
                  </Link>
                </div>
              )}

              {/* Buyer actions */}
              {(!isAuthenticated || !isRealtor || user?.id !== property.realtor?.user?.id) && (
                <div className="bg-surface-dim rounded-2xl border border-border-light p-5 mt-4">
                  <h4 className="font-semibold text-text-primary text-sm mb-2">Need a professional?</h4>
                  <p className="text-xs text-text-muted mb-4">Hire a verified agent to inspect this property, negotiate, and handle paperwork securely.</p>
                  <Link 
                    to="/agents"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy-light transition-all duration-200"
                  >
                    Hire an Agent
                  </Link>
                </div>
              )}

              {/* Location Map Placeholder */}
              {property.latitude && property.longitude && (
                <div className="bg-surface rounded-2xl border border-border-light p-5">
                  <h4 className="font-semibold text-text-primary text-sm mb-3">Location</h4>
                  <div className="aspect-[4/3] rounded-xl bg-surface-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l+10b981(${property.longitude},${property.latitude})/${property.longitude},${property.latitude},13,0/400x300@2x?access_token=pk.placeholder`}
                      alt="Map location"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><p class="text-xs mt-2">${property.latitude}°N, ${property.longitude}°E</p></div>`
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-2 text-center">
                    {property.latitude}°N, {property.longitude}°E
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
