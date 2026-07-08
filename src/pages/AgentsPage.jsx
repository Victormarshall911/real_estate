import { useState, useEffect } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { agentsAPI } from '../api/client'
import AgentCard from '../components/agent/AgentCard'
import AgentSkeleton from '../components/agent/AgentSkeleton'
import AgentConnectionModal from '../components/agent/AgentConnectionModal'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AgentsPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async (searchTerm = '') => {
    setLoading(true)
    try {
      const params = searchTerm ? { search: searchTerm } : {}
      const { data } = await agentsAPI.list(params)
      setAgents(data.results || data)
    } catch (err) {
      console.error('Failed to fetch agents', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchAgents(search)
  }

  const handleConnectClick = (agent, locationPrice) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/agents')
      return
    }
    setSelectedAgent(agent)
    setSelectedLocation(locationPrice)
  }

  const handleConfirmConnection = async (agentId, locationId) => {
    setConnecting(true)
    try {
      const { data } = await agentsAPI.initiateConnection({
        agent_id: agentId,
        location_id: locationId
      })
      setSelectedAgent(null)
      setSelectedLocation(null)
      navigate('/messages') // Go directly to chat
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initiate connection.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-muted pb-20">
      {/* Header */}
      <div className="bg-navy py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Hire a Verified Agent
          </h1>
          <p className="text-navy-100 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            Need help finding the perfect property or negotiating a deal? Browse our network of professional agents and hire them for specific locations.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative flex items-center">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by agent name, company, or location..."
              className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-transparent bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-text-primary shadow-elevated"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98]"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <AgentSkeleton key={i} />
            ))}
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onConnect={handleConnectClick} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
            <MapPin className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-text-primary mb-2">No agents found</h3>
            <p className="text-text-muted text-sm">
              Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Connection Modal */}
      {selectedAgent && selectedLocation && (
        <AgentConnectionModal
          agent={selectedAgent}
          locationPrice={selectedLocation}
          loading={connecting}
          onClose={() => {
            setSelectedAgent(null)
            setSelectedLocation(null)
          }}
          onConfirm={handleConfirmConnection}
        />
      )}
    </div>
  )
}
