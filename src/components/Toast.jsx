import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type} animate-slide-in`}>
            <div className="toast-icon">
              {t.type === 'success' && <CheckCircle2 size={18} />}
              {t.type === 'error' && <AlertCircle size={18} />}
              {t.type === 'info' && <Info size={18} />}
            </div>
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Close notification">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 9999;
          max-width: 400px;
          width: calc(100% - 48px);
        }

        .toast-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: var(--radius-md);
          background: white;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-main);
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toast-success {
          border-left: 4px solid var(--success);
        }
        .toast-success .toast-icon {
          color: var(--success);
        }

        .toast-error {
          border-left: 4px solid var(--danger);
        }
        .toast-error .toast-icon {
          color: var(--danger);
        }

        .toast-info {
          border-left: 4px solid var(--accent);
        }
        .toast-info .toast-icon {
          color: var(--accent);
        }

        .toast-message {
          flex-grow: 1;
          line-height: 1.4;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 4px;
        }

        .toast-close:hover {
          color: var(--text-main);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
