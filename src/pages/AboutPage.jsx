import React from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Header Banner */}
      <section className="about-header-banner">
        <div className="container">
          <span className="badge badge-accent">
            <Building2 size={13} /> Official VUT Student Housing
          </span>
          <h1>About VUT Homes</h1>
          <p>
            Providing secure, certified, and conducive living environments for the Vaal University of Technology academic community.
          </p>
        </div>
      </section>

      <div className="container about-main-content">
        {/* Mission & Vision Section */}
        <div className="about-intro-grid grid-2">
          <div className="about-text-block card">
            <span className="badge badge-primary">Our Mission</span>
            <h3>Empowering Student Success Through Safe Housing</h3>
            <p>
              VUT Homes was built to modernize how students find, evaluate, and secure student accommodation at Vaal University of Technology. We bridge the gap between students, NSFAS financial schemes, and registered local landlords.
            </p>
            <p style={{ marginTop: 14 }}>
              Our mandate is to ensure every enrolled student has access to clean, secure accommodation equipped with biometric safety, uncapped connectivity, and dedicated study centers within close walking distance of lecture halls.
            </p>
          </div>

          <div className="about-image-block card" style={{ padding: 0, overflow: 'hidden' }}>
            <img
              src="/images/log4.jpg"
              alt="VUT Student Living"
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 280 }}
            />
          </div>
        </div>

        {/* Pillars / Core Standards */}
        <section className="about-pillars-section" style={{ marginTop: 48 }}>
          <div className="section-title">
            <span className="badge badge-accent">Our Core Standards</span>
            <h2>The VUT Homes Guarantee</h2>
            <p>Every residence on our platform adheres to strict university standards.</p>
          </div>

          <div className="pillars-grid grid-3">
            <div className="pillar-card card card-hover">
              <div className="pillar-icon">
                <ShieldCheck size={28} />
              </div>
              <h4>24/7 Monitored Security</h4>
              <p>
                Biometric access control, on-site security personnel, perimeter electric fencing, and CCTV monitoring are mandatory for all listings.
              </p>
            </div>

            <div className="pillar-card card card-hover">
              <div className="pillar-icon">
                <Sparkles size={28} />
              </div>
              <h4>100% NSFAS Compliance</h4>
              <p>
                Zero upfront deposit fees and direct settlement integration with the NSFAS private accommodation allowance framework.
              </p>
            </div>

            <div className="pillar-card card card-hover">
              <div className="pillar-icon">
                <Users size={28} />
              </div>
              <h4>Conducive Study Spaces</h4>
              <p>
                Uncapped high-speed Wi-Fi, quiet dedicated study halls, and clean shared facilities to ensure uninterrupted academic focus.
              </p>
            </div>
          </div>
        </section>

        {/* Campus Coverage */}
        <div className="campus-coverage-card card" style={{ marginTop: 48 }}>
          <div className="coverage-content">
            <h3>Locations We Cover</h3>
            <p>
              We accredit student accommodation across Vanderbijlpark, Sebokeng, and surrounding Vaal Triangle areas:
            </p>
            <div className="coverage-tags-grid">
              <span className="coverage-tag">📍 VUT Main Campus (On-Campus)</span>
              <span className="coverage-tag">📍 Vanderbijlpark CW Area</span>
              <span className="coverage-tag">📍 Vanderbijlpark SE Area</span>
              <span className="coverage-tag">📍 Vanderbijlpark SW Area</span>
              <span className="coverage-tag">📍 Three Rivers & Vereeniging</span>
              <span className="coverage-tag">📍 Sebokeng Science Campus</span>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="about-bottom-cta card card-glass" style={{ marginTop: 48, textAlign: 'center' }}>
          <h3>Ready to Find Your Student Home?</h3>
          <p style={{ maxWidth: 540, margin: '10px auto 20px' }}>
            Join thousands of VUT students who book verified accommodation effortlessly online.
          </p>
          <Link to="/explore" className="btn btn-primary btn-lg">
            <span>Explore All Residences</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <style>{`
        .about-page {
          padding-bottom: 80px;
          min-height: 80vh;
        }

        .about-header-banner {
          background: linear-gradient(180deg, #0b3b60 0%, #071e33 100%);
          color: white;
          padding: 48px 0 54px;
        }

        .about-header-banner h1 {
          color: white;
          margin: 8px 0;
        }

        .about-header-banner p {
          color: #cbd5e1;
        }

        .about-main-content {
          margin-top: -24px;
          position: relative;
          z-index: 10;
        }

        .about-text-block {
          padding: 36px;
        }

        .about-text-block h3 {
          margin: 12px 0 16px;
        }

        .pillar-card {
          padding: 32px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pillar-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .pillar-card h4 {
          margin-bottom: 10px;
        }

        .campus-coverage-card {
          padding: 36px;
          background: linear-gradient(135deg, #0b3b60 0%, #071e33 100%);
          color: white;
        }

        .campus-coverage-card h3 {
          color: white;
          margin-bottom: 10px;
        }

        .campus-coverage-card p {
          color: #cbd5e1;
          margin-bottom: 20px;
        }

        .coverage-tags-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .coverage-tag {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.88rem;
          font-weight: 600;
          color: white;
        }

        .about-bottom-cta {
          padding: 48px 32px;
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  )
}
