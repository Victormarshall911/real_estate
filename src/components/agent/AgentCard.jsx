import { MapPin, CheckCircle2, User, Star } from 'lucide-react'

export default function AgentCard({ agent, onConnect }) {
  const name = agent?.user?.full_name || 'Agent'
  const profilePic = agent?.profile_picture_url

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col h-full group">
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-colors">
          {profilePic ? (
            <img
              src={profilePic}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <span
            className="w-full h-full items-center justify-center text-primary font-bold text-xl"
            style={{ display: profilePic ? 'none' : 'flex' }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-bold text-text-primary text-lg truncate" title={name}>
              {name}
            </h3>
            {agent.is_verified && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            {agent.average_rating > 0 && (
              <div className="flex items-center gap-1 ml-2 bg-gold/10 px-1.5 py-0.5 rounded text-xs font-bold text-gold">
                <Star className="w-3 h-3 fill-gold" />
                {agent.average_rating}
              </div>
            )}
          </div>
          {agent.company_name && (
            <p className="text-sm font-medium text-text-secondary truncate" title={agent.company_name}>
              {agent.company_name}
            </p>
          )}
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {agent.company_location || 'Remote'}
          </p>
        </div>
      </div>

      {/* Stats/Bio */}
      <div className="px-5 pb-4 flex-1">
        <p className="text-sm text-text-secondary line-clamp-3 mb-4 leading-relaxed">
          {agent.bio || 'Professional real estate agent.'}
        </p>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-muted border border-border-light">
          <span className="text-xs font-semibold text-text-primary">{agent.total_connections}</span>
          <span className="text-xs text-text-muted">Connections</span>
        </div>
      </div>

      {/* Locations & Pricing */}
      <div className="bg-surface-dim border-t border-border p-5 mt-auto">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Areas Covered & Connection Fees
        </h4>
        
        {agent.location_prices?.length > 0 ? (
          <div className="space-y-2">
            {agent.location_prices.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between bg-surface p-3 rounded-xl border border-border-light">
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-semibold text-text-primary truncate">{loc.location}</p>
                  <p className="text-xs text-text-muted truncate">{loc.state} State</p>
                </div>
                <button
                  onClick={() => onConnect(agent, loc)}
                  className="shrink-0 px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-colors"
                >
                  {parseFloat(loc.connection_fee) === 0 ? 'Free' : `₦${parseFloat(loc.connection_fee).toLocaleString()}`}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-surface rounded-xl border border-border-light border-dashed">
            <p className="text-xs text-text-muted">No specific locations listed yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
