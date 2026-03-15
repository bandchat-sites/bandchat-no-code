export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bandchatUrl = process.env.VITE_BANDCHAT_URL || process.env.SYNC_BANDCHAT_URL;
  if (!bandchatUrl) {
    return res.status(500).json({ error: 'BandChat URL not configured' });
  }

  try {
    const response = await fetch(`${bandchatUrl}/api/auth/me`, {
      headers: { Authorization: req.headers.authorization || '' },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch {
    return res.status(502).json({ error: 'Could not reach BandChat' });
  }
}
