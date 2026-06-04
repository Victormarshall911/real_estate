import { useState, useEffect, useCallback, useMemo } from 'react'
import { propertiesAPI } from '../api/client'

// ── Mock data for development/demo ──────────
const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'Premium Waterfront Estate Plot in Banana Island',
    price: '450000000.00',
    land_size: '1200.00',
    land_size_plots: 1.85,
    location: 'Banana Island, Ikoyi, Lagos',
    state: 'Lagos',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    realtor_name: 'Adebayo Properties',
    realtor_id: 'r1',
    is_verified: true,
    image_count: 6,
    view_count: 342,
    created_at: '2026-05-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Serviced Residential Plot — Lekki Phase 1',
    price: '85000000.00',
    land_size: '648.00',
    land_size_plots: 1.0,
    location: 'Lekki Phase 1, Lagos',
    state: 'Lagos',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop',
    realtor_name: 'Horizon Realty',
    realtor_id: 'r2',
    is_verified: true,
    image_count: 4,
    view_count: 187,
    created_at: '2026-05-20T14:30:00Z',
  },
  {
    id: '3',
    title: 'Commercial Land Facing Express — Ajah',
    price: '35000000.00',
    land_size: '500.00',
    land_size_plots: 0.77,
    location: 'Ajah, Lekki-Epe Expressway, Lagos',
    state: 'Lagos',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&h=600&fit=crop',
    realtor_name: 'Greenfield Estates',
    realtor_id: 'r3',
    is_verified: false,
    image_count: 3,
    view_count: 95,
    created_at: '2026-05-22T09:15:00Z',
  },
  {
    id: '4',
    title: 'Gated Estate Land in Maitama District',
    price: '120000000.00',
    land_size: '900.00',
    land_size_plots: 1.39,
    location: 'Maitama District, Abuja',
    state: 'Abuja',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
    realtor_name: 'Capital Land Ventures',
    realtor_id: 'r4',
    is_verified: true,
    image_count: 5,
    view_count: 256,
    created_at: '2026-05-18T11:00:00Z',
  },
  {
    id: '5',
    title: 'Affordable Plot in Epe — Fast Developing Area',
    price: '8500000.00',
    land_size: '648.00',
    land_size_plots: 1.0,
    location: 'Epe, Lagos',
    state: 'Lagos',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
    realtor_name: 'Apex Land Partners',
    realtor_id: 'r5',
    is_verified: false,
    image_count: 2,
    view_count: 64,
    created_at: '2026-05-25T16:45:00Z',
  },
  {
    id: '6',
    title: 'Hilltop Estate Plots with Panoramic Views — Asokoro',
    price: '200000000.00',
    land_size: '1500.00',
    land_size_plots: 2.31,
    location: 'Asokoro Extension, Abuja',
    state: 'Abuja',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    realtor_name: 'Prestige Realtors',
    realtor_id: 'r6',
    is_verified: true,
    image_count: 8,
    view_count: 412,
    created_at: '2026-05-12T08:30:00Z',
  },
]

export function useProperties(initialFilters = {}) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState({
    count: 0,
    totalPages: 1,
    currentPage: 1,
  })

  const fetchProperties = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const mergedParams = { ...filters, ...params }
      // Clean empty params
      Object.keys(mergedParams).forEach((key) => {
        if (mergedParams[key] === '' || mergedParams[key] === null || mergedParams[key] === undefined) {
          delete mergedParams[key]
        }
      })

      const { data } = await propertiesAPI.list(mergedParams)
      setProperties(data.results || data)
      setPagination({
        count: data.count || data.length,
        totalPages: data.total_pages || 1,
        currentPage: data.current_page || 1,
      })
    } catch (err) {
      console.warn('API not available, using mock data:', err.message)
      // Use mock data when API is not available
      let filtered = [...MOCK_PROPERTIES]

      const f = { ...filters, ...params }
      if (f.search) {
        const q = f.search.toLowerCase()
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
        )
      }
      if (f.min_price) filtered = filtered.filter((p) => parseFloat(p.price) >= parseFloat(f.min_price))
      if (f.max_price) filtered = filtered.filter((p) => parseFloat(p.price) <= parseFloat(f.max_price))
      if (f.min_size) filtered = filtered.filter((p) => parseFloat(p.land_size) >= parseFloat(f.min_size))
      if (f.location) {
        const loc = f.location.toLowerCase()
        filtered = filtered.filter((p) => p.location.toLowerCase().includes(loc) || p.state.toLowerCase().includes(loc))
      }

      setProperties(filtered)
      setPagination({ count: filtered.length, totalPages: 1, currentPage: 1 })
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    properties,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    clearFilters,
    refetch: fetchProperties,
  }
}
