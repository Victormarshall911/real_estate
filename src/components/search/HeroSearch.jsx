import { useState } from 'react'
import { Search, MapPin, DollarSign, Maximize2 } from 'lucide-react'

export default function HeroSearch({ onFilterChange }) {
  const [location, setLocation] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minSize, setMinSize] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    onFilterChange({
      location: location || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      min_size: minSize || undefined,
    })
  }

  const handleReset = () => {
    setLocation('')
    setMinPrice('')
    setMaxPrice('')
    setMinSize('')
    onFilterChange({})
  }

  const hasFilters = location || minPrice || maxPrice || minSize

  return (
    <section className="hero-gradient relative overflow-hidden" id="hero-section">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Headline */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
            <span className="text-primary-light text-xs font-medium tracking-wide">
              Trusted by 2,000+ buyers across Nigeria
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Find Your Perfect{' '}
            <span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
              Land Investment
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Browse verified land listings from trusted realtors across Nigeria.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                  id="search-location"
                />
              </div>

              {/* Min Price */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min Price"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                  id="search-min-price"
                />
              </div>

              {/* Max Price */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max Price"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                  id="search-max-price"
                />
              </div>

              {/* Size + Search Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    value={minSize}
                    onChange={(e) => setMinSize(e.target.value)}
                    placeholder="Min sqm"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                    id="search-min-size"
                  />
                </div>
                <button
                  type="submit"
                  className="w-11 h-11 flex items-center justify-center bg-primary hover:bg-primary-dark rounded-xl text-white transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 active:scale-95 shrink-0"
                  id="search-submit-btn"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {hasFilters && (
              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-primary-light transition-colors"
                  id="search-reset-btn"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-10 sm:gap-16 mt-10 sm:mt-14">
          {[
            { label: 'Active Listings', value: '1,200+' },
            { label: 'Verified Realtors', value: '350+' },
            { label: 'States Covered', value: '36' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
