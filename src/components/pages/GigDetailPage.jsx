import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import { sameDay, formatDuration, getActiveMembersOnDate } from '../../utils/gig-helpers';
import '../../../styles/pages/gig-detail.css';

function formatSongDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseSetlistIntoSets(songs) {
  const sets = [];
  let current = null;
  let songNum = 0;

  for (const entry of songs) {
    if (entry.type === 'SET_BREAK') {
      if (current) sets.push(current);
      current = { label: entry.label || `Set ${sets.length + 1}`, songs: [], totalDuration: 0 };
      songNum = 0;
    } else if (entry.type === 'SONG' && entry.song) {
      if (!current) {
        current = { label: 'Set 1', songs: [], totalDuration: 0 };
      }
      songNum++;
      current.songs.push({ ...entry, number: songNum });
      if (entry.song.duration) {
        current.totalDuration += entry.song.duration;
      }
    }
  }
  if (current && current.songs.length > 0) sets.push(current);
  return sets;
}

export default function GigDetailPage() {
  const { id } = useParams();
  const { data: gig, loading: gigLoading, error: gigError } = usePublicApi(() => publicApi.getGig(id), [id]);
  const { data: allSetlists } = usePublicApi(() => publicApi.getSetlists(), []);
  const { data: allMembers } = usePublicApi(() => publicApi.getBandMembers(), []);
  const { data: archiveGigs } = usePublicApi(() => publicApi.getGigArchive(), []);

  // Find prev/next gigs (sorted by date descending in archive)
  const { prevGig, nextGig } = useMemo(() => {
    if (!archiveGigs || !gig) return {};
    const sorted = [...archiveGigs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const idx = sorted.findIndex(g => g.id === id);
    if (idx === -1) return {};
    return {
      prevGig: idx < sorted.length - 1 ? sorted[idx + 1] : null, // older
      nextGig: idx > 0 ? sorted[idx - 1] : null, // newer
    };
  }, [archiveGigs, gig, id]);

  const matchedSetlist = useMemo(() => {
    if (!gig || !allSetlists) return null;
    // If gig already has populated setlists, use those
    const gigHasSetlist = gig.setlists?.some(gs => gs.setlist?.songs?.length > 0);
    if (gigHasSetlist) return null; // will use gig's own setlists

    const gigDate = new Date(gig.date);
    // Match by same day and venue name containing
    return allSetlists.find(sl => {
      const slDate = new Date(sl.performedAt);
      if (!sameDay(gigDate, slDate)) return false;
      if (!sl.venue || !gig.venue) return false;
      return sl.venue.toLowerCase().includes(gig.venue.toLowerCase()) ||
        gig.venue.toLowerCase().includes(sl.venue.toLowerCase());
    });
  }, [gig, allSetlists]);

  const sets = useMemo(() => {
    // Prefer matched setlist from setlists.json
    if (matchedSetlist?.songs?.length > 0) {
      return parseSetlistIntoSets(matchedSetlist.songs);
    }
    // Fall back to gig's own setlists
    if (gig?.setlists?.length > 0) {
      const allSongs = [];
      for (const gs of gig.setlists) {
        if (gs.setlist?.songs) {
          allSongs.push(...gs.setlist.songs);
        }
      }
      if (allSongs.length > 0) return parseSetlistIntoSets(allSongs);
    }
    return [];
  }, [gig, matchedSetlist]);

  const lineup = useMemo(() => {
    if (!gig) return [];
    const gigDate = new Date(gig.date);

    // Use gig attendees if available
    const attending = gig.attendees?.filter(a => a.status === 'ATTENDING') || [];
    if (attending.length > 0) {
      return attending.map(a => ({
        id: a.bandMember?.id,
        name: a.bandMember?.name,
        imageUrl: a.bandMember?.imageUrl,
        instruments: a.bandMember?.instruments || [],
        isGuest: a.bandMember?.isGuest || false,
      }));
    }

    // Infer from band member stints
    if (!allMembers) return [];
    return getActiveMembersOnDate(allMembers, gigDate);
  }, [gig, allMembers]);

  const funFacts = useMemo(() => {
    if (sets.length === 0) return [];
    const facts = [];
    const allSongs = sets.flatMap(s => s.songs);
    const songsWithDuration = allSongs.filter(s => s.song?.duration);

    // Total songs & runtime
    const totalRuntime = songsWithDuration.reduce((sum, s) => sum + s.song.duration, 0);
    facts.push({
      label: 'Total Songs',
      value: `${allSongs.length}`,
      detail: totalRuntime > 0 ? `${formatDuration(totalRuntime)} of music` : null,
    });

    // Unique artists
    const artists = new Set(allSongs.map(s => s.song?.artist).filter(Boolean));
    const originalCount = [...artists].filter(a =>
      a.toLowerCase().includes('original')
    ).length;
    facts.push({
      label: 'Artists Covered',
      value: `${artists.size - originalCount}`,
      detail: originalCount > 0 ? `Plus ${originalCount} original${originalCount > 1 ? 's' : ''}` : null,
    });

    // Longest song
    if (songsWithDuration.length > 0) {
      const longest = songsWithDuration.reduce((a, b) =>
        a.song.duration > b.song.duration ? a : b
      );
      facts.push({
        label: 'Longest Song',
        value: longest.song.title,
        detail: `${formatSongDuration(longest.song.duration)} \u2014 ${longest.song.artist}`,
      });

      // Shortest song
      const shortest = songsWithDuration.reduce((a, b) =>
        a.song.duration < b.song.duration ? a : b
      );
      if (shortest.song.id !== longest.song.id) {
        facts.push({
          label: 'Shortest Song',
          value: shortest.song.title,
          detail: `${formatSongDuration(shortest.song.duration)} \u2014 ${shortest.song.artist}`,
        });
      }
    }

    // Longest set
    if (sets.length > 1) {
      const longestSet = sets.reduce((a, b) =>
        a.totalDuration > b.totalDuration ? a : b
      );
      facts.push({
        label: 'Longest Set',
        value: longestSet.label,
        detail: `${longestSet.songs.length} songs, ${formatDuration(longestSet.totalDuration)}`,
      });
    }

    // First time played (compare against other setlists)
    if (allSetlists && matchedSetlist) {
      const gigDate = new Date(gig.date);
      const otherSetlists = allSetlists.filter(sl => {
        const slDate = new Date(sl.performedAt);
        return slDate < gigDate && sl.id !== matchedSetlist.id;
      });
      const previousSongIds = new Set();
      for (const sl of otherSetlists) {
        for (const s of (sl.songs || [])) {
          if (s.song?.id) previousSongIds.add(s.song.id);
        }
      }
      const debuts = allSongs.filter(s => s.song?.id && !previousSongIds.has(s.song.id));
      if (debuts.length > 0) {
        facts.push({
          label: 'Debut Songs',
          value: `${debuts.length}`,
          detail: debuts.slice(0, 3).map(s => s.song.title).join(', ') +
            (debuts.length > 3 ? ` +${debuts.length - 3} more` : ''),
        });
      }
    }

    return facts;
  }, [sets, allSetlists, matchedSetlist, gig]);

  // Derived info
  const totalSongs = sets.reduce((n, s) => n + s.songs.length, 0);
  const totalDuration = sets.reduce((n, s) => n + s.totalDuration, 0);

  if (gigLoading) return <div className="loading" style={{ paddingTop: 'var(--space-4xl)' }}><div className="loading-spinner" /></div>;
  if (gigError) return <div className="error-message" style={{ paddingTop: 'var(--space-4xl)' }}>Gig not found</div>;
  if (!gig) return null;

  const date = new Date(gig.date);
  const isPast = date < new Date();
  const heroImage = gig.media?.find(m => m.type === 'image');

  return (
    <>
      {/* Hero */}
      <section className="gig-detail__hero">
        {heroImage && (
          <div
            className="gig-detail__hero-bg"
            style={{ backgroundImage: `url(${heroImage.url})` }}
          />
        )}
        <div className="container gig-detail__hero-content">
          <div className="badge badge--red" style={{ marginBottom: 'var(--space-sm)' }}>
            {isPast ? 'Past Show' : 'Upcoming Show'}
          </div>
          {gig.venue && (
            <h1 className="gig-detail__hero-venue">{gig.venue}</h1>
          )}
          <div className="gig-detail__hero-title">{gig.title}</div>
          <div className="gig-detail__hero-date">
            {format(date, 'EEEE, MMMM d, yyyy \u2014 h:mm a')}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">
          {/* Info Cards */}
          <div className="gig-detail__info-grid">
            <div className="gig-detail__info-card">
              <div className="gig-detail__info-label">Date</div>
              <div className="gig-detail__info-value">{format(date, 'MMM d')}</div>
              <div className="gig-detail__info-sub">{format(date, 'yyyy')}</div>
            </div>
            {gig.venue && (
              <div className="gig-detail__info-card">
                <div className="gig-detail__info-label">Venue</div>
                <div className="gig-detail__info-value">{gig.venue}</div>
                {gig.address && <div className="gig-detail__info-sub">{gig.address}</div>}
              </div>
            )}
            {totalSongs > 0 && (
              <div className="gig-detail__info-card">
                <div className="gig-detail__info-label">Songs</div>
                <div className="gig-detail__info-value">{totalSongs}</div>
                <div className="gig-detail__info-sub">{sets.length} set{sets.length !== 1 ? 's' : ''}</div>
              </div>
            )}
            {totalDuration > 0 && (
              <div className="gig-detail__info-card">
                <div className="gig-detail__info-label">Duration</div>
                <div className="gig-detail__info-value">{formatDuration(totalDuration)}</div>
                <div className="gig-detail__info-sub">of music</div>
              </div>
            )}
          </div>

          {/* Notes */}
          {gig.notes && (
            <div>
              <h3 className="gig-detail__section-title">Details</h3>
              <p className="gig-detail__notes">{gig.notes}</p>
            </div>
          )}

          {/* Lineup */}
          {lineup.length > 0 && (
            <div>
              <h3 className="gig-detail__section-title">Lineup</h3>
              <div className="gig-detail__lineup">
                {lineup.map((m, i) => (
                  <div key={m.id || i} className={`gig-detail__member${m.isGuest ? ' gig-detail__member--guest' : ''}`}>
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.name} className="gig-detail__member-photo" />
                    ) : (
                      <div className="gig-detail__member-placeholder">
                        {m.name?.charAt(0)}
                      </div>
                    )}
                    <span className="gig-detail__member-name">{m.name}</span>
                    <span className="gig-detail__member-instrument">
                      {m.instruments?.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setlist */}
          {sets.length > 0 && (
            <div className="gig-detail__setlist">
              <h3 className="gig-detail__section-title">Setlist</h3>
              {sets.map((set, i) => (
                <div key={i} className="gig-detail__set-card">
                  <div className="gig-detail__set-header">
                    <span className="gig-detail__set-name">{set.label}</span>
                    {set.totalDuration > 0 && (
                      <span className="gig-detail__set-duration">
                        {set.songs.length} songs &middot; {formatDuration(set.totalDuration)}
                      </span>
                    )}
                  </div>
                  <div className="gig-detail__set-songs">
                    {set.songs.map((entry, j) => (
                      <div key={j} className="gig-detail__song">
                        <span className="gig-detail__song-number">{entry.number}</span>
                        <span className="gig-detail__song-title">
                          {entry.song?.title || 'Unknown'}
                        </span>
                        {entry.song?.artist && (
                          <span className="gig-detail__song-artist">{entry.song.artist}</span>
                        )}
                        {entry.song?.duration && (
                          <span className="gig-detail__song-duration">
                            {formatSongDuration(entry.song.duration)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fun Facts */}
          {funFacts.length > 0 && (
            <div>
              <h3 className="gig-detail__section-title">Gig Stats</h3>
              <div className="gig-detail__facts">
                {funFacts.map((fact, i) => (
                  <div key={i} className="gig-detail__fact">
                    <div className="gig-detail__fact-label">{fact.label}</div>
                    <div className="gig-detail__fact-value">{fact.value}</div>
                    {fact.detail && <div className="gig-detail__fact-detail">{fact.detail}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media */}
          {gig.media?.length > 0 && (
            <div>
              <h3 className="gig-detail__section-title">Photos & Videos</h3>
              <div className="gig-detail__media-grid">
                {gig.media.map(m => (
                  <div key={m.id} className="gig-detail__media-item">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.caption || ''} className="gig-detail__media-img" loading="lazy" />
                    ) : (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="gig-detail__video-link">
                        {(() => {
                          const ytMatch = m.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                          return ytMatch ? (
                            <img src={`https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`} alt="Video thumbnail" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                          ) : null;
                        })()}
                        <span style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <span style={{ fontSize: 'var(--text-3xl)' }}>{'\u25B6'}</span>
                          <span style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {m.type === 'video' || m.type === 'youtube' ? 'Watch Video' : 'Open Link'}
                          </span>
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prev / Next Navigation */}
          <div className="gig-detail__nav">
            {prevGig ? (
              <Link to={`/shows/${prevGig.id}`} className="gig-detail__nav-link gig-detail__nav-link--prev">
                <span className="gig-detail__nav-arrow">&larr;</span>
                <span className="gig-detail__nav-info">
                  <span className="gig-detail__nav-label">Previous</span>
                  <span className="gig-detail__nav-title">{prevGig.title}</span>
                  <span className="gig-detail__nav-date">{format(new Date(prevGig.date), 'MMM d, yyyy')}</span>
                </span>
              </Link>
            ) : <div />}
            <Link to={isPast ? '/archive' : '/shows'} className="gig-detail__nav-back">
              All Shows
            </Link>
            {nextGig ? (
              <Link to={`/shows/${nextGig.id}`} className="gig-detail__nav-link gig-detail__nav-link--next">
                <span className="gig-detail__nav-info">
                  <span className="gig-detail__nav-label">Next</span>
                  <span className="gig-detail__nav-title">{nextGig.title}</span>
                  <span className="gig-detail__nav-date">{format(new Date(nextGig.date), 'MMM d, yyyy')}</span>
                </span>
                <span className="gig-detail__nav-arrow">&rarr;</span>
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>
    </>
  );
}
