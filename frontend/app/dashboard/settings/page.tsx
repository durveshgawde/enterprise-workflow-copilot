'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/providers'
import { userApi } from '@/lib/api'
import { Settings, Save, User, Loader, Check, X, Mail, Phone } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthContext()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadUserProfile()
  }, [user])

  const loadUserProfile = async () => {
    try {
      const response = await userApi.getCurrent()
      console.log('User profile response:', response)

      if (response.data) {
        setName(response.data.name || user?.user_metadata?.name || '')
        setEmail(response.data.email || user?.email || '')
        setPhone(response.data.phone || '')
        setAvatarUrl(response.data.avatar_url || '')
      }
    } catch (err) {
      // Use fallback from auth context
      setName(user?.user_metadata?.name || '')
      setEmail(user?.email || '')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await userApi.updateProfile({
        name: name.trim(),
        avatar_url: avatarUrl.trim(),
        phone: phone.trim(),
      })
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error('Save profile error:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Settings size={32} />
        Settings
      </h1>

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
          <Check size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={20} /></button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User size={24} />
              Profile Settings
            </h2>

            <div className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-white font-bold">
                      {name ? name[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar URL (optional)
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
              >
                {saving ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Info Sidebar */}
        <div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="font-bold mb-4">Account Info</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">User ID</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                  {user?.id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Email</p>
                <p className="mt-1">{email}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Auth Provider</p>
                <p className="mt-1">Supabase</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}