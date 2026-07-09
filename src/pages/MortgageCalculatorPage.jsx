import { useState } from 'react'
import { Calculator, Landmark, ShieldCheck, CheckCircle2, Percent, ArrowRight, Info, DollarSign, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState(75000000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(25)
  const [loanTenureYears, setLoanTenureYears] = useState(15)
  const [interestRate, setInterestRate] = useState(18.5)

  // Calculations
  const downPaymentAmount = (homePrice * downPaymentPercent) / 100
  const loanPrincipal = homePrice - downPaymentAmount
  const totalMonths = loanTenureYears * 12

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
  const requiredMonthlyIncome = Math.round(monthlyInstallment * 3)

  return (
    <main className="min-h-screen bg-surface-dim pb-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 text-gold text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>Nigerian Property Financing Tool</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Mortgage & Land Affordability Calculator
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            Plan your land or estate investment with real-time interest rates, tenure projections, and Federal Mortgage Bank (FMBN/NHF) insights tailored for the Nigerian market.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Top Controls */}
          <div className="lg:col-span-7 bg-surface rounded-3xl p-6 sm:p-8 shadow-elevated border border-border space-y-6">
            <h2 className="text-lg font-bold text-text-primary border-b border-border pb-3 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Investment Parameters</span>
            </h2>

            {/* Property Value Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Target Property Price
                </label>
                <span className="text-lg sm:text-2xl font-extrabold text-text-primary">
                  ₦{homePrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={5000000}
                max={1000000000}
                step={5000000}
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full h-2.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[11px] text-text-muted font-bold mt-1">
                <span>₦5M</span>
                <span>₦500M</span>
                <span>₦1 Billion</span>
              </div>
            </div>

            {/* Down Payment Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Down Payment ({downPaymentPercent}%)
                </label>
                <span className="text-base sm:text-xl font-bold text-primary">
                  ₦{downPaymentAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Tenure and Rate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="p-4 rounded-2xl bg-surface-muted border border-border">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Loan Tenure
                </label>
                <select
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={5}>5 Years (60 mos)</option>
                  <option value={10}>10 Years (120 mos)</option>
                  <option value={15}>15 Years (180 mos)</option>
                  <option value={20}>20 Years (240 mos)</option>
                  <option value={25}>25 Years (300 mos)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-surface-muted border border-border">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Annual Interest Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    max="35"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 pr-8"
                  />
                  <Percent className="w-4 h-4 text-text-muted absolute right-3 top-3" />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Nigerian Financing Presets</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setInterestRate(6.0); setLoanTenureYears(20); setDownPaymentPercent(10); }}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors border border-blue-200"
                >
                  FMBN / NHF Loan (6% p.a.)
                </button>
                <button
                  type="button"
                  onClick={() => { setInterestRate(18.5); setLoanTenureYears(15); setDownPaymentPercent(25); }}
                  className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors border border-primary/20"
                >
                  Commercial Bank Standard (18.5%)
                </button>
                <button
                  type="button"
                  onClick={() => { setInterestRate(24.0); setLoanTenureYears(10); setDownPaymentPercent(30); }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors border border-amber-200"
                >
                  Private Mortgage Lender (24%)
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary & Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            {/* Summary Card */}
            <div className="bg-surface rounded-3xl p-6 sm:p-8 shadow-elevated border border-border space-y-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/15 border border-primary/20">
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Estimated Monthly Payment
                </p>
                <h3 className="text-3xl sm:text-4xl font-black text-primary mt-2">
                  ₦{monthlyInstallment.toLocaleString()}
                </h3>
                <p className="text-xs text-text-muted mt-1">Over {loanTenureYears} years ({totalMonths} monthly installments)</p>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/60">
                  <span className="text-text-secondary">Property Price:</span>
                  <span className="font-bold text-text-primary">₦{homePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/60">
                  <span className="text-text-secondary">Down Payment ({downPaymentPercent}%):</span>
                  <span className="font-bold text-primary">₦{downPaymentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/60">
                  <span className="text-text-secondary">Loan Principal:</span>
                  <span className="font-bold text-text-primary">₦{loanPrincipal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/60">
                  <span className="text-text-secondary">Total Interest Payable:</span>
                  <span className="font-bold text-amber-600">₦{Math.round(totalInterestPaid).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/60 font-extrabold text-base text-text-primary">
                  <span>Total Amount Payable:</span>
                  <span>₦{Math.round(totalAmountPayable).toLocaleString()}</span>
                </div>
              </div>

              {/* DTI Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Recommended Monthly Salary
                  </p>
                  <p className="text-xs text-emerald-700">Based on standard ~33% Debt-to-Income rule</p>
                </div>
                <span className="text-base font-extrabold text-emerald-900">
                  ₦{requiredMonthlyIncome.toLocaleString()}/mo
                </span>
              </div>

              <Link
                to="/properties"
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-600 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Browse Matching Land Plots</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
