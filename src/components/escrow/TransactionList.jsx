import { useState, useEffect } from 'react'
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, AlertCircle, XCircle, 
  ChevronDown, ChevronUp, Loader2, Sparkles, MessageCircle, HelpCircle,
  Scale, X, UserCheck, ArrowRight, PhoneCall
} from 'lucide-react'
import { escrowsAPI } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'
import EscrowMilestoneTracker from './EscrowMilestoneTracker'

export default function TransactionList() {
  const { user } = useAuth()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedDeal, setExpandedDeal] = useState(null)
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'active' | 'mediation' | 'completed'
  
  // Modal states for reporting mismatch / opening mediation
  const [rejectModalDeal, setRejectModalDeal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectEvidence, setRejectEvidence] = useState('')
  const [submittingReject, setSubmittingReject] = useState(false)

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

  const handleConfirmDeal = async (id) => {
    if (!window.confirm('Confirm completion? When both buyer and seller confirm, escrow funds are disbursed to the seller.')) return
    try {
      const res = await escrowsAPI.confirm(id)
      alert(res.data.message || 'Confirmation recorded successfully.')
      await fetchDeals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record confirmation.')
    }
  }

  const handleRejectDealSubmit = async (e) => {
    e.preventDefault()
    if (!rejectReason.trim()) return
    setSubmittingReject(true)
    try {
      const res = await escrowsAPI.reject(rejectModalDeal.id, {
        reason: rejectReason.trim(),
        evidence_notes: rejectEvidence.trim(),
      })
      alert(res.data.message || 'Mediation case opened. LandMarket team assigned.')
      setRejectModalDeal(null)
      setRejectReason('')
      setRejectEvidence('')
      await fetchDeals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to open mediation.')
    } finally {
      setSubmittingReject(false)
    }
  }

  const handleToggleMilestone = async (dealId, milestone, currentValue) => {
    try {
      await escrowsAPI.verifyMilestone(dealId, milestone, !currentValue)
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
      case 'in_mediation':
        return (
          <span className="flex items-center space-x-1 text-red-700 bg-red-50 border border-red-200 py-1 px-2.5 rounded-full text-xs font-semibold animate-pulse">
            <Scale className="w-3.5 h-3.5 text-red-600" />
            <span>In Mediation</span>
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
          <span className="flex items-center space-x-1 text-text-secondary bg-surface-dim border border-border py-1 px-2.5 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        )
      case 'disputed':
        return (
          <span className="flex items-center space-x-1 text-red-600 bg-red-50 border border-red-200 py-1 px-2.5 rounded-full text-xs font-semibold">
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
        <p className="text-text-secondary text-sm">Loading escrow transactions...</p>
      </div>
    )
  }

  // Filter deals based on active tab
  const filteredDeals = deals.filter(d => {
    if (filterTab === 'active') return d.status === 'pending' || d.status === 'escrowed'
    if (filterTab === 'mediation') return d.status === 'in_mediation' || d.status === 'disputed'
    if (filterTab === 'completed') return d.status === 'completed'
    return true
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-danger text-sm">
          {error}
        </div>
      )}

      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Milestone Escrow Deals</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Protected transaction accounts with dual confirmation & legal mediation
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-dim rounded-xl border border-border-light text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterTab === 'all' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({deals.length})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterTab === 'active' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Active ({deals.filter(d => d.status === 'pending' || d.status === 'escrowed').length})
          </button>
          <button
            onClick={() => setFilterTab('mediation')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterTab === 'mediation' ? 'bg-red-600 text-white shadow-sm' : 'text-text-secondary hover:text-danger'
            }`}
          >
            Mediation ({deals.filter(d => d.status === 'in_mediation' || d.status === 'disputed').length})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterTab === 'completed' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Completed ({deals.filter(d => d.status === 'completed').length})
          </button>
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center max-w-xl mx-auto shadow-sm my-6">
          <ShieldCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-1">No Escrow Deals In This Filter</h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {filterTab === 'mediation' 
              ? 'No active disputes or mediation cases. All transactions are proceeding smoothly.'
              : 'You have no deals matching this status. Propose an escrow deal on any listing detail page to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => {
            const isBuyer = deal.buyer === user?.id
            const otherPartyName = isBuyer ? deal.seller_name : deal.buyer_name
            const otherPartyRole = isBuyer ? 'Seller' : 'Buyer'
            const isExpanded = expandedDeal === deal.id
            const isInMediation = deal.status === 'in_mediation' || deal.status === 'disputed'

            return (
              <div 
                key={deal.id}
                className={`bg-surface rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  isInMediation ? 'border-red-300 ring-1 ring-red-400/20' : 'border-border hover:shadow-card'
                }`}
              >
                {/* Card Header Panel */}
                <div 
                  onClick={() => setExpandedDeal(isExpanded ? null : deal.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface-dim/50 select-none transition-colors"
                >
                  {/* Left side: Property / Client details */}
                  <div className="flex items-start space-x-4 min-w-0">
                    {deal.property_primary_image ? (
                      <img 
                        src={deal.property_primary_image} 
                        alt={deal.property_title} 
                        className="w-16 h-16 object-cover rounded-xl bg-surface-dim shrink-0 border border-border-light"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-surface-dim rounded-xl shrink-0 flex items-center justify-center text-text-muted text-xs border border-border-light">
                        No Image
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block text-[10px] uppercase font-bold text-primary tracking-wider">
                          {isBuyer ? 'PURCHASE' : 'SALE'}
                        </span>
                        {isInMediation && (
                          <span className="px-2 py-0.2 rounded-full bg-red-100 text-danger text-[9px] font-bold">
                            Case Active
                          </span>
                        )}
                      </div>
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
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t border-border-light md:border-none pt-3 md:pt-0">
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
                  <div className="px-5 pb-6 pt-2 border-t border-border-light bg-surface-dim/40 space-y-6">
                    {/* Terms */}
                    {deal.terms && (
                      <div className="space-y-1.5">
                        <h5 className="text-xs uppercase font-bold text-text-secondary tracking-wider">
                          Deal Terms & Instructions
                        </h5>
                        <div className="bg-surface border border-border-light rounded-xl p-4 text-sm text-text-primary leading-relaxed shadow-sm">
                          {deal.terms}
                        </div>
                      </div>
                    )}

                    {/* Milestones Escrow Tracker Component */}
                    <EscrowMilestoneTracker 
                      deal={deal}
                      isBuyer={isBuyer}
                      isSeller={!isBuyer}
                      onToggleMilestone={handleToggleMilestone}
                      onConfirmDeal={handleConfirmDeal}
                      onRejectDeal={(d) => {
                        setRejectModalDeal(d)
                        setRejectReason('')
                        setRejectEvidence('')
                      }}
                      onRaiseDispute={(d) => {
                        setRejectModalDeal(d)
                        setRejectReason('')
                        setRejectEvidence('')
                      }}
                    />

                    {/* Additional Proposal Actions Bar */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border-light">
                      {deal.status === 'pending' && (
                        <>
                          {!isBuyer ? (
                            <>
                              <button
                                onClick={() => handleAccept(deal.id)}
                                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all"
                              >
                                Accept Proposal & Lock Funds
                              </button>
                              <button
                                onClick={() => handleCancel(deal.id, 'pending')}
                                className="px-5 py-2.5 border border-border text-danger hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
                              >
                                Reject Proposal
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCancel(deal.id, 'pending')}
                              className="px-5 py-2.5 border border-border text-text-secondary hover:bg-surface-dim rounded-xl text-sm font-semibold transition-all"
                            >
                              Withdraw Proposal
                            </button>
                          )}
                        </>
                      )}

                      {deal.status === 'escrowed' && !isBuyer && (
                        <button
                          onClick={() => handleCancel(deal.id, 'escrowed')}
                          className="px-4 py-2 border border-border text-danger hover:bg-red-50 rounded-xl text-xs font-semibold transition-all"
                        >
                          Voluntary Refund & Cancel Deal
                        </button>
                      )}

                      {deal.status === 'completed' && (
                        <div className="flex items-center space-x-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg py-2 px-3 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Escrow completed! Funds credited to seller wallet. Property marked sold.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ⚖️ REPORT ISSUE / MEDIATION MODAL */}
      {rejectModalDeal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-3xl max-w-lg w-full border border-border-light shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-light bg-red-50/50">
              <div className="flex items-center space-x-3 text-danger">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Open Mediation & Involve Platform Team</h3>
                  <p className="text-xs text-text-muted">LandMarket Trust & Safety Intervention Desk</p>
                </div>
              </div>
              <button 
                onClick={() => { setRejectModalDeal(null); setRejectReason(''); setRejectEvidence(''); }} 
                className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-dim transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRejectDealSubmit} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Important Notice:</strong> Clicking "Not Confirmed" or reporting an issue immediately transitions this transaction into <strong>Mediation</strong>. Funds will remain 100% frozen in escrow custody while our compliance team arbitrates.
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary">
                  Specific Reason for Non-Confirmation / Dispute <span className="text-danger">*</span>
                </label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Physical beacons do not match survey coordinates, seller failed to hand over physical possession, or documents contain discrepancies at the state Land Registry."
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors text-xs min-h-[100px] resize-y"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary">
                  Supporting Evidence / Contact Notes (Optional)
                </label>
                <input 
                  type="text"
                  value={rejectEvidence}
                  onChange={(e) => setRejectEvidence(e.target.value)}
                  placeholder="e.g. Phone log details, surveyor beacon coordinates, or registry search report number"
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-primary transition-colors text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setRejectModalDeal(null); setRejectReason(''); setRejectEvidence(''); }}
                  className="flex-1 border border-border text-text-secondary py-2.5 rounded-xl hover:bg-surface-dim text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject || !rejectReason.trim()}
                  className="flex-1 bg-danger text-white py-2.5 rounded-xl hover:bg-red-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-md shadow-red-500/20"
                >
                  {submittingReject ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Scale className="w-4 h-4" />
                      <span>Submit & Open Mediation</span>
                    </>
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
