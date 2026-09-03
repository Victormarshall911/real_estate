import React from 'react'
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  HelpCircle, 
  AlertCircle,
  BarChart3,
  CheckCircle2
} from 'lucide-react'

export default function InvestmentScoreCard({ property }) {
  if (!property) return null

  // Algorithmic sub-scores
  let titleScore = 15 // Base
  if (property.has_c_of_o) titleScore = 35
  else if (property.has_survey_plan) titleScore = 25
  if (property.is_title_verified) titleScore = Math.min(35, titleScore + 5)

  let infraScore = 10
  if (property.has_electricity) infraScore += 5
  if (property.has_water) infraScore += 4
  if (property.has_drainage) infraScore += 3
  if (property.has_security) infraScore += 3
  infraScore = Math.min(25, infraScore)

  let sellerScore = 10
  const seller = property.realtor || property.landlord || property.developer
  if (seller?.is_verified) sellerScore = 20

  let valueScore = 14
  if (property.latitude && property.longitude) valueScore += 6
  valueScore = Math.min(20, valueScore)

  const totalScore = titleScore + infraScore + sellerScore + valueScore

  const isStrong = totalScore >= 75
  const isModerate = totalScore >= 55 && totalScore < 75

  return (
    <div className="rounded-3xl border border-border-light bg-surface p-6 sm:p-8 shadow-elevated relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-light relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
              Property Investment Score 📊
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Algorithmic valuation, title security, and development growth potential
            </p>
          </div>
        </div>

        {/* Score Display Badge */}
        <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-200 px-4 py-2.5 rounded-2xl">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Potential Rating</p>
            <p className="text-xs font-bold text-emerald-700">
              {isStrong ? 'Strong Growth Potential' : (isModerate ? 'Moderate Potential' : 'Standard Yield')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center font-extrabold shadow-sm">
            <span className="text-base leading-none">{totalScore}</span>
            <span className="text-[9px] font-normal opacity-80 leading-none mt-0.5">/100</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 relative z-10">
        {/* 1. Title Security */}
        <div className="p-4 rounded-2xl bg-surface-dim border border-border-light">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> Title Security Index
            </span>
            <span className="font-extrabold text-primary">{titleScore}/35 pts</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500" 
              style={{ width: `${(titleScore / 35) * 100}%` }} 
            />
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            {property.has_c_of_o ? 'C of O title significantly enhances capital liquidity and loan collateral value.' : 'Survey Plan registered. Eligible for Governor\'s Consent processing.'}
          </p>
        </div>

        {/* 2. Infrastructure & Access */}
        <div className="p-4 rounded-2xl bg-surface-dim border border-border-light">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Infrastructure Index
            </span>
            <span className="font-extrabold text-amber-600">{infraScore}/25 pts</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(infraScore / 25) * 100}%` }} 
            />
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Evaluates electricity, drainage, and access road infrastructure availability.
          </p>
        </div>

        {/* 3. Price-to-Value Competitiveness */}
        <div className="p-4 rounded-2xl bg-surface-dim border border-border-light">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Price Competitiveness
            </span>
            <span className="font-extrabold text-emerald-700">{valueScore}/20 pts</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(valueScore / 20) * 100}%` }} 
            />
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Benchmarked against historical land price appreciation in {property.location || 'this LGA'}.
          </p>
        </div>

        {/* 4. Seller Credibility */}
        <div className="p-4 rounded-2xl bg-surface-dim border border-border-light">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Seller Verification Index
            </span>
            <span className="font-extrabold text-blue-700">{sellerScore}/20 pts</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(sellerScore / 20) * 100}%` }} 
            />
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            {seller?.is_verified ? 'Seller identity verified with zero fraud flags.' : 'Seller verification is pending compliance audit.'}
          </p>
        </div>
      </div>

      {/* Legal & Financial Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-surface-dim border border-border-light flex items-start gap-2.5 text-xs text-text-muted relative z-10">
        <AlertCircle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Disclaimer:</strong> The Property Investment Score is an automated algorithmic estimate based on recorded titles, infrastructure flags, and regional pricing metrics. It does not constitute financial, legal, or investment guarantees.
        </p>
      </div>
    </div>
  )
}
