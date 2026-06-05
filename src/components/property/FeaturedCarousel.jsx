import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Maximize2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { propertiesAPI } from '../../api/client'

export default function FeaturedCarousel() {
  const [properties, setProperties] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await propertiesAPI.featured()
        setProperties(data)
      } catch (err) {
        console.error('Failed to load featured properties', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (properties.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % properties.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [properties.length])

  if (loading) {
    return (
      <div className="w-full h-[400px] sm:h-[500px] rounded-3xl skeleton" />
    )
  }

  if (properties.length === 0) return null

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % properties.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length)

  const current = properties[currentIndex]

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0">
        {current.primary_image_url ? (
          <img 
            key={current.id}
            src={current.primary_image_url} 
            alt={current.title} 
            className="w-full h-full object-cover animate-zoom-in"
          />
        ) : (
          <div className="w-full h-full bg-navy-medium" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/20 backdrop-blur-md border border-gold/30 w-fit mb-4">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-xs font-bold text-gold uppercase tracking-wider">Featured Property</span>
        </div>
        
        <Link to={`/properties/${current.id}`} className="block group/link max-w-3xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-3 group-hover/link:text-primary-100 transition-colors line-clamp-2">
            {current.title}
          </h2>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/80 text-sm sm:text-base">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> {current.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> {parseFloat(current.land_size).toLocaleString()} sqm
            </span>
          </div>
        </Link>
      </div>

      {/* Controls */}
      {properties.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-navy transition-all opacity-0 group-hover:opacity-100 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-navy transition-all opacity-0 group-hover:opacity-100 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2">
            {properties.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-8 h-2 bg-primary rounded-full' 
                    : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
