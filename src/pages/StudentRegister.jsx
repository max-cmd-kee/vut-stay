import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, Eye, EyeOff, UserPlus, AlertCircle, Loader2, CheckCircle2, MailCheck } from 'lucide-react'
import { studentAuth } from '../services/authService'

const BURSARY_TYPES = ['NSFAS', 'Merit Bursary', 'Self-paying', 'Other']
const YEARS_OF_STUDY = ['1st year', '2nd year', '3rd year', '4th year', 'Postgrad']
const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say']

const INITIAL = {
  name: '', surname: '', student_number: '', id_number: '',
  phone: '', email: '', dob: '', gender: '',
  year_of_study: '1st year',
  bursary_type: 'NSFAS', bursary_other: '',
  password: '', confirm_password: ''
}

export default function StudentRegister() {
  const [form, setForm]         = useState(INITIAL)
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [fieldErrs, setFieldErrs] = useState({})
  const [registered, setRegistered] = useState(false)

  const [params]       = useSearchParams()
  const redirectTarget = params.get('redirect') || '/dashboard'

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setFieldErrs((fe) => ({ ...fe, [k]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())    errs.name    = 'Required'
    if (!form.surname.trim()) errs.surname = 'Required'
    if (!/^\d{9}$/.test(form.student_number))
      errs.student_number = 'Must be exactly 9 digits'
    if (!/^\d{13}$/.test(form.id_number))
      errs.id_number = 'Must be exactly 13 digits'
    if (!/^\d{10}$/.test(form.phone))
      errs.phone = 'Must be exactly 10 digits'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Valid email required'
    if (!form.dob) errs.dob = 'Required'
    if (!form.gender) errs.gender = 'Required'
    if (!form.year_of_study) errs.year_of_study = 'Required'
    if (form.bursary_type === 'Other' && !form.bursary_other.trim())
      errs.bursary_other = 'Please tell us which bursary or payment method you will use'
    if (form.password.length < 8)
      errs.password = 'At least 8 characters required'
    if (form.password !== form.confirm_password)
      errs.confirm_password = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrs(errs)
      setError('Please fix the highlighted errors.')
      return
    }
    setLoading(true)
    try {
      const { confirm_password, ...payload } = form
      await studentAuth.register(payload)
      setRegistered(true)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo-badge confirm-badge"><MailCheck size={28} /></div>
            <div>
              <h1 className="auth-title">Confirm your email</h1>
              <p className="auth-subtitle">One more step to go</p>
            </div>
          </div>
          <p className="confirm-text">
            Your account has been created successfully. We've sent a confirmation
            link to <strong>{form.email}</strong>. Open that email and click the
            confirmation button to activate your account.
          </p>
          <p className="confirm-text muted">
            Didn't receive it? Check your spam folder, then try signing in — we'll
            resend the link if needed.
          </p>
          <Link
            to="/student/login"
            className="btn btn-primary w-full auth-submit"
            style={{ textDecoration: 'none' }}
          >
            Go to Sign In
          </Link>
          <style>{`
            .confirm-badge {
              background: linear-gradient(135deg, #10b981, #059669) !important;
            }
            .confirm-text {
              font-size: 0.95rem; line-height: 1.6;
              color: var(--text-main); margin: 0 0 1rem;
            }
            .confirm-text.muted { color: var(--text-muted); font-size: 0.85rem; }
          `}</style>
        </div>
      </div>
    )
  }

  const fe = fieldErrs

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">
          <div className="auth-logo-badge"><Building2 size={28} /></div>
          <div>
            <h1 className="auth-title">Create Student Account</h1>
            <p className="auth-subtitle">VUT Homes — Student Registration</p>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-success">
            <CheckCircle2 size={16} /><span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row-2">
            <Field label="First Name" id="reg-name" error={fe.name}>
              <input id="reg-name" type="text" placeholder="Thabo" value={form.name} onChange={set('name')} />
            </Field>
            <Field label="Surname" id="reg-surname" error={fe.surname}>
              <input id="reg-surname" type="text" placeholder="Molefe" value={form.surname} onChange={set('surname')} />
            </Field>
          </div>

          <div className="form-row-2">
            <Field label="Student Number (9 digits)" id="reg-snum" error={fe.student_number}>
              <input id="reg-snum" type="text" placeholder="221045892" maxLength={9} value={form.student_number} onChange={set('student_number')} />
            </Field>
            <Field label="SA ID Number (13 digits)" id="reg-id" error={fe.id_number}>
              <input id="reg-id" type="text" placeholder="0001015800085" maxLength={13} value={form.id_number} onChange={set('id_number')} />
            </Field>
          </div>

          <div className="form-row-2">
            <Field label="Phone Number (10 digits)" id="reg-phone" error={fe.phone}>
              <input id="reg-phone" type="tel" placeholder="0712345678" maxLength={10} value={form.phone} onChange={set('phone')} />
            </Field>
            <Field label="Email Address" id="reg-email" error={fe.email}>
              <input id="reg-email" type="email" placeholder="221045892@vut.ac.za" value={form.email} onChange={set('email')} />
            </Field>
          </div>

          <div className="form-row-2">
            <Field label="Date of Birth" id="reg-dob" error={fe.dob}>
              <input id="reg-dob" type="date" value={form.dob} onChange={set('dob')} />
            </Field>
            <Field label="Gender" id="reg-gender" error={fe.gender}>
              <select id="reg-gender" value={form.gender} onChange={set('gender')}>
                <option value="" disabled>Select gender…</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          <div className="form-row-2">
            <Field label="Year of Study" id="reg-year" error={fe.year_of_study}>
              <select id="reg-year" value={form.year_of_study} onChange={set('year_of_study')}>
                {YEARS_OF_STUDY.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Funding / Bursary Type" id="reg-bursary" error={fe.bursary_type}>
              <select id="reg-bursary" value={form.bursary_type} onChange={set('bursary_type')}>
                {BURSARY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {form.bursary_type === 'Other' && (
            <Field
              label="Which bursary or payment method will you use?"
              id="reg-bursary-other"
              error={fe.bursary_other}
            >
              <textarea
                id="reg-bursary-other"
                rows={3}
                placeholder="e.g. Gauteng City Region Academy bursary, employer sponsorship, parent-funded instalments…"
                value={form.bursary_other}
                onChange={set('bursary_other')}
              />
            </Field>
          )}

          <div className="form-row-2">
            <Field label="Password (min 8 chars)" id="reg-pwd" error={fe.password}>
              <div className="input-icon-right">
                <input id="reg-pwd" type={showPwd ? 'text' : 'password'} placeholder="Create password" value={form.password} onChange={set('password')} />
                <button type="button" className="icon-btn" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" id="reg-cpwd" error={fe.confirm_password}>
              <input id="reg-cpwd" type="password" placeholder="Repeat password" value={form.confirm_password} onChange={set('confirm_password')} />
            </Field>
          </div>

          <button type="submit" className="btn btn-primary w-full auth-submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
            {loading ? 'Creating account…' : 'Create My Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to={`/student/login${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}>
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
        .auth-card--wide { max-width: 580px; }
        .auth-success {
          display: flex; align-items: center; gap: 8px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #16a34a; padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.88rem; font-weight: 500; margin-bottom: 1.25rem;
        }
        .field-error {
          font-size: 0.78rem; color: #dc2626;
          font-weight: 600; margin-top: 3px;
        }
        .form-group input.has-error, .form-group select.has-error {
          border-color: #f87171;
        }
      `}</style>
      <AuthPageStyles />
    </div>
  )
}

function Field({ label, id, error, children }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(React.Children.only(children), {
        className: `${children.props.className || ''} ${error ? 'has-error' : ''}`.trim()
      })}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

function AuthPageStyles() {
  return (
    <style>{`
      .auth-page {
        min-height: 100vh; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, var(--primary) 0%, #0a2d4d 100%);
        padding: 2rem 1rem;
      }
      .auth-card {
        background: white; border-radius: var(--radius-xl); padding: 2.5rem 2rem;
        width: 100%; max-width: 440px; box-shadow: 0 24px 64px rgba(0,0,0,0.22);
      }
      .auth-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 2rem; }
      .auth-logo-badge {
        width: 52px; height: 52px; min-width: 52px;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white;
      }
      .auth-title { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: var(--primary); margin: 0; line-height: 1.1; }
      .auth-subtitle { font-size: 0.8rem; color: var(--text-muted); margin: 4px 0 0; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
      .auth-error {
        display: flex; align-items: center; gap: 8px;
        background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
        padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.88rem; font-weight: 500; margin-bottom: 1.25rem;
      }
      .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }
      .form-group { display: flex; flex-direction: column; gap: 6px; }
      .form-group label { font-size: 0.87rem; font-weight: 700; color: var(--text-main); }
      .form-group input, .form-group select, .form-group textarea {
        padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-md);
        font-size: 0.95rem; color: var(--text-main); background: var(--bg-main);
        transition: border-color var(--transition-fast); width: 100%; min-height: unset;
      }
      .form-group textarea { resize: vertical; font-family: inherit; }
      .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
        outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(2,132,199,0.12);
      }
      .input-icon-right { position: relative; }
      .input-icon-right input { padding-right: 44px; }
      .icon-btn {
        position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: flex;
      }
      .auth-submit { margin-top: 0.5rem; gap: 8px; justify-content: center; font-size: 1rem; }
      .auth-switch { text-align: center; margin-top: 1.25rem; font-size: 0.88rem; color: var(--text-muted); }
      .auth-switch a { color: var(--accent); font-weight: 700; text-decoration: none; }
      .auth-switch a:hover { text-decoration: underline; }
      .spin { animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .w-full { width: 100%; }
      .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      @media (max-width: 480px) { .form-row-2 { grid-template-columns: 1fr; } }
    `}</style>
  )
}
