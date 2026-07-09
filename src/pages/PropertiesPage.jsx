import { useState, useEffect } from 'react'
import HeroSearch from '../components/search/HeroSearch'
import PropertyGrid from '../components/property/PropertyGrid'
import FeaturedCarousel from '../components/property/FeaturedCarousel'
import { useProperties } from '../hooks/useProperties'
import { propertiesAPI } from '../api/client'

export default function PropertiesPage() {
  const { properties: regularProperties, loading: regularLoading, updateFilters } = useProperties()
  const [upcomingProperties, setUpcomingProperties] = useState([])
  const [upcomingLoading, setUpcomingLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('regular') // 'regular' or 'upcoming'

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const { data } = await propertiesAPI.upcoming()
        setUpcomingProperties(data)
      } catch (err) {
        console.error('Failed to fetch upcoming', err)
      } finally {
        setUpcomingLoading(false)
      }
    }
    fetchUpcoming()
  }, [])

  const properties = activeTab === 'regular' ? regularProperties : upcomingProperties
  const loading = activeTab === 'regular' ? regularLoading : upcomingLoading

  return (
    <main>
      <HeroSearch onFilterChange={updateFilters} />

      {/* Featured Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <FeaturedCarousel />
      </section>

      {/* Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="properties-section">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Property Listings
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Browse available land and upcoming estates.
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center p-1 bg-surface-dim rounded-xl border border-border-light">
            <button
              onClick={() => setActiveTab('regular')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'regular' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Available Plots
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'upcoming' 
                  ? 'bg-white text-gold shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Upcoming Estates
            </button>
          </div>
        </div>

        <PropertyGrid properties={properties} loading={loading} />
      </section>

      {/* Value Propositions */}
      <section className="bg-surface border-t border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Why LandMarket?
            </h2>
            <p className="text-sm text-text-muted mt-2 max-w-lg mx-auto">
              We make finding and buying land in Nigeria safe, transparent, and straightforward.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: '🔒',
                title: 'Verified Realtors',
                desc: 'Every realtor goes through our verification process. Look for the verified badge on listings you can trust.',
              },
              {
                emoji: '📍',
                title: 'Precise Locations',
                desc: 'GPS coordinates on every listing. Know exactly where your land is before you visit — no more blind trips.',
              },
              {
                emoji: '💬',
                title: 'Instant Contact',
                desc: 'One-tap WhatsApp and call buttons connect you directly to the realtor. No middlemen, no delays.',
              },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="text-center p-8 rounded-2xl bg-surface-dim border border-border-light hover:shadow-card transition-all duration-300">
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
