import { Link } from 'react-router-dom'
import { MapPin, Maximize2, Eye, BadgeCheck, ImageIcon } from 'lucide-react'

function formatPrice(price) {
  const num = parseFloat(price)
  if (num >= 1000000000) return `₦${(num / 1000000000).toFixed(1)}B`
  if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `₦${(num / 1000).toFixed(0)}K`
  return `₦${num.toLocaleString()}`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function PropertyCard({ property }) {
  const {
    id, title, price, land_size, land_size_plots, location,
    primary_image_url, is_verified, image_count, view_count, created_at,
  } = property

  return (
    <Link
      to={`/properties/${id}`}
      className="group block bg-surface rounded-2xl border border-border-light overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
      id={`property-card-${id}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {primary_image_url ? (
          <img
            src={primary_image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-text-muted" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Verified Badge */}
        {is_verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-white text-xs font-medium">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </div>
        )}

        {/* Image Count */}
        {image_count > 1 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs">
            <ImageIcon className="w-3 h-3" /> {image_count}
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <span className="price-tag text-base">{formatPrice(price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-text-primary text-sm sm:text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-text-muted text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border-light">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-text-secondary font-medium">
              <Maximize2 className="w-3.5 h-3.5 text-primary/70" />
              {parseFloat(land_size).toLocaleString()} sqm
            </span>
            {land_size_plots && (
              <span className="text-xs text-text-muted">
                ({land_size_plots} plot{land_size_plots !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {view_count}
            </span>
            <span>{timeAgo(created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
