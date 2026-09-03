import React from 'react'
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Lock, 
  MapPin, 
  FileText, 
  UserCheck, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react'
import VerifiedBadge from '../shared/VerifiedBadge'

export default function KnowBeforeYouPayModal({ 
  property, 
  onClose, 
  onProceedToEscrow,
  onRequestVerification 
}) {
  if (!property) return null

  const seller = property.realtor || property.landlord || property.developer || property.architect
  const sellerRole = property.realtor ? 'Realtor' : (property.developer ? 'Developer' : (property.landlord ? 'Landlord' : 'Architect'))
  const isSellerVerified = Boolean(seller?.is_verified)
  const isTitleVerified = Boolean(property.is_title_verified)
  const hasDocuments = Boolean(property.has_c_of_o || property.has_survey_plan || (property.documents && property.documents.length > 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl border border-border-light shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 sm:p-8 animate-scale-up relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-dim transition-colors"
          title="Close safety modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
              Know Before You Pay 🔍
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Buyer Safety & Pre-Transaction Checklist for #{property.id?.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Property Brief */}
        <div className="p-3.5 rounded-2xl bg-surface-dim border border-border-light mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">{property.title}</p>
            <p className="text-[11px] text-text-muted truncate">{property.location}</p>
          </div>
          <span className="text-xs font-extrabold text-primary shrink-0 bg-primary/10 px-2.5 py-1 rounded-xl">
            ₦{parseFloat(property.price).toLocaleString()}
          </span>
        </div>

        {/* Safety Items Checklist */}
        <div className="space-y-3.5 mb-6">
          {/* 1. Seller Identity Check */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
            isSellerVerified 
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
              : 'bg-amber-50/60 border-amber-200 text-amber-950'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isSellerVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isSellerVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider">
                  1. Seller Identity Status
                </p>
                {isSellerVerified ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 leading-relaxed text-text-secondary">
                {isSellerVerified
                  ? `The seller (${seller?.user?.full_name || seller?.company_name}) has passed official government document verification.`
                  : `Seller identity is not yet verified on the platform. Never send direct bank payments outside escrow.`}
              </p>
            </div>
          </div>

          {/* 2. Title Document Submission */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
            isTitleVerified 
              ? 'bg-emerald-50/60 border-emerald-200' 
              : (hasDocuments ? 'bg-blue-50/60 border-blue-200' : 'bg-amber-50/60 border-amber-200')
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isTitleVerified 
                ? 'bg-emerald-100 text-emerald-700' 
                : (hasDocuments ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700')
            }`}>
              {isTitleVerified ? <CheckCircle2 className="w-5 h-5" /> : (hasDocuments ? <FileText className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  2. Legal Title Documents
                </p>
                {isTitleVerified ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Registry Verified
                  </span>
                ) : hasDocuments ? (
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    Copies Uploaded
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    No Copy Online
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 leading-relaxed text-text-secondary">
                {isTitleVerified
                  ? 'Land registry title search has been conducted and confirmed authentic.'
                  : (hasDocuments 
                    ? 'Copies of title documents (C of O / Survey Plan) have been uploaded for review.'
                    : 'No documents have been uploaded for public view. You can request our legal team to conduct a search.')}
              </p>
            </div>
          </div>

          {/* 3. Physical Site & Beacon Confirmation */}
          <div className="p-4 rounded-2xl border border-border-light bg-surface-dim flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  3. Physical Site Inspection
                </p>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  Required
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed text-text-secondary">
                Always conduct a physical boundary inspection or hire a certified surveyor before finalizing any land transaction.
              </p>
            </div>
          </div>

          {/* 4. Escrow Protection Rule */}
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                4. Payment Protection Guarantee
              </p>
              <p className="text-xs mt-1 leading-relaxed text-text-secondary">
                Use <strong>LandMarket Escrow</strong> to pay securely. Your money is locked in trust and is only released after inspection and document clearance.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2 border-t border-border-light">
          {onProceedToEscrow && (
            <button
              onClick={() => {
                onClose()
                onProceedToEscrow()
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
            >
              <span>I Understand — Proceed with Escrow</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex gap-3">
            {onRequestVerification && !isTitleVerified && (
              <button
                onClick={() => {
                  onClose()
                  onRequestVerification()
                }}
                className="flex-1 py-2.5 rounded-xl border border-navy/30 text-navy font-semibold text-xs hover:bg-navy/5 transition-all text-center"
              >
                Request Title Search (₦10,000)
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-surface-dim hover:bg-surface-muted text-text-secondary font-semibold text-xs transition-all text-center"
            >
              Close Checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
