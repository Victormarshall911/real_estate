import { useState, useEffect } from 'react'
import { X, Loader2, ShieldCheck, Wallet as WalletIcon, AlertTriangle } from 'lucide-react'
import { walletsAPI, escrowsAPI } from '../../api/client'

export default function ProposeBuyModal({ property, onClose, onSuccess }) {
  const [amount, setAmount] = useState(property.price || '')
  const [terms, setTerms] = useState('')
  const [wallet, setWallet] = useState(null)
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await walletsAPI.me()
        setWallet(res.data)
      } catch (err) {
        console.error('Failed to fetch wallet balance', err)
      } finally {
        setLoadingWallet(false)
      }
    }
    fetchWallet()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid purchase price.')
      setSubmitting(false)
      return
    }

    try {
      await escrowsAPI.create({
        property_listing: property.id,
        amount: parseFloat(amount),
        terms: terms.trim()
      })
      onSuccess?.()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join(' | ')
        setError(msgs || 'Failed to submit proposal.')
      } else {
        setError('Failed to submit proposal. Please check your inputs.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val)
  }

  const isLowBalance = wallet && parseFloat(wallet.balance) < parseFloat(amount)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl max-w-lg w-full border border-border shadow-elevated overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text-primary">Propose Escrow Purchase</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
              {error}
            </div>
          )}

          {/* Property Info */}
          <div className="bg-muted/40 rounded-xl p-4 flex items-center space-x-4 border border-border/60">
            {property.primary_image_url ? (
              <img 
                src={property.primary_image_url} 
                alt={property.title} 
                className="w-16 h-16 object-cover rounded-lg bg-muted shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-lg shrink-0 flex items-center justify-center text-text-muted text-xs">
                No Image
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-text-primary truncate">{property.title}</h4>
              <p className="text-sm text-text-secondary mt-0.5 truncate">{property.location}</p>
              <p className="text-sm font-bold text-primary mt-1">{formatMoney(property.price)}</p>
            </div>
          </div>

          {/* Wallet Balance Info */}
          <div className="bg-surface border border-border/80 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <WalletIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Your Wallet Balance</p>
                {loadingWallet ? (
                  <div className="h-4 w-20 skeleton rounded-md mt-1" />
                ) : (
                  <p className="font-bold text-text-primary mt-0.5">
                    {formatMoney(wallet?.balance || 0)}
                  </p>
                )}
              </div>
            </div>
            
            {isLowBalance && !loadingWallet && (
              <div className="flex items-center space-x-1.5 text-amber-600 bg-amber-50 border border-amber-200/50 rounded-lg py-1.5 px-2.5 text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Low Balance</span>
              </div>
            )}
          </div>

          {/* Offer Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-primary">
              Proposed Price (₦)
            </label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000000"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors font-medium"
              required
            />
            <p className="text-xs text-text-secondary">
              This amount will be locked in escrow once the seller accepts the proposal.
            </p>
          </div>

          {/* Terms/Notes Area */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-primary">
              Terms & Custom Instructions
            </label>
            <textarea 
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Write any conditions, payment structures, or validation terms (e.g. 'Subject to document validation and physical inspection next Tuesday')"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm min-h-[100px] resize-y"
            />
          </div>

          {/* Low Balance Action Warning */}
          {isLowBalance && !loadingWallet && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Your wallet balance is currently lower than your proposed offer. You can still submit this proposal, but you must fund your wallet before the seller can accept it.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-text-secondary font-semibold py-3 rounded-xl hover:bg-muted transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Proposal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
