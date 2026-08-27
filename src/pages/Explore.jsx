import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  X
} from 'lucide-react'
import { accommodationService } from '../services/accommodationService'
import AccommodationCard from '../components/AccommodationCard'
import SearchFilterBar from '../components/SearchFilterBar'
import EmptyState from '../components/EmptyState'
import { AccommodationCardSkeleton } from '../components/SkeletonLoader'

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('recommended') // 'recommended' | 'price-asc' | 'price-desc' | 'distance' | 'rating'

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    funding: searchParams.get('funding') || 'all',
    maxPrice: searchParams.get('maxPrice') || '6000',
    maxDistance: searchParams.get('maxDistance') || '10',
    roomType: searchParams.get('roomType') || 'all',
    verifiedOnly: searchParams.get('verified') === 'true',
    amenities: searchParams.getAll('amenity') || []
  })

  // Sync state back to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.funding && filters.funding !== 'all') params.set('funding', filters.funding)
    if (filters.maxPrice && filters.maxPrice !== '6000') params.set('maxPrice', filters.maxPrice)
    if (filters.maxDistance && filters.maxDistance !== '10') params.set('maxDistance', filters.maxDistance)
    if (filters.roomType && filters.roomType !== 'all') params.set('roomType', filters.roomType)
    if (filters.verifiedOnly) params.set('verified', 'true')
    filters.amenities?.forEach((a) => params.append('amenity', a))

    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Load and filter accommodations
  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        const results = await accommodationService.search(filters)
        setAccommodations(results)
      } catch (err) {
        console.error('Error fetching search results', err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [filters])

  // Sorted Results
  const sortedAccommodations = useMemo(() => {
    const list = [...accommodations]
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => (a.price_per_month || 0) - (b.price_per_month || 0))
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => (b.price_per_month || 0) - (a.price_per_month || 0))
    }
    if (sortBy === 'distance') {
      return list.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
    return list
  }, [accommodations, sortBy])

  const handleResetFilters = () => {
    setFilters({
      query: '',
      funding: 'all',
      maxPrice: '6000',
      maxDistance: '10',
      roomType: 'all',
      verifiedOnly: false,
      amenities: []
    })
  }

  const removeFilterTag = (key, value) => {
    if (key === 'amenities') {
      setFilters({
        ...filters,
        amenities: filters.amenities.filter((a) => a !== value)
      })
    } else if (key === 'funding') {
      setFilters({ ...filters, funding: 'all' })
    } else if (key === 'maxPrice') {
      setFilters({ ...filters, maxPrice: '6000' })
    } else if (key === 'maxDistance') {
      setFilters({ ...filters, maxDistance: '10' })
    } else if (key === 'roomType') {
      setFilters({ ...filters, roomType: 'all' })
    } else if (key === 'query') {
      setFilters({ ...filters, query: '' })
    } else if (key === 'verifiedOnly') {
      setFilters({ ...filters, verifiedOnly: false })
    }
  }

  return (
    <div className="explore-page">
      {/* Top Banner Header */}
      <section className="explore-header-section">
        <div className="container">
          <div className="explore-header-content">
            <span className="badge badge-primary">
              <Sparkles size={13} /> Official Housing Marketplace
            </span>
            <h1>Explore Student Residences</h1>
            <p>
              Browse and compare certified student accommodation around Vaal University of Technology campus.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="container explore-main-container">
        {/* Search & Filter Top Bar */}
        <SearchFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          totalResults={sortedAccommodations.length}
        />

        {/* Results Controls Bar */}
        <div className="results-control-bar">
          <div className="results-count-wrap">
            <h2>
              <strong>{sortedAccommodations.length}</strong>{' '}
              {sortedAccommodations.length === 1 ? 'residence' : 'residences'} available
            </h2>
            {filters.query && (
              <span className="query-display">for "{filters.query}"</span>
            )}
          </div>

          <div className="controls-right">
            {/* Sort Dropdown */}
            <div className="sort-dropdown-wrap">
              <label htmlFor="sortBySelect" className="sort-label">
                <ArrowUpDown size={15} /> Sort by:
              </label>
              <select
                id="sortBySelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recommended">Recommended</option>
                {filters.funding === 'self' && (
                  <>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </>
                )}
                <option value="distance">Nearest to VUT Campus</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid size={17} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(filters.query ||
          filters.funding !== 'all' ||
          filters.maxPrice < 6000 ||
          filters.maxDistance < 10 ||
          filters.roomType !== 'all' ||
          filters.verifiedOnly ||
          filters.amenities?.length > 0) && (
          <div className="active-chips-row">
            <span className="chips-title">Active Filters:</span>
            {filters.query && (
              <span className="filter-chip">
                Search: "{filters.query}"
                <button onClick={() => removeFilterTag('query')} aria-label="Remove search filter">
                  <X size={13} />
                </button>
              </span>
            )}
            {filters.funding !== 'all' && (
              <span className="filter-chip">
                Funding: {filters.funding.toUpperCase()}
                <button onClick={() => removeFilterTag('funding')} aria-label="Remove funding filter">
                  <X size={13} />
                </button>
              </span>
            )}
            {filters.maxPrice < 6000 && (
              <span className="filter-chip">
                Max R{Number(filters.maxPrice).toLocaleString()}
                <button onClick={() => removeFilterTag('maxPrice')} aria-label="Remove price filter">
                  <X size={13} />
                </button>
              </span>
            )}
            {filters.maxDistance < 10 && (
              <span className="filter-chip">
                Within {filters.maxDistance} km
                <button onClick={() => removeFilterTag('maxDistance')} aria-label="Remove distance filter">
                  <X size={13} />
                </button>
              </span>
            )}
            {filters.roomType !== 'all' && (
              <span className="filter-chip">
                Room: {filters.roomType}
                <button onClick={() => removeFilterTag('roomType')} aria-label="Remove room type filter">
                  <X size={13} />
                </button>
              </span>
            )}
            {filters.verifiedOnly && (
              <span className="filter-chip">
                Verified Only
                <button onClick={() => removeFilterTag('verifiedOnly')} aria-label="Remove verified filter">
                  <X size={13} />
                </button>
              </span>
            )}
            {filters.amenities?.map((amenity) => (
              <span key={amenity} className="filter-chip">
                {amenity}
                <button onClick={() => removeFilterTag('amenities', amenity)} aria-label={`Remove ${amenity} filter`}>
                  <X size={13} />
                </button>
              </span>
            ))}
            <button className="clear-all-chips-btn" onClick={handleResetFilters}>
              Clear All
            </button>
          </div>
        )}

        {/* Accommodation Results Grid / List */}
        {loading ? (
          <div className="grid-3">
            <AccommodationCardSkeleton />
            <AccommodationCardSkeleton />
            <AccommodationCardSkeleton />
            <AccommodationCardSkeleton />
            <AccommodationCardSkeleton />
            <AccommodationCardSkeleton />
          </div>
        ) : sortedAccommodations.length === 0 ? (
          <EmptyState
            title="No student residences found"
            description="We couldn't find any accommodations matching your current filter criteria. Try adjusting your budget, distance from campus, or clearing active filters."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className={viewMode === 'grid' ? 'grid-3' : 'list-view-grid'}>
            {sortedAccommodations.map((acc) => (
              <AccommodationCard key={acc.id} accommodation={acc} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .explore-page {
          padding-bottom: 80px;
          min-height: 80vh;
        }

        .explore-header-section {
          background: linear-gradient(180deg, #0b3b60 0%, #071e33 100%);
          color: white;
          padding: 48px 0 54px;
          border-bottom: 1px solid var(--border);
        }

        .explore-header-content {
          max-width: 680px;
        }

        .explore-header-content h1 {
          color: white;
          margin: 12px 0 10px;
        }

        .explore-header-content p {
          color: #cbd5e1;
          font-size: 1.05rem;
        }

        .explore-main-container {
          margin-top: -30px;
          position: relative;
          z-index: 10;
        }

        .results-control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .results-count-wrap h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
          margin: 0;
        }

        .query-display {
          color: var(--accent);
          margin-left: 6px;
          font-weight: 500;
        }

        .controls-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sort-dropdown-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 6px 14px;
        }

        .sort-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .sort-select {
          border: none;
          background: transparent;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
          outline: none;
          cursor: pointer;
        }

        .view-mode-toggle {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .view-btn {
          background: transparent;
          border: none;
          padding: 8px 12px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .view-btn.active {
          background: var(--primary-light);
          color: var(--primary);
        }

        /* Active Chips */
        .active-chips-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
          padding: 12px 16px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }

        .chips-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .filter-chip button {
          background: transparent;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
        }

        .filter-chip button:hover {
          color: var(--danger);
        }

        .clear-all-chips-btn {
          background: transparent;
          border: none;
          color: var(--danger);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          margin-left: 8px;
        }

        .clear-all-chips-btn:hover {
          text-decoration: underline;
        }

        .list-view-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
      `}</style>
    </div>
  )
}
