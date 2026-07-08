import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, MessageCircle, MessageSquare, Phone, Globe, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { chatAPI } from '../../api/client'

export default function DeveloperCard({ developer, onRate }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [loadingChat, setLoadingChat] = useState(false)

  const name = developer?.user
    ? `${developer.user.first_name} ${developer.user.last_name}`
    : 'Developer'

  const company = developer?.company_name || 'Independent Developer'

  const whatsappUrl = developer?.formatted_whatsapp_url
    ? `${developer.formatted_whatsapp_url}?text=${encodeURIComponent('Hello! I saw your developer profile on LandMarket and I would like to inquire about your housing estates and off-plan listings.')}`
    : `https://wa.me/${developer?.phone_number?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello! I saw your developer profile on LandMarket.')}`

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (developer?.user?.id === user?.id) {
      alert("You cannot chat with your own profile.")
      return
    }

    if (!developer?.user?.id) {
      alert("This developer profile is not linked to a user account.")
      return
    }

    setLoadingChat(true)
    try {
      await chatAPI.startDirect(developer.user.id)
      navigate('/messages')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Failed to start chat session.')
    } finally {
      setLoadingChat(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full group">
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative shrink-0">
          {developer?.profile_picture_url ? (
            <img
              src={developer.profile_picture_url}
              alt={company}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary font-bold text-2xl items-center justify-center ring-2 ring-primary/20"
            style={{ display: developer?.profile_picture_url ? 'none' : 'flex' }}
          >
            {company.charAt(0)}
          </div>
          {developer?.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-surface rounded-full p-0.5 shadow-sm" title="Verified Developer">
              <ShieldCheck className="w-5 h-5 text-primary fill-primary-50" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-lg truncate group-hover:text-primary transition-colors">
            {company}
          </h3>
          <p className="text-sm font-medium text-text-secondary truncate">{name}</p>
          {developer?.company_location && (
            <p className="text-xs text-text-muted truncate mt-0.5">{developer.company_location}</p>
          )}
        </div>
      </div>

      {developer?.bio && (
        <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-1">{developer.bio}</p>
      )}

      {/* Ratings Section */}
      <div className="flex items-center justify-between py-3 border-t border-b border-border mb-4 bg-surface-muted/30 px-3 rounded-xl">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-bold text-sm text-text-primary">{developer?.average_rating || 'New'}</span>
          <span className="text-xs text-text-muted">({developer?.total_reviews || 0} reviews)</span>
        </div>
        {onRate && (
          <button
            onClick={() => onRate(developer)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Leave a Review
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-auto">
        {(!isAuthenticated || user?.id !== developer?.user?.id) && (
          <button
            onClick={handleStartChat}
            disabled={loadingChat}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-dark transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-75"
            id="developer-direct-chat-btn"
          >
            {loadingChat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            {loadingChat ? 'Connecting...' : 'Message on LandMarket'}
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-sm hover:shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {developer?.phone_number ? (
            <a
              href={`tel:${developer.phone_number}`}
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

        {developer?.portfolio_url && (
          <a
            href={developer.portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 w-full py-2 px-3 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary font-semibold text-xs transition-all border border-primary-200"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Website</span>
          </a>
        )}
      </div>
    </div>
  )
}
