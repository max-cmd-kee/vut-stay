import React, { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Plus,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  XCircle,
  KeyRound,
  Trash2,
  Edit2
} from 'lucide-react'
import { accommodationService } from '../services/accommodationService'
import { bookingService } from '../services/bookingService'
import { landlordAuth } from '../services/authService'
import { useToast } from '../components/Toast'

const ALL_AMENITIES = [
  'High-Speed Wi-Fi',
  '24/7 Security',
  'Free Shuttle',
  'Laundry Facilities',
  'Study Rooms',
  'Backup Generator',
  'Backup Water',
  'Furnished Rooms',
  'Secure Parking',
  'CCTV Surveillance'
]

const EMPTY_FORM = {
  acc_name: '',
  acc_location: '',
  distance_km: '',
  price_per_month: '',
  acc_capacity: '',
  house_number: '',
  street_name: '',
  suburb: '',
  city: 'Vanderbijlpark',
  postal_code: '',
  supports_nsfas: true,
  supports_other: false,
  supports_self: false,
  acc_description: ''
}

export default function LandlordPortal() {
  const { addToast } = useToast()
  const session = landlordAuth.getSession() || {}

  const [activeTab, setActiveTab] = useState('properties') // properties | applications | add
  const [myProperties, setMyProperties] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  // New property form
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  // Edit modal
  const [editingAcc, setEditingAcc] = useState(null)
  const [editData, setEditData] = useState(null)

  // Room assignment on approval
  const [assigningBooking, setAssigningBooking] = useState(null)
  const [roomNumberInput, setRoomNumberInput] = useState('')

  const loadLandlordData = useCallback(async () => {
    if (!session.id) return
    setLoading(true)
    try {
      const mine = await accommodationService.getByLandlordId(session.id)
      setMyProperties(mine)
      const apps = await bookingService.getByAccommodationIds(mine.map((a) => a.id))
      setApplications(apps)
    } catch (err) {
      console.error(err)
      addToast('Failed to load your portal data', 'error')
    } finally {
      setLoading(false)
    }
  }, [session.id, addToast])

  useEffect(() => {
    loadLandlordData()
  }, [loadLandlordData])

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (amenity) => {
    const current = formData.amenities || []
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity]
    setFormData((prev) => ({ ...prev, amenities: updated }))
  }

  // ── Add property ────────────────────────────────────────────────────────────
  const handleSubmitProperty = async (e) => {
    e.preventDefault()
    if (!formData.acc_name.trim() || !formData.acc_capacity.trim()) {
      addToast('Please complete the residence name and capacity.', 'error')
      return
    }
    try {
      await accommodationService.create({
        ...formData,
        fname: session.fname || session.name || 'Landlord',
        lname: session.lname || '',
        phone: session.phone || '',
        email: session.email || '',
        acc_contact: session.email || '',
        landlord_id: session.id
      })
      setSubmittedSuccess(true)
      addToast('Residence listing submitted successfully!', 'success')
      loadLandlordData()
    } catch (err) {
      addToast(err.message || 'Failed to submit listing', 'error')
    }
  }

  // ── Edit property ───────────────────────────────────────────────────────────
  const openEditModal = (acc) => {
    setEditingAcc(acc)
    setEditData({
      acc_name: acc.acc_name || '',
      acc_location: acc.acc_location || '',
      acc_capacity: String(acc.acc_capacity ?? ''),
      acc_description: acc.acc_description || '',
      city: acc.city || '',
      supports_nsfas: Boolean(acc.supports_nsfas),
      supports_other: Boolean(acc.supports_other),
      supports_self: Boolean(acc.supports_self),
      price_per_month: acc.price_per_month ? String(acc.price_per_month) : ''
    })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      await accommodationService.update(editingAcc.id, {
        ...editData,
        acc_capacity: Number(editData.acc_capacity) || editingAcc.acc_capacity
      })
      addToast(`"${editData.acc_name}" updated.`, 'success')
      setEditingAcc(null)
      loadLandlordData()
    } catch (err) {
      addToast(err.message || 'Failed to save changes', 'error')
    }
  }

  // ── Delete property ─────────────────────────────────────────────────────────
  const handleDeleteProperty = async (acc) => {
    if (!window.confirm(`Remove "${acc.acc_name}" from your listings? This cannot be undone.`)) return
    try {
      await accommodationService.delete(acc.id)
      addToast(`"${acc.acc_name}" removed.`, 'info')
      loadLandlordData()
    } catch {
      addToast('Failed to remove listing', 'error')
    }
  }

  // ── Applications ────────────────────────────────────────────────────────────
  const openAssignModal = (b) => {
    setAssigningBooking(b)
    setRoomNumberInput(b.room_number || '')
  }

  const handleApproveApplication = async (e) => {
    e.preventDefault()
    try {
      await bookingService.updateStatus(assigningBooking.id, {
        status: 'Approved',
        roomNumber: roomNumberInput.trim()
      })
      addToast(`${assigningBooking.name} ${assigningBooking.surname} approved for Room ${roomNumberInput}.`, 'success')
      setAssigningBooking(null)
      loadLandlordData()
    } catch (err) {
      addToast(err.message || 'Failed to approve application', 'error')
    }
  }

  const handleRejectApplication = async (b) => {
    if (!window.confirm(`Reject the application from ${b.name} ${b.surname}?`)) return
    try {
      await bookingService.updateStatus(b.id, { status: 'Rejected' })
      addToast('Application rejected.', 'info')
      loadLandlordData()
    } catch (err) {
      addToast(err.message || 'Action failed', 'error')
    }
  }

  const pendingCount = applications.filter((b) => b.booking_status === 'Pending').length
  const approvedCount = applications.filter((b) => b.booking_status === 'Approved').length

  return (
    <div className="landlord-portal-page">
      {/* Header Banner */}
      <section className="landlord-header-banner">
        <div className="container">
          <span className="badge badge-accent">
            <Building2 size={13} /> Accommodation Provider Hub
          </span>
          <h1>Welcome back, {session.fname || session.name || 'Landlord'}</h1>
          <p>
            Manage your residences and student applications across all your properties.
          </p>
        </div>
      </section>

      <div className="container landlord-main-content">
        {/* KPI row */}
        <div className="ll-kpi-row">
          <div className="card ll-kpi">
            <Building2 size={22} />
            <div>
              <strong>{myProperties.length}</strong>
              <span>My Residences</span>
            </div>
          </div>
          <div className="card ll-kpi">
            <ClipboardList size={22} />
            <div>
              <strong>{pendingCount}</strong>
              <span>Pending Applications</span>
            </div>
          </div>
          <div className="card ll-kpi">
            <CheckCircle2 size={22} />
            <div>
              <strong>{approvedCount}</strong>
              <span>Approved Students</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ll-tabs">
          <button className={`ll-tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>
            <Building2 size={16} /> My Properties ({myProperties.length})
          </button>
          <button className={`ll-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
            <ClipboardList size={16} /> Applications ({pendingCount})
          </button>
          <button className={`ll-tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
            <Plus size={16} /> List a New Property
          </button>
        </div>

        {/* TAB: MY PROPERTIES */}
        {activeTab === 'properties' && (
          <div className="animate-fade-in">
            {loading ? (
              <div className="card ll-empty">Loading your residences…</div>
            ) : myProperties.length === 0 ? (
              <div className="card ll-empty">
                <Building2 size={40} />
                <h4>No residences yet</h4>
                <p>Use "List a New Property" to register your first residence.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('add')}>
                  <Plus size={16} /> List a Property
                </button>
              </div>
            ) : (
              <div className="ll-prop-grid">
                {myProperties.map((acc) => (
                  <div key={acc.id} className="card ll-prop-card">
                    <div className="ll-prop-head">
                      <div>
                        <h4>{acc.acc_name}</h4>
                        <span className="text-muted">{acc.acc_location}{acc.city ? `, ${acc.city}` : ''}</span>
                      </div>
                      <div className="table-actions-flex">
                        <button onClick={() => openEditModal(acc)} className="btn btn-outline btn-sm" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteProperty(acc)} className="btn btn-outline btn-sm text-danger" title="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="ll-prop-stats">
                      <div><strong>{acc.acc_capacity}</strong><span>Total Beds</span></div>
                      <div><strong>{acc.available_spaces ?? 0}</strong><span>Available</span></div>
                      <div>
                        <strong>
                          {applications.filter((b) => b.accommodation_id === acc.id && b.booking_status === 'Pending').length}
                        </strong>
                        <span>Pending Apps</span>
                      </div>
                      <div>
                        {acc.price_per_month
                          ? <strong>R{Number(acc.price_per_month).toLocaleString()}</strong>
                          : <strong className="text-success">Funded</strong>}
                        <span>{acc.price_per_month ? 'Per Month' : 'NSFAS/Bursary'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                      {acc.supports_nsfas && <span className="badge badge-nsfas">NSFAS</span>}
                      {acc.supports_other && <span className="badge badge-primary">Bursary</span>}
                      {acc.supports_self && <span className="badge badge-accent">Self-Pay</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="card animate-fade-in" style={{ padding: '24px 28px' }}>
            {loading ? (
              <p>Loading applications…</p>
            ) : applications.length === 0 ? (
              <div className="ll-empty" style={{ boxShadow: 'none' }}>
                <ClipboardList size={40} />
                <h4>No applications yet</h4>
                <p>Student applications for your residences will appear here.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student Number</th>
                      <th>Residence</th>
                      <th>Funding</th>
                      <th>Room</th>
                      <th>Status</th>
                      <th>Applied</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((b) => (
                      <tr key={b.id}>
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
                        <td>{b.room_number ? <strong className="text-accent">{b.room_number}</strong> : '—'}</td>
                        <td>
                          <span className={`badge ${
                            b.booking_status === 'Approved' ? 'badge-success'
                            : b.booking_status === 'Rejected' ? 'badge-danger'
                            : 'badge-warning'}`}>
                            {b.booking_status}
                          </span>
                        </td>
                        <td>{new Date(b.registered_at).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions-flex">
                            {b.booking_status === 'Pending' && (
                              <>
                                <button onClick={() => openAssignModal(b)} className="btn btn-primary btn-sm">
                                  <KeyRound size={13} /> Approve
                                </button>
                                <button onClick={() => handleRejectApplication(b)} className="btn btn-outline btn-sm text-danger">
                                  <XCircle size={13} />
                                </button>
                              </>
                            )}
                            {b.booking_status === 'Approved' && (
                              <button onClick={() => openAssignModal(b)} className="btn btn-outline btn-sm">
                                <Edit2 size={13} /> Reassign
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: LIST NEW PROPERTY */}
        {activeTab === 'add' && (
          <div className="landlord-form-card card animate-fade-in">
            {submittedSuccess ? (
              <div className="submission-success-view text-center animate-fade-in">
                <div className="success-icon-wrap">
                  <CheckCircle2 size={48} className="text-success" />
                </div>
                <h3>Listing Submitted!</h3>
                <p>
                  Thank you for submitting <strong>{formData.acc_name}</strong>. It is now live under your account.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 20 }}
                  onClick={() => {
                    setSubmittedSuccess(false)
                    setFormData(EMPTY_FORM)
                    setActiveTab('properties')
                  }}
                >
                  <Building2 size={16} />
                  <span>View My Properties</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitProperty}>
                <div className="form-header-divider">
                  <h3>New Residence Details</h3>
                  <p>This property will be registered under your account ({session.email}).</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Residence Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Amber Student Residence"
                      value={formData.acc_name}
                      onChange={(e) => updateField('acc_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Location / Area *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Vanderbijlpark CW2"
                      value={formData.acc_location}
                      onChange={(e) => updateField('acc_location', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>House / Street Number</label>
                    <input type="text" className="form-control" value={formData.house_number} onChange={(e) => updateField('house_number', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Street Name</label>
                    <input type="text" className="form-control" value={formData.street_name} onChange={(e) => updateField('street_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Suburb</label>
                    <input type="text" className="form-control" value={formData.suburb} onChange={(e) => updateField('suburb', e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Distance to VUT Campus (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={formData.distance_km}
                      onChange={(e) => updateField('distance_km', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Rent (ZAR) — only if self-paying</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Optional — leave empty for NSFAS/bursary-funded"
                      value={formData.price_per_month}
                      onChange={(e) => updateField('price_per_month', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Student Capacity (Beds) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.acc_capacity}
                      onChange={(e) => updateField('acc_capacity', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Funding Compatibility</label>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.supports_nsfas} onChange={(e) => updateField('supports_nsfas', e.target.checked)} />
                      <span>NSFAS Accredited</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.supports_other} onChange={(e) => updateField('supports_other', e.target.checked)} />
                      <span>Other Bursaries</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.supports_self} onChange={(e) => updateField('supports_self', e.target.checked)} />
                      <span>Self-Paying</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Amenities</label>
                  <div className="amenities-pick-grid">
                    {ALL_AMENITIES.map((amenity) => {
                      const checked = (formData.amenities || []).includes(amenity)
                      return (
                        <label key={amenity} className={`amenity-check-box ${checked ? 'active' : ''}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleAmenity(amenity)} />
                          <span>{amenity}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description & Features</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe student rooms, security, proximity to campus, and house rules..."
                    value={formData.acc_description}
                    onChange={(e) => updateField('acc_description', e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: 24 }}>
                  <Sparkles size={18} />
                  <span>Register This Residence</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Edit Property Modal */}
      {editingAcc && editData && (
        <div className="modal-backdrop" onClick={() => setEditingAcc(null)}>
          <div className="modal-dialog" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Edit "{editingAcc.acc_name}"</h4>
              <button className="btn-ghost" onClick={() => setEditingAcc(null)}>×</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Residence Name *</label>
                    <input className="form-control" value={editData.acc_name} onChange={(e) => setEditData({ ...editData, acc_name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input className="form-control" value={editData.acc_location} onChange={(e) => setEditData({ ...editData, acc_location: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Capacity (Beds) *</label>
                    <input type="number" className="form-control" value={editData.acc_capacity} onChange={(e) => setEditData({ ...editData, acc_capacity: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input className="form-control" value={editData.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Monthly Rate (self-paying only)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Empty = funded"
                      value={editData.price_per_month}
                      onChange={(e) => setEditData({ ...editData, price_per_month: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Funding Compatibility</label>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={editData.supports_nsfas} onChange={(e) => setEditData({ ...editData, supports_nsfas: e.target.checked })} />
                      <span>NSFAS</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={editData.supports_other} onChange={(e) => setEditData({ ...editData, supports_other: e.target.checked })} />
                      <span>Other Bursaries</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={editData.supports_self} onChange={(e) => setEditData({ ...editData, supports_self: e.target.checked })} />
                      <span>Self-Paying</span>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-textarea" rows={3} value={editData.acc_description} onChange={(e) => setEditData({ ...editData, acc_description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingAcc(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve & Assign Room Modal */}
      {assigningBooking && (
        <div className="modal-backdrop" onClick={() => setAssigningBooking(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Approve Application & Assign Room</h4>
              <button className="btn-ghost" onClick={() => setAssigningBooking(null)}>×</button>
            </div>
            <form onSubmit={handleApproveApplication}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Student</label>
                  <input className="form-control" value={`${assigningBooking.name} ${assigningBooking.surname} (${assigningBooking.student_number})`} readOnly />
                </div>
                <div className="form-group">
                  <label>Residence</label>
                  <input className="form-control" value={assigningBooking.accommodation || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Room Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Room A-204"
                    value={roomNumberInput}
                    onChange={(e) => setRoomNumberInput(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setAssigningBooking(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> <span>Confirm Approval</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .landlord-portal-page {
          padding-bottom: 80px;
          min-height: 80vh;
        }

        .landlord-header-banner {
          background: linear-gradient(180deg, #0b3b60 0%, #071e33 100%);
          color: white;
          padding: 44px 0 54px;
        }

        .landlord-header-banner h1 { color: white; margin: 8px 0; }
        .landlord-header-banner p { color: #cbd5e1; }

        .landlord-main-content {
          margin-top: -28px;
          position: relative;
          z-index: 10;
        }

        .ll-kpi-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .ll-kpi {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
        }

        .ll-kpi svg { color: var(--accent); flex-shrink: 0; }
        .ll-kpi strong { font-family: var(--font-heading); font-size: 1.5rem; display: block; line-height: 1.1; }
        .ll-kpi span { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }

        .ll-tabs {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .ll-tab {
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

        .ll-tab:hover { color: var(--primary); border-color: var(--primary); }
        .ll-tab.active { background: var(--primary); color: white; border-color: var(--primary); }

        .ll-prop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .ll-prop-card { padding: 22px 26px; }

        .ll-prop-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .ll-prop-head h4 { margin: 0 0 4px; }

        .ll-prop-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .ll-prop-stats > div { text-align: center; }
        .ll-prop-stats strong { font-family: var(--font-heading); font-size: 1.15rem; display: block; }
        .ll-prop-stats span { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

        .ll-empty {
          text-align: center;
          padding: 60px 24px !important;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .landlord-form-card { padding: 32px 36px; }

        .form-header-divider {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
        }

        .form-header-divider h3 { font-size: 1.2rem; color: var(--primary); }

        .amenities-pick-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 8px;
        }

        .amenity-check-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .amenity-check-box.active {
          border-color: var(--accent);
          background: var(--primary-light);
          color: var(--primary);
        }

        .submission-success-view { padding: 30px 10px; }
        .success-icon-wrap { margin-bottom: 16px; }

        @media (max-width: 960px) {
          .ll-kpi-row { grid-template-columns: 1fr; }
          .ll-prop-grid { grid-template-columns: 1fr; }
          .amenities-pick-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
