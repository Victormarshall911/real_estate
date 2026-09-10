import React, { useState, useEffect } from 'react'
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpRight, 
  History, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  X
} from 'lucide-react'
import { walletsAPI } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export default function WalletPage() {
  const { user, isAuthenticated } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('deposit') // 'deposit' | 'virtual_account' | 'withdraw' | 'history'

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)

  // Withdrawal Form
  const [banks, setBanks] = useState([])
  const [selectedBank, setSelectedBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  // Transaction History
  const [transactions, setTransactions] = useState([])
  const [historyFilter, setHistoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  // Feedback messages
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedAccount, setCopiedAccount] = useState(false)

  const fetchWalletData = async () => {
    try {
      const [walletRes, banksRes] = await Promise.all([
        walletsAPI.me(),
        walletsAPI.banks().catch(() => ({ data: [] })),
      ])
      setWallet(walletRes.data)
      setTransactions(walletRes.data.transactions || [])
      if (banksRes.data?.length > 0) {
        setBanks(banksRes.data)
        setSelectedBank(banksRes.data[0].name)
      }
      if (user?.full_name && !accountName) {
        setAccountName(user.full_name)
      }
    } catch (err) {
      setErrorMsg('Failed to synchronize wallet records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletData()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  // Preset Deposit amounts
  const handlePresetDeposit = (amt) => {
    setDepositAmount(String(amt))
  }

  const handleDepositSubmit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt < 100) {
      setErrorMsg('Minimum deposit amount is ₦100.')
      return
    }

    setDepositing(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await walletsAPI.deposit({
        amount: amt,
        reference: `dep_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        description: 'Instant Card / Web Payment Top-up'
      })
      setSuccessMsg(res.data.message || 'Deposit successful!')
      setDepositAmount('')
      await fetchWalletData()
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Deposit failed. Please try again.')
    } finally {
      setDepositing(false)
    }
  }

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(withdrawAmount)
    if (isNaN(amt) || amt < 500) {
      setErrorMsg('Minimum withdrawal amount is ₦500.')
      return
    }

    if (!selectedBank) {
      setErrorMsg('Please select your destination bank.')
      return
    }

    if (!accountNumber || accountNumber.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Nigerian NUBAN account number.')
      return
    }

    if (!accountName.trim()) {
      setErrorMsg('Please enter the verified bank account name.')
      return
    }

    setWithdrawing(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await walletsAPI.withdraw({
        amount: amt,
        bank_name: selectedBank,
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        description: `Payout to ${selectedBank} - ${accountNumber.trim()}`
      })
      setSuccessMsg(res.data.message || 'Withdrawal initiated successfully!')
      setWithdrawAmount('')
      await fetchWalletData()
      setActiveTab('history')
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Withdrawal failed. Check balance or bank details.')
    } finally {
      setWithdrawing(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2500)
  }

  // Calculate quick metrics
  const availableBalance = parseFloat(wallet?.balance || 0)
  const lockedInEscrow = parseFloat(wallet?.locked_in_escrow || 0)
  const totalInflow = transactions
    .filter(t => t.transaction_type === 'deposit' || t.transaction_type === 'receipt')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)
  const totalOutflow = transactions
    .filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'payment')
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    if (historyFilter !== 'all' && t.transaction_type !== historyFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const desc = (t.description || '').toLowerCase()
      const ref = (t.reference || '').toLowerCase()
      return desc.includes(q) || ref.includes(q)
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen py-24 flex flex-col items-center justify-center bg-surface-dim space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-primary" />
        <p className="text-text-secondary text-sm font-semibold">Opening secure wallet...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-surface-dim">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Wallet className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Virtual Escrow Wallet
              </h1>
            </div>
            <p className="text-sm text-text-muted mt-1">
              Bank-grade custody account for instant property payments, escrow holdings, and payouts.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NDIC & Escrow Trustee Protected</span>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-danger text-sm font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Balance Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Available Balance */}
          <div className="bg-gradient-to-br from-navy to-[#0F4C81] text-white p-6 rounded-3xl shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">
              Available Balance
            </p>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {formatMoney(availableBalance)}
            </h3>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-blue-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready for withdrawal or deals</span>
            </div>
          </div>

          {/* 2. Locked in Escrow */}
          <div className="bg-surface p-6 rounded-3xl border border-border-light shadow-card relative">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Locked in Escrow Hold
            </p>
            <h3 className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {formatMoney(lockedInEscrow)}
            </h3>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-amber-700">
              <Lock className="w-3.5 h-3.5" />
              <span>Held safely pending confirmation</span>
            </div>
          </div>

          {/* 3. Total Inflow */}
          <div className="bg-surface p-6 rounded-3xl border border-border-light shadow-card">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Total Inflow & Receipts
            </p>
            <h3 className="text-2xl font-bold text-text-primary tracking-tight">
              {formatMoney(totalInflow)}
            </h3>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-700">
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
              <span>Deposits and escrow payouts</span>
            </div>
          </div>

          {/* 4. Total Outflow */}
          <div className="bg-surface p-6 rounded-3xl border border-border-light shadow-card">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Total Outflow & Payouts
            </p>
            <h3 className="text-2xl font-bold text-text-primary tracking-tight">
              {formatMoney(totalOutflow)}
            </h3>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-text-secondary">
              <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
              <span>Bank cashouts & purchases</span>
            </div>
          </div>
        </div>

        {/* Main Tabs Navigation */}
        <div className="bg-surface rounded-3xl border border-border-light shadow-card overflow-hidden">
          <div className="flex border-b border-border-light px-4 sm:px-6 pt-3 overflow-x-auto scrollbar-none gap-2">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'deposit'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Instant Card Top-up</span>
            </button>

            <button
              onClick={() => setActiveTab('virtual_account')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'virtual_account'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Bank Transfer (Virtual Account)</span>
            </button>

            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'withdraw'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw to Bank</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Transaction Statement ({transactions.length})</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* TAB 1: INSTANT CARD / SIMULATED DEPOSIT */}
            {activeTab === 'deposit' && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Fund Wallet with Card / USSD</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Instantly load money into your wallet. Available immediately to propose escrow purchases.
                  </p>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Quick Preset Amounts
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[50000, 250000, 1000000, 5000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePresetDeposit(amt)}
                        className="py-2.5 px-3 rounded-xl border border-border bg-surface-dim hover:border-primary text-xs font-bold text-text-primary hover:text-primary transition-all"
                      >
                        {formatMoney(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">
                      Deposit Amount (₦)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">₦</span>
                      <input
                        type="number"
                        min="100"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="e.g. 500,000"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Deposited funds are held in your virtual wallet. When you propose an escrow deal, the funds are safely locked until physical beacon verification and document validation are confirmed.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={depositing || !depositAmount}
                    className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                    <span>{depositing ? 'Processing Payment...' : 'Proceed to Fund Wallet'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: DEDICATED VIRTUAL ACCOUNT (BANK TRANSFER) */}
            {activeTab === 'virtual_account' && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Dedicated Bank Transfer Account</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Transfer from any Nigerian mobile banking app (GTBank, Zenith, Access, Kuda, OPay, etc.). Your wallet is credited instantly!
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-surface to-surface-dim border-2 border-primary/20 space-y-5 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-border-light">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Assigned Bank Partner</p>
                        <h4 className="text-base font-extrabold text-text-primary">
                          {wallet?.virtual_account?.bank_name || 'Wema Bank'}
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active 24/7
                    </span>
                  </div>

                  {/* Account Number Box */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-text-muted uppercase">Dedicated Account Number</p>
                      <p className="text-2xl font-extrabold text-primary font-mono tracking-wider mt-0.5">
                        {wallet?.virtual_account?.account_number || '9012345678'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(wallet?.virtual_account?.account_number || '9012345678')}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        copiedAccount 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-primary/10 hover:bg-primary/20 text-primary'
                      }`}
                    >
                      {copiedAccount ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedAccount ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Account Name */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-text-muted uppercase">Account Name</p>
                    <p className="text-sm font-bold text-text-primary">
                      {wallet?.virtual_account?.account_name || `LandMarket / ${user?.full_name}`}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-dim border border-border-light text-xs text-text-secondary space-y-2">
                  <p className="font-bold text-text-primary flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    How Virtual Bank Transfers Work:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-text-muted">
                    <li>Open your bank app or USSD service.</li>
                    <li>Select transfer to <strong>Wema Bank</strong>.</li>
                    <li>Input the 10-digit account number shown above.</li>
                    <li>Confirm the name appears as <strong>LandMarket / {user?.full_name}</strong>.</li>
                    <li>Funds will reflect in your virtual wallet within seconds.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 3: WITHDRAW TO NIGERIAN BANK */}
            {activeTab === 'withdraw' && (
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Withdraw to Your Bank Account</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Cash out proceeds from property sales or refunds directly to any commercial Nigerian bank.
                  </p>
                </div>

                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  {/* Select Bank */}
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">
                      Destination Bank <span className="text-danger">*</span>
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                      required
                    >
                      {banks.map((b) => (
                        <option key={b.code} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* NUBAN 10-digit account number */}
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">
                      10-Digit NUBAN Account Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="0123456789"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-mono tracking-wider focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">
                      Account Name (Must match your verified ID) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Account Name as registered with your bank"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* Amount with Quick Percentage Buttons */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-text-primary">
                        Withdrawal Amount (₦) <span className="text-danger">*</span>
                      </label>
                      <span className="text-xs text-text-muted">
                        Available: <strong className="text-text-primary">{formatMoney(availableBalance)}</strong>
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">₦</span>
                      <input
                        type="number"
                        min="500"
                        max={availableBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>

                    {/* Quick percentage buttons */}
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setWithdrawAmount(String(Math.floor(availableBalance * pct)))}
                          className="py-1.5 px-2 rounded-lg bg-surface-dim hover:bg-primary/10 hover:text-primary border border-border text-[11px] font-bold transition-all text-center"
                        >
                          {pct === 1.0 ? '100% (All)' : `${pct * 100}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary fee note */}
                  <div className="p-3.5 rounded-xl bg-surface-dim border border-border-light text-xs text-text-secondary space-y-1">
                    <div className="flex justify-between">
                      <span>Withdrawal Subtotal:</span>
                      <span className="font-bold text-text-primary">{formatMoney(parseFloat(withdrawAmount || 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NIP Clearing Fee:</span>
                      <span className="font-bold text-text-primary">₦50.00</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border-light text-text-primary font-bold">
                      <span>Net Payout to Bank:</span>
                      <span className="text-primary">{formatMoney(Math.max(0, parseFloat(withdrawAmount || 0) - 50))}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) > availableBalance}
                    className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                    <span>{withdrawing ? 'Processing Payout...' : 'Authorize Bank Withdrawal'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: TRANSACTION STATEMENT */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Transaction Statement</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Immutable record of deposits, withdrawals, escrow locks, and disbursements.
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search ref or memo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <select
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:border-primary"
                    >
                      <option value="all">All Types</option>
                      <option value="deposit">Deposits (+)</option>
                      <option value="withdrawal">Withdrawals (-)</option>
                      <option value="payment">Escrow Locks (-)</option>
                      <option value="receipt">Escrow Payouts (+)</option>
                      <option value="refund">Refunds (+)</option>
                    </select>
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center text-text-muted text-sm border border-dashed border-border rounded-2xl">
                    No transactions match your filter criteria.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map((tx) => {
                      const isCredit = tx.transaction_type === 'deposit' || tx.transaction_type === 'receipt' || tx.transaction_type === 'refund'
                      return (
                        <div
                          key={tx.id}
                          onClick={() => setSelectedReceipt(tx)}
                          className="flex items-center justify-between p-4 rounded-2xl bg-surface hover:bg-surface-dim border border-border-light hover:border-border transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                              isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-danger'
                            }`}>
                              {isCredit ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-text-primary capitalize truncate">
                                {tx.description || `${tx.transaction_type} transaction`}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                                <span className="font-mono text-[10px] bg-surface-dim px-1.5 py-0.5 rounded border border-border">
                                  {tx.reference}
                                </span>
                                <span>&bull;</span>
                                <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className={`text-base font-extrabold ${
                              isCredit ? 'text-emerald-600' : 'text-text-primary'
                            }`}>
                              {isCredit ? '+' : '-'}{formatMoney(tx.amount)}
                            </p>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {tx.status || 'Completed'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital Transaction Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-3xl border border-border-light max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-text-muted hover:bg-surface-dim"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-text-primary">Transaction Receipt</h3>
              <p className="text-2xl font-extrabold text-primary font-mono">
                {formatMoney(selectedReceipt.amount)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-dim border border-border-light space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Transaction Type:</span>
                <span className="font-bold text-text-primary capitalize">{selectedReceipt.transaction_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Reference:</span>
                <span className="font-mono text-text-primary font-semibold">{selectedReceipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Date & Time:</span>
                <span className="text-text-primary">{new Date(selectedReceipt.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="font-bold text-emerald-600 uppercase">{selectedReceipt.status || 'Completed'}</span>
              </div>
              {selectedReceipt.bank_name && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Destination Bank:</span>
                  <span className="font-semibold text-text-primary">{selectedReceipt.bank_name}</span>
                </div>
              )}
              {selectedReceipt.account_number && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Account Number:</span>
                  <span className="font-mono font-bold text-text-primary">{selectedReceipt.account_number}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                window.print()
              }}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Print / Save Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
