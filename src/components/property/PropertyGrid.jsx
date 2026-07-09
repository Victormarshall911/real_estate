import PropertyCard from './PropertyCard'
import PropertySkeleton from './PropertySkeleton'
import { SearchX } from 'lucide-react'
import useScrollReveal from '../../hooks/useScrollReveal'

export default function PropertyGrid({ properties, loading }) {
  const gridRef = useScrollReveal({ stagger: true })
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertySkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-surface-muted flex items-center justify-center mb-5">
          <SearchX className="w-9 h-9 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No properties found</h3>
        <p className="text-sm text-text-muted max-w-sm">
          Try adjusting your search filters or browse all available listings.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" ref={gridRef}>
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="reveal reveal-up"
        >
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  )
}
