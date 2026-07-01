import { useState, useRef } from 'react'
import { X, User, Camera, Loader2, CheckCircle2, AlertCircle, MapPin, Calendar, Mail } from 'lucide-react'
import { authAPI } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

export default function EditProfileModal({ onClose }) {
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    date_of_birth: user?.date_of_birth || '',
    full_address: user?.full_address || '',
  })
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size should be less than 5MB')
        return
      }
      setProfilePhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setImgError(false)
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(false)

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
      }
      if (form.date_of_birth) payload.date_of_birth = form.date_of_birth
      if (form.full_address) payload.full_address = form.full_address
      if (profilePhoto) payload.profile_photo = profilePhoto

      await authAPI.updateAccountProfile(payload)
      await refreshUser()
      setSuccessMessage(true)
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to update profile. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface rounded-3xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-navy to-navy-light text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Edit Account Profile</h3>
              <p className="text-xs text-white/75">Update your personal information & photo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-danger flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Profile updated successfully! Closing...</span>
            </div>
          )}

          {/* Avatar Upload Block */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 border-4 border-white shadow-md flex items-center justify-center relative">
                {photoPreview && !imgError ? (
                  <img 
                    key={photoPreview}
                    src={photoPreview.startsWith('/') ? `https://real-estate-api-orbx.onrender.com${photoPreview}` : photoPreview} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center absolute inset-0 bg-primary/10" style={{ display: photoPreview && !imgError ? 'none' : 'flex' }}>
                  <span className="text-3xl font-black text-primary uppercase">
                    {(user?.first_name || 'U').charAt(0)}
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-xs font-semibold text-primary hover:text-primary-dark cursor-pointer mt-2" onClick={() => fileInputRef.current?.click()}>
              Change Profile Photo
            </p>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
              Email Address (Cannot be changed)
            </label>
            <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-text-muted text-sm font-medium">
              <Mail className="w-4 h-4 mr-2.5 shrink-0" />
              <span>{user?.email}</span>
            </div>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Full Residential Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Residential Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-text-muted pointer-events-none" />
              <textarea
                rows={2}
                placeholder="Enter your address..."
                value={form.full_address}
                onChange={(e) => setForm({ ...form, full_address: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Action */}
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
              disabled={loading || successMessage}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
