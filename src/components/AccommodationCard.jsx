import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Bookmark,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Bed
} from 'lucide-react'
import { favoritesService } from '../services/favoritesService'
import { useToast } from './Toast'

export default function AccommodationCard({ accommodation }) {
  const { addToast } = useToast()
  const [isFav, setIsFav] = useState(() => favoritesService.isFavorite(accommodation.id))

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = favoritesService.toggleFavorite(accommodation.id)
    setIsFav(updated)
    addToast(
      updated
        ? `${accommodation.acc_name} added to your wishlist!`
        : `${accommodation.acc_name} removed from wishlist.`,
      updated ? 'success' : 'info'
    )
  }

  const primaryImage =
    accommodation.profile_img ||
    (accommodation.images && accommodation.images[0]) ||
    '/images/main-res.jpg'

  return (
    <div className="accommodation-card card card-hover">
      {/* Image Thumbnail Container */}
      <div className="card-image-wrap">
        <img
          src={primaryImage}
          alt={accommodation.acc_name}
          className="card-img"
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="card-badges-row">
          {accommodation.supports_nsfas && (
            <span className="badge badge-nsfas">
              <Sparkles size={11} /> NSFAS Accredited
            </span>
          )}
          {accommodation.is_verified && (
            <span className="badge badge-verified">
              <CheckCircle2 size={11} /> Verified
            </span>
          )}
        </div>

        {/* Favorite Bookmark Button */}
        <button
          onClick={handleFavoriteClick}
          className={`card-bookmark-btn ${isFav ? 'active' : ''}`}
          aria-label={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Bookmark size={17} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Distance from VUT Badge */}
        <div className="card-distance-pill">
          <MapPin size={12} />
          <span>{accommodation.distance_km ? `${accommodation.distance_km} km to VUT` : 'Near VUT Campus'}</span>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="card-body-content">
        {/* Title & Star Rating */}
        <div className="card-header-flex">
          <h3 className="card-title">
            <Link to={`/accommodation/${accommodation.id}`}>{accommodation.acc_name}</Link>
          </h3>
          <div className="card-rating">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{accommodation.rating || 4.8}</span>
          </div>
        </div>

        {/* Location subtitle */}
        <p className="card-location">
          <MapPin size={13} className="loc-pin" />
          <span>{accommodation.acc_location}</span>
        </p>

        {/* Capacity and Vacancy */}
        <div className="card-occupancy-row">
          <div className="occupancy-item">
            <Bed size={14} className="occupancy-icon" />
            <span>{accommodation.available_spaces ?? 0} beds available</span>
          </div>
          <span className="occupancy-sep">•</span>
          <span className="total-cap">{accommodation.acc_capacity} total cap</span>
        </div>

        {/* Feature Pills */}
        <div className="card-amenities-pills">
          {(accommodation.amenities || [
            'Wi-Fi',
            '24/7 Security',
            'Laundry',
            'Study Center'
          ])
            .slice(0, 3)
            .map((amenity, idx) => (
              <span key={idx} className="amenity-pill">
                {amenity}
              </span>
            ))}
        </div>

        <div className="card-divider" />

        {/* Card Footer: Price (self-paying only) or Funding Badge */}
        <div className="card-footer-flex">
          {accommodation.supports_self && accommodation.price_per_month ? (
            <div className="card-price-block">
              <span className="price-lbl">From</span>
              <div className="price-val-wrap">
                <span className="price-currency">R</span>
                <span className="price-amount">
                  {Number(accommodation.price_per_month).toLocaleString()}
                </span>
                <span className="price-period">/mo</span>
              </div>
            </div>
          ) : (
            <div className="card-funding-badge">
              {accommodation.supports_nsfas && accommodation.supports_other
                ? '🏛️ NSFAS & Bursary Covered'
                : accommodation.supports_nsfas
                ? '🏛️ 100% NSFAS Funded'
                : accommodation.supports_other
                ? '🎓 Bursary Covered'
                : '📋 Contact for Funding'}
            </div>
          )}

          <Link
            to={`/accommodation/${accommodation.id}`}
            className="btn btn-primary btn-sm card-view-btn"
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <style>{`
        .accommodation-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid var(--border);
          transition: all var(--transition-normal);
        }

        .card-image-wrap {
          position: relative;
          width: 100%;
          height: 210px;
          overflow: hidden;
          background: #0f172a;
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .accommodation-card:hover .card-img {
          transform: scale(1.05);
        }

        .card-badges-row {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }

        .card-bookmark-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          z-index: 2;
        }

        .card-bookmark-btn:hover {
          background: rgba(15, 23, 42, 0.9);
          transform: scale(1.1);
        }

        .card-bookmark-btn.active {
          background: var(--accent);
          color: white;
        }

        .card-distance-pill {
          position: absolute;
          bottom: 10px;
          left: 12px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(6px);
          color: #f8fafc;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-body-content {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-header-flex {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 0;
        }

        .card-title a {
          color: var(--text-main);
          text-decoration: none;
        }

        .card-title a:hover {
          color: var(--accent);
        }

        .card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          background: var(--bg-card-subtle);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .card-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: 12px;
        }

        .loc-pin {
          flex-shrink: 0;
        }

        .card-occupancy-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          margin-bottom: 14px;
        }

        .occupancy-item {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--success);
          font-weight: 600;
        }

        .occupancy-sep {
          color: var(--text-light);
        }

        .total-cap {
          color: var(--text-light);
        }

        .card-amenities-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .amenity-pill {
          background: var(--bg-card-subtle);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .card-divider {
          height: 1px;
          background: var(--border-subtle);
          margin-top: auto;
          margin-bottom: 14px;
        }

        .card-footer-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .price-lbl {
          display: block;
          font-size: 0.7rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .price-val-wrap {
          display: flex;
          align-items: baseline;
          color: var(--primary);
        }

        .price-currency {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .price-amount {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0 1px;
        }

        .price-period {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .card-view-btn {
          border-radius: var(--radius-md);
        }

        .card-funding-badge {
          font-size: 0.82rem;
          font-weight: 700;
          color: #065f46;
          background: #d1fae5;
          border: 1px solid #6ee7b7;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
