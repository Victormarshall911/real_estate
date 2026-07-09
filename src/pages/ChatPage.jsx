import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { chatAPI, agentsAPI } from '../api/client'
import { Search, Loader2, ArrowLeft, Send, CheckCheck, Check, MessageSquare, ShieldCheck } from 'lucide-react'
import ReviewSection from '../components/shared/ReviewSection'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function ChatPage() {
  const { user, token } = useAuth()
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [ws, setWs] = useState(null)
  
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (activeSession) {
      fetchMessages(activeSession.id)
      connectWebSocket(activeSession.id)
    }
    return () => {
      if (ws) ws.close()
    }
  }, [activeSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSessions = async () => {
    try {
      const { data } = await chatAPI.sessions()
      setSessions(data)
      if (data.length > 0 && !activeSession) {
        setActiveSession(data[0])
      }
    } catch (err) {
      console.error('Failed to load sessions', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (sessionId) => {
    setLoadingMessages(true)
    try {
      const { data } = await chatAPI.messages(sessionId)
      setMessages(data)
      // Update unread count in session list
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, unread_count: 0 } : s
      ))
    } catch (err) {
      console.error('Failed to fetch messages', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const connectWebSocket = (sessionId) => {
    if (ws) ws.close()
    
    let wsBaseUrl = import.meta.env.VITE_WS_URL
    if (!wsBaseUrl) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'
      wsBaseUrl = apiBase.replace(/^http/, 'ws').replace(/\/api\/v1\/?$/, '')
    }
    const wsUrl = `${wsBaseUrl}/ws/chat/${sessionId}/?token=${token}`
    const socket = new WebSocket(wsUrl)
    
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const newMessage = {
        id: data.id,
        text: data.message,
        sender: data.sender_id,
        sender_name: data.sender_name,
        created_at: data.created_at,
        is_mine: data.sender_id === user.id,
        is_read: false
      }
      setMessages(prev => [...prev, newMessage])
      
      // Update session last_message
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return { ...s, last_message: newMessage }
        }
        return s
      }))
    }
    
    setWs(socket)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || !activeSession) return

    const text = inputText.trim()
    setInputText('')

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: text }))
    } else {
      // Fallback to REST
      try {
        const { data } = await chatAPI.sendMessage(activeSession.id, { text })
        setMessages(prev => [...prev, data])
      } catch (err) {
        console.error('Failed to send message', err)
      }
    }
  }

  const getOtherUser = (session) => {
    if (!session) return { first_name: '', last_name: '' }
    // Direct chat sessions: agent field may be a profile object with nested .user
    // or a plain user-like object without .user
    const client = session.client || {}
    const agent = session.agent || {}
    
    // If the current user is the "client" (buyer), the other party is "agent"
    if (client.id === user?.id) {
      // agent could be a profile with .user, or a fallback dict with .user inside
      return agent.user || agent
    }
    // Otherwise we are the "agent" side, other party is the client
    return client
  }

  const handleCompleteDeal = async () => {
    if (!window.confirm("Are you sure you want to mark this deal as completed? Funds will be released if both parties accept.")) return
    
    try {
      const { data } = await agentsAPI.completeDeal(activeSession.connection)
      // Refresh session
      const updatedSessions = await chatAPI.sessions()
      setSessions(updatedSessions.data)
      const current = updatedSessions.data.find(s => s.id === activeSession.id)
      setActiveSession(current)
      alert(data.message)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete deal.')
    }
  }

  const handleReviewSubmit = async (targetId, reviewData) => {
    await agentsAPI.rate(targetId, reviewData)
    // Refresh to get updated ratings
    const updatedSessions = await chatAPI.sessions()
    setSessions(updatedSessions.data)
    const current = updatedSessions.data.find(s => s.id === activeSession.id)
    setActiveSession(current)
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-surface-dim text-center px-6">
        <MessageSquare className="w-16 h-16 text-text-muted/30 mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in to view messages</h2>
        <p className="text-sm text-text-muted max-w-md">You need to be logged in to access your chat conversations.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-surface-dim">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-text-muted">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-dim flex">
      {/* Sidebar - Sessions */}
      <div className={`w-full md:w-80 lg:w-96 bg-surface border-r border-border-light flex flex-col ${activeSession ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border-light">
          <h2 className="text-xl font-bold text-text-primary">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active chats yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {sessions.map(session => {
                const otherUser = getOtherUser(session)
                const isActive = activeSession?.id === session.id
                
                return (
                  <button
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className={`w-full text-left p-4 hover:bg-surface-muted transition-colors flex items-start gap-3 ${isActive ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg">
                      {otherUser.first_name?.[0]}{otherUser.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text-primary truncate">
                          {otherUser.first_name} {otherUser.last_name}
                        </h4>
                        {session.last_message && (
                          <span className="text-[10px] text-text-muted flex-shrink-0">
                            {formatDistanceToNow(new Date(session.last_message.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate ${session.unread_count > 0 ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
                        {session.last_message ? session.last_message.text : 'Start a conversation'}
                      </p>
                    </div>
                    {session.unread_count > 0 && (
                      <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {session.unread_count}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-surface-dim ${!activeSession ? 'hidden md:flex' : 'flex'}`}>
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-surface border-b border-border-light flex items-center px-4 gap-4 sticky top-0 z-10 shadow-sm">
              <button 
                onClick={() => setActiveSession(null)}
                className="md:hidden p-2 rounded-lg hover:bg-surface-muted transition-colors text-text-secondary"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {getOtherUser(activeSession).first_name?.[0]}{getOtherUser(activeSession).last_name?.[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                  {getOtherUser(activeSession).first_name} {getOtherUser(activeSession).last_name}
                  {activeSession.connection_status === 'closed' && (
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] uppercase font-bold border border-success/20">
                      Completed
                    </span>
                  )}
                </h3>
              </div>

              {/* Escrow Actions */}
              {activeSession.connection_status !== 'closed' && (
                <button
                  onClick={handleCompleteDeal}
                  disabled={(user.id === activeSession.client.id && activeSession.connection_buyer_completed) || 
                            (user.id !== activeSession.client.id && activeSession.connection_agent_completed)}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-primary-dark transition-colors disabled:bg-success disabled:text-white"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {(user.id === activeSession.client.id && activeSession.connection_buyer_completed) || 
                   (user.id !== activeSession.client.id && activeSession.connection_agent_completed)
                    ? 'Waiting for other party...'
                    : 'Complete Deal'}
                </button>
              )}
            </div>

            {/* If Deal is closed, show Review Section for Buyer */}
            {activeSession.connection_status === 'closed' && user.id === activeSession.client.id && (
              <div className="px-4 pt-4">
                <ReviewSection
                  targetId={activeSession.agent.id}
                  targetType="agent"
                  onSubmit={handleReviewSubmit}
                  averageRating={activeSession.agent.average_rating}
                  totalReviews={activeSession.agent.total_reviews}
                />
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted">
                  <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 opacity-50" />
                  </div>
                  <p>Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const showTime = idx === 0 || new Date(msg.created_at) - new Date(messages[idx-1].created_at) > 5 * 60000;
                  return (
                    <div key={msg.id} className={`flex flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}>
                      {showTime && (
                        <div className="text-[11px] text-text-muted my-2 px-2 py-1 bg-black/5 rounded-full self-center">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      <div 
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          msg.is_mine 
                            ? 'bg-primary text-white rounded-tr-sm' 
                            : 'bg-white border border-border-light text-text-primary rounded-tl-sm shadow-sm'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${msg.is_mine ? 'text-white/70' : 'text-text-muted'}`}>
                          <span className="text-[10px]">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.is_mine && (
                            msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface border-t border-border-light">
              <form onSubmit={sendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted bg-surface/50">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-text-primary mb-2">Your Messages</h3>
            <p>Select a conversation from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
