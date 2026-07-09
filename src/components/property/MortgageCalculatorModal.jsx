import { useState, useEffect } from 'react'
import { X, Calculator, Info, CheckCircle2, Shield, ArrowRight, Building2, Landmark, Percent } from 'lucide-react'

export default function MortgageCalculatorModal({ onClose, propertyPrice = 50000000, propertyTitle = 'Property' }) {
  const numericPrice = Number(propertyPrice) || 50000000
  const [homePrice, setHomePrice] = useState(numericPrice)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20) // 20% default deposit
  const [loanTenureYears, setLoanTenureYears] = useState(15) // 15 years typical
  const [interestRate, setInterestRate] = useState(18.5) // 18.5% typical Nigerian commercial bank/mortgage rate

  // Calculated values
  const downPaymentAmount = (homePrice * downPaymentPercent) / 100
  const loanPrincipal = homePrice - downPaymentAmount
  const totalMonths = loanTenureYears * 12

  // Monthly Payment Calculation (Standard Amortization Formula)
  // M = P * [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
  const calculateMonthlyPayment = () => {
    if (loanPrincipal <= 0) return 0
    const monthlyRate = interestRate / 100 / 12
    if (monthlyRate === 0) return loanPrincipal / totalMonths
    const factor = Math.pow(1 + monthlyRate, totalMonths)
    const monthly = (loanPrincipal * monthlyRate * factor) / (factor - 1)
    return Math.round(monthly)
  }

  const monthlyInstallment = calculateMonthlyPayment()
  const totalAmountPayable = monthlyInstallment * totalMonths + downPaymentAmount
  const totalInterestPaid = totalAmountPayable - homePrice

  // Recommended minimum monthly salary (Standard 33% DTI rule)
  const requiredMonthlyIncome = Math.round(monthlyInstallment * 3)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-surface rounded-3xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary to-primary-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              <Calculator className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Mortgage Affordability Calculator</h3>
              <p className="text-xs text-white/75 truncate max-w-xs">{propertyTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Summary Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Estimated Monthly Payment</p>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-primary mt-1">
                ₦{monthlyInstallment.toLocaleString()}
                <span className="text-xs font-semibold text-text-muted font-normal"> / month</span>
              </h4>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white shadow-sm border border-border text-center sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Required Salary (~33% DTI)</p>
              <p className="text-sm font-bold text-emerald-700">₦{requiredMonthlyIncome.toLocaleString()}/mo</p>
            </div>
          </div>

          {/* Interactive Sliders / Inputs */}
          <div className="space-y-4">
            {/* Property Price */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Property Value (₦)
                </label>
                <span className="text-sm font-extrabold text-text-primary">₦{homePrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={5000000}
                max={1000000000}
                step={5000000}
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Down Payment Deposit */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Down Payment ({downPaymentPercent}%)
                </label>
                <span className="text-sm font-extrabold text-primary">₦{downPaymentAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-semibold mt-1">
                <span>10% Min</span>
                <span>30% Standard</span>
                <span>80% Max</span>
              </div>
            </div>

            {/* Loan Tenure & Interest Rate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Loan Tenure (Years)
                </label>
                <select
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={5}>5 Years (60 mos)</option>
                  <option value={10}>10 Years (120 mos)</option>
                  <option value={15}>15 Years (180 mos)</option>
                  <option value={20}>20 Years (240 mos)</option>
                  <option value={25}>25 Years (300 mos)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Interest Rate (% per annum)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="35"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 pr-8"
                  />
                  <Percent className="w-4 h-4 text-text-muted absolute right-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-2.5 text-xs">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[11px] border-b border-border pb-2 flex items-center space-x-1.5">
              <Landmark className="w-4 h-4 text-primary" />
              <span>Mortgage Breakdown Summary</span>
            </h5>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary">Principal Loan Amount:</span>
              <span className="font-bold text-text-primary">₦{loanPrincipal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary">Estimated Total Interest Paid:</span>
              <span className="font-bold text-amber-600">₦{Math.round(totalInterestPaid).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-border/60 pt-2 font-extrabold text-sm text-text-primary">
              <span>Total Cost over {loanTenureYears} Years:</span>
              <span>₦{Math.round(totalAmountPayable).toLocaleString()}</span>
            </div>
          </div>

          {/* Nigerian Mortgage Note */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Note on Nigerian Financing:</strong> Interest rates for National Housing Fund (NHF) loans via Federal Mortgage Bank of Nigeria (FMBN) can be as low as 6% p.a. for up to ₦50M, while commercial mortgage lenders typically charge 18% – 24% p.a.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-surface-muted flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-600 shadow transition-all"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  )
}
