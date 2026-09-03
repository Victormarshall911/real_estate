import React from 'react'
import { Link } from 'react-router-dom'
import { 
  X, 
  Scale, 
  Check, 
  Minus, 
  ShieldCheck, 
  MapPin, 
  Maximize2, 
  FileCheck2, 
  ExternalLink,
  Award
} from 'lucide-react'
import { useCompare } from '../../context/CompareContext'
import { getMediaUrl } from '../../utils/media'
import VerifiedBadge from '../shared/VerifiedBadge'

function formatPrice(price) {
  const num = parseFloat(price)
  if (num >= 1000000000) return `₦${(num / 1000000000).toFixed(2)}B`
  if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
  return `₦${num.toLocaleString()}`
}

function calculateTrustScore(property) {
  let score = 50
  if (property.is_verified) score += 20
  if (property.has_c_of_o) score += 15
  else if (property.has_survey_plan) score += 10
  if (property.is_title_verified) score += 10
  if (property.latitude && property.longitude) score += 5
  return Math.min(100, score)
}

export default function PropertyCompareModal() {
  const { 
    selectedProperties, 
    isModalOpen, 
    closeCompareModal, 
    removeCompare 
  } = useCompare()

  if (!isModalOpen || selectedProperties.length === 0) return null

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[selectedProperties.length] || 'grid-cols-2'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-surface rounded-3xl border border-border-light shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-border-light flex items-center justify-between gap-4 shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
                Compare Properties ⚖️
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Side-by-side specifications, document status, trust scores, and pricing
              </p>
            </div>
          </div>

          <button
            onClick={closeCompareModal}
            className="p-2.5 rounded-2xl text-text-muted hover:text-text-primary hover:bg-surface-dim transition-colors"
            title="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Comparison Matrix */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 space-y-6">
          {/* Top Row: Property Cards Header */}
          <div className={`grid ${gridColsClass} gap-4 min-w-[600px]`}>
            {selectedProperties.map((prop) => (
              <div key={prop.id} className="p-4 rounded-2xl bg-surface-dim border border-border-light relative flex flex-col justify-between">
                <button
                  onClick={() => removeCompare(prop.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 text-white hover:bg-danger transition-colors z-10"
                  title="Remove from compare"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-surface-muted mb-3 relative">
                    {prop.primary_image_url ? (
                      <img
                        src={getMediaUrl(prop.primary_image_url)}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">
                        No Image
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-text-primary line-clamp-2 mb-1">
                    {prop.title}
                  </h4>
                  <p className="text-xs text-text-muted truncate mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    {prop.location}
                  </p>
                  <p className="text-base font-extrabold text-primary mb-3">
                    {formatPrice(prop.price)}
                  </p>
                </div>

                <Link
                  to={`/properties/${prop.id}`}
                  onClick={closeCompareModal}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Section: Trust & Verification */}
          <div className="space-y-3 min-w-[600px]">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-text-muted bg-surface-dim px-3 py-1.5 rounded-lg border border-border-light">
              🛡️ Trust, Passport & Verification
            </h4>
            <div className="border border-border-light rounded-2xl overflow-hidden divide-y divide-border-light text-xs">
              {/* Trust Score */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface`}>
                {selectedProperties.map((prop) => {
                  const score = calculateTrustScore(prop)
                  return (
                    <div key={prop.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {score}
                      </div>
                      <div>
                        <p className="font-bold text-text-primary">Passport Score</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          {score >= 80 ? 'High Trust' : 'Moderate'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Title Status */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface-dim/40`}>
                {selectedProperties.map((prop) => (
                  <div key={prop.id}>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Title Status</p>
                    <div className="mt-1">
                      {prop.is_title_verified ? (
                        <VerifiedBadge tier="title_verified" size="sm" />
                      ) : (prop.has_c_of_o || prop.has_survey_plan) ? (
                        <VerifiedBadge tier="documents_submitted" size="sm" />
                      ) : (
                        <span className="text-slate-600 bg-slate-100 text-[10px] px-2 py-0.5 rounded font-medium">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Seller Verification */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface`}>
                {selectedProperties.map((prop) => (
                  <div key={prop.id}>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Seller Identity</p>
                    <div className="mt-1">
                      {prop.is_verified ? (
                        <VerifiedBadge 
                          tier={prop.seller_role === 'developer' ? 'cac_verified' : 'id_verified'} 
                          size="sm" 
                        />
                      ) : (
                        <span className="text-amber-800 bg-amber-50 text-[10px] px-2 py-0.5 rounded font-medium">
                          Identity Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Property Specifications */}
          <div className="space-y-3 min-w-[600px]">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-text-muted bg-surface-dim px-3 py-1.5 rounded-lg border border-border-light">
              🏠 Property Specifications
            </h4>
            <div className="border border-border-light rounded-2xl overflow-hidden divide-y divide-border-light text-xs">
              {/* Type / Category */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface`}>
                {selectedProperties.map((prop) => (
                  <div key={prop.id}>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Category & Type</p>
                    <p className="font-bold text-text-primary capitalize mt-0.5">
                      {prop.property_category || 'Land'} &bull; {(prop.property_type || 'Plot').replace('_', ' ')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Land Size */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface-dim/40`}>
                {selectedProperties.map((prop) => (
                  <div key={prop.id}>
                    <p className="text-[10px] text-text-muted uppercase font-bold">Land Size</p>
                    <p className="font-bold text-text-primary mt-0.5">
                      {parseFloat(prop.land_size || 0).toLocaleString()} sqm
                      {prop.land_size_plots ? ` (${prop.land_size_plots} plots)` : ''}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price per sqm */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface`}>
                {selectedProperties.map((prop) => {
                  const size = parseFloat(prop.land_size || 1)
                  const price = parseFloat(prop.price || 0)
                  const pricePerSqm = size > 0 ? Math.round(price / size) : 0
                  return (
                    <div key={prop.id}>
                      <p className="text-[10px] text-text-muted uppercase font-bold">Price / SQM</p>
                      <p className="font-extrabold text-emerald-700 mt-0.5">
                        ₦{pricePerSqm.toLocaleString()} / sqm
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Section: Amenities & Legal Documents */}
          <div className="space-y-3 min-w-[600px]">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-text-muted bg-surface-dim px-3 py-1.5 rounded-lg border border-border-light">
              📄 Features & Documents
            </h4>
            <div className="border border-border-light rounded-2xl overflow-hidden divide-y divide-border-light text-xs">
              {/* C of O */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface`}>
                {selectedProperties.map((prop) => (
                  <div key={prop.id} className="flex items-center gap-2">
                    {prop.has_c_of_o ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <Check className="w-4 h-4 text-emerald-600" /> Certificate of Occupancy
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <Minus className="w-4 h-4" /> No C of O
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Survey Plan */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface-dim/40`}>
                {selectedProperties.map((prop) => (
                  <div key={prop.id} className="flex items-center gap-2">
                    {prop.has_survey_plan ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <Check className="w-4 h-4 text-emerald-600" /> Registered Survey
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <Minus className="w-4 h-4" /> No Survey File
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Electricity & Water */}
              <div className={`grid ${gridColsClass} p-3.5 bg-surface`}>
                {selectedProperties.map((prop) => (
                  <div key={prop.id} className="space-y-1">
                    <p className="text-[10px] text-text-muted uppercase font-bold">Utilities</p>
                    <p className="text-text-secondary font-medium">
                      Electricity: {prop.has_electricity ? '✅ Available' : '❌ None'}<br />
                      Water: {prop.has_water ? '✅ Borehole' : '❌ None'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
