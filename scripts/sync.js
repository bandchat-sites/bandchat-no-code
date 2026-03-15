#!/usr/bin/env node

/**
 * BandChat Data Sync Script
 *
 * Downloads data from BandChat's authenticated API and writes
 * static JSON files to public/data/ for the website to consume.
 *
 * Usage:
 *   node scripts/sync.js
 *
 * Requires .env with:
 *   SYNC_BANDCHAT_URL, SYNC_WORKSPACE_ID
 *   Auth: SYNC_API_TOKEN (preferred) or SYNC_EMAIL + SYNC_PASSWORD (legacy)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'public', 'data');

// Load .env manually if it exists (on Vercel, env vars are already in process.env)
function loadEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return; // Skip — env vars come from Vercel/hosting
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val; // Don't override existing env vars
  }
}

loadEnv();

const API_URL = process.env.SYNC_BANDCHAT_URL;
const API_TOKEN = process.env.SYNC_API_TOKEN;
const EMAIL = process.env.SYNC_EMAIL;
const PASSWORD = process.env.SYNC_PASSWORD;
const WORKSPACE_ID = process.env.SYNC_WORKSPACE_ID;

if (!API_URL || !WORKSPACE_ID) {
  console.log('Sync skipped: SYNC_BANDCHAT_URL and SYNC_WORKSPACE_ID not set.');
  process.exit(0);
}

if (!API_TOKEN && (!EMAIL || !PASSWORD)) {
  console.log('Sync skipped: no auth configured (set SYNC_API_TOKEN or SYNC_EMAIL + SYNC_PASSWORD).');
  process.exit(0);
}

let token = null;

async function login() {
  // API token auth (from BandChat website builder)
  if (API_TOKEN) {
    token = API_TOKEN;
    console.log('Using API token auth.');
    return;
  }
  // Legacy email/password auth
  console.log('Logging in to BandChat...');
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  token = data.accessToken;
  console.log('Logged in successfully.');
}

async function apiFetch(endpoint) {
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`API ${endpoint} failed: ${res.status}`);
  }

  return res.json();
}

function writeData(filename, data) {
  const path = resolve(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2));
  const count = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`  Wrote ${filename} (${Array.isArray(data) ? count + ' items' : count + ' keys'})`);
}

// Data transformers - strip private/sensitive fields for public consumption

function transformGig(gig) {
  return {
    id: gig.id,
    title: gig.title,
    type: gig.type,
    date: gig.date,
    endDate: gig.endDate,
    venue: gig.venue,
    address: gig.address,
    notes: gig.notes,
    status: gig.status,
    // Omit: pay, isLocked, isPersonal, createdById
    setlists: (gig.setlists || []).map(gs => ({
      setNumber: gs.setNumber,
      setlist: gs.setlist ? transformSetlist(gs.setlist) : null,
    })),
    media: (gig.media || []).map(m => ({
      id: m.id,
      type: m.type,
      url: m.url,
      caption: m.caption,
    })),
    attendees: (gig.attendees || []).map(a => ({
      status: a.status,
      bandMember: a.bandMember,
    })),
  };
}

function transformSetlist(setlist) {
  return {
    id: setlist.id,
    name: setlist.name,
    description: setlist.description,
    performedAt: setlist.performedAt,
    venue: setlist.venue,
    songs: (setlist.songs || []).map(ss => ({
      position: ss.position,
      type: ss.type,
      duration: ss.duration,
      label: ss.label,
      song: ss.song ? {
        id: ss.song.id,
        title: ss.song.title,
        artist: ss.song.artist,
        key: ss.song.key,
        duration: ss.song.duration,
      } : null,
    })),
    performers: (setlist.performers || []).map(p => ({
      bandMember: {
        id: p.bandMember?.id,
        name: p.bandMember?.name,
        imageUrl: p.bandMember?.imageUrl,
      },
    })),
  };
}

function transformSong(song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    key: song.key,
    bpm: song.bpm,
    duration: song.duration,
    youtubeUrl: song.youtubeUrl,
    spotifyUrl: song.spotifyUrl,
    // Omit: lyrics, notes, arrangement (private band data)
    _count: song._count,
  };
}

function transformBandMember(member) {
  return {
    id: member.id,
    name: member.name,
    imageUrl: member.imageUrl,
    notes: member.notes,
    isGuest: member.isGuest,
    stints: (member.stints || []).map(s => ({
      instruments: s.instruments,
      startDate: s.startDate,
      endDate: s.endDate,
    })),
  };
}

function transformTimeline(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    eventDate: event.eventDate,
    imageUrl: event.imageUrl,
  };
}

function transformAnnouncement(ann) {
  return {
    id: ann.id,
    title: ann.title,
    content: ann.content,
    priority: ann.priority,
    isPinned: ann.isPinned,
    createdAt: ann.createdAt,
    createdBy: {
      displayName: ann.createdBy?.displayName,
    },
  };
}

function transformPoll(poll) {
  return {
    id: poll.id,
    question: poll.question,
    description: poll.description,
    allowMultiple: poll.allowMultiple,
    isClosed: poll.isClosed,
    expiresAt: poll.expiresAt,
    createdAt: poll.createdAt,
    options: (poll.options || []).map(opt => ({
      id: opt.id,
      text: opt.text,
      position: opt.position,
      _count: { votes: opt.votes?.length || opt._count?.votes || 0 },
    })),
  };
}

async function syncAll() {
  mkdirSync(DATA_DIR, { recursive: true });

  await login();

  const w = WORKSPACE_ID;

  let gigs, members, timeline, songs, setlists, announcements, polls;

  // Fetch data — use single data endpoint for API token auth, individual endpoints for legacy
  console.log('\nFetching data from BandChat...');

  if (API_TOKEN) {
    // API token auth uses the website data endpoint (returns all data in one call)
    // Call directly — apiFetch prepends /api but API_URL already includes it
    const dataRes = await fetch(`${API_URL}/website/api/${w}/data`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!dataRes.ok) {
      throw new Error(`Data endpoint failed: ${dataRes.status}`);
    }
    const data = await dataRes.json();
    gigs = data.gigs || [];
    members = data.bandMembers || [];
    timeline = []; // Not included in data endpoint yet
    songs = data.songs || [];
    setlists = data.setlists || [];
    announcements = []; // Not included in data endpoint yet
    polls = []; // Not included in data endpoint yet
  } else {
    // Legacy email/password auth uses individual endpoints
    [gigs, members, timeline, songs, setlists, announcements, polls] = await Promise.all([
      apiFetch(`/gigs/workspace/${w}`),
      apiFetch(`/band-members/workspace/${w}`),
      apiFetch(`/timeline/workspace/${w}`),
      apiFetch(`/songs/workspace/${w}`),
      apiFetch(`/setlists/workspace/${w}`),
      apiFetch(`/announcements/workspace/${w}`),
      apiFetch(`/polls/workspace/${w}`),
    ]);
  }

  console.log('\nTransforming and writing data...');

  // Split gigs into upcoming and archive
  const now = new Date();
  const publicGigs = gigs
    .filter(g => !g.isPersonal)
    .map(transformGig);

  const upcomingGigs = publicGigs
    .filter(g => new Date(g.date) >= now && g.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const archiveGigs = publicGigs
    .filter(g => new Date(g.date) < now || g.status === 'COMPLETED')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  writeData('gigs-upcoming.json', upcomingGigs);
  writeData('gigs-archive.json', archiveGigs);

  // Band members
  const allMembers = Array.isArray(members) ? members : [...(members.current || []), ...(members.former || []), ...(members.guests || [])];
  writeData('band-members.json', allMembers.map(transformBandMember));

  // Timeline
  writeData('timeline.json', timeline.map(transformTimeline));

  // Songs (public fields only)
  writeData('songs.json', songs.map(transformSong));

  // Setlists
  writeData('setlists.json', setlists.map(transformSetlist));

  // Announcements (active/pinned only)
  const activeAnnouncements = announcements
    .filter(a => a.isPinned && (!a.expiresAt || new Date(a.expiresAt) > now));
  writeData('announcements.json', activeAnnouncements.map(transformAnnouncement));

  // Polls (open, non-anonymous only)
  const publicPolls = polls.filter(p => !p.isAnonymous);
  writeData('polls.json', publicPolls.map(transformPoll));

  // Collect all media from gigs
  const allMedia = publicGigs.flatMap(g =>
    (g.media || []).map(m => ({ ...m, gigId: g.id, gigTitle: g.title, gigDate: g.date }))
  );
  writeData('media.json', allMedia);

  // Compute stats (from past gigs only)
  const venues = [...new Set(archiveGigs.map(g => g.venue).filter(Boolean))];
  const topVenueMap = {};
  archiveGigs.forEach(g => {
    if (g.venue) topVenueMap[g.venue] = (topVenueMap[g.venue] || 0) + 1;
  });
  const topVenues = Object.entries(topVenueMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([venue, count]) => ({ venue, count }));

  writeData('stats.json', {
    totalGigs: archiveGigs.length,
    totalSongs: songs.length,
    totalMembers: allMembers.filter(m => !m.isGuest).length,
    totalVenues: venues.length,
    topVenues,
    lastUpdated: new Date().toISOString(),
  });

  // Empty blog for now (no blog system in BandChat yet)
  writeData('blog.json', []);

  console.log('\nSync complete!');
}

syncAll().catch(err => {
  console.error('\nSync failed:', err.message);
  process.exit(1);
});
