import { useState, useEffect } from 'react'
import { ShieldCheck, CreditCard, Fingerprint, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { kycAPI } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

const VERIFICATION_TYPES = [
  {
    value: 'bvn',
    label: 'Bank Verification Number (BVN)',
    icon: CreditCard,
    placeholder: 'Enter your 11-digit BVN',
    description: 'Your BVN is linked to your bank account and is the fastest way to verify.',
  },
  {
    value: 'nin',
    label: 'National Identification Number (NIN)',
    icon: Fingerprint,
    placeholder: 'Enter your 11-digit NIN',
    description: 'Your NIN from your National ID card or NIMC slip.',
  },
]

export default function KYCPage() {
  const { user, isAuthenticated, refreshUser } = useAuth()
  const [step, setStep] = useState('select') // 'select' | 'enter' | 'result'
  const [selectedType, setSelectedType] = useState(null)
  const [idNumber, setIdNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [existingStatus, setExistingStatus] = useState(null)
  const [checking, setChecking] = useState(true)

  // Check existing KYC status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const { data } = await kycAPI.getStatus()
        setExistingStatus(data)
        if (data.status === 'verified') {
          setStep('result')
          setResult({ status: 'verified', message: 'Your identity has been verified.' })
        }
      } catch {
        // No KYC on file — that's fine
      } finally {
        setChecking(false)
      }
    }
    if (isAuthenticated) checkStatus()
    else setChecking(false)
  }, [isAuthenticated])

  if (!isAuthenticated) return <Navigate to="/" replace />

  if (user?.is_kyc_verified) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Identity Verified</h2>
          <p className="text-sm text-text-muted">
            Your identity has already been verified. You're all set!
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const { data } = await kycAPI.initiate({
        verification_type: selectedType.value,
        id_number: idNumber,
      })
      setResult(data)
      setStep('result')
      if (data.status === 'verified') {
        await refreshUser()
      }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.response?.data?.id_number?.[0]
        || 'Verification failed. Please check your details and try again.'
      setResult({ status: 'failed', message: msg })
      setStep('result')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-xl mx-auto px-4 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
            Verify Your Identity
          </h1>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Complete KYC verification to unlock the full marketplace. This helps us keep the platform safe and trusted.
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-elevated border border-border overflow-hidden">
          {/* Step 1: Select Verification Type */}
          {step === 'select' && (
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="font-semibold text-text-primary mb-2">Choose verification method</h3>
              {VERIFICATION_TYPES.map((vt) => (
                <button
                  key={vt.value}
                  onClick={() => { setSelectedType(vt); setStep('enter') }}
                  className="w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary-50 transition-all text-left group"
                >
                  <div className="w-11 h-11 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <vt.icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-text-primary">{vt.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{vt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Enter ID Number */}
          {step === 'enter' && selectedType && (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-text-muted hover:text-primary transition-colors"
              >
                ← Change verification method
              </button>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 border border-primary-100">
                <selectedType.icon className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm font-medium text-primary-dark">{selectedType.label}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  {selectedType.label}
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder={selectedType.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono tracking-wider"
                  autoFocus
                />
                <p className="text-xs text-text-muted mt-1.5">
                  Your information is encrypted and never shared with third parties.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || idNumber.length < 10}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-60 active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Verify Identity
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Result */}
          {step === 'result' && result && (
            <div className="p-6 sm:p-8 text-center">
              {result.status === 'verified' ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Verification Successful!</h3>
                  <p className="text-sm text-text-muted mb-6">{result.message}</p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
                  >
                    Go to Dashboard
                  </a>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                    <AlertCircle className="w-10 h-10 text-danger" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Verification Failed</h3>
                  <p className="text-sm text-text-muted mb-6">{result.message}</p>
                  <button
                    onClick={() => { setStep('select'); setIdNumber(''); setResult(null) }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encryption
          </span>
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5" /> Powered by Dojah
          </span>
        </div>
      </div>
    </div>
  )
}
