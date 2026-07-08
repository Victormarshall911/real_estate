import { useState, useEffect } from 'react'
import { X, ShieldCheck, CreditCard, Loader2 } from 'lucide-react'
import { walletsAPI } from '../../api/client'

export default function AgentConnectionModal({ agent, locationPrice, onClose, onConfirm, loading }) {
  const [wallet, setWallet] = useState(null)
  const [loadingWallet, setLoadingWallet] = useState(true)

  const fee = locationPrice ? parseFloat(locationPrice.connection_fee) : 0
  const formattedFee = fee.toLocaleString()

  useEffect(() => {
    if (agent && locationPrice) {
      setLoadingWallet(true)
      walletsAPI.me()
        .then(res => {
          setWallet(res.data)
        })
        .catch(err => {
          console.error('Failed to fetch wallet info', err)
        })
        .finally(() => {
          setLoadingWallet(false)
        })
    }
  }, [agent, locationPrice])

  if (!agent || !locationPrice) return null

  const hasInsufficientBalance = wallet && parseFloat(wallet.balance) < fee

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

          {loadingWallet ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : hasInsufficientBalance ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-danger font-medium mb-6">
              <p className="font-bold mb-1">Insufficient Wallet Balance</p>
              <p className="text-text-secondary mb-2">
                This connection costs <strong>₦{formattedFee}</strong>, but your wallet balance is only <strong>₦{parseFloat(wallet.balance).toLocaleString()}</strong>.
              </p>
              <p className="text-text-muted">Please close this modal and add funds via the dashboard wallet to proceed.</p>
            </div>
          ) : (
            <div className="bg-success/10 rounded-xl p-4 border border-success/20 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">Total to Pay</span>
                <span className="text-lg font-bold text-success">
                  {fee > 0 ? `₦${formattedFee}` : 'Free'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                {fee > 0 
                  ? 'This amount will be deducted from your wallet and held in escrow until the connection is closed.' 
                  : 'Connect instantly for free!'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted leading-relaxed">
                <strong className="text-text-primary">Instant Access:</strong> Hiring an agent grants you instant access to the agent's verified contact details and direct chat.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-border bg-surface-dim/50 flex flex-col gap-3">
          <button
            onClick={() => onConfirm(agent.id, locationPrice.id)}
            disabled={loading || loadingWallet || hasInsufficientBalance}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-75 disabled:bg-primary/50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Confirm Connection
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
