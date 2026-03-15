import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import MemberCard from '../features/MemberCard';
import CountUp from '../features/CountUp';
import { useSiteConfig } from '../../context/SiteConfigContext';
import '../../../styles/pages/about.css';

export default function AboutPage() {
  const config = useSiteConfig();
  const { data: members, loading, error } = usePublicApi(() => publicApi.getBandMembers(), []);
  const { data: stats } = usePublicApi(() => publicApi.getStats(), []);

  const currentMembers = members?.filter(m => {
    const hasActiveStint = m.stints?.some(s => !s.endDate);
    return hasActiveStint && !m.isGuest;
  }) || [];

  const pastMembers = members?.filter(m => {
    const allStintsEnded = m.stints?.length > 0 && m.stints.every(s => s.endDate);
    return allStintsEnded && !m.isGuest;
  }) || [];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">About the Band</h1>
          <p className="page-hero__subtitle">
            The story of {config.band.name}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-story">
            {(config.band?.story || []).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {(!config.band?.story || config.band.story.length === 0) && config.band?.description && (
              <p>{config.band.description}</p>
            )}
          </div>

          {stats && (
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
                  <div className="about-stat__label">Songs in Repertoire</div>
                </div>
              )}
              {stats.totalMembers > 0 && (
                <div className="about-stat">
                  <div className="about-stat__number"><CountUp end={stats.totalMembers} /></div>
                  <div className="about-stat__label">Band Members</div>
                </div>
              )}
              {stats.topVenues?.length > 0 && (
                <div className="about-stat">
                  <div className="about-stat__number"><CountUp end={stats.topVenues.length} /></div>
                  <div className="about-stat__label">Venues</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="section-title">The Band</h2>

          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load members</div>}

          {currentMembers.length > 0 && (
            <div className="about-members__grid stagger-children">
              {currentMembers.map(member => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}

          {pastMembers.length > 0 && (
            <>
              <h3 className="about-members__section-title">Alumni</h3>
              <div className="about-members__grid stagger-children">
                {pastMembers.map(member => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
