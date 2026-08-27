import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="vut-footer">
      <div className="container footer-container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Brand & Accreditation Column */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="footer-logo-wrap">
                <Building2 size={24} />
              </div>
              <div className="footer-brand-text">
                <span className="brand-title">VUT HOMES</span>
                <span className="brand-sub">Student Accommodation Portal</span>
              </div>
            </div>

            <p className="footer-description">
              The official centralized platform for Vaal University of Technology students to discover, compare, and secure accredited, NSFAS-compliant off-campus and on-campus housing in Vanderbijlpark.
            </p>

            <div className="accreditation-seal">
              <ShieldCheck size={18} className="seal-icon" />
              <span>Accredited Housing Standards in partnership with DHET & NSFAS</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Student Quick Links</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/explore">Explore Residences</Link>
              </li>
              <li>
                <Link to="/explore?funding=nsfas">NSFAS Accredited Housing</Link>
              </li>
              <li>
                <Link to="/apply">Online Booking Application</Link>
              </li>
              <li>
                <Link to="/dashboard">Student Hub & Status Tracker</Link>
              </li>
              <li>
                <Link to="/about">Accommodation Standards</Link>
              </li>
            </ul>
          </div>

          {/* Landlord & Admin Portal */}
          <div className="footer-col">
            <h4 className="footer-heading">Property Providers</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/landlord">List Your Residence</Link>
              </li>
              <li>
                <Link to="/about">Accreditation Guidelines</Link>
              </li>
              <li>
                <Link to="/admin">Housing Administration Suite</Link>
              </li>
              <li>
                <Link to="/contact">Landlord Support Desk</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Campus Support */}
          <div className="footer-col">
            <h4 className="footer-heading">VUT Housing Office</h4>
            <div className="footer-contact-items">
              <div className="footer-contact-item">
                <MapPin size={16} className="contact-icon" />
                <span>15 Andrew Murray St, Vanderbijlpark, S.E 7, 1911</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={16} className="contact-icon" />
                <span>+27 63 392 0801 / 016 950 9000</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={16} className="contact-icon" />
                <span>residences@vut.ac.za</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Divider & Copyright */}
        <div className="footer-bottom">
          <div className="footer-bottom-flex">
            <p className="copyright-text">
              © {currentYear} Vaal University of Technology. All Rights Reserved. Built to 2026 Commercial Standard.
            </p>
            <div className="footer-legal-links">
              <Link to="/about">Privacy Policy</Link>
              <span className="dot">•</span>
              <Link to="/about">Terms of Accommodation</Link>
              <span className="dot">•</span>
              <Link to="/contact">Emergency Contacts</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .vut-footer {
          background: #071e33;
          color: #94a3b8;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 64px;
          padding-bottom: 32px;
          margin-top: auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.3fr;
          gap: 40px;
          margin-bottom: 48px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .footer-logo-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .footer-brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.1rem;
          color: white;
          letter-spacing: -0.01em;
        }

        .brand-sub {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .footer-description {
          font-size: 0.88rem;
          line-height: 1.6;
          margin-bottom: 20px;
          color: #cbd5e1;
        }

        .accreditation-seal {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(2, 132, 199, 0.12);
          border: 1px solid rgba(2, 132, 199, 0.25);
          padding: 8px 14px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          color: #38bdf8;
          font-weight: 600;
        }

        .footer-heading {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links-list a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.88rem;
          transition: all var(--transition-fast);
        }

        .footer-links-list a:hover {
          color: white;
          padding-left: 4px;
        }

        .footer-contact-items {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.85rem;
          line-height: 1.4;
          color: #cbd5e1;
        }

        .contact-icon {
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 24px;
        }

        .footer-bottom-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.82rem;
        }

        .footer-legal-links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-legal-links a {
          color: #94a3b8;
          text-decoration: none;
        }

        .footer-legal-links a:hover {
          color: white;
        }

        .dot {
          color: #475569;
        }

        @media (max-width: 960px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .brand-col {
            grid-column: span 2;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .brand-col {
            grid-column: span 1;
          }
          .footer-bottom-flex {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  )
}
