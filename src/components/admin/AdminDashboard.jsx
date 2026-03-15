import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';

export default function AdminDashboard() {
  const { data: stats } = usePublicApi(() => publicApi.getStats(), []);

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-xl)' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
        <div className="card"><div className="card__body" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'var(--color-red)' }}>{stats?.totalGigs || 0}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Total Gigs</div>
        </div></div>
        <div className="card"><div className="card__body" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'var(--color-red)' }}>{stats?.totalSongs || 0}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Songs</div>
        </div></div>
        <div className="card"><div className="card__body" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'var(--color-red)' }}>{stats?.totalMembers || 0}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Members</div>
        </div></div>
        <div className="card"><div className="card__body" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', color: 'var(--color-red)' }}>{stats?.totalVenues || 0}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Venues</div>
        </div></div>
      </div>

      {stats?.lastUpdated && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Data last synced: {new Date(stats.lastUpdated).toLocaleString()}
        </p>
      )}

      <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card__body">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Sync Data</h3>
          <p style={{ marginBottom: 'var(--space-md)' }}>Run the sync script to pull latest data from BandChat:</p>
          <code style={{ display: 'block', background: 'var(--bg-primary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-amber)' }}>
            node scripts/sync.js
          </code>
        </div>
      </div>
    </div>
  );
}
