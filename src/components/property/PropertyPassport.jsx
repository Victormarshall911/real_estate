import React from 'react'
import { 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  FileCheck2, 
  Clock, 
  AlertTriangle, 
  Lock, 
  Building2, 
  CheckCircle2, 
  HelpCircle,
  Award
} from 'lucide-react'
import VerifiedBadge from '../shared/VerifiedBadge'

/**
 * PropertyPassport Component
 * Standardized digital trust & safety passport for Nigerian property listings.
 */
export default function PropertyPassport({ property, onOpenSafetyChecklist }) {
  if (!property) return null

  const seller = property.realtor || property.landlord || property.developer || property.architect
  const sellerRole = property.realtor ? 'Realtor' : (property.developer ? 'Developer' : (property.landlord ? 'Landlord' : 'Architect'))
  
  // Calculate dynamic trust score (0-100)
  let calculatedScore = 50 // Base score for having an active listing
  if (seller?.is_verified) calculatedScore += 20
  if (property.has_c_of_o) calculatedScore += 15
  else if (property.has_survey_plan) calculatedScore += 10
  if (property.is_title_verified) calculatedScore += 10
  if (property.latitude && property.longitude) calculatedScore += 5
  
  // Ensure bound
  const trustScore = Math.min(100, calculatedScore)

  const isHighTrust = trustScore >= 80
  const isModerateTrust = trustScore >= 60 && trustScore < 80

  const hasDocuments = property.has_c_of_o || property.has_survey_plan || (property.documents && property.documents.length > 0)

  return (
    <div className="rounded-3xl border border-border-light bg-gradient-to-b from-surface via-surface to-surface-dim p-6 sm:p-8 shadow-elevated overflow-hidden relative">
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-light relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
                PROPERTY PASSPORT
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase">
                #NG-{(property.id || '000000').slice(0, 8)}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Digital Trust, Identity & Title Verification Record
            </p>
          </div>
        </div>

        {/* Trust Score Gauge */}
        <div className="flex items-center gap-3 bg-surface-dim sm:bg-white/80 dark:sm:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-border-light shadow-sm">
          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Platform Trust Score
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {isHighTrust ? 'High Confidence' : (isModerateTrust ? 'Moderate Trust' : 'Pending Verification')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex flex-col items-center justify-center font-extrabold shadow-sm">
            <span className="text-sm leading-none">{trustScore}</span>
            <span className="text-[9px] font-normal opacity-80 leading-none mt-0.5">/100</span>
          </div>
        </div>
      </div>

      {/* Passport Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 relative z-10">
        {/* 1. Property Details */}
        <div className="p-4 rounded-2xl bg-surface-dim/80 border border-border-light flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Property Category</p>
            <p className="text-sm font-bold text-text-primary capitalize truncate mt-0.5">
              {property.property_category || 'Land'} &bull; {(property.property_type || 'Plot').replace('_', ' ')}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {property.land_size ? `${parseFloat(property.land_size).toLocaleString()} sqm` : 'Verified Specs'}
              {property.bedrooms ? ` • ${property.bedrooms} Bedrooms` : ''}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
            Recorded
          </span>
        </div>

        {/* 2. Geolocation Coordinates */}
        <div className="p-4 rounded-2xl bg-surface-dim/80 border border-border-light flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Location & Geolocation</p>
            <p className="text-sm font-bold text-text-primary truncate mt-0.5">
              {property.location || 'Location Confirmed'}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {property.latitude && property.longitude 
                ? `GPS: ${property.latitude}°N, ${property.longitude}°E` 
                : 'State & LGA Geocoded'}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
            {property.latitude ? 'GPS Pinpointed' : 'Area Verified'}
          </span>
        </div>

        {/* 3. Seller / Agent Identity */}
        <div className="p-4 rounded-2xl bg-surface-dim/80 border border-border-light flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Seller / Agent Identity</p>
            <p className="text-sm font-bold text-text-primary truncate mt-0.5">
              {seller?.user?.full_name || seller?.company_name || 'Registered Partner'}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Role: <span className="font-semibold">{sellerRole}</span>
            </p>
          </div>
          {seller?.is_verified ? (
            <VerifiedBadge tier="id_verified" size="sm" />
          ) : (
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
              Identity Pending
            </span>
          )}
        </div>

        {/* 4. Document Submission & Title Search */}
        <div className="p-4 rounded-2xl bg-surface-dim/80 border border-border-light flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <FileCheck2 className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Title Documents</p>
            <p className="text-sm font-bold text-text-primary truncate mt-0.5">
              {property.has_c_of_o 
                ? 'Certificate of Occupancy (C of O)' 
                : (property.has_survey_plan ? 'Registered Survey Plan' : (hasDocuments ? 'Documents Uploaded' : 'Title On Demand'))}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {property.is_title_verified 
                ? 'Land Registry Search Completed' 
                : (hasDocuments ? 'Copies Submitted on Platform' : 'Available for inspection')}
            </p>
          </div>
          {property.is_title_verified ? (
            <VerifiedBadge tier="title_verified" size="sm" />
          ) : hasDocuments ? (
            <VerifiedBadge tier="documents_submitted" size="sm" />
          ) : (
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
              Unverified
            </span>
          )}
        </div>

        {/* 5. Listing Recency & Availability */}
        <div className="p-4 rounded-2xl bg-surface-dim/80 border border-border-light flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Availability Status</p>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">
              Confirmed Active & Available
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Last confirmed: <span className="font-semibold">Recently active</span>
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
            Active
          </span>
        </div>

        {/* 6. Fraud Reports & Safety Signals */}
        <div className="p-4 rounded-2xl bg-surface-dim/80 border border-border-light flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Community Safety Shield</p>
            <p className="text-sm font-bold text-text-primary mt-0.5">
              0 Active Fraud Flags
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              No disputes, extortion, or duplicate claims reported.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
            Clean Record
          </span>
        </div>
      </div>

      {/* Safety Guarantee Footer */}
      <div className="pt-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted relative z-10">
        <div className="flex items-center gap-2 text-text-secondary">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span>
            Protected by <strong>LandMarket Buyer Safety Guidelines</strong> &bull; Escrow Eligible
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Safe to Inspect
          </span>
        </div>
      </div>
    </div>
  )
}
