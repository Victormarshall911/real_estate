import { useState } from 'react'
import { CheckCircle2, Loader2, MapPin, Plus, X } from 'lucide-react'
import { agentsAPI } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export default function CompleteAgentProfileModal() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    company_name: '',
    company_location: '',
    bio: '',
    phone_number: '',
    whatsapp_link: '',
  })
  const [locations, setLocations] = useState([{ state: '', location: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }))

  // Convert any phone number format to a wa.me URL
  const toWhatsAppUrl = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return trimmed
    if (trimmed.startsWith('http')) return trimmed
    let digits = trimmed.replace(/[^0-9]/g, '')
    // Format local Nigerian numbers (e.g., 080... -> 23480...)
    if (digits.startsWith('0')) {
      digits = '234' + digits.slice(1)
    }
    return `https://wa.me/${digits}`
  }

  const updateLocation = (idx, key, val) => {
    setLocations(prev => prev.map((l, i) => i === idx ? { ...l, [key]: val } : l))
  }

  const addLocation = () => setLocations(prev => [...prev, { state: '', location: '' }])

  const removeLocation = (idx) => setLocations(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // 1. Create agent profile — convert WhatsApp number to link first
      const res = await agentsAPI.createProfile({
        company_name: form.company_name,
        company_location: form.company_location,
        bio: form.bio,
        phone_number: form.phone_number,
        whatsapp_link: toWhatsAppUrl(form.whatsapp_link),
      })

      const agentId = res.data.id

      // 2. Add service locations (all set to free)
      const validLocations = locations.filter(l => l.state.trim() && l.location.trim())
      for (const loc of validLocations) {
        await agentsAPI.addLocation(agentId, {
          state: loc.state.trim(),
          location: loc.location.trim(),
          connection_fee: 0,
        })
      }

      await refreshUser()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m[0] : m}`)
          .join(' | ')
        setError(msgs || 'Failed to create profile.')
      } else {
        setError('Failed to create profile. Please check your inputs.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-20 animate-fade-in-up">
      <div className="bg-surface rounded-2xl shadow-elevated border border-border overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#092C4C] to-primary px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Set Up Your Agent Profile
            </h1>
            <p className="text-blue-100 text-sm max-w-md mx-auto">
              Welcome, {user?.first_name}! Complete your profile so buyers can find and hire you.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-danger font-medium text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Company / Business Name (Optional)</label>
              <input
                type="text"
                value={form.company_name}
                onChange={e => update('company_name', e.target.value)}
                placeholder="e.g. Victor Realty Ltd"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Office Location (Optional)</label>
              <input
                type="text"
                value={form.company_location}
                onChange={e => update('company_location', e.target.value)}
                placeholder="e.g. Lekki Phase 1, Lagos"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">Phone Number *</label>
              <input
                type="text"
                required
                value={form.phone_number}
                onChange={e => update('phone_number', e.target.value)}
                placeholder="+2348012345678"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">WhatsApp Number *</label>
              <input
                type="text"
                required
                value={form.whatsapp_link}
                onChange={e => update('whatsapp_link', e.target.value)}
                placeholder="e.g. +2348012345678"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all"
              />
              <p className="text-xs text-text-muted mt-1">Enter your number — we'll turn it into a WhatsApp link automatically.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Professional Bio *</label>
            <textarea
              required
              rows={4}
              value={form.bio}
              onChange={e => update('bio', e.target.value)}
              placeholder="Tell buyers about your experience, specialties, and the areas you cover..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
            />
          </div>

          {/* Locations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Areas You Cover
              </label>
              <button
                type="button"
                onClick={addLocation}
                className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Area
              </button>
            </div>
            <div className="space-y-3">
              {locations.map((loc, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={loc.state}
                    onChange={e => updateLocation(idx, 'state', e.target.value)}
                    placeholder="State (e.g. Lagos)"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  <input
                    type="text"
                    value={loc.location}
                    onChange={e => updateLocation(idx, 'location', e.target.value)}
                    placeholder="Area (e.g. Lekki Phase 1)"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all"
                  />
                  {locations.length > 1 && (
                    <button type="button" onClick={() => removeLocation(idx)} className="p-2 text-text-muted hover:text-danger transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">All connections are free — no fees charged.</p>
          </div>

          <div className="pt-4 border-t border-border-light">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-70 active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {submitting ? 'Setting up your profile...' : 'Complete Agent Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
