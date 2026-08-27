import React from 'react'
import { Link } from 'react-router-dom'
import { SearchX, ArrowRight } from 'lucide-react'

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'No Results Found',
  description = 'Try adjusting your filters or search keywords to find what you are looking for.',
  actionLabel,
  actionTo,
  onAction
}) {
  return (
    <div className="empty-state-card card animate-fade-in">
      <div className="empty-state-icon">
        <Icon size={44} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {(actionLabel && actionTo) && (
        <Link to={actionTo} className="btn btn-primary" style={{ marginTop: 16 }}>
          <span>{actionLabel}</span>
          <ArrowRight size={16} />
        </Link>
      )}
      {(actionLabel && onAction) && (
        <button onClick={onAction} className="btn btn-primary" style={{ marginTop: 16 }}>
          <span>{actionLabel}</span>
          <ArrowRight size={16} />
        </button>
      )}

      <style>{`
        .empty-state-card {
          text-align: center;
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 20px 0;
          background: white;
          border: 1px dashed var(--border);
        }
        .empty-state-icon {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          color: var(--text-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .empty-state-title {
          font-size: 1.3rem;
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .empty-state-desc {
          max-width: 480px;
          margin: 0 auto;
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
