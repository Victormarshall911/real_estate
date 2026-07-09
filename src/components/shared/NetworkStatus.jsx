import { useState, useEffect } from 'react'
import { WifiOff, Wifi, AlertCircle } from 'lucide-react'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowRestored(true)
      const timer = setTimeout(() => {
        setShowRestored(false)
      }, 4000)
      return () => clearTimeout(timer)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showRestored) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {!isOnline && (
        <div className="network-banner-enter pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-danger text-white shadow-elevated border border-white/20 backdrop-blur-md max-w-sm">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">You are currently offline</h4>
            <p className="text-xs text-white/80 leading-snug mt-0.5">
              Check your internet connection. We will retry requests automatically.
            </p>
          </div>
        </div>
      )}

      {isOnline && showRestored && (
        <div className="network-banner-enter pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white shadow-elevated border border-white/20 backdrop-blur-md max-w-sm">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">Back Online!</h4>
            <p className="text-xs text-white/80 leading-snug mt-0.5">
              Your connection has been restored.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
