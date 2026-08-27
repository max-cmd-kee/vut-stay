import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Eye, EyeOff, UserPlus, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { landlordAuth } from '../services/authService'

const TITLES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']

const INITIAL = {
  title: 'Mr', name: '', surname: '', id_number: '',
  phone: '', email: '', password: '', confirm_password: ''
}

export default function LandlordRegister() {
  const [form, setForm]           = useState(INITIAL)
  const [showPwd, setShowPwd]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [fieldErrs, setFieldErrs] = useState({})

  const navigate = useNavigate()

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setFieldErrs((fe) => ({ ...fe, [k]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())    errs.name    = 'Required'
    if (!form.surname.trim()) errs.surname = 'Required'
    if (!/^\d{13}$/.test(form.id_number))
      errs.id_number = 'Must be exactly 13 digits'
    if (!/^\d{10}$/.test(form.phone))
      errs.phone = 'Must be exactly 10 digits'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Valid email required'
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
      await landlordAuth.register(payload)
      setSuccess('Account created! Redirecting to your portal…')
      setTimeout(() => navigate('/landlord', { replace: true }), 1500)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fe = fieldErrs

  return (
    <div className="auth-page landlord-login-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo-badge landlord-badge">
            <Home size={28} />
          </div>
          <div>
            <h1 className="auth-title">Landlord Registration</h1>
            <p className="auth-subtitle">VUT Homes — Property Owners</p>
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
          <div className="form-row-2" style={{ gridTemplateColumns: '100px 1fr' }}>
            <div className="form-group">
              <label htmlFor="lr-title">Title</label>
              <select id="lr-title" value={form.title} onChange={set('title')}>
                {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Field label="First Name" id="lr-name" error={fe.name}>
              <input id="lr-name" type="text" placeholder="First name" value={form.name} onChange={set('name')} />
            </Field>
          </div>

          <Field label="Surname" id="lr-surname" error={fe.surname}>
            <input id="lr-surname" type="text" placeholder="Last name" value={form.surname} onChange={set('surname')} />
          </Field>

          <div className="form-row-2">
            <Field label="SA ID Number (13 digits)" id="lr-id" error={fe.id_number}>
              <input id="lr-id" type="text" placeholder="8001015800085" maxLength={13} value={form.id_number} onChange={set('id_number')} />
            </Field>
            <Field label="Phone (10 digits)" id="lr-phone" error={fe.phone}>
              <input id="lr-phone" type="tel" placeholder="0821234567" maxLength={10} value={form.phone} onChange={set('phone')} />
            </Field>
          </div>

          <Field label="Email Address" id="lr-email" error={fe.email}>
            <input id="lr-email" type="email" placeholder="owner@example.co.za" value={form.email} onChange={set('email')} />
          </Field>

          <div className="form-row-2">
            <Field label="Password (min 8 chars)" id="lr-pwd" error={fe.password}>
              <div className="input-icon-right">
                <input id="lr-pwd" type={showPwd ? 'text' : 'password'} placeholder="Create password" value={form.password} onChange={set('password')} />
                <button type="button" className="icon-btn" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" id="lr-cpwd" error={fe.confirm_password}>
              <input id="lr-cpwd" type="password" placeholder="Repeat password" value={form.confirm_password} onChange={set('confirm_password')} />
            </Field>
          </div>

          <button type="submit" className="btn btn-primary w-full auth-submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
            {loading ? 'Creating account…' : 'Register as Landlord'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/landlord/login">Sign in here</Link>
        </p>
      </div>

      <style>{`
        .landlord-login-page { background: linear-gradient(135deg, #065f46 0%, #022c22 100%); }
        .landlord-badge { background: linear-gradient(135deg, #10b981, #059669) !important; }
        .auth-success {
          display: flex; align-items: center; gap: 8px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #16a34a; padding: 12px 16px; border-radius: var(--radius-md);
          font-size: 0.88rem; font-weight: 500; margin-bottom: 1.25rem;
        }
        .field-error { font-size: 0.78rem; color: #dc2626; font-weight: 600; margin-top: 3px; }
        .form-group input.has-error, .form-group select.has-error { border-color: #f87171; }
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
        background: linear-gradient(135deg, var(--primary) 0%, #0a2d4d 100%); padding: 2rem 1rem;
      }
      .auth-card {
        background: white; border-radius: var(--radius-xl); padding: 2.5rem 2rem;
        width: 100%; max-width: 500px; box-shadow: 0 24px 64px rgba(0,0,0,0.22);
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
        display: flex; align-items: center; gap: 8px; background: #fef2f2;
        border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px;
        border-radius: var(--radius-md); font-size: 0.88rem; font-weight: 500; margin-bottom: 1.25rem;
      }
      .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }
      .form-group { display: flex; flex-direction: column; gap: 6px; }
      .form-group label { font-size: 0.87rem; font-weight: 700; color: var(--text-main); }
      .form-group input, .form-group select {
        padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-md);
        font-size: 0.95rem; color: var(--text-main); background: var(--bg-main);
        transition: border-color var(--transition-fast); width: 100%; min-height: unset;
      }
      .form-group input:focus, .form-group select:focus {
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
