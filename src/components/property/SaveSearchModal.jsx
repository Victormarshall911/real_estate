import { useState } from 'react'
import { X, Bell, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { propertiesAPI } from '../../api/client'

export default function SaveSearchModal({ onClose, filters, stateOptions, lgaOptions }) {
  const [title, setTitle] = useState(
    `Alert for ${filters.property_type || 'Properties'} ${filters.state ? `in State #${filters.state}` : ''}`.trim()
  )
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please provide a descriptive title for this alert.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const payload = {
        title: title.trim(),
        email_alerts_enabled: emailAlerts,
      }
      if (filters.state) payload.state = filters.state
      if (filters.lga) payload.lga = filters.lga
      if (filters.property_type) payload.property_type = filters.property_type
      if (filters.max_price) payload.max_price = filters.max_price
      if (filters.min_bedrooms) payload.min_bedrooms = filters.min_bedrooms

      await propertiesAPI.savedSearchesCreate(payload)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Failed to save search alert:', err)
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to save alert. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-elevated border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary to-primary-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-gold animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Save Search & Alert</h3>
              <p className="text-xs text-white/75">Get notified instantly when matches drop</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-danger flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Search saved! Instant alerts enabled successfully.</span>
            </div>
          )}

          {/* Alert Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Alert Title / Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lekki Plots under ₦50M"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
            />
          </div>

          {/* Summary Criteria Box */}
          <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wider text-text-muted text-[10px]">Active Filter Criteria</p>
            <div className="flex flex-wrap gap-1.5">
              {filters.property_type && (
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                  Type: {filters.property_type}
                </span>
              )}
              {filters.max_price && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                  Max: ₦{Number(filters.max_price).toLocaleString()}
                </span>
              )}
              {filters.min_bedrooms && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold">
                  Bedrooms: {filters.min_bedrooms}+
                </span>
              )}
              {!filters.property_type && !filters.max_price && !filters.state && !filters.lga && (
                <span className="text-text-muted font-medium">All properties across Nigeria</span>
              )}
            </div>
          </div>

          {/* Email Checkbox */}
          <label className="flex items-center space-x-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border"
            />
            <span className="text-xs font-semibold text-text-secondary">
              Enable background email alerts when new matching listings are published
            </span>
          </label>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-text-secondary hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Saving Alert...' : 'Save & Enable Alerts'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
