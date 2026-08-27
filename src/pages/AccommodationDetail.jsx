import React, { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  MapPin,
  Star,
  ShieldCheck,
  Sparkles,
  Bed,
  Users,
  CheckCircle2,
  Bookmark,
  Share2,
  Phone,
  Mail,
  ArrowLeft,
  Info,
  Building2,
  Image as ImageIcon
} from 'lucide-react'
import { accommodationService } from '../services/accommodationService'
import { favoritesService } from '../services/favoritesService'
import { useToast } from '../components/Toast'
import ImageGalleryModal from '../components/ImageGalleryModal'
import AccommodationCard from '../components/AccommodationCard'
import { AccommodationCardSkeleton } from '../components/SkeletonLoader'

export default function AccommodationDetail() {
  const { id } = useParams()
  const { addToast } = useToast()
  const location = useLocation()
  const backTarget = location.state?.from || '/explore'
  const backLabel = location.state?.label || 'Back to all residences'

  const [accommodation, setAccommodation] = useState(null)
  const [similarAccommodations, setSimilarAccommodations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryInitialIdx, setGalleryInitialIdx] = useState(0)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const item = await accommodationService.getById(id)
        setAccommodation(item)
        setIsFav(favoritesService.isFavorite(item.id))

        const all = await accommodationService.getAll()
        setSimilarAccommodations(
          all.filter((a) => String(a.id) !== String(item.id)).slice(0, 3)
        )
      } catch (err) {
        console.error('Failed to load accommodation detail', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
    window.scrollTo(0, 0)
  }, [id])

  const handleFavoriteToggle = () => {
    if (!accommodation) return
    const updated = favoritesService.toggleFavorite(accommodation.id)
    setIsFav(updated)
    addToast(
      updated
        ? `${accommodation.acc_name} saved to your wishlist!`
        : `${accommodation.acc_name} removed from wishlist.`,
      updated ? 'success' : 'info'
    )
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: accommodation?.acc_name,
          text: `Check out ${accommodation?.acc_name} for VUT student accommodation.`,
          url: window.location.href
        })
      } catch {
        // ignore share cancellation
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      addToast('Residence link copied to clipboard!', 'success')
    }
  }

  const openGallery = (index = 0) => {
    setGalleryInitialIdx(index)
    setGalleryOpen(true)
  }

  if (loading) {
    return (
      <div className="container section">
        <AccommodationCardSkeleton />
      </div>
    )
  }

  if (!accommodation) {
    return (
      <div className="container section text-center">
        <h2>Residence Not Found</h2>
        <p>The requested accommodation listing could not be loaded.</p>
        <Link to="/explore" className="btn btn-primary" style={{ marginTop: 16 }}>
          Return to Explore
        </Link>
      </div>
    )
  }

  const images = accommodation.images?.length
    ? accommodation.images
    : [accommodation.profile_img || '/images/main-res.jpg']

  return (
    <div className="detail-page">
      {/* Top Breadcrumbs & Action Bar */}
      <div className="detail-top-nav-bar">
        <div className="container top-nav-flex">
          <Link to={backTarget} className="back-link">
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </Link>

          <div className="top-actions-group">
            <button onClick={handleFavoriteToggle} className={`action-pill ${isFav ? 'fav-active' : ''}`}>
              <Bookmark size={16} fill={isFav ? 'currentColor' : 'none'} />
              <span>{isFav ? 'Saved' : 'Save to Wishlist'}</span>
            </button>
            <button onClick={handleShare} className="action-pill">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container detail-main-container">
        {/* Title & Metadata Header */}
        <div className="detail-header-block">
          <div className="badges-header-row">
            {accommodation.supports_nsfas && (
              <span className="badge badge-nsfas">
                <Sparkles size={12} /> NSFAS Accredited
              </span>
            )}
            {accommodation.is_verified && (
              <span className="badge badge-verified">
                <CheckCircle2 size={12} /> Verified VUT Housing
              </span>
            )}
            <span className="badge badge-primary">
              <MapPin size={12} /> {accommodation.distance_km || 0.8} km to Campus
            </span>
          </div>

          <h1 className="detail-title">{accommodation.acc_name}</h1>

          <div className="detail-sub-meta">
            <span className="meta-loc">
              <MapPin size={15} />
              {accommodation.acc_location}
            </span>
            <span className="meta-dot">•</span>
            <div className="meta-rating">
              <Star size={15} fill="#f59e0b" color="#f59e0b" />
              <strong>{accommodation.rating || 4.8}</strong>
              <span>({accommodation.reviews_count || 45} verified student reviews)</span>
            </div>
          </div>
        </div>

        {/* Hero Photo Grid with Lightbox Launcher */}
        <div className="photo-grid-layout">
          <div className="main-featured-photo" onClick={() => openGallery(0)}>
            <img src={images[0]} alt={accommodation.acc_name} />
            <div className="photo-overlay-tag">
              <ImageIcon size={14} /> Click to expand gallery
            </div>
          </div>

          <div className="side-photos-col">
            {images.slice(1, 4).map((img, idx) => (
              <div key={idx} className="side-photo-item" onClick={() => openGallery(idx + 1)}>
                <img src={img} alt={`${accommodation.acc_name} view ${idx + 2}`} />
              </div>
            ))}
            {/* If fewer than 4 images, fill with fallback thumbnail */}
            {images.length <= 2 && (
              <div className="side-photo-item" onClick={() => openGallery(0)}>
                <img src="/images/academia.jpg" alt="Interior view" />
              </div>
            )}
            <button className="view-all-photos-btn" onClick={() => openGallery(0)}>
              <ImageIcon size={16} />
              <span>View All {images.length} Photos</span>
            </button>
          </div>
        </div>

        {/* Two-Column Layout: Details Left & Sticky Booking Widget Right */}
        <div className="detail-grid-layout">
          {/* Left Column: Details */}
          <div className="detail-left-column">
            {/* Quick Stats Grid */}
            <div className="quick-stats-card card">
              <div className="stat-pill-item">
                <Users size={20} className="stat-pill-icon" />
                <div>
                  <span className="stat-pill-lbl">Capacity</span>
                  <strong>{accommodation.acc_capacity} Students</strong>
                </div>
              </div>

              <div className="stat-pill-item">
                <Bed size={20} className="stat-pill-icon text-success" />
                <div>
                  <span className="stat-pill-lbl">Available Now</span>
                  <strong className="text-success">{accommodation.available_spaces ?? 0} Spaces</strong>
                </div>
              </div>

              <div className="stat-pill-item">
                <MapPin size={20} className="stat-pill-icon text-accent" />
                <div>
                  <span className="stat-pill-lbl">Proximity</span>
                  <strong>{accommodation.campus_proximity || 'Near VUT Campus'}</strong>
                </div>
              </div>

              <div className="stat-pill-item">
                <ShieldCheck size={20} className="stat-pill-icon text-primary" />
                <div>
                  <span className="stat-pill-lbl">Security</span>
                  <strong>24/7 Guarded & Biometric</strong>
                </div>
              </div>
            </div>

            {/* Overview Description */}
            <section className="detail-section">
              <h3>About the Residence</h3>
              <p className="detail-description-text">
                {accommodation.acc_description ||
                  'Modern and safe student residence tailored specifically for Vaal University of Technology students. Located in a quiet, study-friendly environment with dedicated amenities.'}
              </p>
            </section>

            {/* Amenities Grid */}
            <section className="detail-section">
              <h3>Included Amenities & Services</h3>
              <div className="amenities-detail-grid">
                {(accommodation.amenities || [
                  'High-Speed Wi-Fi',
                  '24/7 Biometric Security',
                  'Laundry Facilities',
                  'Study Rooms',
                  'Backup Water System',
                  'Backup Generator',
                  'Furnished Rooms',
                  'Secure Parking'
                ]).map((amenity, idx) => (
                  <div key={idx} className="amenity-detail-card">
                    <CheckCircle2 size={18} className="amenity-check" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Available Room Configurations */}
            <section className="detail-section">
              <h3>Room Layouts & Options</h3>
              <div className="room-options-list">
                <div className="room-option-card">
                  <div className="room-info">
                    <h4>Single Bedroom (Private)</h4>
                    <p>Fully private room with study desk, built-in wardrobe, bookshelf, and single bed.</p>
                    <div className="room-features">
                      <span>• Private Study Desk</span>
                      <span>• Built-in Wardrobe</span>
                      <span>• High-Speed Wi-Fi</span>
                    </div>
                  </div>
                  <div className="room-price-cta">
                    {accommodation.price_per_month ? (
                      <span className="room-rate">R{Number(accommodation.price_per_month).toLocaleString()} <small>/mo</small></span>
                    ) : (
                      <span className="badge badge-success">NSFAS Covered</span>
                    )}
                  </div>
                </div>

                <div className="room-option-card">
                  <div className="room-info">
                    <h4>2-Sharing Standard Bedroom</h4>
                    <p>Spacious shared room with separate study desks, dual wardrobes, and twin beds.</p>
                    <div className="room-features">
                      <span>• Dual Study Desks</span>
                      <span>• Individual Storage</span>
                      <span>• High-Speed Wi-Fi</span>
                    </div>
                  </div>
                  <div className="room-price-cta">
                    {accommodation.price_per_month ? (
                      <span className="room-rate">R{Number(accommodation.price_per_month).toLocaleString()} <small>/mo</small></span>
                    ) : (
                      <span className="badge badge-success">NSFAS Covered</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Landlord / Provider Verification Card */}
            <section className="detail-section">
              <h3>Accredited Property Manager</h3>
              <div className="landlord-profile-card card">
                <div className="landlord-avatar-wrap">
                  <Building2 size={28} />
                </div>
                <div className="landlord-details">
                  <div className="landlord-name-row">
                    <h4>{accommodation.landlord?.name || 'VUT Accredited Housing'}</h4>
                    <span className="badge badge-verified">Verified Provider</span>
                  </div>
                  <p className="landlord-role">{accommodation.landlord?.title || 'Registered Property Manager'}</p>
                  <div className="landlord-contact-pills">
                    <a href={`tel:${accommodation.landlord?.phone || '0169509000'}`} className="contact-pill">
                      <Phone size={14} />
                      <span>{accommodation.landlord?.phone || '016 950 9000'}</span>
                    </a>
                    <a href={`mailto:${accommodation.landlord?.email || 'residences@vut.ac.za'}`} className="contact-pill">
                      <Mail size={14} />
                      <span>{accommodation.landlord?.email || 'residences@vut.ac.za'}</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Location & Map Preview */}
            <section className="detail-section">
              <h3>Location & Campus Proximity</h3>
              <div className="location-box card">
                <div className="location-header">
                  <MapPin size={20} className="text-accent" />
                  <div>
                    <strong>{accommodation.acc_location}</strong>
                    <p>{accommodation.campus_proximity || 'Located in Vanderbijlpark, close to VUT campuses.'}</p>
                  </div>
                </div>
                <div className="mock-map-preview">
                  <div className="map-inner-pin">
                    <MapPin size={32} className="text-danger animate-pulse" />
                    <span>{accommodation.acc_name}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Booking & Application Card */}
          <div className="detail-right-column">
            <div className="sticky-booking-widget card card-glass">
              <div className="widget-price-header">
                <div>
                  {accommodation.price_per_month ? (
                    <>
                      <span className="widget-price-label">Monthly Rate From</span>
                      <div className="widget-price">
                        <span className="curr">R</span>
                        <span className="val">{Number(accommodation.price_per_month).toLocaleString()}</span>
                        <span className="per">/ month</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="widget-price-label">Accommodation Funding</span>
                      <div className="widget-price funded">
                        <span className="val">
                          {accommodation.supports_nsfas ? 'NSFAS Funded' : accommodation.supports_other ? 'Bursary Funded' : 'Self-paying'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {accommodation.supports_nsfas && (
                  <span className="badge badge-nsfas">100% NSFAS</span>
                )}
              </div>

              {/* Vacancy Indicator */}
              <div className="widget-vacancy-box">
                <div className="vacancy-header">
                  <Bed size={16} className="text-success" />
                  <span>
                    <strong>{accommodation.available_spaces ?? 0} Spaces</strong> currently available
                  </span>
                </div>
                <div className="vacancy-progress-bar">
                  <div
                    className="vacancy-progress-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((accommodation.available_spaces ?? 0) / accommodation.acc_capacity) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* Funding Support Checklist */}
              <div className="widget-checklist">
                <div className="widget-check-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>NSFAS Private Accommodation Approved</span>
                </div>
                <div className="widget-check-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>No Upfront Deposit for NSFAS Students</span>
                </div>
                <div className="widget-check-item">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Uncapped Wi-Fi & Utilities Included</span>
                </div>
              </div>

              {/* Apply / Book CTA */}
              <div className="widget-cta-block">
                <Link
                  to={`/apply?accommodation_id=${accommodation.id}`}
                  className="btn btn-primary btn-lg w-full"
                >
                  <Sparkles size={18} />
                  <span>Apply for this Residence</span>
                </Link>

                <button onClick={handleFavoriteToggle} className="btn btn-outline w-full">
                  <Bookmark size={16} fill={isFav ? 'currentColor' : 'none'} />
                  <span>{isFav ? 'Saved in Wishlist' : 'Save for Later'}</span>
                </button>
              </div>

              <div className="widget-helpline">
                <Info size={14} />
                <span>Instant confirmation voucher upon online submission.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Residences Carousel */}
        {similarAccommodations.length > 0 && (
          <section className="section similar-residences-section">
            <div className="section-title text-left">
              <span className="badge badge-accent">Explore More</span>
              <h2>Similar Student Residences</h2>
              <p>Other popular student housing near VUT campus you might like.</p>
            </div>

            <div className="grid-3">
              {similarAccommodations.map((acc) => (
                <AccommodationCard key={acc.id} accommodation={acc} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {galleryOpen && (
        <ImageGalleryModal
          images={images}
          initialIndex={galleryInitialIdx}
          title={accommodation.acc_name}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      <style>{`
        .detail-page {
          padding-bottom: 80px;
          background: var(--bg-main);
        }

        .detail-top-nav-bar {
          background: white;
          border-bottom: 1px solid var(--border);
          padding: 12px 0;
        }

        .top-nav-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .back-link:hover {
          color: var(--primary);
        }

        .top-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-pill:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .action-pill.fav-active {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .detail-main-container {
          margin-top: 24px;
        }

        .detail-header-block {
          margin-bottom: 24px;
        }

        .badges-header-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .detail-title {
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          margin-bottom: 8px;
        }

        .detail-sub-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 0.95rem;
          color: var(--text-muted);
        }

        .meta-loc {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .meta-rating {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .meta-rating strong {
          color: var(--text-main);
        }

        /* Photo Grid Layout */
        .photo-grid-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          height: 440px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          margin-bottom: 40px;
          box-shadow: var(--shadow-md);
        }

        .main-featured-photo {
          position: relative;
          width: 100%;
          height: 100%;
          cursor: pointer;
          overflow: hidden;
          background: #0f172a;
        }

        .main-featured-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .main-featured-photo:hover img {
          transform: scale(1.03);
        }

        .photo-overlay-tag {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          color: white;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .side-photos-col {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }

        .side-photo-item {
          width: 100%;
          flex: 1;
          overflow: hidden;
          cursor: pointer;
          background: #0f172a;
        }

        .side-photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .side-photo-item:hover img {
          transform: scale(1.05);
        }

        .view-all-photos-btn {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: none;
          color: var(--text-main);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: all var(--transition-fast);
        }

        .view-all-photos-btn:hover {
          background: white;
          color: var(--accent);
          transform: translateY(-2px);
        }

        /* Detail Grid Layout */
        .detail-grid-layout {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .detail-left-column {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        /* Quick stats card */
        .quick-stats-card {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 20px 24px;
        }

        .stat-pill-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-pill-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        .stat-pill-lbl {
          display: block;
          font-size: 0.75rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }

        .stat-pill-item strong {
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .detail-section h3 {
          font-size: 1.3rem;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
        }

        .detail-description-text {
          font-size: 1.05rem;
          color: var(--text-main);
          line-height: 1.75;
        }

        /* Amenities detail grid */
        .amenities-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .amenity-detail-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .amenity-check {
          color: var(--success);
          flex-shrink: 0;
        }

        /* Room options */
        .room-options-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .room-option-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .room-info h4 {
          margin-bottom: 4px;
        }

        .room-info p {
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .room-features {
          display: flex;
          gap: 14px;
          font-size: 0.82rem;
          color: var(--accent);
          font-weight: 600;
        }

        .room-price-cta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }

        .room-rate {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--primary);
        }

        .room-rate small {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Landlord Card */
        .landlord-profile-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
        }

        .landlord-avatar-wrap {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .landlord-details {
          flex-grow: 1;
        }

        .landlord-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .landlord-role {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .landlord-contact-pills {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .contact-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          text-decoration: none;
        }

        .contact-pill:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        /* Mock Map */
        .location-box {
          padding: 20px;
        }

        .location-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .mock-map-preview {
          height: 220px;
          background: #e2e8f0 url('/images/vut_back.jpg') center/cover;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .mock-map-preview::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
        }

        .map-inner-pin {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        /* Sticky Booking Widget */
        .sticky-booking-widget {
          position: sticky;
          top: calc(var(--header-height) + 24px);
          border: 1px solid var(--border);
          padding: 28px;
          box-shadow: var(--shadow-lg);
        }

        .widget-price-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .widget-price-label {
          font-size: 0.75rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
        }

        .widget-price {
          display: flex;
          align-items: baseline;
          color: var(--primary);
        }

        .widget-price .curr { font-size: 1.1rem; font-weight: 700; }
        .widget-price .val {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
        }
        .widget-price .per {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-left: 4px;
        }

        .widget-price.funded .val {
          font-size: 1.3rem;
          color: var(--success);
        }

        .widget-vacancy-box {
          background: var(--bg-card-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          margin-bottom: 20px;
        }

        .vacancy-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          margin-bottom: 8px;
        }

        .vacancy-progress-bar {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .vacancy-progress-fill {
          height: 100%;
          background: var(--success);
          border-radius: var(--radius-full);
        }

        .widget-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }

        .widget-check-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-main);
        }

        .widget-cta-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .widget-helpline {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--text-light);
          margin-top: 16px;
          text-align: center;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .detail-grid-layout {
            grid-template-columns: 1fr;
          }

          .quick-stats-card {
            grid-template-columns: repeat(2, 1fr);
          }

          .photo-grid-layout {
            height: 340px;
          }
        }

        @media (max-width: 640px) {
          .photo-grid-layout {
            grid-template-columns: 1fr;
            height: 240px;
          }

          .side-photos-col {
            display: none;
          }

          .quick-stats-card {
            grid-template-columns: 1fr;
          }

          .amenities-detail-grid {
            grid-template-columns: 1fr;
          }

          .room-option-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .room-price-cta {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
