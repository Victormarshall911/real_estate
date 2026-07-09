import { useState, useEffect } from 'react'
import { Home, Search, Star, AlertCircle, Loader2, X, ShieldCheck } from 'lucide-react'
import { landlordsAPI } from '../api/client'
import LandlordCard from '../components/landlord/LandlordCard'
import LandlordSkeleton from '../components/landlord/LandlordSkeleton'
import { useAuth } from '../hooks/useAuth'

export default function LandlordsPage() {
  const { isAuthenticated } = useAuth()
  const [landlords, setLandlords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Rating Modal state
  const [ratingTarget, setRatingTarget] = useState(null)
  const [ratingVal, setRatingVal] = useState(5)
  const [commentVal, setCommentVal] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  const fetchLandlords = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      const { data } = await landlordsAPI.list(params)
      setLandlords(data.results || data || [])
    } catch (err) {
      console.error('Failed to load landlords', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLandlords()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchLandlords()
  }

  const handleOpenRateModal = (landlord) => {
    if (!isAuthenticated) {
      alert('Please log in or register to submit a review.')
      return
    }
    setRatingTarget(landlord)
    setRatingVal(5)
    setCommentVal('')
    setReviewError(null)
  }

  const handleRateSubmit = async (e) => {
    e.preventDefault()
    if (!ratingTarget) return
    setSubmittingReview(true)
    setReviewError(null)
    try {
      await landlordsAPI.rate(ratingTarget.id, {
        rating: ratingVal,
        comment: commentVal,
      })
      setRatingTarget(null)
      fetchLandlords()
    } catch (err) {
      console.error(err)
      setReviewError(err.response?.data?.error || 'Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div
          className="rounded-3xl p-8 sm:p-12 mb-10 text-white shadow-xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)' }}
        >
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <Home className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
              style={{ background: 'rgba(255,255,255,0.20)', borderColor: 'rgba(255,255,255,0.30)', color: '#ffffff' }}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Private Owners</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight text-white">
              Connect with Verified Landlords
            </h1>
            <p className="text-base sm:text-lg font-normal leading-relaxed text-blue-100">
              Browse land and property listings owned directly by individuals. Communicate securely, negotiate directly, and close deals safely with verified land owners.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-surface rounded-2xl p-4 shadow-card border border-border mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search landlord name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-surface"
            />
          </form>

          <button
            onClick={fetchLandlords}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold text-sm transition-all shadow-md shrink-0 w-full md:w-auto"
          >
            Search
          </button>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LandlordSkeleton key={i} />
            ))}
          </div>
        ) : landlords.length === 0 ? (
          <div className="bg-surface rounded-3xl p-12 text-center max-w-xl mx-auto border border-border shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No landlords found</h3>
            <p className="text-text-muted text-sm mb-6">
              We couldn't find any landlords matching your search query. Try broadening your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {landlords.map((landlord) => (
              <LandlordCard key={landlord.id} landlord={landlord} onRate={handleOpenRateModal} />
            ))}
          </div>
        )}

      </div>

      {/* Review Modal */}
      {ratingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Review & Rate Landlord</h3>
              <button onClick={() => setRatingTarget(null)} className="p-1 rounded-lg hover:bg-surface-muted">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <form onSubmit={handleRateSubmit} className="p-6 space-y-4">
              {reviewError && (
                <div className="p-3 rounded-xl bg-red-50 text-danger text-xs flex items-center space-x-2 border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRatingVal(val)}
                      className="p-1 text-2xl focus:outline-none transition-transform active:scale-90"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          val <= ratingVal ? 'text-amber-500 fill-amber-500' : 'text-text-muted'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Review Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience dealing with this landlord..."
                  value={commentVal}
                  onChange={(e) => setCommentVal(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-surface resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingTarget(null)}
                  className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
