const loginAttempts = new Map();

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit login attempts
  const clientIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const entry = loginAttempts.get(clientIp);
  if (entry && now - entry.start < 60000 && entry.count >= 5) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  }
  if (!entry || now - entry.start > 60000) {
    loginAttempts.set(clientIp, { start: now, count: 1 });
  } else {
    entry.count++;
  }

  const bandchatUrl = process.env.VITE_BANDCHAT_URL || process.env.SYNC_BANDCHAT_URL;
  if (!bandchatUrl) {
    return res.status(500).json({ error: 'BandChat URL not configured' });
  }

  const { email, password } = req.body || {};
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const response = await fetch(`${bandchatUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Login proxy error:', err);
    return res.status(502).json({ error: 'Could not reach authentication service' });
  }
}
