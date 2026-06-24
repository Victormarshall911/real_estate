import { useState, useEffect } from 'react'
import { Check, Star, Shield, Loader2, ArrowRight } from 'lucide-react'
import { subscriptionsAPI } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function SubscriptionPage() {
  const { isAuthenticated, isRealtor } = useAuth()
  const navigate = useNavigate()
  
  const [plans, setPlans] = useState([])
  const [currentSub, setCurrentSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(null)

  useEffect(() => {
    fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: plansData } = await subscriptionsAPI.listPlans()
      setPlans(plansData.results || plansData)
      
      if (isAuthenticated && isRealtor) {
        try {
          const { data: subData } = await subscriptionsAPI.mySubscription()
          setCurrentSub(subData)
        } catch (e) {
          console.log("No active subscription")
        }
      }
    } catch (err) {
      console.error('Failed to fetch subscription data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing')
      return
    }
    if (!isRealtor) {
      alert('You need a Realtor account to subscribe to these plans.')
      return
    }

    setSubscribing(plan.id)
    try {
      const { data } = await subscriptionsAPI.subscribe({ plan_id: plan.id })
      alert(data.message)
      fetchData() // Refresh status
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.error || 'Subscription failed.')
    } finally {
      setSubscribing(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface-muted pb-20">
      {/* Header */}
      <div className="bg-navy py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Grow Your Real Estate Business
          </h1>
          <p className="text-navy-100 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            Choose the perfect plan to showcase your properties to thousands of buyers daily. 
            Upgrade to unlock more listings, priority support, and verification badges.
          </p>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => {
              const isCurrent = currentSub?.plan?.id === plan.id && currentSub?.is_valid
              const isPopular = plan.name.toLowerCase() === 'premium'
              
              return (
                <div 
                  key={plan.id}
                  className={`bg-surface rounded-3xl overflow-hidden shadow-elevated transition-transform hover:-translate-y-1 ${
                    isPopular ? 'border-2 border-primary relative transform md:-translate-y-4 md:hover:-translate-y-5' : 'border border-border'
                  }`}
                >
                  {isPopular && (
                    <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider text-center py-1.5 w-full">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                      {plan.name}
                      {plan.name.toLowerCase().includes('pro') && <Star className="w-5 h-5 text-gold fill-gold" />}
                    </h3>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-text-primary">
                        Free
                      </span>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm text-text-secondary">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={true}
                      className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-surface-dim border-2 border-border-light text-text-muted cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-20 text-center">
        <Shield className="w-10 h-10 text-success mx-auto mb-4" />
        <h3 className="text-lg font-bold text-text-primary mb-2">100% Free Access</h3>
        <p className="text-sm text-text-muted">
          For a limited time, all our premium features are completely free. Upgrade your account today and start growing your real estate business with no hidden charges.
        </p>
      </div>
    </div>
  )
}
