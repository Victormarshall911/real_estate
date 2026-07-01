import { useState, useEffect } from 'react'
import { Ruler, Search, Star, AlertCircle, Loader2, X, ShieldCheck } from 'lucide-react'
import { architectsAPI } from '../api/client'
import ArchitectCard from '../components/architect/ArchitectCard'
import { useAuth } from '../hooks/useAuth'

export default function ArchitectsPage() {
  const { isAuthenticated } = useAuth()
  const [architects, setArchitects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialization, setSpecialization] = useState('')
  
  // Rating Modal state
  const [ratingTarget, setRatingTarget] = useState(null)
  const [ratingVal, setRatingVal] = useState(5)
  const [commentVal, setCommentVal] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  const fetchArchitects = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (specialization) params.specialization = specialization
      const { data } = await architectsAPI.list(params)
      setArchitects(data.results || data || [])
    } catch (err) {
      console.error('Failed to load architects', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArchitects()
  }, [specialization])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchArchitects()
  }

  const handleOpenRateModal = (arch) => {
    if (!isAuthenticated) {
      alert('Please log in or register to submit a review.')
      return
    }
    setRatingTarget(arch)
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
      await architectsAPI.rate(ratingTarget.id, {
        rating: ratingVal,
        comment: commentVal,
      })
      setRatingTarget(null)
      fetchArchitects()
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
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)' }}
        >
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <Ruler className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
              style={{ background: 'rgba(255,255,255,0.20)', borderColor: 'rgba(255,255,255,0.30)', color: '#ffffff' }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: '#34d399' }} />
              <span>Verified Professionals</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight" style={{ color: '#ffffff' }}>
              Hire Nigerian Architects & Planners
            </h1>
            <p className="text-base sm:text-lg font-normal leading-relaxed" style={{ color: 'rgba(255,255,255,0.90)' }}>
              Connect directly with verified architectural studios. Browse design specializations, consult via WhatsApp, and plan your dream property with zero middlemen fees.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-surface rounded-2xl p-4 shadow-card border border-border mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search studio name or architect name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-surface"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-surface font-medium text-text-primary w-full md:w-64"
            >
              <option value="">All Specializations</option>
              <option value="Residential">Residential Design</option>
              <option value="Commercial">Commercial & Retail</option>
              <option value="Urban Planning">Urban Planning & Landscape</option>
              <option value="Interior">Interior Architecture</option>
            </select>
            <button
              onClick={fetchArchitects}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold text-sm transition-all shadow-md shrink-0"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Loading verified architects...</p>
          </div>
        ) : architects.length === 0 ? (
          <div className="bg-surface rounded-3xl p-12 text-center max-w-xl mx-auto border border-border shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No Architects Found</h3>
            <p className="text-text-muted text-sm mb-6">
              We couldn't find any architectural studios matching your search criteria. Try clearing your filters or search terms.
            </p>
            <button
              onClick={() => { setSearch(''); setSpecialization(''); }}
              className="px-6 py-2.5 rounded-xl bg-primary-50 text-primary font-semibold text-sm hover:bg-primary-100 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {architects.map((arch) => (
              <ArchitectCard key={arch.id} architect={arch} onRate={handleOpenRateModal} />
            ))}
          </div>
        )}

      </div>

      {/* Review Modal */}
      {ratingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-border p-6 relative">
            <button onClick={() => setRatingTarget(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-text-primary mb-1">Rate {ratingTarget.company_name || 'Architect'}</h3>
            <p className="text-xs text-text-muted mb-4">Share your feedback on their design consultation services</p>

            {reviewError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-danger flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Rating (1 to 5 Stars)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingVal(star)}
                      className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Star className={`w-8 h-8 ${star <= ratingVal ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Comment / Review</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your experience working with this architect..."
                  value={commentVal}
                  onChange={(e) => setCommentVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-600 transition-all shadow disabled:opacity-50"
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
