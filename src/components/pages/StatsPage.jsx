import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import { useSiteConfig } from '../../context/SiteConfigContext';
import '../../../styles/pages/stats.css';

export default function StatsPage() {
  const config = useSiteConfig();
  const { data: stats, loading, error } = usePublicApi(() => publicApi.getStats(), []);
  const { data: songs } = usePublicApi(() => publicApi.getSongs(), []);
  const { data: archive } = usePublicApi(() => publicApi.getGigArchive(), []);

  // Most frequently played songs (by setlist appearances)
  const topSongs = useMemo(() => {
    if (!songs || songs.length === 0) return [];
    return songs
      .filter(s => (s._count?.setlistSongs || 0) > 0)
      .sort((a, b) => (b._count?.setlistSongs || 0) - (a._count?.setlistSongs || 0))
      .slice(0, 10);
  }, [songs]);

  // Fun facts computed from real data
  const funFacts = useMemo(() => {
    if (!songs || songs.length === 0) return [];
    const facts = [];
    const playedSongs = songs.filter(s => s.artist !== 'Original' && s.artist !== 'Original Mashup');

    // Unique artists
    const artists = [...new Set(playedSongs.map(s => s.artist))];
    facts.push({ icon: '\uD83C\uDFA4', text: `The repertoire spans ${artists.length} different artists, from Aerosmith to ZZ Top` });

    // Longest song
    const longest = [...playedSongs].sort((a, b) => (b.duration || 0) - (a.duration || 0))[0];
    if (longest) {
      const mins = Math.floor(longest.duration / 60);
      const secs = longest.duration % 60;
      facts.push({ icon: '\u23F1\uFE0F', text: `"${longest.title}" by ${longest.artist} is the longest song at ${mins}:${String(secs).padStart(2, '0')}` });
    }

    // Shortest song
    const shortest = [...playedSongs].filter(s => s.duration > 0).sort((a, b) => a.duration - b.duration)[0];
    if (shortest) {
      const mins = Math.floor(shortest.duration / 60);
      const secs = shortest.duration % 60;
      facts.push({ icon: '\u26A1', text: `Shortest song: "${shortest.title}" by ${shortest.artist} at just ${mins}:${String(secs).padStart(2, '0')}` });
    }

    // Fastest BPM
    const fastest = [...playedSongs].filter(s => s.bpm).sort((a, b) => b.bpm - a.bpm)[0];
    if (fastest) {
      facts.push({ icon: '\uD83D\uDD25', text: `"${fastest.title}" at ${fastest.bpm} BPM is the fastest song in the set \u2014 try keeping up on the dance floor` });
    }

    // Most played
    const mostPlayed = [...playedSongs].sort((a, b) => (b._count?.setlistSongs || 0) - (a._count?.setlistSongs || 0))[0];
    if (mostPlayed && mostPlayed._count?.setlistSongs > 0) {
      facts.push({ icon: '\uD83D\uDD01', text: `"${mostPlayed.title}" by ${mostPlayed.artist} is the all-time most-played song with ${mostPlayed._count.setlistSongs} performances` });
    }

    return facts;
  }, [songs]);

  // Gigs per year from archive
  const gigsPerYear = useMemo(() => {
    if (!archive || archive.length === 0) return [];
    const counts = {};
    archive.forEach(g => {
      const year = new Date(g.date).getFullYear();
      counts[year] = (counts[year] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => Number(a) - Number(b));
  }, [archive]);

  const maxGigsInYear = Math.max(...gigsPerYear.map(([, c]) => c), 1);

  // Scroll-triggered bar chart animation
  const [visibleSections, setVisibleSections] = useState(() => new Set());
  const observerRef = useRef(null);

  const chartRef = useCallback((node) => {
    if (!node) return;
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.dataset.chartId;
              setVisibleSections((prev) => {
                if (prev.has(id)) return prev;
                const next = new Set(prev);
                next.add(id);
                return next;
              });
              observerRef.current.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
    }
    observerRef.current.observe(node);
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const barWidth = (id, pct) => visibleSections.has(id) ? `${pct}%` : '0%';

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Stats</h1>
          <p className="page-hero__subtitle">
            {config.band?.name || config.bandName || 'Band'} by the numbers
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load stats</div>}

          {stats && (
            <>
              {/* Big numbers */}
              <div className="stats-grid">
                {stats.totalGigs > 0 && (
                  <div className="stat-card">
                    <div className="stat-card__number">{stats.totalGigs}</div>
                    <div className="stat-card__label">Shows Played</div>
                  </div>
                )}
                {stats.totalSongs > 0 && (
                  <div className="stat-card">
                    <div className="stat-card__number">{stats.totalSongs}</div>
                    <div className="stat-card__label">Songs in Repertoire</div>
                  </div>
                )}
                {stats.totalMembers > 0 && (
                  <div className="stat-card">
                    <div className="stat-card__number">{stats.totalMembers}</div>
                    <div className="stat-card__label">Band Members</div>
                  </div>
                )}
                {stats.totalVenues > 0 && (
                  <div className="stat-card">
                    <div className="stat-card__number">{stats.totalVenues}</div>
                    <div className="stat-card__label">Venues Played</div>
                  </div>
                )}
              </div>

              {/* Top Venues */}
              {stats.topVenues?.length > 0 && (
                <div className="stats-section">
                  <h2 className="section-title">Top Venues</h2>
                  <div className="stats-bar-chart" ref={chartRef} data-chart-id="venues">
                    {stats.topVenues.map((v, i) => (
                      <div key={i} className="stats-bar">
                        <div className="stats-bar__label">{v.venue}</div>
                        <div className="stats-bar__track">
                          <div
                            className="stats-bar__fill"
                            style={{ width: barWidth('venues', (v.count / stats.topVenues[0].count) * 100) }}
                          />
                        </div>
                        <div className="stats-bar__value">{v.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gigs per year */}
              {gigsPerYear.length > 0 && (
                <div className="stats-section">
                  <h2 className="section-title">Shows Per Year</h2>
                  <div className="stats-bar-chart" ref={chartRef} data-chart-id="gigs-per-year">
                    {gigsPerYear.map(([year, count]) => (
                      <div key={year} className="stats-bar">
                        <div className="stats-bar__label">{year}</div>
                        <div className="stats-bar__track">
                          <div
                            className="stats-bar__fill stats-bar__fill--amber"
                            style={{ width: barWidth('gigs-per-year', (count / maxGigsInYear) * 100) }}
                          />
                        </div>
                        <div className="stats-bar__value">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Most played songs */}
              {topSongs.length > 0 && (
                <div className="stats-section">
                  <h2 className="section-title">Most Played Songs</h2>
                  <div className="stats-bar-chart" ref={chartRef} data-chart-id="top-songs">
                    {topSongs.map(song => (
                      <div key={song.id} className="stats-bar">
                        <div className="stats-bar__label">{song.title}</div>
                        <div className="stats-bar__track">
                          <div
                            className="stats-bar__fill stats-bar__fill--red"
                            style={{ width: barWidth('top-songs', (song._count.setlistSongs / topSongs[0]._count.setlistSongs) * 100) }}
                          />
                        </div>
                        <div className="stats-bar__value">{song._count.setlistSongs} plays</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fun Facts */}
              {funFacts.length > 0 && (
                <div className="stats-section">
                  <h2 className="section-title">Fun Facts</h2>
                  <div className="fun-facts">
                    {funFacts.map((fact, i) => (
                      <div key={i} className="fun-fact">
                        <span className="fun-fact__icon">{fact.icon}</span>
                        <span className="fun-fact__text">{fact.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.lastUpdated && (
                <div className="stats-footer">
                  Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
