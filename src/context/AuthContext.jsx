import { createContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)

  // Listen for forced logout from interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
      localStorage.removeItem('user')
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await authAPI.login({ email, password })
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)

      // Fetch user profile
      const profileRes = await authAPI.getProfile()
      const userData = profileRes.data
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, user: userData }
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Check your credentials.'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (formData) => {
    setLoading(true)
    try {
      const { data } = await authAPI.register(formData)
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true, user: data.user }
    } catch (error) {
      const errors = error.response?.data
      let message = 'Registration failed.'
      if (errors) {
        const firstKey = Object.keys(errors)[0]
        const firstError = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]
        message = typeof firstError === 'string' ? firstError : message
      }
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getProfile()
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to refresh user profile', error)
    }
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isRealtor: user?.role === 'realtor',
    isAgent: user?.role === 'agent',
    isFullyVerified: user?.is_fully_verified,
    isKycVerified: user?.is_kyc_verified,
    isProfileComplete: user?.is_profile_complete,
    token: localStorage.getItem('access_token'),
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
