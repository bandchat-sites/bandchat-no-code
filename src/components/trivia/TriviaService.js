// Band Trivia Service — data-driven, no hardcoded band-specific content
export class TriviaService {
  constructor() {
    this.trivia = [];
    this.lastIndex = -1;
  }

  initFromConfig(config) {
    this.trivia.push(
      { category: 'bandFact', text: `${config.band.name} is a ${config.band.genre.toLowerCase()} band based in ${config.band.location}.` },
      { category: 'bandFact', text: `${config.band.name} brings the music to life on stages across ${config.band.location.split(',')[0]}.` },
    );
  }

  getRandomTrivia() {
    if (this.trivia.length <= 1) {
      return this.trivia[0] || { category: 'bandFact', text: 'Rock on!' };
    }

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.trivia.length);
    } while (newIndex === this.lastIndex);

    this.lastIndex = newIndex;
    return this.trivia[newIndex];
  }

  addDynamicTrivia(stats, bandName) {
    if (!stats) return;

    if (stats.totalGigs > 0) {
      this.trivia.push({
        category: 'bandFact',
        text: `${bandName} has played ${stats.totalGigs} shows and counting!`,
      });
    }
    if (stats.totalSongs > 0) {
      this.trivia.push({
        category: 'bandFact',
        text: `The band has ${stats.totalSongs} songs in their repertoire.`,
      });
    }
    if (stats.topVenues?.length > 0) {
      const top = stats.topVenues[0];
      this.trivia.push({
        category: 'venueStory',
        text: `${top.venue} is the band's most-played venue with ${top.count} shows.`,
      });
    }
  }

  addSongTrivia(songs, bandName) {
    if (!songs || songs.length === 0) return;

    const played = songs.filter(s => s.artist !== 'Original' && s.artist !== 'Original Mashup');
    const artists = [...new Set(played.map(s => s.artist))];

    this.trivia.push({
      category: 'bandFact',
      text: `The ${bandName} repertoire spans ${artists.length} different artists.`,
    });

    // Longest song
    const longest = [...played].sort((a, b) => (b.duration || 0) - (a.duration || 0))[0];
    if (longest) {
      const mins = Math.floor(longest.duration / 60);
      const secs = longest.duration % 60;
      this.trivia.push({
        category: 'songTrivia',
        text: `"${longest.title}" by ${longest.artist} is the longest song in the set at ${mins}:${String(secs).padStart(2, '0')}.`,
      });
    }

    // Shortest song
    const shortest = [...played].filter(s => s.duration > 60).sort((a, b) => a.duration - b.duration)[0];
    if (shortest) {
      const mins = Math.floor(shortest.duration / 60);
      const secs = shortest.duration % 60;
      this.trivia.push({
        category: 'songTrivia',
        text: `At just ${mins}:${String(secs).padStart(2, '0')}, "${shortest.title}" by ${shortest.artist} is the shortest song in the set.`,
      });
    }

    // Fastest BPM
    const fastest = [...played].filter(s => s.bpm).sort((a, b) => b.bpm - a.bpm)[0];
    if (fastest) {
      this.trivia.push({
        category: 'songTrivia',
        text: `"${fastest.title}" clocks in at ${fastest.bpm} BPM \u2014 the fastest song in the set.`,
      });
    }

    // Slowest BPM
    const slowest = [...played].filter(s => s.bpm).sort((a, b) => a.bpm - b.bpm)[0];
    if (slowest) {
      this.trivia.push({
        category: 'songTrivia',
        text: `"${slowest.title}" by ${slowest.artist} at ${slowest.bpm} BPM is the slowest groove in the set.`,
      });
    }

    // Most played
    const mostPlayed = [...played].sort((a, b) => (b._count?.setlistSongs || 0) - (a._count?.setlistSongs || 0))[0];
    if (mostPlayed && mostPlayed._count?.setlistSongs > 0) {
      this.trivia.push({
        category: 'bandFact',
        text: `"${mostPlayed.title}" by ${mostPlayed.artist} is the most-played song with ${mostPlayed._count.setlistSongs} performances.`,
      });
    }

    // Most represented artist
    const artistCounts = {};
    played.forEach(s => { artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1; });
    const topArtists = Object.entries(artistCounts).filter(([, c]) => c >= 2).sort(([, a], [, b]) => b - a);
    if (topArtists.length > 0) {
      const [artist, count] = topArtists[0];
      this.trivia.push({
        category: 'songTrivia',
        text: `${artist} leads the setlist with ${count} songs in the repertoire.`,
      });
    }

    // Key distribution
    const keys = {};
    played.filter(s => s.key).forEach(s => { keys[s.key] = (keys[s.key] || 0) + 1; });
    const topKey = Object.entries(keys).sort(([, a], [, b]) => b - a)[0];
    if (topKey) {
      this.trivia.push({
        category: 'songTrivia',
        text: `The key of ${topKey[0]} is the most popular in the setlist \u2014 ${topKey[1]} songs are in that key.`,
      });
    }
  }
}

export const triviaService = new TriviaService();
