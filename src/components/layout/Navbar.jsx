import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, MapPin, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import LoginModal from '../auth/LoginModal'
import RegisterModal from '../auth/RegisterModal'

export default function Navbar() {
  const { user, isAuthenticated, isRealtor, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass" id="main-navbar">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group" id="nav-logo">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <MapPin className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-navy tracking-tight">
                Land<span className="text-primary">Market</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/'
                    ? 'text-primary bg-primary/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                }`}
                id="nav-browse"
              >
                Browse Land
              </Link>
              <Link
                to="/agents"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/agents'
                    ? 'text-primary bg-primary/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                }`}
              >
                Hire an Agent
              </Link>
              {isRealtor && (
                <Link
                  to="/pricing"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/pricing'
                      ? 'text-primary bg-primary/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                  }`}
                >
                  Pricing
                </Link>
              )}
              {isRealtor && (
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/dashboard'
                      ? 'text-primary bg-primary/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                  }`}
                  id="nav-dashboard"
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-2.5">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-muted transition-colors duration-200"
                    id="nav-profile-btn"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-text-primary max-w-[120px] truncate">
                      {user?.first_name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-elevated border border-border py-1.5 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-border-light mb-1">
                        <p className="text-sm font-semibold text-text-primary truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-text-muted truncate mt-0.5">{user?.email}</p>
                      </div>
                      {isRealtor && (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-muted transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                        id="nav-logout-btn"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors duration-200"
                    id="nav-login-btn"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97]"
                    id="nav-list-property-btn"
                  >
                    List Your Property
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -mr-1 rounded-lg hover:bg-surface-muted transition-colors"
              id="nav-mobile-toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-text-primary" /> : <Menu className="w-5 h-5 text-text-primary" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border-light bg-surface/95 backdrop-blur-md animate-fade-in">
            <div className="max-w-7xl mx-auto px-5 py-3 flex flex-col gap-1">
              <Link
                to="/"
                className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Browse Land
              </Link>
              <Link
                to="/agents"
                className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors"
              >
                Hire an Agent
              </Link>
              {isRealtor && (
                <Link
                  to="/pricing"
                  className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors"
                >
                  Pricing
                </Link>
              )}
              {isRealtor && (
                <Link
                  to="/dashboard"
                  className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors"
                >
                  Dashboard
                </Link>
              )}

              <div className="border-t border-border-light my-1.5" />

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-text-primary">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-text-muted">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-danger text-left hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary text-left hover:bg-surface-muted transition-colors"
                  >
                    Sign In
                  </button>
                  <div className="px-4 pt-1 pb-2">
                    <button
                      onClick={() => setShowRegister(true)}
                      className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold text-center hover:bg-primary-dark transition-colors"
                    >
                      List Your Property
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer so content isn't hidden behind fixed navbar */}
      <div className="h-[64px]" aria-hidden="true" />

      {/* Auth Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true) }}
        />
      )}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true) }}
        />
      )}
    </>
  )
}
