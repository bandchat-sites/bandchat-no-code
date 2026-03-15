import { useState } from 'react';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';

export default function ContentManager() {
  const { data: songs } = usePublicApi(() => publicApi.getSongs(), []);
  const { data: members } = usePublicApi(() => publicApi.getBandMembers(), []);
  const { data: timeline } = usePublicApi(() => publicApi.getTimeline(), []);
  const [activeTab, setActiveTab] = useState('songs');

  const tabs = [
    { key: 'songs', label: 'Songs', count: songs?.length || 0 },
    { key: 'members', label: 'Members', count: members?.length || 0 },
    { key: 'timeline', label: 'Timeline', count: timeline?.length || 0 },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-xl)' }}>Content Manager</h1>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? 'btn--primary' : 'btn--secondary'} btn--sm`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card__body">
          {activeTab === 'songs' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Title</th>
                  <th style={{ padding: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Artist</th>
                  <th style={{ padding: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Key</th>
                </tr>
              </thead>
              <tbody>
                {songs?.map(song => (
                  <tr key={song.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--space-sm)', fontSize: 'var(--text-sm)' }}>{song.title}</td>
                    <td style={{ padding: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{song.artist}</td>
                    <td style={{ padding: 'var(--space-sm)', fontSize: 'var(--text-sm)' }}>{song.key || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'members' && (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {members?.map(member => (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm)', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{member.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{member.stints?.map(s => s.instrument).join(', ')}</div>
                  </div>
                  <span className={`badge badge--${member.isGuest ? 'amber' : 'default'}`}>
                    {member.isGuest ? 'Guest' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {timeline?.map(event => (
                <div key={event.id} style={{ padding: 'var(--space-sm)', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{event.date}</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{event.title}</div>
                  {event.description && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '4px' }}>{event.description}</div>}
                </div>
              ))}
            </div>
          )}

          {(!songs?.length && activeTab === 'songs') || (!members?.length && activeTab === 'members') || (!timeline?.length && activeTab === 'timeline') ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
              No data yet. Run the sync script to pull data from BandChat.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
