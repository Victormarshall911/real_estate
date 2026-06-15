import { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { agentsAPI } from '../../api/client'

export default function ManageAgentLocations() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const [newLoc, setNewLoc] = useState({ state: '', location: '' })
  const [profileForm, setProfileForm] = useState({
    company_name: '',
    company_location: '',
    bio: '',
    phone_number: '',
    whatsapp_link: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // Convert any phone number format to a wa.me URL
  const toWhatsAppUrl = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return trimmed
    if (trimmed.startsWith('http')) return trimmed
    let digits = trimmed.replace(/[^0-9]/g, '')
    if (digits.startsWith('0')) {
      digits = '234' + digits.slice(1)
    }
    return `https://wa.me/${digits}`
  }

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data } = await agentsAPI.myProfile()
      setProfile(data)
      setProfileForm({
        company_name: data.company_name || '',
        company_location: data.company_location || '',
        bio: data.bio || '',
        phone_number: data.phone_number || '',
        whatsapp_link: data.whatsapp_link || '',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newLoc.state.trim() || !newLoc.location.trim()) return

    setActionLoading(true)
    setError('')
    try {
      await agentsAPI.addLocation(profile.id, {
        state: newLoc.state.trim(),
        location: newLoc.location.trim(),
        connection_fee: 0,
      })
      setNewLoc({ state: '', location: '' })
      await fetchProfile()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add area.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemove = async (locId) => {
    if (!confirm('Are you sure you want to remove this area?')) return
    
    setActionLoading(true)
    setError('')
    try {
      await agentsAPI.removeLocation(profile.id, { location_id: locId })
      await fetchProfile()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove area.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setError('')
    try {
      await agentsAPI.updateProfile(profile.id, {
        company_name: profileForm.company_name,
        company_location: profileForm.company_location,
        bio: profileForm.bio,
        phone_number: profileForm.phone_number,
        whatsapp_link: toWhatsAppUrl(profileForm.whatsapp_link),
      })
      await fetchProfile()
      alert('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Profile & Settings
          </h2>
          <p className="text-sm text-text-muted mt-1">Manage your public agent profile and coverage areas.</p>
        </div>
        <button 
          onClick={fetchProfile}
          className="p-2 text-text-muted hover:text-primary transition-colors bg-surface-dim rounded-xl border border-border hover:border-primary/30"
          title="Refresh locations"
        >
          <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Edit Profile Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8 pb-8 border-b border-border">
        <h3 className="font-semibold text-text-primary mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Company Name</label>
            <input
              type="text"
              value={profileForm.company_name}
              onChange={e => setProfileForm(p => ({ ...p, company_name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Office Location</label>
            <input
              type="text"
              value={profileForm.company_location}
              onChange={e => setProfileForm(p => ({ ...p, company_location: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={profileForm.phone_number}
              onChange={e => setProfileForm(p => ({ ...p, phone_number: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">WhatsApp Number</label>
            <input
              type="text"
              required
              value={profileForm.whatsapp_link}
              onChange={e => setProfileForm(p => ({ ...p, whatsapp_link: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">Professional Bio</label>
          <textarea
            required
            rows={3}
            value={profileForm.bio}
            onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Profile
          </button>
        </div>
      </form>

      {/* List existing locations */}
      <h3 className="font-semibold text-text-primary mb-3">Coverage Areas</h3>
      <div className="space-y-3 mb-6">
        {profile.location_prices?.length > 0 ? (
          profile.location_prices.map((loc) => (
            <div key={loc.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-dim">
              <div>
                <p className="font-semibold text-text-primary">{loc.location}</p>
                <p className="text-xs text-text-muted">{loc.state} State</p>
              </div>
              <button
                onClick={() => handleRemove(loc.id)}
                disabled={actionLoading}
                className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                title="Remove Area"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-surface-dim rounded-xl border border-dashed border-border">
            <p className="text-sm text-text-muted">You haven't added any coverage areas yet.</p>
          </div>
        )}
      </div>

      {/* Add new location form */}
      <form onSubmit={handleAdd} className="flex gap-3 items-start p-4 rounded-xl border border-primary/20 bg-primary-50/30">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            required
            value={newLoc.state}
            onChange={(e) => setNewLoc(p => ({ ...p, state: e.target.value }))}
            placeholder="State (e.g. Lagos)"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            required
            value={newLoc.location}
            onChange={(e) => setNewLoc(p => ({ ...p, location: e.target.value }))}
            placeholder="Area (e.g. Lekki Phase 1)"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={actionLoading || !newLoc.state.trim() || !newLoc.location.trim()}
          className="flex items-center justify-center gap-1 px-4 py-2.5 h-[42px] rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-50"
        >
          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </form>
    </div>
  )
}
