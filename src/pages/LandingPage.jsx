import { Link } from 'react-router-dom'
import { Search, ShieldCheck, Home, ArrowRight, Wallet, Star, Ruler } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-navy">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-navy to-navy" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary opacity-20 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-8">
            The Smart Way to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">
              Buy & Sell Property
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-navy-100 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect with verified realtors, hire trusted agents, and use our secure escrow wallet to make real estate transactions safer than ever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/properties" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-all hover:-translate-y-1 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" /> Browse Properties
            </Link>
            <Link 
              to="/agents" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 text-white border border-white/20 font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Hire an Agent
            </Link>
            <Link 
              to="/architects" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 text-white border border-white/20 font-bold text-lg hover:bg-white/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Find Architects <Ruler className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Why Choose LandMarket?</h2>
            <p className="text-text-muted max-w-2xl mx-auto">We've built an ecosystem that prioritizes trust, transparency, and speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-dim p-8 rounded-3xl border border-border hover:shadow-elevated transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Secure Escrow Wallet</h3>
              <p className="text-text-muted leading-relaxed">
                Funds are held safely in our virtual wallet and only released when both parties confirm the transaction is complete.
              </p>
            </div>

            <div className="bg-surface-dim p-8 rounded-3xl border border-border hover:shadow-elevated transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Verified Ratings</h3>
              <p className="text-text-muted leading-relaxed">
                Every agent and realtor has a public rating based on real transactions. Work only with the best professionals.
              </p>
            </div>

            <div className="bg-surface-dim p-8 rounded-3xl border border-border hover:shadow-elevated transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mb-6">
                <Home className="w-7 h-7 text-[#25D366]" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Premium Listings</h3>
              <p className="text-text-muted leading-relaxed">
                Browse high-quality, verified properties directly from top-rated sellers without any hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-b from-surface to-surface-dim border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Wallet className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-text-primary mb-6">Ready to make a move?</h2>
          <p className="text-lg text-text-muted mb-10">
            Join thousands of buyers and sellers experiencing the future of real estate today.
          </p>
          <Link 
            to="/register" 
            className="inline-flex px-10 py-4 rounded-full bg-navy text-white font-bold text-lg hover:bg-navy-light transition-all shadow-lg hover:-translate-y-1"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}
