import { useState } from 'react'
import { Star } from 'lucide-react'

/**
 * StarRating — Interactive rating widget.
 * Props:
 *   currentRating  {number} — existing average rating (0-5)
 *   ratingCount    {number} — number of ratings received
 *   onRate         {function(n)} — called when user submits a rating
 *   canRate        {boolean} — whether current user can rate (authenticated & not own profile)
 *   size           {'sm'|'md'} — star size
 */
export default function StarRating({
  currentRating = 0,
  ratingCount = 0,
  onRate,
  canRate = false,
  size = 'sm',
}) {
  const [hover, setHover] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userRating, setUserRating] = useState(0)

  const starSize = size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  const displayRating = userRating || currentRating

  const handleRate = async (n) => {
    if (!canRate || !onRate || loading) return
    setLoading(true)
    try {
      await onRate(n)
      setUserRating(n)
      setSubmitted(true)
    } catch (err) {
      // silently fail — user sees no change
    } finally {
      setLoading(false)
      setHover(0)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Stars row */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= (hover || displayRating)
          return (
            <button
              key={n}
              type="button"
              disabled={!canRate || submitted || loading}
              onClick={() => handleRate(n)}
              onMouseEnter={() => canRate && !submitted && setHover(n)}
              onMouseLeave={() => setHover(0)}
              className={`transition-all duration-100 focus:outline-none ${
                canRate && !submitted ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
              aria-label={`Rate ${n} star${n !== 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSize} transition-colors duration-100 ${
                  active
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300 fill-gray-100'
                }`}
              />
            </button>
          )
        })}
        {ratingCount > 0 && (
          <span className="ml-1.5 text-xs text-text-muted font-medium">
            {displayRating.toFixed(1)} ({ratingCount})
          </span>
        )}
        {ratingCount === 0 && (
          <span className="ml-1.5 text-xs text-text-muted">No ratings yet</span>
        )}
      </div>
      {/* Feedback messages */}
      {canRate && !submitted && (
        <p className="text-[10px] text-text-muted italic">Tap to rate</p>
      )}
      {submitted && (
        <p className="text-[10px] text-success font-medium">Thanks for your rating!</p>
      )}
    </div>
  )
}
