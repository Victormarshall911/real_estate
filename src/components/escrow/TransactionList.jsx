import { useState, useEffect } from 'react'
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, AlertCircle, XCircle, 
  ChevronDown, ChevronUp, Loader2, Sparkles, MessageCircle, HelpCircle
} from 'lucide-react'
import { escrowsAPI } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export default function TransactionList() {
  const { user } = useAuth()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedDeal, setExpandedDeal] = useState(null)
  
  // Modal states for raising a dispute
  const [disputeModalDeal, setDisputeModalDeal] = useState(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [submittingDispute, setSubmittingDispute] = useState(false)

  const fetchDeals = async () => {
    try {
      const res = await escrowsAPI.list()
      setDeals(res.data)
    } catch (err) {
      console.error('Failed to load escrow deals', err)
      setError('Could not retrieve transaction history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  const handleAccept = async (id) => {
    if (!window.confirm('Are you sure you want to accept this proposal? This will lock the buyer\'s funds in escrow.')) return
    try {
      await escrowsAPI.accept(id)
      await fetchDeals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept proposal.')
    }
  }

  const handleCancel = async (id, status) => {
    const msg = status === 'escrowed' 
      ? 'Are you sure you want to refund this deal? The locked funds will be returned to the buyer\'s wallet.' 
      : 'Are you sure you want to cancel this proposal?'
    if (!window.confirm(msg)) return
    try {
      await escrowsAPI.cancel(id)
      await fetchDeals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel.')
    }
  }

  const handleRelease = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to release the escrowed funds to the seller? This action is permanent.')) return
    try {
      await escrowsAPI.release(id)
      await fetchDeals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to release funds.')
    }
  }

  const handleToggleMilestone = async (dealId, milestone, currentValue) => {
    try {
      await escrowsAPI.verifyMilestone(dealId, milestone, !currentValue)
      // Update local state directly
      setDeals(prev => prev.map(d => {
        if (d.id === dealId) {
          const updatedField = milestone === 'inspection' ? 'is_inspected' : 'is_documents_verified'
          return { ...d, [updatedField]: !currentValue }
        }
        return d
      }))
    } catch (err) {
      alert('Failed to update milestone verification status.')
    }
  }

  const handleRaiseDisputeSubmit = async (e) => {
    e.preventDefault()
    if (!disputeReason.trim()) return
    setSubmittingDispute(true)
    try {
      await escrowsAPI.dispute(disputeModalDeal.id, disputeReason.trim())
      setDisputeModalDeal(null)
      setDisputeReason('')
      await fetchDeals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to raise dispute.')
    } finally {
      setSubmittingDispute(false)
    }
  }

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center space-x-1 text-amber-600 bg-amber-50 border border-amber-200/50 py-1 px-2.5 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Pending Approval</span>
          </span>
        )
      case 'escrowed':
        return (
          <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 border border-emerald-200/50 py-1 px-2.5 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Funds Escrowed</span>
          </span>
        )
      case 'completed':
        return (
          <span className="flex items-center space-x-1 text-blue-600 bg-blue-50 border border-blue-200/50 py-1 px-2.5 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        )
      case 'cancelled':
        return (
          <span className="flex items-center space-x-1 text-text-secondary bg-muted border border-border py-1 px-2.5 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        )
      case 'disputed':
        return (
          <span className="flex items-center space-x-1 text-error bg-error/10 border border-error/20 py-1 px-2.5 rounded-full text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Disputed</span>
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-text-secondary text-sm">Loading escrow deals...</p>
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border/80 p-12 text-center max-w-xl mx-auto shadow-sm my-6">
        <ShieldCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-bold text-text-primary mb-1">No Escrow Deals Yet</h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          You don't have any active or completed escrow purchases or sales. Propose an escrow deal on any listing detail page to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Active Escrow Deals</span>
        </h3>
        <span className="text-xs text-text-secondary bg-muted px-2.5 py-1 rounded-lg border border-border">
          {deals.length} Total {deals.length === 1 ? 'Deal' : 'Deals'}
        </span>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => {
          const isBuyer = deal.buyer === user?.id
          const otherPartyName = isBuyer ? deal.seller_name : deal.buyer_name
          const otherPartyRole = isBuyer ? 'Seller' : 'Buyer'
          const isExpanded = expandedDeal === deal.id

          return (
            <div 
              key={deal.id}
              className="bg-surface rounded-2xl border border-border/80 shadow-sm overflow-hidden hover:shadow-card transition-all"
            >
              {/* Card Header Panel */}
              <div 
                onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 select-none transition-colors"
              >
                {/* Left side: Property / Client details */}
                <div className="flex items-start space-x-4 min-w-0">
                  {deal.property_primary_image ? (
                    <img 
                      src={deal.property_primary_image} 
                      alt={deal.property_title} 
                      className="w-16 h-16 object-cover rounded-xl bg-muted shrink-0 border border-border/40"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-xl shrink-0 flex items-center justify-center text-text-muted text-xs border border-border/40">
                      No Image
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="inline-block text-[10px] uppercase font-bold text-primary tracking-wider mb-1">
                      {isBuyer ? 'PURCHASE' : 'SALE'}
                    </span>
                    <h4 className="font-bold text-text-primary truncate pr-2">
                      {deal.property_title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-text-secondary mt-1">
                      <span>{otherPartyRole}: <span className="font-semibold text-text-primary">{otherPartyName}</span></span>
                      <span>•</span>
                      <span>Proposed: {new Date(deal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Status and Price */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t border-border/40 md:border-none pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-text-secondary">Amount</p>
                    <p className="font-extrabold text-primary text-base mt-0.5">
                      {formatMoney(deal.amount)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(deal.status)}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-border/60 bg-muted/20 space-y-6">
                  {/* Terms */}
                  {deal.terms && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs uppercase font-bold text-text-secondary tracking-wider">
                        Deal Terms & Instructions
                      </h5>
                      <div className="bg-surface border border-border/60 rounded-xl p-4 text-sm text-text-primary leading-relaxed shadow-sm">
                        {deal.terms}
                      </div>
                    </div>
                  )}

                  {/* Dispute notes */}
                  {deal.status === 'disputed' && deal.dispute_reason && (
                    <div className="space-y-1.5">
                      <h5 className="text-xs uppercase font-bold text-error tracking-wider flex items-center space-x-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Dispute Opened</span>
                      </h5>
                      <div className="bg-error/5 border border-error/20 text-error rounded-xl p-4 text-sm leading-relaxed">
                        <strong>Reason:</strong> {deal.dispute_reason}
                      </div>
                    </div>
                  )}

                  {/* Milestones (Only relevant when funds are escrowed/disputed/completed) */}
                  {['escrowed', 'disputed', 'completed'].includes(deal.status) && (
                    <div className="space-y-3">
                      <h5 className="text-xs uppercase font-bold text-text-secondary tracking-wider">
                        Milestone Progress Checks
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Physical Inspection Milestone */}
                        <div 
                          onClick={() => deal.status === 'escrowed' && handleToggleMilestone(deal.id, 'inspection', deal.is_inspected)}
                          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all select-none ${
                            deal.is_inspected 
                              ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900' 
                              : 'bg-surface border-border text-text-primary'
                          } ${deal.status === 'escrowed' ? 'cursor-pointer hover:border-primary/60' : 'opacity-85'}`}
                        >
                          <div>
                            <p className="font-semibold text-sm">Physical Property Inspection</p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {deal.is_inspected ? 'Marked as Completed' : 'Pending verification'}
                            </p>
                          </div>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            deal.is_inspected ? 'bg-emerald-500 border-transparent text-white' : 'border-border'
                          }`}>
                            {deal.is_inspected && <CheckCircle2 className="w-4.5 h-4.5" />}
                          </span>
                        </div>

                        {/* Title Docs Verification Milestone */}
                        <div 
                          onClick={() => deal.status === 'escrowed' && handleToggleMilestone(deal.id, 'documents', deal.is_documents_verified)}
                          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all select-none ${
                            deal.is_documents_verified 
                              ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900' 
                              : 'bg-surface border-border text-text-primary'
                          } ${deal.status === 'escrowed' ? 'cursor-pointer hover:border-primary/60' : 'opacity-85'}`}
                        >
                          <div>
                            <p className="font-semibold text-sm">Land / Property Documents Verified</p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {deal.is_documents_verified ? 'Deeds & C of O Checked' : 'Pending validation'}
                            </p>
                          </div>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            deal.is_documents_verified ? 'bg-emerald-500 border-transparent text-white' : 'border-border'
                          }`}>
                            {deal.is_documents_verified && <CheckCircle2 className="w-4.5 h-4.5" />}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40">
                    
                    {/* 1. Pending Actions */}
                    {deal.status === 'pending' && (
                      <>
                        {!isBuyer && (
                          <>
                            <button
                              onClick={() => handleAccept(deal.id)}
                              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all"
                            >
                              Accept Proposal
                            </button>
                            <button
                              onClick={() => handleCancel(deal.id, 'pending')}
                              className="px-5 py-2.5 border border-border text-error hover:bg-error/5 rounded-xl text-sm font-semibold transition-all"
                            >
                              Reject Proposal
                            </button>
                          </>
                        )}
                        {isBuyer && (
                          <button
                            onClick={() => handleCancel(deal.id, 'pending')}
                            className="px-5 py-2.5 border border-border text-text-secondary hover:bg-muted rounded-xl text-sm font-semibold transition-all"
                          >
                            Withdraw Proposal
                          </button>
                        )}
                      </>
                    )}

                    {/* 2. Escrowed Actions */}
                    {deal.status === 'escrowed' && (
                      <>
                        {isBuyer ? (
                          <>
                            <button
                              onClick={() => handleRelease(deal.id)}
                              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm"
                            >
                              Approve Release of Funds
                            </button>
                            <button
                              onClick={() => setDisputeModalDeal(deal)}
                              className="px-5 py-2.5 border border-border text-error hover:bg-error/5 rounded-xl text-sm font-semibold transition-all"
                            >
                              Raise Dispute / Hold Deal
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCancel(deal.id, 'escrowed')}
                            className="px-5 py-2.5 border border-border text-error hover:bg-error/5 rounded-xl text-sm font-semibold transition-all"
                          >
                            Voluntary Refund & Cancel Deal
                          </button>
                        )}
                      </>
                    )}

                    {/* 3. Disputed Actions */}
                    {deal.status === 'disputed' && (
                      <div className="flex items-center space-x-2 text-xs text-error font-medium bg-error/5 border border-error/15 rounded-lg py-2 px-3">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Flagged for Admin Arbitration. Our legal team will verify records.</span>
                        {isBuyer && (
                          <button
                            onClick={() => handleRelease(deal.id)}
                            className="ml-4 px-3 py-1 bg-error text-white font-semibold rounded-md hover:bg-error/90 transition-colors text-[11px]"
                          >
                            Resolve & Release Funds
                          </button>
                        )}
                      </div>
                    )}

                    {/* 4. Completed Info */}
                    {deal.status === 'completed' && (
                      <div className="flex items-center space-x-2 text-xs text-blue-700 bg-blue-50/50 border border-blue-150 rounded-lg py-2 px-3 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Escrow closed. Funds credited to the seller. Property marked as sold.</span>
                      </div>
                    )}

                    {/* 5. Cancelled Info */}
                    {deal.status === 'cancelled' && (
                      <div className="flex items-center space-x-2 text-xs text-text-secondary bg-muted rounded-lg py-2 px-3 font-medium border border-border/80">
                        <XCircle className="w-4 h-4 text-text-muted shrink-0" />
                        <span>This deal has been cancelled and any locked funds refunded.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dispute Modal */}
      {disputeModalDeal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl max-w-md w-full border border-border shadow-elevated overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/80">
              <div className="flex items-center space-x-2 text-error">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="text-lg font-bold">Raise Escrow Dispute</h2>
              </div>
              <button 
                onClick={() => { setDisputeModalDeal(null); setDisputeReason(''); }} 
                className="p-1.5 rounded-lg text-text-secondary hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRaiseDisputeSubmit} className="p-6 space-y-4">
              <p className="text-xs text-text-secondary leading-relaxed">
                Raising a dispute holds the funds securely in escrow. An administrator will review your terms and document validations before manual resolution.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Reason for Dispute
                </label>
                <textarea 
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe why you are locking this deal (e.g. 'Property inspection failed, building lacks active power connection as listed')"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors text-sm min-h-[100px] resize-y"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setDisputeModalDeal(null); setDisputeReason(''); }}
                  className="flex-1 border border-border text-text-secondary py-2 rounded-xl hover:bg-muted text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="flex-1 bg-error text-white py-2 rounded-xl hover:bg-error/95 text-sm font-semibold transition-all flex items-center justify-center space-x-1"
                >
                  {submittingDispute ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Raise Dispute</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
