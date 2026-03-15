// Static data fetcher - reads from /data/*.json (synced from BandChat)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = {};
async function fetchData(file) {
  const entry = cache[file];
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  const res = await fetch(`/data/${file}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${file}`);
  }
  const data = await res.json();
  cache[file] = { data, time: Date.now() };
  return data;
}

export const publicApi = {
  // Gigs
  getUpcomingGigs: () => fetchData('gigs-upcoming.json'),
  getGigArchive: () => fetchData('gigs-archive.json'),
  getGig: async (id) => {
    // Check upcoming first, then archive
    const [upcoming, archive] = await Promise.all([
      fetchData('gigs-upcoming.json'),
      fetchData('gigs-archive.json'),
    ]);
    const gig = [...upcoming, ...archive].find(g => g.id === id);
    if (!gig) throw new Error('Gig not found');
    return gig;
  },

  // Band
  getBandMembers: () => fetchData('band-members.json'),
  getTimeline: () => fetchData('timeline.json'),

  // Music
  getSetlists: () => fetchData('setlists.json'),
  getSongs: () => fetchData('songs.json'),

  // Content
  getAnnouncements: () => fetchData('announcements.json'),
  getPolls: () => fetchData('polls.json'),
  getMedia: () => fetchData('media.json'),
  getStats: () => fetchData('stats.json'),

  // Blog (static JSON for now)
  getBlogPosts: () => fetchData('blog.json'),
  getBlogPost: async (slug) => {
    const posts = await fetchData('blog.json');
    const post = posts.find(p => p.slug === slug);
    if (!post) throw new Error('Post not found');
    return post;
  },
};

// Admin API - authenticates against BandChat directly
const BANDCHAT_URL = import.meta.env.VITE_BANDCHAT_URL || '';

export const adminApi = {
  async request(endpoint, { method = 'GET', body } = {}) {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BANDCHAT_URL}/api${endpoint}`, options);

    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      throw new Error('Session expired');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `API error: ${res.status}`);
    }

    return res.json();
  },

  get: (endpoint) => adminApi.request(endpoint),
  post: (endpoint, body) => adminApi.request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => adminApi.request(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => adminApi.request(endpoint, { method: 'DELETE' }),
};
