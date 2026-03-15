import { useState } from 'react';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';

export default function GuestListManager() {
  const { data: gigs } = usePublicApi(() => publicApi.getUpcomingGigs(), []);
  const [selectedGig, setSelectedGig] = useState(null);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-xl)' }}>Guest Lists</h1>

      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card__body">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Upcoming Gigs</h3>
          {gigs?.length ? (
            <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
              {gigs.map(gig => (
                <button
                  key={gig.id}
                  className={`btn ${selectedGig === gig.id ? 'btn--primary' : 'btn--secondary'} btn--sm`}
                  onClick={() => setSelectedGig(gig.id)}
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  {gig.title || gig.venue} — {new Date(gig.date).toLocaleDateString()}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No upcoming gigs.</p>
          )}
        </div>
      </div>

      {selectedGig && (
        <div className="card">
          <div className="card__body">
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Guest List</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Guest list management will be available once a backend is added. For now, guest signups can be collected via the contact form.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
