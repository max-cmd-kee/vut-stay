import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Home, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { landlordAuth } from '../services/authService'

export default function LandlordLogin() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const redirectTarget = params.get('redirect') || '/landlord'

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Email and password are required.'); return }
    setLoading(true)
    try {
      await landlordAuth.login(form.email, form.password)
      navigate(redirectTarget, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page landlord-login-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo-badge landlord-badge">
            <Home size={28} />
          </div>
          <div>
            <h1 className="auth-title">Landlord Portal</h1>
            <p className="auth-subtitle">VUT Homes — Property Owners</p>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="ll-email">Email Address</label>
            <input
              id="ll-email"
              type="email"
              placeholder="landlord@example.co.za"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ll-pwd">Password</label>
            <div className="input-icon-right">
              <input
                id="ll-pwd"
                type={showPwd ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                required
              />
              <button type="button" className="icon-btn" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full auth-submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
            {loading ? 'Signing in…' : 'Access Landlord Dashboard'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have a landlord account?{' '}
          <Link to="/landlord/register">Register here</Link>
        </p>
      </div>

      <style>{`
        .landlord-login-page {
          background: linear-gradient(135deg, #065f46 0%, #022c22 100%);
        }
        .landlord-badge {
          background: linear-gradient(135deg, #10b981, #059669) !important;
        }
      `}</style>
      <AuthPageStyles />
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
      .form-group input {
        padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-md);
        font-size: 0.95rem; color: var(--text-main); background: var(--bg-main);
        transition: border-color var(--transition-fast); width: 100%; min-height: unset;
      }
      .form-group input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(2,132,199,0.12); }
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
    `}</style>
  )
}
