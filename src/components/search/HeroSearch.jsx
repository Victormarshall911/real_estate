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

  return (
    <section className="hero-gradient relative overflow-hidden" id="hero-section">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/3 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Headline */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary-light text-xs font-medium tracking-wide uppercase">
              Trusted by 2,000+ buyers across Nigeria
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
              Land Investment
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Browse verified land listings from trusted realtors. From premium estate plots
            to affordable investment opportunities across Nigeria.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (e.g., Lekki)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                  id="search-location"
                />
              </div>

              {/* Min Price */}
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min Price (₦)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                  id="search-min-price"
                />
              </div>

              {/* Max Price */}
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max Price (₦)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                  id="search-max-price"
                />
              </div>

              {/* Size + Search Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Maximize2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={minSize}
                    onChange={(e) => setMinSize(e.target.value)}
                    placeholder="Min sqm"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                    id="search-min-size"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-primary hover:bg-primary-dark rounded-xl text-white transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97] flex items-center justify-center"
                  id="search-submit-btn"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reset Filters */}
            {(location || minPrice || maxPrice || minSize) && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-primary-light transition-colors"
                  id="search-reset-btn"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mt-12">
          {[
            { label: 'Active Listings', value: '1,200+' },
            { label: 'Verified Realtors', value: '350+' },
            { label: 'States Covered', value: '36' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
