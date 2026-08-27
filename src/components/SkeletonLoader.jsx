import React from 'react'

export function AccommodationCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-media animate-pulse" />
      <div className="skeleton-body">
        <div className="skeleton-line sm animate-pulse" />
        <div className="skeleton-line lg animate-pulse" />
        <div className="skeleton-line md animate-pulse" />
        <div className="skeleton-footer">
          <div className="skeleton-line price animate-pulse" />
          <div className="skeleton-btn animate-pulse" />
        </div>
      </div>

      <style>{`
        .skeleton-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .skeleton-media {
          width: 100%;
          height: 210px;
          background: #e2e8f0;
        }

        .skeleton-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-line {
          height: 14px;
          background: #e2e8f0;
          border-radius: var(--radius-sm);
        }

        .skeleton-line.sm { width: 35%; height: 12px; }
        .skeleton-line.lg { width: 85%; height: 20px; }
        .skeleton-line.md { width: 60%; }
        .skeleton-line.price { width: 30%; height: 24px; }

        .skeleton-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .skeleton-btn {
          width: 80px;
          height: 36px;
          background: #e2e8f0;
          border-radius: var(--radius-md);
        }
      `}</style>
    </div>
  )
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <AccommodationCardSkeleton key={i} />
      ))}
    </div>
  )
}
