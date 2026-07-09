/**
 * Axios API client with JWT interceptors.
 * Base URL from VITE_API_URL env var.
 */
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
})

// Request interceptor — attach JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 (expired token)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })
          localStorage.setItem('access_token', data.access)
          originalRequest.headers.Authorization = `Bearer ${data.access}`
          return client(originalRequest)
        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.dispatchEvent(new Event('auth:logout'))
        }
      }
    }

    return Promise.reject(error)
  }
)

// ── API Methods ──────────────────────────────

export const authAPI = {
  register: (data) => client.post('/auth/register/', data),
  login: (data) => client.post('/auth/login/', data),
  getProfile: () => client.get('/auth/profile/'),
  verifyEmail: (token) => client.post('/auth/verify-email/', { token }),
  completeProfile: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })
    return client.patch('/auth/complete-profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  updateProfile: (data) => client.patch('/auth/complete-profile/', data),
  updateAccountProfile: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value)
      }
    })
    return client.patch('/auth/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  upgradeToRealtor: () => client.post('/auth/upgrade-to-realtor/'),
}

export const propertiesAPI = {
  list: (params) => client.get('/properties/', { params }),
  detail: (id) => client.get(`/properties/${id}/`),
  create: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'uploaded_images') {
        value.forEach((file) => formData.append('uploaded_images', file))
      } else {
        formData.append(key, value)
      }
    })
    return client.post('/properties/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  update: (id, data) => client.put(`/properties/${id}/`, data),
  delete: (id) => client.delete(`/properties/${id}/`),
  myListings: (params) => client.get('/properties/my-listings/', { params }),
  featured: () => client.get('/properties/featured/'),
  upcoming: () => client.get('/properties/upcoming/'),
  states: () => client.get('/properties/states/'),
  lgas: (params) => client.get('/properties/lgas/', { params }),
  uploadImages: (id, files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    return client.post(`/properties/${id}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const realtorsAPI = {
  list: (params) => client.get('/realtors/', { params }),
  detail: (id) => client.get(`/realtors/${id}/`),
  createProfile: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    return client.post('/realtors/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  updateProfile: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    return client.patch('/realtors/profile/update/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  rate: (id, data) => client.post(`/realtors/${id}/rate/`, data),
}

export const kycAPI = {
  initiate: (data) => client.post('/kyc/initiate/', data),
  getStatus: () => client.get('/kyc/status/'),
}

export const agentsAPI = {
  list: (params) => client.get('/agents/profiles/', { params }),
  myProfile: () => client.get('/agents/profiles/me/'),
  createProfile: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    return client.post('/agents/profiles/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  updateProfile: (agentId, data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    return client.patch(`/agents/profiles/${agentId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  addLocation: (agentId, data) => client.post(`/agents/profiles/${agentId}/add_location/`, data),
  removeLocation: (agentId, data) => client.post(`/agents/profiles/${agentId}/remove_location/`, data),
  myConnections: () => client.get('/agents/connections/'),
  initiateConnection: (data) => client.post('/agents/connections/initiate/', data),
  completeDeal: (id) => client.post(`/agents/connections/${id}/complete_deal/`),
  rate: (agentId, data) => client.post(`/agents/profiles/${agentId}/rate/`, data),
}

export const architectsAPI = {
  list: (params) => client.get('/architects/profiles/', { params }),
  myProfile: () => client.get('/architects/profiles/me/'),
  createProfile: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value)
    })
    return client.post('/architects/profiles/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  rate: (id, data) => client.post(`/architects/profiles/${id}/rate/`, data),
}

export const landlordsAPI = {
  list: (params) => client.get('/landlords/profiles/', { params }),
  myProfile: () => client.get('/landlords/profiles/me/'),
  createProfile: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value)
    })
    return client.post('/landlords/profiles/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  rate: (id, data) => client.post(`/landlords/profiles/${id}/rate/`, data),
}

export const developersAPI = {
  list: (params) => client.get('/developers/profiles/', { params }),
  myProfile: () => client.get('/developers/profiles/me/'),
  createProfile: (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value)
    })
    return client.post('/developers/profiles/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  rate: (id, data) => client.post(`/developers/profiles/${id}/rate/`, data),
}

export const subscriptionsAPI = {
  listPlans: () => client.get('/subscriptions/plans/'),
  mySubscription: () => client.get('/subscriptions/my/current/'),
  subscribe: (data) => client.post('/subscriptions/my/subscribe/', data),
}

export const chatAPI = {
  sessions: () => client.get('/chat/sessions/'),
  sessionDetail: (id) => client.get(`/chat/sessions/${id}/`),
  messages: (id) => client.get(`/chat/sessions/${id}/messages/`),
  sendMessage: (id, data) => client.post(`/chat/sessions/${id}/send_message/`, data),
  startDirect: (sellerId) => client.post('/chat/sessions/start_direct/', { seller_id: sellerId }),
}

export const walletsAPI = {
  me: () => client.get('/wallets/me/'),
  deposit: (data) => client.post('/wallets/deposit/', data),
}

export default client

