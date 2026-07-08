import { useState } from 'react'
import { X, Home, Phone, AlertCircle } from 'lucide-react'
import { landlordsAPI, authAPI } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export default function CompleteLandlordProfileModal({ onClose, onSuccess }) {
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)
  const [form, setForm] = useState({
    phone_number: '',
    whatsapp_link: '',
    bio: '',
  })

  const update = (field, val) => setForm((prev) => ({ ...prev, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone_number.trim()) {
      setError('Phone Number is required.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = { ...form }
      if (profilePicture) {
        data.profile_picture = profilePicture
      }
      await landlordsAPI.createProfile(data)
      await authAPI.completeProfile({ is_profile_complete: true })
      await refreshUser()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Failed to complete landlord profile. Please try again.')
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
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Complete Landlord Profile</h3>
              <p className="text-xs text-text-muted">Start listing and renting out your land/properties</p>
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

          <form id="landlord-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +234 801 234 5678"
                  value={form.phone_number}
                  onChange={(e) => update('phone_number', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">WhatsApp Contact (Number or Link)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. +2348012345678 or https://wa.me/2348012345678"
                  value={form.whatsapp_link}
                  onChange={(e) => update('whatsapp_link', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-surface"
                />
              </div>
              <p className="text-xs text-text-muted mt-1">This allows interested buyers/agents to contact you directly on WhatsApp.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Bio / Profile Description</label>
              <textarea
                rows={4}
                placeholder="Tell buyers about your property holdings or types of properties you list..."
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm bg-surface resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Profile Photo / Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100 transition-all"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-end space-x-3 bg-surface-muted/50">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary border border-border hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            form="landlord-form"
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/95 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
