import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import '../../../styles/pages/setlists.css';

export default function SetlistsPage() {
  const { data: setlists, loading, error } = usePublicApi(() => publicApi.getSetlists(), []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Setlists</h1>
          <p className="page-hero__subtitle">
            What we play and how we play it
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load setlists</div>}

          {setlists && setlists.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
              No setlists available yet.
            </div>
          )}

          <div className="setlists-grid stagger-children">
            {setlists?.map(setlist => {
              const songs = setlist.songs?.filter(s => s.type === 'SONG') || [];
              return (
                <div key={setlist.id} className="setlist-card">
                  <div className="setlist-card__header">
                    <div>
                      <h3 className="setlist-card__name">{setlist.name}</h3>
                      {setlist.venue && (
                        <div className="setlist-card__meta">{setlist.venue}</div>
                      )}
                      {setlist.performedAt && (
                        <div className="setlist-card__meta">
                          {new Date(setlist.performedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <span className="badge badge--muted">{songs.length} songs</span>
                  </div>

                  <div className="setlist-card__songs">
                    {setlist.songs?.map((ss, i) => {
                      if (ss.type === 'SET_BREAK') {
                        return (
                          <div key={i} className="setlist-song setlist-song--break">
                            &mdash; Set Break &mdash;
                          </div>
                        );
                      }
                      if (ss.type === 'MC') {
                        return (
                          <div key={i} className="setlist-song setlist-song--mc">
                            <span className="setlist-song__number" />
                            <span className="setlist-song__title">{ss.label || 'MC'}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="setlist-song">
                          <span className="setlist-song__number">{ss.position}</span>
                          <span className="setlist-song__title">{ss.song?.title || 'Unknown'}</span>
                          {ss.song?.artist && <span className="setlist-song__artist">{ss.song.artist}</span>}
                          {ss.song?.key && <span className="setlist-song__key">{ss.song.key}</span>}
                        </div>
                      );
                    })}
                  </div>

                  {setlist.performers?.length > 0 && (
                    <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                      {setlist.performers.map((p, i) => (
                        <span key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                          {p.bandMember?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
