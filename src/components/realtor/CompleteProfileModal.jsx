import { useState, useRef } from 'react'
import { Upload, X, CheckCircle2, User } from 'lucide-react'
import { realtorsAPI } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export default function CompleteProfileModal() {
  const { refreshUser, user } = useAuth()
  const fileRef = useRef(null)
  
  const [form, setForm] = useState({
    company_name: '',
    phone_number: '',
    whatsapp_link: '',
    bio: '',
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }))

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
      const data = { ...form }
      if (profilePicture) {
        data.profile_picture = profilePicture
      }
      
      await realtorsAPI.createProfile(data)
      await refreshUser() // Fetch user again to get the has_realtor_profile = true flag
    } catch (err) {
      const msgs = err.response?.data
      if (typeof msgs === 'object') {
        const firstErr = Object.values(msgs)[0]
        setError(Array.isArray(firstErr) ? firstErr[0] : firstErr)
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

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">WhatsApp Number / Link *</label>
                <input 
                  type="text" 
                  required
                  value={form.whatsapp_link} 
                  onChange={(e) => update('whatsapp_link', e.target.value)}
                  placeholder="https://wa.me/2348012345678 or +2348012345678" 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                />
                <p className="text-xs text-text-muted mt-1.5">This will be used when buyers click "Chat on WhatsApp".</p>
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
