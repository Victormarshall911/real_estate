import HeroSearch from '../components/search/HeroSearch'
import PropertyGrid from '../components/property/PropertyGrid'
import { useProperties } from '../hooks/useProperties'

export default function HomePage() {
  const { properties, loading, updateFilters } = useProperties()

  return (
    <main>
      <HeroSearch onFilterChange={updateFilters} />

      {/* Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="properties-section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Featured Properties
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Handpicked land listings across Nigeria
            </p>
          </div>
          {!loading && properties.length > 0 && (
            <p className="text-sm text-text-muted hidden sm:block">
              Showing <span className="font-semibold text-text-secondary">{properties.length}</span> listing{properties.length !== 1 ? 's' : ''}
            </p>
          )}
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
