import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2, Search, Bookmark, User, Menu, X,
  Sparkles, Home, PhoneCall, LogOut, ChevronDown, UserCircle2
} from 'lucide-react'
import { favoritesService } from '../services/favoritesService'
import { studentAuth } from '../services/authService'

export default function Navbar() {
  const [navOpen, setNavOpen]     = useState(false)
  const [savedCount, setSavedCount] = useState(favoritesService.getFavorites().length)
  const [student, setStudent]     = useState(studentAuth.getSession())
  const [dropOpen, setDropOpen]   = useState(false)
  const dropRef                   = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()

  // Listen for auth changes and favorites updates
  useEffect(() => {
    function syncAuth()  { setStudent(studentAuth.getSession()) }
    function syncFavs()  { setSavedCount(favoritesService.getFavorites().length) }

    window.addEventListener('vut_auth_changed',      syncAuth)
    window.addEventListener('vut_favorites_updated', syncFavs)
    return () => {
      window.removeEventListener('vut_auth_changed',      syncAuth)
      window.removeEventListener('vut_favorites_updated', syncFavs)
    }
  }, [])

  // Close mobile nav on route change
  useEffect(() => { setNavOpen(false); setDropOpen(false) }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  function handleLogout() {
    studentAuth.logout()
    setStudent(null)
    setDropOpen(false)
    navigate('/')
  }

  const displayName = student ? `${student.name}` : null

  return (
    <header className="site-header-modern">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="VUT Homes Home">
          <div className="logo-badge">
            <Building2 size={24} className="logo-icon" />
          </div>
          <div className="logo-text">
            <span className="logo-title">VUT HOMES</span>
            <span className="logo-sub">STUDENT ACCOMMODATION</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Home size={16} /><span>Home</span>
          </Link>
          <Link to="/explore" className={`nav-item ${isActive('/explore') ? 'active' : ''}`}>
            <Search size={16} /><span>Explore</span>
          </Link>
          <Link to="/about" className={`nav-item ${isActive('/about') ? 'active' : ''}`}>
            <span>About</span>
          </Link>
          <Link to="/contact" className={`nav-item ${isActive('/contact') ? 'active' : ''}`}>
            <PhoneCall size={16} /><span>Contact</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Saved wishlist — only shown when logged in */}
          {student && (
            <Link to="/dashboard" className="saved-button" title="View saved residences">
              <Bookmark size={18} />
              {savedCount > 0 && <span className="saved-badge">{savedCount}</span>}
            </Link>
          )}

          {/* Auth section */}
          {student ? (
            /* Logged-in student dropdown */
            <div className="user-dropdown" ref={dropRef}>
              <button
                className="user-pill"
                onClick={() => setDropOpen(!dropOpen)}
                aria-expanded={dropOpen}
              >
                <UserCircle2 size={20} />
                <span className="user-pill-name">{displayName}</span>
                <ChevronDown size={14} className={`chevron ${dropOpen ? 'open' : ''}`} />
              </button>

              {dropOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <p className="user-dropdown-name">{student.name} {student.surname}</p>
                    <p className="user-dropdown-meta">{student.student_number} · {student.bursary_type}</p>
                  </div>
                  <Link to="/dashboard" className="user-dropdown-item">
                    <User size={15} /> My Dashboard
                  </Link>
                  <Link to="/apply" className="user-dropdown-item">
                    <Sparkles size={15} /> Apply for Room
                  </Link>
                  <button className="user-dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest: show login + register */
            <div className="guest-actions">
              <Link to="/student/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/apply" className="btn btn-primary btn-sm cta-btn">
                <Sparkles size={15} /><span>Book a Room</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setNavOpen(!navOpen)}
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
          >
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {navOpen && (
        <div className="mobile-drawer animate-slide-down">
          <div className="mobile-nav-links">
            <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}><Home size={18} /><span>Home</span></Link>
            <Link to="/explore" className={`mobile-nav-link ${isActive('/explore') ? 'active' : ''}`}><Search size={18} /><span>Explore Residences</span></Link>
            <Link to="/about" className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}><span>About VUT Homes</span></Link>
            <Link to="/contact" className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`}><PhoneCall size={18} /><span>Contact & Support</span></Link>

            {student ? (
              <>
                <Link to="/dashboard" className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}><User size={18} /><span>My Dashboard</span></Link>
                <Link to="/apply" className={`mobile-nav-link ${isActive('/apply') ? 'active' : ''}`}><Sparkles size={18} /><span>Apply for a Room</span></Link>
                <button className="mobile-nav-link mobile-logout-btn" onClick={handleLogout}><LogOut size={18} /><span>Sign Out ({student.name})</span></button>
              </>
            ) : (
              <div className="mobile-drawer-cta">
                <Link to="/student/login" className="btn btn-outline w-full" style={{ marginBottom: '10px' }}>Sign In</Link>
                <Link to="/apply" className="btn btn-primary w-full"><Sparkles size={16} /><span>Book a Room</span></Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .site-header-modern {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          transition: all var(--transition-normal);
        }
        .nav-container {
          display: flex; align-items: center; justify-content: space-between;
          height: var(--header-height); gap: 20px;
        }
        .brand-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .logo-badge {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;
          color: white; box-shadow: 0 4px 10px rgba(11,59,96,0.25);
        }
        .logo-text { display: flex; flex-direction: column; }
        .logo-title { font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; letter-spacing: -0.02em; color: var(--primary); line-height: 1.1; }
        .logo-sub { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); text-transform: uppercase; }
        .desktop-nav { display: flex; align-items: center; gap: 6px; }
        .nav-item {
          display: flex; align-items: center; gap: 8px; padding: 8px 14px;
          border-radius: var(--radius-full); font-family: var(--font-heading);
          font-size: 0.9rem; font-weight: 600; color: var(--text-muted); text-decoration: none;
          transition: all var(--transition-fast);
        }
        .nav-item:hover { color: var(--primary); background: var(--primary-light); }
        .nav-item.active { color: var(--primary); background: var(--primary-light); font-weight: 700; }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .saved-button {
          position: relative; width: 40px; height: 40px; border-radius: var(--radius-full);
          border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
          color: var(--text-main); background: var(--bg-card); transition: all var(--transition-fast);
          text-decoration: none;
        }
        .saved-button:hover { background: var(--bg-card-subtle); border-color: var(--accent); color: var(--accent); }
        .saved-badge {
          position: absolute; top: -4px; right: -4px; background: var(--secondary);
          color: white; font-size: 0.7rem; font-weight: 800; min-width: 18px; height: 18px;
          border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; padding: 0 4px;
        }
        .guest-actions { display: flex; align-items: center; gap: 8px; }
        .btn-outline {
          border: 1.5px solid var(--primary); color: var(--primary); background: transparent;
          padding: 7px 16px; border-radius: var(--radius-full); font-weight: 700; font-size: 0.88rem;
          text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center;
        }
        .btn-outline:hover { background: var(--primary); color: white; }
        .user-dropdown { position: relative; }
        .user-pill {
          display: flex; align-items: center; gap: 8px; padding: 7px 14px;
          background: var(--primary-light); border: 1.5px solid rgba(11,59,96,0.12);
          border-radius: var(--radius-full); cursor: pointer; color: var(--primary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.9rem;
          transition: all 0.2s;
        }
        .user-pill:hover { background: rgba(11,59,96,0.1); }
        .user-pill-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chevron { transition: transform 0.2s; }
        .chevron.open { transform: rotate(180deg); }
        .user-dropdown-menu {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg); min-width: 220px; z-index: 200; overflow: hidden;
        }
        .user-dropdown-header {
          padding: 14px 16px 12px; border-bottom: 1px solid var(--border);
          background: var(--bg-card-subtle);
        }
        .user-dropdown-name { font-weight: 800; font-size: 0.95rem; color: var(--primary); margin: 0; }
        .user-dropdown-meta { font-size: 0.78rem; color: var(--text-muted); margin: 3px 0 0; }
        .user-dropdown-item {
          display: flex; align-items: center; gap: 10px; padding: 11px 16px;
          font-size: 0.9rem; font-weight: 600; color: var(--text-main);
          text-decoration: none; background: none; border: none; width: 100%;
          cursor: pointer; transition: background 0.15s;
        }
        .user-dropdown-item:hover { background: var(--bg-card-subtle); }
        .logout-item { color: #dc2626; }
        .logout-item:hover { background: #fef2f2; }
        .mobile-menu-btn { display: none; background: transparent; border: none; color: var(--text-main); cursor: pointer; padding: 6px; }
        .mobile-drawer { display: none; background: white; border-bottom: 1px solid var(--border); padding: 20px 24px 28px; box-shadow: var(--shadow-lg); }
        .mobile-nav-links { display: flex; flex-direction: column; gap: 8px; }
        .mobile-nav-link {
          display: flex; align-items: center; gap: 12px; padding: 12px 16px;
          border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 600;
          color: var(--text-main); text-decoration: none; background: var(--bg-main);
          border: none; cursor: pointer; width: 100%;
        }
        .mobile-nav-link.active { background: var(--primary-light); color: var(--primary); }
        .mobile-logout-btn { color: #dc2626; }
        .mobile-logout-btn:hover { background: #fef2f2; }
        .mobile-drawer-cta { margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
        .cta-btn { gap: 6px; }
        .w-full { width: 100%; }
        @media (max-width: 960px) {
          .desktop-nav, .guest-actions, .user-dropdown, .saved-button { display: none; }
          .mobile-menu-btn { display: flex; }
          .mobile-drawer { display: block; }
        }
      `}</style>
    </header>
  )
}
