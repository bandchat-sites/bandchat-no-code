import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import CountUp from '../features/CountUp';
import { useSiteConfig } from '../../context/SiteConfigContext';
import '../../../styles/pages/home.css';

export default function HomePage() {
  const config = useSiteConfig();
  const { data: gigs } = usePublicApi(() => publicApi.getUpcomingGigs(), []);
  const { data: stats } = usePublicApi(() => publicApi.getStats(), []);
  const [currentImage, setCurrentImage] = useState(0);
  const heroImages = config.images?.heroImages || [];

  const nextImage = useCallback(() => {
    if (heroImages.length === 0) return;
    setCurrentImage(prev => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  useEffect(() => {
    const timer = setInterval(nextImage, 6000);
    return () => clearInterval(timer);
  }, [nextImage]);

  const nextGig = gigs?.[0];

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          {heroImages.map((src, i) => (
            <div
              key={src}
              className={`hero__bg-image ${i === currentImage ? 'hero__bg-image--active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="hero__content">
          <img
            src={config.images.logo}
            alt={config.band.name}
            className="hero__logo"
          />
          <div className="hero__eyebrow">{config.band.tagline}</div>
          <p className="hero__subtitle">{config.band.description}</p>
          <div className="hero__actions">
            <Link to="/shows" className="btn btn--primary btn--lg">
              See Upcoming Shows
            </Link>
            <Link to="/about" className="btn btn--secondary btn--lg">
              Meet the Band
            </Link>
          </div>

          {nextGig && (
            <Link to={`/shows/${nextGig.id}`} className="next-gig-banner" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div>
                <div className="next-gig-banner__label">Next Show</div>
                <div className="next-gig-banner__title">{nextGig.title}</div>
                <div className="next-gig-banner__date">
                  {format(new Date(nextGig.date), 'EEEE, MMMM d')} at {nextGig.venue || 'TBA'}
                </div>
              </div>
              <span className="btn btn--primary btn--sm">Details &rarr;</span>
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="section">
          <div className="container">
            <div className="about-stats">
              {stats.totalGigs > 0 && (
                <div className="about-stat">
                  <div className="about-stat__number"><CountUp end={stats.totalGigs} /></div>
                  <div className="about-stat__label">Shows Played</div>
                </div>
              )}
              {stats.totalSongs > 0 && (
                <div className="about-stat">
                  <div className="about-stat__number"><CountUp end={stats.totalSongs} /></div>
                  <div className="about-stat__label">Songs</div>
                </div>
              )}
              {stats.totalMembers > 0 && (
                <div className="about-stat">
                  <div className="about-stat__number"><CountUp end={stats.totalMembers} /></div>
                  <div className="about-stat__label">Members</div>
                </div>
              )}
              {stats.topVenues?.length > 0 && (
                <div className="about-stat">
                  <div className="about-stat__number"><CountUp end={stats.topVenues.length} /></div>
                  <div className="about-stat__label">Venues</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Shows Preview */}
      {gigs && gigs.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <h2 className="section-title section-title--center">Upcoming Shows</h2>
            <div className="home-shows-list">
              {gigs.slice(0, 3).map(gig => (
                <Link
                  key={gig.id}
                  to={`/shows/${gig.id}`}
                  className="gig-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="gig-card__date">
                    <div className="gig-card__month">{format(new Date(gig.date), 'MMM')}</div>
                    <div className="gig-card__day">{format(new Date(gig.date), 'd')}</div>
                    <div className="gig-card__weekday">{format(new Date(gig.date), 'EEE')}</div>
                  </div>
                  <div className="gig-card__info">
                    <div className="gig-card__title">{gig.title}</div>
                    {gig.venue && <div className="gig-card__venue">{gig.venue}</div>}
                    <div className="gig-card__meta">
                      <span>{format(new Date(gig.date), 'h:mm a')}</span>
                    </div>
                  </div>
                  <div className="gig-card__actions">
                    <span className="gig-card__arrow">&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
            {gigs.length > 3 && (
              <div className="home-shows-more">
                <Link to="/shows" className="btn btn--secondary">View All Shows</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="home-cta">
            <h2 className="section-title section-title--center">Want Us at Your Event?</h2>
            <p className="home-cta__text">
              Corporate events, private parties, festivals, or your favorite bar.
              We bring the rock.
            </p>
            <Link to="/contact" className="btn btn--primary btn--lg">
              Book {config.band.name}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
