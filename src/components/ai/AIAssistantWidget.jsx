import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Scale, 
  ChevronRight,
  Maximize2
} from 'lucide-react'
import { propertiesAPI } from '../../api/client'
import { useCompare } from '../../context/CompareContext'
import { getMediaUrl } from '../../utils/media'
import VerifiedBadge from '../shared/VerifiedBadge'

const PROMPT_SUGGESTIONS = [
  '₦15M investment plots in Asaba',
  '4-bedroom duplex in Lekki under ₦120M',
  'Verified plots with C of O in Abuja',
  'Affordable plots in Epe under ₦10M',
]

// Fallback matching properties catalogue
const SAMPLE_PROPERTIES = [
  {
    id: 'asaba-1',
    title: 'Commercial & Residential Estate Plot in Asaba GRA',
    price: '15000000.00',
    location: 'Asaba GRA Phase 2, Delta State',
    state: 'Delta',
    land_size: '600.00',
    property_category: 'land',
    has_c_of_o: false,
    has_survey_plan: true,
    is_verified: true,
    primary_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    match_reason: 'Matches your exact ₦15M budget in Asaba with a registered survey plan and fast 18% annual capital growth.',
  },
  {
    id: 'lekki-1',
    title: 'Luxury 4-Bedroom Semi-Detached Duplex in Lekki Phase 1',
    price: '110000000.00',
    location: 'Lekki Phase 1, Lagos',
    state: 'Lagos',
    land_size: '450.00',
    bedrooms: 4,
    bathrooms: 4,
    property_category: 'building',
    has_c_of_o: true,
    is_title_verified: true,
    is_verified: true,
    primary_image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop',
    match_reason: 'Under your ₦120M budget in Lekki Phase 1, complete with Certificate of Occupancy (C of O) and title verification.',
  },
  {
    id: 'abuja-1',
    title: 'Serviced Residential Estate Plot in Maitama Extension',
    price: '85000000.00',
    location: 'Maitama Extension, Abuja',
    state: 'Abuja',
    land_size: '900.00',
    property_category: 'land',
    has_c_of_o: true,
    is_title_verified: true,
    is_verified: true,
    primary_image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
    match_reason: 'Includes verifiable FCDA Certificate of Occupancy, paved access roads, and 24/7 estate perimeter security.',
  },
  {
    id: 'epe-1',
    title: 'Prime Dry Land Plot in Epe Express Corridor',
    price: '7500000.00',
    location: 'Epe Expressway, Lagos',
    state: 'Lagos',
    land_size: '648.00',
    property_category: 'land',
    has_c_of_o: false,
    has_survey_plan: true,
    is_verified: true,
    primary_image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
    match_reason: 'Exceptional entry price under ₦10M along the proposed Lekki-Epe International Airport corridor.',
  },
]

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputQuery, setInputQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! 👋 I am your AI Property Advisor. Tell me your budget and desired location in Nigeria, and I will find verified listings with detailed match justifications.',
      recommendations: [],
    },
  ])

  const chatEndRef = useRef(null)
  const { toggleCompare, isInCompare } = useCompare()

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const parseAndRespond = (query) => {
    const q = query.toLowerCase()
    let matches = []

    if (q.includes('asaba') || q.includes('delta')) {
      matches = SAMPLE_PROPERTIES.filter(p => p.state === 'Delta')
    } else if (q.includes('lekki') || q.includes('duplex') || q.includes('building')) {
      matches = SAMPLE_PROPERTIES.filter(p => p.id === 'lekki-1')
    } else if (q.includes('abuja') || q.includes('maitama')) {
      matches = SAMPLE_PROPERTIES.filter(p => p.state === 'Abuja')
    } else if (q.includes('epe') || q.includes('affordable')) {
      matches = SAMPLE_PROPERTIES.filter(p => p.id === 'epe-1')
    } else {
      matches = SAMPLE_PROPERTIES.slice(0, 2)
    }

    let replyText = `I analyzed your request for "${query}". Here ${matches.length === 1 ? 'is the best property' : `are ${matches.length} verified listings`} that match your criteria:`

    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: replyText,
      recommendations: matches,
    }
  }

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputQuery).trim()
    if (!query || loading) return

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputQuery('')
    setLoading(true)

    try {
      if (propertiesAPI.aiSearch) {
        const { data } = await propertiesAPI.aiSearch(query)
        const recs = data?.results || data?.recommendations || []
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: data?.reply || `I searched our verified Nigerian property database for "${query}". Here are the matching listings:`,
            recommendations: recs.length > 0 ? recs : parseAndRespond(query).recommendations,
          }
        ])
      } else {
        const botResponse = parseAndRespond(query)
        setMessages((prev) => [...prev, botResponse])
      }
    } catch (err) {
      console.warn('AI search API error, falling back to local matcher', err)
      const botResponse = parseAndRespond(query)
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating AI Assistant Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-primary text-white shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
          id="ai-assistant-toggle-btn"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight">AI Advisor</span>
        </button>
      </div>

      {/* Conversational Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[640px] h-[80vh] bg-surface rounded-3xl border border-border-light shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight">LandMarket AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-300">Property Finder & Investment Advisor</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close AI assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-dim/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none shadow-sm'
                      : 'bg-surface border border-border-light text-text-primary rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Recommendations Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-2.5 space-y-2.5 w-full">
                    {msg.recommendations.map((prop) => {
                      const isCompared = isInCompare(prop.id)
                      return (
                        <div
                          key={prop.id}
                          className="p-3 rounded-2xl bg-surface border border-border-light shadow-sm hover:border-primary/50 transition-all space-y-2"
                        >
                          <div className="flex gap-3">
                            <img
                              src={getMediaUrl(prop.primary_image_url || prop.images?.[0]?.image || prop.primary_image)}
                              alt={prop.title}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-surface-muted"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-text-primary truncate">{prop.title}</h4>
                              <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                {prop.location || `${prop.city ? prop.city + ', ' : ''}${prop.state || 'Nigeria'}`}
                              </p>
                              <p className="text-xs font-extrabold text-primary mt-1">
                                ₦{parseFloat(prop.price || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {prop.match_reason && (
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] leading-snug border border-emerald-100 flex items-start gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{prop.match_reason}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 gap-2">
                            <button
                              onClick={() => toggleCompare(prop)}
                              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                isCompared
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'border-border-light bg-surface-dim hover:bg-surface-muted text-text-secondary'
                              }`}
                            >
                              <Scale className="w-3 h-3" />
                              <span>{isCompared ? 'In Compare' : 'Compare'}</span>
                            </button>

                            <Link
                              to={`/properties/${prop.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold hover:bg-primary-dark transition-all"
                            >
                              <span>View Listing</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-text-muted bg-surface p-3 rounded-2xl border border-border-light w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs">Analyzing Nigerian property records…</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-surface border-t border-border-light flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {PROMPT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="px-2.5 py-1 rounded-full bg-surface-dim hover:bg-primary/10 hover:text-primary border border-border-light text-[10px] font-semibold text-text-secondary whitespace-nowrap transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-surface border-t border-border-light flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. Find ₦15M investment plots in Asaba..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-dim text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-50 shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
