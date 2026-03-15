import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import { sameDay, formatDuration, getActiveMembersOnDate } from '../../utils/gig-helpers';
import '../../../styles/pages/archive.css';

function getSetlistStats(setlistSongs) {
  let songCount = 0;
  let totalDuration = 0;
  for (const entry of setlistSongs) {
    if (entry.type === 'SONG' && entry.song) {
      songCount++;
      if (entry.song.duration) totalDuration += entry.song.duration;
    }
  }
  return { songCount, totalDuration };
}

function MemberAvatars({ members, max = 6, className = '' }) {
  if (!members?.length) return null;
  return (
    <div className={`archive-gig__members ${className}`}>
      {members.slice(0, max).map(m => (
        m.imageUrl ? (
          <img key={m.id} src={m.imageUrl} alt={m.name} className="archive-gig__avatar" title={m.name} />
        ) : (
          <div key={m.id} className="archive-gig__avatar-placeholder" title={m.name}>
            {m.name?.charAt(0)}
          </div>
        )
      ))}
      {members.length > max && (
        <span className="archive-gig__member-count">+{members.length - max}</span>
      )}
    </div>
  );
}

function MetaStats({ extra }) {
  return (
    <>
      {extra.songCount > 0 && <span>{extra.songCount} songs</span>}
      {extra.totalDuration > 0 && <span>{formatDuration(extra.totalDuration)}</span>}
    </>
  );
}

const VIEWS = [
  { key: 'cards', label: 'Cards' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'accordion', label: 'Compact' },
];

export default function ArchivePage() {
  const [view, setView] = useState('cards');
  const [activeYear, setActiveYear] = useState(null);
  const [openYears, setOpenYears] = useState({});
  const { data: gigs, loading, error } = usePublicApi(() => publicApi.getGigArchive(), []);
  const { data: allSetlists } = usePublicApi(() => publicApi.getSetlists(), []);
  const { data: allMembers } = usePublicApi(() => publicApi.getBandMembers(), []);

  const gigExtras = useMemo(() => {
    if (!gigs) return {};
    const extras = {};
    for (const gig of gigs) {
      const gigDate = new Date(gig.date);
      let songCount = 0;
      let totalDuration = 0;

      const gigHasSetlist = gig.setlists?.some(gs => gs.setlist?.songs?.length > 0);
      if (gigHasSetlist) {
        for (const gs of gig.setlists) {
          if (gs.setlist?.songs) {
            const stats = getSetlistStats(gs.setlist.songs);
            songCount += stats.songCount;
            totalDuration += stats.totalDuration;
          }
        }
      } else if (allSetlists) {
        const matched = allSetlists.find(sl => {
          const slDate = new Date(sl.performedAt);
          if (!sameDay(gigDate, slDate)) return false;
          if (!sl.venue || !gig.venue) return false;
          return sl.venue.toLowerCase().includes(gig.venue.toLowerCase()) ||
            gig.venue.toLowerCase().includes(sl.venue.toLowerCase());
        });
        if (matched?.songs) {
          const stats = getSetlistStats(matched.songs);
          songCount = stats.songCount;
          totalDuration = stats.totalDuration;
        }
      }

      let members = [];
      if (allMembers) {
        members = getActiveMembersOnDate(allMembers, gigDate);
      }

      extras[gig.id] = { songCount, totalDuration, members };
    }
    return extras;
  }, [gigs, allSetlists, allMembers]);

  const gigsByYear = useMemo(() => {
    const map = {};
    if (gigs) {
      for (const gig of gigs) {
        const year = new Date(gig.date).getFullYear();
        if (!map[year]) map[year] = [];
        map[year].push(gig);
      }
    }
    return map;
  }, [gigs]);

  const years = useMemo(() => Object.keys(gigsByYear).sort((a, b) => b - a), [gigsByYear]);

  // Default active year to most recent
  const selectedYear = activeYear || years[0];

  // Default first year open in accordion
  const toggleYear = (year) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // Auto-open first year
  useEffect(() => {
    if (years.length > 0 && Object.keys(openYears).length === 0) {
      setOpenYears({ [years[0]]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years]);

  // ===== Card Grid View =====
  function renderCards() {
    const filteredGigs = selectedYear ? (gigsByYear[selectedYear] || []) : (gigs || []);
    return (
      <>
        <div className="archive-year-tabs">
          {years.map(year => (
            <button
              key={year}
              className={`archive-year-tab ${year === selectedYear ? 'archive-year-tab--active' : ''}`}
              onClick={() => setActiveYear(year)}
            >
              {year} ({gigsByYear[year].length})
            </button>
          ))}
        </div>
        <div className="archive-grid">
          {filteredGigs.map(gig => {
            const thumb = gig.media?.find(m => m.type === 'image');
            const extra = gigExtras[gig.id] || {};
            return (
              <Link
                key={gig.id}
                to={`/shows/${gig.id}`}
                className={`archive-card ${!thumb ? 'archive-card--no-image' : ''}`}
              >
                {thumb && (
                  <div className="archive-card__bg" style={{ backgroundImage: `url(${thumb.url})` }} />
                )}
                <div className="archive-card__content">
                  <div className="archive-card__date">
                    {format(new Date(gig.date), 'MMM d, yyyy')}
                  </div>
                  <div className="archive-card__title">{gig.title}</div>
                  {gig.venue && <div className="archive-card__venue">{gig.venue}</div>}
                  <div className="archive-card__stats">
                    <MetaStats extra={extra} />
                    {gig.media?.length > 0 && <span>{gig.media.length} media</span>}
                  </div>
                  <MemberAvatars members={extra.members} className="archive-card__members" />
                </div>
              </Link>
            );
          })}
        </div>
      </>
    );
  }

  // ===== Timeline View =====
  function renderTimeline() {
    return (
      <div className="archive-timeline">
        <div className="archive-timeline__line" />
        {years.map(year => (
          <div key={year}>
            <div className="archive-timeline__year">
              <span className="archive-timeline__year-badge">{year}</span>
            </div>
            {gigsByYear[year].map((gig, i) => {
              const thumb = gig.media?.find(m => m.type === 'image');
              const extra = gigExtras[gig.id] || {};
              return (
                <div key={gig.id} className="archive-timeline__item">
                  <div className="archive-timeline__dot" />
                  <Link to={`/shows/${gig.id}`} className="archive-timeline__card">
                    {thumb && (
                      <img src={thumb.url} alt="" className="archive-timeline__card-img" loading="lazy" />
                    )}
                    <div className="archive-timeline__card-body">
                      <div className="archive-timeline__card-date">
                        {format(new Date(gig.date), 'EEEE, MMM d')}
                      </div>
                      <div className="archive-timeline__card-title">{gig.title}</div>
                      {gig.venue && <div className="archive-timeline__card-venue">{gig.venue}</div>}
                      <div className="archive-timeline__card-meta">
                        <MetaStats extra={extra} />
                      </div>
                      <MemberAvatars members={extra.members} className="archive-timeline__card-members" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // ===== Accordion View =====
  function renderAccordion() {
    return (
      <div className="archive-accordion">
        {years.map(year => {
          const isOpen = openYears[year];
          return (
            <div key={year} className="archive-accordion__year">
              <button
                className={`archive-accordion__trigger ${isOpen ? 'archive-accordion__trigger--open' : ''}`}
                onClick={() => toggleYear(year)}
              >
                <div>
                  <span className="archive-accordion__year-label">{year}</span>
                  <span className="archive-accordion__year-count">
                    {' '}&mdash; {gigsByYear[year].length} show{gigsByYear[year].length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="archive-accordion__chevron">{'\u25BC'}</span>
              </button>
              {isOpen && (
                <div className="archive-accordion__content">
                  {gigsByYear[year].map(gig => {
                    const thumb = gig.media?.find(m => m.type === 'image');
                    const extra = gigExtras[gig.id] || {};
                    return (
                      <Link key={gig.id} to={`/shows/${gig.id}`} className="archive-accordion__gig">
                        {thumb && (
                          <img src={thumb.url} alt="" className="archive-accordion__gig-thumb" loading="lazy" />
                        )}
                        <span className="archive-accordion__gig-date">
                          {format(new Date(gig.date), 'MMM d')}
                        </span>
                        <span className="archive-accordion__gig-info">
                          <span className="archive-accordion__gig-title">{gig.title}</span>
                          {gig.venue && <span className="archive-accordion__gig-venue">{gig.venue}</span>}
                        </span>
                        <span className="archive-accordion__gig-stats">
                          {extra.songCount > 0 && <div>{extra.songCount} songs</div>}
                          {extra.totalDuration > 0 && <div>{formatDuration(extra.totalDuration)}</div>}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Gig Archive</h1>
          <p className="page-hero__subtitle">
            Every show we've ever played
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load archive</div>}

          {gigs && gigs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
              No past shows yet. The journey begins!
            </div>
          )}

          {gigs && gigs.length > 0 && (
            <>
              <div className="archive-views">
                {VIEWS.map(v => (
                  <button
                    key={v.key}
                    className={`archive-views__btn ${view === v.key ? 'archive-views__btn--active' : ''}`}
                    onClick={() => setView(v.key)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {view === 'cards' && renderCards()}
              {view === 'timeline' && renderTimeline()}
              {view === 'accordion' && renderAccordion()}
            </>
          )}
        </div>
      </section>
    </>
  );
}
