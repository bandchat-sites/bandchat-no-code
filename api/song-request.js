import { Resend } from 'resend';
import { isAllowedOrigin, getContactEmail, getSenderEmail } from './_config.js';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Simple in-memory rate limiting (per serverless instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers['origin'];
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const clientIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { title, artist, youtube } = req.body || {};

  if (!title || !artist) {
    return res.status(400).json({ error: 'Song title and artist are required' });
  }

  if (typeof title !== 'string' || title.length > 200) {
    return res.status(400).json({ error: 'Invalid title' });
  }
  if (typeof artist !== 'string' || artist.length > 200) {
    return res.status(400).json({ error: 'Invalid artist' });
  }
  if (youtube) {
    if (typeof youtube !== 'string' || youtube.length > 500) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    try {
      const parsed = new URL(youtube);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ error: 'YouTube URL must use http or https' });
      }
      const allowedHosts = ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'];
      if (!allowedHosts.includes(parsed.hostname)) {
        return res.status(400).json({ error: 'URL must be a YouTube link' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
  }

  const safeTitle = escapeHtml(title);
  const safeArtist = escapeHtml(artist);
  const safeYoutube = youtube ? escapeHtml(youtube.trim()) : '';

  const youtubeSection = safeYoutube
    ? `<p><strong>YouTube:</strong> <a href="${safeYoutube}">${safeYoutube}</a></p>`
    : '';

  try {
    await resend.emails.send({
      from: getSenderEmail(),
      to: getContactEmail(),
      subject: `[song request] ${safeTitle} - ${safeArtist}`,
      text: `Song Request\n\nTitle: ${title}\nArtist: ${artist}${youtube ? `\nYouTube: ${youtube}` : ''}`,
      html: `
        <h2>New Song Request</h2>
        <p><strong>Title:</strong> ${safeTitle}</p>
        <p><strong>Artist:</strong> ${safeArtist}</p>
        ${youtubeSection}
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send song request' });
  }
}
