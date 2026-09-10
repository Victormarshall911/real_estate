import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, ArrowDownToLine, ArrowUpRight, History, Loader2, Lock, Building2, ChevronRight } from 'lucide-react'
import { walletsAPI } from '../../api/client'
import { formatDistanceToNow } from 'date-fns'

export default function WalletManager() {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [error, setError] = useState('')

  const fetchWallet = async () => {
    try {
      const { data } = await walletsAPI.me()
      setWallet(data)
    } catch (err) {
      setError('Failed to load wallet.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  const handleDeposit = async (e) => {
    e.preventDefault()
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      setError('Enter a valid amount.')
      return
    }
    setDepositing(true)
    setError('')
    try {
      // Mock payment flow: just send a unique ref
      await walletsAPI.deposit({
        amount: depositAmount,
        reference: `dep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        description: 'Wallet top-up'
      })
      setDepositAmount('')
      await fetchWallet()
    } catch (err) {
      setError(err.response?.data?.error || 'Deposit failed.')
    } finally {
      setDepositing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!wallet) return null

  const lockedEscrow = Number(wallet.locked_in_escrow || 0)

  return (
    <div className="bg-surface rounded-2xl shadow-elevated border border-border overflow-hidden">
      {/* Header / Balance */}
      <div className="bg-gradient-to-r from-navy to-[#0F4C81] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gold" /> My Wallet
            </h2>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white backdrop-blur-sm transition-colors"
            >
              <span>Full Wallet & Payouts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">Available Balance</p>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                ₦{Number(wallet.balance).toLocaleString()}
              </h3>
            </div>
            {lockedEscrow > 0 && (
              <div className="sm:border-l sm:border-white/10 sm:pl-4">
                <p className="text-xs text-amber-300 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> In Escrow Hold
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-amber-200">
                  ₦{lockedEscrow.toLocaleString()}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-sm text-danger font-medium">
            {error}
          </div>
        )}

        {/* Deposit Form */}
        <form onSubmit={handleDeposit} className="mb-6 p-5 bg-surface-dim rounded-2xl border border-border-light">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-primary" /> Quick Deposit
            </h4>
            <Link to="/wallet" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              Bank transfer / NUBAN <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">₦</span>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                min="100"
              />
            </div>
            <button
              type="submit"
              disabled={depositing || !depositAmount}
              className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Funds'}
            </button>
          </div>
        </form>

        {/* Transaction History */}
        <div>
          <h4 className="font-semibold text-text-primary mb-4 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-text-secondary" /> Recent Transactions
          </h4>
          
          {wallet.transactions?.length === 0 ? (
            <div className="text-center py-6 text-sm text-text-muted">
              No transactions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {wallet.transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-dim border border-transparent hover:border-border transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tx.transaction_type === 'deposit' || tx.transaction_type === 'receipt' 
                        ? 'bg-success/10' : 'bg-danger/10'
                    }`}>
                      {tx.transaction_type === 'deposit' || tx.transaction_type === 'receipt' ? (
                        <ArrowDownToLine className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-danger" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary capitalize">{tx.transaction_type}</p>
                      <p className="text-xs text-text-muted">{formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      tx.transaction_type === 'deposit' || tx.transaction_type === 'receipt' 
                        ? 'text-success' : 'text-text-primary'
                    }`}>
                      {tx.transaction_type === 'deposit' || tx.transaction_type === 'receipt' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
