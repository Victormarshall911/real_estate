import React, { createContext, useContext, useState, useEffect } from 'react'

const CompareContext = createContext()

export function CompareProvider({ children }) {
  const [selectedProperties, setSelectedProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('landmarket_compare_properties')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('landmarket_compare_properties', JSON.stringify(selectedProperties))
    } catch (e) {
      console.error('Failed to persist compare properties', e)
    }
  }, [selectedProperties])

  const toggleCompare = (property) => {
    if (!property || !property.id) return

    setSelectedProperties((prev) => {
      const exists = prev.some((p) => String(p.id) === String(property.id))
      if (exists) {
        return prev.filter((p) => String(p.id) !== String(property.id))
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 properties at a time.')
        return prev
      }
      return [...prev, property]
    })
  }

  const removeCompare = (propertyId) => {
    setSelectedProperties((prev) => prev.filter((p) => String(p.id) !== String(propertyId)))
  }

  const clearCompare = () => {
    setSelectedProperties([])
    setIsModalOpen(false)
  }

  const isInCompare = (propertyId) => {
    return selectedProperties.some((p) => String(p.id) === String(propertyId))
  }

  const openCompareModal = () => {
    if (selectedProperties.length < 2) {
      alert('Please select at least 2 properties to compare.')
      return
    }
    setIsModalOpen(true)
  }

  const closeCompareModal = () => {
    setIsModalOpen(false)
  }

  return (
    <CompareContext.Provider
      value={{
        selectedProperties,
        compareCount: selectedProperties.length,
        toggleCompare,
        removeCompare,
        clearCompare,
        isInCompare,
        isModalOpen,
        openCompareModal,
        closeCompareModal,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}
