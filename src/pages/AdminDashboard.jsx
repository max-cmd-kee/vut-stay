import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Building2,
  Users,
  Bed,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  KeyRound,
  BarChart3,
  GraduationCap,
  Landmark,
  ScrollText,
  UserCog
} from 'lucide-react'
import { bookingService } from '../services/bookingService'
import { accommodationService } from '../services/accommodationService'
import { statsService } from '../services/statsService'
import { auditService } from '../services/auditService'
import { adminAuth } from '../services/authService'
import supabase from '../supabaseClient'
import { useToast } from '../components/Toast'

export default function AdminDashboard() {
  const { addToast } = useToast()
  const navigate = useNavigate()
  const currentAdmin = adminAuth.getSession()

  const [activeTab, setActiveTab] = useState('bookings') // bookings|accommodations|students|landlords|audit|profile|analytics
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [studentAccounts, setStudentAccounts] = useState([])
  const [landlords, setLandlords] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  // Profile management state
  const [profileData, setProfileData] = useState({
    username: currentAdmin?.username || '',
    email: currentAdmin?.email || ''
  })
  const [pwdData, setPwdData] = useState({ next: '', confirm: '' })

  // Filter & Search states
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all')
  const [bookingSearch, setBookingSearch] = useState('')
  const [accSearch, setAccSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')

  // Modal States
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [roomNumberInput, setRoomNumberInput] = useState('')

  const [newAccModalOpen, setNewAccModalOpen] = useState(false)
  const [newAccData, setNewAccData] = useState({
    acc_name: '',
    acc_location: '',
    distance_km: '1.0',
    price_per_month: '',
    acc_capacity: '50',
    house_number: '',
    street_name: '',
    suburb: '',
    city: 'Vanderbijlpark',
    postal_code: '1911',
    supports_nsfas: true,
    supports_other: true,
    supports_self: true,
    acc_description: '',
    fname: 'Owner',
    lname: 'Landlord',
    phone: '0169509000',
    email: 'residences@vut.ac.za'
  })

  const loadAllAdminData = useCallback(async () => {
    try {
      const [s, b, a, studentsRes, landlordsRes] = await Promise.all([
        statsService.getDashboardStats(),
        bookingService.getAll(),
        accommodationService.getAll(),
        supabase.from('students').select('*').order('created_at', { ascending: false }),
        supabase.from('landlords').select('*').order('created_at', { ascending: true })
      ])
      setStats(s)
      setBookings(b)
      setAccommodations(a)
      if (!studentsRes.error) setStudentAccounts(studentsRes.data || [])
      else console.error(studentsRes.error)
      if (!landlordsRes.error) setLandlords(landlordsRes.data || [])
      else console.error(landlordsRes.error)

      try { setAuditLogs(await auditService.getAll(200)) } catch (e) { console.error(e) }
    } catch (err) {
      console.error(err)
      addToast('Failed to load administrative records', 'error')
    }
  }, [addToast])

  useEffect(() => {
    loadAllAdminData()
  }, [loadAllAdminData])

  // Filtered Bookings
  const filteredBookings = bookings.filter((item) => {
    if (bookingFilterStatus !== 'all') {
      if (item.booking_status.toLowerCase() !== bookingFilterStatus.toLowerCase()) return false
    }
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase().trim()
      const name = `${item.name} ${item.surname}`.toLowerCase()
      const sNo = item.student_number
      const ref = (item.booking_ref || '').toLowerCase()
      if (!name.includes(q) && !sNo.includes(q) && !ref.includes(q)) return false
    }
    return true
  })

  // Filtered Accommodations
  const filteredAccommodations = accommodations.filter((item) => {
    if (accSearch.trim()) {
      const q = accSearch.toLowerCase().trim()
      return item.acc_name.toLowerCase().includes(q) || item.acc_location.toLowerCase().includes(q)
    }
    return true
  })

  // Approve & Assign Room Modal Trigger
  const openAssignModal = (booking) => {
    setSelectedBooking(booking)
    setRoomNumberInput(booking.room_number || '')
    setAssignModalOpen(true)
  }

  const handleConfirmAssignment = async (e) => {
    e.preventDefault()
    if (!selectedBooking) return

    try {
      await bookingService.updateStatus(selectedBooking.id, {
        status: 'Approved',
        roomNumber: roomNumberInput.trim()
      })
      await auditService.log(
        currentAdmin,
        'APPROVE_BOOKING',
        'booking',
        selectedBooking.id,
        `${selectedBooking.name} ${selectedBooking.surname} (${selectedBooking.student_number})`,
        `Approved & allocated to Room ${roomNumberInput.trim()} at ${selectedBooking.accommodation}`
      )
      addToast(`Booking #${selectedBooking.id} approved and allocated to Room ${roomNumberInput}!`, 'success')
      setAssignModalOpen(false)
      loadAllAdminData()
    } catch (err) {
      addToast(err.message || 'Failed to update booking status', 'error')
    }
  }

  const handleRejectBooking = async (b) => {
    if (!window.confirm('Are you sure you want to decline this booking application?')) return
    try {
      await bookingService.updateStatus(b.id, { status: 'Rejected' })
      await auditService.log(
        currentAdmin,
        'REJECT_BOOKING',
        'booking',
        b.id,
        `${b.name} ${b.surname} (${b.student_number})`,
        `Rejected application for ${b.accommodation}`
      )
      addToast('Application marked as Rejected.', 'info')
      loadAllAdminData()
    } catch (err) {
      addToast(err.message || 'Action failed', 'error')
    }
  }

  const handleDeleteAccommodation = async (acc) => {
    if (!window.confirm(`Delete residence "${acc.acc_name}"? This action cannot be undone.`)) return
    try {
      await accommodationService.delete(acc.id)
      await auditService.log(
        currentAdmin,
        'DELETE_ACCOMMODATION',
        'accommodation',
        acc.id,
        acc.acc_name,
        `Deleted residence (${acc.acc_capacity} beds) at ${acc.acc_location}`
      )
      addToast(`Residence "${acc.acc_name}" deleted from registry.`, 'info')
      loadAllAdminData()
    } catch {
      addToast('Failed to delete accommodation', 'error')
    }
  }

  const handleCreateNewAcc = async (e) => {
    e.preventDefault()
    if (!newAccData.acc_name.trim() || !newAccData.acc_location.trim()) {
      addToast('Please complete required property fields.', 'error')
      return
    }

    try {
      await accommodationService.create(newAccData)
      await auditService.log(
        currentAdmin,
        'CREATE_ACCOMMODATION',
        'accommodation',
        null,
        newAccData.acc_name,
        `Registered new residence at ${newAccData.acc_location} (${newAccData.acc_capacity} beds)`
      )
      addToast(`Residence "${newAccData.acc_name}" registered successfully!`, 'success')
      setNewAccModalOpen(false)
      loadAllAdminData()
    } catch (err) {
      addToast(err.message || 'Failed to save accommodation listing', 'error')
    }
  }

  // ── Student account administration ──────────────────────────────────────────
  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Delete student account for ${student.name} ${student.surname} (${student.student_number})? Their applications will be removed too.`)) return
    try {
      await supabase.from('bookings').delete().eq('student_number', student.student_number)
      const { error } = await supabase.from('students').delete().eq('id', student.id)
      if (error) throw error
      await auditService.log(
        currentAdmin,
        'DELETE_STUDENT',
        'student',
        student.id,
        `${student.name} ${student.surname} (${student.student_number})`,
        'Deleted student profile and all associated applications'
      )
      addToast('Student account deleted.', 'info')
      loadAllAdminData()
    } catch (err) {
      addToast(err.message || 'Failed to delete student', 'error')
    }
  }

  // ── Landlord account administration ────────────────────────────────────────
  const propertiesByLandlord = accommodations.reduce((map, acc) => {
    const lid = acc.landlord_id
    if (!lid) return map
    map[lid] = map[lid] || []
    map[lid].push(acc)
    return map
  }, {})

  const [expandedLandlordId, setExpandedLandlordId] = useState(null)

  const handleDeleteLandlord = async (landlord) => {
    const ownedCount = (propertiesByLandlord[landlord.id] || []).length
    if (!window.confirm(`Delete landlord account "${landlord.fname} ${landlord.lname}"? ${ownedCount > 0 ? `${ownedCount} residence(s) will become unassigned.` : ''}`)) return
    try {
      const { error } = await supabase.from('landlords').delete().eq('id', landlord.id)
      if (error) throw error
      await auditService.log(
        currentAdmin,
        'DELETE_LANDLORD',
        'landlord',
        landlord.id,
        `${landlord.fname} ${landlord.lname} (${landlord.email})`,
        `Deleted landlord account. Residences affected: ${ownedCount}`
      )
      addToast('Landlord account deleted.', 'info')
      loadAllAdminData()
    } catch (err) {
      addToast(err.message || 'Failed to delete landlord', 'error')
    }
  }

  // ── Admin profile management ────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('admins')
        .update({ username: profileData.username.trim(), email: profileData.email.trim() })
        .eq('id', currentAdmin.id)
      if (error) throw error
      await auditService.log(
        currentAdmin,
        'UPDATE_PROFILE',
        'admin',
        currentAdmin.id,
        currentAdmin.username,
        `Changed profile → username: ${profileData.username.trim()}, email: ${profileData.email.trim()}`
      )
      adminAuth.updateSession({ ...currentAdmin, username: profileData.username.trim(), email: profileData.email.trim() })
      addToast('Profile updated successfully.', 'success')
      loadAllAdminData()
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwdData.next.length < 8) {
      addToast('New password must be at least 8 characters.', 'error')
      return
    }
    if (pwdData.next !== pwdData.confirm) {
      addToast('Passwords do not match.', 'error')
      return
    }
    try {
      const { error } = await supabase.rpc('update_admin_password', {
        p_admin_id: currentAdmin.id,
        p_new_password: pwdData.next
      })
      if (error) throw error
      await auditService.log(
        currentAdmin,
        'CHANGE_PASSWORD',
        'admin',
        currentAdmin.id,
        currentAdmin.username,
        'Password changed'
      )
      setPwdData({ next: '', confirm: '' })
      addToast('Password changed successfully.', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error')
    }
  }

  return (
    <div className="admin-portal-page">
      {/* Header Banner */}
      <section className="admin-header-banner">
        <div className="container admin-header-flex">
          <div>
            <span className="badge badge-accent">
              <ShieldCheck size={13} /> VUT Housing Administration
            </span>
            <h1>Administrative Management Suite</h1>
            <p>Monitor applications, allocate student rooms, and manage accredited residences.</p>
          </div>

          <div className="admin-quick-actions">
            <button onClick={() => setNewAccModalOpen(true)} className="btn btn-secondary">
              <Plus size={16} />
              <span>Add New Residence</span>
            </button>
          </div>
        </div>
      </section>

      <div className="container admin-main-container">
        {/* KPI Metric Overview Cards */}
        {stats && (
          <div className="admin-kpi-grid">
            <div className="kpi-card card">
              <div className="kpi-icon-wrap primary">
                <Users size={24} />
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Total Applications</span>
                <strong className="kpi-value">{stats.total_bookings}</strong>
                <span className="kpi-sub">{stats.status_counts.Pending} pending review</span>
              </div>
            </div>

            <div className="kpi-card card">
              <div className="kpi-icon-wrap success">
                <Sparkles size={24} />
              </div>
              <div className="kpi-details">
                <span className="kpi-label">NSFAS Students</span>
                <strong className="kpi-value">{stats.nsfas_students}</strong>
                <span className="kpi-sub">Direct allowance funded</span>
              </div>
            </div>

            <div className="kpi-card card">
              <div className="kpi-icon-wrap accent">
                <Bed size={24} />
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Campus Capacity</span>
                <strong className="kpi-value">{stats.total_capacity} Beds</strong>
                <span className="kpi-sub">{stats.occupancy_rate}% overall occupancy</span>
              </div>
            </div>

            <div className="kpi-card card">
              <div className="kpi-icon-wrap warning">
                <Building2 size={24} />
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Active Residences</span>
                <strong className="kpi-value">{stats.total_accommodations}</strong>
                <span className="kpi-sub">Accredited listings</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Users size={16} />
            <span>Applications Queue ({bookings.length})</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'accommodations' ? 'active' : ''}`}
            onClick={() => setActiveTab('accommodations')}
          >
            <Building2 size={16} />
            <span>Residence Inventory ({accommodations.length})</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'studentAccounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('studentAccounts')}
          >
            <GraduationCap size={16} />
            <span>Student Accounts ({studentAccounts.length})</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'landlords' ? 'active' : ''}`}
            onClick={() => setActiveTab('landlords')}
          >
            <Landmark size={16} />
            <span>Landlord Accounts ({landlords.length})</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <ScrollText size={16} />
            <span>Audit Log</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserCog size={16} />
            <span>My Profile</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            <span>Funding & Reports</span>
          </button>
        </div>

        {/* TAB 1: APPLICATIONS REVIEW QUEUE */}
        {activeTab === 'bookings' && (
          <div className="admin-tab-view animate-fade-in card">
            <div className="table-controls-bar">
              {/* Search */}
              <div className="search-input-wrap" style={{ maxWidth: 360 }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by student name, number, ref..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="form-control"
                />
              </div>

              {/* Status Filter */}
              <div className="status-filter-pills">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    className={`status-pill-btn ${bookingFilterStatus === status ? 'active' : ''}`}
                    onClick={() => setBookingFilterStatus(status)}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Ref & Date</th>
                    <th>Student Name</th>
                    <th>Student Number</th>
                    <th>Residence Preference</th>
                    <th>Funding Scheme</th>
                    <th>Allocated Room</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center" style={{ padding: 32 }}>
                        No applications match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.booking_ref || `#${b.id}`}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {new Date(b.registered_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <strong>{b.name} {b.surname}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.email}</div>
                        </td>
                        <td><code>{b.student_number}</code></td>
                        <td>{b.accommodation}</td>
                        <td>
                          <span className={`badge ${b.bursary_type === 'NSFAS' ? 'badge-nsfas' : 'badge-primary'}`}>
                            {b.bursary_type}
                          </span>
                        </td>
                        <td>
                          {b.room_number ? (
                            <strong className="text-accent">{b.room_number}</strong>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
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
                        <td>
                          <div className="table-actions-flex">
                            <button
                              onClick={() => openAssignModal(b)}
                              className="btn btn-primary btn-sm"
                              title="Assign Room & Approve"
                            >
                              <KeyRound size={14} />
                              <span>{b.booking_status === 'Approved' ? 'Reassign' : 'Approve'}</span>
                            </button>

                            {b.booking_status !== 'Rejected' && (
                              <button
                                onClick={() => handleRejectBooking(b)}
                                className="btn btn-outline btn-sm text-danger"
                                title="Decline Application"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ACCOMMODATION INVENTORY */}
        {activeTab === 'accommodations' && (
          <div className="admin-tab-view animate-fade-in card">
            <div className="table-controls-bar">
              <div className="search-input-wrap" style={{ maxWidth: 360 }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search residences..."
                  value={accSearch}
                  onChange={(e) => setAccSearch(e.target.value)}
                  className="form-control"
                />
              </div>

              <button onClick={() => setNewAccModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={15} />
                <span>Add Residence</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Residence Name</th>
                    <th>Location / Suburb</th>
                    <th>Capacity</th>
                    <th>Price / Mo</th>
                    <th>Funding Support</th>
                    <th>Manager Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccommodations.map((acc) => (
                    <tr key={acc.id}>
                      <td>
                        <strong>{acc.acc_name}</strong>
                      </td>
                      <td>{acc.acc_location}</td>
                      <td>
                        <strong>{acc.acc_capacity}</strong> beds
                      </td>
                      <td>{acc.price_per_month ? `R${Number(acc.price_per_month).toLocaleString()}` : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {acc.supports_nsfas && <span className="badge badge-nsfas">NSFAS</span>}
                          {acc.supports_other && <span className="badge badge-primary">Bursary</span>}
                          {acc.supports_self && <span className="badge badge-accent">Self</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{acc.landlord?.name}</div>
                        <small style={{ color: 'var(--text-light)' }}>{acc.landlord?.phone}</small>
                      </td>
                      <td>
                        <div className="table-actions-flex">
                          <button
                            onClick={() => navigate(`/accommodation/${acc.id}`, {
                              state: { from: '/admin', label: 'Back to Admin Dashboard' }
                            })}
                            className="btn btn-outline btn-sm"
                            title="View Residence"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAccommodation(acc)}
                            className="btn btn-outline btn-sm text-danger"
                            title="Delete Residence"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT ACCOUNT ADMINISTRATION */}
        {activeTab === 'studentAccounts' && (
          <div className="admin-tab-view animate-fade-in card">
            <div className="table-controls-bar">
              <h4>Registered Student Accounts</h4>
              <div className="search-input-wrap" style={{ maxWidth: 320 }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, number, email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student Number</th>
                    <th>Contact</th>
                    <th>Gender</th>
                    <th>Year of Study</th>
                    <th>Funding</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAccounts.filter((s) => {
                    if (!studentSearch.trim()) return true
                    const q = studentSearch.toLowerCase().trim()
                    const hay = `${s.name} ${s.surname} ${s.student_number} ${s.email}`.toLowerCase()
                    return hay.includes(q)
                  }).length === 0 ? (
                    <tr><td colSpan={8} className="text-center" style={{ padding: 32 }}>No registered student accounts found.</td></tr>
                  ) : (
                    studentAccounts
                      .filter((s) => {
                        if (!studentSearch.trim()) return true
                        const q = studentSearch.toLowerCase().trim()
                        const hay = `${s.name} ${s.surname} ${s.student_number} ${s.email}`.toLowerCase()
                        return hay.includes(q)
                      })
                      .map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.name} {s.surname}</strong></td>
                          <td><code>{s.student_number}</code></td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>{s.email}</div>
                            <small style={{ color: 'var(--text-light)' }}>{s.phone}</small>
                          </td>
                          <td>{s.gender || '—'}</td>
                          <td>{s.year_of_study}</td>
                          <td>
                            <span className={`badge ${s.bursary_type === 'NSFAS' ? 'badge-nsfas' : 'badge-primary'}`}>
                              {s.bursary_type}
                            </span>
                            {s.bursary_other && (
                              <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: 2 }}>
                                {s.bursary_other}
                              </small>
                            )}
                          </td>
                          <td>{new Date(s.created_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteStudent(s)}
                              className="btn btn-outline btn-sm text-danger"
                              title="Delete Student Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LANDLORD ACCOUNT ADMINISTRATION */}
        {activeTab === 'landlords' && (
          <div className="admin-tab-view animate-fade-in card">
            <h4>Landlord Accounts & Their Residences</h4>
            <p className="text-muted" style={{ marginBottom: 20 }}>
              Every landlord on the platform, with the residences registered under them.
            </p>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Landlord</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Residences ({accommodations.length})</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {landlords.length === 0 ? (
                    <tr><td colSpan={6} className="text-center" style={{ padding: 32 }}>No landlord accounts found.</td></tr>
                  ) : (
                    landlords.map((l) => {
                      const owned = propertiesByLandlord[l.id] || []
                      const isExpanded = expandedLandlordId === l.id
                      return (
                        <React.Fragment key={l.id}>
                          <tr>
                            <td><strong>{l.fname} {l.lname}</strong></td>
                            <td>{l.email}</td>
                            <td>{l.phone}</td>
                            <td>
                              <button
                                onClick={() => setExpandedLandlordId(isExpanded ? null : l.id)}
                                className="btn btn-outline btn-sm"
                                disabled={owned.length === 0}
                              >
                                <Building2 size={13} />
                                <span>{owned.length} {isExpanded ? '▲' : '▼'}</span>
                              </button>
                            </td>
                            <td>{new Date(l.created_at).toLocaleDateString()}</td>
                            <td>
                              <button
                                onClick={() => handleDeleteLandlord(l)}
                                className="btn btn-outline btn-sm text-danger"
                                title="Delete Landlord Account"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                          {isExpanded && owned.map((acc) => (
                            <tr key={acc.id} style={{ background: 'var(--bg-card-subtle)' }}>
                              <td colSpan={6} style={{ paddingLeft: 40 }}>
                                <strong>{acc.acc_name}</strong> — {acc.acc_location},{' '}
                                {acc.acc_capacity} beds,{' '}
                                {acc.available_spaces ?? 0} available
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="admin-tab-view animate-fade-in card">
            <h4>Administrator Audit Trail</h4>
            <p className="text-muted" style={{ marginBottom: 20 }}>
              Permanent record of which administrator approved, deleted, or changed what — and when.
            </p>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={5} className="text-center" style={{ padding: 32 }}>No actions recorded yet.</td></tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td><strong>{log.admin_username}</strong></td>
                        <td>
                          <span className={`badge ${
                            log.action.startsWith('DELETE') ? 'badge-danger'
                            : log.action.includes('REJECT') ? 'badge-warning'
                            : log.action === 'APPROVE_BOOKING' ? 'badge-success'
                            : 'badge-primary'}`}>
                            {log.action.replaceAll('_', ' ')}
                          </span>
                        </td>
                        <td>{log.entity_label || log.entity_type}{log.entity_id ? ` (#${String(log.entity_id).slice(0, 8)})` : ''}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ADMIN PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <div className="admin-tab-view animate-fade-in card" style={{ maxWidth: 640 }}>
            <h4>My Administrator Profile</h4>
            <p className="text-muted" style={{ marginBottom: 24 }}>
              Changes are recorded in the audit trail.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <CheckCircle2 size={16} />
                <span>Save Profile</span>
              </button>
            </form>

            <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

            <h4 style={{ marginBottom: 12 }}>Change Password</h4>
            <form onSubmit={handleChangePassword}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>New Password (min 8 characters)</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwdData.next}
                  onChange={(e) => setPwdData({ ...pwdData, next: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={pwdData.confirm}
                  onChange={(e) => setPwdData({ ...pwdData, confirm: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-outline">
                <KeyRound size={16} />
                <span>Update Password</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: REPORTS & ANALYTICS */}
        {activeTab === 'analytics' && stats && (
          <div className="admin-tab-view animate-fade-in">
            <div className="grid-2">
              <div className="analytics-card card">
                <h4>Funding Scheme Distribution</h4>
                <p className="text-muted" style={{ marginBottom: 20 }}>
                  Breakdown of housing applications by student bursary sponsor.
                </p>

                <div className="stat-bars-list">
                  <div className="stat-bar-item">
                    <div className="stat-bar-header">
                      <span>NSFAS Accredited Allowance</span>
                      <strong>{stats.nsfas_students} Students ({Math.round((stats.nsfas_students / (stats.total_bookings || 1)) * 100)}%)</strong>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill nsfas"
                        style={{ width: `${Math.round((stats.nsfas_students / (stats.total_bookings || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="stat-bar-item">
                    <div className="stat-bar-header">
                      <span>Private Corporate Bursaries</span>
                      <strong>{stats.private_students} Students ({Math.round((stats.private_students / (stats.total_bookings || 1)) * 100)}%)</strong>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill private"
                        style={{ width: `${Math.round((stats.private_students / (stats.total_bookings || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="stat-bar-item">
                    <div className="stat-bar-header">
                      <span>Self-Paying / Other</span>
                      <strong>{stats.self_paying_students} Students ({Math.round((stats.self_paying_students / (stats.total_bookings || 1)) * 100)}%)</strong>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill self"
                        style={{ width: `${Math.round((stats.self_paying_students / (stats.total_bookings || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-card card">
                <h4>Application Review Pipeline</h4>
                <p className="text-muted" style={{ marginBottom: 20 }}>
                  Current workload and processing status of student applications.
                </p>

                <div className="pipeline-stats-grid">
                  <div className="pipeline-box pending">
                    <span>Pending Action</span>
                    <strong>{stats.status_counts.Pending}</strong>
                  </div>
                  <div className="pipeline-box approved">
                    <span>Approved & Housed</span>
                    <strong>{stats.status_counts.Approved}</strong>
                  </div>
                  <div className="pipeline-box rejected">
                    <span>Declined</span>
                    <strong>{stats.status_counts.Rejected}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Room Assignment Modal */}
      {assignModalOpen && selectedBooking && (
        <div className="modal-backdrop" onClick={() => setAssignModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Allocate Room & Approve Student</h4>
              <button className="btn-ghost" onClick={() => setAssignModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleConfirmAssignment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Student Name</label>
                  <input className="form-control" value={`${selectedBooking.name} ${selectedBooking.surname}`} readOnly />
                </div>
                <div className="form-group">
                  <label>Student Number</label>
                  <input className="form-control" value={selectedBooking.student_number} readOnly />
                </div>
                <div className="form-group">
                  <label>Selected Residence</label>
                  <input className="form-control" value={selectedBooking.accommodation} readOnly />
                </div>
                <div className="form-group">
                  <label>
                    Assign Room Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Room A-204"
                    value={roomNumberInput}
                    onChange={(e) => setRoomNumberInput(e.target.value)}
                    required
                  />
                  <span className="form-hint">Assign an available room number within this residence.</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setAssignModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>Confirm Room Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Accommodation Modal */}
      {newAccModalOpen && (
        <div className="modal-backdrop" onClick={() => setNewAccModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Register New Accommodation Listing</h4>
              <button className="btn-ghost" onClick={() => setNewAccModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateNewAcc}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Residence Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Riverside Student Manor"
                      value={newAccData.acc_name}
                      onChange={(e) => setNewAccData({ ...newAccData, acc_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Location / Area *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Vanderbijlpark SE7"
                      value={newAccData.acc_location}
                      onChange={(e) => setNewAccData({ ...newAccData, acc_location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Distance to VUT Campus (km) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={newAccData.distance_km}
                      onChange={(e) => setNewAccData({ ...newAccData, distance_km: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Rate (ZAR) — only if self-paying</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Optional — leave empty for NSFAS/bursary-funded"
                      value={newAccData.price_per_month}
                      onChange={(e) => setNewAccData({ ...newAccData, price_per_month: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Student Capacity *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newAccData.acc_capacity}
                      onChange={(e) => setNewAccData({ ...newAccData, acc_capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Funding Schemes Supported</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newAccData.supports_nsfas}
                        onChange={(e) => setNewAccData({ ...newAccData, supports_nsfas: e.target.checked })}
                      />
                      <span>NSFAS Accredited</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newAccData.supports_other}
                        onChange={(e) => setNewAccData({ ...newAccData, supports_other: e.target.checked })}
                      />
                      <span>Other Bursaries</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newAccData.supports_self}
                        onChange={(e) => setNewAccData({ ...newAccData, supports_self: e.target.checked })}
                      />
                      <span>Self-Paying</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide overview of amenities, security, and layout..."
                    value={newAccData.acc_description}
                    onChange={(e) => setNewAccData({ ...newAccData, acc_description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setNewAccModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} />
                  <span>Register Residence</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-portal-page {
          padding-bottom: 80px;
          min-height: 80vh;
        }

        .admin-header-banner {
          background: linear-gradient(180deg, #0b3b60 0%, #071e33 100%);
          color: white;
          padding: 44px 0 54px;
        }

        .admin-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .admin-header-banner h1 {
          color: white;
          margin: 8px 0;
        }

        .admin-header-banner p {
          color: #cbd5e1;
        }

        .admin-main-container {
          margin-top: -28px;
          position: relative;
          z-index: 10;
        }

        /* KPI Grid */
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
        }

        .kpi-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-icon-wrap.primary { background: var(--primary-light); color: var(--primary); }
        .kpi-icon-wrap.success { background: var(--success-bg); color: var(--success); }
        .kpi-icon-wrap.accent { background: var(--accent-light); color: var(--accent); }
        .kpi-icon-wrap.warning { background: var(--warning-bg); color: var(--warning); }

        .kpi-details {
          display: flex;
          flex-direction: column;
        }

        .kpi-label {
          font-size: 0.78rem;
          color: var(--text-light);
          text-transform: uppercase;
          font-weight: 700;
        }

        .kpi-value {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.1;
        }

        .kpi-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* Nav Tabs */
        .admin-nav-tabs {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .admin-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid var(--border);
          padding: 12px 20px;
          border-radius: var(--radius-md);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .admin-tab:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        .admin-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        /* Tab view */
        .admin-tab-view {
          padding: 24px 28px;
        }

        .table-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .status-filter-pills {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-pill-btn {
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
        }

        .status-pill-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .table-actions-flex {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Analytics */
        .stat-bars-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stat-bar-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 6px;
        }

        .bar-track {
          width: 100%;
          height: 10px;
          background: #e2e8f0;
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .bar-fill.nsfas { background: #f59e0b; height: 100%; }
        .bar-fill.private { background: #0284c7; height: 100%; }
        .bar-fill.self { background: #10b981; height: 100%; }

        .pipeline-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .pipeline-box {
          background: var(--bg-card-subtle);
          border-radius: var(--radius-md);
          padding: 20px;
          text-align: center;
        }

        .pipeline-box span {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .pipeline-box strong {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
        }

        @media (max-width: 1024px) {
          .admin-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .admin-kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
