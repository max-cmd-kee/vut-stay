import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Sparkles,
  Building2,
  User,
  CreditCard,
  FileCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Printer,
  AlertCircle
} from 'lucide-react'
import { accommodationService } from '../services/accommodationService'
import { bookingService } from '../services/bookingService'
import { useToast } from '../components/Toast'

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()

  const preselectedAccId = searchParams.get('accommodation_id') || ''

  const [currentStep, setCurrentStep] = useState(1)
  const [accommodationsList, setAccommodationsList] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // Booking Form State
  const [formData, setFormData] = useState({
    accommodation_id: preselectedAccId,
    accommodation: '',
    room_type: 'Single Room',
    name: '',
    surname: '',
    student_number: '',
    id_number: '',
    phone_number: '',
    email: '',
    dob: '',
    year_of_study: '1',
    bursary_type: 'NSFAS',
    nsfas_status: 'Approved',
    nsfas_reference: '',
    terms_accepted: false
  })

  // Load accommodations for step 1 dropdown / cards
  useEffect(() => {
    async function loadAccs() {
      try {
        const list = await accommodationService.getAll()
        setAccommodationsList(list)
        if (preselectedAccId) {
          const matched = list.find((a) => String(a.id) === String(preselectedAccId))
          if (matched) {
            setFormData((prev) => ({
              ...prev,
              accommodation_id: matched.id,
              accommodation: matched.acc_name
            }))
          }
        } else if (list.length > 0) {
          setFormData((prev) => ({
            ...prev,
            accommodation_id: list[0].id,
            accommodation: list[0].acc_name
          }))
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadAccs()
  }, [preselectedAccId])

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleAccSelect = (acc) => {
    setFormData((prev) => ({
      ...prev,
      accommodation_id: acc.id,
      accommodation: acc.acc_name
    }))
  }

  // Step Validation
  const validateStep = (step) => {
    const errors = {}

    if (step === 1) {
      if (!formData.accommodation) errors.accommodation = 'Please select an accommodation residence.'
    } else if (step === 2) {
      if (!formData.name.trim()) errors.name = 'First name is required.'
      if (!formData.surname.trim()) errors.surname = 'Surname is required.'
      if (!/^\d{9}$/.test(formData.student_number.trim())) {
        errors.student_number = 'Student number must be 9 digits (e.g. 221045892).'
      }
      if (!/^\d{13}$/.test(formData.id_number.trim())) {
        errors.id_number = 'ID number must be exactly 13 digits.'
      }
      if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
        errors.phone_number = 'Enter a valid 10-digit phone number.'
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = 'Enter a valid email address.'
      }
      if (!formData.dob) errors.dob = 'Date of birth is required.'
    } else if (step === 3) {
      if (formData.bursary_type === 'NSFAS' && !formData.nsfas_reference.trim()) {
        errors.nsfas_reference = 'Please provide your NSFAS Reference / Application Number.'
      }
    } else if (step === 4) {
      if (!formData.terms_accepted) {
        errors.terms_accepted = 'You must accept the accommodation declaration & terms.'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo(0, 0)
  }

  const handleSubmitBooking = async () => {
    if (!validateStep(4)) return

    setSubmitting(true)
    try {
      const result = await bookingService.submit(formData)
      setConfirmedBooking(result)
      setCurrentStep(5)
      addToast('Housing application submitted successfully!', 'success')
    } catch (err) {
      addToast(err.message || 'Submission failed. Please check your details.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="booking-wizard-page">
      {/* Wizard Header Banner */}
      <section className="wizard-header">
        <div className="container">
          <span className="badge badge-primary">
            <Sparkles size={13} /> Official Housing Application
          </span>
          <h1>VUT Student Housing Booking</h1>
          <p>Complete this quick 5-step application to secure your verified student room.</p>
        </div>
      </section>

      {/* Stepper Progress Bar */}
      <div className="container stepper-container">
        <div className="stepper-progress-track">
          {[
            { step: 1, title: 'Residence', icon: Building2 },
            { step: 2, title: 'Student Info', icon: User },
            { step: 3, title: 'Funding', icon: CreditCard },
            { step: 4, title: 'Review', icon: FileCheck },
            { step: 5, title: 'Confirmed', icon: CheckCircle2 }
          ].map((s) => {
            const isCompleted = currentStep > s.step
            const isCurrent = currentStep === s.step
            const Icon = s.icon
            return (
              <div
                key={s.step}
                className={`stepper-node ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="stepper-icon-circle">
                  {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <span className="stepper-label">{s.title}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="container wizard-body-container">
        <div className="wizard-card card">
          {/* STEP 1: RESIDENCE & ROOM SELECTION */}
          {currentStep === 1 && (
            <div className="wizard-step-content animate-fade-in">
              <div className="step-title-block">
                <h3>Step 1: Choose Your Preferred Residence</h3>
                <p>Select from accredited student residences and your desired room layout.</p>
              </div>

              {formErrors.accommodation && (
                <div className="form-error-banner">
                  <AlertCircle size={16} /> {formErrors.accommodation}
                </div>
              )}

              {/* Residence Picker Cards */}
              <div className="residence-picker-grid">
                {accommodationsList.map((acc) => {
                  const isSelected = String(acc.id) === String(formData.accommodation_id)
                  return (
                    <div
                      key={acc.id}
                      className={`residence-pick-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAccSelect(acc)}
                    >
                      <img src={acc.profile_img || '/images/main-res.jpg'} alt={acc.acc_name} />
                      <div className="pick-card-body">
                        <div className="pick-card-header">
                          <h5>{acc.acc_name}</h5>
                          {isSelected && <CheckCircle2 size={18} className="text-accent" />}
                        </div>
                        <p className="pick-loc">{acc.acc_location}</p>
                        <div className="pick-footer">
                          <span className="pick-price">{acc.price_per_month ? `R${Number(acc.price_per_month).toLocaleString()}/mo` : 'NSFAS/Bursary funded'}</span>
                          <span className="pick-spaces">{acc.available_spaces ?? 0} beds left</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Room Configuration Selection */}
              <div className="form-section-divider" style={{ marginTop: 28 }}>
                <h4>Select Desired Room Type</h4>
                <div className="room-type-radio-group">
                  <label className={`room-radio-box ${formData.room_type === 'Single Room' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="room_type"
                      value="Single Room"
                      checked={formData.room_type === 'Single Room'}
                      onChange={(e) => updateField('room_type', e.target.value)}
                    />
                    <div>
                      <strong>Single Bedroom (Private)</strong>
                      <p>Private room with individual study desk and wardrobe.</p>
                    </div>
                  </label>

                  <label className={`room-radio-box ${formData.room_type === '2-Sharing Room' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="room_type"
                      value="2-Sharing Room"
                      checked={formData.room_type === '2-Sharing Room'}
                      onChange={(e) => updateField('room_type', e.target.value)}
                    />
                    <div>
                      <strong>2-Sharing Standard Bedroom</strong>
                      <p>Spacious shared room with dual study stations.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STUDENT DETAILS */}
          {currentStep === 2 && (
            <div className="wizard-step-content animate-fade-in">
              <div className="step-title-block">
                <h3>Step 2: Student Identity & Contact Information</h3>
                <p>Ensure your student number and SA ID match your official VUT registration.</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Thabo"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                  {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>
                    Last Name / Surname <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Molefe"
                    value={formData.surname}
                    onChange={(e) => updateField('surname', e.target.value)}
                  />
                  {formErrors.surname && <span className="form-error">{formErrors.surname}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    VUT Student Number (9 digits) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 221045892"
                    maxLength={9}
                    value={formData.student_number}
                    onChange={(e) => updateField('student_number', e.target.value.replace(/\D/g, ''))}
                  />
                  {formErrors.student_number && (
                    <span className="form-error">{formErrors.student_number}</span>
                  )}
                  <span className="form-hint">Must be your registered 9-digit university number.</span>
                </div>

                <div className="form-group">
                  <label>
                    South African ID Number (13 digits) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 0204125800084"
                    maxLength={13}
                    value={formData.id_number}
                    onChange={(e) => updateField('id_number', e.target.value.replace(/\D/g, ''))}
                  />
                  {formErrors.id_number && <span className="form-error">{formErrors.id_number}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Student Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. student@vut.ac.za"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                  {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label>
                    Mobile Phone Number (10 digits) <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 0712345678"
                    maxLength={10}
                    value={formData.phone_number}
                    onChange={(e) => updateField('phone_number', e.target.value.replace(/\D/g, ''))}
                  />
                  {formErrors.phone_number && <span className="form-error">{formErrors.phone_number}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Date of Birth <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.dob}
                    onChange={(e) => updateField('dob', e.target.value)}
                  />
                  {formErrors.dob && <span className="form-error">{formErrors.dob}</span>}
                </div>

                <div className="form-group">
                  <label>Current Year of Study</label>
                  <select
                    className="form-select"
                    value={formData.year_of_study}
                    onChange={(e) => updateField('year_of_study', e.target.value)}
                  >
                    <option value="1">1st Year Student</option>
                    <option value="2">2nd Year Student</option>
                    <option value="3">3rd Year Student</option>
                    <option value="4">4th Year / Honours / Postgraduate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FUNDING & NSFAS */}
          {currentStep === 3 && (
            <div className="wizard-step-content animate-fade-in">
              <div className="step-title-block">
                <h3>Step 3: Funding & Bursary Information</h3>
                <p>Indicate your financial source for accommodation allowances.</p>
              </div>

              <div className="form-group">
                <label>Select Your Funding Type</label>
                <div className="funding-options-grid">
                  {[
                    { id: 'NSFAS', label: 'NSFAS Bursary', desc: 'Direct DHET accommodation allowance settlement' },
                    { id: 'Private', label: 'Private Bursary', desc: 'Corporate, provincial, or trust fund sponsor' },
                    { id: 'Self-paying', label: 'Self-Paying', desc: 'Direct parent / guardian monthly payment' }
                  ].map((fund) => (
                    <label
                      key={fund.id}
                      className={`funding-box ${formData.bursary_type === fund.id ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="bursary_type"
                        value={fund.id}
                        checked={formData.bursary_type === fund.id}
                        onChange={(e) => updateField('bursary_type', e.target.value)}
                      />
                      <div>
                        <strong>{fund.label}</strong>
                        <p>{fund.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {formData.bursary_type === 'NSFAS' && (
                <div className="nsfas-extra-box card card-glass animate-fade-in">
                  <div className="nsfas-badge-row">
                    <span className="badge badge-nsfas">NSFAS Verification</span>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>NSFAS Status</label>
                      <select
                        className="form-select"
                        value={formData.nsfas_status}
                        onChange={(e) => updateField('nsfas_status', e.target.value)}
                      >
                        <option value="Approved">Approved for Funding</option>
                        <option value="Pending Verification">Pending Final Verification</option>
                        <option value="Awaiting Registration">Awaiting Registration Data</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        NSFAS Reference / Application Number <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. NSFAS-2026-88192"
                        value={formData.nsfas_reference}
                        onChange={(e) => updateField('nsfas_reference', e.target.value)}
                      />
                      {formErrors.nsfas_reference && (
                        <span className="form-error">{formErrors.nsfas_reference}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW & DECLARATION */}
          {currentStep === 4 && (
            <div className="wizard-step-content animate-fade-in">
              <div className="step-title-block">
                <h3>Step 4: Review Application & Declaration</h3>
                <p>Please double-check all details before final submission.</p>
              </div>

              {/* Review Summary Card */}
              <div className="summary-review-card card">
                <div className="summary-section">
                  <h5>Selected Residence</h5>
                  <div className="summary-row">
                    <span>Residence:</span>
                    <strong>{formData.accommodation}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Room Type:</span>
                    <strong>{formData.room_type}</strong>
                  </div>
                </div>

                <div className="summary-section">
                  <h5>Student Personal Information</h5>
                  <div className="summary-row">
                    <span>Full Name:</span>
                    <strong>{formData.name} {formData.surname}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Student Number:</span>
                    <strong>{formData.student_number}</strong>
                  </div>
                  <div className="summary-row">
                    <span>SA ID Number:</span>
                    <strong>{formData.id_number}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Email & Phone:</span>
                    <strong>{formData.email} • {formData.phone_number}</strong>
                  </div>
                </div>

                <div className="summary-section">
                  <h5>Funding & Bursary</h5>
                  <div className="summary-row">
                    <span>Bursary:</span>
                    <strong>{formData.bursary_type}</strong>
                  </div>
                  {formData.bursary_type === 'NSFAS' && (
                    <div className="summary-row">
                      <span>NSFAS Ref:</span>
                      <strong>{formData.nsfas_reference} ({formData.nsfas_status})</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="declaration-box">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.terms_accepted}
                    onChange={(e) => updateField('terms_accepted', e.target.checked)}
                  />
                  <span>
                    I confirm that I am a registered or enrolling student at VUT, the provided details are accurate, and I accept the accommodation residence rules and university code of conduct.
                  </span>
                </label>
                {formErrors.terms_accepted && (
                  <span className="form-error" style={{ marginTop: 8 }}>
                    {formErrors.terms_accepted}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION & VOUCHER */}
          {currentStep === 5 && confirmedBooking && (
            <div className="wizard-step-content confirmation-view animate-fade-in">
              <div className="confirmation-header text-center">
                <div className="conf-icon-wrap">
                  <CheckCircle2 size={48} className="text-success" />
                </div>
                <h2>Application Submitted Successfully!</h2>
                <p>
                  Your booking request has been registered with VUT Housing Services.
                </p>
              </div>

              {/* Official Booking Voucher */}
              <div className="booking-voucher card printable-voucher">
                <div className="voucher-top-bar">
                  <div className="voucher-brand">
                    <Building2 size={24} />
                    <span>VUT STUDENT HOUSING VOUCHER</span>
                  </div>
                  <span className="badge badge-warning">Status: Pending Review</span>
                </div>

                <div className="voucher-ref-box">
                  <span className="voucher-ref-label">Booking Reference Number</span>
                  <strong className="voucher-ref-number">{confirmedBooking.booking_ref}</strong>
                </div>

                <div className="voucher-grid">
                  <div className="voucher-item">
                    <span>Student Name</span>
                    <strong>{confirmedBooking.name} {confirmedBooking.surname}</strong>
                  </div>
                  <div className="voucher-item">
                    <span>Student Number</span>
                    <strong>{confirmedBooking.student_number}</strong>
                  </div>
                  <div className="voucher-item">
                    <span>Selected Residence</span>
                    <strong>{confirmedBooking.accommodation}</strong>
                  </div>
                  <div className="voucher-item">
                    <span>Funding Type</span>
                    <strong>{confirmedBooking.bursary_type}</strong>
                  </div>
                  <div className="voucher-item">
                    <span>Submission Date</span>
                    <strong>{new Date(confirmedBooking.registered_at).toLocaleString()}</strong>
                  </div>
                  <div className="voucher-item">
                    <span>Room Allocation</span>
                    <strong className="text-accent">Pending Admin Assignment</strong>
                  </div>
                </div>

                <div className="voucher-footer-instructions">
                  <h6>Next Steps:</h6>
                  <ol>
                    <li>A housing coordinator will verify your student and NSFAS status within 24–48 hours.</li>
                    <li>You will receive an automated room number assignment in your Student Dashboard.</li>
                    <li>Bring this booking reference number along with your ID card on move-in day.</li>
                  </ol>
                </div>
              </div>

              {/* Voucher Action Buttons */}
              <div className="voucher-actions-row">
                <button onClick={handlePrint} className="btn btn-outline">
                  <Printer size={16} />
                  <span>Print Booking Voucher</span>
                </button>
                <Link to="/dashboard" className="btn btn-primary">
                  <span>Go to Student Hub</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          {currentStep < 5 && (
            <div className="wizard-nav-footer">
              {currentStep > 1 ? (
                <button onClick={handleBack} className="btn btn-outline">
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button onClick={handleNext} className="btn btn-primary">
                  <span>Continue to Step {currentStep + 1}</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                  className="btn btn-secondary btn-lg"
                >
                  <Sparkles size={18} />
                  <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .booking-wizard-page {
          padding-bottom: 80px;
          background: var(--bg-main);
          min-height: 80vh;
        }

        .wizard-header {
          background: linear-gradient(180deg, #0b3b60 0%, #071e33 100%);
          color: white;
          padding: 44px 0 60px;
          text-align: center;
        }

        .wizard-header h1 {
          color: white;
          margin: 12px 0 8px;
        }

        .wizard-header p {
          color: #cbd5e1;
        }

        /* Stepper */
        .stepper-container {
          margin-top: -30px;
          margin-bottom: 30px;
        }

        .stepper-progress-track {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 16px 32px;
          box-shadow: var(--shadow-sm);
        }

        .stepper-node {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-light);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .stepper-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .stepper-node.current .stepper-icon-circle {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(11, 59, 96, 0.3);
        }

        .stepper-node.current {
          color: var(--primary);
          font-weight: 700;
        }

        .stepper-node.completed .stepper-icon-circle {
          background: var(--success-bg);
          color: var(--success);
        }

        .stepper-node.completed {
          color: var(--success-text);
        }

        /* Wizard Card */
        .wizard-card {
          padding: 36px 40px;
          max-width: 860px;
          margin: 0 auto;
        }

        .step-title-block {
          margin-bottom: 28px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        .step-title-block h3 {
          font-size: 1.35rem;
          margin-bottom: 6px;
        }

        .form-error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--danger-bg);
          color: var(--danger-text);
          border: 1px solid var(--danger-border);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        /* Residence picker */
        .residence-picker-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .residence-pick-card {
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
          transition: all var(--transition-fast);
          background: white;
        }

        .residence-pick-card img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .residence-pick-card.selected {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.2);
          background: var(--accent-light);
        }

        .pick-card-body {
          padding: 12px;
        }

        .pick-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 6px;
        }

        .pick-card-header h5 {
          font-size: 0.95rem;
          margin-bottom: 4px;
        }

        .pick-loc {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .pick-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .pick-price {
          color: var(--primary);
        }

        .pick-spaces {
          color: var(--success);
          font-size: 0.75rem;
        }

        /* Room type radio */
        .room-type-radio-group {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 12px;
        }

        .room-radio-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          cursor: pointer;
          background: white;
        }

        .room-radio-box.checked {
          border-color: var(--accent);
          background: var(--primary-light);
        }

        .room-radio-box input {
          margin-top: 3px;
        }

        /* Funding Options */
        .funding-options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 8px;
        }

        .funding-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          cursor: pointer;
          background: white;
        }

        .funding-box.active {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .funding-box input {
          margin-top: 4px;
        }

        .nsfas-extra-box {
          margin-top: 24px;
          padding: 20px;
          border: 1px solid #fde68a;
          background: #fffbeb;
        }

        .nsfas-badge-row {
          margin-bottom: 14px;
        }

        /* Summary Card */
        .summary-review-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: var(--bg-card-subtle);
          padding: 24px;
          margin-bottom: 24px;
        }

        .summary-section h5 {
          color: var(--primary);
          margin-bottom: 10px;
          font-size: 0.95rem;
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.9rem;
          padding: 4px 0;
        }

        .declaration-box {
          background: white;
          border: 1px solid var(--border);
          padding: 18px;
          border-radius: var(--radius-md);
        }

        /* Voucher View */
        .confirmation-view {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .conf-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-full);
          background: var(--success-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .booking-voucher {
          width: 100%;
          border: 2px dashed var(--border);
          border-radius: var(--radius-xl);
          padding: 32px;
          margin: 28px 0;
          background: #fafbfd;
        }

        .voucher-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .voucher-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-weight: 800;
          color: var(--primary);
        }

        .voucher-ref-box {
          text-align: center;
          background: var(--primary-light);
          padding: 16px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
        }

        .voucher-ref-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .voucher-ref-number {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.05em;
        }

        .voucher-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .voucher-item span {
          display: block;
          font-size: 0.78rem;
          color: var(--text-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .voucher-item strong {
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .voucher-footer-instructions {
          background: white;
          border: 1px solid var(--border);
          padding: 16px;
          border-radius: var(--radius-md);
        }

        .voucher-footer-instructions h6 {
          margin-bottom: 8px;
        }

        .voucher-footer-instructions ol {
          padding-left: 20px;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .voucher-actions-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Nav Footer */
        .wizard-nav-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 960px) {
          .residence-picker-grid {
            grid-template-columns: 1fr;
          }

          .funding-options-grid {
            grid-template-columns: 1fr;
          }

          .room-type-radio-group {
            grid-template-columns: 1fr;
          }

          .stepper-progress-track {
            padding: 12px 16px;
          }

          .stepper-label {
            display: none;
          }

          .wizard-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  )
}
