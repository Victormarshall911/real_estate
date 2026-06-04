import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, MapPin, User, LogOut, LayoutDashboard } from 'lucide-react'
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

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass" id="main-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-navy tracking-tight">
                Land<span className="text-primary">Market</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all duration-200"
                id="nav-browse"
              >
                Browse Land
              </Link>
              {isRealtor && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all duration-200"
                  id="nav-dashboard"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-muted transition-all duration-200"
                    id="nav-profile-btn"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {user?.first_name}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-surface rounded-xl shadow-elevated border border-border-light py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-border-light">
                        <p className="text-sm font-medium text-text-primary">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-text-muted">{user?.email}</p>
                      </div>
                      {isRealtor && (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-muted transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
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
                    className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    id="nav-login-btn"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
                    id="nav-list-property-btn"
                  >
                    List Your Property
                  </button>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-muted transition-colors"
              id="nav-mobile-toggle"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-border-light animate-fade-in">
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted"
                >
                  Browse Land
                </Link>
                {isRealtor && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="border-t border-border-light my-2" />
                {isAuthenticated ? (
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false) }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-danger text-left hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setShowLogin(true); setMobileOpen(false) }}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary text-left hover:bg-surface-muted"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setShowRegister(true); setMobileOpen(false) }}
                      className="mx-4 mt-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold text-center hover:bg-primary-dark transition-colors"
                    >
                      List Your Property
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

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
