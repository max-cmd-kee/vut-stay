import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Award,
  ChevronDown,
  Building
} from 'lucide-react'
import { accommodationService } from '../services/accommodationService'
import { statsService } from '../services/statsService'
import AccommodationCard from '../components/AccommodationCard'
import { AccommodationCardSkeleton } from '../components/SkeletonLoader'

export default function Home() {
  const navigate = useNavigate()
  const [featuredAccommodations, setFeaturedAccommodations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [fundingFilter, setFundingFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('all')
  const [openFaqIdx, setOpenFaqIdx] = useState(null)

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [accs, st] = await Promise.all([
          accommodationService.getAll(),
          statsService.getDashboardStats()
        ])
        setFeaturedAccommodations(accs)
        setStats(st)
      } catch (err) {
        console.error('Error loading home data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadHomeData()
  }, [])

  const handleHeroSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (fundingFilter !== 'all') params.set('funding', fundingFilter)
    navigate(`/explore?${params.toString()}`)
  }

  // Filter featured cards by tab
  const displayedAccommodations = featuredAccommodations
    .filter((acc) => {
      if (activeTab === 'nsfas') return acc.supports_nsfas
      if (activeTab === 'near') return acc.distance_km <= 1.0
      if (activeTab === 'single') return acc.single_rooms_count > 0
      return true
    })
    .slice(0, 6)

  const faqs = [
    {
      q: 'How does NSFAS accommodation funding work at VUT?',
      a: 'If you are funded by NSFAS, you are eligible for the DHET private accommodation allowance. When you book an accredited residence through this portal, there are no upfront deposit requirements. Your monthly rental is settled directly through the NSFAS disbursement framework.'
    },
    {
      q: 'How long does room approval and allocation take?',
      a: 'Applications submitted through the modern portal undergo automated eligibility verification. Administrative allocations are typically finalized within 24–48 hours, at which point you receive an official Room Assignment Voucher in your Student Hub.'
    },
    {
      q: 'Are all listed residences accredited by Vaal University of Technology?',
      a: 'Yes. Every residence featured on VUT Homes meets strict health, safety, biometric security, and minimum spatial standards mandated by the Department of Higher Education and Training (DHET).'
    },
    {
      q: 'Can private bursary or self-paying students also apply?',
      a: 'Absolutely! Our portal supports students funded by private corporate bursaries (e.g. Sasol, Eskom, Funza Lushaka) as well as self-paying students with instant online booking requests.'
    }
  ]

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-overlay" />
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge animate-fade-in">
              <span className="badge badge-accent">
                <Sparkles size={13} /> Official VUT Student Housing Portal
              </span>
            </div>

            <h1 className="hero-title animate-fade-in">
              Find & Secure Your Ideal <span className="text-highlight">Student Home</span> Near Campus
            </h1>

            <p className="hero-subtitle animate-fade-in">
              Discover 100% accredited, NSFAS-compliant student residences in Vanderbijlpark. Safe living, uncapped Wi-Fi, and quick access to VUT lecture halls.
            </p>

            {/* Quick Hero Search Box */}
            <form onSubmit={handleHeroSearch} className="hero-search-card card card-glass animate-fade-in">
              <div className="hero-search-field">
                <Search size={20} className="hero-search-icon" />
                <input
                  type="text"
                  placeholder="Search by area (e.g., SE7, CW2, Vanderbijlpark, Campus)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hero-search-input"
                />
              </div>

              <div className="hero-search-divider" />

              <div className="hero-search-select-wrap">
                <select
                  value={fundingFilter}
                  onChange={(e) => setFundingFilter(e.target.value)}
                  className="hero-search-select"
                >
                  <option value="all">All Funding Types</option>
                  <option value="nsfas">NSFAS Accredited Only</option>
                  <option value="bursary">Private Bursary</option>
                  <option value="self">Self-Paying</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary hero-search-btn">
                <span>Explore Housing</span>
                <ChevronRight size={18} />
              </button>
            </form>

            {/* Quick Tags */}
            <div className="hero-quick-tags">
              <span className="tag-label">Popular Searches:</span>
              <button onClick={() => navigate('/explore?funding=nsfas')} className="tag-btn">
                NSFAS Approved
              </button>
              <button onClick={() => navigate('/explore?maxDistance=1')} className="tag-btn">
                &lt; 1km to VUT
              </button>
              <button onClick={() => navigate('/explore?roomType=Single')} className="tag-btn">
                Single Rooms
              </button>
              <button onClick={() => navigate('/explore?q=CW')} className="tag-btn">
                Vanderbijlpark CW
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* METRIC STATS BANNER */}
      <section className="stats-counter-banner">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats ? `${stats.total_capacity}+` : '1,200+'}</div>
              <div className="stat-title">Accredited Student Beds</div>
              <div className="stat-sub">Across Vanderbijlpark & Vaal</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-title">NSFAS & DHET Compliant</div>
              <div className="stat-sub">Direct allowance integration</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-title">Guarded & Biometric Security</div>
              <div className="stat-sub">Safe student environments</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">&lt; 15 min</div>
              <div className="stat-title">Average Walk to Campus</div>
              <div className="stat-sub">Or free shuttle service</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED RESIDENCES SECTION */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header-flex">
            <div className="section-title text-left" style={{ marginBottom: 0 }}>
              <span className="badge badge-primary">Accredited Housing</span>
              <h2>Featured Student Residences</h2>
              <p>Top-rated student accommodation near Vaal University of Technology.</p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="featured-tabs">
              <button
                className={`tab-pill ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Top Residences
              </button>
              <button
                className={`tab-pill ${activeTab === 'nsfas' ? 'active' : ''}`}
                onClick={() => setActiveTab('nsfas')}
              >
                100% NSFAS
              </button>
              <button
                className={`tab-pill ${activeTab === 'near' ? 'active' : ''}`}
                onClick={() => setActiveTab('near')}
              >
                Closest to Campus (&lt;1km)
              </button>
              <button
                className={`tab-pill ${activeTab === 'single' ? 'active' : ''}`}
                onClick={() => setActiveTab('single')}
              >
                Single Rooms
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="featured-grid" style={{ marginTop: 32 }}>
            {loading ? (
              <div className="grid-3">
                <AccommodationCardSkeleton />
                <AccommodationCardSkeleton />
                <AccommodationCardSkeleton />
              </div>
            ) : displayedAccommodations.length === 0 ? (
              <div className="text-center" style={{ padding: '40px 0' }}>
                <p>No accommodations match this tab filter.</p>
              </div>
            ) : (
              <div className="grid-3">
                {displayedAccommodations.map((acc) => (
                  <AccommodationCard key={acc.id} accommodation={acc} />
                ))}
              </div>
            )}
          </div>

          <div className="text-center" style={{ marginTop: 44 }}>
            <Link to="/explore" className="btn btn-primary btn-lg">
              <span>View All {featuredAccommodations.length} Residences</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3-STEP STUDENT HOW-IT-WORKS GUIDE */}
      <section className="section how-it-works-section">
        <div className="container">
          <div className="section-title">
            <span className="badge badge-accent">Seamless Process</span>
            <h2>How It Works for Students</h2>
            <p>From browsing to check-in keys, booking student accommodation is fast and easy.</p>
          </div>

          <div className="steps-grid grid-3">
            <div className="step-card card card-hover">
              <div className="step-badge">1</div>
              <div className="step-icon-wrap">
                <Search size={28} className="text-accent" />
              </div>
              <h3>1. Discover & Compare</h3>
              <p>
                Browse verified residences in Vanderbijlpark. Filter by NSFAS eligibility, distance to campus faculties, room types, and amenities.
              </p>
            </div>

            <div className="step-card card card-hover">
              <div className="step-badge">2</div>
              <div className="step-icon-wrap">
                <Sparkles size={28} className="text-primary" />
              </div>
              <h3>2. Apply in 2 Minutes</h3>
              <p>
                Fill out the streamlined 5-step online booking form with your 9-digit VUT student number, SA ID, and NSFAS reference for instant validation.
              </p>
            </div>

            <div className="step-card card card-hover">
              <div className="step-badge">3</div>
              <div className="step-icon-wrap">
                <CheckCircle2 size={28} className="text-success" />
              </div>
              <h3>3. Get Room & Check In</h3>
              <p>
                Receive an official Booking Reference voucher with your allocated room number. Move in smoothly with zero upfront deposit for NSFAS recipients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NSFAS ACCREDITATION & SAFETY HIGHLIGHT BANNER */}
      <section className="section safety-banner-section">
        <div className="container">
          <div className="safety-banner-card card">
            <div className="safety-banner-grid grid-2">
              <div className="safety-content">
                <span className="badge badge-nsfas">
                  <ShieldCheck size={13} /> NSFAS Accredited Standards
                </span>
                <h2>Zero Deposit. Maximum Student Security.</h2>
                <p>
                  Every accredited accommodation listed on VUT Homes complies with the Department of Higher Education and Training (DHET) gazetted policy on Minimum Norms and Standards for Student Housing.
                </p>

                <div className="safety-points-list">
                  <div className="safety-point">
                    <CheckCircle2 size={20} className="safety-check-icon" />
                    <div>
                      <strong>Direct Allowance Settlement</strong>
                      <p>Rental allowances are disbursed directly without requiring student out-of-pocket deposits.</p>
                    </div>
                  </div>

                  <div className="safety-point">
                    <CheckCircle2 size={20} className="safety-check-icon" />
                    <div>
                      <strong>Biometric & 24/7 Monitored Access</strong>
                      <p>Access control, security patrols, CCTV, and emergency response teams at all accredited sites.</p>
                    </div>
                  </div>

                  <div className="safety-point">
                    <CheckCircle2 size={20} className="safety-check-icon" />
                    <div>
                      <strong>Uncapped Wi-Fi & Dedicated Study Halls</strong>
                      <p>Reliable connectivity for online university portals, VUT e-Learning, and research.</p>
                    </div>
                  </div>
                </div>

                <div className="safety-cta-row">
                  <Link to="/explore?funding=nsfas" className="btn btn-secondary">
                    <span>Browse NSFAS Residences</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/about" className="btn btn-outline">
                    <span>Read Accreditation Standards</span>
                  </Link>
                </div>
              </div>

              <div className="safety-image-col">
                <div className="safety-image-wrap">
                  <img
                    src="/images/main-res.jpg"
                    alt="VUT Accredited Student Residence"
                    className="safety-img"
                  />
                  <div className="safety-img-badge">
                    <Award size={20} />
                    <div>
                      <strong>Official Accreditation</strong>
                      <span>Verified by VUT Student Housing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="section faq-section">
        <div className="container" style={{ maxWidth: 840 }}>
          <div className="section-title">
            <span className="badge badge-accent">Student Help</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about booking housing and NSFAS allowances at VUT.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx
              return (
                <div key={idx} className={`faq-item card ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-q-text">{faq.q}</span>
                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'rotated' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="faq-answer animate-fade-in">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner-inner">
            <div className="cta-content">
              <h2>Are You a Registered Property Landlord?</h2>
              <p>
                List your student residence on the official VUT Housing Portal and connect with thousands of qualified, funded university students.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/landlord" className="btn btn-secondary btn-lg">
                <Building size={18} />
                <span>List Your Residence</span>
              </Link>
              <Link to="/contact" className="btn btn-outline-white btn-lg">
                <span>Contact Housing Office</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Hero Section */
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, #0b3b60 0%, #071e33 60%, #03101d 100%);
          padding: 80px 0 100px;
          color: white;
          overflow: hidden;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: url('/images/vut_back.jpg') center/cover no-repeat;
          opacity: 0.12;
          pointer-events: none;
        }

        .hero-container {
          position: relative;
          z-index: 2;
        }

        .hero-content {
          max-width: 820px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-badge {
          margin-bottom: 18px;
        }

        .hero-title {
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          line-height: 1.15;
          color: white;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }

        .text-highlight {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: #cbd5e1;
          margin-bottom: 36px;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        /* Hero Search Card */
        .hero-search-card {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-radius: var(--radius-xl);
          padding: 10px 14px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
          max-width: 780px;
          margin: 0 auto 24px;
          text-align: left;
        }

        .hero-search-field {
          flex: 1.8;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px;
        }

        .hero-search-icon {
          color: var(--text-muted);
        }

        .hero-search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.95rem;
          width: 100%;
          color: var(--text-main);
        }

        .hero-search-divider {
          width: 1px;
          height: 32px;
          background: var(--border);
          margin: 0 8px;
        }

        .hero-search-select-wrap {
          flex: 1;
        }

        .hero-search-select {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.9rem;
          color: var(--text-main);
          font-weight: 500;
          width: 100%;
          cursor: pointer;
        }

        .hero-search-btn {
          flex-shrink: 0;
          padding: 12px 24px;
          border-radius: var(--radius-lg);
        }

        /* Quick Tags */
        .hero-quick-tags {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.85rem;
        }

        .tag-label {
          color: #94a3b8;
        }

        .tag-btn {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: 0.8rem;
        }

        .tag-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        /* Stats Banner */
        .stats-counter-banner {
          background: white;
          border-bottom: 1px solid var(--border);
          padding: 36px 0;
          margin-top: -24px;
          position: relative;
          z-index: 10;
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          text-align: center;
        }

        .stat-card {
          padding: 8px;
        }

        .stat-number {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1.1;
          margin-bottom: 4px;
        }

        .stat-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .stat-sub {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        /* Featured Section */
        .section-header-flex {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .featured-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card-subtle);
          padding: 4px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
        }

        .tab-pill {
          background: transparent;
          border: none;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-pill.active {
          background: white;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        /* Step Cards */
        .step-card {
          position: relative;
          padding: 36px 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-xl);
          background: var(--bg-card-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .step-card h3 {
          margin-bottom: 12px;
        }

        /* Safety Banner Card */
        .safety-banner-card {
          padding: 48px 40px;
          background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
          border: 1px solid #bfdbfe;
        }

        .safety-content h2 {
          margin: 14px 0 12px;
          font-size: 2rem;
        }

        .safety-points-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin: 28px 0;
        }

        .safety-point {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .safety-check-icon {
          color: var(--success);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .safety-point strong {
          display: block;
          font-size: 0.95rem;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .safety-point p {
          font-size: 0.85rem;
          margin: 0;
        }

        .safety-cta-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .safety-image-col {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .safety-image-wrap {
          position: relative;
          width: 100%;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
        }

        .safety-img {
          width: 100%;
          height: 380px;
          object-fit: cover;
        }

        .safety-img-badge {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          color: white;
          padding: 12px 18px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .safety-img-badge strong {
          display: block;
          font-size: 0.9rem;
        }

        .safety-img-badge span {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        /* FAQ */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          padding: 0;
          overflow: hidden;
        }

        .faq-question-btn {
          width: 100%;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text-main);
          text-align: left;
          cursor: pointer;
        }

        .faq-chevron {
          transition: transform var(--transition-fast);
          color: var(--text-muted);
          flex-shrink: 0;
          margin-left: 12px;
        }

        .faq-chevron.rotated {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 24px 20px;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-muted);
        }

        /* Landlord CTA Banner */
        .cta-banner-section {
          background: linear-gradient(135deg, #0b3b60 0%, #071e33 100%);
          color: white;
          padding: 60px 0;
        }

        .cta-banner-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 32px;
        }

        .cta-content h2 {
          color: white;
          margin-bottom: 8px;
        }

        .cta-content p {
          color: #cbd5e1;
          max-width: 580px;
          margin: 0;
        }

        .cta-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .btn-outline-white {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .btn-outline-white:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        @media (max-width: 960px) {
          .hero-search-card {
            flex-direction: column;
            padding: 16px;
            gap: 12px;
          }

          .hero-search-divider {
            display: none;
          }

          .hero-search-btn {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .safety-banner-grid {
            grid-template-columns: 1fr;
          }

          .safety-image-col {
            order: -1;
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .featured-tabs {
            width: 100%;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  )
}
