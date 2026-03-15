import { useMemo } from 'react';
import { format } from 'date-fns';
import { usePublicApi } from '../../hooks/usePublicApi';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { publicApi } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import '../../../styles/pages/timeline.css';

const TYPE_LABELS = {
  formation: 'Formation',
  first_gig: 'First Gig',
  gig: 'Gig',
  rehearsal: 'Rehearsal',
  member_joined: 'Member Joined',
  member_left: 'Member Left',
  album_release: 'Release',
  milestone: 'Milestone',
  custom: 'Event',
};

const MILESTONE_TYPES = ['formation', 'first_gig', 'milestone', 'album_release'];

// Assign colors to members deterministically
const MEMBER_COLORS = [
  '#ff3250', '#22c55e', '#3b82f6', '#f59e0b',
  '#a855f7', '#ec4899', '#06b6d4', '#ef4444',
  '#84cc16', '#8b5cf6', '#f97316', '#14b8a6',
];

function MemberTimeline({ members }) {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Find the earliest stint start year
  const allStints = members?.flatMap(m => m.stints || []) || [];
  if (allStints.length === 0) return null;

  const startDates = allStints.map(s => new Date(s.startDate));
  const minYear = Math.min(...startDates.map(d => d.getFullYear()));
  const years = [];
  for (let y = minYear; y <= currentYear; y++) years.push(y);

  const totalMonths = (currentYear - minYear + 1) * 12;

  const getOffset = (dateStr) => {
    const d = new Date(dateStr);
    return ((d.getFullYear() - minYear) * 12 + d.getMonth()) / totalMonths * 100;
  };

  const getWidth = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : now;
    const startMonth = (start.getFullYear() - minYear) * 12 + start.getMonth();
    const endMonth = (end.getFullYear() - minYear) * 12 + end.getMonth() + 1;
    return (endMonth - startMonth) / totalMonths * 100;
  };

  // Sort: current members first by join date, then former by join date + longest tenure
  const sorted = [...(members || [])].sort((a, b) => {
    const aActive = a.stints?.some(s => !s.endDate);
    const bActive = b.stints?.some(s => !s.endDate);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    const aStart = Math.min(...(a.stints || []).map(s => new Date(s.startDate).getTime()));
    const bStart = Math.min(...(b.stints || []).map(s => new Date(s.startDate).getTime()));

    if (aActive && bActive) {
      // Current members: by join date (earliest first)
      return aStart - bStart;
    }

    // Former members: by join date first, then longest tenure as tiebreaker
    if (aStart !== bStart) return aStart - bStart;
    const getTenure = (m) => (m.stints || []).reduce((total, s) => {
      const end = s.endDate ? new Date(s.endDate).getTime() : Date.now();
      return total + (end - new Date(s.startDate).getTime());
    }, 0);
    return getTenure(b) - getTenure(a);
  });

  return (
    <div className="member-timeline">
      <h2 className="section-title">Member History</h2>
      <div className="member-timeline__chart">
        {/* Year headers */}
        <div className="member-timeline__years">
          <div className="member-timeline__name-col" />
          <div className="member-timeline__bar-col">
            {years.map(y => (
              <span
                key={y}
                className={`member-timeline__year ${y === currentYear ? 'member-timeline__year--current' : ''}`}
                style={{ left: `${((y - minYear) * 12) / totalMonths * 100}%` }}
              >
                {y}
              </span>
            ))}
          </div>
        </div>

        {/* Member rows */}
        {sorted.map((member, mi) => {
          const color = MEMBER_COLORS[mi % MEMBER_COLORS.length];
          return (
            <div key={member.id} className="member-timeline__row">
              <div className="member-timeline__name-col">
                <span className="member-timeline__member-name">{member.name}</span>
              </div>
              <div className="member-timeline__bar-col">
                {(member.stints || []).map((stint, si) => {
                  const instruments = stint.instruments?.join(', ') || stint.role || '';
                  return (
                    <div
                      key={si}
                      className={`member-timeline__stint ${!stint.endDate ? 'member-timeline__stint--active' : ''}`}
                      style={{
                        left: `${getOffset(stint.startDate)}%`,
                        width: `${getWidth(stint.startDate, stint.endDate)}%`,
                        backgroundColor: color,
                      }}
                      title={`${member.name} — ${instruments} (${format(new Date(stint.startDate), 'yyyy')}–${stint.endDate ? format(new Date(stint.endDate), 'yyyy') : 'present'})`}
                    >
                      <span className="member-timeline__stint-label">{instruments}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const { data: events, loading, error } = usePublicApi(() => publicApi.getTimeline(), []);
  const { data: members } = usePublicApi(() => publicApi.getBandMembers(), []);
  const revealRef = useScrollReveal();

  // Group events by year for visual separation
  const groupedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    const groups = {};
    events.forEach(event => {
      const year = new Date(event.eventDate).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(event);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
  }, [events]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Our Story</h1>
          <p className="page-hero__subtitle">
            The history of {useSiteConfig().band.name}, one milestone at a time
          </p>
        </div>
      </section>

      {/* Member stint Gantt chart */}
      {members && members.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <MemberTimeline members={members.filter(m => !m.isGuest)} />
          </div>
        </section>
      )}

      {/* Timeline events */}
      <section className="section">
        <div className="container" ref={revealRef}>
          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load timeline</div>}

          {events && events.length === 0 && !members?.length && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
              Timeline coming soon.
            </div>
          )}

          {groupedEvents.length > 0 && (
            <div className="timeline">
              {groupedEvents.map(([year, yearEvents]) => (
                <div key={year} className="timeline__year-group">
                  <div className="timeline__year-marker reveal">
                    <span>{year}</span>
                  </div>
                  {yearEvents.map((event, i) => (
                    <div
                      key={event.id}
                      className={`timeline-item reveal ${i % 2 === 0 ? 'timeline-item--left' : 'timeline-item--right'}`}
                    >
                      <div className={`timeline-item__dot ${MILESTONE_TYPES.includes(event.eventType) ? 'timeline-item__dot--milestone' : ''}`} />
                      <div className="timeline-item__card">
                        <div className="timeline-item__date">
                          {format(new Date(event.eventDate), 'MMMM d, yyyy')}
                        </div>
                        <span className="timeline-item__type">
                          {TYPE_LABELS[event.eventType] || event.eventType}
                        </span>
                        <h3 className="timeline-item__title">{event.title}</h3>
                        {event.description && (
                          <p className="timeline-item__description">{event.description}</p>
                        )}
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="timeline-item__image"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
