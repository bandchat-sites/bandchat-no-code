#!/usr/bin/env node

/**
 * BandChat Website Template — Interactive Setup
 *
 * Generates site.config.js and .env from user input.
 * Usage: npm run setup
 */

import { writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultVal = '') {
  const suffix = defaultVal ? ` (${defaultVal})` : '';
  return new Promise(resolve => {
    rl.question(`${question}${suffix}: `, answer => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

function askYN(question, defaultVal = true) {
  const suffix = defaultVal ? '(Y/n)' : '(y/N)';
  return new Promise(resolve => {
    rl.question(`${question} ${suffix}: `, answer => {
      const a = answer.trim().toLowerCase();
      if (!a) return resolve(defaultVal);
      resolve(a === 'y' || a === 'yes');
    });
  });
}

function isValidHex(hex) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

async function main() {
  console.log('\n  BandChat Website Template Setup\n  ================================\n');

  // Band identity
  const name = await ask('Band name');
  if (!name) { console.error('Band name is required.'); process.exit(1); }

  const tagline = await ask('Tagline (e.g. "Tokyo\'s Premier Rock Band")', `${name} — Live Music`);
  const description = await ask('Short description (1-2 sentences)', `${name} brings the music to life.`);
  const location = await ask('Location (e.g. "Tokyo, Japan")', '');
  const genre = await ask('Genre (e.g. "Classic Rock Covers")', 'Covers');
  const founded = await ask('Year founded', new Date().getFullYear().toString());

  // Domain & contact
  console.log('');
  const domain = await ask('Domain name (e.g. "myband.com")', '');
  const infoEmail = await ask('Contact email', domain ? `info@${domain}` : '');
  const privacyEmail = await ask('Privacy email', domain ? `privacy@${domain}` : infoEmail);

  // Social media
  console.log('\nSocial media (leave blank to skip):');
  const instagram = await ask('  Instagram URL');
  const facebook = await ask('  Facebook URL');
  const youtube = await ask('  YouTube URL');

  const social = [];
  if (instagram) social.push({ platform: 'instagram', url: instagram, label: 'Instagram' });
  if (facebook) social.push({ platform: 'facebook', url: facebook, label: 'Facebook' });
  if (youtube) social.push({ platform: 'youtube', url: youtube, label: 'YouTube' });

  // Theme
  console.log('');
  let primaryAccent = await ask('Primary accent color (hex)', '#ff3250');
  if (!isValidHex(primaryAccent)) {
    console.log('  Invalid hex, using default #ff3250');
    primaryAccent = '#ff3250';
  }
  let secondaryAccent = await ask('Secondary accent color (hex)', '#ffc800');
  if (!isValidHex(secondaryAccent)) {
    console.log('  Invalid hex, using default #ffc800');
    secondaryAccent = '#ffc800';
  }

  // Features
  console.log('\nFeatures (enable/disable pages):');
  const songs = await askYN('  Songs page?');
  const archive = await askYN('  Gig Archive?');
  const timeline = await askYN('  Timeline/Story?');
  const media = await askYN('  Media/Photos?');
  const stats = await askYN('  Stats?');
  const blog = await askYN('  Blog?', false);
  const merch = await askYN('  Merch?', false);
  const community = await askYN('  Community (announcements/polls)?', false);
  const trivia = await askYN('  Trivia popups?');
  const songRequests = await askYN('  Song request form?');
  const aiAgents = await askYN('  AI Agents panel?', false);

  // BandChat
  console.log('\nBandChat configuration:');
  const bandchatUrl = await ask('BandChat API URL', 'https://bandchat-production.up.railway.app');
  const workspaceId = await ask('BandChat Workspace ID');
  const syncEmail = await ask('BandChat login email');
  const syncPassword = await ask('BandChat login password');

  rl.close();

  // Generate site.config.js
  const configContent = `export default ${JSON.stringify({
    band: {
      name,
      tagline,
      description,
      location,
      genre,
      founded: parseInt(founded),
      story: [description],
    },
    domain,
    emails: { info: infoEmail, privacy: privacyEmail },
    social,
    theme: { primaryAccent, secondaryAccent },
    images: {
      logo: '/images/logos/logo.png',
      ogImage: domain ? `https://${domain}/images/logos/logo.png` : '/images/logos/logo.png',
      favicon: '/images/icons/favicon.svg',
      heroImages: ['/images/site/hero-1.webp'],
    },
    features: {
      songs, archive, setlists: archive, timeline, media, stats,
      blog, community, merch, trivia, songRequests, aiAgents,
    },
    seo: {
      title: `${name} | ${genre} in ${location || 'Live Music'}`,
      description,
    },
    agents: null,
  }, null, 2)};\n`;

  const configPath = resolve(ROOT, 'site.config.js');
  if (existsSync(configPath)) {
    console.log('\n  site.config.js already exists — writing to site.config.generated.js');
    writeFileSync(resolve(ROOT, 'site.config.generated.js'), configContent);
  } else {
    writeFileSync(configPath, configContent);
    console.log('\n  Wrote site.config.js');
  }

  // Generate .env
  const envContent = `# Generated by setup script
SITE_DOMAIN=${domain}
CONTACT_EMAIL=${infoEmail}
BAND_NAME=${name}

VITE_BANDCHAT_URL=${bandchatUrl}
VITE_WORKSPACE_ID=${workspaceId}

SYNC_BANDCHAT_URL=${bandchatUrl}
SYNC_EMAIL=${syncEmail}
SYNC_PASSWORD=${syncPassword}
SYNC_WORKSPACE_ID=${workspaceId}

# Add these manually:
# ANTHROPIC_API_KEY=your-key-here
# RESEND_API_KEY=your-key-here
# RESEND_FROM_EMAIL=${name} <noreply@${domain || 'example.com'}>
`;

  const envPath = resolve(ROOT, '.env');
  if (existsSync(envPath)) {
    console.log('  .env already exists — writing to .env.generated');
    writeFileSync(resolve(ROOT, '.env.generated'), envContent);
  } else {
    writeFileSync(envPath, envContent);
    console.log('  Wrote .env');
  }

  console.log(`
  Setup complete! Next steps:
  1. Add your logo to public/images/logos/logo.png
  2. Add hero images to public/images/site/
  3. Update site.config.js with your band story
  4. Run: node scripts/sync.js
  5. Run: npm run build
  6. Deploy to Vercel
`);
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
