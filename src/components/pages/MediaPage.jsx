import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import localMediaPaths from 'virtual:local-media';
import '../../../styles/pages/media.css';

export default function MediaPage() {
  const { data: media, loading, error } = usePublicApi(() => publicApi.getMedia(), []);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const localImages = useMemo(() =>
    localMediaPaths.map((path, i) => {
      const filename = path.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      return { id: `local-${i}`, type: 'image', url: path, caption: filename };
    }), []);

  const images = useMemo(() => {
    const apiImages = (media || []).filter(m => m.type === 'image');
    return [...apiImages, ...localImages];
  }, [media, localImages]);
  const videos = (media || []).filter(m => m.type === 'video' || m.type === 'youtube');

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigate = useCallback((dir) => {
    setLightboxIndex(prev => {
      if (prev === null) return null;
      const next = prev + dir;
      return (next >= 0 && next < images.length) ? next : prev;
    });
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') navigate(-1);
      else if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, navigate]);

  // Touch swipe support for lightbox
  const touchStart = useRef(null);
  const swiped = useRef(false);
  const handleTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientX;
    swiped.current = false;
  }, []);
  const handleTouchEnd = useCallback((e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      navigate(diff > 0 ? 1 : -1);
      swiped.current = true;
    }
    touchStart.current = null;
  }, [navigate]);
  const handleLightboxClick = useCallback(() => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    closeLightbox();
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Media</h1>
          <p className="page-hero__subtitle">
            Photos and videos from our shows
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load media</div>}

          {media && media.length === 0 && localImages.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
              No media yet. Check back after our next show!
            </div>
          )}

          {images.length > 0 && (
            <>
              <h2 className="section-title">Photos</h2>
              <div className="media-grid">
                {images.map((item, i) => (
                  <div key={item.id || i} className="media-item" onClick={() => openLightbox(i)}>
                    <img src={item.url} alt={item.caption || ''} loading="lazy" />
                    <div className="media-item__overlay">
                      {item.caption && <div className="media-item__caption">{item.caption}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {videos.length > 0 && (
            <>
              <h2 className="section-title" style={{ marginTop: 'var(--space-3xl)' }}>Videos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
                {videos.map((item, i) => (
                  <a
                    key={item.id || i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="card__body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <span style={{ fontSize: 'var(--text-2xl)' }}>&#9654;</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.caption || item.gigTitle || 'Video'}</div>
                        {item.gigDate && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {new Date(item.gigDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="lightbox" onClick={handleLightboxClick} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <button className="lightbox__close" onClick={closeLightbox}>&times;</button>

          {lightboxIndex > 0 && (
            <button className="lightbox__nav lightbox__nav--prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); navigate(-1); }}>
              &lsaquo;
            </button>
          )}

          <img
            src={images[lightboxIndex].url}
            alt={images[lightboxIndex].caption || ''}
            className="lightbox__image"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < images.length - 1 && (
            <button className="lightbox__nav lightbox__nav--next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); navigate(1); }}>
              &rsaquo;
            </button>
          )}

          <div className="lightbox__counter">
            {lightboxIndex + 1} / {images.length}
          </div>

          {images[lightboxIndex].caption && (
            <div className="lightbox__caption">{images[lightboxIndex].caption}</div>
          )}
        </div>
      )}
    </>
  );
}
