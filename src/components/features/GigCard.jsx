import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import '../../../styles/components/gig-card.css';

export default function GigCard({ gig, compact = false }) {
  const date = new Date(gig.date);
  const statusColors = {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };

  return (
    <Link
      to={`/shows/${gig.id}`}
      className={`gig-card ${compact ? 'gig-card--compact' : ''}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="gig-card__date">
        <div className="gig-card__month">{format(date, 'MMM')}</div>
        <div className="gig-card__day">{format(date, 'd')}</div>
        <div className="gig-card__weekday">{format(date, 'EEE')}</div>
      </div>

      <div className="gig-card__info">
        <div className="gig-card__title">{gig.title}</div>
        {gig.venue && (
          <div className="gig-card__venue">{gig.venue}</div>
        )}
        <div className="gig-card__meta">
          <span>{format(date, 'h:mm a')}</span>
          {gig.type && gig.type !== 'GIG' && (
            <span className="badge badge--muted">{gig.type}</span>
          )}
          {gig.status && (
            <span className="gig-card__status">
              <span className={`gig-card__status-dot gig-card__status-dot--${statusColors[gig.status] || 'scheduled'}`} />
              {gig.status.toLowerCase()}
            </span>
          )}
        </div>
      </div>

      <div className="gig-card__actions">
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)' }}>&rarr;</span>
      </div>
    </Link>
  );
}
