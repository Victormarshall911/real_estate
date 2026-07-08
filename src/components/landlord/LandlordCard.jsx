import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, MessageCircle, MessageSquare, Phone, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { chatAPI } from '../../api/client'

export default function LandlordCard({ landlord, onRate }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [loadingChat, setLoadingChat] = useState(false)

  const name = landlord?.user
    ? `${landlord.user.first_name} ${landlord.user.last_name}`
    : 'Landlord'

  const whatsappUrl = landlord?.formatted_whatsapp_url
    ? `${landlord.formatted_whatsapp_url}?text=${encodeURIComponent('Hello! I saw your landlord profile on LandMarket and I would like to inquire about your property listings.')}`
    : `https://wa.me/${landlord?.phone_number?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello! I saw your landlord profile on LandMarket.')}`

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (landlord?.user?.id === user?.id) {
      alert("You cannot chat with your own profile.")
      return
    }

    if (!landlord?.user?.id) {
      alert("This landlord profile is not linked to a user account.")
      return
    }

    setLoadingChat(true)
    try {
      await chatAPI.startDirect(landlord.user.id)
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
          {landlord?.profile_picture_url ? (
            <img
              src={landlord.profile_picture_url}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary font-bold text-2xl items-center justify-center ring-2 ring-primary/20"
            style={{ display: landlord?.profile_picture_url ? 'none' : 'flex' }}
          >
            {name.charAt(0)}
          </div>
          {landlord?.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-surface rounded-full p-0.5 shadow-sm" title="Verified Landlord">
              <ShieldCheck className="w-5 h-5 text-primary fill-primary-50" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-lg truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Verified Landlord</p>
        </div>
      </div>

      {landlord?.bio && (
        <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-1">{landlord.bio}</p>
      )}

      {/* Ratings Section */}
      <div className="flex items-center justify-between py-3 border-t border-b border-border mb-4 bg-surface-muted/30 px-3 rounded-xl">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-bold text-sm text-text-primary">{landlord?.average_rating || 'New'}</span>
          <span className="text-xs text-text-muted">({landlord?.total_reviews || 0} reviews)</span>
        </div>
        {onRate && (
          <button
            onClick={() => onRate(landlord)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Leave a Review
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-auto">
        {(!isAuthenticated || user?.id !== landlord?.user?.id) && (
          <button
            onClick={handleStartChat}
            disabled={loadingChat}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-dark transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-75"
            id="landlord-direct-chat-btn"
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

          {landlord?.phone_number ? (
            <a
              href={`tel:${landlord.phone_number}`}
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
      </div>
    </div>
  )
}
