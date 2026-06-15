import { useState, useRef } from 'react'
import { Upload, X, CheckCircle2, User } from 'lucide-react'
import { realtorsAPI, authAPI } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export default function CompleteProfileModal() {
  const { refreshUser, user } = useAuth()
  const fileRef = useRef(null)
  
  const [form, setForm] = useState({
    company_name: '',
    company_location: '',
    phone_number: '',
    whatsapp_link: '',
    bio: '',
    full_address: '',
    date_of_birth: '',
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }))

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

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setProfilePicture(null)
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    try {
      // 1. Complete User Profile (DOB, address, photo)
      const userProfileData = {
        full_address: form.full_address,
        date_of_birth: form.date_of_birth,
      }
      if (profilePicture) {
        userProfileData.profile_photo = profilePicture
      }
      await authAPI.completeProfile(userProfileData)

      // 2. Create Realtor Profile (company, phone, whatsapp, bio)
      const realtorData = {
        company_name: form.company_name,
        company_location: form.company_location,
        phone_number: form.phone_number,
        whatsapp_link: toWhatsAppUrl(form.whatsapp_link),
        bio: form.bio,
      }
      if (profilePicture) {
        realtorData.profile_picture = profilePicture
      }
      await realtorsAPI.createProfile(realtorData)
      await refreshUser()
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        // Collect all field errors into one readable string
        const messages = Object.entries(data)
          .map(([field, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs[0] : msgs
            return `${field}: ${msg}`
          })
          .join(' | ')
        setError(messages || 'Failed to create profile.')
      } else {
        setError('Failed to create profile. Please check your inputs.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 animate-fade-in-up">
      <div className="bg-surface rounded-2xl shadow-elevated border border-border overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Welcome, {user?.first_name}!
            </h1>
            <p className="text-primary-50 text-sm max-w-md mx-auto">
              Before you can list properties, please complete your realtor profile. This helps buyers trust you and contact you directly.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <span className="text-danger font-medium text-sm">{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-semibold text-text-secondary mb-2">Profile Photo</label>
              <div className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center bg-surface-dim overflow-hidden group">
                {preview ? (
                  <>
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={removeImage}
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-6 h-6 text-white mb-1" />
                      <span className="text-xs text-white font-medium">Remove</span>
                    </button>
                  </>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-text-muted hover:text-primary transition-colors"
                  >
                    <User className="w-8 h-8" />
                    <span className="text-xs font-medium">Upload</span>
                  </button>
                )}
                <input 
                  ref={fileRef} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImage} 
                />
              </div>
            </div>

            <div className="flex-1 space-y-5 w-full">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Company Name (Optional)</label>
                <input 
                  type="text" 
                  value={form.company_name} 
                  onChange={(e) => update('company_name', e.target.value)}
                  placeholder="e.g. Horizon Realty Ltd" 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Company Location (Optional)</label>
                <input 
                  type="text" 
                  value={form.company_location} 
                  onChange={(e) => update('company_location', e.target.value)}
                  placeholder="e.g. 15 Admiralty Way, Lekki Phase 1" 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Date of Birth *</label>
                  <input 
                    type="date" 
                    required
                    value={form.date_of_birth} 
                    onChange={(e) => update('date_of_birth', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-primary" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    value={form.phone_number} 
                    onChange={(e) => update('phone_number', e.target.value)}
                    placeholder="+234 801 234 5678" 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Full Residential Address *</label>
                <input 
                  type="text" 
                  required
                  value={form.full_address} 
                  onChange={(e) => update('full_address', e.target.value)}
                  placeholder="Enter your full home address" 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">WhatsApp Number *</label>
                <input 
                  type="text" 
                  required
                  value={form.whatsapp_link} 
                  onChange={(e) => update('whatsapp_link', e.target.value)}
                  placeholder="e.g. +2348012345678" 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                />
                <p className="text-xs text-text-muted mt-1.5">Enter your number — we'll turn it into a WhatsApp link automatically.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Professional Bio (Optional)</label>
            <textarea 
              rows={4} 
              value={form.bio} 
              onChange={(e) => update('bio', e.target.value)}
              placeholder="Tell buyers about your experience and the areas you cover..." 
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none" 
            />
          </div>

          <div className="pt-4 border-t border-border-light">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-70 active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              {submitting ? 'Setting up profile...' : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Complete Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
