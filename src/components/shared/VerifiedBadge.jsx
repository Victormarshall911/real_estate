import React, { useState } from 'react'
import { ShieldCheck, Building2, CheckCircle2, FileCheck2, HelpCircle } from 'lucide-react'

/**
 * VerifiedBadge Component
 * 
 * Supports multi-tier verification badges:
 * - 'cac_verified' | 'corporate': CAC Registered Company/Developer
 * - 'id_verified' | 'identity': Government ID Verified
 * - 'title_verified': Legal Search & Land Registry Title Verified
 * - 'documents_submitted': Property Legal Documents Uploaded
 * - 'contact_verified': Phone & Email Verified
 */
export default function VerifiedBadge({
  tier = 'id_verified',
  type = 'seller', // 'seller' | 'property' | 'agent' | 'custom'
  size = 'md', // 'sm' | 'md' | 'lg'
  showTooltip = true,
  className = '',
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false)

  // Map tier alias to canonical configuration
  let config = {
    label: 'Verified',
    subtext: 'Identity verified through official government document review.',
    icon: ShieldCheck,
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    iconClass: 'text-emerald-600',
    dotClass: 'bg-emerald-500',
  }

  if (tier === 'cac_verified' || tier === 'corporate') {
    config = {
      label: 'CAC Registered',
      subtext: 'Corporate Affairs Commission registration certificate verified.',
      icon: Building2,
      bgClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      iconClass: 'text-amber-600',
      dotClass: 'bg-amber-500',
    }
  } else if (tier === 'title_verified' || tier === 'legal_search_verified') {
    config = {
      label: 'Title Verified',
      subtext: 'Property title verified with official land registry records.',
      icon: CheckCircle2,
      bgClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
      iconClass: 'text-blue-600',
      dotClass: 'bg-blue-500',
    }
  } else if (tier === 'documents_submitted' || tier === 'docs_submitted') {
    config = {
      label: 'Docs Submitted',
      subtext: 'Official title documents (C of O / Survey Plan / Deed) uploaded for review.',
      icon: FileCheck2,
      bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      iconClass: 'text-indigo-600',
      dotClass: 'bg-indigo-500',
    }
  } else if (tier === 'contact_verified') {
    config = {
      label: 'Contact Verified',
      subtext: 'Phone number and email address verified.',
      icon: CheckCircle2,
      bgClass: 'bg-slate-100 text-slate-700 border-slate-200',
      iconClass: 'text-slate-600',
      dotClass: 'bg-slate-400',
    }
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  const Icon = config.icon

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      <span
        className={`inline-flex items-center font-semibold rounded-full border shadow-sm transition-all duration-200 ${config.bgClass} ${sizeClasses[size]} ${className}`}
      >
        <Icon className={`${iconSizes[size]} ${config.iconClass} shrink-0`} />
        <span>{config.label}</span>
      </span>

      {/* Floating Trust Tooltip */}
      {showTooltip && tooltipVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 p-2.5 rounded-xl bg-slate-900/95 text-white shadow-xl backdrop-blur-sm border border-slate-700/50 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
            <Icon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{config.label}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {config.subtext}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95" />
        </div>
      )}
    </div>
  )
}
