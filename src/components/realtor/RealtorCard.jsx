import { Phone, MessageCircle, BadgeCheck, User } from 'lucide-react'

export default function RealtorCard({ realtor, propertyTitle = '' }) {
  const whatsappMessage = propertyTitle
    ? `Hi, I'm interested in your property listing: "${propertyTitle}" on LandMarket. Is it still available?`
    : `Hi, I found your profile on LandMarket and would like to inquire about your listings.`

  const whatsappUrl = realtor?.formatted_whatsapp_url
    ? `${realtor.formatted_whatsapp_url}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/${realtor?.phone_number?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`

  const name = realtor?.user
    ? `${realtor.user.first_name} ${realtor.user.last_name}`
    : realtor?.realtor_name || 'Realtor'

  return (
    <div className="bg-surface rounded-2xl border border-border-light p-6 shadow-card">
      {/* Profile */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {realtor?.profile_picture_url ? (
            <img src={realtor.profile_picture_url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-text-primary text-sm truncate">{name}</h4>
            {realtor?.is_verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
          </div>
          {realtor?.company_name && (
            <p className="text-xs text-text-muted truncate">{realtor.company_name}</p>
          )}
          {realtor?.listing_count !== undefined && (
            <p className="text-xs text-text-muted mt-0.5">{realtor.listing_count} active listing{realtor.listing_count !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20bd5a] transition-all duration-200 hover:shadow-lg hover:shadow-[#25D366]/25 active:scale-[0.98]"
          id="realtor-whatsapp-btn"
        >
          <MessageCircle className="w-4 h-4" />
          Chat on WhatsApp
        </a>
        <a
          href={`tel:${realtor?.phone_number}`}
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
