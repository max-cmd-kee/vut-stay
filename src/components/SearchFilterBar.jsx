import React, { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X
} from 'lucide-react'

export default function SearchFilterBar({
  filters,
  onFilterChange,
  onReset
}) {
  const [expanded, setExpanded] = useState(false)

  const handleInputChange = (field, value) => {
    onFilterChange((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (amenity) => {
    const current = filters.amenities || []
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity]
    onFilterChange((prev) => ({ ...prev, amenities: updated }))
  }

  const AMENITY_OPTIONS = [
    'High-Speed Wi-Fi',
    '24/7 Security',
    'Free Shuttle',
    'Laundry Facilities',
    'Study Rooms',
    'Backup Generator',
    'Backup Water',
    'Furnished Rooms',
    'Secure Parking'
  ]

  return (
    <div className="search-filter-container card">
      {/* Primary Search Input Row */}
      <div className="primary-search-row">
        {/* Search Query Input */}
        <div className="search-input-box">
          <Search size={18} className="search-box-icon" />
          <input
            type="text"
            placeholder="Search by residence name, street, or Vanderbijlpark area (e.g. SE7, CW2)..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="search-main-input"
          />
          {filters.query && (
            <button
              onClick={() => handleInputChange('query', '')}
              className="search-clear-btn"
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Funding Dropdown */}
        <div className="filter-dropdown-box">
          <select
            value={filters.funding || 'all'}
            onChange={(e) => {
              // Reset maxPrice when changing away from self-paying
              const newFunding = e.target.value
              onFilterChange((prev) => ({
                ...prev,
                funding: newFunding,
                maxPrice: newFunding !== 'self' ? '6000' : prev.maxPrice
              }))
            }}
            className="filter-select"
          >
            <option value="all">All Funding Types</option>
            <option value="nsfas">NSFAS Accredited Only</option>
            <option value="other">Private Bursary</option>
            <option value="self">Self-Paying</option>
          </select>
        </div>

        {/* Toggle Filters Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`btn ${expanded ? 'btn-primary' : 'btn-outline'} toggle-filters-btn`}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {((filters.maxPrice && filters.maxPrice < 6000) ||
            (filters.maxDistance && filters.maxDistance < 10) ||
            filters.verifiedOnly ||
            (filters.amenities && filters.amenities.length > 0)) && (
            <span className="filters-active-dot" />
          )}
        </button>

        {/* Reset Filters Button */}
        <button
          onClick={onReset}
          className="btn-ghost reset-btn"
          title="Reset all filters"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Expanded Advanced Filters Drawer */}
      {expanded && (
        <div className="expanded-filters-panel animate-fade-in">
          <div className="filters-grid">
            {/* Max Monthly Budget Slider — only visible for self-paying filter */}
            {filters.funding === 'self' && (
            <div className="filter-group">
              <div className="filter-label-row">
                <label>Maximum Monthly Budget</label>
                <span className="filter-val-highlight">
                  R{Number(filters.maxPrice || 6000).toLocaleString()}/mo
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="6000"
                step="200"
                value={filters.maxPrice || 6000}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                className="range-slider"
              />
              <div className="range-hints">
                <span>R2,000</span>
                <span>R4,000</span>
                <span>R6,000+</span>
              </div>
            </div>
            )}

            {/* Distance to Campus Slider */}
            <div className="filter-group">
              <div className="filter-label-row">
                <label>Distance to VUT Campus</label>
                <span className="filter-val-highlight">
                  Within {filters.maxDistance || 10} km
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={filters.maxDistance || 10}
                onChange={(e) => handleInputChange('maxDistance', e.target.value)}
                className="range-slider"
              />
              <div className="range-hints">
                <span>&lt; 500m</span>
                <span>5 km</span>
                <span>10 km</span>
              </div>
            </div>

            {/* Room Type Selector */}
            <div className="filter-group">
              <label className="filter-group-label">Room Layout Type</label>
              <select
                value={filters.roomType || 'all'}
                onChange={(e) => handleInputChange('roomType', e.target.value)}
                className="filter-select"
              >
                <option value="all">Any Room Configuration</option>
                <option value="Single">Single Bedroom (Private)</option>
                <option value="Sharing">2-Sharing Standard</option>
                <option value="3-Sharing">3-Sharing / Multi</option>
              </select>
            </div>

            {/* Verified Housing Checkbox */}
            <div className="filter-group verified-toggle-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly || false}
                  onChange={(e) => handleInputChange('verifiedOnly', e.target.checked)}
                />
                <span>Show Only VUT Verified & Inspected Residences</span>
              </label>
            </div>
          </div>

          {/* Amenities Multi-Select Tags */}
          <div className="amenities-filter-row">
            <span className="amenities-filter-title">Required Amenities:</span>
            <div className="amenities-tags-wrap">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = (filters.amenities || []).includes(amenity)
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`amenity-chip-btn ${isSelected ? 'selected' : ''}`}
                  >
                    <span>{amenity}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-filter-container {
          padding: 16px 20px;
          margin-bottom: 24px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
        }

        .primary-search-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-input-box {
          flex: 2.2;
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 14px;
          min-width: 260px;
        }

        .search-box-icon {
          color: var(--text-light);
          flex-shrink: 0;
        }

        .search-main-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.95rem;
          color: var(--text-main);
          width: 100%;
        }

        .search-clear-btn {
          border: none;
          background: transparent;
          color: var(--text-light);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .filter-dropdown-box {
          flex: 1;
          min-width: 180px;
        }

        .filter-select {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 9px 14px;
          background: white;
          font-size: 0.9rem;
          color: var(--text-main);
          font-weight: 500;
          cursor: pointer;
        }

        .toggle-filters-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filters-active-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: var(--radius-full);
          position: absolute;
          top: 6px;
          right: 6px;
        }

        .reset-btn {
          padding: 8px 12px;
          color: var(--text-muted);
        }

        .reset-btn:hover {
          color: var(--danger);
        }

        /* Expanded drawer */
        .expanded-filters-panel {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr) 1.2fr;
          gap: 24px;
          align-items: center;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .filter-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .filter-val-highlight {
          color: var(--primary);
          font-weight: 700;
        }

        .range-slider {
          width: 100%;
          accent-color: var(--primary);
          cursor: pointer;
        }

        .range-hints {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-light);
        }

        .verified-toggle-group {
          padding-top: 12px;
        }

        /* Amenities tags */
        .amenities-filter-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .amenities-filter-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .amenities-tags-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .amenity-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 5px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .amenity-chip-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .amenity-chip-btn.selected {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        @media (max-width: 1024px) {
          .filters-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          .primary-search-row {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  )
}
