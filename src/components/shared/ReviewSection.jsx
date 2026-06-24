import { useState } from 'react'
import { Star, Loader2, MessageSquare } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function ReviewSection({ targetId, targetType, onSubmit, averageRating, totalReviews }) {
  const { isAuthenticated } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a star rating.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(targetId, { rating, comment })
      setSuccess(true)
      setRating(0)
      setComment('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface rounded-2xl border border-border-light shadow-card p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Star className="w-5 h-5 text-gold fill-gold" />
            Reviews & Ratings
          </h3>
          <p className="text-sm text-text-muted mt-1">
            {totalReviews > 0 
              ? `${averageRating} out of 5 from ${totalReviews} review${totalReviews === 1 ? '' : 's'}` 
              : 'No reviews yet'}
          </p>
        </div>
        <div className="flex bg-gold/10 px-3 py-1.5 rounded-lg border border-gold/20 items-center gap-1.5">
          <Star className="w-4 h-4 text-gold fill-gold" />
          <span className="font-bold text-gold">{averageRating}</span>
        </div>
      </div>

      {isAuthenticated ? (
        success ? (
          <div className="bg-success/10 border border-success/20 p-4 rounded-xl text-center">
            <h4 className="text-success font-bold mb-1">Thank You!</h4>
            <p className="text-sm text-success/80">Your review has been published.</p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-3 text-xs font-semibold text-success underline"
            >
              Write another review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface-dim rounded-xl p-5 border border-border">
            <h4 className="text-sm font-semibold text-text-primary mb-3">Leave a Review</h4>
            {error && <div className="text-xs text-danger mb-3 font-medium">{error}</div>}
            
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star 
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star 
                        ? 'text-gold fill-gold' 
                        : 'text-border-light fill-transparent'
                    } transition-colors`} 
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience with this ${targetType}...`}
              className="w-full bg-white border border-border rounded-xl p-3 text-sm min-h-[100px] mb-4 focus:outline-none focus:border-primary resize-none"
            />

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4" /> Post Review</>}
            </button>
          </form>
        )
      ) : (
        <div className="bg-surface-dim border border-border border-dashed rounded-xl p-6 text-center">
          <p className="text-sm text-text-muted mb-3">You must be logged in to leave a review.</p>
          <a href="/login" className="text-primary font-bold text-sm hover:underline">Log In</a>
        </div>
      )}
    </div>
  )
}
