import { Star, MessageCircle, Phone, Globe, ShieldCheck, Award } from 'lucide-react'

export default function ArchitectCard({ architect, onRate }) {
  const whatsappUrl = architect?.formatted_whatsapp_url
    ? `${architect.formatted_whatsapp_url}?text=${encodeURIComponent('Hello! I saw your profile on Suba and I would like to inquire about architectural design services.')}`
    : `https://wa.me/${architect?.phone_number?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello! I saw your profile on Suba.')}`

  const name = architect?.user
    ? `${architect.user.first_name} ${architect.user.last_name}`
    : architect?.company_name || 'Architect'

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full group">
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative shrink-0">
          {architect?.profile_picture_url ? (
            <img
              src={architect.profile_picture_url}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary font-bold text-2xl flex items-center justify-center ring-2 ring-primary/20">
              {name.charAt(0)}
            </div>
          )}
          {architect?.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-surface rounded-full p-0.5 shadow-sm" title="Verified Architect">
              <ShieldCheck className="w-5 h-5 text-primary fill-primary-50" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-lg truncate group-hover:text-primary transition-colors">
            {architect?.company_name || name}
          </h3>
          <p className="text-sm font-medium text-text-secondary truncate">{name}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary-50 text-primary border border-primary-100">
              <Award className="w-3 h-3 mr-1" />
              {architect?.specialization || 'Architect'}
            </span>
            <span className="text-xs text-text-muted">{architect?.years_of_experience || 1} yrs exp</span>
          </div>
        </div>
      </div>

      {architect?.bio && (
        <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-1">{architect.bio}</p>
      )}

      {/* Ratings Section */}
      <div className="flex items-center justify-between py-3 border-t border-b border-border mb-4 bg-surface-muted/30 px-3 rounded-xl">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-bold text-sm text-text-primary">{architect?.average_rating || 'New'}</span>
          <span className="text-xs text-text-muted">({architect?.total_reviews || 0} reviews)</span>
        </div>
        {onRate && (
          <button
            onClick={() => onRate(architect)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Leave a Review
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-sm hover:shadow"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>

        {architect?.phone_number ? (
          <a
            href={`tel:${architect.phone_number}`}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-surface-muted hover:bg-border text-text-primary font-semibold text-xs transition-all border border-border"
          >
            <Phone className="w-4 h-4 text-primary" />
            <span>Call Now</span>
          </a>
        ) : (
          <div className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-surface-muted text-text-muted font-semibold text-xs border border-border opacity-60">
            No Phone
          </div>
        )}
      </div>

      {architect?.portfolio_url && (
        <a
          href={architect.portfolio_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary font-semibold text-xs transition-all border border-primary-200"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>View Portfolio & Designs</span>
        </a>
      )}
    </div>
  )
}
