import { useState } from 'react'
import { X, Ruler, Phone, Globe, Briefcase, Award, AlertCircle } from 'lucide-react'
import { architectsAPI, authAPI } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export default function CompleteArchitectProfileModal({ onClose, onSuccess }) {
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)
  const [form, setForm] = useState({
    company_name: '',
    specialization: 'Residential & Commercial',
    years_of_experience: 5,
    phone_number: '',
    whatsapp_link: '',
    portfolio_url: '',
    bio: '',
  })

  const update = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company_name.trim() || !form.phone_number.trim()) {
      setError('Company Name and Phone Number are required.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = { ...form }
      if (profilePicture) {
        data.profile_picture = profilePicture
      }
      await architectsAPI.createProfile(data)
      await authAPI.completeProfile({ is_profile_complete: true })
      await refreshUser()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Failed to complete architect profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between bg-primary-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Complete Architect Profile</h3>
              <p className="text-xs text-text-muted">Showcase your design specialization to buyers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-muted transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-danger flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="architect-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Company / Studio Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Design Studios"
                value={form.company_name}
                onChange={(e) => update('company_name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Specialization</label>
                <select
                  value={form.specialization}
                  onChange={(e) => update('specialization', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-surface"
                >
                  <option value="Residential & Commercial">Residential & Commercial</option>
                  <option value="Residential Design">Residential Design</option>
                  <option value="Commercial & Retail">Commercial & Retail</option>
                  <option value="Urban Planning & Landscape">Urban Planning & Landscape</option>
                  <option value="Interior Architecture">Interior Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Years Experience</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={form.years_of_experience}
                  onChange={(e) => update('years_of_experience', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 801 234 5678"
                  value={form.phone_number}
                  onChange={(e) => update('phone_number', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Portfolio URL</label>
                <input
                  type="url"
                  placeholder="https://behance.net/yourname"
                  value={form.portfolio_url}
                  onChange={(e) => update('portfolio_url', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Bio / About Your Services</label>
              <textarea
                rows={3}
                placeholder="Briefly describe your architectural style and past projects..."
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Profile / Logo Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100 transition-all"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border bg-surface-muted/30 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="architect-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-600 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving Profile...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
