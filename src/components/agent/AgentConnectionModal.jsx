import { X, ShieldCheck, CreditCard, Loader2 } from 'lucide-react'

export default function AgentConnectionModal({ agent, locationPrice, onClose, onConfirm, loading }) {
  if (!agent || !locationPrice) return null

  const fee = parseFloat(locationPrice.connection_fee)
  const formattedFee = fee.toLocaleString()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={() => !loading && onClose()}
      />
      
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-full animate-fade-in-up">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-surface-dim/50">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Hire Agent</h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full hover:bg-surface-muted text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-primary/20">
              {agent.profile_picture_url ? (
                <img src={agent.profile_picture_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">
              Connect with {agent.user?.first_name}
            </h3>
            <p className="text-sm text-text-muted">
              You are about to hire this agent for property assistance in:
            </p>
            <div className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-surface-dim border border-border-light text-sm font-semibold text-text-primary">
              {locationPrice.location}, {locationPrice.state}
            </div>
          </div>

          <div className="bg-surface-dim rounded-xl p-4 border border-border-light mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Connection Fee</span>
              <span className="font-bold text-text-primary">₦{formattedFee}</span>
            </div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-light">
              <span className="text-sm text-text-secondary">Processing Fee (1.5%)</span>
              <span className="font-bold text-text-primary">₦{(fee * 0.015).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">Total to Pay</span>
              <span className="text-lg font-bold text-primary">
                ₦{(fee * 1.015).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted leading-relaxed">
                <strong className="text-text-primary">Secure Payment:</strong> Your payment is held securely and grants you instant access to the agent's verified contact details and direct chat.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-border bg-surface-dim/50 flex flex-col gap-3">
          <button
            onClick={() => onConfirm(agent.id, locationPrice.id)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#092C4C] text-white font-bold text-sm hover:bg-[#092C4C]/90 transition-all disabled:opacity-70 active:scale-[0.98] shadow-lg shadow-[#092C4C]/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay with Paystack
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border border-border text-text-secondary font-semibold text-sm hover:bg-surface-muted transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        
      </div>
    </div>
  )
}
