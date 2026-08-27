import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { adminAuth } from '../services/authService'

export default function AdminLogin() {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const redirectTarget = params.get('redirect') || '/admin'

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) { setError('Username and password are required.'); return }
    setLoading(true)
    try {
      await adminAuth.login(form.username, form.password)
      navigate(redirectTarget, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page admin-login-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo-badge admin-badge">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="auth-title">Admin Portal</h1>
            <p className="auth-subtitle">Restricted Access — Staff Only</p>
          </div>
        </div>

        <div className="admin-notice">
          🔒 This portal is for authorised VUT Homes administrators only.
          Unauthorised access is prohibited.
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="al-user">Username or Email</label>
            <input
              id="al-user"
              type="text"
              placeholder="admin@prince"
              value={form.username}
              onChange={set('username')}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="al-pwd">Password</label>
            <div className="input-icon-right">
              <input
                id="al-pwd"
                type={showPwd ? 'text' : 'password'}
                placeholder="Admin password"
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

          <button type="submit" className="btn admin-submit-btn w-full" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
            {loading ? 'Authenticating…' : 'Access Admin Dashboard'}
          </button>
        </form>

        <p className="admin-footer-note">
          Default credentials set on first run. Contact the system owner if locked out.
        </p>
      </div>

      <style>{`
        .admin-login-page {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }
        .admin-badge {
          background: linear-gradient(135deg, #dc2626, #991b1b) !important;
        }
        .admin-notice {
          background: #fff7ed; border: 1px solid #fed7aa;
          color: #9a3412; padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.84rem; font-weight: 600;
          margin-bottom: 1.25rem; line-height: 1.5;
        }
        .admin-submit-btn {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white; border: none; padding: 13px 24px;
          border-radius: var(--radius-md); font-size: 1rem;
          font-weight: 700; cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s;
        }
        .admin-submit-btn:hover { opacity: 0.9; }
        .admin-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .admin-footer-note {
          text-align: center; margin-top: 1.25rem;
          font-size: 0.8rem; color: var(--text-muted);
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
      .spin { animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .w-full { width: 100%; }
    `}</style>
  )
}
