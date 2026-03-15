import { useState, useMemo } from 'react';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import '../../../styles/pages/songs.css';

function SongRequestModal({ onClose }) {
  const [form, setForm] = useState({ title: '', artist: '', youtube: '' });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.artist.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/song-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          artist: form.artist.trim(),
          youtube: form.youtube.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send request');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="song-request-overlay" onClick={onClose}>
      <div className="song-request-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Request a song">
        <button className="song-request-modal__close" onClick={onClose} aria-label="Close">&times;</button>

        {submitted ? (
          <div className="song-request-modal__success">
            <div className="song-request-modal__success-icon">&#127928;</div>
            <h2 className="song-request-modal__title">Request Sent!</h2>
            <p className="song-request-modal__text">Thanks for the suggestion. We'll check it out!</p>
            <button className="song-request-modal__btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h2 className="song-request-modal__title">Request a Song</h2>
            <p className="song-request-modal__text">Want us to learn something new? Let us know!</p>
            <form className="song-request-modal__form" onSubmit={handleSubmit}>
              <div className="song-request-modal__field">
                <label className="song-request-modal__label" htmlFor="sr-title">Song Title</label>
                <input
                  id="sr-title"
                  className="song-request-modal__input"
                  type="text"
                  name="title"
                  placeholder="e.g. Bohemian Rhapsody"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="song-request-modal__field">
                <label className="song-request-modal__label" htmlFor="sr-artist">Artist</label>
                <input
                  id="sr-artist"
                  className="song-request-modal__input"
                  type="text"
                  name="artist"
                  placeholder="e.g. Queen"
                  value={form.artist}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="song-request-modal__field">
                <label className="song-request-modal__label" htmlFor="sr-youtube">YouTube Link <span className="song-request-modal__optional">(optional)</span></label>
                <input
                  id="sr-youtube"
                  className="song-request-modal__input"
                  type="url"
                  name="youtube"
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.youtube}
                  onChange={handleChange}
                />
              </div>
              {error && <div className="song-request-modal__error">{error}</div>}
              <button className="song-request-modal__btn" type="submit" disabled={sending}>
                {sending ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function SongsPage() {
  const { data: songs, loading, error } = usePublicApi(() => publicApi.getSongs(), []);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState('list');
  const [showRequest, setShowRequest] = useState(false);

  const filtered = useMemo(() => {
    if (!songs) return [];
    let result = songs;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        s => s.title?.toLowerCase().includes(q) || s.artist?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      if (sortBy === 'key') return (a.key || '').localeCompare(b.key || '');
      return 0;
    });

    return result;
  }, [songs, search, sortBy]);

  const groupedByArtist = useMemo(() => {
    if (viewMode !== 'byArtist') return null;
    const groups = {};
    filtered.forEach(song => {
      const artist = song.artist || 'Unknown Artist';
      if (!groups[artist]) groups[artist] = [];
      groups[artist].push(song);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, viewMode]);

  // Count unique artists
  const artistCount = useMemo(() => {
    if (!songs) return 0;
    return new Set(songs.map(s => s.artist).filter(Boolean)).size;
  }, [songs]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Songs</h1>
          <p className="page-hero__subtitle">
            {songs ? `${songs.length} songs from ${artistCount} artists` : 'Our full repertoire'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load songs</div>}

          {songs && songs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
              Song list coming soon.
            </div>
          )}

          {songs && songs.length > 0 && (
            <>
              <div className="songs-toolbar">
                <input
                  type="text"
                  className="songs-search"
                  placeholder="Search songs or artists..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="songs-sort">
                  <span className="songs-sort__label">Sort by:</span>
                  {['title', 'artist', 'key'].map(opt => (
                    <button
                      key={opt}
                      className={`songs-sort__btn ${sortBy === opt ? 'songs-sort__btn--active' : ''}`}
                      onClick={() => setSortBy(opt)}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  className={`songs-sort__btn ${viewMode === 'byArtist' ? 'songs-sort__btn--active' : ''}`}
                  onClick={() => setViewMode(prev => prev === 'list' ? 'byArtist' : 'list')}
                >
                  Group by Artist
                </button>
                <button className="songs-request-btn" onClick={() => setShowRequest(true)}>
                  Request a Song!
                </button>
              </div>

              <div className="songs-count">
                {filtered.length} {filtered.length === 1 ? 'song' : 'songs'}
                {search && ` matching "${search}"`}
              </div>

              {viewMode === 'byArtist' && groupedByArtist ? (
                groupedByArtist.map(([artist, artistSongs]) => (
                  <div key={artist} className="songs-artist-group">
                    <div className="songs-artist-group__header">
                      <span className="songs-artist-group__name">{artist}</span>
                      <span className="songs-artist-group__count">{artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}</span>
                    </div>
                    <div className="songs-grid">
                      {artistSongs.map(song => (
                        <div key={song.id} className="song-card">
                          <div className="song-card__main">
                            <div className="song-card__title">{song.title}</div>
                          </div>
                          <div className="song-card__meta">
                            {song.key && <span className="song-card__key">{song.key}</span>}
                            {song.bpm && <span className="song-card__bpm">{song.bpm} BPM</span>}
                            {song.duration && (
                              <span className="song-card__duration">
                                {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="songs-grid">
                  {filtered.map(song => (
                    <div key={song.id} className="song-card">
                      <div className="song-card__main">
                        <div className="song-card__title">{song.title}</div>
                        <div className="song-card__artist">{song.artist}</div>
                      </div>
                      <div className="song-card__meta">
                        {song.key && <span className="song-card__key">{song.key}</span>}
                        {song.bpm && <span className="song-card__bpm">{song.bpm} BPM</span>}
                        {song.duration && (
                          <span className="song-card__duration">
                            {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {showRequest && <SongRequestModal onClose={() => setShowRequest(false)} />}
    </>
  );
}
