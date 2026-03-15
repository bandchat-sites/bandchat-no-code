import { format } from 'date-fns';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import '../../../styles/pages/community.css';

function AnnouncementCard({ announcement }) {
  const priorityClass = (announcement.priority === 'high' || announcement.priority === 'urgent')
    ? `announcement--${announcement.priority}`
    : '';

  return (
    <div className={`announcement ${priorityClass}`}>
      <div className="announcement__header">
        <h3 className="announcement__title">{announcement.title}</h3>
        {announcement.priority !== 'normal' && (
          <span className={`announcement__priority badge ${announcement.priority === 'urgent' ? 'badge--red' : 'badge--amber'}`}>
            {announcement.priority}
          </span>
        )}
      </div>
      <div className="announcement__content">{announcement.content}</div>
      <div className="announcement__date">
        {announcement.createdBy?.displayName} &middot; {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
      </div>
    </div>
  );
}

function PollCard({ poll }) {
  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt._count?.votes || 0), 0) || 0;

  return (
    <div className="poll">
      <h3 className="poll__question">{poll.question}</h3>
      {poll.description && <p className="poll__description">{poll.description}</p>}

      <div className="poll__options">
        {poll.options?.sort((a, b) => a.position - b.position).map(opt => {
          const votes = opt._count?.votes || 0;
          const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

          return (
            <div key={opt.id} className="poll-option">
              <div className="poll-option__bar" style={{ transform: `scaleX(${pct / 100})` }} />
              <div className="poll-option__content">
                <span className="poll-option__text">{opt.text}</span>
                <span className="poll-option__count">{votes} vote{votes !== 1 ? 's' : ''} ({Math.round(pct)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="poll__status">
        <span>{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</span>
        <span>{poll.isClosed ? 'Closed' : 'Open'}</span>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { data: announcements, loading: aLoading } = usePublicApi(() => publicApi.getAnnouncements(), []);
  const { data: polls, loading: pLoading } = usePublicApi(() => publicApi.getPolls(), []);

  const loading = aLoading || pLoading;
  const hasContent = (announcements?.length > 0) || (polls?.length > 0);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Community</h1>
          <p className="page-hero__subtitle">
            Announcements, polls, and what's happening with the band
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <div className="loading"><div className="loading-spinner" /></div>}

          {!loading && !hasContent && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
              Nothing to show right now. Check back soon!
            </div>
          )}

          {hasContent && (
            <div className="community-grid">
              <div>
                <h2 className="section-title">Announcements</h2>
                {announcements?.length === 0 && (
                  <p style={{ color: 'var(--text-muted)' }}>No announcements right now.</p>
                )}
                {announcements?.map(a => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>

              <div>
                <h2 className="section-title">Polls</h2>
                {polls?.length === 0 && (
                  <p style={{ color: 'var(--text-muted)' }}>No active polls.</p>
                )}
                {polls?.map(p => (
                  <PollCard key={p.id} poll={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
