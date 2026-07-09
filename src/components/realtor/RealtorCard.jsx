import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, MessageSquare, BadgeCheck, User, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { chatAPI } from '../../api/client'

export default function RealtorCard({ realtor, sellerRole = 'realtor', propertyTitle = '', onTrackEvent }) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [loadingChat, setLoadingChat] = useState(false)

  const whatsappMessage = propertyTitle
    ? `Hi, I'm interested in your property listing: "${propertyTitle}" on LandMarket. Is it still available?`
    : `Hi, I found your profile on LandMarket and would like to inquire about your listings.`

  const whatsappUrl = realtor?.formatted_whatsapp_url
    ? `${realtor.formatted_whatsapp_url}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/${realtor?.phone_number?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`

  const name = sellerRole === 'developer' && realtor?.company_name
    ? realtor.company_name
    : (realtor?.user
      ? `${realtor.user.first_name} ${realtor.user.last_name}`
      : 'Professional')

  const roleLabel = sellerRole === 'developer' 
    ? 'Developer' 
    : (sellerRole === 'landlord' ? 'Landlord' : 'Realtor')

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (realtor?.user?.id === user?.id) {
      alert("You cannot chat with your own listing.")
      return
    }

    if (!realtor?.user?.id) {
      alert("This seller profile is not linked to a user account.")
      return
    }

    setLoadingChat(true)
    try {
      await chatAPI.startDirect(realtor.user.id)
      navigate('/messages')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Failed to start chat session.')
    } finally {
      setLoadingChat(false)
    }
  }

  return (
    <div className="bg-surface rounded-2xl border border-border-light p-6 shadow-card">
      {/* Profile */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {realtor?.profile_picture_url ? (
            <img
              src={realtor.profile_picture_url}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <span
            className="w-full h-full items-center justify-center text-primary font-bold text-lg"
            style={{ display: realtor?.profile_picture_url ? 'none' : 'flex' }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-text-primary text-sm truncate">{name}</h4>
            {realtor?.is_verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
          </div>
          <p className="text-xs text-text-muted capitalize font-semibold tracking-wider text-primary/80 mt-0.5">{roleLabel}</p>
          {sellerRole === 'developer' && realtor?.company_name && realtor?.user && (
            <p className="text-[10px] text-text-muted truncate">Contact: {realtor.user.first_name}</p>
          )}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        {/* Only show chat option if not own listing */}
        {(!isAuthenticated || user?.id !== realtor?.user?.id) && (
          <button
            onClick={handleStartChat}
            disabled={loadingChat}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-75"
            id="realtor-direct-chat-btn"
          >
            {loadingChat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            {loadingChat ? 'Connecting...' : 'Message Seller'}
          </button>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onTrackEvent && onTrackEvent('whatsapp_click')}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20bd5a] transition-all duration-200 hover:shadow-lg hover:shadow-[#25D366]/25 active:scale-[0.98]"
          id="realtor-whatsapp-btn"
        >
          <MessageCircle className="w-4 h-4" />
          Chat on WhatsApp
        </a>
        <a
          href={`tel:${realtor?.phone_number}`}
          onClick={() => onTrackEvent && onTrackEvent('phone_click')}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-200 active:scale-[0.98]"
          id="realtor-call-btn"
        >
          <Phone className="w-4 h-4" />
          Click to Call
        </a>
      </div>

      {/* Bio */}
      {realtor?.bio && (
        <p className="mt-5 pt-5 border-t border-border-light text-xs text-text-muted leading-relaxed">
          {realtor.bio}
        </p>
      )}
    </div>
  )
}
