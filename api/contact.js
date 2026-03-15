import { Resend } from 'resend';
import { isAllowedOrigin, getContactEmail, getSenderEmail } from './_config.js';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const ALLOWED_TYPES = ['booking', 'corporate', 'press', 'general', 'contact'];

// Simple in-memory rate limiting (per serverless instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute per IP

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

  const { name, email, type, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  if (typeof name !== 'string' || name.length > 200) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (typeof message !== 'string' || message.length > 5000) {
    return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
  }

  const safeType = ALLOWED_TYPES.includes(type) ? type : 'general';
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  try {
    await resend.emails.send({
      from: getSenderEmail(),
      to: getContactEmail(),
      replyTo: email,
      subject: `[${safeType}] from ${safeName}`,
      text: `Name: ${name}\nEmail: ${email}\nType: ${safeType}\n\n${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Type:</strong> ${safeType}</p>
        <hr />
        <p>${safeMessage.replace(/\n/g, '<br />')}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
