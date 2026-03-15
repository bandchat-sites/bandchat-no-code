import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import GigCard from '../features/GigCard';
import { useSiteConfig } from '../../context/SiteConfigContext';
import '../../../styles/pages/gigs.css';
import '../../../styles/components/gig-card.css';

export default function GigsPage() {
  const config = useSiteConfig();
  const { data: gigs, loading, error } = usePublicApi(() => publicApi.getUpcomingGigs(), []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Upcoming Shows</h1>
          <p className="page-hero__subtitle">
            Catch {config.band.name} live at a venue near you
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load shows</div>}

          {gigs && gigs.length > 0 ? (
            <div className="gigs-page__list stagger-children">
              {gigs.map(gig => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="gigs-page__empty">
                <div className="gigs-page__empty-icon">&#127928;</div>
                <div className="gigs-page__empty-text">No upcoming shows at the moment</div>
                <p>Check back soon or follow us on social media for announcements.</p>
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}
