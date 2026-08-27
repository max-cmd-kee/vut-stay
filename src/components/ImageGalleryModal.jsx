import React, { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageGalleryModal({
  images = [],
  initialIndex = 0,
  title = 'Accommodation Gallery',
  onClose
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide, onClose])

  if (!images || images.length === 0) return null

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header bar */}
        <div className="gallery-top-bar">
          <div className="gallery-title-wrap">
            <h4>{title}</h4>
            <span className="gallery-counter">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <button className="gallery-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        {/* Main large image */}
        <div className="gallery-stage">
          {images.length > 1 && (
            <button className="gallery-arrow prev" onClick={prevSlide} aria-label="Previous image">
              <ChevronLeft size={28} />
            </button>
          )}

          <div className="gallery-image-container">
            <img
              src={images[currentIndex]}
              alt={`${title} - view ${currentIndex + 1}`}
              className="gallery-active-image animate-fade-in"
              key={currentIndex}
            />
          </div>

          {images.length > 1 && (
            <button className="gallery-arrow next" onClick={nextSlide} aria-label="Next image">
              <ChevronRight size={28} />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="gallery-thumbnail-strip">
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`gallery-thumb-btn ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .gallery-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .gallery-modal-content {
          width: 100%;
          max-width: 1100px;
          height: 85vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .gallery-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          color: white;
        }

        .gallery-title-wrap h4 {
          color: white;
          margin-bottom: 2px;
          font-size: 1.1rem;
        }

        .gallery-counter {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .gallery-close-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .gallery-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .gallery-stage {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          min-height: 0;
        }

        .gallery-image-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 40px;
        }

        .gallery-active-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .gallery-arrow {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all var(--transition-fast);
        }

        .gallery-arrow:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: scale(1.1);
        }

        .gallery-thumbnail-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding-top: 16px;
          overflow-x: auto;
        }

        .gallery-thumb-btn {
          width: 64px;
          height: 48px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 2px solid transparent;
          background: #1e293b;
          cursor: pointer;
          opacity: 0.6;
          padding: 0;
          transition: all var(--transition-fast);
        }

        .gallery-thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-thumb-btn:hover {
          opacity: 0.9;
        }

        .gallery-thumb-btn.active {
          opacity: 1;
          border-color: var(--accent);
          transform: scale(1.08);
        }

        @media (max-width: 640px) {
          .gallery-image-container {
            padding: 0;
          }
          .gallery-arrow {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  )
}
