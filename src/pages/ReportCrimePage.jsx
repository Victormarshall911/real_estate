import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Lock,
  Upload,
  Phone,
  Building2,
  CreditCard,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Loader2,
  Info,
  UserCheck,
  FileText,
  HelpCircle,
  X
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { reportsAPI } from '../api/client'

const CRIME_CATEGORIES = [
  {
    id: 'advance_fee_fraud',
    title: 'Advance Fee / Direct Payment Demand',
    desc: 'Seller or agent demanded direct cash/bank transfer outside LandMarket or refused escrow protection.',
    icon: CreditCard,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
  },
  {
    id: 'fake_agent',
    title: 'Fake Agent / Impersonation',
    desc: 'Individual pretending to be a licensed realtor, landlord, or developer without proper authority.',
    icon: UserCheck,
    color: 'text-blue-500 bg-blue-50 border-blue-200',
  },
  {
    id: 'forged_documents',
    title: 'Fake or Forged Title Documents',
    desc: 'Counterfeit C of O, cloned Registered Survey Plan, forged Deed of Assignment or Gazette.',
    icon: FileText,
    color: 'text-rose-500 bg-rose-50 border-rose-200',
  },
  {
    id: 'land_grabbing_extortion',
    title: 'Land Grabbers (Omo Onile) / Extortion & Threats',
    desc: 'Armed harassment, unlawful community foundation fees, physical threats, or beacon destruction.',
    icon: AlertTriangle,
    color: 'text-red-500 bg-red-50 border-red-200',
  },
  {
    id: 'duplicate_fake_listing',
    title: 'Duplicate / Stolen Photos / Phantom Listing',
    desc: 'Listing photos stolen from another site, non-existent property, or already sold land.',
    icon: ShieldAlert,
    color: 'text-orange-500 bg-orange-50 border-orange-200',
  },
  {
    id: 'breach_of_escrow',
    title: 'Breach of Escrow / Contract Default',
    desc: 'Discrepancy in release terms, refusal to deliver physical site, or forged handover receipt.',
    icon: Lock,
    color: 'text-purple-500 bg-purple-50 border-purple-200',
  },
  {
    id: 'cybercrime_phishing',
    title: 'Cybercrime / Account Takeover / Phishing',
    desc: 'Malicious links, unauthorized OTP requests, or compromised user account.',
    icon: ShieldAlert,
    color: 'text-cyan-500 bg-cyan-50 border-cyan-200',
  },
  {
    id: 'inspection_safety_incident',
    title: 'Physical Danger / Inspection Safety Incident',
    desc: 'Assault, harassment, or safety endangerment during a physical site inspection.',
    icon: AlertTriangle,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'other_crime',
    title: 'Other Platform Crime or Offense',
    desc: 'Any other unlawful activity, scam, or serious breach of trust occurring on LandMarket.',
    icon: HelpCircle,
    color: 'text-slate-500 bg-slate-50 border-slate-200',
  },
]

export default function ReportCrimePage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('new_report') // 'new_report' | 'my_reports'
  const [selectedCategory, setSelectedCategory] = useState(CRIME_CATEGORIES[0].id)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [suspectName, setSuspectName] = useState('')
  const [suspectPhone, setSuspectPhone] = useState('')
  const [suspectBank, setSuspectBank] = useState('')
  const [financialLoss, setFinancialLoss] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentLocation, setIncidentLocation] = useState('')
  const [evidenceFile, setEvidenceFile] = useState(null)
  const [evidenceFile2, setEvidenceFile2] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [successResult, setSuccessResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // My Reports tab
  const [myReportsList, setMyReportsList] = useState([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [expandedReportId, setExpandedReportId] = useState(null)

  const fetchMyReports = async () => {
    if (!isAuthenticated) return
    setLoadingReports(true)
    try {
      const res = await reportsAPI.myReports()
      setMyReportsList(res.data || [])
    } catch (err) {
      console.error('Failed to load user reports:', err)
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'my_reports' && isAuthenticated) {
      fetchMyReports()
    }
  }, [activeTab, isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setErrorMsg('You must be signed in to submit a formal crime report.')
      return
    }

    if (!title.trim() || title.trim().length < 5) {
      setErrorMsg('Please enter a brief, descriptive headline summary (at least 5 characters).')
      return
    }

    if (!description.trim() || description.trim().length < 20) {
      setErrorMsg('Please provide sufficient chronological details of the incident (at least 20 characters).')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const formData = new FormData()
      formData.append('category', selectedCategory)
      formData.append('title', title.trim())
      formData.append('description', description.trim())

      if (suspectName.trim()) formData.append('suspect_name', suspectName.trim())
      if (suspectPhone.trim()) formData.append('suspect_phone', suspectPhone.trim())
      if (suspectBank.trim()) formData.append('suspect_bank_account', suspectBank.trim())
      if (financialLoss && !isNaN(financialLoss)) formData.append('financial_loss', financialLoss)
      if (incidentDate) formData.append('incident_date', incidentDate)
      if (incidentLocation.trim()) formData.append('incident_location', incidentLocation.trim())

      if (evidenceFile) formData.append('evidence_file', evidenceFile)
      if (evidenceFile2) formData.append('evidence_file_2', evidenceFile2)

      const res = await reportsAPI.submitCrimeReport(formData)
      setSuccessResult(res.data)
      
      // Reset form fields
      setTitle('')
      setDescription('')
      setSuspectName('')
      setSuspectPhone('')
      setSuspectBank('')
      setFinancialLoss('')
      setIncidentDate('')
      setIncidentLocation('')
      setEvidenceFile(null)
      setEvidenceFile2(null)

      // Refresh reports list in background
      fetchMyReports()
    } catch (err) {
      console.error('Error submitting crime report:', err)
      const errDetail = err.response?.data
      if (typeof errDetail === 'object') {
        const firstKey = Object.keys(errDetail)[0]
        const val = Array.isArray(errDetail[firstKey]) ? errDetail[firstKey][0] : errDetail[firstKey]
        setErrorMsg(typeof val === 'string' ? `${firstKey}: ${val}` : 'Failed to submit report. Please check input.')
      } else {
        setErrorMsg(err.response?.data?.error || 'Failed to submit report. Please check your network and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (statusKey) => {
    switch (statusKey) {
      case 'under_investigation':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">🔍 Under Investigation</span>
      case 'escalated_to_authorities':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">⚖️ Escalated to Police / EFCC</span>
      case 'action_taken':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">🛡️ Action Taken (Suspended)</span>
      case 'resolved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">✅ Case Resolved</span>
      case 'dismissed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">⚪ Dismissed / Inconclusive</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">⏳ Pending Audit</span>
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-surface-dim">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-900 via-navy to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-elevated">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-red-300 text-xs font-bold backdrop-blur-sm border border-white/15 mb-3">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>LandMarket Trust & Safety Infrastructure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Report Real Estate Crime or Offense
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Help keep Nigeria's real estate ecosystem safe from scammers, land grabbers, fake agents, and forged title documents. Every verified report is audited by our legal team and escalated to law enforcement when appropriate.
            </p>
          </div>
        </div>

        {/* Emergency & Official Helplines Card */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-950">In Immediate Physical Danger?</h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                If you are currently facing armed land grabbers (Omo Onile) or physical threats during an inspection, call the Nigeria Police emergency line immediately: <strong className="underline">112</strong> or Lagos SCID Anti-Kidnapping/Fraud: <strong className="underline">+234 803 301 1952</strong>.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2.5 py-1 rounded-lg">
              EFCC Hotline: 0809 332 2644
            </span>
          </div>
        </div>

        {/* Auth Check Prompt (Authenticated only requirement) */}
        {!isAuthenticated ? (
          <div className="bg-surface rounded-3xl border border-border p-8 sm:p-12 text-center shadow-card space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              Authentication Required to Report
            </h2>
            <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              To prevent malicious or false reports against legitimate agents and property owners, the LandMarket Safety Framework requires all reporters to be verified, logged-in platform members.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
              >
                Sign In or Create Account to File Report
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-border gap-4">
              <button
                onClick={() => { setActiveTab('new_report'); setSuccessResult(null); }}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'new_report'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>File New Crime Report</span>
              </button>
              <button
                onClick={() => setActiveTab('my_reports')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'my_reports'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>My Filed Reports ({myReportsList.length})</span>
              </button>
            </div>

            {/* TAB 1: FILE REPORT */}
            {activeTab === 'new_report' && (
              <>
                {successResult ? (
                  <div className="bg-surface rounded-3xl border border-emerald-200 p-8 sm:p-10 shadow-card text-center space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary">
                      Crime Report Successfully Submitted
                    </h3>
                    <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
                      Thank you for standing against fraud. Your report has been logged with reference ID <code className="px-2 py-0.5 bg-surface-dim font-mono text-xs font-bold text-primary rounded">{successResult.report?.id?.slice(0, 8)}</code>. Our compliance officers and legal counsel have initiated audit procedures.
                    </p>
                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => setActiveTab('my_reports')}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all"
                      >
                        Track Report Status
                      </button>
                      <button
                        onClick={() => setSuccessResult(null)}
                        className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-dim text-sm font-semibold text-text-primary transition-all"
                      >
                        Submit Another Incident
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-surface rounded-3xl border border-border-light shadow-card p-6 sm:p-8 space-y-8">
                    
                    {errorMsg && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-sm font-semibold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                        <button type="button" onClick={() => setErrorMsg('')}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Step 1: Category Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                        <h3 className="text-base font-bold text-text-primary">Select Offense Category</h3>
                      </div>
                      <p className="text-xs text-text-muted mb-4 ml-8">Choose the classification that best fits what occurred.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CRIME_CATEGORIES.map((cat) => {
                          const Icon = cat.icon
                          const isSelected = selectedCategory === cat.id
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                isSelected
                                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary'
                                  : 'border-border-light bg-surface hover:border-border hover:bg-surface-dim'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`p-2 rounded-xl ${cat.color} border inline-flex`}>
                                    <Icon className="w-4 h-4" />
                                  </span>
                                  {isSelected && (
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-text-primary mb-1">{cat.title}</h4>
                                <p className="text-[11px] text-text-muted leading-relaxed line-clamp-3">{cat.desc}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Step 2: Summary & Description */}
                    <div className="space-y-4 pt-4 border-t border-border-light">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                        <h3 className="text-base font-bold text-text-primary">Incident Narrative & Details</h3>
                      </div>
                      <p className="text-xs text-text-muted ml-8 mb-4">Provide a clear, factual account of the offense.</p>

                      <div>
                        <label className="block text-xs font-bold text-text-primary mb-1.5">
                          Headline Summary <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Demanded ₦200,000 cash inspection fee and blocked phone afterwards"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-primary mb-1.5">
                          Detailed Description of Crime / Offense <span className="text-danger">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="State exact dates, how contact was initiated, exact words or threats used, what documents were presented, and any witnesses..."
                          className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm leading-relaxed focus:outline-none focus:border-primary transition-colors"
                          required
                        />
                        <p className="text-[11px] text-text-muted mt-1">Minimum 20 characters.</p>
                      </div>
                    </div>

                    {/* Step 3: Suspect & Financial Details */}
                    <div className="space-y-4 pt-4 border-t border-border-light">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                        <h3 className="text-base font-bold text-text-primary">Suspect & Transaction Information</h3>
                      </div>
                      <p className="text-xs text-text-muted ml-8 mb-4">Any details that assist investigators in identifying the offender.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-text-primary mb-1.5">
                            Suspect Name / Agency
                          </label>
                          <input
                            type="text"
                            value={suspectName}
                            onChange={(e) => setSuspectName(e.target.value)}
                            placeholder="e.g. 'Alhaji Musa' / Peak Homes Ltd"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-text-primary mb-1.5">
                            Suspect Phone / WhatsApp
                          </label>
                          <input
                            type="text"
                            value={suspectPhone}
                            onChange={(e) => setSuspectPhone(e.target.value)}
                            placeholder="e.g. +234 801 234 5678"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-text-primary mb-1.5">
                            Suspect Bank Account (If requested)
                          </label>
                          <input
                            type="text"
                            value={suspectBank}
                            onChange={(e) => setSuspectBank(e.target.value)}
                            placeholder="e.g. Access Bank - 0123456789"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-text-primary mb-1.5">
                            Financial Loss Incurred (₦)
                          </label>
                          <input
                            type="number"
                            value={financialLoss}
                            onChange={(e) => setFinancialLoss(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-text-primary mb-1.5">
                            Incident Date
                          </label>
                          <input
                            type="date"
                            value={incidentDate}
                            onChange={(e) => setIncidentDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-text-primary mb-1.5">
                            Incident Location
                          </label>
                          <input
                            type="text"
                            value={incidentLocation}
                            onChange={(e) => setIncidentLocation(e.target.value)}
                            placeholder="e.g. Ibeju-Lekki, Lagos State"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Evidence Attachment */}
                    <div className="space-y-4 pt-4 border-t border-border-light">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">4</span>
                        <h3 className="text-base font-bold text-text-primary">Supporting Evidence Upload</h3>
                      </div>
                      <p className="text-xs text-text-muted ml-8 mb-4">Upload screenshots of WhatsApp chats, forged survey plans, bank transfer receipts, or photos.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Primary file */}
                        <div className="p-5 border-2 border-dashed border-border rounded-2xl text-center bg-surface-dim hover:bg-surface transition-colors relative">
                          <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
                          <p className="text-xs font-bold text-text-primary">Primary Evidence Document</p>
                          <p className="text-[10px] text-text-muted mt-1">PDF, JPG, PNG (Max 10MB)</p>
                          <input
                            type="file"
                            onChange={(e) => setEvidenceFile(e.target.files[0] || null)}
                            className="mt-3 block w-full text-xs text-text-muted file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          />
                          {evidenceFile && (
                            <p className="text-[11px] font-bold text-emerald-600 mt-2 truncate">
                              ✓ {evidenceFile.name}
                            </p>
                          )}
                        </div>

                        {/* Secondary file */}
                        <div className="p-5 border-2 border-dashed border-border rounded-2xl text-center bg-surface-dim hover:bg-surface transition-colors relative">
                          <Upload className="w-6 h-6 text-text-muted mx-auto mb-2" />
                          <p className="text-xs font-bold text-text-primary">Secondary Evidence (Optional)</p>
                          <p className="text-[10px] text-text-muted mt-1">Additional receipt or police petition</p>
                          <input
                            type="file"
                            onChange={(e) => setEvidenceFile2(e.target.files[0] || null)}
                            className="mt-3 block w-full text-xs text-text-muted file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          />
                          {evidenceFile2 && (
                            <p className="text-[11px] font-bold text-emerald-600 mt-2 truncate">
                              ✓ {evidenceFile2.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Protected by LandMarket Legal & Whistleblower Shield</span>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting Investigation Report...</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4" />
                            <span>Submit Formal Crime Report</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* TAB 2: MY FILED REPORTS */}
            {activeTab === 'my_reports' && (
              <div className="space-y-4">
                {loadingReports ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-text-muted font-semibold">Loading your filed reports...</p>
                  </div>
                ) : myReportsList.length === 0 ? (
                  <div className="bg-surface rounded-3xl border border-border p-12 text-center shadow-card space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h3 className="text-lg font-bold text-text-primary">No Incident Reports on Record</h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto">
                      You have not filed any crime or safety reports yet. If you encounter any fraudulent activity or extortion, report it here immediately.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myReportsList.map((rep) => {
                      const isExpanded = expandedReportId === rep.id
                      return (
                        <div
                          key={rep.id}
                          className="bg-surface rounded-2xl border border-border-light shadow-card p-5 transition-all hover:border-border"
                        >
                          <div
                            onClick={() => setExpandedReportId(isExpanded ? null : rep.id)}
                            className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-bold text-text-primary truncate">{rep.title}</span>
                                {getStatusBadge(rep.status)}
                              </div>
                              <p className="text-xs text-text-muted">
                                Category: <strong className="text-text-secondary">{rep.category_display}</strong> • Reported on: {new Date(rep.created_at).toLocaleDateString()}
                              </p>
                              {rep.financial_loss > 0 && (
                                <p className="text-xs text-danger font-semibold mt-0.5">
                                  Loss Claimed: ₦{Number(rep.financial_loss).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-primary">
                              <span>{isExpanded ? 'Hide Details' : 'View Resolution & Details'}</span>
                              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-border-light space-y-3 text-xs animate-in fade-in">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-dim p-3.5 rounded-xl">
                                <div>
                                  <span className="text-text-muted font-medium">Case Reference ID:</span>
                                  <p className="font-mono font-bold text-text-primary mt-0.5">{rep.id}</p>
                                </div>
                                {rep.property_title && (
                                  <div>
                                    <span className="text-text-muted font-medium">Associated Property:</span>
                                    <p className="font-bold text-text-primary mt-0.5">{rep.property_title}</p>
                                  </div>
                                )}
                              </div>

                              {rep.resolution_summary ? (
                                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                                  <h5 className="font-bold mb-1">Compliance Team Resolution:</h5>
                                  <p className="leading-relaxed">{rep.resolution_summary}</p>
                                </div>
                              ) : (
                                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950">
                                  <p className="leading-relaxed">
                                    Our Trust & Safety compliance team is actively evaluating this case. Any law enforcement references or formal warnings issued will be documented here.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
