import React, { useState } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2
} from 'lucide-react'
import { useToast } from '../components/Toast'

export default function ContactPage() {
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_number: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      addToast('Please fill out all required fields.', 'error')
      return
    }

    setSubmitted(true)
    addToast('Your message has been dispatched to VUT Housing Services!', 'success')
  }

  return (
    <div className="contact-page">
      {/* Header Banner */}
      <section className="contact-header-banner">
        <div className="container">
          <span className="badge badge-accent">
            <Phone size={13} /> Campus Housing Helpdesk
          </span>
          <h1>Contact VUT Housing Services</h1>
          <p>Get in touch with accommodation officers, emergency coordinators, and student advisors.</p>
        </div>
      </section>

      <div className="container contact-main-content">
        <div className="contact-grid-layout grid-2">
          {/* Contact Details Column */}
          <div className="contact-info-col">
            <div className="info-cards-list">
              <div className="contact-card card">
                <div className="card-icon-wrap primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4>Central Housing Office</h4>
                  <p>15 Andrew Murray St, Vanderbijlpark, S.E 7, 1911</p>
                  <span className="info-sub">Building N, Ground Floor, VUT Campus</span>
                </div>
              </div>

              <div className="contact-card card">
                <div className="card-icon-wrap success">
                  <Phone size={24} />
                </div>
                <div>
                  <h4>Helpline & Emergency</h4>
                  <p>
                    <a href="tel:+27633920801">+27 63 392 0801</a> • <a href="tel:0169509000">016 950 9000</a>
                  </p>
                  <span className="info-sub">Campus Protection: 016 950 9999 (24/7)</span>
                </div>
              </div>

              <div className="contact-card card">
                <div className="card-icon-wrap accent">
                  <Mail size={24} />
                </div>
                <div>
                  <h4>Email Support</h4>
                  <p>
                    <a href="mailto:residences@vut.ac.za">residences@vut.ac.za</a>
                  </p>
                  <span className="info-sub">General: maxfire745@gmail.com</span>
                </div>
              </div>

              <div className="contact-card card">
                <div className="card-icon-wrap warning">
                  <Clock size={24} />
                </div>
                <div>
                  <h4>Desk Operating Hours</h4>
                  <p>Monday – Friday: 08:00 – 16:30</p>
                  <span className="info-sub">Closed on public holidays & weekends</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="contact-form-col card">
            {submitted ? (
              <div className="form-success-state text-center animate-fade-in">
                <div className="success-icon-wrap">
                  <CheckCircle2 size={48} className="text-success" />
                </div>
                <h3>Message Dispatched!</h3>
                <p>
                  Thank you, <strong>{formData.name}</strong>. A student housing officer will reply to {formData.email} within 24 business hours.
                </p>
                <button
                  className="btn btn-outline"
                  style={{ marginTop: 20 }}
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      name: '',
                      email: '',
                      student_number: '',
                      subject: 'General Inquiry',
                      message: ''
                    })
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3>Send an Inquiry</h3>
                <p className="text-muted" style={{ marginBottom: 24 }}>
                  Have questions about NSFAS accreditation, deposits, or room vacancies?
                </p>

                <div className="form-group">
                  <label>
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Naledi Khumalo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. student@vut.ac.za"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Student Number (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 221045892"
                      value={formData.student_number}
                      onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Inquiry Topic</label>
                  <select
                    className="form-select"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="General Inquiry">General Accommodation Inquiry</option>
                    <option value="NSFAS Status">NSFAS Allowance & Accreditation</option>
                    <option value="Room Allocation">Room Allocation Status</option>
                    <option value="Landlord Accreditation">Landlord Property Accreditation</option>
                    <option value="Maintenance">Residence Maintenance or Safety</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Message / Question <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="How can we assist you with your student housing?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: 12 }}>
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contact-page {
          padding-bottom: 80px;
          min-height: 80vh;
        }

        .contact-header-banner {
          background: linear-gradient(180deg, #0b3b60 0%, #071e33 100%);
          color: white;
          padding: 48px 0 54px;
        }

        .contact-header-banner h1 {
          color: white;
          margin: 8px 0;
        }

        .contact-header-banner p {
          color: #cbd5e1;
        }

        .contact-main-content {
          margin-top: -24px;
          position: relative;
          z-index: 10;
        }

        .info-cards-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contact-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 24px;
        }

        .card-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-icon-wrap.primary { background: var(--primary-light); color: var(--primary); }
        .card-icon-wrap.success { background: var(--success-bg); color: var(--success); }
        .card-icon-wrap.accent { background: var(--accent-light); color: var(--accent); }
        .card-icon-wrap.warning { background: var(--warning-bg); color: var(--warning); }

        .contact-card h4 {
          font-size: 1.05rem;
          margin-bottom: 4px;
        }

        .contact-card p {
          font-size: 0.95rem;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .contact-card a {
          color: var(--accent);
          font-weight: 600;
        }

        .info-sub {
          font-size: 0.78rem;
          color: var(--text-light);
        }

        .contact-form-col {
          padding: 36px 32px;
        }

        .contact-form-col h3 {
          margin-bottom: 6px;
        }

        @media (max-width: 960px) {
          .contact-grid-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
