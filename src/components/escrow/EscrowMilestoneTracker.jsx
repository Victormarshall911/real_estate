import React from 'react'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  FileCheck2, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  DollarSign,
  Building2,
  HelpCircle,
  Scale,
  UserCheck,
  PhoneCall,
  ShieldAlert
} from 'lucide-react'

const MILESTONES = [
  {
    key: 'deposit',
    title: '1. Escrow Funded',
    description: 'Buyer funds are safely locked in platform escrow trust account.',
    icon: Lock,
  },
  {
    key: 'accepted',
    title: '2. Seller Accepted',
    description: 'Seller agreed to purchase terms & scheduled physical site inspection.',
    icon: Building2,
  },
  {
    key: 'inspection',
    title: '3. Physical Site & Beacon Check',
    description: 'Surveyor and buyer verified property location and boundary beacons.',
    icon: MapPin,
  },
  {
    key: 'documents',
    title: '4. Title Document Search',
    description: 'Legal search completed at the state Land Registry (C of O / Survey Plan).',
    icon: FileCheck2,
  },
  {
    key: 'disbursement',
    title: '5. Dual Confirmation & Payout',
    description: 'Both buyer AND seller must confirm transaction to release funds.',
    icon: ShieldCheck,
  },
]

export default function EscrowMilestoneTracker({ 
  deal, 
  isBuyer, 
  isSeller, 
  onToggleMilestone, 
  onConfirmDeal,
  onRejectDeal,
  onRaiseDispute 
}) {
  if (!deal) return null

  // Determine active milestone state
  const isFunded = deal.status !== 'pending' && deal.status !== 'cancelled'
  const isAccepted = deal.status === 'escrowed' || deal.status === 'completed' || deal.status === 'in_mediation'
  const isInspected = Boolean(deal.is_inspected)
  const isDocsVerified = Boolean(deal.is_documents_verified)
  const isCompleted = deal.status === 'completed'
  const isInMediation = deal.status === 'in_mediation' || Boolean(deal.in_mediation)
  const isDisputed = deal.status === 'disputed' || isInMediation

  const buyerConfirmed = Boolean(deal.buyer_confirmed || deal.buyer_approved)
  const sellerConfirmed = Boolean(deal.seller_confirmed)

  const milestoneStatus = {
    deposit: isFunded,
    accepted: isAccepted,
    inspection: isInspected,
    documents: isDocsVerified,
    disbursement: isCompleted,
  }

  // Pre-conditions for final release
  const canConfirmMilestone = isInspected && isDocsVerified

  return (
    <div className="rounded-2xl bg-surface border border-border-light p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-light">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-text-primary">
              Milestone Escrow Lifecycle & Dual Confirmation
            </h4>
            <p className="text-[11px] text-text-muted">
              Funds remain protected until both parties validate boundaries, documents, and dual-confirm delivery.
            </p>
          </div>
        </div>

        {isInMediation ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-danger text-xs font-bold border border-red-200 animate-pulse">
            <Scale className="w-3.5 h-3.5" />
            <span>Mediation Case Active</span>
          </span>
        ) : isDisputed ? (
          <span className="px-3 py-1 rounded-full bg-red-100 text-danger text-xs font-bold border border-red-200">
            ⚠️ Under Arbitration Dispute
          </span>
        ) : isCompleted ? (
          <span className="px-3 py-1 rounded-full bg-green-100 text-emerald-800 text-xs font-bold border border-green-200">
            ✅ Transaction Completed & Funds Released
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
            🔒 Funds Safely Locked in Escrow
          </span>
        )}
      </div>

      {/* 5-Step Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {MILESTONES.map((m) => {
          const isDone = milestoneStatus[m.key]
          const isCurrent = !isDone && (
            (m.key === 'inspection' && isAccepted) ||
            (m.key === 'documents' && isInspected) ||
            (m.key === 'disbursement' && isDocsVerified)
          )
          const Icon = m.icon

          return (
            <div
              key={m.key}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : isCurrent
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-surface-dim border-border-light opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isDone ? 'bg-emerald-600 text-white' : (isCurrent ? 'bg-amber-500 text-white' : 'bg-surface-muted text-text-muted')
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isDone ? 'Done' : (isCurrent ? 'Current' : 'Pending')}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-text-primary leading-tight mb-1">
                  {m.title}
                </h5>
                <p className="text-[10px] text-text-secondary leading-snug">
                  {m.description}
                </p>
              </div>

              {/* Interactive Milestone Checkbox Toggles */}
              <div className="mt-3 pt-2 border-t border-border-light/60">
                {m.key === 'inspection' && isAccepted && !isCompleted && !isInMediation && onToggleMilestone && (
                  <button
                    onClick={() => onToggleMilestone(deal.id, 'inspection', isInspected)}
                    className={`w-full py-1 rounded-lg text-[10px] font-bold transition-all ${
                      isInspected 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isInspected ? '✓ Inspection Verified' : 'Mark Inspected'}
                  </button>
                )}

                {m.key === 'documents' && isAccepted && !isCompleted && !isInMediation && onToggleMilestone && (
                  <button
                    onClick={() => onToggleMilestone(deal.id, 'documents', isDocsVerified)}
                    className={`w-full py-1 rounded-lg text-[10px] font-bold transition-all ${
                      isDocsVerified 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isDocsVerified ? '✓ Documents Verified' : 'Mark Title Clear'}
                  </button>
                )}

                {m.key === 'disbursement' && (
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Buyer:</span>
                      <span className={`font-bold ${buyerConfirmed ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {buyerConfirmed ? 'Confirmed ✓' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Seller:</span>
                      <span className={`font-bold ${sellerConfirmed ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {sellerConfirmed ? 'Confirmed ✓' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ⚖️ ACTIVE MEDIATION CASE BANNER */}
      {isInMediation && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50/90 border-2 border-red-300 text-red-950 space-y-3 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow">
              <Scale className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-extrabold text-sm text-red-900">
                  ⚖️ Mediation Case Opened — Compliance Team Assigned
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-red-200 text-red-800 text-[10px] font-mono font-bold">
                  Status: {deal.mediation_status === 'resolved' ? 'Resolved' : 'Under Investigation'}
                </span>
              </div>
              <p className="text-xs text-red-800 mt-1 leading-relaxed">
                A confirmation discrepancy or issue was reported. The LandMarket Trust & Legal Compliance Team has intervened to arbitrate between the buyer and seller.
              </p>
              {deal.mediation_reason && (
                <div className="mt-2.5 p-3 rounded-xl bg-white/80 border border-red-200 text-xs text-red-900">
                  <span className="font-bold text-red-950 block mb-0.5">Discrepancy Note / Reason:</span>
                  {deal.mediation_reason}
                </div>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-red-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-red-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Funds are 100% frozen in escrow trust account. Neither party can lose money during mediation.</span>
            </div>
            <a
              href="https://wa.me/2348000000000?text=Hello%20LandMarket%20Support,%20I%20need%20help%20with%20Mediation%20Case"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact Compliance Desk</span>
            </a>
          </div>
        </div>
      )}

      {/* Dual Confirmation Actions for Active Deal */}
      {isAccepted && !isCompleted && !isInMediation && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-text-primary flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" />
                Dual Transaction Confirmation Required
              </h5>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {isBuyer && buyerConfirmed && !sellerConfirmed && (
                  <span className="text-emerald-700 font-medium">
                    ✓ You have confirmed delivery as Buyer. Waiting for seller to confirm to disburse funds.
                  </span>
                )}
                {isSeller && sellerConfirmed && !buyerConfirmed && (
                  <span className="text-emerald-700 font-medium">
                    ✓ You have confirmed handover as Seller. Waiting for buyer to authorize release.
                  </span>
                )}
                {((isBuyer && !buyerConfirmed) || (isSeller && !sellerConfirmed)) && (
                  <span>
                    Have you completed the inspection and agreed with all terms? Both parties must confirm before escrow release.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Confirm Completion Button */}
              {((isBuyer && !buyerConfirmed) || (isSeller && !sellerConfirmed)) && onConfirmDeal && (
                <button
                  onClick={() => onConfirmDeal(deal.id)}
                  disabled={!canConfirmMilestone}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-40"
                  title={!canConfirmMilestone ? 'Please verify inspection and documents first' : 'Confirm transaction completion'}
                >
                  Confirm Completion ✓
                </button>
              )}

              {/* Not Confirmed / Report Issue Button (Triggers Mediation) */}
              {onRejectDeal && (
                <button
                  onClick={() => onRejectDeal(deal)}
                  className="px-3.5 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-danger font-bold text-xs transition-colors"
                  title="Report discrepancy or mismatch. This will open a mediation case and involve our team."
                >
                  Not Confirmed / Report Issue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Safety Actions & Dispute Escalation */}
      {!isCompleted && !isDisputed && !isInMediation && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-[11px] text-text-muted">
            Found discrepancies with title documents or physical beacons?
          </p>
          {onRaiseDispute && (
            <button
              onClick={() => onRaiseDispute(deal)}
              className="inline-flex items-center gap-1.5 text-danger hover:underline font-bold text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Raise Dispute / Request Team Mediation</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
