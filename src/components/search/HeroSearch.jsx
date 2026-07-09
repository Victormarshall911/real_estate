import { useState, useEffect } from 'react'
import { Search, MapPin, Maximize2, Settings2, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { propertiesAPI } from '../../api/client'

export default function HeroSearch({ onFilterChange }) {
  const [states, setStates] = useState([])
  const [lgas, setLgas] = useState([])
  
  const [selectedState, setSelectedState] = useState('')
  const [selectedLga, setSelectedLga] = useState('')
  const [category, setCategory] = useState('')
  const [listingType, setListingType] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minSize, setMinSize] = useState('')
  
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Fetch States on mount
  useEffect(() => {
    async function loadStates() {
      try {
        const { data } = await propertiesAPI.states()
        setStates(data)
      } catch (err) {
        console.error('Failed to load states', err)
      }
    }
    loadStates()
  }, [])

  // Fetch LGAs when state changes
  useEffect(() => {
    if (!selectedState) {
      setLgas([])
      setSelectedLga('')
      return
    }
    async function loadLgas() {
      try {
        const { data } = await propertiesAPI.lgas({ state: selectedState })
        setLgas(data)
      } catch (err) {
        console.error('Failed to load lgas', err)
      }
    }
    loadLgas()
  }, [selectedState])

  const handleSearch = (e) => {
    e.preventDefault()
    onFilterChange({
      state: selectedState || undefined,
      lga: selectedLga || undefined,
      property_category: category || undefined,
      listing_type: listingType || undefined,
      bedrooms: (category === 'building' && bedrooms) ? bedrooms : undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      min_size: minSize || undefined,
    })
  }

  const handleReset = () => {
    setSelectedState('')
    setSelectedLga('')
    setCategory('')
    setListingType('')
    setBedrooms('')
    setMinPrice('')
    setMaxPrice('')
    setMinSize('')
    onFilterChange({})
  }

  const hasFilters = selectedState || selectedLga || category || listingType || bedrooms || minPrice || maxPrice || minSize

  return (
    <section className="hero-gradient relative overflow-hidden" id="hero-section">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Headline */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
            <span className="text-primary-light text-xs font-medium tracking-wide">
              Trusted by 15,000+ Nigerians
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            Find Your Next{' '}
            <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
              Property Investment
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Filter through real estate listings across Nigeria. Verify coordinates, title deeds, and escrow options instantly.
          </p>
        </div>

        {/* Search Bar Container */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
            
            {/* Primary filters row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* State */}
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all appearance-none cursor-pointer"
                  id="search-state"
                >
                  <option value="" className="bg-navy text-slate-400">Select State</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id} className="bg-navy text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>

              {/* LGA */}
              <div className="relative">
                <select
                  value={selectedLga}
                  onChange={(e) => setSelectedLga(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all appearance-none cursor-pointer disabled:opacity-50"
                  id="search-lga"
                >
                  <option value="" className="bg-navy text-slate-400">Select LGA</option>
                  {lgas.map((l) => (
                    <option key={l.id} value={l.id} className="bg-navy text-white">
                      {l.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>

              {/* Category */}
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    if (e.target.value !== 'building') setBedrooms('')
                  }}
                  className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all appearance-none cursor-pointer"
                  id="search-category"
                >
                  <option value="" className="bg-navy text-slate-400">All Categories</option>
                  <option value="land" className="bg-navy text-white">Land</option>
                  <option value="building" className="bg-navy text-white">Building</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>

              {/* Listing Type */}
              <div className="relative">
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all appearance-none cursor-pointer"
                  id="search-listing-type"
                >
                  <option value="" className="bg-navy text-slate-400">Any Type</option>
                  <option value="sale" className="bg-navy text-white">For Sale</option>
                  <option value="rent" className="bg-navy text-white">For Rent</option>
                  <option value="lease" className="bg-navy text-white">For Lease</option>
                  <option value="short_let" className="bg-navy text-white">Short Let</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>
            </div>

            {/* Advanced Filters Block */}
            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/10 animate-fade-in">
                {/* Min Price */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₦</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min Price"
                    className="w-full pl-7 pr-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                    id="search-min-price"
                  />
                </div>

                {/* Max Price */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₦</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max Price"
                    className="w-full pl-7 pr-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                    id="search-max-price"
                  />
                </div>

                {/* Min Size */}
                <div className="relative">
                  <input
                    type="number"
                    value={minSize}
                    onChange={(e) => setMinSize(e.target.value)}
                    placeholder="Min size (sqm)"
                    className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
                    id="search-min-size"
                  />
                </div>

                {/* Bedrooms (only show if category is building) */}
                <div className="relative">
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    disabled={category !== 'building'}
                    className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/15 transition-all appearance-none cursor-pointer disabled:opacity-30"
                    id="search-bedrooms"
                  >
                    <option value="" className="bg-navy text-slate-400">Any Bedrooms</option>
                    <option value="1" className="bg-navy text-white">1 Bedroom</option>
                    <option value="2" className="bg-navy text-white">2 Bedrooms</option>
                    <option value="3" className="bg-navy text-white">3 Bedrooms</option>
                    <option value="4" className="bg-navy text-white">4 Bedrooms</option>
                    <option value="5" className="bg-navy text-white">5+ Bedrooms</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    showAdvanced 
                      ? 'bg-white/15 text-white border-white/20' 
                      : 'text-slate-400 hover:text-white border-transparent'
                  }`}
                  id="search-toggle-advanced"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {showAdvanced ? 'Simple Search' : 'Advanced Filters'}
                </button>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-gold transition-colors"
                    id="search-reset-btn"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                id="search-submit-btn"
              >
                <Search className="w-4 h-4" />
                Find Properties
              </button>
            </div>
          </div>
        </form>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mt-8">
          {[
            { label: 'Active Listings', value: '2,400+' },
            { label: 'Verified Sellers', value: '1,200+' },
            { label: 'Secured Escrow', value: '₦4.2B+' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg sm:text-xl font-black text-white tracking-tight">{value}</p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
