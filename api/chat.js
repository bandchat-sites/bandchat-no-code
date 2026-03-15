const ALLOWED_MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS_LIMIT = 1024;

// Simple in-memory rate limiting (per serverless instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

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

const DEFAULT_AGENT_PROMPTS = {
  amp: `You are "Amp" — a veteran creative director and web designer who specializes in band and music industry websites. You have 15+ years of experience designing for rock bands, live music venues, and music festivals. YOUR EXPERTISE: Web design & UX for music/entertainment, visual branding, social media integration, gig/event promotion pages, photo galleries, merch pages, SEO, performance optimization. PERSONALITY: Opinionated but collaborative. Strong design instincts. Always provide concrete, actionable recommendations.`,
  buzz: `You are "Buzz" — a high-energy social media strategist who specializes in music acts and live bands. YOUR EXPERTISE: Platform strategy across Instagram, Facebook, YouTube. Content calendars, gig promotion campaigns, fan engagement tactics, hashtag strategy, analytics and KPIs. PERSONALITY: Extremely high energy. Data-informed but creative-first. Speaks in actionable terms. Pushes for bold moves.`,
  riff: `You are "Riff" — a passionate music content creator and copywriter. YOUR EXPERTISE: Band bios, gig announcements, social media captions, blog posts, press kit copy, setlist commentary, newsletter copy, merch descriptions, SEO copy. WRITING STYLE: HIGH ENERGY. Short punchy sentences mixed with flowing ones. Vivid sensory language. PERSONALITY: Music nerd. Creates FOMO. Always delivers actual draft copy, not descriptions of what to write.`,
};

function getAgentSystems() {
  return {
    amp: process.env.AGENT_AMP_PROMPT || DEFAULT_AGENT_PROMPTS.amp,
    buzz: process.env.AGENT_BUZZ_PROMPT || DEFAULT_AGENT_PROMPTS.buzz,
    riff: process.env.AGENT_RIFF_PROMPT || DEFAULT_AGENT_PROMPTS.riff,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const agentSystems = getAgentSystems();
  const clientIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // Verify admin auth via BandChat
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const bandchatUrl = process.env.VITE_BANDCHAT_URL || process.env.SYNC_BANDCHAT_URL;
  if (!bandchatUrl) {
    return res.status(500).json({ error: 'BandChat URL not configured' });
  }

  try {
    const authRes = await fetch(`${bandchatUrl}/api/auth/me`, {
      headers: { Authorization: authHeader },
    });
    if (!authRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch {
    return res.status(502).json({ error: 'Could not verify auth with BandChat' });
  }

  // Validate request body
  const { agentKey, messages } = req.body;

  if (!agentKey || !agentSystems[agentKey]) {
    return res.status(400).json({ error: 'Invalid agent. Must be one of: ' + Object.keys(agentSystems).join(', ') });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing required field: messages' });
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: 'Too many messages (max 50)' });
  }

  const ALLOWED_ROLES = ['user', 'assistant'];
  const sanitizedMessages = messages.map(m => {
    if (!m || typeof m.content !== 'string' || !ALLOWED_ROLES.includes(m.role)) {
      return null;
    }
    if (m.content.length > 10000) {
      return null;
    }
    return { role: m.role, content: m.content };
  }).filter(Boolean);

  if (sanitizedMessages.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided' });
  }

  // Proxy to Anthropic API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ALLOWED_MODEL,
        max_tokens: MAX_TOKENS_LIMIT,
        system: agentSystems[agentKey],
        messages: sanitizedMessages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return res.status(anthropicRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ error: 'Failed to reach Anthropic API' });
  }
}
