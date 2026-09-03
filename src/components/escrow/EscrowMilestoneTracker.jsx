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
  HelpCircle
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
    title: '2. Seller Confirmed',
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
    title: '5. Release & Payout',
    description: 'Buyer authorizes fund release; payout disbursed to seller.',
    icon: ShieldCheck,
  },
]

export default function EscrowMilestoneTracker({ 
  deal, 
  isBuyer, 
  isSeller, 
  onToggleMilestone, 
  onRelease, 
  onRaiseDispute 
}) {
  if (!deal) return null

  // Determine active milestone state
  const isFunded = deal.status !== 'pending' && deal.status !== 'cancelled'
  const isAccepted = deal.status === 'escrowed' || deal.status === 'completed'
  const isInspected = Boolean(deal.is_inspected)
  const isDocsVerified = Boolean(deal.is_documents_verified)
  const isCompleted = deal.status === 'completed'
  const isDisputed = deal.status === 'disputed'

  const milestoneStatus = {
    deposit: isFunded,
    accepted: isAccepted,
    inspection: isInspected,
    documents: isDocsVerified,
    disbursement: isCompleted,
  }

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
              Milestone Escrow Lifecycle
            </h4>
            <p className="text-[11px] text-text-muted">
              Funds remain protected until both parties validate title and physical boundaries.
            </p>
          </div>
        </div>

        {isDisputed ? (
          <span className="px-3 py-1 rounded-full bg-red-100 text-danger text-xs font-bold border border-red-200">
            ⚠️ Under Arbitration Dispute
          </span>
        ) : isCompleted ? (
          <span className="px-3 py-1 rounded-full bg-green-100 text-emerald-800 text-xs font-bold border border-green-200">
            ✅ Transaction Completed
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
            🔒 Funds Locked in Escrow
          </span>
        )}
      </div>

      {/* 5-Step Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {MILESTONES.map((m, index) => {
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
                {m.key === 'inspection' && isAccepted && !isCompleted && onToggleMilestone && (
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

                {m.key === 'documents' && isAccepted && !isCompleted && onToggleMilestone && (
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

                {m.key === 'disbursement' && isBuyer && !isCompleted && deal.status === 'escrowed' && onRelease && (
                  <button
                    onClick={() => onRelease(deal.id)}
                    disabled={!isInspected || !isDocsVerified}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all disabled:opacity-40"
                    title={!isInspected || !isDocsVerified ? 'Complete inspection and document milestones before release' : 'Authorize release'}
                  >
                    Authorize Release
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Safety Actions & Dispute Escalation */}
      {!isCompleted && !isDisputed && (
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
              <span>Raise Arbitration Dispute</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
