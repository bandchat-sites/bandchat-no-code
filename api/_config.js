/**
 * Shared configuration for serverless API functions.
 * Reads from environment variables set in Vercel dashboard.
 */

export function getAllowedOrigins() {
  const domain = process.env.SITE_DOMAIN;
  if (!domain) return [];
  return [`https://${domain}`, `https://www.${domain}`];
}

export function isAllowedOrigin(origin) {
  if (!origin) return true; // No origin header = non-browser request
  const allowed = getAllowedOrigins();
  if (allowed.length === 0) return true; // No domain configured = allow all
  return allowed.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1');
}

export function getContactEmail() {
  return process.env.CONTACT_EMAIL || 'info@example.com';
}

export function getBandName() {
  return process.env.BAND_NAME || 'Band';
}

export function getSenderEmail() {
  const name = getBandName();
  return process.env.RESEND_FROM_EMAIL || `${name} <onboarding@resend.dev>`;
}
