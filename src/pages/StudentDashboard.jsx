import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Building2,
  Bookmark,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  Plus,
  Send,
  Printer
} from 'lucide-react'
import { bookingService } from '../services/bookingService'
import { accommodationService } from '../services/accommodationService'
import { favoritesService } from '../services/favoritesService'
import { studentAuth } from '../services/authService'
import { useToast } from '../components/Toast'
import AccommodationCard from '../components/AccommodationCard'
import EmptyState from '../components/EmptyState'

export default function StudentDashboard() {
  const { addToast } = useToast()
  const currentStudent = studentAuth.getSession() || {}

  const [studentBookings, setStudentBookings] = useState([])
  const [favoriteAccommodations, setFavoriteAccommodations] = useState([])
  const [activeTab, setActiveTab] = useState('applications') // 'applications' | 'wishlist' | 'messages' | 'profile'

  // Inquiry message modal state
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [inquiryText, setInquiryText] = useState('')
  const [inquiryTarget, setInquiryTarget] = useState(null)

  useEffect(() => {
    async function loadStudentData() {
      try {
        const storedStudentNo =
          currentStudent.student_number || localStorage.getItem('vut_active_student_no')
        const bookings = await bookingService.getByStudentNumber(storedStudentNo)
        setStudentBookings(bookings)

        // Load wishlist accommodations
        const favIds = favoritesService.getFavorites()
        const allAccs = await accommodationService.getAll()
        const matchedFavs = allAccs.filter((a) => favIds.includes(String(a.id)))
        setFavoriteAccommodations(matchedFavs)
      } catch (err) {
        console.error('Failed to load student dashboard', err)
      }
    }
    loadStudentData()
  }, [currentStudent.student_number])

  const activeBooking = studentBookings[0] || null

  const handleSendInquiry = (e) => {
    e.preventDefault()
    if (!inquiryText.trim()) return
    addToast('Message sent directly to the accommodation landlord!', 'success')
    setInquiryText('')
    setMessageModalOpen(false)
  }

  const openMessageModal = (booking) => {
    setInquiryTarget(booking)
    setMessageModalOpen(true)
  }

  return (
    <div className="student-dashboard-page">
      {/* Dashboard Top Header */}
      <section className="dashboard-hero-header">
        <div className="container dashboard-hero-flex">
          <div className="student-hero-profile">
            <div className="student-avatar-badge">
              <User size={32} />
            </div>
            <div>
              <span className="badge badge-accent">VUT Student Hub</span>
              <h2>Good day, {currentStudent.name} {currentStudent.surname}</h2>
              <p className="student-meta-line">
                Student No: <strong>{currentStudent.student_number}</strong> • Year {currentStudent.year_of_study} • Funding:{' '}
                <span className="badge badge-nsfas">{currentStudent.bursary_type}</span>
              </p>
            </div>
          </div>

          <div className="hero-cta-box">
            <Link to="/apply" className="btn btn-secondary">
              <Plus size={16} />
              <span>New Housing Application</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Dashboard Navigation Tabs */}
      <div className="container dashboard-main-content">
        <div className="dashboard-nav-tabs">
          <button
            className={`dash-tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <Building2 size={16} />
            <span>My Applications ({studentBookings.length})</span>
          </button>
          <button
            className={`dash-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Bookmark size={16} />
            <span>Saved Wishlist ({favoriteAccommodations.length})</span>
          </button>
          <button
            className={`dash-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} />
            <span>Student Profile</span>
          </button>
        </div>

        {/* TAB 1: APPLICATIONS & TRACKER */}
        {activeTab === 'applications' && (
          <div className="tab-view-content animate-fade-in">
            {studentBookings.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No Housing Applications Yet"
                description="You haven't submitted any accommodation bookings yet. Explore verified residences and submit your application online."
                actionLabel="Explore Residences"
                actionTo="/explore"
              />
            ) : (
              <div className="dashboard-applications-layout">
                {/* Active Application Card */}
                {activeBooking && (
                  <div className="active-application-card card">
                    <div className="app-card-top">
                      <div className="app-ref-box">
                        <span className="app-ref-label">Booking Reference</span>
                        <strong className="app-ref-val">{activeBooking.booking_ref || `#${activeBooking.id}`}</strong>
                      </div>

                      <div className="app-status-badge">
                        {activeBooking.booking_status === 'Approved' && (
                          <span className="badge badge-success">
                            <CheckCircle2 size={13} /> Approved & Room Assigned
                          </span>
                        )}
                        {activeBooking.booking_status === 'Pending' && (
                          <span className="badge badge-warning">
                            <Clock size={13} /> Under Administrative Review
                          </span>
                        )}
                        {activeBooking.booking_status === 'Rejected' && (
                          <span className="badge badge-danger">
                            <AlertCircle size={13} /> Application Declined
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Timeline Stepper */}
                    <div className="app-timeline-box">
                      <div className="timeline-step done">
                        <div className="t-circle"><CheckCircle2 size={16} /></div>
                        <div className="t-info">
                          <strong>1. Submitted</strong>
                          <span>{new Date(activeBooking.registered_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="timeline-connector active" />

                      <div className="timeline-step done">
                        <div className="t-circle"><CheckCircle2 size={16} /></div>
                        <div className="t-info">
                          <strong>2. Documents Checked</strong>
                          <span>NSFAS Verified</span>
                        </div>
                      </div>

                      <div className="timeline-connector active" />

                      <div className={`timeline-step ${activeBooking.booking_status === 'Approved' ? 'done' : 'active'}`}>
                        <div className="t-circle">
                          {activeBooking.booking_status === 'Approved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        </div>
                        <div className="t-info">
                          <strong>3. Room Allocation</strong>
                          <span>{activeBooking.room_number ? `Room ${activeBooking.room_number}` : 'In Progress'}</span>
                        </div>
                      </div>

                      <div className="timeline-connector" />

                      <div className={`timeline-step ${activeBooking.booking_status === 'Approved' ? 'done' : ''}`}>
                        <div className="t-circle">
                          {activeBooking.booking_status === 'Approved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        </div>
                        <div className="t-info">
                          <strong>4. Final Decision</strong>
                          <span>{activeBooking.booking_status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Residence Detail Grid */}
                    <div className="app-detail-grid">
                      <div className="app-field">
                        <span>Residence Name:</span>
                        <strong>{activeBooking.accommodation}</strong>
                      </div>
                      <div className="app-field">
                        <span>Allocated Room:</span>
                        <strong className="text-accent">
                          {activeBooking.room_number || 'Awaiting Allocation'}
                        </strong>
                      </div>
                      <div className="app-field">
                        <span>Funding Scheme:</span>
                        <strong>{activeBooking.bursary_type}</strong>
                      </div>
                      <div className="app-field">
                        <span>Check-in Date:</span>
                        <strong>{activeBooking.check_in || '2026-02-01'}</strong>
                      </div>
                    </div>

                    <div className="app-card-actions">
                      <button onClick={() => openMessageModal(activeBooking)} className="btn btn-outline btn-sm">
                        <MessageSquare size={15} />
                        <span>Message Landlord</span>
                      </button>
                      <button onClick={() => window.print()} className="btn btn-outline btn-sm">
                        <Printer size={15} />
                        <span>Print Voucher</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* All Application History Table */}
                <div className="history-table-section card">
                  <h4>Application History</h4>
                  <div className="table-responsive" style={{ marginTop: 16 }}>
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Residence</th>
                          <th>Room</th>
                          <th>Funding</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentBookings.map((b) => (
                          <tr key={b.id}>
                            <td><strong>{b.booking_ref || `#${b.id}`}</strong></td>
                            <td>{b.accommodation}</td>
                            <td>{b.room_number || 'Unassigned'}</td>
                            <td>{b.bursary_type}</td>
                            <td>
                              <span
                                className={`badge ${
                                  b.booking_status === 'Approved'
                                    ? 'badge-success'
                                    : b.booking_status === 'Rejected'
                                    ? 'badge-danger'
                                    : 'badge-warning'
                                }`}
                              >
                                {b.booking_status}
                              </span>
                            </td>
                            <td>{new Date(b.registered_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="tab-view-content animate-fade-in">
            {favoriteAccommodations.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No Saved Residences"
                description="Click the bookmark icon on any residence to save it to your wishlist and easily apply later."
                actionLabel="Explore Residences"
                actionTo="/explore"
              />
            ) : (
              <div className="grid-3">
                {favoriteAccommodations.map((acc) => (
                  <AccommodationCard key={acc.id} accommodation={acc} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUDENT PROFILE */}
        {activeTab === 'profile' && (
          <div className="tab-view-content animate-fade-in">
            <div className="profile-card card" style={{ maxWidth: 640 }}>
              <h4>Student Information</h4>
              <p className="text-muted" style={{ marginBottom: 20 }}>
                These verified details are synced with VUT Central Records.
              </p>

              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" value={`${currentStudent.name} ${currentStudent.surname}`} readOnly />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>VUT Student Number</label>
                  <input className="form-control" value={currentStudent.student_number} readOnly />
                </div>
                <div className="form-group">
                  <label>Current Year of Study</label>
                  <input className="form-control" value={`Year ${currentStudent.year_of_study}`} readOnly />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input className="form-control" value={currentStudent.email} readOnly />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input className="form-control" value={currentStudent.phone} readOnly />
                </div>
              </div>

              <div className="form-group">
                <label>Bursary / Funding Scheme</label>
                <input className="form-control" value={`${currentStudent.bursary_type} (${currentStudent.nsfas_status})`} readOnly />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Landlord Message Modal */}
      {messageModalOpen && (
        <div className="modal-backdrop" onClick={() => setMessageModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Direct Inquiry to Landlord</h4>
              <button className="btn-ghost" onClick={() => setMessageModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSendInquiry}>
              <div className="modal-body">
                <p style={{ marginBottom: 16 }}>
                  Sending message regarding your application for{' '}
                  <strong>{inquiryTarget?.accommodation}</strong>.
                </p>
                <div className="form-group">
                  <label>Your Message / Question</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Inquiring about move-in keys and parking space..."
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setMessageModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .student-dashboard-page {
          padding-bottom: 80px;
          min-height: 80vh;
        }

        .dashboard-hero-header {
          background: linear-gradient(180deg, #0b3b60 0%, #071e33 100%);
          color: white;
          padding: 44px 0 54px;
        }

        .dashboard-hero-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .student-hero-profile {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .student-avatar-badge {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
        }

        .student-hero-profile h2 {
          color: white;
          margin: 6px 0;
        }

        .student-meta-line {
          color: #cbd5e1;
          font-size: 0.95rem;
        }

        .student-meta-line strong {
          color: white;
        }

        /* Dashboard Nav Tabs */
        .dashboard-main-content {
          margin-top: -24px;
          position: relative;
          z-index: 10;
        }

        .dashboard-nav-tabs {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .dash-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid var(--border);
          padding: 12px 22px;
          border-radius: var(--radius-md);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .dash-tab:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        .dash-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        /* Active Application Card */
        .dashboard-applications-layout {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .active-application-card {
          padding: 28px 32px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
        }

        .app-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          padding-bottom: 18px;
          margin-bottom: 24px;
        }

        .app-ref-label {
          display: block;
          font-size: 0.78rem;
          color: var(--text-light);
          text-transform: uppercase;
          font-weight: 700;
        }

        .app-ref-val {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          color: var(--primary);
        }

        /* Timeline Stepper */
        .app-timeline-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-card-subtle);
          padding: 20px 24px;
          border-radius: var(--radius-lg);
          margin-bottom: 24px;
        }

        .timeline-step {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .t-circle {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: #e2e8f0;
          color: var(--text-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timeline-step.done .t-circle {
          background: var(--success);
          color: white;
        }

        .timeline-step.active .t-circle {
          background: var(--accent);
          color: white;
        }

        .t-info {
          display: flex;
          flex-direction: column;
        }

        .t-info strong {
          font-size: 0.88rem;
          color: var(--text-main);
        }

        .t-info span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .timeline-connector {
          flex-grow: 1;
          height: 3px;
          background: #e2e8f0;
          margin: 0 12px;
        }

        .timeline-connector.active {
          background: var(--success);
        }

        .app-detail-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 20px;
        }

        .app-field span {
          display: block;
          font-size: 0.78rem;
          color: var(--text-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .app-field strong {
          font-size: 1rem;
          color: var(--text-main);
        }

        .app-card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        @media (max-width: 960px) {
          .app-timeline-box {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .timeline-connector {
            display: none;
          }

          .app-detail-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
